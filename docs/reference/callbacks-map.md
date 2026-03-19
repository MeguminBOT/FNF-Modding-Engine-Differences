# Cross-Engine Callback Map

Complete mapping of callbacks and events across all three FNF engines. Each row shows the equivalent callback name and signature for the same gameplay event.

---

## Lifecycle

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Creation** | `onCreate()` | `create()` | `onCreate()` via `ScriptEvent` |
| **Post-creation** | `onCreatePost()` | `postCreate()` | `onCreatePost()` via `ScriptEvent` |
| **Update** | `onUpdate(elapsed)` | `update(elapsed)` | `onUpdate()` via `UpdateScriptEvent` |
| **Post-update** | `onUpdatePost(elapsed)` | `postUpdate(elapsed)` | `onUpdatePost()` via `UpdateScriptEvent` |
| **Destroy** | `onDestroy()` | `destroy()` | `onDestroy()` via `ScriptEvent` |
| **Draw** | _(N/A)_ | `draw()` | _(N/A)_ |

---

## Song Lifecycle

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Song start** | `onSongStart()` | `onSongStart()` | `onSongStart()` via `ScriptEvent` |
| **Song end** | `onEndSong()` | `onSongEnd()` | `onSongEnd()` via `ScriptEvent` |
| **Countdown start** | `onStartCountdown()` | `onStartCountdown()` | `onCountdownStart()` via `CountdownScriptEvent` |
| **Countdown tick** | `onCountdownTick(counter)` | `onCountdown(CountdownEvent)` | `onCountdownStep()` via `CountdownScriptEvent` |
| **Countdown end** | _(N/A)_ | _(N/A)_ | `onCountdownEnd()` via `CountdownScriptEvent` |
| **Song retry** | _(N/A)_ | _(N/A)_ | `onSongRetry()` via `SongRetryEvent` |

!!! note "Cancellation"
    All three engines support cancelling the countdown start. Psych uses `return Function_Stop`, Codename uses `event.cancel()`, Official uses `event.cancel()` / `event.cancelEvent()`.

---

## Beat & Step

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Beat hit** | `onBeatHit()` — `curBeat` via global | `beatHit(beat)` — param or Conductor signal | `onBeatHit()` via `SongTimeScriptEvent` |
| **Step hit** | `onStepHit()` — `curStep` via global | `stepHit(step)` — param or Conductor signal | `onStepHit()` via `SongTimeScriptEvent` |
| **Section hit** | `onSectionHit()` | `measureHit(measure)` — per measure, not section | _(N/A)_ |

---

## Note Events

| Event | Psych Engine (Lua) | Psych Engine (HScript) | Codename Engine | Official Funkin |
|-------|-------------------|----------------------|-----------------|-----------------|
| **Player note hit** | `goodNoteHit(id, dir, type, isSustain)` | `goodNoteHit(note:Note)` | `onNoteHit(NoteHitEvent)` / `onPlayerHit(NoteHitEvent)` | `onNoteHit(HitNoteScriptEvent)` |
| **Opponent note hit** | `opponentNoteHit(id, dir, type, isSustain)` | `opponentNoteHit(note:Note)` | `onNoteHit(NoteHitEvent)` / `onDadHit(NoteHitEvent)` | `onNoteHit(HitNoteScriptEvent)` |
| **Note miss** | `noteMiss(id, dir, type, isSustain)` | `noteMiss(note:Note)` | `onNoteMiss(NoteMissEvent)` / `onPlayerMiss(NoteMissEvent)` | `onNoteMiss(NoteScriptEvent)` |
| **Ghost miss** | `noteMissPress(direction)` | `noteMissPress(direction:Int)` | `onNoteMiss` with `note=null` | `onNoteGhostMiss(GhostMissNoteScriptEvent)` |
| **Note spawn** | `onSpawnNote(id, data, type, isSustain, strumTime)` | `onSpawnNote(note:Note)` | `onNoteSpawn(NoteSpawnEvent)` | _(N/A)_ |
| **Note incoming** | _(N/A)_ | _(N/A)_ | _(N/A)_ | `onNoteIncoming(NoteScriptEvent)` |
| **Hold note drop** | _(N/A)_ | _(N/A)_ | _(N/A)_ | `onNoteHoldDrop(HoldNoteScriptEvent)` |
| **Player hit (pre)** | `goodNoteHitPre(id, dir, type, isSustain)` | `goodNoteHitPre(note:Note)` | _(N/A)_ | _(N/A)_ |
| **Opponent hit (pre)** | `opponentNoteHitPre(id, dir, type, isSustain)` | `opponentNoteHitPre(note:Note)` | _(N/A)_ | _(N/A)_ |

!!! note "Key difference"
    Psych Lua callbacks receive **decomposed primitive values** (id, direction, type as separate arguments), while Psych HScript and both other engines receive **full objects** with all properties accessible.

!!! note "Pre-processing callbacks"
    Psych Engine has `goodNoteHitPre` and `opponentNoteHitPre` callbacks that fire **before** the standard hit callbacks. These can be cancelled with `return Function_Stop` to prevent the note hit from being processed. Neither Codename nor Funkin have equivalents.

---

## Note Event Fields

### Codename `NoteHitEvent`

| Field | Type | Description |
|-------|------|-------------|
| `note` | `Note` | The note that was hit |
| `rating` | `String` | Rating name (sick, good, bad, shit) |
| `score` | `Int` | Score earned |
| `accuracy` | `Float` | Hit accuracy |
| `character` | `Character` | Character that hit the note |
| `strumLine` | `StrumLine` | Which strumline |
| `animSuffix` | `String` | Animation suffix |
| `healthGain` | `Float` | Health gained |
| `showRating` | `Bool` | Whether to show rating popup |
| `showSplash` | `Bool` | Whether to show note splash |

### Official `HitNoteScriptEvent`

| Field | Type | Description |
|-------|------|-------------|
| `note` | `NoteSprite` | The note that was hit (inherited from `NoteScriptEvent`) |
| `judgement` | `String` | Judgement name (sick, good, bad, etc.) |
| `score` | `Int` | Score earned |
| `healthChange` | `Float` | Health change (inherited from `NoteScriptEvent`) |
| `comboCount` | `Int` | Current combo count (inherited from `NoteScriptEvent`) |
| `isComboBreak` | `Bool` | Whether this hit breaks the combo |
| `hitDiff` | `Float` | Timing difference |
| `doesNotesplash` | `Bool` | Whether to show a notesplash |
| `playSound` | `Bool` | Whether to play hit sound (inherited from `NoteScriptEvent`) |

---

## Input

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Key press** | `onKeyPress(key)` | `onKeyPress(key)` | _(N/A)_ |
| **Key release** | `onKeyRelease(key)` | `onKeyRelease(key)` | _(N/A)_ |
| **Ghost tap** | `onGhostTap(key)` | `onGhostTap(key)` | _(N/A)_ |

Psych HScript also has `onKeyPressPre(key:Int)` and `onKeyReleasePre(key:Int)` for pre-processing.

---

## Events

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Song event** | `onEvent(name, v1, v2, strumTime)` | `onEvent(EventGameEvent)` | `onSongEvent(SongEventScriptEvent)` |
| **Event loaded** | `onEventPushed(name, v1, v2, strumTime)` | _(N/A)_ | _(N/A)_ |

---

## Camera

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Camera move** | `onMoveCamera(character)` — `'boyfriend'`/`'dad'`/`'gf'` | `onCameraMove(CamMoveEvent)` | _(N/A)_ |

---

## Pause & Game Over

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Pause** | `onPause()` — cancellable | `onGamePause()` — cancellable | `onPause(PauseScriptEvent)` — cancellable |
| **Resume** | `onResume()` | `onResume()` | `onResume(ScriptEvent)` |
| **Game over** | `onGameOver()` — cancellable | `onGameOver(GameOverEvent)` — cancellable | `onGameOver(ScriptEvent)` — cancellable |

---

## Dialogue

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Next dialogue** | `onNextDialogue(count)` | `onDialogueLine` | `onDialogueStart(DialogueScriptEvent)` |
| **Skip dialogue** | `onSkipDialogue(count)` | _(N/A)_ | _(N/A)_ |

---

## Rating

| Event | Psych Engine | Codename Engine | Official Funkin |
|-------|-------------|-----------------|-----------------|
| **Rating recalculate** | `onRecalculateRating()` — cancellable | `onRatingUpdate(RatingUpdateEvent)` | _(N/A)_ |
---

## Score Updates (Psych Only)

| Callback | Parameters | Notes |
|----------|-----------|-------|
| `preUpdateScore` | `miss:Bool` | Before score updates — cancellable |
| `onUpdateScore` | `miss:Bool` | After score updates |
---

## Tweens & Timers (Psych Only)

These callbacks are unique to Psych Engine's tag-based system:

| Callback | Parameters | Notes |
|----------|-----------|-------|
| `onTweenCompleted` | `tag:String, vars:String` | Tween finished |
| `onTimerCompleted` | `tag:String, loops:Int, loopsLeft:Int` | Timer finished |
| `onSoundFinished` | `tag:String` | Sound finished |

---

## Custom Substates (Psych Only)

| Callback | Parameters |
|----------|-----------|
| `onCustomSubstateCreate` | `name:String` |
| `onCustomSubstateCreatePost` | `name:String` |
| `onCustomSubstateUpdate` | `name:String, elapsed:Float` |
| `onCustomSubstateDestroy` | `name:String` |
