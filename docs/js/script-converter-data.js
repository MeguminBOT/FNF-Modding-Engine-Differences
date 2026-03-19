// =============================================
// SCRIPT CONVERTER — SHARED DATA & MAPPINGS
// =============================================
// All mapping objects used across conversion modules.
// Exposed on window.ScriptConverter namespace.

(function () {
  var SC = window.ScriptConverter = window.ScriptConverter || {};

  // Language labels for display
  SC.langLabels = {
    "lua": "Psych Lua",
    "psych-hx": "Psych HScript Iris",
    "funkin-hx": "Official Funkin HScript",
    "codename-hx": "Codename HScript"
  };

  // =============================================
  // LUA ↔ PSYCH HSCRIPT MAPPINGS
  // =============================================

  // Psych built-in variables mapping (Lua -> Psych HScript)
  SC.luaVarToHScript = {
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
    "screenHeight": "FlxG.height",
    "crochet": "Conductor.crochet",
    "stepCrochet": "Conductor.stepCrochet",
    "songPath": "Paths.formatToSongPath(PlayState.SONG.song)",
    "startedCountdown": "game.startedCountdown",
    "curStage": "PlayState.SONG.stage",
    "hasVocals": "PlayState.SONG.needsVoices",
    "seenCutscene": "PlayState.seenCutscene",
    "healthGainMult": "game.healthGain",
    "healthLossMult": "game.healthLoss",
    "playbackRate": "game.playbackRate",
    "guitarHeroSustains": "game.guitarHeroSustains",
    "instakillOnMiss": "game.instakillOnMiss",
    "botPlay": "game.cpuControlled",
    "ratingName": "game.ratingName",
    "ratingFC": "game.ratingFC",
    "totalPlayed": "game.totalPlayed",
    "totalNotesHit": "game.totalNotesHit",
    "defaultBoyfriendX": "game.BF_X",
    "defaultBoyfriendY": "game.BF_Y",
    "defaultOpponentX": "game.DAD_X",
    "defaultOpponentY": "game.DAD_Y",
    "defaultGirlfriendX": "game.GF_X",
    "defaultGirlfriendY": "game.GF_Y",
    "timeBarType": "ClientPrefs.data.timeBarType"
  };

  SC.cameraMap = {
    "camGame": "game.camGame",
    "camHUD": "game.camHUD",
    "camOther": "game.camOther"
  };

  // Psych Lua note callbacks receive decomposed primitives;
  // HScript receives the full Note object. Map positions to Note fields.
  SC.luaNoteCallbackFields = {
    "goodNoteHit": [null, "note.noteData", "note.noteType", "note.isSustainNote"],
    "opponentNoteHit": [null, "note.noteData", "note.noteType", "note.isSustainNote"],
    "noteMiss": [null, "note.noteData", "note.noteType", "note.isSustainNote"],
    "goodNoteHitPre": [null, "note.noteData", "note.noteType", "note.isSustainNote"],
    "opponentNoteHitPre": [null, "note.noteData", "note.noteType", "note.isSustainNote"],
    "onSpawnNote": [null, "note.noteData", "note.noteType", "note.isSustainNote", "note.strumTime"]
  };

  // Reverse mapping: HScript -> Lua built-in variables
  SC.hscriptVarToLua = {};
  for (var k in SC.luaVarToHScript) {
    SC.hscriptVarToLua[SC.luaVarToHScript[k]] = k;
  }

  // HScript note callback → Lua decomposed param mapping (reverse of luaNoteCallbackFields)
  SC.hscriptNoteCallbackLuaParams = {
    "goodNoteHit": ["id", "direction", "noteType", "isSustainNote"],
    "opponentNoteHit": ["id", "direction", "noteType", "isSustainNote"],
    "noteMiss": ["id", "direction", "noteType", "isSustainNote"],
    "goodNoteHitPre": ["id", "direction", "noteType", "isSustainNote"],
    "opponentNoteHitPre": ["id", "direction", "noteType", "isSustainNote"],
    "onSpawnNote": ["id", "data", "type", "isSustain", "strumTime"]
  };

  // Note property → Lua param name for reverse mapping
  SC.noteFieldToLuaParam = {
    "noteData": 1,
    "noteType": 2,
    "isSustainNote": 3,
    "strumTime": 4
  };

  // =============================================
  // HSCRIPT VARIANT CALLBACK MAPPINGS
  // =============================================

  // --- Psych → Codename ---
  SC.psychToCodenameCallbacks = {
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

  SC.codenameToPsychCallbacks = {};
  for (var pk in SC.psychToCodenameCallbacks) {
    SC.codenameToPsychCallbacks[SC.psychToCodenameCallbacks[pk]] = pk;
  }

  // Codename callbacks that receive event objects instead of direct args
  SC.codenameEventCallbacks = {
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
  SC.codenameEventDirectProps = {
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

  // --- Psych → Funkin ---
  SC.psychToFunkinCallbacks = {
    "onEndSong": "onSongEnd",
    "onStartCountdown": "onCountdownStart",
    "onCountdownTick": "onCountdownStep",
    "onEvent": "onSongEvent",
    "goodNoteHit": "onNoteHit",
    "opponentNoteHit": "onNoteHit",
    "noteMiss": "onNoteMiss",
    "noteMissPress": "onNoteGhostMiss"
  };

  // Build reverse mapping (Funkin → Psych)
  SC.funkinToPsychCallbacks = {};
  for (var pk in SC.psychToFunkinCallbacks) {
    if (!SC.funkinToPsychCallbacks[SC.psychToFunkinCallbacks[pk]]) {
      SC.funkinToPsychCallbacks[SC.psychToFunkinCallbacks[pk]] = pk;
    }
  }

  // Psych callbacks that receive ScriptEvent objects in Funkin
  SC.funkinEventCallbacks = {
    "onCreate": "ScriptEvent",
    "onCreatePost": "ScriptEvent",
    "onUpdate": "UpdateScriptEvent",
    "onUpdatePost": "UpdateScriptEvent",
    "onDestroy": "ScriptEvent",
    "onSongStart": "ScriptEvent",
    "onSongEnd": "ScriptEvent",
    "onCountdownStart": "CountdownScriptEvent",
    "onCountdownStep": "CountdownScriptEvent",
    "onBeatHit": "SongTimeScriptEvent",
    "onStepHit": "SongTimeScriptEvent",
    "onNoteHit": "HitNoteScriptEvent",
    "onNoteMiss": "NoteScriptEvent",
    "onNoteGhostMiss": "GhostMissNoteScriptEvent",
    "onSongEvent": "SongEventScriptEvent",
    "onPause": "PauseScriptEvent",
    "onResume": "ScriptEvent",
    "onGameOver": "ScriptEvent",
    "onSongRetry": "SongRetryEvent",
    "onCountdownEnd": "CountdownScriptEvent",
    "onSongLoaded": "SongLoadScriptEvent",
    "onNoteIncoming": "NoteScriptEvent"
  };

  // Funkin HitNoteScriptEvent / NoteScriptEvent fields (on event, not event.note)
  SC.funkinHitNoteFields = {
    "note": true,
    "judgement": true,
    "score": true,
    "healthChange": true,
    "comboCount": true,
    "isComboBreak": true,
    "hitDiff": true,
    "doesNotesplash": true,
    "playSound": true
  };

  // Psych callbacks with no Funkin equivalent — flagged during conversion
  SC.psychOnlyCallbacks = {
    "onSpawnNote": "Note spawn not available in Funkin",
    "onMoveCamera": "Camera movement not exposed via callbacks in Funkin",
    "onSectionHit": "Section events not used in Funkin",
    "onRecalculateRating": "Rating recalculation not available in Funkin",
    "onEventPushed": "Event preloading not available in Funkin",
    "onKeyPress": "Direct key input not exposed in Funkin",
    "onKeyRelease": "Direct key input not exposed in Funkin",
    "onKeyPressPre": "Pre-key input not exposed in Funkin",
    "onKeyReleasePre": "Pre-key release not exposed in Funkin",
    "onGhostTap": "Ghost tap events not exposed in Funkin",
    "goodNoteHitPre": "Pre-processing callbacks not available in Funkin",
    "opponentNoteHitPre": "Pre-processing callbacks not available in Funkin",
    "preUpdateScore": "Score update hooks not available in Funkin",
    "onUpdateScore": "Score update hooks not available in Funkin",
    "onCountdownStarted": "Use onCountdownStart instead",
    "onNextDialogue": "Dialogue system differs in Funkin (see onDialogueStart/onDialogueLine)",
    "onSkipDialogue": "Dialogue skip not available in Funkin",
    "onTweenCompleted": "Use FlxTween onComplete callback instead",
    "onTimerCompleted": "Use FlxTimer onComplete callback instead",
    "onSoundFinished": "Sound complete callbacks handled differently in Funkin",
    "onCustomSubstateCreate": "Custom substates not available in Funkin",
    "onCustomSubstateCreatePost": "Custom substates not available in Funkin",
    "onCustomSubstateUpdate": "Custom substates not available in Funkin",
    "onCustomSubstateDestroy": "Custom substates not available in Funkin"
  };

  // =============================================
  // CONDUCTOR & PLAYSTATE FIELD MAPPINGS
  // =============================================

  // Conductor field remapping: Psych (static) -> Funkin (instance-based)
  SC.psychToFunkinConductor = {
    "Conductor.bpm": "Conductor.instance.bpm",
    "Conductor.songPosition": "Conductor.instance.songPosition",
    "Conductor.crochet": "Conductor.instance.beatLengthMs",
    "Conductor.stepCrochet": "Conductor.instance.stepLengthMs",
    "Conductor.offset": "Conductor.instance.instrumentalOffset",
    "Conductor.safeZoneOffset": "Conductor.instance.judgeWindow"
  };

  // Psych PlayState property -> Funkin equivalent
  SC.psychToFunkinPlayState = {
    "game.SONG": "// [Psych-specific] PlayState.SONG",
    "game.songMisses": "PlayState.instance.songScore /* misses not directly exposed */",
    "game.songHits": "PlayState.instance.songScore /* hits not directly exposed */",
    "game.songScore": "PlayState.instance.songScore",
    "game.health": "PlayState.instance.health",
    "game.combo": "PlayState.instance.combo",
    "game.isDead": "PlayState.instance.isPlayerDying",
    "game.mustHitSection": "// [Psych-specific] game.mustHitSection",
    "game.startedCountdown": "PlayState.instance.isCountdownStarted"
  };
})();
