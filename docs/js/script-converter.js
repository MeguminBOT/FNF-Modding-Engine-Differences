
// =============================================
// SCRIPT CONVERTER — UI & ROUTING
// =============================================
// Main entry point: DOM event handlers, language detection, conversion routing.
// Depends on: script-converter-data.js, script-converter-lua.js,
//             script-converter-hx.js, script-converter-analysis.js

document.addEventListener("DOMContentLoaded", function () {
  var SC = window.ScriptConverter;
  var btnConvert = document.getElementById("script-btn-convert");
  var btnCopy = document.getElementById("script-btn-copy");
  var btnClear = document.getElementById("script-btn-clear");
  var btnDownload = document.getElementById("script-btn-download");
  var fileUpload = document.getElementById("script-file-upload");
  var fileNameEl = document.getElementById("script-file-name");
  if (!btnConvert) return;

  var inputEl = document.getElementById("script-input-data");
  var outputEl = document.getElementById("script-output-data");
  var statusEl = document.getElementById("script-converter-status");
  var sourceSelect = document.getElementById("script-source-lang");
  var targetSelect = document.getElementById("script-target-lang");
  var uploadedFileName = "";

  // --- Convert ---
  btnConvert.addEventListener("click", function () {
    statusEl.style.color = "";
    statusEl.textContent = "";
    outputEl.value = "";

    var raw = inputEl.value;
    if (!raw.trim()) {
      setError("Please paste script code in the input box.");
      return;
    }

    var sourceLang = sourceSelect.value;
    if (sourceLang === "auto") {
      sourceLang = detectLanguage(raw);
      if (!sourceLang) {
        setError("Could not auto-detect the source language. Please select it manually.");
        return;
      }
    }

    var targetLang = targetSelect.value;
    if (sourceLang === targetLang) {
      setError("Source and target are the same.");
      return;
    }

    try {
      var result = convertScript(raw, sourceLang, targetLang);
      var analysis = SC.analyzeAndAnnotate(raw, result, sourceLang, targetLang);
      outputEl.value = analysis.annotatedOutput;
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Converted " + (SC.langLabels[sourceLang] || sourceLang) + " \u2192 " + (SC.langLabels[targetLang] || targetLang) + " successfully.";
      SC.displayAnalysis(analysis);
    } catch (e) {
      setError("Conversion error: " + e.message);
      SC.clearAnalysis();
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
    SC.clearAnalysis();
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
        if (ext === "lua") sourceSelect.value = "lua";
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
        if (ext === "lua") sourceSelect.value = "lua";
      }
    };
    reader.readAsText(file);
  });

  // --- Download ---
  btnDownload.addEventListener("click", function () {
    if (!outputEl.value) { setError("Nothing to download. Convert something first."); return; }
    var targetLang = targetSelect.value;
    var ext = (targetLang === "lua") ? ".lua" : ".hx";
    var mime = "text/plain";
    var baseName = uploadedFileName ? uploadedFileName.replace(/\.[^.]+$/, "") : "script";
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

  // --- Auto-detect ---
  function detectLanguage(raw) {
    // Lua indicators
    if (/\blocal\s+\w/.test(raw)) return "lua";
    if (/\bfunction\s+\w+\s*\([^)]*\)\s*$/m.test(raw)) return "lua";
    if (/\bthen\b/.test(raw) && /\bend\b/.test(raw)) return "lua";
    if (/makeLuaSprite|makeAnimatedLuaSprite|addLuaSprite|setProperty\s*\(|getProperty\s*\(|doTween[XYAZ]/.test(raw)) return "lua";
    if (/--[^\[]/.test(raw) && !/\/\//.test(raw)) return "lua";

    // HScript variant detection
    if (/\bPlayState\.instance\b/.test(raw)) return "funkin-hx";
    if (/\bConductor\.instance\b/.test(raw)) return "funkin-hx";
    if (/\bcurrentStage\.get(Boyfriend|Dad|Girlfriend)\b/.test(raw)) return "funkin-hx";
    if (/\bevent\.cancel(?:Event)?\s*\(/.test(raw) && /\bPlayState|\bConductor\.instance|\bScriptEvent/.test(raw)) return "funkin-hx";
    if (/\bgame\.\w/.test(raw) || /\bClientPrefs\.data\b/.test(raw)) return "psych-hx";

    // Codename indicators: direct access callbacks or direct add()
    if (/\bfunction\s+(create|update|beatHit|stepHit|destroy|postCreate|postUpdate)\s*\(/.test(raw)) return "codename-hx";
    if (/^\s*add\s*\(\s*\w/.test(raw) && !/game\.add/.test(raw)) return "codename-hx";

    // Generic HScript
    if (/\bvar\s+\w/.test(raw)) return "psych-hx";
    if (/\bnew\s+FlxSprite\b/.test(raw)) return "psych-hx";
    if (/\bFlxTween\.tween\b/.test(raw)) return "psych-hx";
    if (/\/\//.test(raw) && !/--/.test(raw)) return "psych-hx";

    return null;
  }

  // =============================================
  // CONVERSION ROUTER
  // =============================================
  // All conversions route through Psych HScript Iris as the pivot format.

  function convertScript(raw, source, target) {
    if (source === "lua") {
      var psychHx = SC.luaToPsychHScript(raw);
      if (target === "psych-hx") return psychHx;
      if (target === "funkin-hx") return SC.psychHxToFunkinHx(psychHx);
      if (target === "codename-hx") return SC.psychHxToCodenameHx(psychHx);
    }

    if (target === "lua") {
      var normalized = raw;
      if (source === "funkin-hx") normalized = SC.funkinHxToPsychHx(raw);
      else if (source === "codename-hx") normalized = SC.codenameHxToPsychHx(raw);
      return SC.psychHScriptToLua(normalized);
    }

    var pivot = raw;
    if (source === "funkin-hx") pivot = SC.funkinHxToPsychHx(raw);
    else if (source === "codename-hx") pivot = SC.codenameHxToPsychHx(raw);
    if (target === "psych-hx") return pivot;
    if (target === "funkin-hx") return SC.psychHxToFunkinHx(pivot);
    if (target === "codename-hx") return SC.psychHxToCodenameHx(pivot);

    throw new Error("Unsupported conversion: " + source + " -> " + target);
  }

  // --- Report Issue ---
  var btnReport = document.getElementById("script-btn-report-issue");
  if (btnReport) {
    btnReport.addEventListener("click", function (e) {
      e.preventDefault();
      var src = sourceSelect.value;
      var tgt = targetSelect.value;
      var direction = (SC.langLabels[src] || src) + " -> " + (SC.langLabels[tgt] || tgt);

      var inputVal = inputEl.value.trim();
      var outputVal = outputEl.value.trim();
      var maxLen = 1500;
      if (inputVal.length > maxLen) inputVal = inputVal.substring(0, maxLen) + "\n\n... (truncated, please paste full data)";
      if (outputVal.length > maxLen) outputVal = outputVal.substring(0, maxLen) + "\n\n... (truncated, please paste full data)";

      var params = new URLSearchParams();
      params.set("template", "script-converter-issue.yml");
      params.set("title", "Script Converter: " + direction);
      if (inputVal) params.set("input", inputVal);
      if (outputVal) params.set("output", outputVal);
      params.set("additional", "Conversion direction: " + direction);

      window.open("https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?" + params.toString(), "_blank");
    });
  }
});
