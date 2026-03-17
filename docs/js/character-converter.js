document.addEventListener("DOMContentLoaded", function () {
  var btnConvert = document.getElementById("btn-convert");
  var btnCopy = document.getElementById("btn-copy");
  var btnClear = document.getElementById("btn-clear");
  var btnDownload = document.getElementById("btn-download");
  var fileUpload = document.getElementById("file-upload");
  var fileNameEl = document.getElementById("file-name");
  if (!btnConvert) return; // not on the converter page

  var inputEl = document.getElementById("input-data");
  var outputEl = document.getElementById("output-data");
  var statusEl = document.getElementById("converter-status");
  var sourceSelect = document.getElementById("source-engine");
  var targetSelect = document.getElementById("target-engine");
  var uploadedFileName = "";

  btnConvert.addEventListener("click", function () {
    statusEl.style.color = "";
    statusEl.textContent = "";
    outputEl.value = "";

    var raw = inputEl.value.trim();
    if (!raw) {
      setError("Please paste character data in the input box.");
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

  btnCopy.addEventListener("click", function () {
    if (!outputEl.value) return;
    navigator.clipboard.writeText(outputEl.value).then(function () {
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Copied to clipboard!";
    });
  });

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
      // auto-detect source from extension
      if (sourceSelect.value === "auto") {
        var ext = file.name.split(".").pop().toLowerCase();
        if (ext === "xml") sourceSelect.value = "codename";
      }
    };
    reader.readAsText(file);
  });

  // --- Drag & drop on the upload label ---
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

  // --- Download output ---
  btnDownload.addEventListener("click", function () {
    if (!outputEl.value) {
      setError("Nothing to download. Convert something first.");
      return;
    }
    var targetEngine = targetSelect.value;
    var ext = (targetEngine === "codename") ? ".xml" : ".json";
    var mime = (targetEngine === "codename") ? "application/xml" : "application/json";

    // build filename from uploaded name or fallback
    var baseName = "character";
    if (uploadedFileName) {
      baseName = uploadedFileName.replace(/\.[^.]+$/, "");
    }
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

  function setError(msg) {
    statusEl.style.color = "#f44336";
    statusEl.textContent = msg;
  }

  function engineLabel(key) {
    var labels = { funkin: "Official Funkin", psych: "Psych Engine", codename: "Codename Engine" };
    return labels[key] || key;
  }

  // --- Auto-detection ---
  function detectEngine(raw) {
    var trimmed = raw.trim();
    if (trimmed.charAt(0) === "<") return "codename";
    try {
      var obj = JSON.parse(trimmed);
      if (obj.renderType !== undefined || obj.assetPath !== undefined) return "funkin";
      if (obj.image !== undefined || obj.sing_duration !== undefined || obj.healthicon !== undefined) return "psych";
      // fallback heuristic: check animation key names
      if (obj.animations && obj.animations.length > 0) {
        var first = obj.animations[0];
        if (first.prefix !== undefined) return "funkin";
        if (first.anim !== undefined && first.name !== undefined) return "psych";
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // --- Intermediate representation ---
  // {
  //   name: string,
  //   spritePath: string,
  //   scale: number,
  //   singTime: number,
  //   flipX: bool,
  //   antialiasing: bool,
  //   startingAnim: string,
  //   healthIcon: string,
  //   healthIconMeta: { scale, flipX, isPixel, offsets } | null,
  //   healthBarColor: [r,g,b] | null,
  //   position: [x,y],
  //   cameraOffsets: [x,y],
  //   isPlayer: bool | null,
  //   gameOverChar: string | null,
  //   danceEvery: number | null,
  //   renderType: string | null,
  //   deathMeta: object | null,
  //   animations: [
  //     { name, prefix, fps, loop, offsets:[x,y], indices:[], flipX, flipY }
  //   ]
  // }

  function parseToIntermediate(raw, engine) {
    if (engine === "funkin") return parseFunkin(raw);
    if (engine === "psych") return parsePsych(raw);
    if (engine === "codename") return parseCodename(raw);
    throw new Error("Unknown source engine: " + engine);
  }

  function parseFunkin(raw) {
    var d = JSON.parse(raw);
    return {
      name: d.name || "",
      spritePath: d.assetPath || "",
      scale: d.scale != null ? d.scale : 1,
      singTime: d.singTime != null ? d.singTime : 4,
      flipX: !!d.flipX,
      antialiasing: !d.isPixel,
      startingAnim: d.startingAnimation || "idle",
      healthIcon: d.healthIcon ? (d.healthIcon.id || "face") : "face",
      healthIconMeta: d.healthIcon || null,
      healthBarColor: null,
      position: d.offsets || [0, 0],
      cameraOffsets: d.cameraOffsets || [0, 0],
      isPlayer: null,
      gameOverChar: d.death ? null : null,
      deathMeta: d.death || null,
      danceEvery: d.danceEvery || null,
      renderType: d.renderType || null,
      animations: (d.animations || []).map(function (a) {
        return {
          name: a.name || "",
          prefix: a.prefix || "",
          fps: a.frameRate != null ? a.frameRate : 24,
          loop: !!a.looped,
          offsets: a.offsets || [0, 0],
          indices: a.frameIndices || [],
          flipX: !!a.flipX,
          flipY: !!a.flipY
        };
      })
    };
  }

  function parsePsych(raw) {
    var d = JSON.parse(raw);
    return {
      name: "",
      spritePath: d.image || "",
      scale: d.scale != null ? d.scale : 1,
      singTime: d.sing_duration != null ? d.sing_duration : 4,
      flipX: !!d.flip_x,
      antialiasing: !d.no_antialiasing,
      startingAnim: (d.animations && d.animations.length > 0) ? d.animations[0].anim : "idle",
      healthIcon: d.healthicon || "face",
      healthIconMeta: null,
      healthBarColor: d.healthbar_colors || null,
      position: d.position || [0, 0],
      cameraOffsets: d.camera_position || [0, 0],
      isPlayer: null,
      gameOverChar: null,
      deathMeta: null,
      danceEvery: null,
      renderType: null,
      animations: (d.animations || []).map(function (a) {
        return {
          name: a.anim || "",
          prefix: a.name || "",
          fps: a.fps != null ? a.fps : 24,
          loop: !!a.loop,
          offsets: a.offsets || [0, 0],
          indices: a.indices || [],
          flipX: false,
          flipY: false
        };
      })
    };
  }

  function parseCodename(raw) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(raw, "text/xml");
    var errorNode = doc.querySelector("parsererror");
    if (errorNode) throw new Error("Invalid XML: " + errorNode.textContent.substring(0, 100));

    var root = doc.querySelector("character");
    if (!root) throw new Error("No <character> root element found.");

    var colorHex = root.getAttribute("color") || "#A1A1A1";
    var rgb = hexToRgb(colorHex);

    var animEls = root.querySelectorAll("anim");
    var anims = [];
    for (var i = 0; i < animEls.length; i++) {
      var a = animEls[i];
      var indicesStr = a.getAttribute("indices") || "";
      var indices = indicesStr ? indicesStr.split(",").map(function (s) { return parseInt(s.trim(), 10); }) : [];
      anims.push({
        name: a.getAttribute("name") || "",
        prefix: a.getAttribute("anim") || "",
        fps: parseFloat(a.getAttribute("fps")) || 24,
        loop: a.getAttribute("loop") === "true",
        offsets: [parseFloat(a.getAttribute("x")) || 0, parseFloat(a.getAttribute("y")) || 0],
        indices: indices,
        flipX: false,
        flipY: false
      });
    }

    return {
      name: "",
      spritePath: root.getAttribute("sprite") || "",
      scale: parseFloat(root.getAttribute("scale")) || 1,
      singTime: parseFloat(root.getAttribute("holdTime")) || 4,
      flipX: root.getAttribute("flipX") === "true",
      antialiasing: root.getAttribute("antialiasing") !== "false",
      startingAnim: anims.length > 0 ? anims[0].name : "idle",
      healthIcon: root.getAttribute("icon") || "face",
      healthIconMeta: null,
      healthBarColor: rgb,
      position: [parseFloat(root.getAttribute("x")) || 0, parseFloat(root.getAttribute("y")) || 0],
      cameraOffsets: [parseFloat(root.getAttribute("camx")) || 0, parseFloat(root.getAttribute("camy")) || 0],
      isPlayer: root.getAttribute("isPlayer") === "true" ? true : (root.getAttribute("isPlayer") === "false" ? false : null),
      gameOverChar: root.getAttribute("gameOverChar") || null,
      deathMeta: null,
      danceEvery: null,
      renderType: null,
      animations: anims
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
    // reorder so startingAnim is first-ish (Funkin uses startingAnimation field though)
    var anims = d.animations.map(function (a) {
      var obj = {
        name: a.name,
        prefix: a.prefix,
        offsets: a.offsets,
        looped: a.loop,
        frameRate: a.fps
      };
      if (a.indices && a.indices.length > 0) obj.frameIndices = a.indices;
      if (a.flipX) obj.flipX = true;
      if (a.flipY) obj.flipY = true;
      return obj;
    });

    var result = {
      version: "1.0.0",
      name: d.name || "",
      renderType: d.renderType || "sparrow",
      assetPath: d.spritePath,
      startingAnimation: d.startingAnim || "idle",
      singTime: d.singTime,
      flipX: d.flipX,
      isPixel: !d.antialiasing,
      healthIcon: d.healthIconMeta || { id: d.healthIcon, scale: 1.0, flipX: false, isPixel: !d.antialiasing, offsets: [0, 0] },
      offsets: d.position,
      cameraOffsets: d.cameraOffsets,
      animations: anims
    };

    if (d.danceEvery != null) result.danceEvery = d.danceEvery;
    if (d.scale !== 1) result.scale = d.scale;
    if (d.deathMeta) result.death = d.deathMeta;

    return JSON.stringify(result, null, 4);
  }

  function toPsych(d) {
    // put starting anim first
    var anims = d.animations.slice();
    var startIdx = -1;
    for (var i = 0; i < anims.length; i++) {
      if (anims[i].name === d.startingAnim) { startIdx = i; break; }
    }
    if (startIdx > 0) {
      var moved = anims.splice(startIdx, 1)[0];
      anims.unshift(moved);
    }

    var psychAnims = anims.map(function (a) {
      return {
        anim: a.name,
        name: a.prefix,
        fps: a.fps,
        loop: a.loop,
        indices: a.indices || [],
        offsets: a.offsets
      };
    });

    var result = {
      animations: psychAnims,
      image: d.spritePath,
      scale: d.scale,
      sing_duration: d.singTime,
      healthicon: d.healthIcon,
      position: d.position,
      camera_position: d.cameraOffsets,
      flip_x: d.flipX,
      no_antialiasing: !d.antialiasing
    };

    if (d.healthBarColor) {
      result.healthbar_colors = d.healthBarColor;
    } else {
      result.healthbar_colors = [161, 161, 161];
    }

    return JSON.stringify(result, null, 4);
  }

  function toCodename(d) {
    // put starting anim first
    var anims = d.animations.slice();
    var startIdx = -1;
    for (var i = 0; i < anims.length; i++) {
      if (anims[i].name === d.startingAnim) { startIdx = i; break; }
    }
    if (startIdx > 0) {
      var moved = anims.splice(startIdx, 1)[0];
      anims.unshift(moved);
    }

    var colorHex = d.healthBarColor ? rgbToHex(d.healthBarColor) : "#A1A1A1";

    var lines = [];
    lines.push('<character'
      + ' isPlayer="' + (d.isPlayer != null ? d.isPlayer : false) + '"'
      + ' flipX="' + d.flipX + '"'
      + ' holdTime="' + d.singTime + '"'
      + ' color="' + escapeXmlAttr(colorHex) + '"'
      + ' icon="' + escapeXmlAttr(d.healthIcon) + '"'
      + ' scale="' + d.scale + '"'
      + ' antialiasing="' + d.antialiasing + '"'
      + ' x="' + d.position[0] + '" y="' + d.position[1] + '"'
      + ' camx="' + d.cameraOffsets[0] + '" camy="' + d.cameraOffsets[1] + '"'
      + (d.gameOverChar ? ' gameOverChar="' + escapeXmlAttr(d.gameOverChar) + '"' : '')
      + ' sprite="' + escapeXmlAttr(d.spritePath) + '">');

    for (var i = 0; i < anims.length; i++) {
      var a = anims[i];
      var line = '    <anim name="' + escapeXmlAttr(a.name) + '"'
        + ' anim="' + escapeXmlAttr(a.prefix) + '"'
        + ' fps="' + a.fps + '"'
        + ' loop="' + a.loop + '"'
        + ' x="' + a.offsets[0] + '" y="' + a.offsets[1] + '"';
      if (a.indices && a.indices.length > 0) {
        line += ' indices="' + a.indices.join(",") + '"';
      }
      line += '/>';
      lines.push(line);
    }

    lines.push('</character>');
    return lines.join('\n');
  }

  // --- Helpers ---

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  function rgbToHex(rgb) {
    return "#" + rgb.map(function (c) {
      var h = Math.max(0, Math.min(255, Math.round(c))).toString(16);
      return h.length < 2 ? "0" + h : h;
    }).join("").toUpperCase();
  }

  function escapeXmlAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- Report Issue ---
  var btnReport = document.getElementById("btn-report-issue");
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
      params.set("template", "character-converter-issue.yml");
      params.set("title", "Character Converter: " + direction);
      if (inputVal) params.set("input", inputVal);
      if (outputVal) params.set("output", outputVal);
      params.set("additional", "Conversion direction: " + direction);

      window.open("https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?" + params.toString(), "_blank");
    });
  }
});
