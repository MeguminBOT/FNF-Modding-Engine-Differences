# Script Callbacks

## Lifecycle Callbacks

| Event             | Official Funkin         | Psych Engine (Lua)      | Psych Engine (HScript Iris)   | Codename Engine                                                |
| ----------------- | ----------------------- | ----------------------- | ----------------------------- | -------------------------------------------------------------- |
| **Creation**      | `onCreate()`            | `onCreate()`            | `onCreate()`                  | `preCreate()`, `create()`, `postCreate()`                      |
| **Post-creation** | `onCreatePost()`        | `onCreatePost()`        | `onCreatePost()`              | `postCreate()`                                                 |
| **Update**        | `onUpdate(elapsed)`     | `onUpdate(elapsed)`     | `onUpdate(elapsed:Float)`     | `preUpdate(elapsed)`, `update(elapsed)`, `postUpdate(elapsed)` |
| **Post-update**   | `onUpdatePost(elapsed)` | `onUpdatePost(elapsed)` | `onUpdatePost(elapsed:Float)` | `postUpdate(elapsed)`                                          |
| **Destroy**       | `onDestroy()`           | `onDestroy()`           | `onDestroy()`                 | `destroy()`                                                    |

## Song/Beat Callbacks

| Event               | Official Funkin        | Psych Engine (Lua)                   | Psych Engine (HScript Iris)                    | Codename Engine                  |
| ------------------- | ---------------------- | ------------------------------------ | ---------------------------------------------- | -------------------------------- |
| **Beat hit**        | `onBeatHit(curBeat)`   | `onBeatHit()` (curBeat via variable) | `onBeatHit()` (curBeat via variable)           | `beatHit(curBeat)`               |
| **Step hit**        | `onStepHit(curStep)`   | `onStepHit()` (curStep via variable) | `onStepHit()` (curStep via variable)           | `stepHit(curStep)`               |
| **Section hit**     | N/A                    | `onSectionHit()`                     | `onSectionHit()`                               | N/A                              |
| **Measure hit**     | N/A                    | N/A                                  | N/A                                            | `measureHit(curMeasure)`         |
| **Song start**      | `onSongStart()`        | `onSongStart()`                      | `onSongStart()`                                | `onSongStart()`, `onStartSong()` |
| **Song end**        | `onEndSong()`          | `onEndSong()`                        | `onEndSong()`                                  | `onSongEnd()`                    |
| **Countdown start** | `onCountdownStarted()` | `onCountdownStarted()`               | `onCountdownStarted()`                         | `onStartCountdown(event)`        |
| **Countdown tick**  | N/A                    | `onCountdownTick(counter)`           | `onCountdownTick(tick:Countdown, counter:Int)` | N/A                              |

## Gameplay Callbacks

| Event                       | Official Funkin         | Psych Engine (Lua)                          | Psych Engine (HScript Iris)        | Codename Engine                              |
| --------------------------- | ----------------------- | ------------------------------------------- | ---------------------------------- | -------------------------------------------- |
| **Player note hit (pre)**   | N/A                     | N/A                                         | `goodNoteHitPre(note:Note)`        | N/A                                          |
| **Player note hit**         | `goodNoteHit(note)`     | `goodNoteHit(id, dir, type, isSustain)`     | `goodNoteHit(note:Note)`           | `onPlayerHit(event)`                         |
| **Note miss**               | `noteMiss(note)`        | `noteMiss(id, dir, type, isSustain)`        | `noteMiss(note:Note)`              | `onPlayerMiss(event)`                        |
| **Ghost miss**              | N/A                     | `noteMissPress(direction)`                  | `noteMissPress(direction:Int)`     | N/A                                          |
| **Opponent note hit (pre)** | N/A                     | N/A                                         | `opponentNoteHitPre(note:Note)`    | N/A                                          |
| **Opponent note hit**       | `opponentNoteHit(note)` | `opponentNoteHit(id, dir, type, isSustain)` | `opponentNoteHit(note:Note)`       | `onDadHit(event)`                            |
| **Any note hit**            | N/A                     | N/A                                         | N/A                                | `onNoteHit(event)`                           |
| **Note spawn**              | N/A                     | `onSpawnNote(id, data, type, isSustain)`    | `onSpawnNote(note:Note)`           | N/A                                          |
| **Camera move**             | N/A                     | `onMoveCamera(focus)`                       | `onMoveCamera(focus:String)`       | `onCameraMove(event)`                        |
| **Game over**               | N/A                     | `onGameOver()`                              | `onGameOver()`                     | `onGameOver(event)`, `onPostGameOver(event)` |
| **Pause**                   | N/A                     | `onPause()`                                 | `onPause()`                        | `onGamePause(event)`                         |
| **Event triggered**         | N/A                     | `onEvent(name, v1, v2)`                     | `onEvent(name, v1, v2, strumTime)` | `onEvent(event)`                             |

!!! note "Key difference"
    Psych Lua callbacks receive **decomposed primitive values** (id, direction, type as separate arguments), while Psych HScript Iris receives **the actual Haxe object** (e.g., the full `Note` instance with all properties accessible).

## Input Callbacks

| Event                 | Official Funkin | Psych Engine (Lua)  | Psych Engine (HScript Iris) | Codename Engine        |
| --------------------- | --------------- | ------------------- | --------------------------- | ---------------------- |
| **Key press (pre)**   | N/A             | N/A                 | `onKeyPressPre(key:Int)`    | N/A                    |
| **Key press**         | N/A             | `onKeyPress(key)`   | `onKeyPress(key:Int)`       | N/A                    |
| **Key release (pre)** | N/A             | N/A                 | `onKeyReleasePre(key:Int)`  | N/A                    |
| **Key release**       | N/A             | `onKeyRelease(key)` | `onKeyRelease(key:Int)`     | N/A                    |
| **Ghost tap**         | N/A             | `onGhostTap(key)`   | `onGhostTap(key:Int)`       | N/A                    |
| **Input update**      | N/A             | N/A                 | N/A                         | `onInputUpdate(event)` |

## Score/Rating Callbacks

| Event                  | Official Funkin | Psych Engine (Lua)      | Psych Engine (HScript Iris) | Codename Engine         |
| ---------------------- | --------------- | ----------------------- | --------------------------- | ----------------------- |
| **Pre-update score**   | N/A             | N/A                     | `preUpdateScore(miss:Bool)` | N/A                     |
| **Update score**       | N/A             | `onUpdateScore(miss)`   | `onUpdateScore(miss:Bool)`  | N/A                     |
| **Recalculate rating** | N/A             | `onRecalculateRating()` | `onRecalculateRating()`     | `onRatingUpdate(event)` |
