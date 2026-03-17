document.addEventListener("DOMContentLoaded", function () {
  var btnConvert = document.getElementById("stage-btn-convert");
  var btnCopy = document.getElementById("stage-btn-copy");
  var btnClear = document.getElementById("stage-btn-clear");
  var btnDownload = document.getElementById("stage-btn-download");
  var fileUpload = document.getElementById("stage-file-upload");
  var fileNameEl = document.getElementById("stage-file-name");
  if (!btnConvert) return;

  var inputEl = document.getElementById("stage-input-data");
  var outputEl = document.getElementById("stage-output-data");
  var statusEl = document.getElementById("stage-converter-status");
  var sourceSelect = document.getElementById("stage-source-engine");
  var targetSelect = document.getElementById("stage-target-engine");
  var uploadedFileName = "";

  // --- Convert ---
  btnConvert.addEventListener("click", function () {
    statusEl.style.color = "";
    statusEl.textContent = "";
    outputEl.value = "";

    var raw = inputEl.value.trim();
    if (!raw) {
      setError("Please paste stage data in the input box.");
      return;
    }

    var sourceEngine = sourceSelect.value;
    if (sourceEngine === "auto") {
      sourceEngine = detectEngine(raw);
      if (!sourceEngine) {
        setError("Could not auto-detect the source engine. Please select it manually.");
        return;
      }
    }

    var targetEngine = targetSelect.value;
    if (sourceEngine === targetEngine) {
      setError("Source and target engine are the same.");
      return;
    }

    try {
      var intermediate = parseToIntermediate(raw, sourceEngine);
      var result = intermediateToTarget(intermediate, targetEngine);
      outputEl.value = result;
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Converted " + engineLabel(sourceEngine) + " \u2192 " + engineLabel(targetEngine) + " successfully.";
    } catch (e) {
      setError("Conversion error: " + e.message);
    }
  });

  // --- Copy ---
  btnCopy.addEventListener("click", function () {
    if (!outputEl.value) return;
    navigator.clipboard.writeText(outputEl.value).then(function () {
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Copied to clipboard!";
    });
  });

  // --- Clear ---
  btnClear.addEventListener("click", function () {
    inputEl.value = "";
    outputEl.value = "";
    statusEl.textContent = "";
    fileNameEl.textContent = "";
    uploadedFileName = "";
    fileUpload.value = "";
  });

  // --- File upload ---
  fileUpload.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    uploadedFileName = file.name;
    fileNameEl.textContent = "Loaded: " + file.name;
    var reader = new FileReader();
    reader.onload = function (ev) {
      inputEl.value = ev.target.result;
      if (sourceSelect.value === "auto") {
        var ext = file.name.split(".").pop().toLowerCase();
        if (ext === "xml") sourceSelect.value = "codename";
      }
    };
    reader.readAsText(file);
  });

  var uploadLabel = fileUpload.parentElement;
  uploadLabel.addEventListener("dragover", function (e) { e.preventDefault(); uploadLabel.style.borderColor = "#7e57c2"; });
  uploadLabel.addEventListener("dragleave", function () { uploadLabel.style.borderColor = ""; });
  uploadLabel.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadLabel.style.borderColor = "";
    var file = e.dataTransfer.files[0];
    if (!file) return;
    uploadedFileName = file.name;
    fileNameEl.textContent = "Loaded: " + file.name;
    var reader = new FileReader();
    reader.onload = function (ev) {
      inputEl.value = ev.target.result;
      if (sourceSelect.value === "auto") {
        var ext = file.name.split(".").pop().toLowerCase();
        if (ext === "xml") sourceSelect.value = "codename";
      }
    };
    reader.readAsText(file);
  });

  // --- Download ---
  btnDownload.addEventListener("click", function () {
    if (!outputEl.value) { setError("Nothing to download. Convert something first."); return; }
    var targetEngine = targetSelect.value;
    var ext = (targetEngine === "codename") ? ".xml" : ".json";
    var mime = (targetEngine === "codename") ? "application/xml" : "application/json";
    var baseName = uploadedFileName ? uploadedFileName.replace(/\.[^.]+$/, "") : "stage";
    var downloadName = baseName + ext;
    downloadBlob(outputEl.value, downloadName, mime);
    statusEl.style.color = "#4caf50";
    statusEl.textContent = "Downloaded " + downloadName;
  });

  // --- Helpers ---
  function setError(msg) {
    statusEl.style.color = "#f44336";
    statusEl.textContent = msg;
  }

  function engineLabel(key) {
    return { funkin: "Official Funkin", psych: "Psych Engine", codename: "Codename Engine" }[key] || key;
  }

  function downloadBlob(text, name, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Auto-detection ---
  function detectEngine(raw) {
    var trimmed = raw.trim();
    if (trimmed.charAt(0) === "<") return "codename";
    try {
      var obj = JSON.parse(trimmed);
      // Funkin: has "characters" object with bf/dad/gf keys, or "props" array, or "cameraZoom"
      if (obj.characters !== undefined || obj.props !== undefined || obj.cameraZoom !== undefined) return "funkin";
      // Psych: has "boyfriend" array, "opponent" array, or "defaultZoom"
      if (obj.boyfriend !== undefined || obj.opponent !== undefined || obj.defaultZoom !== undefined) return "psych";
      return null;
    } catch (e) {
      return null;
    }
  }

  // =============================================
  // INTERMEDIATE REPRESENTATION
  // =============================================
  // {
  //   name: string,
  //   cameraZoom: number,
  //   cameraSpeed: number | null,
  //   hideGirlfriend: bool,
  //   bf: { position: [x,y], cameraOffsets: [x,y] },
  //   dad: { position: [x,y], cameraOffsets: [x,y] },
  //   gf: { position: [x,y], cameraOffsets: [x,y] },
  //   directory: string
  // }

  function parseToIntermediate(raw, engine) {
    if (engine === "funkin") return parseFunkin(raw);
    if (engine === "psych") return parsePsych(raw);
    if (engine === "codename") return parseCodename(raw);
    throw new Error("Unknown source engine: " + engine);
  }

  // --- Parse Funkin ---
  function parseFunkin(raw) {
    var d = JSON.parse(raw);
    var chars = d.characters || {};
    var bf = chars.bf || {};
    var dad = chars.dad || {};
    var gf = chars.gf || {};

    return {
      name: d.name || "",
      cameraZoom: d.cameraZoom != null ? d.cameraZoom : 1.0,
      cameraSpeed: null,
      hideGirlfriend: !gf.position,
      bf: {
        position: bf.position || [770, 100],
        cameraOffsets: bf.cameraOffsets || [0, 0]
      },
      dad: {
        position: dad.position || [100, 100],
        cameraOffsets: dad.cameraOffsets || [0, 0]
      },
      gf: {
        position: gf.position || [400, 130],
        cameraOffsets: gf.cameraOffsets || [0, 0]
      },
      directory: ""
    };
  }

  // --- Parse Psych ---
  function parsePsych(raw) {
    var d = JSON.parse(raw);
    return {
      name: "",
      cameraZoom: d.defaultZoom != null ? d.defaultZoom : 0.9,
      cameraSpeed: d.camera_speed != null ? d.camera_speed : null,
      hideGirlfriend: !!d.hide_girlfriend,
      bf: {
        position: d.boyfriend || [770, 100],
        cameraOffsets: d.camera_boyfriend || [0, 0]
      },
      dad: {
        position: d.opponent || [100, 100],
        cameraOffsets: d.camera_opponent || [0, 0]
      },
      gf: {
        position: d.girlfriend || [400, 130],
        cameraOffsets: d.camera_girlfriend || [0, 0]
      },
      directory: d.directory || ""
    };
  }

  // --- Parse Codename ---
  function parseCodename(raw) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(raw, "text/xml");
    var errorNode = doc.querySelector("parsererror");
    if (errorNode) throw new Error("Invalid XML: " + errorNode.textContent.substring(0, 100));

    var root = doc.querySelector("stage");
    if (!root) throw new Error("No <stage> root element found.");

    var bfNode = root.querySelector("boyfriend");
    var dadNode = root.querySelector("dad");
    var gfNode = root.querySelector("girlfriend");

    function getCharData(node, defaults) {
      if (!node) return defaults;
      return {
        position: [
          parseFloat(node.getAttribute("x")) || defaults.position[0],
          parseFloat(node.getAttribute("y")) || defaults.position[1]
        ],
        cameraOffsets: [
          parseFloat(node.getAttribute("camxoffset") || node.getAttribute("camx")) || defaults.cameraOffsets[0],
          parseFloat(node.getAttribute("camyoffset") || node.getAttribute("camy")) || defaults.cameraOffsets[1]
        ]
      };
    }

    return {
      name: root.getAttribute("name") || "",
      cameraZoom: parseFloat(root.getAttribute("zoom")) || 0.9,
      cameraSpeed: null,
      hideGirlfriend: !gfNode,
      bf: getCharData(bfNode, { position: [770, 100], cameraOffsets: [0, 0] }),
      dad: getCharData(dadNode, { position: [100, 100], cameraOffsets: [0, 0] }),
      gf: getCharData(gfNode, { position: [400, 130], cameraOffsets: [0, 0] }),
      directory: root.getAttribute("folder") || ""
    };
  }

  // =============================================
  // OUTPUT GENERATORS
  // =============================================

  function intermediateToTarget(data, engine) {
    if (engine === "funkin") return toFunkin(data);
    if (engine === "psych") return toPsych(data);
    if (engine === "codename") return toCodename(data);
    throw new Error("Unknown target engine: " + engine);
  }

  // --- To Funkin ---
  function toFunkin(d) {
    var result = {
      version: "1.0.1",
      name: d.name || "Converted Stage",
      cameraZoom: d.cameraZoom,
      props: [],
      characters: {
        bf: { zIndex: 300, position: d.bf.position, cameraOffsets: d.bf.cameraOffsets },
        dad: { zIndex: 200, position: d.dad.position, cameraOffsets: d.dad.cameraOffsets },
        gf: { zIndex: 100, position: d.gf.position, cameraOffsets: d.gf.cameraOffsets }
      }
    };
    return JSON.stringify(result, null, 4);
  }

  // --- To Psych ---
  function toPsych(d) {
    var result = {
      directory: d.directory,
      defaultZoom: d.cameraZoom,
      isPixelStage: false,
      boyfriend: d.bf.position,
      girlfriend: d.gf.position,
      opponent: d.dad.position,
      hide_girlfriend: d.hideGirlfriend,
      camera_boyfriend: d.bf.cameraOffsets,
      camera_opponent: d.dad.cameraOffsets,
      camera_girlfriend: d.gf.cameraOffsets,
      camera_speed: d.cameraSpeed != null ? d.cameraSpeed : 1
    };
    return JSON.stringify(result, null, 4);
  }

  // --- To Codename ---
  function toCodename(d) {
    var lines = [];
    lines.push('<stage zoom="' + d.cameraZoom + '" name="' + escapeXmlAttr(d.name || "stage") + '"'
      + (d.directory ? ' folder="' + escapeXmlAttr(d.directory) + '"' : '') + '>');

    if (!d.hideGirlfriend) {
      lines.push('    <girlfriend x="' + d.gf.position[0] + '" y="' + d.gf.position[1] + '"'
        + ' camxoffset="' + d.gf.cameraOffsets[0] + '" camyoffset="' + d.gf.cameraOffsets[1] + '"/>');
    }

    lines.push('    <dad x="' + d.dad.position[0] + '" y="' + d.dad.position[1] + '"'
      + ' camxoffset="' + d.dad.cameraOffsets[0] + '" camyoffset="' + d.dad.cameraOffsets[1] + '"/>');

    lines.push('    <boyfriend x="' + d.bf.position[0] + '" y="' + d.bf.position[1] + '"'
      + ' camxoffset="' + d.bf.cameraOffsets[0] + '" camyoffset="' + d.bf.cameraOffsets[1] + '"/>');

    lines.push('</stage>');
    return lines.join('\n');
  }

  function escapeXmlAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- Report Issue ---
  var btnReport = document.getElementById("stage-btn-report-issue");
  if (btnReport) {
    btnReport.addEventListener("click", function (e) {
      e.preventDefault();
      var engineNames = { funkin: "Funkin", psych: "Psych", codename: "Codename", auto: "Auto-detect" };
      var src = sourceSelect.value;
      var tgt = targetSelect.value;
      var direction = (engineNames[src] || src) + " -> " + (engineNames[tgt] || tgt);

      var inputVal = inputEl.value.trim();
      var outputVal = outputEl.value.trim();
      var maxLen = 1500;
      if (inputVal.length > maxLen) inputVal = inputVal.substring(0, maxLen) + "\n\n... (truncated, please paste full data)";
      if (outputVal.length > maxLen) outputVal = outputVal.substring(0, maxLen) + "\n\n... (truncated, please paste full data)";

      var params = new URLSearchParams();
      params.set("template", "stage-converter-issue.yml");
      params.set("title", "Stage Converter: " + direction);
      if (inputVal) params.set("input", inputVal);
      if (outputVal) params.set("output", outputVal);
      params.set("additional", "Conversion direction: " + direction);

      window.open("https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?" + params.toString(), "_blank");
    });
  }
});
