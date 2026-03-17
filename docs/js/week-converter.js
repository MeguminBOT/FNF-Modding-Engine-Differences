document.addEventListener("DOMContentLoaded", function () {
  var btnConvert = document.getElementById("week-btn-convert");
  var btnCopy = document.getElementById("week-btn-copy");
  var btnClear = document.getElementById("week-btn-clear");
  var btnDownload = document.getElementById("week-btn-download");
  var fileUpload = document.getElementById("week-file-upload");
  var fileNameEl = document.getElementById("week-file-name");
  if (!btnConvert) return;

  var inputEl = document.getElementById("week-input-data");
  var outputEl = document.getElementById("week-output-data");
  var statusEl = document.getElementById("week-converter-status");
  var sourceSelect = document.getElementById("week-source-engine");
  var targetSelect = document.getElementById("week-target-engine");
  var uploadedFileName = "";

  // --- Convert ---
  btnConvert.addEventListener("click", function () {
    statusEl.style.color = "";
    statusEl.textContent = "";
    outputEl.value = "";

    var raw = inputEl.value.trim();
    if (!raw) {
      setError("Please paste week data in the input box.");
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
      statusEl.textContent = "Converted " + engineLabel(sourceEngine) + " → " + engineLabel(targetEngine) + " successfully.";
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

  // --- Drag & drop ---
  var uploadLabel = fileUpload.parentElement;
  uploadLabel.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadLabel.style.borderColor = "#7e57c2";
  });
  uploadLabel.addEventListener("dragleave", function () {
    uploadLabel.style.borderColor = "";
  });
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
    if (!outputEl.value) {
      setError("Nothing to download. Convert something first.");
      return;
    }
    var targetEngine = targetSelect.value;
    var ext = (targetEngine === "codename") ? ".xml" : ".json";
    var mime = (targetEngine === "codename") ? "application/xml" : "application/json";
    var baseName = uploadedFileName ? uploadedFileName.replace(/\.[^.]+$/, "") : "week";
    var downloadName = baseName + ext;

    var blob = new Blob([outputEl.value], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    statusEl.style.color = "#4caf50";
    statusEl.textContent = "Downloaded " + downloadName;
  });

  // --- Helpers ---
  function setError(msg) {
    statusEl.style.color = "#f44336";
    statusEl.textContent = msg;
  }

  function engineLabel(key) {
    var labels = { funkin: "Official Funkin", psych: "Psych Engine", codename: "Codename Engine" };
    return labels[key] || key;
  }

  function escapeXmlAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeXmlText(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- Auto-detection ---
  function detectEngine(raw) {
    var trimmed = raw.trim();
    if (trimmed.charAt(0) === "<") return "codename";
    try {
      var obj = JSON.parse(trimmed);
      // Funkin: has "titleAsset" or "props"
      if (obj.titleAsset !== undefined || obj.props !== undefined) return "funkin";
      // Psych: has "weekCharacters" or "storyName" or songs as arrays-of-arrays
      if (obj.weekCharacters !== undefined || obj.storyName !== undefined || obj.weekBackground !== undefined) return "psych";
      if (obj.songs && obj.songs.length > 0 && Array.isArray(obj.songs[0])) return "psych";
      // Funkin fallback: songs as string array
      if (obj.songs && obj.songs.length > 0 && typeof obj.songs[0] === "string") return "funkin";
      return null;
    } catch (e) {
      return null;
    }
  }

  // --- Intermediate representation ---
  // {
  //   name: string,
  //   songs: [ { name: string, icon: string|null, color: [r,g,b]|null } ],
  //   characters: [string, string, string],  // [left, player, gf]
  //   background: string,
  //   titleAsset: string|null,
  //   visible: bool,
  //   hideStoryMode: bool,
  //   hideFreeplay: bool,
  //   startUnlocked: bool,
  //   weekBefore: string|null,
  //   difficulties: string[],
  //   weekName: string|null,
  //   props: array|null  // Funkin-specific props preserved
  // }

  function parseToIntermediate(raw, engine) {
    if (engine === "funkin") return parseFunkin(raw);
    if (engine === "psych") return parsePsych(raw);
    if (engine === "codename") return parseCodename(raw);
    throw new Error("Unknown source engine: " + engine);
  }

  function parseFunkin(raw) {
    var d = JSON.parse(raw);
    var songs = (d.songs || []).map(function (s) {
      return { name: s, icon: null, color: null };
    });

    // Try to extract character names from props
    var chars = ["", "bf", "gf"];
    if (d.props && d.props.length > 0) {
      // First prop is typically the opponent, extract from assetPath
      var firstPropPath = d.props[0].assetPath || "";
      var propName = firstPropPath.split("/").pop() || "";
      if (propName) chars[0] = propName;
    }

    return {
      name: d.name || "",
      songs: songs,
      characters: chars,
      background: d.background || "",
      titleAsset: d.titleAsset || null,
      visible: d.visible !== false,
      hideStoryMode: false,
      hideFreeplay: false,
      startUnlocked: true,
      weekBefore: null,
      difficulties: [],
      weekName: null,
      props: d.props || null
    };
  }

  function parsePsych(raw) {
    var d = JSON.parse(raw);
    var songs = (d.songs || []).map(function (s) {
      if (Array.isArray(s)) {
        return {
          name: s[0] || "",
          icon: s[1] || null,
          color: Array.isArray(s[2]) ? s[2] : null
        };
      }
      return { name: String(s), icon: null, color: null };
    });

    var chars = d.weekCharacters || ["", "bf", "gf"];

    var diffs = [];
    if (d.difficulties && typeof d.difficulties === "string" && d.difficulties.trim() !== "") {
      diffs = d.difficulties.split(",").map(function (s) { return s.trim(); });
    }

    return {
      name: d.storyName || "",
      songs: songs,
      characters: chars,
      background: d.weekBackground || "",
      titleAsset: null,
      visible: true,
      hideStoryMode: !!d.hideStoryMode,
      hideFreeplay: !!d.hideFreeplay,
      startUnlocked: d.startUnlocked !== false,
      weekBefore: d.weekBefore || null,
      difficulties: diffs,
      weekName: d.weekName || null,
      props: null
    };
  }

  function parseCodename(raw) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(raw, "text/xml");
    var errorNode = doc.querySelector("parsererror");
    if (errorNode) throw new Error("Invalid XML: " + errorNode.textContent.substring(0, 100));

    var root = doc.querySelector("week");
    if (!root) throw new Error("No <week> root element found.");

    var songEls = root.querySelectorAll("song");
    var songs = [];
    for (var i = 0; i < songEls.length; i++) {
      songs.push({ name: songEls[i].textContent.trim(), icon: null, color: null });
    }

    var charsStr = root.getAttribute("chars") || "";
    var chars = charsStr ? charsStr.split(",").map(function (s) { return s.trim(); }) : ["", "bf", "gf"];
    // Pad to 3
    while (chars.length < 3) chars.push("");

    var diffEls = root.querySelectorAll("difficulty");
    var diffs = [];
    for (var j = 0; j < diffEls.length; j++) {
      var dName = diffEls[j].getAttribute("name") || diffEls[j].textContent.trim();
      if (dName) diffs.push(dName);
    }

    return {
      name: root.getAttribute("name") || "",
      songs: songs,
      characters: chars,
      background: "",
      titleAsset: null,
      visible: true,
      hideStoryMode: false,
      hideFreeplay: false,
      startUnlocked: true,
      weekBefore: null,
      difficulties: diffs,
      weekName: null,
      props: null
    };
  }

  // --- Output generators ---

  function intermediateToTarget(data, engine) {
    if (engine === "funkin") return toFunkin(data);
    if (engine === "psych") return toPsych(data);
    if (engine === "codename") return toCodename(data);
    throw new Error("Unknown target engine: " + engine);
  }

  function toFunkin(d) {
    var songNames = d.songs.map(function (s) { return s.name; });

    var result = {
      version: "1.0.0",
      name: d.name || "UNNAMED",
      visible: d.visible
    };

    if (d.titleAsset) {
      result.titleAsset = d.titleAsset;
    }

    if (d.background) {
      result.background = d.background;
    }

    result.songs = songNames;

    // Preserve original props if available, otherwise create a placeholder
    if (d.props) {
      result.props = d.props;
    } else {
      result.props = [];
      // Create a basic prop from the first character if we have one
      if (d.characters[0]) {
        result.props.push({
          assetPath: "storymenu/props/" + d.characters[0],
          scale: 1.0,
          offsets: [100, 60],
          animations: [
            { name: "idle", prefix: "idle0", frameRate: 24 }
          ]
        });
      }
    }

    return JSON.stringify(result, null, 4);
  }

  function toPsych(d) {
    var songs = d.songs.map(function (s) {
      var icon = s.icon || "face";
      var color = s.color || [146, 113, 253];
      return [s.name, icon, color];
    });

    var result = {
      songs: songs,
      weekCharacters: [d.characters[0] || "", d.characters[1] || "bf", d.characters[2] || "gf"],
      weekBackground: d.background || "stage",
      weekBefore: d.weekBefore || "",
      storyName: d.name || "",
      weekName: d.weekName || d.name || "",
      startUnlocked: d.startUnlocked,
      hiddenUntilUnlocked: false,
      hideStoryMode: d.hideStoryMode,
      hideFreeplay: d.hideFreeplay
    };

    if (d.difficulties.length > 0) {
      result.difficulties = d.difficulties.join(", ");
    } else {
      result.difficulties = "";
    }

    return JSON.stringify(result, null, 4);
  }

  function toCodename(d) {
    var chars = d.characters.join(",");
    var lines = [];

    lines.push('<week name="' + escapeXmlAttr(d.name) + '"'
      + ' chars="' + escapeXmlAttr(chars) + '"'
      + ' sprite="week1">');

    for (var i = 0; i < d.songs.length; i++) {
      lines.push('    <song>' + escapeXmlText(d.songs[i].name) + '</song>');
    }

    var diffs = d.difficulties.length > 0 ? d.difficulties : ["Easy", "Normal", "Hard"];
    for (var j = 0; j < diffs.length; j++) {
      lines.push('    <difficulty name="' + escapeXmlAttr(diffs[j]) + '"/>');
    }

    lines.push('</week>');
    return lines.join('\n');
  }

  // --- Report Issue ---
  var btnReport = document.getElementById("week-btn-report-issue");
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
      params.set("template", "week-converter-issue.yml");
      params.set("title", "Week Converter: " + direction);
      if (inputVal) params.set("input", inputVal);
      if (outputVal) params.set("output", outputVal);
      params.set("additional", "Conversion direction: " + direction);

      window.open("https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?" + params.toString(), "_blank");
    });
  }
});
