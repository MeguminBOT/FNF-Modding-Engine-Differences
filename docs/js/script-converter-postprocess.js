// =============================================
// SCRIPT CONVERTER — HSCRIPT POST-PROCESSOR
// =============================================
// Pattern-based fixes for HScript Iris output that require contextual
// analysis beyond what the line-by-line converter can handle.
// Runs after SC.luaToPsychHScript() to fix known HScript Iris quirks.
// Depends on: script-converter-data.js (SC namespace)

(function () {
  var SC = window.ScriptConverter;

  // =============================================
  // POST-PROCESS ENTRY POINT
  // =============================================

  SC.postProcessHScript = function (hscript) {
    var lines = hscript.split("\n");

    lines = fixForInToIndexedLoop(lines);
    lines = fixDictTableToStringMap(lines);
    lines = fixGamePrefixOnLocalVars(lines);
    lines = addScrollFactorForHudElements(lines);
    lines = fixConsecutiveTextProps(lines);

    return lines.join("\n");
  };

  // =============================================
  // FIX 1: for (item in array) → for (i in 0...array.length)
  // =============================================
  // HScript Iris has issues with for-each on arrays when the loop body
  // uses indexed access or when the iterator variable is modified.
  // Convert to indexed loops for reliability.

  function fixForInToIndexedLoop(lines) {
    var result = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // Match: for (item in array) {
      var forInMatch = trimmed.match(/^for\s*\(\s*(\w+)\s+in\s+(\w+)\s*\)\s*\{$/);
      if (forInMatch) {
        var iterVar = forInMatch[1];
        var arrVar = forInMatch[2];
        var indent = line.match(/^(\s*)/)[1];

        // Collect the loop body to check if it uses i or array indexed access
        var bodyLines = [];
        var braceDepth = 1;
        var j = i + 1;
        while (j < lines.length && braceDepth > 0) {
          var bline = lines[j];
          braceDepth += (bline.match(/\{/g) || []).length;
          braceDepth -= (bline.match(/\}/g) || []).length;
          if (braceDepth > 0) bodyLines.push(bline);
          j++;
        }

        // Check if body accesses arrVar[...] (indexed access pattern)
        var bodyText = bodyLines.join('\n');
        var usesIndexedAccess = new RegExp("\\b" + arrVar + "\\s*\\[").test(bodyText);
        var usesIterVarAsProp = new RegExp("\\b" + iterVar + "\\.(\\w+)").test(bodyText);

        // If the body uses the iterator variable's properties (e.g., def.name, def.color),
        // convert to indexed loop for HScript Iris compatibility
        if (usesIterVarAsProp) {
          // Find a safe index variable name
          var idxVar = "i";
          if (iterVar === "i") idxVar = "_i";

          // Replace the for line
          result.push(indent + "for (" + idxVar + " in 0..." + arrVar + ".length) {");

          // Add assignment: var iterVar = arrVar[idxVar];
          var bodyIndent = indent + "\t";
          result.push(bodyIndent + iterVar + " = " + arrVar + "[" + idxVar + "];");

          // Push body lines, replacing any standalone i references that were the loop counter
          for (var k = 0; k < bodyLines.length; k++) {
            result.push(bodyLines[k]);
          }

          // Push closing brace
          if (j <= lines.length) {
            result.push(lines[j - 1]); // the closing }
          }

          i = j;
          continue;
        }
      }

      result.push(line);
      i++;
    }

    return result;
  }

  // =============================================
  // FIX 2: Detect dict-like tables and convert to StringMap
  // =============================================
  // When a variable is initialized as [] but later accessed with string keys
  // via bracket notation (e.g., obj[name] = val, obj[key]),
  // convert to new haxe.ds.StringMap() with .get()/.set() accessors.

  function fixDictTableToStringMap(lines) {
    // Pass 1: detect variables used as dictionaries
    var dictVars = {};
    var fullText = lines.join('\n');

    // Find vars initialized as [] or {}
    var initPattern = /\bvar\s+(\w+)\s*=\s*\[\s*\]\s*;/g;
    var initMatch;
    while ((initMatch = initPattern.exec(fullText)) !== null) {
      var varName = initMatch[1];
      // Check if this variable is later accessed with string-key bracket notation
      // Pattern: varName[stringExpr] = value  OR  varName[stringExpr]
      var bracketWrite = new RegExp("\\b" + varName + "\\s*\\[\\s*(?!\\d)\\w+[\\.\\w]*\\s*\\]\\s*=", "g");
      var bracketRead = new RegExp("\\b" + varName + "\\s*\\[\\s*(?!\\d)\\w+[\\.\\w]*\\s*\\](?!\\s*=)", "g");

      if (bracketWrite.test(fullText) || bracketRead.test(fullText)) {
        dictVars[varName] = true;
      }
    }

    if (Object.keys(dictVars).length === 0) return lines;

    // Pass 2: apply transformations
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      for (var dv in dictVars) {
        // var dictVar = []; -> var dictVar = new haxe.ds.StringMap();
        var declPattern = new RegExp("(\\bvar\\s+" + dv + "\\s*=\\s*)\\[\\s*\\]\\s*(;)");
        line = line.replace(declPattern, "$1new haxe.ds.StringMap()$2");

        // dictVar[key] = value; -> dictVar.set(key, value);
        var writePattern = new RegExp("\\b" + dv + "\\s*\\[\\s*([^\\]]+)\\s*\\]\\s*=\\s*(.+?)\\s*(;)", "g");
        line = line.replace(writePattern, dv + ".set($1, $2)$3");

        // dictVar[key] (read access) -> dictVar.get(key)
        var readPattern = new RegExp("\\b" + dv + "\\s*\\[\\s*([^\\]]+)\\s*\\]", "g");
        line = line.replace(readPattern, dv + ".get($1)");
      }

      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 3: Remove game. prefix on local variables
  // =============================================
  // When Lua uses setProperty('localVar.prop', val), the converter produces
  // game.localVar.prop = val; but localVar is actually a script-local variable,
  // not a PlayState property.
  // Detection: if 'var localVar' is declared in the script, strip game. prefix.

  function fixGamePrefixOnLocalVars(lines) {
    // Pass 1: collect all declared variable names
    var localVars = {};
    for (var i = 0; i < lines.length; i++) {
      var varMatch = lines[i].match(/^\s*var\s+(\w+)\b/);
      if (varMatch) {
        localVars[varMatch[1]] = true;
      }
    }

    if (Object.keys(localVars).length === 0) return lines;

    // Pass 2: fix game.localVar references
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      for (var lv in localVars) {
        // game.localVar.prop -> localVar.prop  (property access)
        // game.localVar -> localVar  (standalone)
        // But NOT inside strings
        var gamePrefix = new RegExp("\\bgame\\." + lv + "\\b", "g");
        line = line.replace(gamePrefix, lv);
      }

      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 4: Add scrollFactor.set() for HUD-camera elements
  // =============================================
  // When a sprite/text has .cameras = [game.camHUD], it typically needs
  // .scrollFactor.set() to prevent scrolling with the game camera.
  // Insert scrollFactor.set() before the cameras assignment if not already present.

  function addScrollFactorForHudElements(lines) {
    var result = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      // Match: obj.cameras = [game.camHUD];
      var camMatch = trimmed.match(/^(\w+)\.cameras\s*=\s*\[\s*game\.camHUD\s*\]\s*;$/);
      if (camMatch) {
        var objName = camMatch[1];
        var indent = line.match(/^(\s*)/)[1];

        // Check if scrollFactor.set() already appears for this object nearby
        var hasScrollFactor = false;
        for (var j = Math.max(0, i - 5); j < Math.min(lines.length, i + 2); j++) {
          if (lines[j].indexOf(objName + ".scrollFactor.set(") >= 0) {
            hasScrollFactor = true;
            break;
          }
        }

        if (!hasScrollFactor) {
          result.push(indent + objName + ".scrollFactor.set();");
        }
      }

      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 5: Merge consecutive text property assignments into setFormat()
  // =============================================
  // Detects patterns like:
  //   textObj.size = fontSize;
  //   textObj.font = Paths.font(fontName);
  //   textObj.color = FlxColor.fromString('#FFFFFF');
  //   textObj.borderStyle = OUTLINE;
  //   textObj.borderSize = 1.5;
  //   textObj.borderColor = FlxColor.BLACK;
  //   textObj.alignment = LEFT;
  // And merges them into:
  //   textObj.setFormat(Paths.font(fontName), fontSize, FlxColor.fromString('#FFFFFF'), 'left', 'outline', FlxColor.BLACK);
  //   textObj.borderSize = 1.5;

  function fixConsecutiveTextProps(lines) {
    var result = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // Check if this line sets a text property that could be part of a setFormat group
      var propMatch = trimmed.match(/^(\w+)\.(size|font|color|borderStyle|borderColor|alignment)\s*=\s*(.+?)\s*;$/);
      if (propMatch) {
        var objName = propMatch[1];
        var indent = line.match(/^(\s*)/)[1];

        // Collect consecutive property assignments for the same object
        var props = {};
        var extraLines = [];
        var startIdx = i;

        while (i < lines.length) {
          var curTrimmed = lines[i].trim();
          var curMatch = curTrimmed.match(/^(\w+)\.(size|font|color|borderStyle|borderSize|borderColor|alignment)\s*=\s*(.+?)\s*;$/);
          if (curMatch && curMatch[1] === objName) {
            props[curMatch[2]] = curMatch[3];
            i++;
          } else {
            break;
          }
        }

        // Only merge if we have at least 3 text properties (font + size + color minimum)
        var propCount = Object.keys(props).length;
        if (propCount >= 3 && props.font && props.size && props.color) {
          var fontArg = props.font;
          var sizeArg = props.size;
          var colorArg = props.color;
          var alignArg = props.alignment ? "'" + props.alignment.toLowerCase().replace(/['"]/g, '') + "'" : "'left'";
          var borderStyleArg = props.borderStyle ? "'" + props.borderStyle.toLowerCase().replace(/['"]/g, '') + "'" : null;
          var borderColorArg = props.borderColor || null;

          var formatArgs = fontArg + ", " + sizeArg + ", " + colorArg + ", " + alignArg;
          if (borderStyleArg && borderColorArg) {
            formatArgs += ", " + borderStyleArg + ", " + borderColorArg;
          }

          result.push(indent + objName + ".setFormat(" + formatArgs + ");");

          // Keep borderSize as separate assignment (setFormat doesn't set it)
          if (props.borderSize) {
            result.push(indent + objName + ".borderSize = " + props.borderSize + ";");
          }
        } else {
          // Not enough properties to merge, keep original lines
          for (var k = startIdx; k < i; k++) {
            result.push(lines[k]);
          }
        }

        continue;
      }

      result.push(line);
      i++;
    }

    return result;
  }
})();
