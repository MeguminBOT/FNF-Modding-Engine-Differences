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
    lines = fixForPairsToKeysLoop(lines);
    lines = fixDictTableToStringMap(lines);
    lines = fixGamePrefixOnLocalVars(lines);
    lines = fixGameRemoveForLocalObjects(lines);
    lines = addScrollFactorForHudElements(lines);
    lines = fixDynamicTagNewObjects(lines);
    lines = fixConsecutiveTextProps(lines);
    lines = renameBorderSizeConflict(lines);
    lines = hoistVariablesToFunctionTop(lines);

    return lines.join("\n");
  };

  // =============================================
  // FIX 1: for (item in array) → for (i in 0...array.length)
  // =============================================
  // HScript Iris has issues with for-each over arrays.
  // Convert ALL for-in loops on arrays to indexed loops.
  // Skip loops that already use the range syntax (0...N).

  function fixForInToIndexedLoop(lines) {
    var result = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // Match: for (item in array) {  — but NOT for (i in 0...N)
      var forInMatch = trimmed.match(/^for\s*\(\s*(\w+)\s+in\s+(\w+)\s*\)\s*\{$/);
      if (forInMatch) {
        var iterVar = forInMatch[1];
        var arrVar = forInMatch[2];
        var indent = line.match(/^(\s*)/)[1];

        // Collect the loop body
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

        // Pick an index variable name that doesn't conflict
        var idxVar = "i";
        if (iterVar === "i") idxVar = "_i";

        // Replace the for line with indexed version
        result.push(indent + "for (" + idxVar + " in 0..." + arrVar + ".length) {");

        // Add assignment: iterVar = arrVar[idxVar];
        var bodyIndent = indent + "\t";
        result.push(bodyIndent + iterVar + " = " + arrVar + "[" + idxVar + "];");

        // Push body lines as-is
        for (var k = 0; k < bodyLines.length; k++) {
          result.push(bodyLines[k]);
        }

        // Push closing brace
        if (j <= lines.length) {
          result.push(lines[j - 1]);
        }

        i = j;
        continue;
      }

      result.push(line);
      i++;
    }

    return result;
  }

  // =============================================
  // FIX 2: for (k => v in map) → for (k in map.keys()) + v = map.get(k)
  // =============================================
  // HScript Iris doesn't support the k => v destructuring syntax.
  // Convert to key iteration with .get() lookup.

  function fixForPairsToKeysLoop(lines) {
    var result = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // Match: for (key => value in mapVar) {
      var pairsMatch = trimmed.match(/^for\s*\(\s*(\w+)\s*=>\s*(\w+)\s+in\s+(\w+)\s*\)\s*\{$/);
      if (pairsMatch) {
        var keyVar = pairsMatch[1];
        var valVar = pairsMatch[2];
        var mapVar = pairsMatch[3];
        var indent = line.match(/^(\s*)/)[1];
        var bodyIndent = indent + "\t";

        // Collect body lines
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

        // Replace with keys() iteration
        result.push(indent + "for (" + keyVar + " in " + mapVar + ".keys()) {");
        result.push(bodyIndent + valVar + " = " + mapVar + ".get(" + keyVar + ");");

        for (var k = 0; k < bodyLines.length; k++) {
          result.push(bodyLines[k]);
        }

        if (j <= lines.length) {
          result.push(lines[j - 1]);
        }

        i = j;
        continue;
      }

      result.push(line);
      i++;
    }

    return result;
  }

  // =============================================
  // FIX 3: Detect dict-like tables and convert to StringMap
  // =============================================
  // When a variable is initialized as [] and later accessed with string-key
  // bracket notation (obj[stringVar] where stringVar is NOT a loop counter
  // or numeric variable), convert to new haxe.ds.StringMap().
  // Variables accessed with numeric indices (obj[i], obj[0]) stay as arrays.

  function fixDictTableToStringMap(lines) {
    var dictVars = {};
    var fullText = lines.join('\n');

    // Find vars initialized as []
    var initPattern = /\bvar\s+(\w+)\s*=\s*\[\s*\]\s*;/g;
    var initMatch;
    while ((initMatch = initPattern.exec(fullText)) !== null) {
      var varName = initMatch[1];

      // Check for bracket access with clearly string-typed keys:
      // - obj['literal'] or obj["literal"] (quoted string key)
      // - obj[varName] where varName.set() or varName.get() is also used (StringMap pattern)
      // Exclude numeric access patterns: obj[i], obj[0], obj[index]
      var quotedKeyAccess = new RegExp("\\b" + varName + "\\s*\\[\\s*['\"]", "g");
      var hasQuotedKeys = quotedKeyAccess.test(fullText);

      // Check for .set() or .get() usage (already partially converted)
      var setGetAccess = new RegExp("\\b" + varName + "\\.(set|get)\\s*\\(", "g");
      var hasSetGet = setGetAccess.test(fullText);

      if (hasQuotedKeys || hasSetGet) {
        dictVars[varName] = true;
      }
    }

    if (Object.keys(dictVars).length === 0) return lines;

    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      for (var dv in dictVars) {
        var declPattern = new RegExp("(\\bvar\\s+" + dv + "\\s*=\\s*)\\[\\s*\\]\\s*(;)");
        line = line.replace(declPattern, "$1new haxe.ds.StringMap()$2");

        var writePattern = new RegExp("\\b" + dv + "\\s*\\[\\s*([^\\]]+)\\s*\\]\\s*=\\s*(.+?)\\s*(;)", "g");
        line = line.replace(writePattern, dv + ".set($1, $2)$3");

        var readPattern = new RegExp("\\b" + dv + "\\s*\\[\\s*([^\\]]+)\\s*\\]", "g");
        line = line.replace(readPattern, dv + ".get($1)");
      }

      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 4: Remove game. prefix on local variables
  // =============================================

  function fixGamePrefixOnLocalVars(lines) {
    var localVars = {};
    for (var i = 0; i < lines.length; i++) {
      var varMatch = lines[i].match(/^\s*var\s+(\w+)\b/);
      if (varMatch) {
        localVars[varMatch[1]] = true;
      }
    }

    if (Object.keys(localVars).length === 0) return lines;

    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      for (var lv in localVars) {
        var gamePrefix = new RegExp("\\bgame\\." + lv + "\\b", "g");
        line = line.replace(gamePrefix, lv);
      }

      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 5: game.remove(localVar) → remove(localVar)
  // =============================================
  // Script-local objects should use remove() not game.remove()
  // since they were added to the script's display, not PlayState directly.

  function fixGameRemoveForLocalObjects(lines) {
    var localVars = {};
    for (var i = 0; i < lines.length; i++) {
      var varMatch = lines[i].match(/^\s*var\s+(\w+)\b/);
      if (varMatch) {
        localVars[varMatch[1]] = true;
      }
    }

    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // game.remove(localVar) → remove(localVar) when localVar is script-declared
      var removeMatch = line.match(/^(\s*)game\.remove\(\s*(\w+)\s*\)\s*;/);
      if (removeMatch && localVars[removeMatch[2]]) {
        line = removeMatch[1] + "remove(" + removeMatch[2] + ");";
      }

      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 6: Add scrollFactor.set() for HUD-camera elements
  // =============================================
  // When a sprite/text has .cameras = [game.camHUD], insert
  // scrollFactor.set() before the cameras assignment if not nearby.

  function addScrollFactorForHudElements(lines) {
    var result = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      var camMatch = trimmed.match(/^(\w+)\.cameras\s*=\s*\[\s*game\.camHUD\s*\]\s*;$/);
      if (camMatch) {
        var objName = camMatch[1];
        var indent = line.match(/^(\s*)/)[1];

        var hasScrollFactor = false;
        for (var j = Math.max(0, i - 8); j < Math.min(lines.length, i + 2); j++) {
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
  // FIX 7: Rename dynamic-tag FlxText/FlxSprite objects
  // =============================================
  // When makeLuaText(variable, ...) uses a variable tag instead of a string
  // literal, the converter produces `var tagName = new FlxText(...)` which
  // redeclares an existing string variable. Rename the object variable to
  // `textObj` (or `spriteObj`) and update all subsequent object references.
  // The existing hoist fix (Fix 9) will move the declaration to function top.

  function fixDynamicTagNewObjects(lines) {
    // Collect first var declarations for each name
    var firstDecl = {};
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/^\s*var\s+(\w+)\b/);
      if (m && !firstDecl.hasOwnProperty(m[1])) {
        firstDecl[m[1]] = i;
      }
    }

    // Find redeclarations as new FlxText/FlxSprite
    var renames = [];
    for (var i = 0; i < lines.length; i++) {
      var m = lines[i].match(/^\s*var\s+(\w+)\s*=\s*new\s+(FlxText|FlxSprite)\s*\(/);
      if (m && firstDecl.hasOwnProperty(m[1]) && firstDecl[m[1]] < i) {
        renames.push({ lineIdx: i, varName: m[1], objType: m[2] });
      }
    }

    if (renames.length === 0) return lines;

    var result = lines.slice();

    for (var r = 0; r < renames.length; r++) {
      var oldName = renames[r].varName;
      var newName = renames[r].objType === 'FlxText' ? 'textObj' : 'spriteObj';
      if (firstDecl[newName]) newName = '_' + newName;

      // Rename the redeclaration line: var oldName = new ... → var newName:Type = new ...
      var typeAnnotation = renames[r].objType;
      result[renames[r].lineIdx] = result[renames[r].lineIdx].replace(
        new RegExp('var\\s+' + oldName + '\\s*=\\s*new\\s+'),
        'var ' + newName + ':' + typeAnnotation + ' = new '
      );

      // From that line onwards, rename object references
      for (var i = renames[r].lineIdx + 1; i < result.length; i++) {
        var line = result[i];

        // oldName.xxx → newName.xxx (dot property/method access)
        line = line.replace(new RegExp('\\b' + oldName + '\\.', 'g'), newName + '.');

        // game.add(oldName) / add(oldName) / remove(oldName) / game.remove(oldName)
        line = line.replace(
          new RegExp('((?:game\\.)?(?:add|remove))\\(\\s*' + oldName + '\\s*\\)', 'g'),
          '$1(' + newName + ')'
        );

        // .set(oldName, oldName) → .set(oldName, newName) — value position in map storage
        line = line.replace(
          new RegExp('\\.set\\(\\s*' + oldName + '\\s*,\\s*' + oldName + '\\s*\\)', 'g'),
          '.set(' + oldName + ', ' + newName + ')'
        );

        result[i] = line;
      }
    }

    return result;
  }

  // =============================================
  // FIX 8: Merge consecutive text property assignments into setFormat()
  // =============================================

  function fixConsecutiveTextProps(lines) {
    var result = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      var propMatch = trimmed.match(/^(\w+)\.(size|font|color|borderStyle|borderColor|alignment)\s*=\s*(.+?)\s*;$/);
      if (propMatch) {
        var objName = propMatch[1];
        var indent = line.match(/^(\s*)/)[1];

        var props = {};
        var startIdx = i;

        while (i < lines.length) {
          var curTrimmed = lines[i].trim();
          var curMatch = curTrimmed.match(/^(\w+)\.(size|font|color|borderStyle|borderSize|borderColor|alignment|textBorderSize)\s*=\s*(.+?)\s*;$/);
          if (curMatch && curMatch[1] === objName) {
            props[curMatch[2]] = curMatch[3];
            i++;
          } else {
            break;
          }
        }

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

          if (props.borderSize) {
            result.push(indent + objName + ".borderSize = " + props.borderSize + ";");
          }
          if (props.textBorderSize) {
            result.push(indent + objName + ".borderSize = " + props.textBorderSize + ";");
          }
        } else {
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

  // =============================================
  // FIX 9: Rename borderSize variable to textBorderSize
  // =============================================
  // Avoids conflict with FlxText.borderSize property.
  // Only renames script-level variables, not property access like obj.borderSize.

  function renameBorderSizeConflict(lines) {
    // Check if borderSize is declared as a script variable
    var hasBorderSizeVar = false;
    for (var i = 0; i < lines.length; i++) {
      if (/^\s*var\s+borderSize\b/.test(lines[i])) {
        hasBorderSizeVar = true;
        break;
      }
    }

    if (!hasBorderSizeVar) return lines;

    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      // Only rename standalone borderSize references, not .borderSize property access
      // Match: var borderSize, = borderSize, (borderSize, borderSize; etc.
      // But NOT: obj.borderSize
      line = line.replace(/(?<!\.)(\b)borderSize(\b)(?!\s*\()/g, function (match, pre, post, offset, str) {
        // Check character before the match to ensure it's not after a dot
        var beforeIdx = offset - 1;
        if (beforeIdx >= 0 && str[beforeIdx] === '.') return match;
        return pre + "textBorderSize" + post;
      });
      result.push(line);
    }

    return result;
  }

  // =============================================
  // FIX 10: Hoist variable declarations to function scope top
  // =============================================
  // HScript Iris has flat variable scoping within functions.
  // Variables declared inside loops or if-blocks can cause issues.
  // Move var declarations to the top of each function body.

  function hoistVariablesToFunctionTop(lines) {
    var result = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // Detect function start: function name(args) {
      var funcMatch = trimmed.match(/^function\s+\w+\s*\([^)]*\)\s*\{$/);
      if (funcMatch) {
        var funcIndent = line.match(/^(\s*)/)[1];

        // Collect the entire function body
        result.push(line);
        i++;

        var bodyLines = [];
        var braceDepth = 1;
        while (i < lines.length && braceDepth > 0) {
          var bline = lines[i];
          braceDepth += (bline.match(/\{/g) || []).length;
          braceDepth -= (bline.match(/\}/g) || []).length;
          if (braceDepth > 0) {
            bodyLines.push(bline);
          } else {
            // This is the closing brace
            break;
          }
          i++;
        }

        // Derive body indent from first non-blank body line
        var bodyIndent = funcIndent + "\t";
        for (var b = 0; b < bodyLines.length; b++) {
          if (bodyLines[b].trim()) {
            bodyIndent = bodyLines[b].match(/^(\s*)/)[1];
            break;
          }
        }

        // Scan body for var declarations inside nested scopes (loops, if-blocks)
        // Track which vars are declared at function-top level vs nested
        var topLevelVars = {};     // vars already at top level (depth 0)
        var nestedVars = {};       // vars declared inside nested scopes
        var nestedVarDefaults = {};
        var depth = 0;

        for (var b = 0; b < bodyLines.length; b++) {
          var bl = bodyLines[b];
          var bt = bl.trim();

          // Track brace depth within function body
          var opens = (bt.match(/\{/g) || []).length;
          var closes = (bt.match(/\}/g) || []).length;

          // Check for var declaration
          var varDeclMatch = bt.match(/^var\s+(\w+)(?::(\w+))?\s*(?:=\s*(.+?))?\s*;$/);
          if (varDeclMatch) {
            var vName = varDeclMatch[1];
            var vType = varDeclMatch[2] || null;
            var vInit = varDeclMatch[3] || null;

            if (depth === 0) {
              topLevelVars[vName] = true;
            } else {
              // This var is inside a nested scope - needs hoisting
              if (!topLevelVars[vName] && !nestedVars[vName]) {
                nestedVars[vName] = vType;
                // Determine appropriate default value
                if (vInit === null || vInit === 'null') {
                  nestedVarDefaults[vName] = 'null';
                } else if (vInit === '0' || vInit === '0.0') {
                  nestedVarDefaults[vName] = '0';
                } else if (vInit === "''") {
                  nestedVarDefaults[vName] = "''";
                } else if (vInit === 'false' || vInit === 'true') {
                  nestedVarDefaults[vName] = vInit;
                } else {
                  nestedVarDefaults[vName] = 'null';
                }
              }
            }
          }

          depth += opens - closes;
        }

        // If there are nested vars to hoist, process the body
        if (Object.keys(nestedVars).length > 0) {
          // Find insertion point: after existing top-level var declarations
          var insertIdx = 0;
          for (var b = 0; b < bodyLines.length; b++) {
            var bt = bodyLines[b].trim();
            if (/^var\s+\w+/.test(bt) || bt === '' || /^\/\//.test(bt)) {
              insertIdx = b + 1;
            } else {
              break;
            }
          }

          // Insert hoisted declarations
          var hoisted = [];
          for (var vn in nestedVars) {
            var typeAnnotation = nestedVars[vn] ? (":" + nestedVars[vn]) : "";
            hoisted.push(bodyIndent + "var " + vn + typeAnnotation + " = " + nestedVarDefaults[vn] + ";");
          }

          // Insert hoisted vars at the insertion point
          for (var h = hoisted.length - 1; h >= 0; h--) {
            bodyLines.splice(insertIdx, 0, hoisted[h]);
          }

          // Now remove 'var' from the original nested declarations (keep the assignment)
          for (var b = 0; b < bodyLines.length; b++) {
            var bt = bodyLines[b].trim();
            var nestedDeclMatch = bt.match(/^var\s+(\w+)(?::\w+)?\s*=\s*(.+?)\s*;$/);
            if (nestedDeclMatch && nestedVars.hasOwnProperty(nestedDeclMatch[1]) && b >= insertIdx + hoisted.length) {
              var bIndent = bodyLines[b].match(/^(\s*)/)[1];
              bodyLines[b] = bIndent + nestedDeclMatch[1] + " = " + nestedDeclMatch[2] + ";";
            } else {
              // Also handle var-only declarations (no init) inside nested scopes — remove entirely
              var nestedDeclOnlyMatch = bt.match(/^var\s+(\w+)(?::\w+)?\s*;$/);
              if (nestedDeclOnlyMatch && nestedVars.hasOwnProperty(nestedDeclOnlyMatch[1]) && b >= insertIdx + hoisted.length) {
                bodyLines[b] = null; // mark for removal
              }
            }
          }

          // Remove null-marked lines
          bodyLines = bodyLines.filter(function (l) { return l !== null; });
        }

        // Push processed body
        for (var b = 0; b < bodyLines.length; b++) {
          result.push(bodyLines[b]);
        }

        // Push closing brace
        if (i < lines.length) {
          result.push(lines[i]);
        }
        i++;
        continue;
      }

      result.push(line);
      i++;
    }

    return result;
  }
})();
