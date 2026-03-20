// =============================================
// SCRIPT CONVERTER — LUA ↔ PSYCH HSCRIPT
// =============================================
// Core bidirectional conversion between Psych Lua and Psych HScript Iris.
// Depends on: script-converter-data.js (SC namespace)

(function () {
  var SC = window.ScriptConverter;

  // =============================================
  // LUA → PSYCH HSCRIPT
  // =============================================

  SC.luaToPsychHScript = function (raw) {
    var lines = raw.split("\n");
    var result = [];
    var declaredVars = {};
    var noteCallbackState = null;

    // Pre-scan: find tags used with setObjectOrder/getObjectOrder
    var orderTags = {};
    for (var k = 0; k < lines.length; k++) {
      var om = lines[k].match(/(?:setObjectOrder|getObjectOrder)\s*\(\s*'([^']+)'/);
      if (om) orderTags[om[1]] = true;
    }

    // Pre-scan: collect all precache calls grouped by type
    var precacheState = { images: [], sounds: [], musics: [], emitted: false };
    for (var k = 0; k < lines.length; k++) {
      var pc;
      pc = lines[k].trim().match(/^precacheImage\s*\(\s*'([^']+)'\s*\)/);
      if (pc) { precacheState.images.push(pc[1]); continue; }
      pc = lines[k].trim().match(/^precacheSound\s*\(\s*'([^']+)'\s*\)/);
      if (pc) { precacheState.sounds.push(pc[1]); continue; }
      pc = lines[k].trim().match(/^precacheMusic\s*\(\s*'([^']+)'\s*\)/);
      if (pc) { precacheState.musics.push(pc[1]); continue; }
    }

    // Pre-process: join multi-line if/elseif conditions into single lines
    // In Lua, if/elseif conditions can span multiple lines until 'then'
    for (var k = 0; k < lines.length; k++) {
      var trimK = lines[k].trim();
      if (/^(if|elseif)\s+/.test(trimK) && !/\bthen\s*$/.test(trimK) && !/\bend\s*$/.test(trimK)) {
        while (k + 1 < lines.length) {
          var nextTrim = lines[k + 1].trim();
          lines[k] = lines[k].trimEnd() + ' ' + nextTrim;
          lines.splice(k + 1, 1);
          if (/\bthen\s*$/.test(nextTrim)) break;
        }
      }
    }

    // Pre-process: convert Lua table syntax to HScript
    // In raw Lua, {} is always a table literal (code blocks use then/do...end)
    var tableStack = [];
    for (var k = 0; k < lines.length; k++) {
      var trimK = lines[k].trim();
      if (/^--/.test(trimK)) continue;

      var opens = (trimK.match(/\{/g) || []).length;
      var closes = (trimK.match(/\}/g) || []).length;
      var netOpen = opens - closes;

      if (netOpen > 0) {
        for (var n = 0; n < netOpen; n++) {
          var nextContent = '';
          for (var j = k + 1; j < lines.length; j++) {
            var trimJ = lines[j].trim();
            if (trimJ && !/^--/.test(trimJ)) { nextContent = trimJ; break; }
          }
          if (/^\w+\s*=\s/.test(nextContent)) {
            tableStack.push('struct');
          } else {
            tableStack.push('array');
            lines[k] = lines[k].replace(/\{(\s*)$/, '[$1');
          }
        }
      } else if (netOpen < 0) {
        for (var n = 0; n < -netOpen; n++) {
          if (tableStack.length > 0) {
            var type = tableStack.pop();
            if (type === 'array') {
              lines[k] = lines[k].replace(/\}/, ']');
            }
          }
        }
      }

      if (tableStack.length > 0 && tableStack[tableStack.length - 1] === 'struct') {
        if (/^\w+\s*=\s/.test(trimK) && !/^(if|elseif|local|return|for|while|function|end)\b/.test(trimK)) {
          lines[k] = lines[k].replace(/^(\s*\w+)\s*=/, '$1:');
        }
      }
    }

    var tableLiteralDepth = 0;
    var inBlockComment = false;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Track table/array literal depth from pre-processed lines
      // In pre-processed Lua, { } [ ] are ONLY table/array literals (code blocks use then/do/end)
      var preTrim = line.trim();

      // Track block comment state to avoid counting ]] as bracket closings
      if (/^--\[\[/.test(preTrim)) {
        inBlockComment = true;
      }
      if (inBlockComment) {
        if (/\]\]/.test(preTrim)) {
          inBlockComment = false;
        }
      } else if (!/^--/.test(preTrim)) {
        var noStrings = preTrim.replace(/'[^']*'|"[^"]*"/g, '');
        var tOpens = (noStrings.match(/[\[{]/g) || []).length;
        var tCloses = (noStrings.match(/[\]}]/g) || []).length;
        tableLiteralDepth += tOpens - tCloses;
      }

      var converted = convertLuaLine(line, declaredVars, orderTags, precacheState);

      // Inside table/array literals, suppress trailing semicolons
      if (tableLiteralDepth > 0) {
        converted = converted.replace(/;\s*$/, '');
      }

      // Detect note callback function declarations and remap parameters
      var funcMatch = converted.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var fname = funcMatch[2];
        var fieldMap = SC.luaNoteCallbackFields[fname];
        if (fieldMap) {
          var origParams = funcMatch[3].split(",").map(function(p) { return p.trim(); }).filter(function(p) { return p; });
          noteCallbackState = { paramMap: {}, depth: 0 };
          for (var j = 0; j < origParams.length && j < fieldMap.length; j++) {
            if (fieldMap[j]) {
              noteCallbackState.paramMap[origParams[j]] = fieldMap[j];
            } else {
              noteCallbackState.paramMap[origParams[j]] = "game.notes.members.indexOf(note)";
            }
          }
          converted = funcMatch[1] + "function " + fname + "(note) {";
        } else if (fname === "onCountdownTick") {
          var ctParams = funcMatch[3].trim();
          if (ctParams) {
            converted = funcMatch[1] + "function onCountdownTick(tick, " + ctParams + ") {";
          }
          noteCallbackState = null;
        } else {
          noteCallbackState = null;
        }
      }

      // Track brace depth inside note callbacks
      if (noteCallbackState !== null) {
        var opens = (converted.match(/\{/g) || []).length;
        var closes = (converted.match(/\}/g) || []).length;
        noteCallbackState.depth += opens - closes;
        if (noteCallbackState.depth <= 0) {
          noteCallbackState = null;
        } else if (!funcMatch) {
          for (var param in noteCallbackState.paramMap) {
            var regex = new RegExp("\\b" + param.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "g");
            converted = converted.replace(regex, noteCallbackState.paramMap[param]);
          }
        }
      }

      if (converted !== "__SKIP_LINE__") {
        result.push(converted);
      }
    }

    return result.join("\n");
  };

  function convertLuaLine(line, declaredVars, orderTags, precacheState) {
    var indent = line.match(/^(\s*)/)[1];
    var trimmed = line.trimEnd();
    var content = trimmed.trim();

    if (!content) return "";

    // Block comments --[[ ... ]]-- (closing can be ]], ]]-- or --]])
    if (/^--\[\[/.test(content)) return indent + "/*" + content.substring(4);
    if (/^--\]\]\s*$/.test(content)) return indent + "*/";
    if (/\]\](?:--?)?\s*$/.test(content)) return indent + content.replace(/\]\](?:--?)?\s*$/, "*/");

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

    // local function name(args) -> function name(args) { (HScript doesn't support local functions)
    var localFuncMatch = codeContent.match(/^local\s+function\s+(\w+)\s*\(([^)]*)\)\s*$/);
    if (localFuncMatch) return indent + "function " + localFuncMatch[1] + "(" + localFuncMatch[2] + ") {" + inlineComment;

    // function name(args) -> function name(args) {
    var funcMatch = codeContent.match(/^function\s+(\w+)\s*\(([^)]*)\)\s*$/);
    if (funcMatch) return indent + "function " + funcMatch[1] + "(" + funcMatch[2] + ") {" + inlineComment;

    // end -> }
    if (/^end\s*$/.test(codeContent)) return indent + "}" + inlineComment;

    // One-line if: if COND then BODY end -> if (COND) BODY;
    var oneLineIfMatch = codeContent.match(/^if\s+(.+?)\s+then\s+(.+?)\s+end\s*$/);
    if (oneLineIfMatch) {
      var cond = convertLuaExpr(oneLineIfMatch[1]);
      var body = oneLineIfMatch[2].trim();
      if (body === 'return') return indent + "if (" + cond + ") return;" + inlineComment;
      var retBodyMatch = body.match(/^return\s+(.+)$/);
      if (retBodyMatch) return indent + "if (" + cond + ") return " + convertLuaExpr(retBodyMatch[1]) + ";" + inlineComment;
      return indent + "if (" + cond + ") " + convertLuaExpr(body) + ";" + inlineComment;
    }

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
    if (retMatch) {
      var retVal = convertLuaExpr(retMatch[1]);
      var retSemi = /[\{\[,]\s*$/.test(retVal) ? "" : ";";
      return indent + "return " + retVal + retSemi + inlineComment;
    }
    if (/^return\s*$/.test(codeContent)) return indent + "return;" + inlineComment;

    // local var = value -> var var = value
    var localMatch = codeContent.match(/^local\s+(\w+)\s*=\s*(.+)$/);
    if (localMatch) {
      declaredVars[localMatch[1]] = true;
      var val = convertLuaExpr(localMatch[2]);
      var localSemi = /[\{\[,]\s*$/.test(val) ? "" : ";";
      return indent + "var " + localMatch[1] + " = " + val + localSemi + inlineComment;
    }

    // local var (no assignment)
    var localDeclMatch = codeContent.match(/^local\s+(\w+)\s*$/);
    if (localDeclMatch) {
      declaredVars[localDeclMatch[1]] = true;
      return indent + "var " + localDeclMatch[1] + ";" + inlineComment;
    }

    // API call conversions
    var apiConverted = convertLuaApiCall(codeContent, indent, orderTags, precacheState);
    if (apiConverted === "__SKIP_LINE__") return "__SKIP_LINE__";
    if (apiConverted !== null) return apiConverted + inlineComment;

    // Generic statement - convert expressions and add semicolon
    var converted = convertLuaExpr(codeContent);
    if (converted !== codeContent || /\w/.test(converted) || /^[\]}]\s*$/.test(codeContent)) {
      if (!/[{}\[;,]\s*$/.test(converted)) converted += ";";
      return indent + converted + inlineComment;
    }

    return indent + codeContent + inlineComment;
  }

  function convertLuaApiCall(content, indent, orderTags, precacheState) {
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
      if (orderTags && orderTags[m[1]]) return indent + "game.insert(game.members.indexOf(game.boyfriendGroup), " + m[1] + ");";
      return indent + "game.add(" + m[1] + ");";
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
    m = content.match(/^setObjectCamera\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) {
      var tag = m[1] || m[2];
      var cam = SC.cameraMap[m[3]] || "game." + m[3];
      return indent + tag + ".cameras = [" + cam + "];";
    }

    // addAnimationByPrefix(tag, name, prefix, fps, loop)
    m = content.match(/^addAnimationByPrefix\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(true|false)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.addByPrefix('" + m[2] + "', '" + m[3] + "', " + m[4] + ", " + m[5] + ");";

    // addAnimationByIndices(tag, name, prefix, indices, fps, loop)
    m = content.match(/^addAnimationByIndices\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.addByIndices('" + m[2] + "', '" + m[3] + "', [" + m[4] + "], '', " + m[5] + (m[6] ? ", " + m[6] : "") + ");";

    // playAnim(tag, anim, forced)
    m = content.match(/^playAnim\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.play('" + m[2] + "'" + (m[3] ? ", " + m[3] : "") + ");";

    // objectPlayAnimation(tag, anim, forced, type)
    m = content.match(/^objectPlayAnimation\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(true|false))?(?:,\s*\d+)?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.play('" + m[2] + "'" + (m[3] ? ", " + m[3] : "") + ");";

    // setProperty(var + '.prop', val) — dynamic tag concatenation
    m = content.match(/^setProperty\s*\(\s*(\w+)\s*(?:\+|\.\.)\s*'(\.[^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + m[2] + " = " + convertLuaValue(m[3].trim()) + ";";

    // setProperty(path, val)
    m = content.match(/^setProperty\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + "game." + m[1] + " = " + convertLuaValue(m[2].trim()) + ";";

    // getProperty(var + '.prop') — dynamic tag standalone (rare)
    m = content.match(/^getProperty\s*\(\s*(\w+)\s*(?:\+|\.\.)\s*'(\.[^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + m[2] + ";";

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
    m = content.match(/^setTextString\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + (m[1] || m[2]) + ".text = " + convertLuaValue(m[3].trim()) + ";";

    // setTextSize(tag, size)
    m = content.match(/^setTextSize\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + (m[1] || m[2]) + ".size = " + m[3].trim() + ";";

    // precacheImage / precacheSound / precacheMusic → grouped StringMap block
    m = content.match(/^precache(?:Image|Sound|Music)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) {
      if (precacheState && !precacheState.emitted) {
        precacheState.emitted = true;
        return buildPrecacheBlock(indent, precacheState);
      }
      return "__SKIP_LINE__";
    }

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

    // =============================================
    // GRAPHICS & SPRITES (additional)
    // =============================================

    // makeGraphic(tag, width, height, color)
    m = content.match(/^makeGraphic\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*'([^']*)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".makeGraphic(" + m[2].trim() + ", " + m[3].trim() + ", FlxColor.fromString('#" + m[4].trim() + "'));";    m = content.match(/^makeGraphic\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*(\w+)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".makeGraphic(" + m[2].trim() + ", " + m[3].trim() + ", FlxColor.fromString('#' + " + m[4].trim() + "));";    // makeGraphic with no color
    m = content.match(/^makeGraphic\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".makeGraphic(" + m[2].trim() + ", " + m[3].trim() + ");";    

    // loadGraphic(obj, image, gridX, gridY)
    m = content.match(/^loadGraphic\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(.+?)\s*,\s*(.+?))?\s*\)\s*;?\s*$/);
    if (m) {
      if (m[3] && m[4]) return indent + m[1] + ".loadGraphic(Paths.image('" + m[2] + "'), true, " + m[3].trim() + ", " + m[4].trim() + ");";
      return indent + m[1] + ".loadGraphic(Paths.image('" + m[2] + "'));";
    }

    // loadFrames(obj, image, spriteType)
    m = content.match(/^loadFrames\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) {
      var atlas = (m[3] && m[3].toLowerCase() === 'packer') ? 'getPackerAtlas' : 'getSparrowAtlas';
      return indent + m[1] + ".frames = Paths." + atlas + "('" + m[2] + "');";
    }

    // setGraphicSize(obj, x, y, updateHitbox)
    m = content.match(/^setGraphicSize\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      var hb = (m[4] !== 'false') ? '\n' + indent + m[1] + '.updateHitbox();' : '';
      return indent + m[1] + '.setGraphicSize(' + m[2].trim() + ', ' + m[3].trim() + ');' + hb;
    }

    // updateHitbox(obj)
    m = content.match(/^updateHitbox\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.updateHitbox();';

    // setBlendMode(obj, blend)
    m = content.match(/^setBlendMode\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.blend = ' + m[2].toUpperCase() + ';';

    // getObjectOrder(obj, group)
    m = content.match(/^getObjectOrder\s*\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.members.indexOf(' + m[1] + ');';

    // setObjectOrder(obj, position, group)
    m = content.match(/^setObjectOrder\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.remove(' + m[1] + ');\n' + indent + 'game.insert(' + m[2].trim() + ', ' + m[1] + ');';

    // objectsOverlap(obj1, obj2)
    m = content.match(/^objectsOverlap\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.overlap(' + m[1] + ', ' + m[2] + ');';

    // =============================================
    // ANIMATION (additional)
    // =============================================

    // addAnimation(obj, name, frames, fps, loop)
    m = content.match(/^addAnimation\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*\{(.+?)\}\s*,\s*(\d+)\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.add('" + m[2] + "', [" + m[3] + "], " + m[4] + (m[5] ? ", " + m[5] : "") + ");";

    // addOffset(obj, anim, x, y)
    m = content.match(/^addOffset\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".addOffset('" + m[2] + "', " + m[3].trim() + ", " + m[4].trim() + ");";

    // =============================================
    // TEXT OBJECTS (additional)
    // =============================================

    // makeLuaText(tag, text, width, x, y)
    m = content.match(/^makeLuaText\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) { var tag = m[1] || m[2]; return indent + 'var ' + tag + ' = new FlxText(' + m[5].trim() + ', ' + m[6].trim() + ', ' + m[4].trim() + ', ' + convertLuaValue(m[3].trim()) + ');'; }

    // addLuaText(tag)
    m = content.match(/^addLuaText\s*\(\s*(?:'([^']+)'|(\w+))\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.add(' + (m[1] || m[2]) + ');';

    // removeLuaText(tag, destroy)
    m = content.match(/^removeLuaText\s*\(\s*(?:'([^']+)'|(\w+))\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.remove(' + (m[1] || m[2]) + ');';

    // setTextBorder(tag, size, color, style)
    m = content.match(/^setTextBorder\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*,\s*(?:'([^']+)'|(\w[\w.]*))\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) {
      var tag = m[1] || m[2];
      var color = m[4] ? "FlxColor.fromString('#" + m[4] + "')" : "FlxColor.fromString('#' + " + m[5] + ")";
      var style = (m[6] || 'outline').toUpperCase().replace(/ /g, '_');
      return indent + tag + '.borderStyle = ' + style + ';\n' + indent + tag + '.borderSize = ' + m[3].trim() + ';\n' + indent + tag + '.borderColor = ' + color + ';';
    }

    // setTextColor(tag, color)
    m = content.match(/^setTextColor\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var tag = m[1] || m[2];
      var colorArg = m[3].trim();
      var colorVal = /^'[^']*'$/.test(colorArg) ? "FlxColor.fromString(" + colorArg + ")" : "FlxColor.fromString(" + colorArg + ")";
      return indent + tag + ".color = " + colorVal + ";";
    }

    // setTextFont(tag, font)
    m = content.match(/^setTextFont\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var tag = m[1] || m[2];
      var fontArg = m[3].trim();
      var fontVal = /^'[^']*'$/.test(fontArg) ? "Paths.font(" + fontArg + ")" : "Paths.font(" + fontArg + ")";
      return indent + tag + ".font = " + fontVal + ";";
    }

    // setTextItalic(tag, italic)
    m = content.match(/^setTextItalic\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(true|false)\s*\)\s*;?\s*$/);
    if (m) return indent + (m[1] || m[2]) + '.italic = ' + m[3] + ';';

    // setTextAlignment(tag, alignment)
    m = content.match(/^setTextAlignment\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var alignArg = m[3].trim();
      // Convert string alignment to FlxTextAlign enum
      var alignVal = /^['"]/.test(alignArg) ? alignArg.replace(/^['"]|['"]$/g, '').toUpperCase() : alignArg;
      return indent + (m[1] || m[2]) + ".alignment = " + alignVal + ";";
    }

    // setTextWidth(tag, width)
    m = content.match(/^setTextWidth\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + (m[1] || m[2]) + '.fieldWidth = ' + m[3].trim() + ';';

    // setTextAutoSize(tag, value)
    m = content.match(/^setTextAutoSize\s*\(\s*(?:'([^']+)'|(\w+))\s*,\s*(true|false)\s*\)\s*;?\s*$/);
    if (m) return indent + (m[1] || m[2]) + '.autoSize = ' + m[3] + ';';

    // =============================================
    // TWEENING (additional)
    // =============================================

    // doTweenZoom(tag, camera, value, duration, ease)
    m = content.match(/^doTweenZoom\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) {
      var cam = SC.cameraMap[m[2]] || 'game.' + m[2];
      var easeStr = m[5] ? ', {ease: FlxEase.' + m[5] + '}' : '';
      return indent + 'FlxTween.tween(' + cam + ', {zoom: ' + m[3].trim() + '}, ' + m[4].trim() + easeStr + ');';
    }

    // noteTweenX/Y/Angle/Alpha/Direction(tag, note, value, duration, ease)
    m = content.match(/^noteTween(X|Y|Angle|Alpha|Direction)\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) {
      var prop = { X: 'x', Y: 'y', Angle: 'angle', Alpha: 'alpha', Direction: 'direction' }[m[1]];
      var easeStr = m[6] ? ', {ease: FlxEase.' + m[6] + '}' : '';
      return indent + 'FlxTween.tween(game.strumLineNotes.members[' + m[3].trim() + '], {' + prop + ': ' + m[4].trim() + '}, ' + m[5].trim() + easeStr + ');';
    }

    // startTween(tag, obj, values, duration, options)
    m = content.match(/^startTween\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*\{(.+?)\}\s*,\s*(.+?)\s*(?:,\s*\{(.+?)\})?\s*\)\s*;?\s*$/);
    if (m) {
      var easeOpt = '';
      if (m[5]) {
        var easeM = m[5].match(/ease\s*[:=]\s*'([^']+)'/);
        if (easeM) easeOpt = ', {ease: FlxEase.' + easeM[1] + '}';
      }
      return indent + 'FlxTween.tween(game.' + m[2] + ', {' + m[3] + '}, ' + m[4].trim() + easeOpt + ');';
    }

    // cancelTween(tag)
    m = content.match(/^cancelTween\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + '// cancelTween - In HScript, store tween reference: var ' + m[1] + ' = FlxTween.tween(...); then ' + m[1] + '.cancel();';

    // =============================================
    // TIMERS
    // =============================================

    // runTimer(tag, time, loops)
    m = content.match(/^runTimer\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'new FlxTimer().start(' + m[2].trim() + ', function(tmr) { /* onTimerCompleted: \'' + m[1] + '\' */ }, ' + m[3].trim() + ');';

    // cancelTimer(tag)
    m = content.match(/^cancelTimer\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + '// cancelTimer - In HScript, store timer reference: var ' + m[1] + ' = new FlxTimer().start(...); then ' + m[1] + '.cancel();';

    // =============================================
    // SOUND & MUSIC
    // =============================================

    // playSound(sound, volume, tag, loop)
    m = content.match(/^playSound\s*\(\s*'([^']+)'\s*(?:,\s*([^,)]+?))?\s*(?:,\s*'([^']*)')?\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      var vol = m[2] ? m[2].trim() : '1';
      return indent + 'FlxG.sound.play(Paths.sound(\'' + m[1] + '\'), ' + vol + ');';
    }

    // playMusic(sound, volume, loop)
    m = content.match(/^playMusic\s*\(\s*'([^']+)'\s*(?:,\s*([^,)]+?))?\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      var vol = m[2] ? m[2].trim() : '1';
      var loop = m[3] || 'true';
      return indent + 'FlxG.sound.playMusic(Paths.music(\'' + m[1] + '\'), ' + vol + ', ' + loop + ');';
    }

    // stopSound/pauseSound/resumeSound(tag)
    m = content.match(/^(stop|pause|resume)Sound\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + '// ' + m[1] + 'Sound(\'' + m[2] + '\') - In HScript, store sound reference and call .' + m[1] + '();';

    // soundFadeIn(tag, duration, from, to)
    m = content.match(/^soundFadeIn\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.sound.music.fadeIn(' + m[2].trim() + ', ' + m[3].trim() + ', ' + m[4].trim() + '); // tag: ' + m[1];

    // soundFadeOut(tag, duration, to)
    m = content.match(/^soundFadeOut\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.sound.music.fadeOut(' + m[2].trim() + ', ' + m[3].trim() + '); // tag: ' + m[1];

    // soundFadeCancel(tag)
    m = content.match(/^soundFadeCancel\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + '// soundFadeCancel(\'' + m[1] + '\') - cancel fade on stored sound reference';

    // setSoundVolume/setSoundTime/setSoundPitch(tag, value)
    m = content.match(/^setSound(Volume|Time|Pitch)\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var prop = { Volume: 'volume', Time: 'time', Pitch: 'pitch' }[m[1]];
      return indent + '// setSoundVolume - In HScript, use stored sound reference.' + prop + ' = ' + m[3].trim() + ';';
    }

    // =============================================
    // CAMERA
    // =============================================

    // cameraSetTarget(target)
    m = content.match(/^cameraSetTarget\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.moveCamera(' + (m[1] === 'dad' ? 'true' : 'false') + ');';

    // cameraShake(camera, intensity, duration)
    m = content.match(/^cameraShake\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var cam = SC.cameraMap[m[1]] || 'game.' + m[1];
      return indent + cam + '.shake(' + m[2].trim() + ', ' + m[3].trim() + ');';
    }

    // cameraFlash(camera, color, duration, forced)
    m = content.match(/^cameraFlash\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(true|false)\s*\)\s*;?\s*$/);
    if (m) {
      var cam = SC.cameraMap[m[1]] || 'game.' + m[1];
      return indent + cam + ".flash(FlxColor.fromString('#" + m[2] + "'), " + m[3].trim() + ', null, ' + m[4] + ');';
    }

    // cameraFade(camera, color, duration, forced, fadeOut)
    m = content.match(/^cameraFade\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(true|false)\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      var cam = SC.cameraMap[m[1]] || 'game.' + m[1];
      var fadeOut = m[5] || 'false';
      return indent + cam + ".fade(FlxColor.fromString('#" + m[2] + "'), " + m[3].trim() + ', ' + fadeOut + ', null, ' + m[4] + ');';
    }

    // setCameraScroll(x, y)
    m = content.match(/^setCameraScroll\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.camera.scroll.set(' + m[1].trim() + ', ' + m[2].trim() + ');';

    // setCameraFollowPoint(x, y)
    m = content.match(/^setCameraFollowPoint\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.camFollow.set(' + m[1].trim() + ', ' + m[2].trim() + ');';

    // addCameraScroll(x, y)
    m = content.match(/^addCameraScroll\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.camera.scroll.add(' + m[1].trim() + ', ' + m[2].trim() + ');';

    // addCameraFollowPoint(x, y)
    m = content.match(/^addCameraFollowPoint\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.camFollow.add(' + m[1].trim() + ', ' + m[2].trim() + ');';

    // =============================================
    // SCORE, HEALTH & RATING
    // =============================================

    // addScore(value)
    m = content.match(/^addScore\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.songScore += ' + m[1].trim() + ';';

    // setScore(value)
    m = content.match(/^setScore\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.songScore = ' + m[1].trim() + ';';

    // addMisses(value)
    m = content.match(/^addMisses\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.songMisses += ' + m[1].trim() + ';';

    // setMisses(value)
    m = content.match(/^setMisses\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.songMisses = ' + m[1].trim() + ';';

    // addHits(value)
    m = content.match(/^addHits\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.songHits += ' + m[1].trim() + ';';

    // setHits(value)
    m = content.match(/^setHits\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.songHits = ' + m[1].trim() + ';';

    // addHealth(value)
    m = content.match(/^addHealth\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.health += ' + m[1].trim() + ';';

    // setHealth(value)
    m = content.match(/^setHealth\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.health = ' + m[1].trim() + ';';

    // setRatingPercent(value)
    m = content.match(/^setRatingPercent\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.ratingPercent = ' + m[1].trim() + ';';

    // setRatingName(value)
    m = content.match(/^setRatingName\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.ratingName = ' + convertLuaValue(m[1].trim()) + ';';

    // setRatingFC(value)
    m = content.match(/^setRatingFC\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.ratingFC = ' + convertLuaValue(m[1].trim()) + ';';

    // updateScoreText()
    m = content.match(/^updateScoreText\s*\(\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.updateScoreText();';

    // setHealthBarColors(left, right)
    m = content.match(/^setHealthBarColors\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "game.healthBar.setColors(FlxColor.fromString('#" + m[1] + "'), FlxColor.fromString('#" + m[2] + "'));";

    // setTimeBarColors(left, right)
    m = content.match(/^setTimeBarColors\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "game.timeBar.setColors(FlxColor.fromString('#" + m[1] + "'), FlxColor.fromString('#" + m[2] + "'));";

    // =============================================
    // DEBUG
    // =============================================

    // debugPrint(text, color)
    m = content.match(/^debugPrint\s*\(\s*(.+?)\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + 'debugPrint(' + convertLuaValue(m[1].trim()) + (m[2] ? ", FlxColor.fromString('" + m[2] + "')" : '') + ');';

    // =============================================
    // PROPERTY ACCESS (additional)
    // =============================================

    // getPropertyFromClass(class, var)
    m = content.match(/^getPropertyFromClass\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.' + m[2] + ';';

    // setPropertyFromClass(class, var, val)
    m = content.match(/^setPropertyFromClass\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.' + m[2] + ' = ' + convertLuaValue(m[3].trim()) + ';';

    // callMethodFromClass(class, func, args)
    m = content.match(/^callMethodFromClass\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*\{(.+?)\})?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.' + m[2] + '(' + (m[3] ? m[3].trim() : '') + ');';

    // createInstance(varToSave, className, args)
    m = content.match(/^createInstance\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*\{(.+?)\})?\s*\)\s*;?\s*$/);
    if (m) {
      var cls = m[2].split('.').pop();
      return indent + 'var ' + m[1] + ' = new ' + cls + '(' + (m[3] ? m[3].trim() : '') + ');';
    }

    // addInstance(objName, inFront)
    m = content.match(/^addInstance\s*\(\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      if (orderTags && orderTags[m[1]]) return indent + 'game.insert(game.members.indexOf(game.boyfriendGroup), ' + m[1] + ');';
      return indent + 'game.add(' + m[1] + ');';
    }

    // addToGroup(group, tag, index)
    m = content.match(/^addToGroup\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(.+?))?\s*\)\s*;?\s*$/);
    if (m) {
      if (m[3]) return indent + 'game.' + m[1] + '.insert(' + m[3].trim() + ', ' + m[2] + ');';
      return indent + 'game.' + m[1] + '.add(' + m[2] + ');';
    }

    // removeFromGroup(group, index, tag, destroy)
    m = content.match(/^removeFromGroup\s*\(\s*'([^']+)'\s*(?:,\s*(.+?))?\s*(?:,\s*'([^']*)')?\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      if (m[3]) return indent + 'game.' + m[1] + '.remove(' + m[3] + ');';
      return indent + 'game.' + m[1] + '.remove(game.' + m[1] + '.members[' + (m[2] || '0').trim() + ']);';
    }

    // =============================================
    // GAME FLOW
    // =============================================

    // startCountdown()
    m = content.match(/^startCountdown\s*\(\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.startCountdown();';

    // endSong()
    m = content.match(/^endSong\s*\(\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.endSong();';

    // restartSong(skipTransition)
    m = content.match(/^restartSong\s*\(\s*(true|false)?\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.restartSong(' + (m[1] || '') + ');';

    // exitSong(skipTransition)
    m = content.match(/^exitSong\s*\(\s*(true|false)?\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.exitSong(' + (m[1] || '') + ');';

    // loadSong(name, difficultyNum)
    m = content.match(/^loadSong\s*\(\s*'([^']+)'\s*(?:,\s*(\d+))?\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.loadSong(\'' + m[1] + '\'' + (m[2] ? ', ' + m[2] : '') + ');';

    // =============================================
    // CHARACTER (additional)
    // =============================================

    // addCharacterToList(name, type)
    m = content.match(/^addCharacterToList\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "game.addCharacterToList('" + m[1] + "', '" + m[2] + "');";

    // precacheSound/precacheMusic are handled by the grouped precache block above

    // =============================================
    // CUSTOM SUBSTATES
    // =============================================

    // openCustomSubstate(name, pauseGame)
    m = content.match(/^openCustomSubstate\s*\(\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + "game.openSubState(new CustomSubstate('" + m[1] + "'" + (m[2] ? ', ' + m[2] : '') + '));';

    // closeCustomSubstate()
    m = content.match(/^closeCustomSubstate\s*\(\s*\)\s*;?\s*$/);
    if (m) return indent + 'game.closeSubState();';

    // insertToCustomSubstate(tag, pos)
    m = content.match(/^insertToCustomSubstate\s*\(\s*'([^']+)'\s*(?:,\s*(.+?))?\s*\)\s*;?\s*$/);
    if (m) {
      if (m[2]) return indent + 'customSubstate.insert(' + m[2].trim() + ', ' + m[1] + ');';
      return indent + 'customSubstate.add(' + m[1] + ');';
    }

    // =============================================
    // DIALOGUE & VIDEO
    // =============================================

    // startDialogue(dialogueFile, music)
    m = content.match(/^startDialogue\s*\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + "game.startDialogue('" + m[1] + "'" + (m[2] ? ", '" + m[2] + "'" : '') + ');';

    // startVideo(videoFile, canSkip)
    m = content.match(/^startVideo\s*\(\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + "game.startVideo('" + m[1] + "');";

    // =============================================
    // SHADERS
    // =============================================

    // initLuaShader(name)
    m = content.match(/^initLuaShader\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "// initLuaShader - In HScript: var shader = new FlxRuntimeShader(Paths.getTextFromFile('shaders/" + m[1] + ".frag'));";

    // setSpriteShader(obj, shader)
    m = content.match(/^setSpriteShader\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".shader = new FlxRuntimeShader(Paths.getTextFromFile('shaders/" + m[2] + ".frag'));";

    // removeSpriteShader(obj)
    m = content.match(/^removeSpriteShader\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.shader = null;';

    // setShaderFloat/Int/Bool(obj, prop, value)
    m = content.match(/^setShader(Float|Int|Bool)\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[2] + '.shader.data.' + m[3] + '.value = [' + m[4].trim() + '];';

    // setShaderFloatArray/IntArray/BoolArray(obj, prop, values)
    m = content.match(/^setShader(Float|Int|Bool)Array\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[2] + '.shader.data.' + m[3] + '.value = ' + m[4].trim() + ';';

    // setShaderSampler2D(obj, prop, bitmapPath)
    m = content.match(/^setShaderSampler2D\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.shader.data.' + m[2] + '.input = Paths.image(\'' + m[3] + '\');';

    // =============================================
    // HSCRIPT INTEROP
    // =============================================

    // runHaxeCode(code)
    m = content.match(/^runHaxeCode\s*\(\s*(.+)\s*\)\s*;?\s*$/);
    if (m) return indent + '// runHaxeCode() - Lua-only interop. In HScript, write the Haxe code directly.';

    // runHaxeFunction(func, args)
    m = content.match(/^runHaxeFunction\s*\(\s*'([^']+)'\s*(?:,\s*\{(.+?)\})?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '(' + (m[2] ? m[2].trim() : '') + ');';

    // addHaxeLibrary(lib, package)
    m = content.match(/^addHaxeLibrary\s*\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) {
      if (m[2]) return indent + "import('" + m[2] + '.' + m[1] + "');";
      return indent + "import('" + m[1] + "');";
    }

    // =============================================
    // INTER-SCRIPT COMMUNICATION
    // =============================================

    // setVar(name, value) / getVar(name) — available in HScript directly
    m = content.match(/^setVar\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + "setVar('" + m[1] + "', " + convertLuaValue(m[2].trim()) + ');';

    // setOnScripts/setOnLuas/setOnHScript(varName, value)
    m = content.match(/^(setOnScripts|setOnLuas|setOnHScript)\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + "('" + m[2] + "', " + convertLuaValue(m[3].trim()) + ');';

    // callOnScripts/callOnLuas/callOnHScript(funcName, args)
    m = content.match(/^(callOnScripts|callOnLuas|callOnHScript)\s*\(\s*'([^']+)'\s*(?:,\s*\{(.+?)\})?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + "('" + m[2] + "'" + (m[3] ? ', [' + m[3] + ']' : '') + ');';

    // addLuaScript/addHScript/removeLuaScript/removeHScript(file)
    m = content.match(/^(addLuaScript|addHScript|removeLuaScript|removeHScript)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + "('" + m[2] + "');";

    // =============================================
    // SAVE DATA
    // =============================================

    // initSaveData(name, folder)
    m = content.match(/^initSaveData\s*\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + "// initSaveData('" + m[1] + "') - Lua-only save system. In HScript, use FlxG.save or a custom FlxSave instance.";

    // setDataFromSave(name, field, value)
    m = content.match(/^setDataFromSave\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + '// setDataFromSave - In HScript: FlxG.save.data.' + m[2] + ' = ' + convertLuaValue(m[3].trim()) + ';';

    // flushSaveData(name)
    m = content.match(/^flushSaveData\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.save.flush();';

    // eraseSaveData(name)
    m = content.match(/^eraseSaveData\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.save.erase();';

    // =============================================
    // FILE I/O
    // =============================================

    // saveFile(path, content, absolute)
    m = content.match(/^saveFile\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + "File.saveContent('" + m[1] + "', " + convertLuaValue(m[2].trim()) + ');';

    // deleteFile(path)
    m = content.match(/^deleteFile\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "FileSystem.deleteFile('" + m[1] + "');";

    // =============================================
    // INPUT (keyboard — available in HScript directly)
    // =============================================

    // keyboardJustPressed/keyboardPressed/keyboardReleased(name) — available in HScript
    m = content.match(/^(keyboardJustPressed|keyboardPressed|keyboardReleased)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + "('" + m[2] + "');";

    // keyJustPressed/keyPressed/keyReleased(name) — available in HScript
    m = content.match(/^(keyJustPressed|keyPressed|keyReleased)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + "('" + m[2] + "');";

    // =============================================
    // MOUSE INPUT
    // =============================================

    // mouseClicked/mousePressed/mouseReleased(button)
    m = content.match(/^(mouseClicked|mousePressed|mouseReleased)\s*\(\s*'?([^')]*)'?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + "('" + (m[2] || 'left') + "');";

    // =============================================
    // STRING UTILITIES (standalone calls)
    // =============================================

    // stringStartsWith/stringEndsWith/stringSplit/stringTrim — usually inline, but handle standalone
    m = content.match(/^(stringStartsWith|stringEndsWith)\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) {
      var method = m[1] === 'stringStartsWith' ? 'startsWith' : 'endsWith';
      return indent + 'StringTools.' + method + '(' + convertLuaValue(m[2].trim()) + ', ' + convertLuaValue(m[3].trim()) + ');';
    }

    // =============================================
    // RANDOMIZATION (standalone calls)
    // =============================================

    // getRandomInt(min, max, exclude)
    m = content.match(/^getRandomInt\s*\(\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*(.+?))?\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.random.int(' + m[1].trim() + ', ' + m[2].trim() + ');';

    // getRandomFloat(min, max, exclude)
    m = content.match(/^getRandomFloat\s*\(\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*(.+?))?\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.random.float(' + m[1].trim() + ', ' + m[2].trim() + ');';

    // getRandomBool(chance)
    m = content.match(/^getRandomBool\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + 'FlxG.random.bool(' + m[1].trim() + ');';

    // =============================================
    // COLOR UTILITIES (standalone)
    // =============================================

    // FlxColor/getColorFromHex/getColorFromName/getColorFromString — usually inline
    m = content.match(/^(FlxColor|getColorFromHex|getColorFromName|getColorFromString)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + "FlxColor.fromString('" + m[2] + "');";

    // =============================================
    // POSITION HELPERS (standalone)
    // =============================================

    // getMidpointX/Y(obj)
    m = content.match(/^getMidpoint(X|Y)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[2] + '.getMidpoint().' + m[1].toLowerCase() + ';';

    // getGraphicMidpointX/Y(obj)
    m = content.match(/^getGraphicMidpoint(X|Y)\s*\(\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) return indent + m[2] + '.getGraphicMidpoint().' + m[1].toLowerCase() + ';';

    // getScreenPositionX/Y(obj, camera)
    m = content.match(/^getScreenPosition(X|Y)\s*\(\s*'([^']+)'\s*(?:,\s*'([^']*)')?\s*\)\s*;?\s*$/);
    if (m) return indent + m[2] + '.getScreenPosition().' + m[1].toLowerCase() + ';';

    // =============================================
    // DISCORD
    // =============================================

    // changeDiscordPresence(details, state, ...)
    m = content.match(/^changeDiscordPresence\s*\(\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + '// changeDiscordPresence(' + m[1].trim() + ') - Use DiscordClient.changePresence() in HScript;';

    // =============================================
    // DEPRECATED FUNCTION REDIRECTS
    // =============================================

    // characterPlayAnim(char, anim, forced)
    m = content.match(/^characterPlayAnim\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) {
      var charRef = { bf: 'game.boyfriend', boyfriend: 'game.boyfriend', dad: 'game.dad', gf: 'game.gf', girlfriend: 'game.gf' }[m[1]] || 'game.' + m[1];
      return indent + charRef + ".playAnim('" + m[2] + "'" + (m[3] ? ', ' + m[3] : '') + ');';
    }

    // luaSpriteMakeGraphic(tag, width, height, color)
    m = content.match(/^luaSpriteMakeGraphic\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*,\s*'?([^')]*)'?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".makeGraphic(" + m[2].trim() + ", " + m[3].trim() + ", FlxColor.fromString('#" + m[4].trim() + "'));";

    // luaSpriteAddAnimationByPrefix → same as addAnimationByPrefix
    m = content.match(/^luaSpriteAddAnimationByPrefix\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(true|false)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.addByPrefix('" + m[2] + "', '" + m[3] + "', " + m[4] + ", " + m[5] + ");";

    // luaSpritePlayAnimation → same as playAnim
    m = content.match(/^luaSpritePlayAnimation\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + ".animation.play('" + m[2] + "'" + (m[3] ? ', ' + m[3] : '') + ');';

    // setLuaSpriteCamera → same as setObjectCamera
    m = content.match(/^setLuaSpriteCamera\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)\s*;?\s*$/);
    if (m) {
      var cam = SC.cameraMap[m[2]] || 'game.' + m[2];
      return indent + m[1] + '.cameras = [' + cam + '];';
    }

    // setLuaSpriteScrollFactor → same as setScrollFactor
    m = content.match(/^setLuaSpriteScrollFactor\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.scrollFactor.set(' + m[2].trim() + ', ' + m[3].trim() + ');';

    // scaleLuaSprite → same as scaleObject
    m = content.match(/^scaleLuaSprite\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;?\s*$/);
    if (m) return indent + m[1] + '.scale.set(' + m[2].trim() + ', ' + m[3].trim() + ');\n' + indent + m[1] + '.updateHitbox();';

    return null;
  }

  function buildPrecacheBlock(indent, state) {
    var lines = [];
    if (state.images.length > 0) {
      lines.push(indent + "// Precache images");
      lines.push(indent + "var _cachedImages = new haxe.ds.StringMap();");
      for (var i = 0; i < state.images.length; i++) {
        lines.push(indent + "_cachedImages.set('" + state.images[i] + "', Paths.image('" + state.images[i] + "'));");
      }
    }
    if (state.sounds.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push(indent + "// Precache sounds");
      lines.push(indent + "var _cachedSounds = new haxe.ds.StringMap();");
      for (var i = 0; i < state.sounds.length; i++) {
        lines.push(indent + "_cachedSounds.set('" + state.sounds[i] + "', Paths.sound('" + state.sounds[i] + "'));");
      }
    }
    if (state.musics.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push(indent + "// Precache music");
      lines.push(indent + "var _cachedMusic = new haxe.ds.StringMap();");
      for (var i = 0; i < state.musics.length; i++) {
        lines.push(indent + "_cachedMusic.set('" + state.musics[i] + "', Paths.music('" + state.musics[i] + "'));");
      }
    }
    return lines.join("\n");
  }

  function convertLuaExpr(expr) {
    // getProperty inline (dynamic tag concatenation)
    expr = expr.replace(/getProperty\s*\(\s*(\w+)\s*(?:\+|\.\.)\s*'(\.[^']+)'\s*\)/g, "$1$2");

    // getProperty inline
    expr = expr.replace(/getProperty\s*\(\s*'([^']+)'\s*\)/g, "game.$1");

    // getPropertyFromGroup inline
    expr = expr.replace(/getPropertyFromGroup\s*\(\s*'([^']+)'\s*,\s*(.+?)\s*,\s*'([^']+)'\s*\)/g, "game.$1.members[$2].$3");

    // String concatenation .. to +
    expr = expr.replace(/\s*\.\.\s*/g, " + ");

    // Not equal ~= to !=
    expr = expr.replace(/~=/g, "!=");

    // Lua ternary idiom: COND and VALUE or FALLBACK -> (COND) ? VALUE : FALLBACK
    // Must run BEFORE and/or -> &&/|| conversion
    var ternaryMatch = expr.match(/^(.+?)\s+and\s+(.+?)\s+or\s+((?:(?!\band\b|\bor\b).)+)$/);
    if (ternaryMatch) {
      var tCond = ternaryMatch[1];
      var tTrue = ternaryMatch[2];
      var tFalse = ternaryMatch[3];
      // Only convert if the value parts don't contain further and/or (i.e. simple ternary)
      if (!/\b(?:and|or)\b/.test(tTrue) && !/\b(?:and|or)\b/.test(tFalse)) {
        return "(" + convertLuaExpr(tCond) + ") ? (" + convertLuaExpr(tTrue) + ") : (" + convertLuaExpr(tFalse) + ")";
      }
    }

    // Boolean operators
    expr = expr.replace(/\bnot\s+/g, "!");
    expr = expr.replace(/\band\b/g, "&&");
    expr = expr.replace(/\bor\b/g, "||");;

    // nil -> null
    expr = expr.replace(/\bnil\b/g, "null");

    // Lua built-in variable replacements
    for (var luaVar in SC.luaVarToHScript) {
      var regex = new RegExp("\\b" + luaVar + "\\b", "g");
      expr = expr.replace(regex, SC.luaVarToHScript[luaVar]);
    }

    // math.floor, math.ceil, math.abs, math.max, math.min, math.random
    expr = expr.replace(/\bmath\.floor\b/g, "Math.floor");
    expr = expr.replace(/\bmath\.ceil\b/g, "Math.ceil");
    expr = expr.replace(/\bmath\.abs\b/g, "Math.abs");
    expr = expr.replace(/\bmath\.max\b/g, "Math.max");
    expr = expr.replace(/\bmath\.min\b/g, "Math.min");
    expr = expr.replace(/\bmath\.random\b/g, "FlxG.random.float");
    expr = expr.replace(/\bmath\.pi\b/gi, "Math.PI");
    expr = expr.replace(/\bmath\.sin\b/g, "Math.sin");
    expr = expr.replace(/\bmath\.cos\b/g, "Math.cos");

    // Convert sequential Lua tables {val1, val2, ...} to HScript arrays [val1, val2, ...]
    expr = expr.replace(/\{([^{}]*)\}/g, function(match, inner) {
      var trimmed = inner.trim();
      if (!trimmed) return '[]';
      if (/\w+\s*=\s*[^=]/.test(trimmed)) {
        var converted = inner.replace(/(\w+)\s*=(?!=)/g, '$1:');
        return '{' + converted + '}';
      }
      return '[' + inner + ']';
    });

    // tostring / tonumber
    expr = expr.replace(/\btostring\s*\(/g, "Std.string(");
    expr = expr.replace(/\btonumber\s*\(/g, "Std.parseFloat(");

    // #table -> table.length
    expr = expr.replace(/#(\w+)/g, "$1.length");

    // table.insert(tbl, val) -> tbl.push(val)
    expr = expr.replace(/\btable\.insert\s*\(\s*(\w+)\s*,\s*/g, "$1.push(");

    // table.remove(tbl, idx) -> tbl.splice(idx, 1)
    expr = expr.replace(/\btable\.remove\s*\(\s*(\w+)\s*,\s*(.+?)\s*\)/g, "$1.splice($2, 1)");

    // getPropertyFromClass inline
    expr = expr.replace(/getPropertyFromClass\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g, "$1.$2");

    // getHealth inline
    expr = expr.replace(/\bgetHealth\s*\(\s*\)/g, "game.health");

    // getSongPosition inline
    expr = expr.replace(/\bgetSongPosition\s*\(\s*\)/g, "Conductor.songPosition");

    // getRandomInt/Float/Bool inline
    expr = expr.replace(/\bgetRandomInt\s*\(\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*[^)]+)?\s*\)/g, "FlxG.random.int($1, $2)");
    expr = expr.replace(/\bgetRandomFloat\s*\(\s*(.+?)\s*,\s*(.+?)\s*(?:,\s*[^)]+)?\s*\)/g, "FlxG.random.float($1, $2)");
    expr = expr.replace(/\bgetRandomBool\s*\(\s*(.+?)\s*\)/g, "FlxG.random.bool($1)");

    // String utilities inline
    expr = expr.replace(/\bstringStartsWith\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "StringTools.startsWith($1, $2)");
    expr = expr.replace(/\bstringEndsWith\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "StringTools.endsWith($1, $2)");
    expr = expr.replace(/\bstringSplit\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "$1.split($2)");
    expr = expr.replace(/\bstringTrim\s*\(\s*(.+?)\s*\)/g, "StringTools.trim($1)");

    // Color utilities inline
    expr = expr.replace(/\b(?:FlxColor|getColorFromHex|getColorFromName|getColorFromString)\s*\(\s*'([^']+)'\s*\)/g, "FlxColor.fromString('$1')");

    // Position helpers inline
    expr = expr.replace(/\bgetMidpointX\s*\(\s*'([^']+)'\s*\)/g, "$1.getMidpoint().x");
    expr = expr.replace(/\bgetMidpointY\s*\(\s*'([^']+)'\s*\)/g, "$1.getMidpoint().y");
    expr = expr.replace(/\bgetGraphicMidpointX\s*\(\s*'([^']+)'\s*\)/g, "$1.getGraphicMidpoint().x");
    expr = expr.replace(/\bgetGraphicMidpointY\s*\(\s*'([^']+)'\s*\)/g, "$1.getGraphicMidpoint().y");
    expr = expr.replace(/\bgetScreenPositionX\s*\(\s*'([^']+)'\s*\)/g, "$1.getScreenPosition().x");
    expr = expr.replace(/\bgetScreenPositionY\s*\(\s*'([^']+)'\s*\)/g, "$1.getScreenPosition().y");

    // Camera getters inline
    expr = expr.replace(/\bgetCameraScrollX\s*\(\s*\)/g, "FlxG.camera.scroll.x");
    expr = expr.replace(/\bgetCameraScrollY\s*\(\s*\)/g, "FlxG.camera.scroll.y");
    expr = expr.replace(/\bgetCameraFollowX\s*\(\s*\)/g, "game.camFollow.x");
    expr = expr.replace(/\bgetCameraFollowY\s*\(\s*\)/g, "game.camFollow.y");

    // Object order inline
    expr = expr.replace(/\bgetObjectOrder\s*\(\s*'([^']+)'\s*\)/g, "game.members.indexOf($1)");

    // Character getters inline
    expr = expr.replace(/\bgetCharacterX\s*\(\s*'([^']+)'\s*\)/g, function(_, char) {
      var ref = { bf: "game.boyfriend", boyfriend: "game.boyfriend", dad: "game.dad", gf: "game.gf", girlfriend: "game.gf" }[char] || "game." + char;
      return ref + ".x";
    });
    expr = expr.replace(/\bgetCharacterY\s*\(\s*'([^']+)'\s*\)/g, function(_, char) {
      var ref = { bf: "game.boyfriend", boyfriend: "game.boyfriend", dad: "game.dad", gf: "game.gf", girlfriend: "game.gf" }[char] || "game." + char;
      return ref + ".y";
    });

    // Text getters inline
    expr = expr.replace(/\bgetTextString\s*\(\s*'([^']+)'\s*\)/g, "$1.text");
    expr = expr.replace(/\bgetTextSize\s*\(\s*'([^']+)'\s*\)/g, "$1.size");
    expr = expr.replace(/\bgetTextFont\s*\(\s*'([^']+)'\s*\)/g, "$1.font");
    expr = expr.replace(/\bgetTextWidth\s*\(\s*'([^']+)'\s*\)/g, "$1.width");

    // Sound getters inline
    expr = expr.replace(/\bgetSoundVolume\s*\(\s*'([^']+)'\s*\)/g, "$1.volume");
    expr = expr.replace(/\bgetSoundTime\s*\(\s*'([^']+)'\s*\)/g, "$1.time");
    expr = expr.replace(/\bgetSoundPitch\s*\(\s*'([^']+)'\s*\)/g, "$1.pitch");

    // Mouse getters inline
    expr = expr.replace(/\bgetMouseX\s*\(\s*(?:'[^']*')?\s*\)/g, "FlxG.mouse.x");
    expr = expr.replace(/\bgetMouseY\s*\(\s*(?:'[^']*')?\s*\)/g, "FlxG.mouse.y");

    // Keyboard/key/mouse input inline (used in conditions)
    expr = expr.replace(/\bkeyboardJustPressed\s*\(\s*'([^']+)'\s*\)/g, "FlxG.keys.justPressed.$1");
    expr = expr.replace(/\bkeyboardPressed\s*\(\s*'([^']+)'\s*\)/g, "FlxG.keys.pressed.$1");
    expr = expr.replace(/\bkeyboardReleased\s*\(\s*'([^']+)'\s*\)/g, "FlxG.keys.justReleased.$1");
    expr = expr.replace(/\bkeyJustPressed\s*\(\s*'([^']+)'\s*\)/g, "controls.justPressed('$1')");
    expr = expr.replace(/\bkeyPressed\s*\(\s*'([^']+)'\s*\)/g, "controls.pressed('$1')");
    expr = expr.replace(/\bkeyReleased\s*\(\s*'([^']+)'\s*\)/g, "controls.justReleased('$1')");
    expr = expr.replace(/\bmouseClicked\s*\(\s*'?([^')]*)'?\s*\)/g, "FlxG.mouse.justPressed");
    expr = expr.replace(/\bmousePressed\s*\(\s*'?([^')]*)'?\s*\)/g, "FlxG.mouse.pressed");
    expr = expr.replace(/\bmouseReleased\s*\(\s*'?([^')]*)'?\s*\)/g, "FlxG.mouse.justReleased");

    // objectsOverlap inline
    expr = expr.replace(/\bobjectsOverlap\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g, "FlxG.overlap($1, $2)");

    // luaSpriteExists/luaTextExists/luaSoundExists inline
    expr = expr.replace(/\bluaSpriteExists\s*\(\s*'([^']+)'\s*\)/g, "($1 != null)");
    expr = expr.replace(/\bluaTextExists\s*\(\s*'([^']+)'\s*\)/g, "($1 != null)");
    expr = expr.replace(/\bluaSoundExists\s*\(\s*'([^']+)'\s*\)/g, "($1 != null)");

    // isRunning inline
    expr = expr.replace(/\bisRunning\s*\(\s*'([^']+)'\s*\)/g, "// isRunning('$1') - Lua-only");

    // checkFileExists inline
    expr = expr.replace(/\bcheckFileExists\s*\(\s*'([^']+)'\s*(?:,\s*(true|false))?\s*\)/g, "FileSystem.exists('$1')");

    // getTextFromFile inline
    expr = expr.replace(/\bgetTextFromFile\s*\(\s*'([^']+)'\s*\)/g, "File.getContent('$1')");

    // getVar inline
    expr = expr.replace(/\bgetVar\s*\(\s*'([^']+)'\s*\)/g, "getVar('$1')");

    // getDataFromSave inline
    expr = expr.replace(/\bgetDataFromSave\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g, "FlxG.save.data.$2");

    // getModSetting inline
    expr = expr.replace(/\bgetModSetting\s*\(\s*'([^']+)'\s*\)/g, "getModSetting('$1')");

    // Add '#' prefix to bare hex colors in FlxColor.fromString('HEXCOLOR')
    expr = expr.replace(/FlxColor\.fromString\('([0-9A-Fa-f]{6,8})'\)/g, "FlxColor.fromString('#$1')");

    return expr;
  }

  function convertLuaValue(val) {
    return convertLuaExpr(val);
  }

  // =============================================
  // PSYCH HSCRIPT → LUA
  // =============================================

  SC.psychHScriptToLua = function (raw) {
    var lines = raw.split("\n");
    var result = [];
    var noteCallbackState = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var converted = convertHScriptLine(line);

      // Detect note callback function declarations and remap to Lua params
      var funcMatch = converted.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        var fname = funcMatch[2];
        var luaParams = SC.hscriptNoteCallbackLuaParams[fname];
        if (luaParams) {
          noteCallbackState = { noteParam: funcMatch[3].trim(), luaParams: luaParams, depth: 0 };
          converted = funcMatch[1] + "function " + fname + "(" + luaParams.join(", ") + ")";
        } else if (fname === "onCountdownTick") {
          var params = funcMatch[3].split(",").map(function(p) { return p.trim(); }).filter(function(p) { return p; });
          if (params.length >= 2) {
            converted = funcMatch[1] + "function onCountdownTick(" + params[1] + ")";
          }
          noteCallbackState = null;
        } else {
          noteCallbackState = null;
        }
      }

      // Track brace depth / end keywords for note callbacks
      if (noteCallbackState !== null) {
        var opens = (converted.match(/\bfunction\b/g) || []).length;
        var ends = (converted.match(/\bend\s*$/gm) || []).length;
        noteCallbackState.depth += opens - ends;
        if (noteCallbackState.depth <= 0) {
          noteCallbackState = null;
        } else if (!funcMatch) {
          var np = noteCallbackState.noteParam;
          if (np) {
            var luaP = noteCallbackState.luaParams;
            var npEsc = np.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            converted = converted.replace(new RegExp("\\b" + npEsc + "\\.noteData\\b", "g"), luaP[1]);
            converted = converted.replace(new RegExp("\\b" + npEsc + "\\.noteType\\b", "g"), luaP[2]);
            converted = converted.replace(new RegExp("\\b" + npEsc + "\\.isSustainNote\\b", "g"), luaP[3]);
            if (luaP.length > 4) {
              converted = converted.replace(new RegExp("\\b" + npEsc + "\\.strumTime\\b", "g"), luaP[4]);
            }
            converted = converted.replace(new RegExp("\\b" + npEsc + "\\b(?!\\.)", "g"),
              "-- [HScript Note object] " + np);
          }
        }
      }

      if (converted !== "__SKIP_LINE__") {
        result.push(converted);
      }
    }

    return result.join("\n");
  };

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

    // One-line if: if (COND) BODY; -> if COND then BODY end
    var oneLineIfMatch = codeContent.match(/^if\s*\((.+)\)\s+(.+?)\s*;\s*$/);
    if (oneLineIfMatch) {
      var cond = convertHScriptExpr(oneLineIfMatch[1]);
      var body = convertHScriptExpr(oneLineIfMatch[2]);
      return indent + "if " + cond + " then " + body + " end" + inlineComment;
    }

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

    // var tag = new FlxSprite(x, y);
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

    // tag.updateHitbox();
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
      var fullPath = "game." + m[1];
      if (SC.hscriptVarToLua[fullPath]) return indent + m[2].trim() + " -- TODO: use setProperty or Lua variable '" + SC.hscriptVarToLua[fullPath] + "'";
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

    // _cachedImages.set('path', Paths.image('path'));  (precache via StringMap)
    m = content.match(/^_cached\w+\.set\s*\(\s*['"]([^'"]+)['"]\s*,\s*Paths\.(image|sound|music)\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)\s*;\s*$/);
    if (m) {
      var fnMap = { image: "precacheImage", sound: "precacheSound", music: "precacheMusic" };
      return indent + fnMap[m[2]] + "('" + m[3] + "')";
    }

    // var _cachedImages = new haxe.ds.StringMap();  (precache declaration - skip)
    m = content.match(/^var\s+_cached\w+\s*=\s*new\s+haxe\.ds\.StringMap\s*\(\s*\)\s*;\s*$/);
    if (m) return "__SKIP_LINE__";

    // Paths.sound('name');  (precache)
    m = content.match(/^Paths\.sound\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) return indent + "precacheSound('" + m[1] + "')";

    // Paths.music('name');  (precache)
    m = content.match(/^Paths\.music\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) return indent + "precacheMusic('" + m[1] + "')";

    // tag.makeGraphic(w, h, color);
    m = content.match(/^(\w+)\.makeGraphic\s*\(\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "makeGraphic('" + m[1] + "', " + m[2].trim() + ", " + m[3].trim() + ", " + convertHScriptValue(m[4].trim()) + ")";

    // tag.loadGraphic(Paths.image('img'));
    m = content.match(/^(\w+)\.loadGraphic\s*\(\s*Paths\.image\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\)\s*;\s*$/);
    if (m) return indent + "loadGraphic('" + m[1] + "', '" + m[2] + "')";

    // tag.setGraphicSize(w, h);
    m = content.match(/^(\w+)\.setGraphicSize\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "setGraphicSize('" + m[1] + "', " + m[2].trim() + ", " + m[3].trim() + ")";

    // tag.updateHitbox();
    m = content.match(/^(\w+)\.updateHitbox\s*\(\s*\)\s*;\s*$/);
    if (m) return indent + "updateHitbox('" + m[1] + "')";

    // tag.blend = BLEND;
    m = content.match(/^(\w+)\.blend\s*=\s*(\w+)\s*;\s*$/);
    if (m) return indent + "setBlendMode('" + m[1] + "', '" + m[2].toLowerCase() + "')";

    // tag.animation.add(name, frames, fps, loop);
    m = content.match(/^(\w+)\.animation\.add\s*\(\s*['"]([^'"]+)['"]\s*,\s*\[(.+?)\]\s*,\s*(\d+)\s*(?:,\s*(true|false))?\s*\)\s*;\s*$/);
    if (m) return indent + "addAnimation('" + m[1] + "', '" + m[2] + "', {" + m[3] + "}, " + m[4] + (m[5] ? ", " + m[5] : "") + ")";

    // tag.addOffset(anim, x, y);
    m = content.match(/^(\w+)\.addOffset\s*\(\s*['"]([^'"]+)['"]\s*,\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "addOffset('" + m[1] + "', '" + m[2] + "', " + m[3].trim() + ", " + m[4].trim() + ")";

    // tag.color = FlxColor.fromString('color');
    m = content.match(/^(\w+)\.color\s*=\s*FlxColor\.fromString\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) {
      var hexColor = m[2].replace(/^#/, '');
      return indent + "setTextColor('" + m[1] + "', '" + hexColor + "')";
    }

    // tag.borderStyle = OUTLINE/SHADOW/NONE/OUTLINE_FAST; → converted as part of setTextBorder group
    m = content.match(/^(\w+)\.borderStyle\s*=\s*(\w+)\s*;\s*$/);
    if (m) return indent + "-- borderStyle: " + m[2].toLowerCase();

    // tag.borderSize = val; → setTextBorder second arg
    m = content.match(/^(\w+)\.borderSize\s*=\s*(.+?)\s*;\s*$/);
    if (m) return indent + "-- borderSize: " + m[2].trim();

    // tag.borderColor = FlxColor.fromString('color'); → setTextBorder third arg
    m = content.match(/^(\w+)\.borderColor\s*=\s*FlxColor\.fromString\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) {
      var hexColor = m[2].replace(/^#/, '');
      return indent + "setTextBorder('" + m[1] + "', 0, '" + hexColor + "')";
    }

    // tag.font = Paths.font('font');
    m = content.match(/^(\w+)\.font\s*=\s*Paths\.font\s*\(\s*['"]([^'"]+)['"]\s*\)\s*;\s*$/);
    if (m) return indent + "setTextFont('" + m[1] + "', '" + m[2] + "')";

    // tag.italic = bool;
    m = content.match(/^(\w+)\.italic\s*=\s*(true|false)\s*;\s*$/);
    if (m) return indent + "setTextItalic('" + m[1] + "', " + m[2] + ")";

    // tag.alignment = LEFT/CENTER/RIGHT/JUSTIFY or 'val';
    m = content.match(/^(\w+)\.alignment\s*=\s*(?:['"]([^'"]+)['"]|(\w+))\s*;\s*$/);
    if (m) {
      var align = (m[2] || m[3] || 'left').toLowerCase();
      return indent + "setTextAlignment('" + m[1] + "', '" + align + "')";
    }

    // tag.fieldWidth = val;
    m = content.match(/^(\w+)\.fieldWidth\s*=\s*(.+?)\s*;\s*$/);
    if (m) return indent + "setTextWidth('" + m[1] + "', " + m[2].trim() + ")";

    // FlxG.sound.play(Paths.sound('name'), vol);
    m = content.match(/^FlxG\.sound\.play\s*\(\s*Paths\.sound\s*\(\s*['"]([^'"]+)['"]\s*\)\s*(?:,\s*(.+?))?\s*\)\s*;\s*$/);
    if (m) return indent + "playSound('" + m[1] + "'" + (m[2] ? ", " + m[2].trim() : "") + ")";

    // FlxG.sound.playMusic(Paths.music('name'), vol, loop);
    m = content.match(/^FlxG\.sound\.playMusic\s*\(\s*Paths\.music\s*\(\s*['"]([^'"]+)['"]\s*\)\s*(?:,\s*(.+?))?\s*(?:,\s*(true|false))?\s*\)\s*;\s*$/);
    if (m) return indent + "playMusic('" + m[1] + "'" + (m[2] ? ", " + m[2].trim() : "") + (m[3] ? ", " + m[3] : "") + ")";

    // game.camGame.shake/flash/fade
    m = content.match(/^(game\.cam\w+|FlxG\.camera)\.shake\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)\s*;\s*$/);
    if (m) {
      var camName = m[1].replace("game.", "");
      return indent + "cameraShake('" + camName + "', " + m[2].trim() + ", " + m[3].trim() + ")";
    }

    m = content.match(/^(game\.cam\w+|FlxG\.camera)\.flash\s*\(\s*FlxColor\.fromString\s*\(\s*['"]([^'"]+)['"]\s*\)\s*,\s*(.+?)\s*(?:,\s*null\s*,\s*(true|false))?\s*\)\s*;\s*$/);
    if (m) {
      var camName = m[1].replace("game.", "");
      var hexColor = m[2].replace(/^#/, '');
      return indent + "cameraFlash('" + camName + "', '" + hexColor + "', " + m[3].trim() + (m[4] ? ", " + m[4] : ", false") + ")";
    }

    m = content.match(/^(game\.cam\w+|FlxG\.camera)\.fade\s*\(\s*FlxColor\.fromString\s*\(\s*['"]([^'"]+)['"]\s*\)\s*,\s*(.+?)\s*,\s*(true|false)\s*(?:,\s*null\s*,\s*(true|false))?\s*\)\s*;\s*$/);
    if (m) {
      var camName = m[1].replace("game.", "");
      var hexColor = m[2].replace(/^#/, '');
      return indent + "cameraFade('" + camName + "', '" + hexColor + "', " + m[3].trim() + ", " + (m[5] || "false") + ", " + m[4] + ")";
    }

    // game.songScore/songMisses/songHits += value;
    m = content.match(/^game\.(songScore|songMisses|songHits)\s*(\+?=)\s*(.+?)\s*;\s*$/);
    if (m) {
      var fnMap = { songScore: "Score", songMisses: "Misses", songHits: "Hits" };
      if (m[2] === "+=") return indent + "add" + fnMap[m[1]] + "(" + m[3].trim() + ")";
      return indent + "set" + fnMap[m[1]] + "(" + m[3].trim() + ")";
    }

    // game.health += value; / game.health = value;
    m = content.match(/^game\.health\s*(\+?=)\s*(.+?)\s*;\s*$/);
    if (m) {
      if (m[1] === "+=") return indent + "addHealth(" + m[2].trim() + ")";
      return indent + "setHealth(" + m[2].trim() + ")";
    }

    // debugPrint(...);
    m = content.match(/^debugPrint\s*\(\s*(.+?)\s*\)\s*;\s*$/);
    if (m) return indent + "debugPrint(" + convertHScriptValue(m[1].trim()) + ")";

    // game.startCountdown/endSong/restartSong/exitSong();
    m = content.match(/^game\.(startCountdown|endSong|restartSong|exitSong)\s*\(\s*([^)]*)\s*\)\s*;\s*$/);
    if (m) return indent + m[1] + "(" + (m[2] ? m[2].trim() : "") + ")";

    // game.triggerEvent(name, ...);
    m = content.match(/^game\.triggerEvent\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*(.+?))?\s*\)\s*;\s*$/);
    if (m) return indent + "triggerEvent('" + m[1] + "'" + (m[2] ? ", " + m[2].trim() : "") + ")";

    // game.openSubState(new CustomSubstate(...));
    m = content.match(/^game\.openSubState\s*\(\s*new\s+CustomSubstate\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*(true|false))?\s*\)\s*\)\s*;\s*$/);
    if (m) return indent + "openCustomSubstate('" + m[1] + "'" + (m[2] ? ", " + m[2] : "") + ")";

    // game.closeSubState();
    if (/^game\.closeSubState\s*\(\s*\)\s*;\s*$/.test(content)) return indent + "closeCustomSubstate()";

    // ClassName.prop = value;  (setPropertyFromClass pattern)
    m = content.match(/^([A-Z]\w+(?:\.[A-Z]\w*)*)\.(\w[\w.]*)\s*=\s*(.+?)\s*;\s*$/);
    if (m) {
      var fullPath = m[1] + "." + m[2];
      if (SC.hscriptVarToLua[fullPath]) return indent + convertHScriptValue(m[3].trim()) + " -- TODO: use setPropertyFromClass or Lua variable '" + SC.hscriptVarToLua[fullPath] + "'";
      return indent + "setPropertyFromClass('" + m[1] + "', '" + m[2] + "', " + convertHScriptValue(m[3].trim()) + ")";
    }

    return null;
  }

  function convertHScriptExpr(expr) {
    // != to ~=
    expr = expr.replace(/!=/g, "~=");

    // ! to not (only standalone, not ~=)
    expr = expr.replace(/!\s*(?!=)/g, "not ");

    // && to and, || to or
    expr = expr.replace(/&&/g, "and");
    expr = expr.replace(/\|\|/g, "or");

    // null -> nil
    expr = expr.replace(/\bnull\b/g, "nil");

    // Math
    expr = expr.replace(/\bMath\.floor\b/g, "math.floor");
    expr = expr.replace(/\bMath\.ceil\b/g, "math.ceil");
    expr = expr.replace(/\bMath\.abs\b/g, "math.abs");
    expr = expr.replace(/\bMath\.max\b/g, "math.max");
    expr = expr.replace(/\bMath\.min\b/g, "math.min");
    expr = expr.replace(/\bMath\.PI\b/g, "math.pi");
    expr = expr.replace(/\bMath\.sin\b/g, "math.sin");
    expr = expr.replace(/\bMath\.cos\b/g, "math.cos");

    // Std.string / Std.parseFloat
    expr = expr.replace(/\bStd\.string\s*\(/g, "tostring(");
    expr = expr.replace(/\bStd\.parseFloat\s*\(/g, "tonumber(");

    // StringTools -> Lua equivalents
    expr = expr.replace(/\bStringTools\.startsWith\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "stringStartsWith($1, $2)");
    expr = expr.replace(/\bStringTools\.endsWith\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "stringEndsWith($1, $2)");
    expr = expr.replace(/\bStringTools\.trim\s*\(\s*(.+?)\s*\)/g, "stringTrim($1)");

    // FlxG.random -> Lua random functions
    expr = expr.replace(/\bFlxG\.random\.int\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "getRandomInt($1, $2)");
    expr = expr.replace(/\bFlxG\.random\.float\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)/g, "getRandomFloat($1, $2)");
    expr = expr.replace(/\bFlxG\.random\.bool\s*\(\s*(.+?)\s*\)/g, "getRandomBool($1)");

    // FlxColor.fromString -> getColorFromHex (strip '#' prefix for Lua)
    expr = expr.replace(/\bFlxColor\.fromString\s*\(\s*['"]#?([^'"]+)['"]\s*\)/g, "getColorFromHex('$1')");

    // FlxG.keys -> keyboard input
    expr = expr.replace(/\bFlxG\.keys\.justPressed\.(\w+)/g, "keyboardJustPressed('$1')");
    expr = expr.replace(/\bFlxG\.keys\.pressed\.(\w+)/g, "keyboardPressed('$1')");
    expr = expr.replace(/\bFlxG\.keys\.justReleased\.(\w+)/g, "keyboardReleased('$1')");

    // FlxG.mouse -> mouse input
    expr = expr.replace(/\bFlxG\.mouse\.justPressed\b/g, "mouseClicked('left')");
    expr = expr.replace(/\bFlxG\.mouse\.pressed\b/g, "mousePressed('left')");
    expr = expr.replace(/\bFlxG\.mouse\.justReleased\b/g, "mouseReleased('left')");
    expr = expr.replace(/\bFlxG\.mouse\.x\b/g, "getMouseX('camGame')");
    expr = expr.replace(/\bFlxG\.mouse\.y\b/g, "getMouseY('camGame')");

    // Camera getters -> Lua functions
    expr = expr.replace(/\bFlxG\.camera\.scroll\.x\b/g, "getCameraScrollX()");
    expr = expr.replace(/\bFlxG\.camera\.scroll\.y\b/g, "getCameraScrollY()");
    expr = expr.replace(/\bgame\.camFollow\.x\b/g, "getCameraFollowX()");
    expr = expr.replace(/\bgame\.camFollow\.y\b/g, "getCameraFollowY()");

    // FileSystem.exists -> checkFileExists
    expr = expr.replace(/\bFileSystem\.exists\s*\(\s*(['"][^'"]+['"])\s*\)/g, "checkFileExists($1)");
    // File.getContent -> getTextFromFile
    expr = expr.replace(/\bFile\.getContent\s*\(\s*(['"][^'"]+['"])\s*\)/g, "getTextFromFile($1)");

    // FlxG.save.data.field -> getDataFromSave equivalent
    expr = expr.replace(/\bFlxG\.save\.data\.(\w+)/g, "getDataFromSave('save', '$1')");

    // Convert Haxe anonymous structs { key: value } back to Lua tables { key = value }
    expr = expr.replace(/\{([^{}]*)\}/g, function(match, inner) {
      var trimmed = inner.trim();
      if (/\w+\s*:\s*/.test(trimmed)) {
        var converted = inner.replace(/(\w+)\s*:/g, '$1 =');
        return '{' + converted + '}';
      }
      return match;
    });

    // Known HScript variables -> Lua built-in variables (longer paths first)
    var sortedKeys = Object.keys(SC.hscriptVarToLua).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < sortedKeys.length; i++) {
      var hsVar = sortedKeys[i];
      var escaped = hsVar.replace(/\./g, "\\.");
      var regex = new RegExp(escaped, "g");
      expr = expr.replace(regex, SC.hscriptVarToLua[hsVar]);
    }

    return expr;
  }

  function convertHScriptValue(val) {
    return convertHScriptExpr(val);
  }
})();
