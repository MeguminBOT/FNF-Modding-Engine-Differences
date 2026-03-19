// =============================================
// SCRIPT CONVERTER — ANALYSIS & ANNOTATION
// =============================================
// Conversion quality analysis, annotation, and display.
// Depends on: script-converter-data.js (SC namespace)

(function () {
  var SC = window.ScriptConverter;

  SC.analyzeAndAnnotate = function (input, output, sourceLang, targetLang) {
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
      // Codename-specific markers
      { regex: /event\.cancel\(\);\s*return;/, sev: "info", msg: "Flow control adapted: Function_Stop \u2192 event.cancel()" },
      { regex: /\/\*\s*Function_Stop\s*->.*event\.cancel/, sev: "info", msg: "Flow control adapted to event.cancel()" },
      { regex: /\/\*\s*Function_StopAll\s*->.*event\.cancel/, sev: "info", msg: "Flow control adapted to event.cancel()" },
      { regex: /\/\*\s*Function_Continue\s*-\s*default in Codename/, sev: "info", msg: "Function_Continue \u2014 default in Codename (no action needed)" },
      { regex: /\/\/\s*return;\s*\/\/\s*Function_Continue.*default in Codename/, sev: "info", msg: "Function_Continue removed \u2014 default in Codename" },
      { regex: /\/\/\s*event\.\w+\(\)\s*-\s*Codename-specific/, sev: "warning", msg: "Codename event method \u2014 no Psych equivalent" },
      { regex: /\/\*\s*event\.\w+\s*-\s*Codename event property/, sev: "warning", msg: "Codename event property \u2014 adapt manually" },
      // Funkin-specific markers
      { regex: /event\.cancel\(\);\s*return;/, sev: "info", msg: "Flow control adapted: Function_Stop \u2192 event.cancel()" },
      { regex: /\/\*\s*Function_Stop\s*->.*event\.cancel/, sev: "info", msg: "Flow control adapted to event.cancel()" },
      { regex: /\/\*\s*Function_StopAll\s*\*\//, sev: "info", msg: "Function_StopAll adapted to event.cancel()" },
      { regex: /\/\*\s*Function_Continue\s*-\s*default in Funkin/, sev: "info", msg: "Function_Continue \u2014 default in Funkin (no action needed)" },
      { regex: /\/\/\s*return;\s*\/\/\s*Function_Continue.*default in Funkin/, sev: "info", msg: "Function_Continue removed \u2014 default in Funkin" },
      { regex: /\/\*\s*event\.\w+\s*-\s*Funkin HitNoteScriptEvent/, sev: "warning", msg: "Funkin HitNoteScriptEvent field \u2014 adapt manually for Psych" },
      { regex: /currentStage\.getBoyfriend\(\)/, sev: "info", msg: "Character access adapted: game.boyfriend \u2192 currentStage.getBoyfriend()" },
      { regex: /currentStage\.getDad\(\)/, sev: "info", msg: "Character access adapted: game.dad \u2192 currentStage.getDad()" },
      { regex: /currentStage\.getGirlfriend\(\)/, sev: "info", msg: "Character access adapted: game.gf \u2192 currentStage.getGirlfriend()" },
      { regex: /Conductor\.instance\.\w+/, sev: "info", msg: "Conductor access adapted to instance-based (Funkin style)" },
      // Psych Lua → HScript conversion comments
      { regex: /\/\/\s*initLuaShader\s*-\s*In HScript/, sev: "info", msg: "Shader initialization — converted to FlxRuntimeShader guidance" },
      { regex: /\/\/\s*initSaveData\(/, sev: "info", msg: "Lua save system — use FlxG.save in HScript" },
      { regex: /\/\/\s*setDataFromSave\s*-\s*In HScript/, sev: "info", msg: "Save data write — converted to FlxG.save guidance" },
      { regex: /\/\/\s*runHaxeCode\(\)\s*-\s*Lua-only/, sev: "info", msg: "runHaxeCode() removed — write Haxe directly in HScript" },
      { regex: /\/\/\s*cancelTween\s*-\s*In HScript/, sev: "warning", msg: "cancelTween needs manual work — store tween reference" },
      { regex: /\/\/\s*cancelTimer\s*-\s*In HScript/, sev: "warning", msg: "cancelTimer needs manual work — store timer reference" },
      { regex: /\/\/\s*(stop|pause|resume)Sound\(/, sev: "warning", msg: "Sound control needs stored sound reference in HScript" },
      { regex: /\/\/\s*soundFadeCancel\(/, sev: "warning", msg: "Sound fade cancel needs stored sound reference" },
      { regex: /\/\/\s*setSoundVolume\s*-\s*In HScript/, sev: "warning", msg: "Sound property setter needs stored sound reference" },
      { regex: /\/\/\s*isRunning\(.*Lua-only/, sev: "warning", msg: "isRunning() is Lua-only — no HScript equivalent" },
      { regex: /--\s*TODO:\s*use setProperty/, sev: "warning", msg: "HScript→Lua: property access needs manual adaptation" },
      { regex: /--\s*TODO:\s*use setPropertyFromClass/, sev: "warning", msg: "HScript→Lua: class property access needs manual adaptation" }
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
  };

  SC.displayAnalysis = function (analysis) {
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
  };

  SC.clearAnalysis = function () {
    var el = document.getElementById('script-analysis');
    if (el) el.style.display = 'none';
  };
})();
