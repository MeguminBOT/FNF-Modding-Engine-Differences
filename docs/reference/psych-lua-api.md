# Psych Engine Lua API Reference

Complete reference for Psych Engine's Lua scripting API — 250+ functions, 60+ global variables, and 45+ callbacks.

---

## Functions

### Script Management

| Function | Parameters | Returns |
|----------|-----------|---------|
| `getRunningScripts` | _(none)_ | `Array<String>` |
| `callScript` | `luaFile, funcName, ?args` | `Dynamic` |
| `isRunning` | `scriptFile` | `Bool` |
| `setVar` | `varName, value` | `Dynamic` |
| `getVar` | `varName` | `Dynamic` |
| `addLuaScript` | `luaFile, ?ignoreAlreadyRunning` | `Void` |
| `addHScript` | `scriptFile, ?ignoreAlreadyRunning` | `Void` |
| `removeLuaScript` | `luaFile` | `Bool` |
| `removeHScript` | `scriptFile` | `Bool` |
| `setOnScripts` | `varName, arg, ?ignoreSelf, ?exclusions` | `Void` |
| `setOnHScript` | `varName, arg, ?ignoreSelf, ?exclusions` | `Void` |
| `setOnLuas` | `varName, arg, ?ignoreSelf, ?exclusions` | `Void` |
| `callOnScripts` | `funcName, ?args, ?ignoreStops, ?excludeScripts, ?excludeValues` | `Dynamic` |
| `callOnLuas` | `funcName, ?args, ?ignoreStops, ?excludeScripts, ?excludeValues` | `Dynamic` |
| `callOnHScript` | `funcName, ?args, ?ignoreStops, ?excludeScripts, ?excludeValues` | `Dynamic` |
| `close` | _(none)_ | `Bool` |
| `runHaxeCode` | `codeToRun, ?varsToBring, ?funcToRun, ?funcArgs` | `Dynamic` |
| `runHaxeFunction` | `funcToRun, ?funcArgs` | `Dynamic` |

### Song Control

| Function | Parameters | Returns |
|----------|-----------|---------|
| `loadSong` | `?name, ?difficultyNum` | `Void` |
| `triggerEvent` | `name, ?value1, ?value2` | `Bool` |
| `startCountdown` | _(none)_ | `Bool` |
| `endSong` | _(none)_ | `Bool` |
| `restartSong` | `?skipTransition` | `Bool` |
| `exitSong` | `?skipTransition` | `Bool` |
| `getSongPosition` | _(none)_ | `Float` |

### Scoring

| Function | Parameters | Returns |
|----------|-----------|---------|
| `addScore` | `value` | `Void` |
| `addMisses` | `value` | `Void` |
| `addHits` | `value` | `Void` |
| `setScore` | `value` | `Void` |
| `setMisses` | `value` | `Void` |
| `setHits` | `value` | `Void` |
| `setHealth` | `value` | `Void` |
| `addHealth` | `value` | `Void` |
| `getHealth` | _(none)_ | `Float` |
| `setRatingPercent` | `value` | `Void` |
| `setRatingName` | `value` | `Void` |
| `setRatingFC` | `value` | `Void` |
| `updateScoreText` | _(none)_ | `Void` |

### Sprites

| Function | Parameters | Returns |
|----------|-----------|---------|
| `makeLuaSprite` | `tag, ?image, ?x, ?y` | `Void` |
| `makeAnimatedLuaSprite` | `tag, ?image, ?x, ?y, ?spriteType` | `Void` |
| `makeGraphic` | `obj, width, height, color` | `Void` |
| `addLuaSprite` | `tag, ?inFront` | `Void` |
| `removeLuaSprite` | `tag, destroy, ?group` | `Void` |
| `luaSpriteExists` | `tag` | `Bool` |
| `loadGraphic` | `variable, image, ?gridX, ?gridY` | `Void` |
| `loadFrames` | `variable, image, spriteType` | `Void` |
| `setGraphicSize` | `obj, x, y, updateHitbox` | `Void` |
| `scaleObject` | `obj, x, y, updateHitbox` | `Void` |
| `updateHitbox` | `obj` | `Void` |
| `screenCenter` | `obj, pos` | `Void` |
| `setScrollFactor` | `obj, scrollX, scrollY` | `Void` |
| `setObjectCamera` | `obj, camera` | `Bool` |
| `setBlendMode` | `obj, blend` | `Bool` |
| `objectsOverlap` | `obj1, obj2` | `Bool` |
| `getObjectOrder` | `obj, ?group` | `Int` |
| `setObjectOrder` | `obj, position, ?group` | `Void` |
| `getPixelColor` | `obj, x, y` | `Int` |

### Animations

| Function | Parameters | Returns |
|----------|-----------|---------|
| `addAnimationByPrefix` | `obj, name, prefix, framerate, loop` | `Bool` |
| `addAnimation` | `obj, name, frames, framerate, loop` | `Bool` |
| `addAnimationByIndices` | `obj, name, prefix, indices, framerate, loop` | `Bool` |
| `playAnim` | `obj, name, ?forced, ?reverse, ?startFrame` | `Bool` |
| `addOffset` | `obj, anim, x, y` | `Bool` |

### FlxAnimate

| Function | Parameters | Returns |
|----------|-----------|---------|
| `makeFlxAnimateSprite` | `tag, ?x, ?y, ?loadFolder` | `Void` |
| `loadAnimateAtlas` | `tag, folderOrImg, ?spriteJson, ?animationJson` | `Void` |
| `addAnimationBySymbol` | `tag, name, symbol, ?framerate, ?loop, ?matX, ?matY` | `Bool` |
| `addAnimationBySymbolIndices` | `tag, name, symbol, ?indices, ?framerate, ?loop, ?matX, ?matY` | `Bool` |

### Tweens

| Function | Parameters | Returns |
|----------|-----------|---------|
| `startTween` | `tag, vars, values, duration, ?options` | `String` |
| `doTweenX` | `tag, vars, value, duration, ?ease` | `String` |
| `doTweenY` | `tag, vars, value, duration, ?ease` | `String` |
| `doTweenAngle` | `tag, vars, value, duration, ?ease` | `String` |
| `doTweenAlpha` | `tag, vars, value, duration, ?ease` | `String` |
| `doTweenZoom` | `tag, camera, value, duration, ?ease` | `String` |
| `doTweenColor` | `tag, vars, targetColor, duration, ?ease` | `String` |
| `noteTweenX` | `tag, note, value, duration, ?ease` | `String` |
| `noteTweenY` | `tag, note, value, duration, ?ease` | `String` |
| `noteTweenAngle` | `tag, note, value, duration, ?ease` | `String` |
| `noteTweenAlpha` | `tag, note, value, duration, ?ease` | `String` |
| `noteTweenDirection` | `tag, note, value, duration, ?ease` | `String` |
| `cancelTween` | `tag` | `Void` |

### Timers

| Function | Parameters | Returns |
|----------|-----------|---------|
| `runTimer` | `tag, time, loops` | `String` |
| `cancelTimer` | `tag` | `Void` |

### Sound

| Function | Parameters | Returns |
|----------|-----------|---------|
| `playMusic` | `sound, ?volume, ?loop` | `Void` |
| `playSound` | `sound, ?volume, ?tag, ?loop` | `String` |
| `stopSound` | `tag` | `Void` |
| `pauseSound` | `tag` | `Void` |
| `resumeSound` | `tag` | `Void` |
| `soundFadeIn` | `tag, duration, fromValue, toValue` | `Void` |
| `soundFadeOut` | `tag, duration, toValue` | `Void` |
| `soundFadeCancel` | `tag` | `Void` |
| `getSoundVolume` | `tag` | `Float` |
| `setSoundVolume` | `tag, value` | `Void` |
| `getSoundTime` | `tag` | `Float` |
| `setSoundTime` | `tag, value` | `Void` |
| `getSoundPitch` | `tag` | `Float` |
| `setSoundPitch` | `tag, value, ?doPause` | `Void` |
| `luaSoundExists` | `tag` | `Bool` |

### Camera

| Function | Parameters | Returns |
|----------|-----------|---------|
| `cameraSetTarget` | `target` — `'gf'`/`'dad'`/`'boyfriend'` | `Void` |
| `setCameraScroll` | `x, y` | `Void` |
| `setCameraFollowPoint` | `x, y` | `Void` |
| `addCameraScroll` | `?x, ?y` | `Void` |
| `addCameraFollowPoint` | `?x, ?y` | `Void` |
| `getCameraScrollX` | _(none)_ | `Float` |
| `getCameraScrollY` | _(none)_ | `Float` |
| `getCameraFollowX` | _(none)_ | `Float` |
| `getCameraFollowY` | _(none)_ | `Float` |
| `cameraShake` | `camera, intensity, duration` | `Void` |
| `cameraFlash` | `camera, color, duration, forced` | `Void` |
| `cameraFade` | `camera, color, duration, forced, ?fadeOut` | `Void` |

### Characters

| Function | Parameters | Returns |
|----------|-----------|---------|
| `getCharacterX` | `type` — `'dad'`/`'gf'`/`'boyfriend'` | `Float` |
| `setCharacterX` | `type, value` | `Void` |
| `getCharacterY` | `type` | `Float` |
| `setCharacterY` | `type, value` | `Void` |
| `characterDance` | `character` | `Void` |
| `addCharacterToList` | `name, type` | `Void` |

### Text

| Function | Parameters | Returns |
|----------|-----------|---------|
| `makeLuaText` | `tag, ?text, ?width, ?x, ?y` | `Void` |
| `setTextString` | `tag, text` | `Bool` |
| `setTextSize` | `tag, size` | `Bool` |
| `setTextWidth` | `tag, width` | `Bool` |
| `setTextHeight` | `tag, height` | `Bool` |
| `setTextAutoSize` | `tag, value` | `Bool` |
| `setTextBorder` | `tag, size, color, ?style` | `Bool` |
| `setTextColor` | `tag, color` | `Bool` |
| `setTextFont` | `tag, newFont` | `Bool` |
| `setTextItalic` | `tag, italic` | `Bool` |
| `setTextAlignment` | `tag, alignment` | `Bool` |
| `getTextString` | `tag` | `String` |
| `getTextSize` | `tag` | `Int` |
| `getTextFont` | `tag` | `String` |
| `getTextWidth` | `tag` | `Float` |
| `addLuaText` | `tag` | `Void` |
| `removeLuaText` | `tag, destroy` | `Void` |
| `luaTextExists` | `tag` | `Bool` |

### Shaders

| Function | Parameters | Returns |
|----------|-----------|---------|
| `removeSpriteShader` | `obj` | `Bool` |
| `getShaderBool` | `obj, prop` | `Bool` |
| `getShaderBoolArray` | `obj, prop` | `Array<Bool>` |
| `getShaderInt` | `obj, prop` | `Int` |
| `getShaderIntArray` | `obj, prop` | `Array<Int>` |
| `getShaderFloat` | `obj, prop` | `Float` |
| `getShaderFloatArray` | `obj, prop` | `Array<Float>` |
| `setShaderBool` | `obj, prop, value` | `Bool` |
| `setShaderBoolArray` | `obj, prop, values` | `Bool` |
| `setShaderInt` | `obj, prop, value` | `Bool` |
| `setShaderIntArray` | `obj, prop, values` | `Bool` |
| `setShaderFloat` | `obj, prop, value` | `Bool` |
| `setShaderFloatArray` | `obj, prop, values` | `Bool` |
| `setShaderSampler2D` | `obj, prop, bitmapdataPath` | `Bool` |

### Reflection

| Function | Parameters | Returns |
|----------|-----------|---------|
| `getProperty` | `variable, ?allowMaps` | `Dynamic` |
| `setProperty` | `variable, value, ?allowMaps, ?allowInstances` | `Dynamic` |
| `getPropertyFromClass` | `classVar, variable, ?allowMaps` | `Dynamic` |
| `setPropertyFromClass` | `classVar, variable, value, ?allowMaps, ?allowInstances` | `Dynamic` |
| `getPropertyFromGroup` | `group, index, variable, ?allowMaps` | `Dynamic` |
| `setPropertyFromGroup` | `group, index, variable, value, ?allowMaps, ?allowInstances` | `Dynamic` |
| `addToGroup` | `group, tag, ?index` | `Void` |
| `removeFromGroup` | `group, ?index, ?tag, ?destroy` | `Void` |
| `callMethod` | `funcToRun, ?args` | `Dynamic` |
| `callMethodFromClass` | `className, funcToRun, ?args` | `Dynamic` |
| `createInstance` | `variableToSave, className, ?args` | `Bool` |
| `addInstance` | `objectName, ?inFront` | `Void` |
| `instanceArg` | `instanceName, ?className` | `String` |

### Input

| Function | Parameters | Returns |
|----------|-----------|---------|
| `mouseClicked` | `?button` | `Bool` |
| `mousePressed` | `?button` | `Bool` |
| `mouseReleased` | `?button` | `Bool` |
| `getMouseX` | `?camera` | `Float` |
| `getMouseY` | `?camera` | `Float` |
| `keyboardJustPressed` | `name` | `Bool` |
| `keyboardPressed` | `name` | `Bool` |
| `keyboardReleased` | `name` | `Bool` |
| `keyJustPressed` | `name` | `Bool` |
| `keyPressed` | `name` | `Bool` |
| `keyReleased` | `name` | `Bool` |
| `anyGamepadJustPressed` | `name` | `Bool` |
| `anyGamepadPressed` | `name` | `Bool` |
| `anyGamepadReleased` | `name` | `Bool` |
| `gamepadAnalogX` | `id, ?leftStick` | `Float` |
| `gamepadAnalogY` | `id, ?leftStick` | `Float` |
| `gamepadJustPressed` | `id, name` | `Bool` |
| `gamepadPressed` | `id, name` | `Bool` |
| `gamepadReleased` | `id, name` | `Bool` |

### Position Queries

| Function | Parameters | Returns |
|----------|-----------|---------|
| `getMidpointX` | `variable` | `Float` |
| `getMidpointY` | `variable` | `Float` |
| `getGraphicMidpointX` | `variable` | `Float` |
| `getGraphicMidpointY` | `variable` | `Float` |
| `getScreenPositionX` | `variable, ?camera` | `Float` |
| `getScreenPositionY` | `variable, ?camera` | `Float` |

### Save Data

| Function | Parameters | Returns |
|----------|-----------|---------|
| `initSaveData` | `name, ?folder` | `Void` |
| `flushSaveData` | `name` | `Void` |
| `getDataFromSave` | `name, field, ?defaultValue` | `Dynamic` |
| `setDataFromSave` | `name, field, value` | `Void` |
| `eraseSaveData` | `name` | `Void` |

### File Management

| Function | Parameters | Returns |
|----------|-----------|---------|
| `checkFileExists` | `filename, ?absolute` | `Bool` |
| `saveFile` | `path, content, ?absolute` | `Bool` |
| `deleteFile` | `path, ?ignoreModFolders, ?absolute` | `Bool` |
| `getTextFromFile` | `path, ?ignoreModFolders` | `String` |
| `directoryFileList` | `folder` | `Array<String>` |

### String Utilities

| Function | Parameters | Returns |
|----------|-----------|---------|
| `stringStartsWith` | `str, start` | `Bool` |
| `stringEndsWith` | `str, end` | `Bool` |
| `stringSplit` | `str, split` | `Array<String>` |
| `stringTrim` | `str` | `String` |

### Random

| Function | Parameters | Returns |
|----------|-----------|---------|
| `getRandomInt` | `min, max, exclude` | `Int` |
| `getRandomFloat` | `min, max, exclude` | `Float` |
| `getRandomBool` | `chance` | `Bool` |

### Colors

| Function | Parameters | Returns |
|----------|-----------|---------|
| `FlxColor` | `color` | `Int` |
| `getColorFromName` | `color` | `Int` |
| `getColorFromString` | `color` | `Int` |
| `getColorFromHex` | `color` | `Int` |
| `setHealthBarColors` | `left, right` | `Void` |
| `setTimeBarColors` | `left, right` | `Void` |

### Precache

| Function | Parameters | Returns |
|----------|-----------|---------|
| `precacheImage` | `name, ?allowGPU` | `Void` |
| `precacheSound` | `name` | `Void` |
| `precacheMusic` | `name` | `Void` |

### Dialogue & Video

| Function | Parameters | Returns |
|----------|-----------|---------|
| `startDialogue` | `dialogueFile, ?music` | `Bool` |
| `startVideo` | `videoFile, ?canSkip, ?forMidSong, ?shouldLoop, ?playOnLoad` | `Bool` |

### Custom Substates

| Function | Parameters | Returns |
|----------|-----------|---------|
| `openCustomSubstate` | `name, ?pauseGame` | `Void` |
| `closeCustomSubstate` | _(none)_ | `Bool` |
| `insertToCustomSubstate` | `tag, ?pos` | `Bool` |

### Debug

| Function | Parameters | Returns |
|----------|-----------|---------|
| `debugPrint` | `text, color` | `Void` |

---

## Global Variables

### Song Data

| Variable | Type |
|----------|------|
| `curBpm` | `Float` |
| `bpm` | `Float` |
| `scrollSpeed` | `Float` |
| `crochet` | `Float` |
| `stepCrochet` | `Float` |
| `songLength` | `Float` |
| `songName` | `String` |
| `songPath` | `String` |
| `loadedSongName` | `String` |
| `loadedSongPath` | `String` |
| `chartPath` | `String` |
| `curStage` | `String` |

### Difficulty & Mode

| Variable | Type |
|----------|------|
| `isStoryMode` | `Bool` |
| `difficulty` | `Int` |
| `difficultyName` | `String` |
| `difficultyPath` | `String` |
| `difficultyNameTranslation` | `String` |
| `weekRaw` | `Int` |
| `week` | `String` |
| `seenCutscene` | `Bool` |
| `hasVocals` | `Bool` |

### Gameplay State

| Variable | Type |
|----------|------|
| `curSection` | `Int` |
| `curBeat` | `Int` |
| `curStep` | `Int` |
| `curDecBeat` | `Float` |
| `curDecStep` | `Float` |
| `score` | `Int` |
| `misses` | `Int` |
| `hits` | `Int` |
| `combo` | `Int` |
| `deaths` | `Int` |
| `rating` | `Float` |
| `ratingName` | `String` |
| `ratingFC` | `String` |
| `totalPlayed` | `Int` |
| `totalNotesHit` | `Int` |
| `inGameOver` | `Bool` |
| `mustHitSection` | `Bool` |
| `altAnim` | `Bool` |
| `gfSection` | `Bool` |
| `healthGainMult` | `Float` |
| `healthLossMult` | `Float` |
| `playbackRate` | `Float` |
| `guitarHeroSustains` | `Bool` |
| `instakillOnMiss` | `Bool` |
| `botPlay` | `Bool` |
| `practice` | `Bool` |

### Character Positions

| Variable | Type |
|----------|------|
| `defaultBoyfriendX` / `Y` | `Float` |
| `defaultOpponentX` / `Y` | `Float` |
| `defaultGirlfriendX` / `Y` | `Float` |
| `boyfriendName` | `String` |
| `dadName` | `String` |
| `gfName` | `String` |

### Strum Positions

| Variable | Type |
|----------|------|
| `defaultPlayerStrumX0` through `X3` | `Float` |
| `defaultPlayerStrumY0` through `Y3` | `Float` |
| `defaultOpponentStrumX0` through `X3` | `Float` |
| `defaultOpponentStrumY0` through `Y3` | `Float` |

### UI Settings

| Variable | Type |
|----------|------|
| `downscroll` | `Bool` |
| `middlescroll` | `Bool` |
| `framerate` | `Int` |
| `ghostTapping` | `Bool` |
| `hideHud` | `Bool` |
| `timeBarType` | `String` |
| `scoreZoom` | `Bool` |
| `cameraZoomOnBeat` | `Bool` |
| `flashingLights` | `Bool` |
| `noteOffset` | `Float` |
| `healthBarAlpha` | `Float` |
| `noResetButton` | `Bool` |
| `lowQuality` | `Bool` |
| `shadersEnabled` | `Bool` |
| `currentModDirectory` | `String` |

### Noteskins

| Variable | Type |
|----------|------|
| `noteSkin` | `String` |
| `noteSkinPostfix` | `String` |
| `splashSkin` | `String` |
| `splashSkinPostfix` | `String` |
| `splashAlpha` | `Float` |

### Other

| Variable | Type |
|----------|------|
| `version` | `String` |
| `scriptName` | `String` |
| `modFolder` | `String` |
| `screenWidth` | `Int` |
| `screenHeight` | `Int` |
| `buildTarget` | `String` |
| `luaDebugMode` | `Bool` |
| `luaDeprecatedWarnings` | `Bool` |
| `Function_StopLua` | `String` |
| `Function_StopHScript` | `String` |
| `Function_StopAll` | `String` |
| `Function_Stop` | `String` |
| `Function_Continue` | `String` |

---

## Callbacks

See [Cross-Engine Callbacks](callbacks-map.md) for the full mapping. Below is a summary of all Psych-specific callbacks:

### Lifecycle
`onCreate`, `onCreatePost`, `onUpdate(elapsed)`, `onUpdatePost(elapsed)`, `onDestroy`

### Song
`onStartCountdown`, `onCountdownStarted`, `onCountdownTick(swagCounter)`, `onSongStart`, `onEndSong`

### Timing
`onStepHit`, `onBeatHit`, `onSectionHit`

### Notes
`onSpawnNote(id, data, type, isSustain, strumTime)`, `goodNoteHitPre(id, data, type, isSustain)`, `goodNoteHit(id, data, type, isSustain)`, `opponentNoteHitPre(id, data, type, isSustain)`, `opponentNoteHit(id, data, type, isSustain)`, `noteMiss(id, data, type, isSustain)`, `noteMissPress(direction)`

### Input
`onKeyPressPre(key)`, `onKeyPress(key)`, `onKeyReleasePre(key)`, `onKeyRelease(key)`, `onGhostTap(key)`

### Events
`onEvent(name, v1, v2, strumTime)`, `onEventPushed(name, v1, v2, strumTime)`, `eventEarlyTrigger(name, v1, v2, strumTime)`

### Camera
`onMoveCamera(character)`

### Pause & Game Over
`onPause`, `onResume`, `onGameOver`, `onGameOverStart`, `onGameOverUpdate(elapsed)`, `onGameOverUpdatePost(elapsed)`, `onGameOverConfirm(returnToMenu)`

### Dialogue
`onNextDialogue(count)`, `onSkipDialogue(count)`

### Rating
`onRecalculateRating`, `onUpdateScore(miss)`

### Tweens & Timers
`onTweenCompleted(tag, vars)`, `onTimerCompleted(tag, loops, loopsLeft)`, `onSoundFinished(tag)`

### Custom Substates
`onCustomSubstateCreate(name)`, `onCustomSubstateCreatePost(name)`, `onCustomSubstateUpdate(name, elapsed)`, `onCustomSubstateUpdatePost(name, elapsed)`, `onCustomSubstateDestroy(name)`

---

## HScript Bridge

When using HScript within Psych Engine, these classes are directly available:

`Type`, `File`, `FileSystem`, `FlxG`, `FlxMath`, `FlxSprite`, `FlxText`, `FlxCamera`, `PsychCamera`, `FlxTimer`, `FlxTween`, `FlxEase`, `FlxColor`, `PlayState`, `Paths`, `Conductor`, `ClientPrefs`, `Character`, `Alphabet`, `Note`, `CustomSubstate`, `FlxRuntimeShader`, `StringTools`, `FlxAnimate`

### HScript-specific Functions

| Function | Parameters | Returns |
|----------|-----------|---------|
| `setVar` | `name, value` | `Dynamic` |
| `getVar` | `name` | `Dynamic` |
| `removeVar` | `name` | `Bool` |
| `debugPrint` | `text, ?color` | `Void` |
| `getModSetting` | `saveTag, ?modName` | `Dynamic` |
| `addHaxeLibrary` | `libName, ?libPackage` | `Void` |
| `createGlobalCallback` | `name, func` | `Void` |
| `createCallback` | `name, func, ?funk` | `Void` |

---

## Deprecated Functions

| Old Function | Replacement |
|-------------|-------------|
| `addAnimationByIndicesLoop` | `addAnimationByIndices` (with loop=true) |
| `objectPlayAnimation` | `playAnim` |
| `characterPlayAnim` | `playAnim` with character name |
| `luaSpriteMakeGraphic` | `makeGraphic` |
| `luaSpriteAddAnimationByPrefix` | `addAnimationByPrefix` |
| `luaSpriteAddAnimationByIndices` | `addAnimationByIndices` |
| `luaSpritePlayAnimation` | `playAnim` |
| `setLuaSpriteCamera` | `setObjectCamera` |
| `setLuaSpriteScrollFactor` | `setScrollFactor` |
| `scaleLuaSprite` | `scaleObject` |
