# Official Funkin (V-Slice) Events Reference

Complete reference for the Official Funkin scripting system — 19 ScriptEvent types, 43 Scripted* classes, 9 interfaces, the module system, and data format schemas.

---

## ScriptEvent System

All events extend `ScriptEvent` from `funkin.modding.events`:

| Field / Method | Type | Description |
|----------------|------|-------------|
| `type` | `ScriptEventType` | Event type constant |
| `cancelable` | `Bool` | Whether this event can be cancelled |
| `eventCanceled` | `Bool` | Whether cancelled |
| `cancelEvent()` | Method | Cancel default behavior |
| `cancel()` | Method | Alias for `cancelEvent()` |
| `stopPropagation()` | Method | Stop event from reaching other scripts |

### Event Constants

| Constant | Event |
|----------|-------|
| `ScriptEvent.CREATE` | Object creation |
| `ScriptEvent.DESTROY` | Object destruction |
| `ScriptEvent.UPDATE` | Frame update |
| `ScriptEvent.SONG_START` | Song begins |
| `ScriptEvent.SONG_END` | Song ends |
| `ScriptEvent.SONG_LOADED` | Song chart loaded |
| `ScriptEvent.COUNTDOWN_START` | Countdown begins |
| `ScriptEvent.COUNTDOWN_STEP` | Each countdown tick |
| `ScriptEvent.COUNTDOWN_END` | Countdown ends |
| `ScriptEvent.NOTE_INCOMING` | Note approaching |
| `ScriptEvent.NOTE_HIT` | Note hit |
| `ScriptEvent.NOTE_MISS` | Note missed |
| `ScriptEvent.NOTE_GHOST_MISS` | Ghost miss (no note present) |
| `ScriptEvent.NOTE_HOLD_PRESS` | Hold note pressed |
| `ScriptEvent.NOTE_HOLD_RELEASE` | Hold note released |
| `ScriptEvent.NOTE_HOLD_DROP` | Hold note dropped |
| `ScriptEvent.SONG_EVENT` | Song event triggered |
| `ScriptEvent.PAUSE` | Game paused |
| `ScriptEvent.RESUME` | Game resumed |
| `ScriptEvent.GAME_OVER` | Game over triggered |
| `ScriptEvent.SONG_RETRY` | Song retried |
| `ScriptEvent.BEAT_HIT` | Beat hit |
| `ScriptEvent.STEP_HIT` | Step hit |
| `ScriptEvent.DIALOGUE_START` | Dialogue begins |
| `ScriptEvent.DIALOGUE_LINE` | Dialogue line |
| `ScriptEvent.DIALOGUE_END` | Dialogue ends |
| `ScriptEvent.STATE_CHANGE_BEGIN` | State transition starting |
| `ScriptEvent.STATE_CHANGE_END` | State transition complete |
| `ScriptEvent.FREEPLAY_SONG_SELECT` | Freeplay song selected |
| `ScriptEvent.FREEPLAY_INTRO` | Freeplay intro |
| `ScriptEvent.FREEPLAY_OUTRO` | Freeplay outro |
| `ScriptEvent.CHARACTER_SELECT` | Character selected |

---

## Event Subclasses

### UpdateScriptEvent

Dispatched every frame during update.

| Field | Type |
|-------|------|
| `elapsed` | `Float` |

### NoteScriptEvent

Used for NOTE_HIT, NOTE_HOLD_PRESS, NOTE_HOLD_RELEASE. Extends `ScriptEvent`.

| Field | Type | Notes |
|-------|------|-------|
| `note` | `NoteSprite` | The note associated with this event |
| `comboCount` | `Int` | Current combo count |
| `playSound` | `Bool` | Whether to play the hit/miss sound |
| `healthChange` | `Float` | Health gained or lost (max health is 2.00) |

### HitNoteScriptEvent

Extends `NoteScriptEvent` — specifically for NOTE_HIT.

| Field | Type | Notes |
|-------|------|-------|
| `judgement` | `String` | Hit judgement (sick, good, bad, etc.) |
| `score` | `Int` | Score received for the hit |
| `isComboBreak` | `Bool` | Whether this hit breaks the combo |
| `hitDiff` | `Float` | Timing difference when the note was hit |
| `doesNotesplash` | `Bool` | Whether to show a notesplash (true on "sick") |

Also inherits `note`, `comboCount`, `playSound`, `healthChange` from `NoteScriptEvent`.

### GhostMissNoteScriptEvent

Extends `ScriptEvent` (not NoteScriptEvent) — for NOTE_GHOST_MISS.

| Field | Type | Notes |
|-------|------|-------|
| `dir` | `NoteDirection` | The direction that was mistakenly pressed |
| `hasPossibleNotes` | `Bool` | Whether a note was in judgement range |
| `healthChange` | `Float` | Health lost from this ghost press |
| `scoreChange` | `Int` | Score lost from this ghost press |
| `playSound` | `Bool` | Whether to play the miss sound |
| `playAnim` | `Bool` | Whether to play the miss animation |

### HoldNoteScriptEvent

Extends `NoteScriptEvent` — for NOTE_HOLD_DROP.

| Field | Type | Notes |
|-------|------|-------|
| `holdNote` | `SustainTrail` | The hold note that was hit or dropped |
| `score` | `Int` | Score received |
| `isComboBreak` | `Bool` | Whether this breaks the combo |
| `hitDiff` | `Float` | Timing difference |
| `doesNotesplash` | `Bool` | Whether to show a notesplash |

Also inherits `note`, `comboCount`, `playSound`, `healthChange` from `NoteScriptEvent`.

### SongRetryEvent

Extends `ScriptEvent` — for SONG_RETRY.

| Field | Type | Notes |
|-------|------|-------|
| `difficulty` | `String` | The difficulty of the song being retried |

### SongTimeScriptEvent

Used for BEAT_HIT and STEP_HIT.

| Field | Type |
|-------|------|
| `beat` | `Int` |
| `step` | `Int` |

### CountdownScriptEvent

Used for COUNTDOWN_START, COUNTDOWN_STEP, COUNTDOWN_END.

| Field | Type |
|-------|------|
| `step` | `Int` |
| `isLast` | `Bool` |

### SongEventScriptEvent

Song event triggered during gameplay.

| Field | Type |
|-------|------|
| `eventData` | `SongEventData` |

### SongLoadScriptEvent

Can modify chart data before use — cancellable.

| Field | Type |
|-------|------|
| `chart` | `SongChartData` |
| `id` | `String` |

### PauseScriptEvent

| Field | Type | Notes |
|-------|------|-------|
| `gitaroo` | `Bool` | Easter egg flag for gitaroo man pause |

### StateChangeScriptEvent

| Field | Type |
|-------|------|
| `targetState` | `FlxState` |

### DialogueScriptEvent

Used for DIALOGUE_START, DIALOGUE_LINE, DIALOGUE_END.

| Field | Type |
|-------|------|
| `dialogue` | `Dynamic` |

### FreeplayScriptEvent

| Field | Type |
|-------|------|
| `song` | `Dynamic` |
| `index` | `Int` |

### CapsuleScriptEvent

| Field | Type |
|-------|------|
| `capsule` | `Dynamic` |
| `index` | `Int` |

### CharacterSelectScriptEvent

| Field | Type |
|-------|------|
| `character` | `Dynamic` |

---

## Scripted Classes

Classes you can extend via HScript to create custom behavior.

### Gameplay

| Scripted Class | Base Class | Notes |
|---------------|-----------|-------|
| `ScriptedStage` | `Stage` | Custom stages |
| `ScriptedBopper` | `Bopper` | Stage boppers |
| `ScriptedStageProp` | `StageProp` | Stage props |
| `ScriptedSong` | `Song` | Custom song behavior |
| `ScriptedNoteKind` | `NoteKind` | Custom note types |
| `ScriptedNoteStyle` | `NoteStyle` | Custom note skins |

### Characters

| Scripted Class | Base Class | Render Type |
|---------------|-----------|-------------|
| `ScriptedBaseCharacter` | `BaseCharacter` | Generic |
| `ScriptedSparrowCharacter` | `SparrowCharacter` | Sparrow |
| `ScriptedPackerCharacter` | `PackerCharacter` | Packer |
| `ScriptedMultiSparrowCharacter` | `MultiSparrowCharacter` | Multi-sparrow |
| `ScriptedAnimateAtlasCharacter` | `AnimateAtlasCharacter` | Animate atlas |
| `ScriptedMultiAnimateAtlasCharacter` | `MultiAnimateAtlasCharacter` | Multi-animate atlas |
| `ScriptedCharacterData` | `CharacterData` | Data wrapper |

### Dialogue

| Scripted Class | Base Class |
|---------------|-----------|
| `ScriptedConversation` | `Conversation` |
| `ScriptedDialogueBox` | `DialogueBox` |
| `ScriptedSpeaker` | `Speaker` |

### UI

| Scripted Class | Base Class |
|---------------|-----------|
| `ScriptedMusicBeatState` | `MusicBeatState` |
| `ScriptedMusicBeatSubState` | `MusicBeatSubState` |
| `ScriptedFreeplayStyle` | `FreeplayStyle` |
| `ScriptedPlayableCharacter` | `PlayableCharacter` |

### Flixel Wrappers

| Scripted Class | Base Class |
|---------------|-----------|
| `ScriptedFlxState` | `FlxState` |
| `ScriptedFlxSubState` | `FlxSubState` |
| `ScriptedFlxSprite` | `FlxSprite` |
| `ScriptedFlxSpriteGroup` | `FlxSpriteGroup` |
| `ScriptedFlxTypedGroup` | `FlxTypedGroup` |
| `ScriptedFlxBasic` | `FlxBasic` |
| `ScriptedFlxObject` | `FlxObject` |
| `ScriptedFlxCamera` | `FlxCamera` |
| `ScriptedFlxUIState` | `FlxUIState` |
| `ScriptedFlxUISubState` | `FlxUISubState` |
| `ScriptedFlxRuntimeShader` | `FlxRuntimeShader` |

---

## Interfaces

### IScriptedClass

Base interface for all scripted classes.

```haxe
onCreate(event:ScriptEvent):Void
onDestroy(event:ScriptEvent):Void
onUpdate(event:UpdateScriptEvent):Void
onScriptEvent(event:ScriptEvent):Void
```

### IPlayStateScriptedClass

Extends `IScriptedClass` — for gameplay-aware scripts.

```haxe
onNoteHit(event:HitNoteScriptEvent):Void
onNoteMiss(event:NoteScriptEvent):Void
onNoteGhostMiss(event:GhostMissNoteScriptEvent):Void
onNoteHoldDrop(event:HoldNoteScriptEvent):Void
onSongStart(event:ScriptEvent):Void
onSongEnd(event:ScriptEvent):Void
onSongRetry(event:SongRetryEvent):Void
onCountdownStart(event:CountdownScriptEvent):Void
onCountdownStep(event:CountdownScriptEvent):Void
onCountdownEnd(event:CountdownScriptEvent):Void
onStepHit(event:SongTimeScriptEvent):Void
onBeatHit(event:SongTimeScriptEvent):Void
onPause(event:PauseScriptEvent):Void
onResume(event:ScriptEvent):Void
onGameOver(event:ScriptEvent):Void
onSongEvent(event:SongEventScriptEvent):Void
onSongLoaded(event:SongLoadScriptEvent):Void
```

### INoteScriptedClass

Extends `IScriptedClass` — for note type scripts.

```haxe
onNoteIncoming(event:NoteScriptEvent):Void
onNoteHit(event:HitNoteScriptEvent):Void
onNoteMiss(event:NoteScriptEvent):Void
```

### IBPMSyncedScriptedClass

Extends `IScriptedClass` — for timing-aware scripts.

```haxe
onStepHit(event:SongTimeScriptEvent):Void
onBeatHit(event:SongTimeScriptEvent):Void
```

### IFreeplayScriptedClass

Extends `IScriptedClass` — for freeplay menu scripts.

```haxe
onFreeplaySongSelect(event:FreeplayScriptEvent):Void
onFreeplayIntro(event:FreeplayScriptEvent):Void
onFreeplayOutro(event:FreeplayScriptEvent):Void
onCapsuleInit(event:CapsuleScriptEvent):Void
onCapsuleHover(event:CapsuleScriptEvent):Void
onCapsuleSelect(event:CapsuleScriptEvent):Void
```

### ICharacterSelectScriptedClass

Extends `IScriptedClass` — for character select scripts.

```haxe
onCharacterSelect(event:CharacterSelectScriptEvent):Void
onCharacterDeselect(event:CharacterSelectScriptEvent):Void
onCharacterConfirm(event:CharacterSelectScriptEvent):Void
```

### IDialogueScriptedClass

Extends `IScriptedClass` — for dialogue scripts.

```haxe
onDialogueStart(event:DialogueScriptEvent):Void
onDialogueLine(event:DialogueScriptEvent):Void
onDialogueEnd(event:DialogueScriptEvent):Void
onDialogueSkip(event:DialogueScriptEvent):Void
onDialogueCompleteLine(event:DialogueScriptEvent):Void
```

### IStateChangingScriptedClass

Extends `IScriptedClass` — for state transition awareness.

```haxe
onStateChangeBegin(event:StateChangeScriptEvent):Void
onStateChangeEnd(event:StateChangeScriptEvent):Void
```

---

## Module System

Modules are **persistent global scripts** that survive across states. They receive all gameplay, freeplay, dialogue, and state events.

**Class:** `funkin.modding.module.Module`

**Implements:** `IPlayStateScriptedClass`, `IFreeplayScriptedClass`, `ICharacterSelectScriptedClass`, `IDialogueScriptedClass`, `IStateChangingScriptedClass`

| Field | Type | Description |
|-------|------|-------------|
| `moduleName` | `String` | Unique module name |
| `active` | `Bool` | Whether active |
| `priority` | `Int` | Processing order (1-1000+, lower = earlier) |
| `stateFilter` | `Null<Array<Class<Dynamic>>>` | Limits which states receive events |
| `scriptCall` | `Dynamic->Dynamic` | |

**Registration:** `ModuleHandler.registerModule(module)`
**Lookup:** `ModuleHandler.getModule(name)`

---

## Dispatch Points

### PlayState

| Category | Event | Type |
|----------|-------|------|
| Lifecycle | `ScriptEvent.CREATE` | `ScriptEvent` |
| Lifecycle | `ScriptEvent.DESTROY` | `ScriptEvent` |
| Lifecycle | `ScriptEvent.UPDATE` | `UpdateScriptEvent` |
| Song | `ScriptEvent.SONG_START` | `ScriptEvent` |
| Song | `ScriptEvent.SONG_END` | `ScriptEvent` |
| Song | `ScriptEvent.SONG_LOADED` | `SongLoadScriptEvent` |
| Countdown | `ScriptEvent.COUNTDOWN_START` | `CountdownScriptEvent` |
| Countdown | `ScriptEvent.COUNTDOWN_STEP` | `CountdownScriptEvent` |
| Countdown | `ScriptEvent.COUNTDOWN_END` | `CountdownScriptEvent` |
| Notes | `ScriptEvent.NOTE_INCOMING` | `NoteScriptEvent` |
| Notes | `ScriptEvent.NOTE_HIT` | `HitNoteScriptEvent` |
| Notes | `ScriptEvent.NOTE_MISS` | `NoteScriptEvent` |
| Notes | `ScriptEvent.NOTE_GHOST_MISS` | `GhostMissNoteScriptEvent` |
| Notes | `ScriptEvent.NOTE_HOLD_PRESS` | `NoteScriptEvent` |
| Notes | `ScriptEvent.NOTE_HOLD_RELEASE` | `NoteScriptEvent` |
| Notes | `ScriptEvent.NOTE_HOLD_DROP` | `HoldNoteScriptEvent` |
| Timing | `ScriptEvent.BEAT_HIT` | `SongTimeScriptEvent` |
| Timing | `ScriptEvent.STEP_HIT` | `SongTimeScriptEvent` |
| Gameplay | `ScriptEvent.PAUSE` | `PauseScriptEvent` |
| Gameplay | `ScriptEvent.RESUME` | `ScriptEvent` |
| Gameplay | `ScriptEvent.GAME_OVER` | `ScriptEvent` |
| Gameplay | `ScriptEvent.SONG_RETRY` | `SongRetryEvent` |
| Gameplay | `ScriptEvent.SONG_EVENT` | `SongEventScriptEvent` |

### Other States

| State | Events |
|-------|--------|
| **Conversation** | `DIALOGUE_START`, `DIALOGUE_LINE`, `DIALOGUE_END` (all `DialogueScriptEvent`) |
| **FreeplayState** | `FREEPLAY_SONG_SELECT`, `FREEPLAY_INTRO`, `FREEPLAY_OUTRO` (all `FreeplayScriptEvent`) |
| **CharSelectSubState** | `CHARACTER_SELECT` (`CharacterSelectScriptEvent`) |
| **MusicBeatState** | `UPDATE`, `BEAT_HIT`, `STEP_HIT`, `STATE_CHANGE_BEGIN`, `STATE_CHANGE_END` |

---

## Data Format Schemas

### SongMetadata

| Field | Type |
|-------|------|
| `version` | `String` |
| `songName` | `String` |
| `artist` | `String` |
| `charter` | `Null<String>` |
| `divisions` | `Null<Int>` |
| `looped` | `Bool` |
| `offsets` | `{ instrumental:Float, vocals:Map<String,Float> }` |
| `timeFormat` | `String` — `'ms'` or `'steps'` |
| `timeChanges` | `Array<SongTimeChange>` |
| `generatedBy` | `Null<String>` |

**playData:**

| Field | Type |
|-------|------|
| `songVariations` | `Array<String>` |
| `difficulties` | `Array<String>` |
| `characters.player` | `String` |
| `characters.opponent` | `String` |
| `characters.girlfriend` | `String` |
| `characters.instrumental` | `String` |
| `stage` | `String` |
| `noteStyle` | `String` |
| `ratings` | `Map<String,Int>` |

### SongTimeChange

| Field | Type |
|-------|------|
| `timeStamp` | `Float` |
| `bpm` | `Float` |
| `timeSignatureNum` | `Int` |
| `timeSignatureDen` | `Int` |
| `beatTuplets` | `Array<Int>` |

### SongNoteData

| Field | Type | Notes |
|-------|------|-------|
| `time` | `Float` | |
| `data` | `Int` | 0-3 opponent, 4-7 player |
| `length` | `Float` | Hold duration in ms |
| `kind` | `Null<String>` | Custom note type |
| `params` | `Dynamic` | |

**Methods:** `getDirection()` → NoteDirection, `getStrumlineIndex()` → Int, `getMustHitNote()` → Bool, `getStepTime()` → Float

### SongEventData

| Field | Type |
|-------|------|
| `time` | `Float` |
| `eventKind` | `String` |
| `value` | `Dynamic` |

**Methods:** `getHandler()`, `getSchema()`, `getDynamic(key)`, `getInt(key)`, `getFloat(key)`, `getString(key)`, `getBool(key)`, `getArray(key)`

### CharacterData

| Field | Type |
|-------|------|
| `version` | `String` |
| `name` | `String` |
| `renderType` | `String` — sparrow, packer, multisparrow, animateAtlas, placeholder, custom |
| `assetPath` | `String` |
| `scale` | `Float` |
| `healthIcon` | `{ id:String, offsets:Array<Int>, flipX:Bool }` |
| `death` | `{ cameraOffsets:Array<Float>, cameraZoom:Float, preTransitionDelay:Float }` |
| `offsets` | `Array<Float>` |
| `cameraOffsets` | `Array<Float>` |
| `isPixel` | `Bool` |
| `danceEvery` | `Int` |
| `singTime` | `Float` |
| `animations` | `Array<AnimationData>` |

### AnimationData

| Field | Type |
|-------|------|
| `name` | `String` |
| `prefix` | `String` |
| `offsets` | `Array<Float>` |
| `looped` | `Bool` |
| `flipX` | `Bool` |
| `flipY` | `Bool` |
| `frameRate` | `Float` |
| `frameIndices` | `Null<Array<Int>>` |

### StageData

| Field | Type |
|-------|------|
| `version` | `String` |
| `name` | `String` |
| `cameraZoom` | `Float` |
| `directory` | `String` |
| `props` | `Array<StageDataProp>` |
| `characters.bf` | `{ zIndex, position, cameraOffsets, data }` |
| `characters.dad` | `{ zIndex, position, cameraOffsets, data }` |
| `characters.gf` | `{ zIndex, position, cameraOffsets, data }` |

### StageDataProp

| Field | Type |
|-------|------|
| `name` | `String` |
| `assetPath` | `String` |
| `position` | `Array<Float>` |
| `zIndex` | `Float` |
| `scroll` | `Array<Float>` |
| `scale` | `Float` |
| `danceEvery` | `Int` |
| `startingAnimation` | `Null<String>` |
| `animType` | `String` — sparrow or packer |
| `animations` | `Array<AnimationData>` |
