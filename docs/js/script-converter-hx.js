// =============================================
// SCRIPT CONVERTER — HSCRIPT VARIANT TRANSFORMS
// =============================================
// Conversions between HScript variants: Psych ↔ Funkin, Psych ↔ Codename.
// Depends on: script-converter-data.js (SC namespace)

(function () {
  var SC = window.ScriptConverter;

  // =============================================
  // PSYCH HSCRIPT → FUNKIN HSCRIPT
  // =============================================

  SC.psychHxToFunkinHx = function (code) {
    var lines = code.split("\n");
    var result = [];
    var inEventCallback = false;
    var braceDepth = 0;
    var currentCallbackName = null;
    var currentEventType = null;
    var originalNoteParam = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Function declarations: rename and adjust callbacks
      var funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var findent = funcMatch[1];
        var fname = funcMatch[2];
        var fargs = funcMatch[3].trim();
        var funkinName = SC.psychToFunkinCallbacks[fname] || fname;
        var eventType = SC.funkinEventCallbacks[funkinName];

        if (eventType) {
          currentCallbackName = funkinName;
          currentEventType = eventType;
          inEventCallback = true;
          braceDepth = 0;

          if (funkinName === "onNoteHit" || funkinName === "onNoteMiss") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else if (funkinName === "onNoteGhostMiss") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else if (funkinName === "onUpdate" || funkinName === "onUpdatePost") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else if (funkinName === "onCountdownStart" || funkinName === "onCountdownStep") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else if (funkinName === "onSongEvent") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else if (funkinName === "onBeatHit" || funkinName === "onStepHit") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else if (funkinName === "onPause" || funkinName === "onGameOver") {
            originalNoteParam = fargs || null;
            fargs = "event";
          } else {
            originalNoteParam = null;
            if (!fargs) fargs = "event";
          }

          line = findent + "function " + funkinName + "(" + fargs + ") {";
        } else {
          var psychOnlyMsg = SC.psychOnlyCallbacks[fname];
          if (psychOnlyMsg) {
            line = findent + "// [Psych-specific] " + psychOnlyMsg + "\n" + line;
          }
          inEventCallback = false;
          currentCallbackName = null;
          currentEventType = null;
          originalNoteParam = null;
        }
      }

      // Track brace depth to know when callback ends
      if (inEventCallback) {
        var opens = (line.match(/\{/g) || []).length;
        var closes = (line.match(/\}/g) || []).length;
        braceDepth += opens - closes;
        if (braceDepth < 0) {
          inEventCallback = false;
          currentCallbackName = null;
          currentEventType = null;
          originalNoteParam = null;
          braceDepth = 0;
        }
      }

      // Inside event callbacks, remap parameter accesses
      if (inEventCallback && !funcMatch) {
        if (currentEventType === "UpdateScriptEvent" && originalNoteParam) {
          var elapsedRegex = new RegExp("\\b" + originalNoteParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "g");
          line = line.replace(elapsedRegex, "event.elapsed");
        }

        if (currentEventType === "SongTimeScriptEvent") {
          line = line.replace(/\bcurBeat\b/g, "event.beat");
          line = line.replace(/\bcurStep\b/g, "event.step");
        }

        if ((currentCallbackName === "onNoteHit" || currentCallbackName === "onNoteMiss") && originalNoteParam) {
          var noteParamEsc = originalNoteParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var propRegex = new RegExp("\\b" + noteParamEsc + "\\.(\\w+)", "g");
          line = line.replace(propRegex, function(match, prop) {
            if (prop === "noteData") return "event.note.direction";
            if (prop === "noteType") return "event.note.kind";
            if (prop === "strumTime") return "event.note.strumTime";
            if (prop === "isSustainNote") return "event.note.isHoldNote";
            if (prop === "mustPress") return "event.note.noteData.getMustHitNote()";
            if (SC.funkinHitNoteFields[prop]) return "event." + prop;
            return "event.note." + prop;
          });
          var bareRegex = new RegExp("\\b" + noteParamEsc + "\\b(?!\\.)", "g");
          line = line.replace(bareRegex, "event.note");
        }

        if (currentCallbackName === "onNoteGhostMiss" && originalNoteParam) {
          var dirParamEsc = originalNoteParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var dirRegex = new RegExp("\\b" + dirParamEsc + "\\b", "g");
          line = line.replace(dirRegex, "event.dir");
        }

        if (currentEventType === "CountdownScriptEvent" && originalNoteParam) {
          var counterEsc = originalNoteParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var counterRegex = new RegExp("\\b" + counterEsc + "\\b", "g");
          line = line.replace(counterRegex, "event.step");
        }

        if (currentEventType === "SongEventScriptEvent" && originalNoteParam) {
          line = line.replace(/\beventName\b/g, "event.eventData.event");
          line = line.replace(/\bv1\b/g, "event.eventData.value1");
          line = line.replace(/\bv2\b/g, "event.eventData.value2");
        }
      }

      // Replace game. -> PlayState.instance.
      line = line.replace(/\bgame\./g, "PlayState.instance.");

      // Character access: Funkin accesses characters via currentStage methods
      line = line.replace(/PlayState\.instance\.boyfriend\b/g, "PlayState.instance.currentStage.getBoyfriend()");
      line = line.replace(/PlayState\.instance\.dad\b/g, "PlayState.instance.currentStage.getDad()");
      line = line.replace(/PlayState\.instance\.gf\b/g, "PlayState.instance.currentStage.getGirlfriend()");

      // Replace .playAnim( -> .playAnimation(
      line = line.replace(/\.playAnim\s*\(/g, ".playAnimation(");

      // Conductor static -> instance-based
      for (var ck in SC.psychToFunkinConductor) {
        var escaped = ck.replace(/\./g, "\\.");
        var regex = new RegExp(escaped, "g");
        line = line.replace(regex, SC.psychToFunkinConductor[ck]);
      }

      // Psych Note fields -> Funkin NoteSprite fields (outside event callbacks)
      if (!inEventCallback) {
        line = line.replace(/\.noteData\b/g, ".direction");
        line = line.replace(/\.noteType\b/g, ".kind");
        line = line.replace(/\.isSustainNote\b/g, ".isHoldNote");
        line = line.replace(/\.wasGoodHit\b/g, ".hasBeenHit");
        line = line.replace(/(note\w*\.)missed\b/g, "$1hasMissed");
      }

      // Psych curCharacter -> Funkin characterId
      line = line.replace(/\.curCharacter\b/g, ".characterId");

      // ClientPrefs.data.* -> comment
      if (/ClientPrefs\.data\.\w+/.test(line)) {
        var cpIndent = line.match(/^(\s*)/)[1];
        line = cpIndent + "// [Psych-specific] " + line.trim();
      }

      // PlayState.SONG.* -> comment
      if (/PlayState\.SONG\.\w+/.test(line)) {
        var psIndent = line.match(/^(\s*)/)[1];
        line = psIndent + "// [Psych-specific] " + line.trim();
      }

      // Psych-specific flow control -> Funkin event.cancel()
      line = line.replace(/\breturn\s+Function_Stop\s*;/g, "event.cancel(); return;");
      line = line.replace(/\bFunction_Stop\b/g, "/* Function_Stop -> use event.cancel() */");
      line = line.replace(/\breturn\s+Function_Continue\s*;/g, "// return; // Function_Continue is default in Funkin");
      line = line.replace(/\bFunction_Continue\b/g, "/* Function_Continue - default in Funkin (no action needed) */");
      line = line.replace(/\bFunction_StopLua\b/g, "/* Function_StopLua - Psych-only */");
      line = line.replace(/\bFunction_StopHScript\b/g, "/* Function_StopHScript - Psych-only */");
      line = line.replace(/\bFunction_StopAll\b/g, "event.cancel(); /* Function_StopAll */");

      // Psych scoring functions
      line = line.replace(/\baddScore\s*\((.+?)\)\s*;/g, "PlayState.instance.songScore += $1;");
      line = line.replace(/\bsetScore\s*\((.+?)\)\s*;/g, "PlayState.instance.songScore = $1;");
      line = line.replace(/\baddHealth\s*\((.+?)\)\s*;/g, "PlayState.instance.health += $1;");
      line = line.replace(/\bsetHealth\s*\((.+?)\)\s*;/g, "PlayState.instance.health = $1;");

      // triggerEvent -> comment
      line = line.replace(/\bgame\.triggerEvent\b/g, "// [Psych-specific] triggerEvent");

      result.push(line);
    }

    return result.join("\n");
  };

  // =============================================
  // PSYCH HSCRIPT → CODENAME HSCRIPT
  // =============================================

  SC.psychHxToCodenameHx = function (code) {
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
        var cnName = SC.psychToCodenameCallbacks[fname];
        if (cnName) {
          if (SC.codenameEventCallbacks[cnName]) {
            currentNoteParam = args.trim() || null;
            inEventCallback = true;
            braceDepth = 0;
            eventBraceStart = 0;
            args = "event";
          } else {
            inEventCallback = false;
            currentNoteParam = null;
          }
          if (cnName === "beatHit" && !args.trim()) args = "curBeat";
          if (cnName === "stepHit" && !args.trim()) args = "curStep";
          line = funcMatch[1] + "function " + cnName + "(" + args + ") {";
        } else {
          inEventCallback = false;
          currentNoteParam = null;
        }
      }

      // Track brace depth
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
        var noteParamEsc = currentNoteParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var propRegex = new RegExp("\\b" + noteParamEsc + "\\.(\\w+)", "g");
        line = line.replace(propRegex, function(match, prop) {
          if (SC.codenameEventDirectProps[prop]) {
            return "event." + prop;
          }
          return "event.note." + prop;
        });
        var bareRegex = new RegExp("\\b" + noteParamEsc + "\\b(?!\\.)", "g");
        line = line.replace(bareRegex, "event.note");
      }

      // Remove game. prefix (Codename has direct access)
      line = line.replace(/\bgame\./g, "");

      // ClientPrefs.data.* -> comment
      if (/ClientPrefs\.data\.\w+/.test(line)) {
        var cpIndent = line.match(/^(\s*)/)[1];
        line = cpIndent + "// [Psych-specific] " + line.trim();
      }

      // PlayState.SONG.* -> comment
      if (/PlayState\.SONG\.\w+/.test(line)) {
        var psIndent = line.match(/^(\s*)/)[1];
        line = psIndent + "// [Psych-specific] " + line.trim();
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
      line = line.replace(/\breturn\s+Function_Continue\s*;/g, "// return; // Function_Continue is the default in Codename");
      line = line.replace(/\bFunction_Continue\b/g, "/* Function_Continue - default in Codename (no action needed) */");
      line = line.replace(/\breturn\s+Function_StopLua\s*;/g, "// return Function_StopLua; // Psych-only: stops Lua scripts");
      line = line.replace(/\bFunction_StopLua\b/g, "/* Function_StopLua - Psych-only */");
      line = line.replace(/\breturn\s+Function_StopHScript\s*;/g, "// return Function_StopHScript; // Psych-only: stops HScript");
      line = line.replace(/\bFunction_StopHScript\b/g, "/* Function_StopHScript - Psych-only */");

      result.push(line);
    }

    return result.join("\n");
  };

  // =============================================
  // FUNKIN HSCRIPT → PSYCH HSCRIPT
  // =============================================

  SC.funkinHxToPsychHx = function (code) {
    var lines = code.split("\n");
    var result = [];
    var inEventCallback = false;
    var braceDepth = 0;
    var currentPsychCallback = null;
    var currentFunkinCallback = null;

    // Reverse Conductor mapping
    var funkinToPsychConductor = {};
    for (var ck in SC.psychToFunkinConductor) {
      funkinToPsychConductor[SC.psychToFunkinConductor[ck]] = ck;
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      // Function declarations: rename callbacks back to Psych names
      var funcMatch = line.match(/^(\s*)function\s+(\w+)\s*\(([^)]*)\)\s*\{/);
      if (funcMatch) {
        var findent = funcMatch[1];
        var fname = funcMatch[2];
        var fargs = funcMatch[3].trim();
        var psychName = SC.funkinToPsychCallbacks[fname] || fname;

        var eventType = SC.funkinEventCallbacks[fname];
        if (eventType) {
          currentFunkinCallback = fname;
          currentPsychCallback = psychName;
          inEventCallback = true;
          braceDepth = 0;

          if (psychName === "goodNoteHit" || psychName === "noteMiss" || psychName === "opponentNoteHit") {
            fargs = "note";
          } else if (psychName === "onUpdate" || psychName === "onUpdatePost") {
            fargs = "elapsed";
          } else if (psychName === "onBeatHit" || psychName === "onStepHit") {
            fargs = "";
          } else if (psychName === "onCountdownTick") {
            fargs = "counter";
          } else if (psychName === "onStartCountdown" || psychName === "onEndSong") {
            fargs = "";
          } else if (psychName === "onEvent") {
            fargs = "eventName, v1, v2";
          } else if (psychName === "noteMissPress") {
            fargs = "direction";
          } else {
            fargs = "";
          }

          line = findent + "function " + psychName + "(" + fargs + ") {";
        } else {
          inEventCallback = false;
          currentPsychCallback = null;
          currentFunkinCallback = null;
        }
      }

      // Track brace depth for callback scope
      if (inEventCallback) {
        var opens = (line.match(/\{/g) || []).length;
        var closes = (line.match(/\}/g) || []).length;
        braceDepth += opens - closes;
        if (braceDepth < 0) {
          inEventCallback = false;
          currentPsychCallback = null;
          currentFunkinCallback = null;
          braceDepth = 0;
        }
      }

      // Inside event callbacks, remap event accesses back to Psych style
      if (inEventCallback && !funcMatch) {
        if (currentPsychCallback === "onUpdate" || currentPsychCallback === "onUpdatePost") {
          line = line.replace(/\bevent\.elapsed\b/g, "elapsed");
        }

        if (currentPsychCallback === "onBeatHit" || currentPsychCallback === "onStepHit") {
          line = line.replace(/\bevent\.beat\b/g, "curBeat");
          line = line.replace(/\bevent\.step\b/g, "curStep");
        }

        if (currentPsychCallback === "goodNoteHit" || currentPsychCallback === "noteMiss" || currentPsychCallback === "opponentNoteHit") {
          line = line.replace(/\bevent\.note\.direction\b/g, "note.noteData");
          line = line.replace(/\bevent\.note\.kind\b/g, "note.noteType");
          line = line.replace(/\bevent\.note\.isHoldNote\b/g, "note.isSustainNote");
          line = line.replace(/\bevent\.note\.strumTime\b/g, "note.strumTime");
          line = line.replace(/\bevent\.note\.noteData\.getMustHitNote\(\)/g, "note.mustPress");
          line = line.replace(/\bevent\.note\.(\w+)/g, "note.$1");
          line = line.replace(/\bevent\.note\b(?!\.)/g, "note");
          line = line.replace(/\bevent\.(judgement|score|healthChange|comboCount|isComboBreak|hitDiff|doesNotesplash|playSound)\b/g,
            "/* event.$1 - Funkin HitNoteScriptEvent field, adapt manually */");
        }

        if (currentPsychCallback === "noteMissPress") {
          line = line.replace(/\bevent\.dir\b/g, "direction");
          line = line.replace(/\bevent\.healthChange\b/g, "/* event.healthChange - Funkin GhostMissNoteScriptEvent field */");
          line = line.replace(/\bevent\.scoreChange\b/g, "/* event.scoreChange - Funkin GhostMissNoteScriptEvent field */");
        }

        if (currentPsychCallback === "onCountdownTick") {
          line = line.replace(/\bevent\.step\b/g, "counter");
        }

        if (currentPsychCallback === "onEvent") {
          line = line.replace(/\bevent\.eventData\.event\b/g, "eventName");
          line = line.replace(/\bevent\.eventData\.value1\b/g, "v1");
          line = line.replace(/\bevent\.eventData\.value2\b/g, "v2");
        }

        line = line.replace(/\bevent\.cancel(?:Event)?\s*\(\s*\)\s*;?\s*return\s*;?/g, "return Function_Stop;");
        line = line.replace(/\bevent\.cancel(?:Event)?\s*\(\s*\)\s*;?/g, "return Function_Stop;");
      }

      // Character access: Funkin currentStage methods -> Psych direct access
      line = line.replace(/PlayState\.instance\.currentStage\.getBoyfriend\(\)/g, "game.boyfriend");
      line = line.replace(/PlayState\.instance\.currentStage\.getDad\(\)/g, "game.dad");
      line = line.replace(/PlayState\.instance\.currentStage\.getGirlfriend\(\)/g, "game.gf");

      // Replace PlayState.instance. -> game.
      line = line.replace(/\bPlayState\.instance\./g, "game.");

      // Replace .playAnimation( -> .playAnim(
      line = line.replace(/\.playAnimation\s*\(/g, ".playAnim(");

      // Funkin Conductor instance -> Psych static Conductor
      var sortedConductorKeys = Object.keys(funkinToPsychConductor).sort(function(a, b) { return b.length - a.length; });
      for (var ci = 0; ci < sortedConductorKeys.length; ci++) {
        var funkinCond = sortedConductorKeys[ci];
        var escaped = funkinCond.replace(/\./g, "\\.");
        var regex = new RegExp(escaped, "g");
        line = line.replace(regex, funkinToPsychConductor[funkinCond]);
      }

      // Funkin NoteSprite fields -> Psych Note fields (outside event callbacks)
      if (!inEventCallback) {
        line = line.replace(/\.isHoldNote\b/g, ".isSustainNote");
        line = line.replace(/\.hasBeenHit\b/g, ".wasGoodHit");
        line = line.replace(/\.hasMissed\b/g, ".missed");
        line = line.replace(/(note\w*\.)direction\b/g, "$1noteData");
        line = line.replace(/(note\w*\.)kind\b/g, "$1noteType");
      }

      // Funkin characterId -> Psych curCharacter
      line = line.replace(/\.characterId\b/g, ".curCharacter");

      result.push(line);
    }

    return result.join("\n");
  };

  // =============================================
  // CODENAME HSCRIPT → PSYCH HSCRIPT
  // =============================================

  SC.codenameHxToPsychHx = function (code) {
    var lines = code.split("\n");
    var result = [];
    var inEventCallback = false;
    var braceDepth = 0;
    var psychNoteParam = null;

    var barePlayStateProps = [
      "health", "combo", "songScore", "misses",
      "camGame", "camHUD", "camOther",
      "boyfriend", "dad", "gf",
      "strumLines", "notes", "unspawnNotes",
      "defaultCamZoom", "songLength"
    ];

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
        var psName = SC.codenameToPsychCallbacks[fname];
        if (psName) {
          if (SC.codenameEventCallbacks[fname] && args.trim() === "event") {
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
          if (psName === "onBeatHit" || psName === "onStepHit") args = "";
          line = funcMatch[1] + "function " + psName + "(" + args + ") {";
        } else {
          inEventCallback = false;
          psychNoteParam = null;
        }
      }

      // Track brace depth
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
        line = line.replace(/\bevent\.note\.(\w+)/g, psychNoteParam + ".$1");
        line = line.replace(/\bevent\.note\b(?!\.)/g, psychNoteParam);
        line = line.replace(/\bevent\.direction\b/g, psychNoteParam + ".noteData");
        line = line.replace(/\bevent\.(noteType|animSuffix|player)\b/g, psychNoteParam + ".$1");
        line = line.replace(/\bevent\.cancel\s*\(\s*\)\s*;?/g, "return Function_Stop;");
        line = line.replace(/\bevent\.(preventAnim|preventDeletion|preventVocalsUnmute|preventCamZooming|preventSustainClip|preventMissSound|preventResetCombo|preventStunned|preventVocalsMute)\s*\(\s*\)\s*;?/g,
          "// event.$1() - Codename-specific, adapt manually");
        line = line.replace(/\bevent\.(score|accuracy|healthGain|rating|showSplash|deleteNote|unmuteVocals|forceAnim|misses|muteVocals|missSound|missVolume|ghostMiss|gfSad|stunned|resetCombo|playMissSound)\b/g,
          "/* event.$1 - Codename event property */");
      }

      // event.cancel() outside event callbacks
      if (!inEventCallback) {
        line = line.replace(/\bevent\.cancel\s*\(\s*\)\s*;?/g, "return Function_Stop;");
      }

      // Add game. prefix to bare PlayState properties
      for (var p = 0; p < barePlayStateProps.length; p++) {
        var prop = barePlayStateProps[p];
        var propRegex = new RegExp("(?<![.\\w])" + prop + "(?=\\s*[.\\[=;,)])", "g");
        line = line.replace(propRegex, "game." + prop);
      }

      // Add game. prefix to bare methods
      for (var mi = 0; mi < barePlayStateMethods.length; mi++) {
        var method = barePlayStateMethods[mi];
        var methRegex = new RegExp("(?<![.\\w])" + method + "\\s*\\(", "g");
        line = line.replace(methRegex, "game." + method + "(");
      }

      result.push(line);
    }

    return result.join("\n");
  };
})();
