# Codename Engine Events Reference

Complete reference for the Codename Engine event system — 48 event classes, 7 script types, and full callback listings.

---

## Event System Overview

Codename Engine uses a **CancellableEvent** pattern. All events inherit from `CancellableEvent`, which provides:

| Field / Method | Type | Description |
|----------------|------|-------------|
| `cancelled` | `Bool` | Whether the event has been cancelled |
| `data` | `Map<String,Dynamic>` | Custom properties for scripts |
| `preventDefault()` | Method | Cancel the default behavior |
| `cancel()` | Method | Alias for `preventDefault` |

---

## Event Classes

### Root Events

Simple base event types used by many callbacks:

| Event Class | Fields |
|------------|--------|
| `AmountEvent` | `amount:Float` |
| `DrawEvent` | _(none)_ |
| `DynamicEvent` | `value:Dynamic` |
| `NameEvent` | `name:String` |
| `PointEvent` | `x:Float, y:Float` |
| `ResizeEvent` | `width:Int, height:Int` |
| `StateEvent` | `state:FlxState` |
| `TransitionCreationEvent` | `transition:Dynamic, duration:Float` |

### Gameplay Events

#### CountdownEvent

| Field | Type |
|-------|------|
| `swagCounter` | `Int` |
| `sprite` | `FlxSprite` |
| `sound` | `FlxSound` |
| `volume` | `Float` |
| `spritePath` | `String` |
| `soundPath` | `String` |

#### CamMoveEvent

| Field | Type |
|-------|------|
| `x` | `Float` |
| `y` | `Float` |
| `character` | `Character` |
| `section` | `Dynamic` |

#### EventGameEvent

| Field | Type | Notes |
|-------|------|-------|
| `event` | `Dynamic` | |
| `name` | `String` | |
| `values` | `Array<Dynamic>` | Song event triggered during gameplay |

#### GameOverEvent

| Field | Type |
|-------|------|
| `character` | `Character` |
| `gameOverCharacter` | `String` |
| `deathSound` | `String` |
| `retrySound` | `String` |
| `musicPath` | `String` |
| `musicBPM` | `Float` |

#### RatingUpdateEvent

| Field | Type |
|-------|------|
| `rating` | `Dynamic` |
| `combo` | `Int` |
| `score` | `Int` |
| `showCombo` | `Bool` |
| `showRating` | `Bool` |
| `showComboNum` | `Bool` |

### Note Events

#### NoteHitEvent

| Field | Type |
|-------|------|
| `note` | `Note` |
| `rating` | `String` |
| `score` | `Int` |
| `accuracy` | `Float` |
| `character` | `Character` |
| `strumLine` | `StrumLine` |
| `animSuffix` | `String` |
| `healthGain` | `Float` |
| `showRating` | `Bool` |
| `showSplash` | `Bool` |
| `enableCamZooming` | `Bool` |
| `ratingCounterIncrement` | `Bool` |

#### NoteMissEvent

| Field | Type |
|-------|------|
| `note` | `Note` |
| `direction` | `Int` |
| `character` | `Character` |
| `strumLine` | `StrumLine` |
| `healthLoss` | `Float` |
| `playAnim` | `Bool` |
| `animSuffix` | `String` |
| `score` | `Int` |
| `muteSustainVocals` | `Bool` |
| `muteVocals` | `Bool` |
| `playSound` | `Bool` |

#### Other Note Events

| Event Class | Fields |
|------------|--------|
| `NoteCreationEvent` | `note, strumTime, noteData, noteType, isSustainNote` |
| `NoteSpawnEvent` | `note` |
| `StrumCreationEvent` | `strumIndex, strumPlayer, sprite` |
| `GhostTapEvent` | `direction, strumLine` |
| `NoteUpdateEvent` | `note, elapsed` |

### Character Events

| Event Class | Fields |
|------------|--------|
| `CharacterXMLParsedEvent` | `character, xml` |
| `CharacterNodeParsedEvent` | `character, node, anim` |
| `PlayAnimEvent` | `anim, force, reversed, startFrame` |
| `DanceEvent` | `character, beat, danceAlt` |

### Dialogue Events

| Event Class | Fields |
|------------|--------|
| `DialogueStartEvent` | `dialoguePath` |
| `DialogueLineEvent` | `line, lineIndex` |
| `DialogueNextEvent` | `currentLine` |
| `DialogueSkipEvent` | `currentLine` |
| `DialogueEndEvent` | _(none)_ |
| `DialogueCharEvent` | `character, name, expression` |
| `DialogueSoundEvent` | `sound, volume` |
| `DialogueMusicEvent` | `music, volume, fadeIn` |
| `DialogueBoxEvent` | `box, style` |

### Stage Events

| Event Class | Fields |
|------------|--------|
| `StageXMLParsedEvent` | `stage, xml` |
| `StageNodeParsedEvent` | `stage, node, sprite` |

### Menu Events

| Event Class | Fields |
|------------|--------|
| `MenuChangeEvent` | `index, oldIndex, name` |
| `FreeplaySongSelectEvent` | `song, index` |
| `WeekSelectEvent` | `week, index` |
| `DifficultyChangeEvent` | `difficulty, index` |
| `PauseOptionSelectEvent` | `option, index` |
| `MenuScrollEvent` | `direction, amount` |
| `OptionsChangeEvent` | `option, value, oldValue` |

### Misc Events

| Event Class | Fields |
|------------|--------|
| `HealthIconBumpEvent` | `icon, scale` |
| `SplashEvent` | `note, x, y` |
| `DiscordPresenceEvent` | `details, state, largeImageKey` |
| `ShaderEvent` | `shader, name` |
| `SoundTrayEvent` | `volume` |
| `SoundTrayVisibilityEvent` | `visible` |

---

## Callbacks

### PlayState Callbacks

#### Lifecycle
`create`, `postCreate`, `preUpdate`, `update`, `postUpdate`, `draw`, `postDraw`, `destroy`

#### Song
`onSongStart`, `onSongEnd`, `onStartCountdown`, `onCountdown` (CountdownEvent), `onPostCountdown`

#### Timing

| Callback | Parameters |
|----------|-----------|
| `beatHit` | `beat:Int` |
| `stepHit` | `step:Int` |
| `measureHit` | `measure:Int` |

#### Notes

| Callback | Event Type | Notes |
|----------|-----------|-------|
| `onNoteHit` | `NoteHitEvent` | Any note hit |
| `onPostNoteHit` | `NoteHitEvent` | After note hit processed |
| `onPlayerMiss` | `NoteMissEvent` | Player missed |
| `onPlayerHit` | `NoteHitEvent` | Player-specific hit |
| `onDadHit` | `NoteHitEvent` | Opponent-specific hit |
| `onNoteSpawn` | `NoteSpawnEvent` | Note spawned |
| `onNoteCreation` | `NoteCreationEvent` | Note created |
| `onGhostTap` | `GhostTapEvent` | Ghost tap |
| `onNoteUpdate` | `NoteUpdateEvent` | Note frame update |

#### Characters

| Callback | Event Type |
|----------|-----------|
| `onDance` | `DanceEvent` |
| `onTryDance` | `DanceEvent` |
| `onPlayAnim` | `PlayAnimEvent` |
| `onCharacterXMLParsed` | `CharacterXMLParsedEvent` |
| `onCharacterNodeParsed` | `CharacterNodeParsedEvent` |

#### Stage
`onStageXMLParsed` (StageXMLParsedEvent), `onStageNodeParsed` (StageNodeParsedEvent), `onPostStageCreation`

#### Events
`onEvent` (EventGameEvent), `onPostEvent` (EventGameEvent), `onCameraMove` (CamMoveEvent)

#### Gameplay
`onGamePause` (cancellable), `onGameOver` (GameOverEvent, cancellable), `onRatingUpdate` (RatingUpdateEvent)

#### Substates
`onSubstateOpen` (StateEvent), `onSubstateClose` (StateEvent)

### Menu Callbacks

| Menu | Callbacks |
|------|----------|
| **Main Menu** | `onSelectItem`, `onChangeItem` |
| **Story Menu** | `onGoBack`, `onChangeWeek`, `onChangeDifficulty`, `onWeekSelect` |
| **Freeplay** | `onSelect`, `onChangeDiff`, `onChangeCoopMode`, `onChangeSelection`, `onUpdateOptionsAlpha` |
| **Pause** | `create`, `postCreate`, `update`, `onSelectOption`, `onChangeItem`, `destroy` |

### MusicBeatState Callbacks

- **Lifecycle:** `create`, `postCreate`, `preUpdate`, `update`, `postUpdate`
- **Drawing:** `draw`, `postDraw`
- **Substates:** `onOpenSubState`, `onCloseSubState`
- **Events:** `onResize`, `onStateSwitch`
- **Timing:** `beatHit`, `stepHit`, `measureHit`

### Global Callbacks

!!! note
    Only available if the `GLOBAL_SCRIPT` compilation flag is set.

`onScriptCreated`, `onScriptSetup`, `beatHit`, `stepHit`, `focusGained`, `focusLost`, `gameResized`, `postDraw`, `postGameReset`, `postGameStart`, `postStateSwitch`

---

## Script Types

| Type | Location | Scope |
|------|----------|-------|
| **PlayState** | `data/songs/{songName}/` | PlayState lifecycle only |
| **Character** | `data/characters/{charName}/` | Per-character behavior |
| **Stage** | `data/stages/{stageName}/` | Per-stage, loaded with stage XML |
| **State** | `data/states/{StateName}/` | Any MusicBeatState, including menus |
| **Global** | `data/global/` | Persistent across all states |
| **Note Type** | `data/notetypes/{noteTypeName}/` | Custom note type behavior |
| **Event** | `data/events/{eventName}/` | Custom song event handler |

All script types support extensions: `.hx`, `.hscript`, `.hsc`, `.hxs`

---

## Scripting Features

### Available Imports

=== "Haxe Std"

    `Std`, `Math`, `Reflect`, `StringTools`, `Json`, `Xml`, `Type`, `Date`, `Lambda`, `Sys`

=== "OpenFL"

    `Assets`, `Application`, `Main`

=== "Flixel"

    `FlxG`, `FlxSprite`, `FlxCamera`, `FlxTween`, `FlxTimer`, `FlxEase`, `FlxColor`, `FlxMath`, `FlxText`

=== "Engine"

    `PlayState`, `Character`, `Note`, `StrumLine`, `Stage`, `Conductor`, `Paths`, `CoolUtil`, `Flags`

=== "UI"

    `HealthIcon`, `NoteGroup`, `BeatGroup`

### Script Features

| Feature | Usage |
|---------|-------|
| Custom classes | Supported |
| Static variables | Supported |
| Import script | `importScript('path/to/script')` |
| Disable script | `disableScript()` |
| Event prevention | `event.preventDefault()` or `event.cancel()` |
| Custom event data | `event.data.set('key', value)` / `event.data.get('key')` |

---

## Dispatch Mechanism

The event system follows this flow:

1. Event object created with initial values
2. Dispatched to scripts via `scripts.event('callbackName', eventObj)`
3. Scripts can modify event properties
4. Scripts can call `event.preventDefault()` to cancel
5. Dispatcher checks `event.cancelled`
6. If not cancelled, default behavior executes

### Dispatch Methods

| Method | Usage | Notes |
|--------|-------|-------|
| `scripts.event` | `scripts.event('callbackName', eventObj)` | Broadcasts to all scripts in pack |
| `scripts.call` | `scripts.call('callbackName', [param1, param2])` | Function call broadcast |
| `gameAndCharsEvent` | `gameAndCharsEvent('callbackName', eventObj)` | Dispatches to state + all character scripts |
