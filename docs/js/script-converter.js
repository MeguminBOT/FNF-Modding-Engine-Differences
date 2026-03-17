
document.addEventListener("DOMContentLoaded", function () {
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

  var langLabels = {
    "lua": "Psych Lua",
    "psych-hx": "Psych HScript Iris",
    "funkin-hx": "Official Funkin HScript",
    "codename-hx": "Codename HScript"
  };

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
      var analysis = analyzeAndAnnotate(raw, result, sourceLang, targetLang);
      outputEl.value = analysis.annotatedOutput;
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Converted " + (langLabels[sourceLang] || sourceLang) + " \u2192 " + (langLabels[targetLang] || targetLang) + " successfully.";
      displayAnalysis(analysis);
    } catch (e) {
      setError("Conversion error: " + e.message);
      clearAnalysis();
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
    clearAnalysis();
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
  // Lua <-> Psych HScript is the core; other HScript variants are reached
  // via text transforms on the Psych HScript output.

  function convertScript(raw, source, target) {
    // Same-family shortcuts
    if (source === "lua") {
      // Lua -> any HScript: first convert to Psych HScript, then adapt
      var psychHx = luaToPsychHScript(raw);
      if (target === "psych-hx") return psychHx;
      if (target === "funkin-hx") return psychHxToFunkinHx(psychHx);
      if (target === "codename-hx") return psychHxToCodenameHx(psychHx);
    }

    if (target === "lua") {
      // Any HScript -> Lua: normalize to Psych HScript first, then convert
      var normalized = raw;
      if (source === "funkin-hx") normalized = funkinHxToPsychHx(raw);
      else if (source === "codename-hx") normalized = codenameHxToPsychHx(raw);
      return psychHScriptToLua(normalized);
    }

    // HScript -> HScript: route through Psych HScript as pivot
    var pivot = raw;
    if (source === "funkin-hx") pivot = funkinHxToPsychHx(raw);
    else if (source === "codename-hx") pivot = codenameHxToPsychHx(raw);
    // pivot is now Psych HScript
    if (target === "psych-hx") return pivot;
    if (target === "funkin-hx") return psychHxToFunkinHx(pivot);
    if (target === "codename-hx") return psychHxToCodenameHx(pivot);

    throw new Error("Unsupported conversion: " + source + " -> " + target);
  }

  // =============================================
  // LUA → PSYCH HSCRIPT CONVERSION (core)
  // =============================================

  // Psych built-in variables mapping (Lua -> Psych HScript)
  var luaVarToHScript = {
    "downscroll": "ClientPrefs.data.downScroll",
    "middlescroll": "ClientPrefs.data.middleScroll",
    "opponentStrums": "ClientPrefs.data.opponentStrums",
    "ghostTapping": "ClientPrefs.data.ghostTapping",
    "lowQuality": "ClientPrefs.data.lowQuality",
    "framerate": "ClientPrefs.data.framerate",
    "flashingLights": "ClientPrefs.data.flashing",
    "scoreZoom": "ClientPrefs.data.scoreZoom",
    "cameraZoomOnBeat": "ClientPrefs.data.camZooms",
    "hideHud": "ClientPrefs.data.hideHud",
    "boyfriendName": "game.boyfriend.curCharacter",
    "dadName": "game.dad.curCharacter",
    "gfName": "game.gf.curCharacter",
    "songLength": "FlxG.sound.music.length",
    "songName": "PlayState.SONG.song",
    "isStoryMode": "PlayState.isStoryMode",
    "difficulty": "PlayState.storyDifficulty",
    "curBpm": "Conductor.bpm",
    "scrollSpeed": "PlayState.SONG.speed",
    "inGameOver": "game.isDead",
    "mustHitSection": "game.mustHitSection",
    "screenWidth": "FlxG.width",
    "screenHeight": "FlxG.height"
  };

  var cameraMap = {
    "camGame": "game.camGame",
    "camHUD": "game.camHUD",
    "camOther": "game.camOther"
  };

  function luaToPsychHScript(raw) {
    var lines = raw.split("\n");
    var result = [];
    var declaredVars = {};

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var converted = convertLuaLine(line, declaredVars);
      result.push(converted);
    }

    return result.join("\n");
  }

  function convertLuaLine(line, declaredVars) {
    var indent = line.match(/^(\s*)/)[1];
    var trimmed = line.trimEnd();
    var content = trimmed.trim();

    // Empty line
    if (!content) return "";

    // Block comments --[[ ... ]]--
    if (/^--\[\[/.test(content)) return indent + "/*" + content.substring(4);
    if (/\]\]--?\s*$/.test(content)) return indent + content.replace(/\]\]--?\s*$/, "*/");

    // Single line comments
    if (/^--/.test(content)) return indent + "//" + content.substring(2);

    // Inline trailing comments
    var inlineComment = "";
    var codeContent = content;
    var commentMatch = content.match(/^(.*?)\s*--(?!\[)(.*)$/);
    if (commentMatch) {
      codeContent = commentMatch[1].trim();
      inlineComment = " //" + commentMatch[2];
    }

    // function name(args) -> function name(args) {
    var funcMatch = codeContent.match(/^function\s+(\w+)\s*\(([^)]*)\)\s*$/);
    if (funcMatch) return indent + "function " + funcMatch[1] + "(" + funcMatch[2] + ") {" + inlineComment;

    // end -> }
    if (/^end\s*$/.test(codeContent)) return indent + "}" + inlineComment;

    // if ... then -> if (...) {
    var ifMatch = codeContent.match(/^if\s+(.+?)\s+then\s*$/);
    if (ifMatch) return indent + "if (" + convertLuaExpr(ifMatch[1]) + ") {" + inlineComment;

    // elseif ... then -> } else if (...) {
    var elseifMatch = codeContent.match(/^elseif\s+(.+?)\s+then\s*$/);
    if (elseifMatch) return indent + "} else if (" + convertLuaExpr(elseifMatch[1]) + ") {" + inlineComment;

    // else -> } else {
    if (/^else\s*$/.test(codeContent)) return indent + "} else {" + inlineComment;

    // for i = start, stop do -> for (var i = start; i <= stop; i++) {
    var forNumMatch = codeContent.match(/^for\s+(\w+)\s*=\s*(.+?)\s*,\s*(.+?)(?:\s*,\s*(.+?))?\s+do\s*$/);
    if (forNumMatch) {
      var varName = forNumMatch[1];
      var start = convertLuaExpr(forNumMatch[2]);
      var stop = convertLuaExpr(forNumMatch[3]);
      var step = forNumMatch[4] ? convertLuaExpr(forNumMatch[4]) : null;
      if (step) {
        return indent + "for (var " + varName + " = " + start + "; " + varName + " <= " + stop + "; " + varName + " += " + step + ") {" + inlineComment;
      }
      return indent + "for (var " + varName + " = " + start + "; " + varName + " <= " + stop + "; " + varName + "++) {" + inlineComment;
    }

    // for _, item in ipairs(tbl) do -> for (item in tbl) {
    var forInMatch = codeContent.match(/^for\s+\w+\s*,\s*(\w+)\s+in\s+ipairs\s*\((\w+)\)\s+do\s*$/);
    if (forInMatch) return indent + "for (" + forInMatch[1] + " in " + forInMatch[2] + ") {" + inlineComment;

    // for k, v in pairs(tbl) do -> for (k => v in tbl) {
    var forPairsMatch = codeContent.match(/^for\s+(\w+)\s*,\s*(\w+)\s+in\s+pairs\s*\((\w+)\)\s+do\s*$/);
    if (forPairsMatch) return indent + "for (" + forPairsMatch[1] + " => " + forPairsMatch[2] + " in " + forPairsMatch[3] + ") {" + inlineComment;

    // while ... do -> while (...) {
    var whileMatch = codeContent.match(/^while\s+(.+?)\s+do\s*$/);
    if (whileMatch) return indent + "while (" + convertLuaExpr(whileMatch[1]) + ") {" + inlineComment;

    // return statement
    var retMatch = codeContent.match(/^return\s+(.+)$/);
    if (retMatch) return indent + "return " + convertLuaExpr(retMatch[1]) + ";" + inlineComment;
    if (/^return\s*$/.test(codeContent)) return indent + "return;" + inlineComment;

    // local var = value -> var var = value
    var localMatch = codeContent.match(/^local\s+(\w+)\s*=\s*(.+)$/);
    if (localMatch) {
      declaredVars[localMatch[1]] = true;
      var val = convertLuaExpr(localMatch[1] + " = " + localMatch[2]);
      return indent + "var " + val + ";" + inlineComment;
    }

    // local var (no assignment)
    var localDeclMatch = codeContent.match(/^local\s+(\w+)\s*$/);
    if (localDeclMatch) {
      declaredVars[localDeclMatch[1]] = true;
      return indent + "var " + localDeclMatch[1] + ";" + inlineComment;
    }

    // API call conversions
    var apiConverted = convertLuaApiCall(codeContent, indent);
    if (apiConverted !== null) return apiConverted + inlineComment;

    // Generic statement - convert expressions and add semicolon
    var converted = convertLuaExpr(codeContent);
    if (converted !== codeContent || /\w/.test(converted)) {
      if (!/[{};]\s*$/.test(converted)) converted += ";";
      return indent + converted + inlineComment;
    }

    return indent + codeContent + inlineComment;
  }

  function convertLuaApiCall(content, indent) {
    var m;

    // makeLuaSprite(tag, image, x, y)
    m = content.match(/^makeLuaSprite\s*\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      if (m[2]) return indent + "var " + m[1] + " = new FlxSprite(" + m[3].trim() + ", " + m[4].trim() + ").loadGraphic(Paths.image('" + m[2] + "'));";
      return indent + "var " + m[1] + " = new FlxSprite(" + m[3].trim() + ", " + m[4].trim() + ");";
    }

    // makeAnimatedLuaSprite(tag, image, x, y)
    m = content.match(/^makeAnimatedLuaSprite\s*\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + "var " + m[1] + " = new FlxSprite(" + m[3].trim() + ", " + m[4].trim() + ");\n" + indent + m[1] + ".frames = Paths.getSparrowAtlas('" + m[2] + "');";

    // addLuaSprite(tag, front)
    m = content.match(/^addLuaSprite\s*\(\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      if (m[2] === "true") return indent + "game.add(" + m[1] + ");";
      return indent + "game.insert(game.members.indexOf(game.boyfriendGroup), " + m[1] + ");";
    }

    // removeLuaSprite(tag, destroy)
    m = content.match(/^removeLuaSprite\s*\(\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + "game.remove(" + m[1] + ");";

    // scaleObject(tag, sx, sy)
    m = content.match(/^scaleObject\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".scale.set(" + m[2].trim() + ", " + m[3].trim() + ");\n" + indent + m[1] + ".updateHitbox();";

    // setScrollFactor(tag, x, y)
    m = content.match(/^setScrollFactor\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".scrollFactor.set(" + m[2].trim() + ", " + m[3].trim() + ");";

    // screenCenter(tag, axis)
    m = content.match(/^screenCenter\s*\(\s*'([^']+)'\s*(?:,\s*'?([^']*?)'?)?\s*\)\s*;?\s*$/);
    if (m) {
      var axis = m[2] ? m[2].trim().toUpperCase() : "XY";
      return indent + m[1] + ".screenCenter(" + (axis === "XY" ? "" : "'" + axis + "'") + ");";
    }

    // setObjectCamera(tag, cam)
    m = content.match(/^setObjectCamera\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) {
      var cam = cameraMap[m[2]] || "game." + m[2];
      return indent + m[1] + ".cameras = [" + cam + "];";
    }

    // addAnimationByPrefix(tag, name, prefix, fps, loop)
    m = content.match(/^addAnimationByPrefix\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(true|false)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.addByPrefix('" + m[2] + "', '" + m[3] + "', " + m[4] + ", " + m[5] + ");";

    // addAnimationByIndices(tag, name, prefix, indices, fps)
    m = content.match(/^addAnimationByIndices\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.addByIndices('" + m[2] + "', '" + m[3] + "', [" + m[4] + "], '', " + m[5] + ");";

    // playAnim(tag, anim, forced)
    m = content.match(/^playAnim\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.play('" + m[2] + "'" + (m[3] ? ", " + m[3] : "") + ");";

    // objectPlayAnimation(tag, anim, forced, type)
    m = content.match(/^objectPlayAnimation\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(true|false))?(?:,\s*\d+)?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.play('" + m[2] + "'" + (m[3] ? ", " + m[3] : "") + ");";

    // setProperty(path, val)
    m = content.match(/^setProperty\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + "game." + m[1] + " = " + convertLuaValue(m[2].trim()) + ";";

    // getProperty(path) — standalone call (rare)
    m = content.match(/^getProperty\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "game." + m[1] + ";";

    // setPropertyFromGroup(group, index, prop, val)
    m = content.match(/^setPropertyFromGroup\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + "game." + m[1] + ".members[" + m[2].trim() + "]." + m[3] + " = " + convertLuaValue(m[4].trim()) + ";";

    // doTweenX, doTweenY, doTweenAlpha, doTweenAngle
    m = content.match(/^doTween(X|Y|Alpha|Angle)\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) {
      var prop = { X: "x", Y: "y", Alpha: "alpha", Angle: "angle" }[m[1]];
      var easeStr = m[6] ? ", {ease: FlxEase." + m[6] + "}" : "";
      return indent + "FlxTween.tween(" + m[3] + ", {" + prop + ": " + m[4].trim() + "}, " + m[5].trim() + easeStr + ");";
    }

    // doTweenColor(tag, obj, fromColor, toColor, dur, ease)
    m = content.match(/^doTweenColor\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + "FlxTween.color(" + m[2] + ", " + m[5].trim() + ", " + m[3] + ", " + m[4] + (m[6] ? ", {ease: FlxEase." + m[6] + "}" : "") + ");";

    // setTextString(tag, text)
    m = content.match(/^setTextString\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".text = " + convertLuaValue(m[2].trim()) + ";";

    // setTextSize(tag, size)
    m = content.match(/^setTextSize\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".size = " + m[2].trim() + ";";

    // precacheImage(img)
    m = content.match(/^precacheImage\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "Paths.image('" + m[1] + "');";

    // close(true)
    m = content.match(/^close\s*\(\s*(true)?\s*\)\s*;?\s*$/);
    if (m) return indent + "// close() - Lua-only: closes the running Lua script. HScript scripts are managed differently.";

    // callMethod(method, args)
    m = content.match(/^callMethod\s*\(\s*'([^']+)'\s*(?:,\s*\{(.+?)\})?\s*\)\s*;?\s*$/);
    if (m) return indent + "game." + m[1] + "(" + (m[2] ? m[2].trim() : "") + ");";

    // characterDance(char)
    m = content.match(/^characterDance\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) {
      var charRef = { bf: "game.boyfriend", boyfriend: "game.boyfriend", dad: "game.dad", gf: "game.gf", girlfriend: "game.gf" }[m[1]] || "game." + m[1];
      return indent + charRef + ".dance();";
    }

    // setCharacterX/Y(char, val) / getCharacterX/Y(char)
    m = content.match(/^setCharacter(X|Y)\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var charRef = { bf: "game.boyfriend", boyfriend: "game.boyfriend", dad: "game.dad", gf: "game.gf" }[m[2]] || "game." + m[2];
      return indent + charRef + "." + m[1].toLowerCase() + " = " + m[3].trim() + ";";
    }

    // triggerEvent(name, v1, v2)
    m = content.match(/^triggerEvent\s*\(\s*'([^']+)'\s*(?:,\s*(.+?))?\s*\)\s*;?\s*$/);
    if (m) return indent + "game.triggerEvent('" + m[1] + "'" + (m[2] ? ", " + m[2].trim() : "") + ");";

    return null;
  }

  function convertLuaExpr(expr) {
    // getProperty inline
    expr = expr.replace(/getProperty\s*\(\s*'([^']+)'\s*\)/g, "game.$1");

    // getPropertyFromGroup inline
    expr = expr.replace(/getPropertyFromGroup\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*'([^']+)'\s*\)/g, "game.$1.members[$2].$3");

    // String concatenation .. to +
    expr = expr.replace(/\s*\.\.\s*/g, " + ");

    // Not equal ~= to !=
    expr = expr.replace(/~=/g, "!=");

    // Boolean operators
    expr = expr.replace(/\bnot\s+/g, "!");
    expr = expr.replace(/\band\b/g, "&&");
    expr = expr.replace(/\bor\b/g, "||");

    // nil -> null
    expr = expr.replace(/\bnil\b/g, "null");

    // true/false stay the same

    // Lua built-in variable replacements
    for (var luaVar in luaVarToHScript) {
      var regex = new RegExp("\\b" + luaVar + "\\b", "g");
      expr = expr.replace(regex, luaVarToHScript[luaVar]);
    }

    // math.floor, math.ceil, math.abs, math.random
    expr = expr.replace(/\bmath\.floor\b/g, "Math.floor");
    expr = expr.replace(/\bmath\.ceil\b/g, "Math.ceil");
    expr = expr.replace(/\bmath\.abs\b/g, "Math.abs");
    expr = expr.replace(/\bmath\.random\b/g, "FlxG.random.float");
    expr = expr.replace(/\bmath\.pi\b/gi, "Math.PI");
    expr = expr.replace(/\bmath\.sin\b/g, "Math.sin");
    expr = expr.replace(/\bmath\.cos\b/g, "Math.cos");

    // tostring / tonumber
    expr = expr.replace(/\btostring\s*\(/g, "Std.string(");
    expr = expr.replace(/\btonumber\s*\(/g, "Std.parseFloat(");

    // #table -> table.length
    expr = expr.replace(/#(\w+)/g, "$1.length");

    return expr;
  }

  function convertLuaValue(val) {
    return convertLuaExpr(val);
  }

  // =============================================
  // PSYCH HSCRIPT → LUA CONVERSION (core)
  // =============================================

  var hscriptVarToLua = {};
  for (var k in luaVarToHScript) {
    hscriptVarToLua[luaVarToHScript[k]] = k;
  }

  function psychHScriptToLua(raw) {
    var lines = raw.split("\n");
    var result = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var converted = convertHScriptLine(line);
      result.push(converted);
    }

    return result.join("\n");
  }

  function convertHScriptLine(line) {
    var indent = line.match(/^(\s*)/)[1];
    var trimmed = line.trimEnd();
    var content = trimmed.trim();

    if (!content) return "";

    // Block comments /* ... */
    if (/^\/\*/.test(content)) return indent + "--[[ " + content.substring(2);
    if (/\*\/\s*$/.test(content)) return indent + content.replace(/\*\/\s*$/, "]]--");

    // Single line comments //
    if (/^\/\//.test(content)) return indent + "--" + content.substring(2);

    // Inline trailing comments
    var inlineComment = "";
    var codeContent = content;
    var commentIdx = content.indexOf("//");
    if (commentIdx > 0) {
      // Make sure it's not inside a string
      var beforeComment = content.substring(0, commentIdx);
      var singleQuotes = (beforeComment.match(/'/g) || []).length;
      var doubleQuotes = (beforeComment.match(/"/g) || []).length;
      if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
        codeContent = beforeComment.trim();
        inlineComment = " --" + content.substring(commentIdx + 2);
      }
    }

    // function name(args) { -> function name(args)
    var funcMatch = codeContent.match(/^function\s+(\w+)\s*\(([^)]*)\)\s*\{\s*$/);
    if (funcMatch) return indent + "function " + funcMatch[1] + "(" + funcMatch[2] + ")" + inlineComment;

    // } else if (...) { -> elseif ... then
    var elseifMatch = codeContent.match(/^\}\s*else\s+if\s*\((.+)\)\s*\{\s*$/);
    if (elseifMatch) return indent + "elseif " + convertHScriptExpr(elseifMatch[1]) + " then" + inlineComment;

    // } else { -> else
    if (/^\}\s*else\s*\{\s*$/.test(codeContent)) return indent + "else" + inlineComment;

    // } -> end
    if (/^\}\s*;?\s*$/.test(codeContent)) return indent + "end" + inlineComment;

    // if (...) { -> if ... then
    var ifMatch = codeContent.match(/^if\s*\((.+)\)\s*\{\s*$/);
    if (ifMatch) return indent + "if " + convertHScriptExpr(ifMatch[1]) + " then" + inlineComment;

    // for (var i = start; i <= stop; i++) { -> for i = start, stop do
    var forMatch = codeContent.match(/^for\s*\(\s*var\s+(\w+)\s*=\s*(.+?)\s*;\s*\w+\s*<=\s*(.+?)\s*;\s*\w+\+\+\s*\)\s*\{\s*$/);
    if (forMatch) return indent + "for " + forMatch[1] + " = " + convertHScriptExpr(forMatch[2]) + ", " + convertHScriptExpr(forMatch[3]) + " do" + inlineComment;

    // for (k => v in map) { -> for k, v in pairs(map) do
    var forKvMatch = codeContent.match(/^for\s*\(\s*(\w+)\s*=>\s*(\w+)\s+in\s+(\w+)\s*\)\s*\{\s*$/);
    if (forKvMatch) return indent + "for " + forKvMatch[1] + ", " + forKvMatch[2] + " in pairs(" + forKvMatch[3] + ") do" + inlineComment;

    // for (item in array) { -> for _, item in ipairs(array) do
    var forInMatch = codeContent.match(/^for\s*\(\s*(\w+)\s+in\s+(\w+)\s*\)\s*\{\s*$/);
    if (forInMatch) return indent + "for _, " + forInMatch[1] + " in ipairs(" + forInMatch[2] + ") do" + inlineComment;

    // while (...) { -> while ... do
    var whileMatch = codeContent.match(/^while\s*\((.+)\)\s*\{\s*$/);
    if (whileMatch) return indent + "while " + convertHScriptExpr(whileMatch[1]) + " do" + inlineComment;

    // return statement
    var retMatch = codeContent.match(/^return\s+(.+?)\s*;\s*$/);
    if (retMatch) return indent + "return " + convertHScriptExpr(retMatch[1]) + inlineComment;
    if (/^return\s*;\s*$/.test(codeContent)) return indent + "return" + inlineComment;

    // var name = value; -> local name = value
    var varMatch = codeContent.match(/^var\s+(\w+)\s*=\s*(.+?)\s*;\s*$/);
    if (varMatch) {
      var val = convertHScriptExpr(varMatch[2]);
      return indent + "local " + varMatch[1] + " = " + val + inlineComment;
    }

    // var name; -> local name
    var varDeclMatch = codeContent.match(/^var\s+(\w+)\s*;\s*$/);
    if (varDeclMatch) return indent + "local " + varDeclMatch[1] + inlineComment;

    // HScript API call conversions
    var apiConverted = convertHScriptApiCall(codeContent, indent);
    if (apiConverted !== null) return apiConverted + inlineComment;

    // Generic statement - strip trailing semicolons and convert expressions
    var converted = convertHScriptExpr(codeContent.replace(/;\s*$/, ""));
    return indent + converted + inlineComment;
  }

  function convertHScriptApiCall(content, indent) {
    var m;

    // new FlxSprite(x, y).loadGraphic(Paths.image('img'))
    m = content.match(/^var\s+(\w+)\s*=\s*new\s+FlxSprite\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\.loadGraphic\s*\(\s*Paths\.image\s*\(\s*'([^']+)'\s*\)\s*\)\s*;\s*$/);
    if (m) return indent + "makeLuaSprite('" + m[1] + "', '" + m[4] + "', " + m[2].trim() + ", " + m[3].trim() + ")";

    // new FlxSprite(x, y).loadGraphic(Paths.image("img"))
    m = content.match(/^var\s+(\w+)\s*=\s*new\s+FlxSprite\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\.loadGraphic\s*\(\s*Paths\.image\s*\(\s*"([^"]+)"\s*\)\s*\)\s*;\s*$/);
    if (m) return indent + "makeLuaSprite('" + m[1] + "', '" + m[4] + "', " + m[2].trim() + ", " + m[3].trim() + ")";

    // var tag = new FlxSprite(x, y); + tag.frames = Paths.getSparrowAtlas('img');
    m = content.match(/^var\s+(\w+)\s*=\s*new\s+FlxSprite\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "-- FlxSprite created: " + m[1] + " (check next line for frames/loadGraphic)";

    // tag.frames = Paths.getSparrowAtlas('img');
    m = content.match(/^(\w+)\.frames\s*=\s*Paths\.getSparrowAtlas\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) return indent + "makeAnimatedLuaSprite('" + m[1] + "', '" + m[2] + "', 0, 0)";

    // game.add(tag);
    m = content.match(/^game\.add\s*\(\s*(\w+)\s*\)\s*;\s*$/);
    if (m) return indent + "addLuaSprite('" + m[1] + "', true)";

    // game.insert(game.members.indexOf(game.boyfriendGroup), tag);
    m = content.match(/^game\.insert\s*\(\s*game\.members\.indexOf\s*\(\s*game\.boyfriendGroup\s*\)\s*,\s*(\w+)\s*\)\s*;\s*$/);
    if (m) return indent + "addLuaSprite('" + m[1] + "', false)";

    // game.remove(tag);
    m = content.match(/^game\.remove\s*\(\s*(\w+)\s*\)\s*;\s*$/);
    if (m) return indent + "removeLuaSprite('" + m[1] + "')";

    // tag.scale.set(sx, sy);
    m = content.match(/^(\w+)\.scale\.set\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "scaleObject('" + m[1] + "', " + m[2].trim() + ", " + m[3].trim() + ")";

    // tag.updateHitbox(); - skip (already included in scaleObject)
    if (/^\w+\.updateHitbox\s*\(\s*\)\s*;\s*$/.test(content)) return indent + "-- updateHitbox is handled by scaleObject";

    // tag.scrollFactor.set(x, y);
    m = content.match(/^(\w+)\.scrollFactor\.set\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "setScrollFactor('" + m[1] + "', " + m[2].trim() + ", " + m[3].trim() + ")";

    // tag.cameras = [game.camHUD]; etc
    m = content.match(/^(\w+)\.cameras\s*=\s*\[\s*game\.(\w+)\s*\]\s*;\s*$/);
    if (m) return indent + "setObjectCamera('" + m[1] + "', '" + m[2] + "')";

    // tag.animation.addByPrefix(name, prefix, fps, loop);
    m = content.match(/^(\w+)\.animation\.addByPrefix\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(true|false)\s*\)\s*;\s*$/);
    if (!m) m = content.match(/^(\w+)\.animation\.addByPrefix\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(true|false)\s*\)\s*;\s*$/);
    if (m) return indent + "addAnimationByPrefix('" + m[1] + "', '" + m[2] + "', '" + m[3] + "', " + m[4] + ", " + m[5] + ")";

    // tag.animation.play(name, forced);
    m = content.match(/^(\w+)\.animation\.play\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*(true|false))?\s*\)\s*;\s*$/);
    if (m) return indent + "playAnim('" + m[1] + "', '" + m[2] + "'" + (m[3] ? ", " + m[3] : "") + ")";

    // game.property = value;
    m = content.match(/^game\.(\w[\w.]*)\s*=\s*(.+?)\s*;\s*$/);
    if (m) {
      // Check if it's a known variable that maps back to Lua
      var fullPath = "game." + m[1];
      if (hscriptVarToLua[fullPath]) return indent + m[2].trim() + " -- TODO: use setProperty or Lua variable '" + hscriptVarToLua[fullPath] + "'";
      return indent + "setProperty('" + m[1] + "', " + convertHScriptValue(m[2].trim()) + ")";
    }

    // FlxTween.tween(obj, {prop: val}, dur, {ease: FlxEase.type})
    m = content.match(/^FlxTween\.tween\s*\(\s*(\w+)\s*,\s*\{\s*(\w+)\s*:\s*(.+?)\s*\}\s*,\s*(.+?)\s*(?:,\s*\{\s*ease\s*:\s*FlxEase\.(\w+)\s*\})?\s*\)\s*;\s*$/);
    if (m) {
      var tweenPropMap = { x: "X", y: "Y", alpha: "Alpha", angle: "Angle" };
      var tweenType = tweenPropMap[m[2]];
      if (tweenType) {
        return indent + "doTween" + tweenType + "('tween_" + m[1] + "_" + m[2] + "', '" + m[1] + "', " + m[3].trim() + ", " + m[4].trim() + (m[5] ? ", '" + m[5] + "'" : "") + ")";
      }
    }

    // tag.text = value;
    m = content.match(/^(\w+)\.text\s*=\s*(.+?)\s*;\s*$/);
    if (m) return indent + "setTextString('" + m[1] + "', " + convertHScriptValue(m[2].trim()) + ")";

    // tag.size = value;
    m = content.match(/^(\w+)\.size\s*=\s*(.+?)\s*;\s*$/);
    if (m) return indent + "setTextSize('" + m[1] + "', " + m[2].trim() + ")";

    // Paths.image('img');  (precache)
    m = content.match(/^Paths\.image\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) return indent + "precacheImage('" + m[1] + "')";

    return null;
  }

  function convertHScriptExpr(expr) {
    // != to ~= (careful not to double-convert)
    expr = expr.replace(/!=/g, "~=");

    // ! to not (only standalone, not ~=)
    expr = expr.replace(/!\s*(?!=)/g, "not ");

    // && to and, || to or
    expr = expr.replace(/&&/g, "and");
    expr = expr.replace(/\|\|/g, "or");

    // null -> nil
    expr = expr.replace(/\bnull\b/g, "nil");

    // String concatenation + to .. (only when both sides look like strings - simplified)
    // This is best-effort and may need manual review

    // Math
    expr = expr.replace(/\bMath\.floor\b/g, "math.floor");
    expr = expr.replace(/\bMath\.ceil\b/g, "math.ceil");
    expr = expr.replace(/\bMath\.abs\b/g, "math.abs");
    expr = expr.replace(/\bMath\.PI\b/g, "math.pi");
    expr = expr.replace(/\bMath\.sin\b/g, "math.sin");
    expr = expr.replace(/\bMath\.cos\b/g, "math.cos");

    // Std.string / Std.parseFloat
    expr = expr.replace(/\bStd\.string\s*\(/g, "tostring(");
    expr = expr.replace(/\bStd\.parseFloat\s*\(/g, "tonumber(");

    // Known HScript variables -> Lua built-in variables (longer paths first)
    var sortedKeys = Object.keys(hscriptVarToLua).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < sortedKeys.length; i++) {
      var hsVar = sortedKeys[i];
      // Escape dots for regex
      var escaped = hsVar.replace(/\./g, "\\.");
      var regex = new RegExp(escaped, "g");
      expr = expr.replace(regex, hscriptVarToLua[hsVar]);
    }

    return expr;
  }

  function convertHScriptValue(val) {
    return convertHScriptExpr(val);
  }

  // =============================================
  // HSCRIPT VARIANT TRANSFORMS
  // =============================================
  // These transform between HScript variants by adjusting prefixes,
  // callback names, and engine-specific API differences.

  // --- Callback mappings ---
  // Psych/Funkin -> Codename callback name mappings
  var psychToCodenameCallbacks = {
    "onCreate": "create",
    "onCreatePost": "postCreate",
    "onUpdate": "update",
    "onUpdatePost": "postUpdate",
    "onDestroy": "destroy",
    "onBeatHit": "beatHit",
    "onStepHit": "stepHit",
    "onEndSong": "onSongEnd",
    "onCountdownStarted": "onStartCountdown",
    "goodNoteHit": "onPlayerHit",
    "noteMiss": "onPlayerMiss",
    "opponentNoteHit": "onDadHit",
    "onGameOver": "onGameOver",
    "onPause": "onGamePause",
    "onMoveCamera": "onCameraMove",
    "onRecalculateRating": "onRatingUpdate"
  };

  var codenameToPsychCallbacks = {};
  for (var pk in psychToCodenameCallbacks) {
    codenameToPsychCallbacks[psychToCodenameCallbacks[pk]] = pk;
  }

  // Codename callbacks that receive event objects instead of direct args
  var codenameEventCallbacks = {
    "onStartCountdown": true,
    "onPlayerHit": true,
    "onPlayerMiss": true,
    "onDadHit": true,
    "onGameOver": true,
    "onGamePause": true,
    "onCameraMove": true,
    "onRatingUpdate": true,
    "onEvent": true
  };

  // Codename NoteHitEvent / NoteMissEvent properties that exist directly on the event
  // (not nested under event.note). From CodenameCrew/CodenameEngine source.
  var codenameEventDirectProps = {
    "noteType": true,
    "direction": true,
    "score": true,
    "accuracy": true,
    "healthGain": true,
    "rating": true,
    "showSplash": true,
    "animSuffix": true,
    "player": true,
    "character": true,
    "characters": true,
    "deleteNote": true,
    "unmuteVocals": true,
    "forceAnim": true,
    "misses": true,
    "muteVocals": true,
    "missSound": true,
    "missVolume": true,
    "ghostMiss": true,
    "gfSad": true,
    "stunned": true,
    "resetCombo": true,
    "playMissSound": true
  };

  // Psych callbacks that gain an argument in Funkin
  var psychToFunkinArgCallbacks = {
    "onBeatHit": "curBeat",
    "onStepHit": "curStep"
  };

  // --- Psych HScript -> Funkin HScript ---
  function psychHxToFunkinHx(code) {
    var lines = code.split("\n");
    var result = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Function declarations: add args for Funkin callbacks
      var funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var fname = funcMatch[2];
        if (psychToFunkinArgCallbacks[fname] && !funcMatch[3].trim()) {
          line = funcMatch[1] + "function " + fname + "(" + psychToFunkinArgCallbacks[fname] + ") {";
        }
      }

      // Replace game. -> PlayState.instance.
      line = line.replace(/\bgame\./g, "PlayState.instance.");

      // Replace .playAnim( -> .playAnimation( for character references
      // Characters accessed via PlayState.instance.boyfriend, .dad, .gf
      line = line.replace(/(PlayState\.instance\.(?:boyfriend|dad|gf)\s*\.\s*)playAnim\s*\(/g, "$1playAnimation(");

      // ClientPrefs.data.* -> comment (no Funkin equivalent)
      if (/ClientPrefs\.data\.\w+/.test(line)) {
        var indent = line.match(/^(\s*)/)[1];
        line = indent + "// [Psych-specific] " + line.trim();
      }

      // Psych-specific flow control constants
      line = line.replace(/\breturn\s+Function_Stop\s*;/g, "// return Function_Stop; // Psych-specific flow control");
      line = line.replace(/\bFunction_Stop\b/g, "/* Function_Stop - Psych-specific */");
      line = line.replace(/\breturn\s+Function_Continue\s*;/g, "// return Function_Continue; // Psych-specific flow control");
      line = line.replace(/\bFunction_Continue\b/g, "/* Function_Continue - Psych-specific */");
      line = line.replace(/\bFunction_StopLua\b/g, "/* Function_StopLua - Psych-specific */");
      line = line.replace(/\bFunction_StopHScript\b/g, "/* Function_StopHScript - Psych-specific */");
      line = line.replace(/\bFunction_StopAll\b/g, "/* Function_StopAll - Psych-specific */");

      result.push(line);
    }

    return result.join("\n");
  }

  // --- Psych HScript -> Codename HScript ---
  function psychHxToCodenameHx(code) {
    var lines = code.split("\n");
    var result = [];
    var inEventCallback = false;
    var braceDepth = 0;
    var eventBraceStart = 0;
    var currentNoteParam = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Function declarations: rename callbacks and adjust args
      var funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var fname = funcMatch[2];
        var args = funcMatch[3];
        var cnName = psychToCodenameCallbacks[fname];
        if (cnName) {
          // Track if this callback receives event objects in Codename
          if (codenameEventCallbacks[cnName]) {
            // Remember the original note param name so we can remap accesses
            currentNoteParam = args.trim() || null;
            inEventCallback = true;
            braceDepth = 0;
            eventBraceStart = 0;
            args = "event";
          } else {
            inEventCallback = false;
            currentNoteParam = null;
          }
          // Add curBeat/curStep arg for beat/step callbacks
          if (cnName === "beatHit" && !args.trim()) args = "curBeat";
          if (cnName === "stepHit" && !args.trim()) args = "curStep";
          line = funcMatch[1] + "function " + cnName + "(" + args + ") {";
        } else {
          // Non-mapped function, reset event tracking
          inEventCallback = false;
          currentNoteParam = null;
        }
      }

      // Track brace depth to know when the event callback ends
      if (inEventCallback) {
        var opens = (line.match(/\{/g) || []).length;
        var closes = (line.match(/\}/g) || []).length;
        braceDepth += opens - closes;
        if (braceDepth < 0) {
          inEventCallback = false;
          currentNoteParam = null;
          braceDepth = 0;
        }
      }

      // Inside event callbacks, remap note property accesses
      if (inEventCallback && currentNoteParam && !funcMatch) {
        // noteParam.prop -> event.prop (if direct) or event.note.prop
        var noteParamEsc = currentNoteParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Replace noteParam.property accesses
        var propRegex = new RegExp("\\b" + noteParamEsc + "\\.(\\w+)", "g");
        line = line.replace(propRegex, function(match, prop) {
          if (codenameEventDirectProps[prop]) {
            return "event." + prop;
          }
          return "event.note." + prop;
        });
        // Replace bare noteParam references (not followed by .)
        var bareRegex = new RegExp("\\b" + noteParamEsc + "\\b(?!\\.)", "g");
        line = line.replace(bareRegex, "event.note");
      }

      // Remove game. prefix (Codename has direct access)
      line = line.replace(/\bgame\./g, "");

      // ClientPrefs.data.* -> comment (no Codename equivalent)
      if (/ClientPrefs\.data\.\w+/.test(line)) {
        var indent = line.match(/^(\s*)/)[1];
        line = indent + "// [Psych-specific] " + line.trim();
      }

      // PlayState.SONG.* -> comment
      if (/PlayState\.SONG\.\w+/.test(line)) {
        var indent = line.match(/^(\s*)/)[1];
        line = indent + "// [Psych-specific] " + line.trim();
      }

      // Psych-specific flow control constants
      if (/\bFunction_Stop\b/.test(line)) {
        line = line.replace(/\breturn\s+Function_Stop\s*;/, "event.cancel(); return;");
        line = line.replace(/\bFunction_Stop\b/g, "/* Function_Stop -> use event.cancel() */");
      }
      if (/\bFunction_StopAll\b/.test(line)) {
        line = line.replace(/\breturn\s+Function_StopAll\s*;/, "event.cancel(); return;");
        line = line.replace(/\bFunction_StopAll\b/g, "/* Function_StopAll -> use event.cancel() */");
      }
      // Function_Continue is the default in Codename (just don't cancel), remove it
      line = line.replace(/\breturn\s+Function_Continue\s*;/g, "// return; // Function_Continue is the default in Codename");
      line = line.replace(/\bFunction_Continue\b/g, "/* Function_Continue - default in Codename (no action needed) */");
      // Function_StopLua / Function_StopHScript are Psych-only script-type targeting
      line = line.replace(/\breturn\s+Function_StopLua\s*;/g, "// return Function_StopLua; // Psych-only: stops Lua scripts");
      line = line.replace(/\bFunction_StopLua\b/g, "/* Function_StopLua - Psych-only */");
      line = line.replace(/\breturn\s+Function_StopHScript\s*;/g, "// return Function_StopHScript; // Psych-only: stops HScript");
      line = line.replace(/\bFunction_StopHScript\b/g, "/* Function_StopHScript - Psych-only */");

      result.push(line);
    }

    return result.join("\n");
  }

  // --- Funkin HScript -> Psych HScript ---
  function funkinHxToPsychHx(code) {
    var lines = code.split("\n");
    var result = [];

    // Reverse arg callbacks mapping
    var funkinArgCallbacksReverse = {};
    for (var fk in psychToFunkinArgCallbacks) {
      funkinArgCallbacksReverse[fk] = psychToFunkinArgCallbacks[fk];
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Function declarations: strip extra args for Psych callbacks
      var funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var fname = funcMatch[2];
        if (funkinArgCallbacksReverse[fname]) {
          // Psych version has no args for these
          line = funcMatch[1] + "function " + fname + "() {";
        }
      }

      // Replace PlayState.instance. -> game.
      line = line.replace(/\bPlayState\.instance\./g, "game.");

      // Replace .playAnimation( -> .playAnim(
      line = line.replace(/\.playAnimation\s*\(/g, ".playAnim(");

      result.push(line);
    }

    return result.join("\n");
  }

  // --- Codename HScript -> Psych HScript ---
  function codenameHxToPsychHx(code) {
    var lines = code.split("\n");
    var result = [];
    var inEventCallback = false;
    var braceDepth = 0;
    var psychNoteParam = null;

    // Known bare identifiers that should get game. prefix
    var barePlayStateProps = [
      "health", "combo", "songScore", "misses",
      "camGame", "camHUD", "camOther",
      "boyfriend", "dad", "gf",
      "strumLines", "notes", "unspawnNotes",
      "defaultCamZoom", "songLength"
    ];

    // Known bare functions that need game. prefix
    var barePlayStateMethods = [
      "add", "remove", "insert"
    ];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Function declarations: rename callbacks
      var funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var fname = funcMatch[2];
        var args = funcMatch[3];
        var psName = codenameToPsychCallbacks[fname];
        if (psName) {
          // Track if this was an event callback for property remapping
          if (codenameEventCallbacks[fname] && args.trim() === "event") {
            if (psName === "goodNoteHit" || psName === "noteMiss" || psName === "opponentNoteHit") {
              psychNoteParam = "note";
              inEventCallback = true;
              braceDepth = 0;
              args = "note";
            } else {
              inEventCallback = false;
              psychNoteParam = null;
              args = "";
            }
          } else {
            inEventCallback = false;
            psychNoteParam = null;
          }
          // Strip curBeat/curStep for Psych (accessed as variable, not param)
          if (psName === "onBeatHit" || psName === "onStepHit") args = "";
          line = funcMatch[1] + "function " + psName + "(" + args + ") {";
        } else {
          inEventCallback = false;
          psychNoteParam = null;
        }
      }

      // Track brace depth for event callback scope
      if (inEventCallback) {
        var opens = (line.match(/\{/g) || []).length;
        var closes = (line.match(/\}/g) || []).length;
        braceDepth += opens - closes;
        if (braceDepth < 0) {
          inEventCallback = false;
          psychNoteParam = null;
          braceDepth = 0;
        }
      }

      // Inside event callbacks, remap event property accesses back to note
      if (inEventCallback && psychNoteParam && !funcMatch) {
        // event.note.prop -> note.prop
        line = line.replace(/\bevent\.note\.(\w+)/g, psychNoteParam + ".$1");
        // event.note (bare) -> note
        line = line.replace(/\bevent\.note\b(?!\.)/g, psychNoteParam);
        // event.direction -> note.noteData (Psych uses noteData)
        line = line.replace(/\bevent\.direction\b/g, psychNoteParam + ".noteData");
        // event.prop (direct event props) -> note.prop where applicable
        line = line.replace(/\bevent\.(noteType|animSuffix|player)\b/g, psychNoteParam + ".$1");
        // event.cancel() -> return Function_Stop;
        line = line.replace(/\bevent\.cancel\s*\(\s*\)\s*;?/g, "return Function_Stop;");
        // event.preventAnim() etc. -> comment
        line = line.replace(/\bevent\.(preventAnim|preventDeletion|preventVocalsUnmute|preventCamZooming|preventSustainClip|preventMissSound|preventResetCombo|preventStunned|preventVocalsMute)\s*\(\s*\)\s*;?/g,
          "// event.$1() - Codename-specific, adapt manually");
        // Remaining event.property -> comment
        line = line.replace(/\bevent\.(score|accuracy|healthGain|rating|showSplash|deleteNote|unmuteVocals|forceAnim|misses|muteVocals|missSound|missVolume|ghostMiss|gfSad|stunned|resetCombo|playMissSound)\b/g,
          "/* event.$1 - Codename event property */");
      }

      // event.cancel() outside event callbacks -> return Function_Stop;
      if (!inEventCallback) {
        line = line.replace(/\bevent\.cancel\s*\(\s*\)\s*;?/g, "return Function_Stop;");
      }

      // Add game. prefix to bare PlayState properties
      // Only match bare words that are NOT preceded by . or game. or var or function
      for (var p = 0; p < barePlayStateProps.length; p++) {
        var prop = barePlayStateProps[p];
        // Match bare prop NOT preceded by . or alphanumeric, NOT followed by ( for function-like usage
        var propRegex = new RegExp("(?<![.\\w])" + prop + "(?=\\s*[.\\[=;,)])", "g");
        line = line.replace(propRegex, "game." + prop);
      }

      // Add game. prefix to bare methods: add(x) -> game.add(x)
      for (var m = 0; m < barePlayStateMethods.length; m++) {
        var method = barePlayStateMethods[m];
        var methRegex = new RegExp("(?<![.\\w])" + method + "\\s*\\(", "g");
        line = line.replace(methRegex, "game." + method + "(");
      }

      result.push(line);
    }

    return result.join("\n");
  }

  // =============================================
  // CONVERSION ANALYSIS & ANNOTATION
  // =============================================

  function analyzeAndAnnotate(input, output, sourceLang, targetLang) {
    var inputLines = input.split('\n');
    var outputLines = output.split('\n');
    var issues = [];

    // Count meaningful input lines (non-empty, non-comment)
    var meaningfulLines = 0;
    for (var i = 0; i < inputLines.length; i++) {
      var t = inputLines[i].trim();
      if (!t) continue;
      if (sourceLang === 'lua' && /^--/.test(t)) continue;
      if (sourceLang !== 'lua' && /^\/\//.test(t)) continue;
      meaningfulLines++;
    }
    if (meaningfulLines === 0) meaningfulLines = 1;

    // Patterns in output indicating unconverted code needing manual work
    var annotationPatterns = [];
    if (sourceLang === 'lua') {
      annotationPatterns = [
        { regex: /\bstring\.(find|gsub|match|format|sub|rep|byte|char)\s*\(/i, msg: "Lua string library \u2014 use StringTools or ~/regex/ in HScript" },
        { regex: /\brequire\s*\(/, msg: "require() \u2014 use import or addHaxeLibrary() in HScript" },
        { regex: /\bpcall\s*\(/, msg: "pcall() \u2014 use try { } catch(e) { } in HScript" },
        { regex: /\bxpcall\s*\(/, msg: "xpcall() \u2014 use try { } catch(e) { } in HScript" },
        { regex: /\bsetmetatable\s*\(/, msg: "Metatables have no HScript equivalent" },
        { regex: /\bgetmetatable\s*\(/, msg: "Metatables have no HScript equivalent" },
        { regex: /\bunpack\s*\(/, msg: "unpack() \u2014 manually spread array elements in HScript" },
        { regex: /\bloadstring\s*\(/, msg: "loadstring() \u2014 use runHaxeCode() in Psych HScript" },
        { regex: /\brawget\s*\(|\brawset\s*\(/, msg: "rawget/rawset \u2014 not available in HScript" },
        { regex: /\bos\.\w+\s*[\(.]/, msg: "Lua os library \u2014 not available in FNF HScript" },
        { regex: /\bio\.\w+\s*[\(.]/, msg: "Lua io library \u2014 not available in FNF HScript" }
      ];
    }
    if (targetLang === 'lua') {
      annotationPatterns = annotationPatterns.concat([
        { regex: /^\s*import\s+\w/, msg: "import \u2014 not available in Lua; remove or use addHaxeLibrary()" },
        { regex: /\bswitch\s*\(/, msg: "switch/case \u2014 convert to if/elseif chain in Lua" },
        { regex: /\btry\s*\{/, msg: "try/catch \u2014 use pcall() in Lua" },
        { regex: /\bcatch\s*\(/, msg: "catch \u2014 use pcall() in Lua" }
      ]);
    }

    // Patterns in output that are auto-generated issue comments
    var issueMarkers = [
      { regex: /\/\/\s*\[Psych-specific\]/, sev: "warning", msg: "Psych-specific code with no equivalent in target engine" },
      { regex: /\/\/.*close\(\).*Lua-only/, sev: "warning", msg: "close() is Lua-only \u2014 HScript scripts are managed differently" },
      { regex: /\/\*\s*Function_Stop(Lua|HScript)\s*-\s*Psych/, sev: "warning", msg: "Psych-only script-type targeting" },
      { regex: /\/\*\s*Function_Stop\s*-\s*Psych/, sev: "warning", msg: "Psych-specific flow control \u2014 not available in target engine" },
      { regex: /\/\*\s*Function_StopAll\s*-\s*Psych/, sev: "warning", msg: "Psych-specific flow control \u2014 not available in target engine" },
      { regex: /\/\/.*return\s+Function_Stop;.*Psych-specific/, sev: "warning", msg: "Psych flow control \u2014 no Funkin equivalent" },
      { regex: /\/\/.*return\s+Function_Continue;.*Psych-specific/, sev: "info", msg: "Psych flow control commented" },
      { regex: /\/\/.*return\s+Function_Stop(Lua|HScript);.*Psych-only/, sev: "warning", msg: "Psych-only script targeting commented" },
      { regex: /event\.cancel\(\);\s*return;/, sev: "info", msg: "Flow control adapted: Function_Stop \u2192 event.cancel()" },
      { regex: /\/\*\s*Function_Stop\s*->/, sev: "info", msg: "Flow control adapted to event.cancel()" },
      { regex: /\/\*\s*Function_StopAll\s*->/, sev: "info", msg: "Flow control adapted to event.cancel()" },
      { regex: /\/\*\s*Function_Continue\s*-\s*(default|Psych)/, sev: "info", msg: "Function_Continue \u2014 default behavior, no action needed" },
      { regex: /\/\/\s*return;\s*\/\/\s*Function_Continue/, sev: "info", msg: "Function_Continue removed \u2014 default in Codename" },
      { regex: /\/\/\s*event\.\w+\(\)\s*-\s*Codename-specific/, sev: "warning", msg: "Codename event method \u2014 no Psych equivalent" },
      { regex: /\/\*\s*event\.\w+\s*-\s*Codename event property/, sev: "warning", msg: "Codename event property \u2014 adapt manually" }
    ];

    // Build annotated output and collect issues
    var annotatedLines = [];
    for (var i = 0; i < outputLines.length; i++) {
      var line = outputLines[i];
      var lineNum = i + 1;

      // Check annotation patterns only on non-comment lines
      if (!/^\s*\/\//.test(line)) {
        for (var p = 0; p < annotationPatterns.length; p++) {
          if (annotationPatterns[p].regex.test(line)) {
            var ind = (line.match(/^(\s*)/) || ['', ''])[1];
            annotatedLines.push(ind + '// \u26a0 ' + annotationPatterns[p].msg);
            issues.push({ line: lineNum, severity: 'warning', message: annotationPatterns[p].msg });
            break;
          }
        }
      }

      // Check issue markers in generated comments
      for (var m = 0; m < issueMarkers.length; m++) {
        if (issueMarkers[m].regex.test(line)) {
          issues.push({ line: lineNum, severity: issueMarkers[m].sev, message: issueMarkers[m].msg });
          break;
        }
      }

      annotatedLines.push(line);
    }

    // Group issues by message
    var groups = {};
    var warningLineSet = {};
    var totalWarnings = 0;
    var totalInfos = 0;
    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i];
      if (issue.severity === 'warning') {
        totalWarnings++;
        warningLineSet[issue.line] = true;
      } else {
        totalInfos++;
      }
      if (!groups[issue.message]) {
        groups[issue.message] = { severity: issue.severity, message: issue.message, lines: [] };
      }
      groups[issue.message].lines.push(issue.line);
    }
    var groupedIssues = [];
    for (var k in groups) {
      if (groups.hasOwnProperty(k)) groupedIssues.push(groups[k]);
    }
    groupedIssues.sort(function(a, b) {
      if (a.severity === b.severity) return 0;
      return a.severity === 'warning' ? -1 : 1;
    });

    // Confidence: unique warning lines vs meaningful input lines
    var uniqueWarningLines = 0;
    for (var k in warningLineSet) {
      if (warningLineSet.hasOwnProperty(k)) uniqueWarningLines++;
    }
    var confidence = Math.round(100 * Math.max(0, 1 - uniqueWarningLines / meaningfulLines));
    confidence = Math.max(0, Math.min(100, confidence));

    return {
      confidence: confidence,
      warnings: totalWarnings,
      infos: totalInfos,
      issues: groupedIssues,
      annotatedOutput: annotatedLines.join('\n')
    };
  }

  function displayAnalysis(analysis) {
    var el = document.getElementById('script-analysis');
    if (!el) return;
    el.style.display = 'block';

    var barEl = document.getElementById('script-confidence-bar');
    var textEl = document.getElementById('script-confidence-text');
    var summaryEl = document.getElementById('script-issue-summary');
    var detailsEl = document.getElementById('script-issue-details');
    var listEl = document.getElementById('script-issue-list');

    // Confidence bar
    var pct = analysis.confidence;
    barEl.style.width = pct + '%';
    barEl.style.background = pct >= 80 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#f44336';
    textEl.textContent = pct + '%';
    textEl.style.color = barEl.style.background;

    // Summary text
    var parts = [];
    if (analysis.warnings > 0) parts.push(analysis.warnings + ' warning' + (analysis.warnings !== 1 ? 's' : ''));
    if (analysis.infos > 0) parts.push(analysis.infos + ' note' + (analysis.infos !== 1 ? 's' : ''));
    summaryEl.textContent = parts.length ? parts.join(' \u00b7 ') + ' found' : 'No issues detected \u2014 output looks clean!';
    summaryEl.style.color = parts.length ? '' : '#4caf50';

    // Issue list
    listEl.innerHTML = '';
    if (analysis.issues.length === 0) {
      detailsEl.style.display = 'none';
      return;
    }
    detailsEl.style.display = '';
    for (var i = 0; i < analysis.issues.length; i++) {
      var issue = analysis.issues[i];
      var li = document.createElement('li');
      li.style.marginBottom = '0.25rem';
      var icon = issue.severity === 'warning' ? '\u26a0\ufe0f' : '\u2139\ufe0f';
      var lineText = issue.lines.length <= 3
        ? (issue.lines.length === 1 ? 'Line ' + issue.lines[0] : 'Lines ' + issue.lines.join(', '))
        : issue.lines.length + ' occurrences';
      var iconNode = document.createTextNode(icon + ' ');
      var strong = document.createElement('strong');
      strong.textContent = lineText + ': ';
      var msgNode = document.createTextNode(issue.message);
      li.appendChild(iconNode);
      li.appendChild(strong);
      li.appendChild(msgNode);
      listEl.appendChild(li);
    }
  }

  function clearAnalysis() {
    var el = document.getElementById('script-analysis');
    if (el) el.style.display = 'none';
  }

  // --- Report Issue ---
  var btnReport = document.getElementById("script-btn-report-issue");
  if (btnReport) {
    btnReport.addEventListener("click", function (e) {
      e.preventDefault();
      var src = sourceSelect.value;
      var tgt = targetSelect.value;
      var direction = (langLabels[src] || src) + " -> " + (langLabels[tgt] || tgt);

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
