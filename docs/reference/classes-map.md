# Cross-Engine Class Map

Side-by-side comparison of equivalent classes across all three FNF engines. Each section shows the package, access pattern, fields, and methods for the same concept in each engine.

---

## Conductor

Controls BPM, song position, and timing.

=== "Psych Engine"

    **Class:** `backend.Conductor` — Access: `Conductor` (static)

    **Fields:**

    | Field | Type | Notes |
    |-------|------|-------|
    | `bpm` | `Float` | Static |
    | `crochet` | `Float` | Beat duration in ms |
    | `stepCrochet` | `Float` | Step duration in ms |
    | `songPosition` | `Float` | Static |
    | `offset` | `Float` | Static |
    | `safeZoneOffset` | `Float` | Static |
    | `bpmChangeMap` | `Array<BPMChangeEvent>` | Static |

    **Methods:**

    | Method | Parameters | Returns |
    |--------|-----------|---------|
    | `judgeNote` | `arr:Array<Rating>, diff:Float` | `Rating` |
    | `beatToSeconds` | `beat:Float` | `Float` |
    | `getStep` | `time:Float` | `Float` |
    | `getBeat` | `time:Float` | `Float` |
    | `mapBPMChanges` | `song:SwagSong` | `Void` |

=== "Codename Engine"

    **Class:** `funkin.backend.system.Conductor` — Access: `Conductor` (static)

    **Fields:**

    | Field | Type | Notes |
    |-------|------|-------|
    | `bpm` | `Float` | Getter-based |
    | `startingBPM` | `Float` | Getter-based |
    | `crochet` | `Float` | Getter-based |
    | `stepCrochet` | `Float` | Getter-based |
    | `songPosition` | `Float` | Getter-based |
    | `songOffset` | `Float` | |
    | `curStepFloat` | `Float` | Getter-based |
    | `curBeatFloat` | `Float` | Getter-based |
    | `curMeasureFloat` | `Float` | Getter-based |
    | `beatsPerMeasure` | `Float` | Getter-based |
    | `stepsPerBeat` | `Int` | Getter-based |
    | `bpmChangeMap` | `Array<BPMChangeEvent>` | |

    **Methods:**

    | Method | Parameters | Returns |
    |--------|-----------|---------|
    | `changeBPM` | `bpm:Float, beatsPerMeasure:Float, stepsPerBeat:Int` | `Void` |
    | `setupSong` | `SONG:ChartData` | `Void` |
    | `mapBPMChanges` | `song:ChartData` | `Void` |
    | `reset` | _(none)_ | `Void` |

    **Signals:**

    | Signal | Type |
    |--------|------|
    | `onMeasureHit` | `FlxTypedSignal<Int->Void>` |
    | `onBeatHit` | `FlxTypedSignal<Int->Void>` |
    | `onStepHit` | `FlxTypedSignal<Int->Void>` |
    | `onBPMChange` | `FlxTypedSignal<(Float,Float)->Void>` |
    | `onTimeSignatureChange` | `FlxTypedSignal` |

=== "Official Funkin"

    **Class:** `funkin.Conductor` — Access: `Conductor.instance` (instance-based, not static)

    **Fields:**

    | Field | Type | Notes |
    |-------|------|-------|
    | `songPosition` | `Float` | |
    | `bpm` | `Float` | |
    | `beatLengthMs` | `Float` | Equivalent to `crochet` |
    | `stepLengthMs` | `Float` | Equivalent to `stepCrochet` |
    | `measureLengthMs` | `Float` | |
    | `timeSignatureNum` | `Int` | |
    | `timeSignatureDen` | `Int` | |
    | `currentTimeChange` | `SongTimeChange` | |

    **Methods:**

    | Method | Parameters | Returns |
    |--------|-----------|---------|
    | `update` | `songPosition:Float` | `Void` |
    | `getTimeFromStep` | `step:Int` | `Float` |
    | `getStepFromTime` | `time:Float` | `Int` |
    | `forceBPM` | `bpm:Float` | `Void` |
    | `clearForcedBPM` | _(none)_ | `Void` |

---

## Paths

Asset loading and path resolution.

=== "Psych Engine"

    **Class:** `backend.Paths` — Access: `Paths` (static)

    | Method | Parameters | Returns |
    |--------|-----------|---------|
    | `image` | `key:String, ?allowGPU:Bool` | `Dynamic` |
    | `sound` | `key:String` | `Dynamic` |
    | `music` | `key:String` | `Dynamic` |
    | `getSparrowAtlas` | `key:String` | `FlxFramesCollection` |
    | `getAtlas` | `key:String` | `FlxFramesCollection` |
    | `json` | `key:String, ?folder:String` | `String` |
    | `xml` | `key:String, ?folder:String` | `String` |
    | `txt` | `key:String, ?folder:String` | `String` |
    | `lua` | `key:String, ?folder:String` | `String` |
    | `shaderFragment` | `key:String` | `String` |
    | `shaderVertex` | `key:String` | `String` |

    **Constants:** `SOUND_EXT` = ogg (desktop) / mp3 (web), `VIDEO_EXT` = mp4

=== "Codename Engine"

    **Class:** `funkin.backend.assets.Paths` — Access: `Paths` (static)

    | Method | Parameters | Returns |
    |--------|-----------|---------|
    | `image` | `key:String, ?library:String, ?checkForAtlas:Bool, ?ext:String` | `String` |
    | `sound` | `key:String, ?library:String, ?ext:String` | `String` |
    | `music` | `key:String, ?library:String, ?ext:String` | `String` |
    | `voices` | `song:String, ?difficulty:String, ?suffix:String, ?ext:String` | `String` |
    | `inst` | `song:String, ?difficulty:String, ?suffix:String, ?ext:String` | `String` |
    | `json` | `key:String, ?library:String` | `String` |
    | `xml` | `key:String, ?library:String` | `String` |
    | `txt` | `key:String, ?library:String` | `String` |
    | `getSparrowAtlas` | `key:String, ?library:String, ?ext:String` | `FlxAtlasFrames` |
    | `getPackerAtlas` | `key:String, ?library:String, ?ext:String` | `FlxAtlasFrames` |
    | `getFrames` | `key:String, ?assetsPath:Bool, ?library:String` | `FlxFramesCollection` |
    | `video` | `key:String, ?ext:String` | `String` |
    | `script` | `key:String, ?library:String` | `String` |
    | `character` | `character:String` | `String` |
    | `chart` | `song:String, ?difficulty:String, ?variant:String` | `String` |

=== "Official Funkin"

    **Class:** `funkin.Paths` — Access: `Paths` (static)

    | Method | Parameters | Returns |
    |--------|-----------|---------|
    | `image` | `key:String` | `String` |
    | `sound` | `key:String` | `String` |
    | `music` | `key:String` | `String` |
    | `voices` | `song:String, ?suffix:String` | `String` |
    | `inst` | `song:String, ?suffix:String, withExtension:Bool` | `String` |
    | `json` | `key:String` | `String` |
    | `getSparrowAtlas` | `key:String` | `FlxAtlasFrames` |
    | `animateAtlas` | `path:String` | `String` |

---

## PlayState

Main gameplay state — the core of any FNF engine.

=== "Psych Engine"

    **Class:** `states.PlayState` — Access: `PlayState.instance`

    | Field | Type | Notes |
    |-------|------|-------|
    | `SONG` | `SwagSong` | Static |
    | `instance` | `PlayState` | Static |
    | `isStoryMode` | `Bool` | Static |
    | `storyDifficulty` | `Int` | Static |
    | `health` | `Float` | |
    | `combo` | `Int` | |
    | `songScore` | `Int` | |
    | `songMisses` | `Int` | |
    | `songHits` | `Int` | |
    | `boyfriend` | `Character` | Direct property |
    | `dad` | `Character` | Direct property |
    | `gf` | `Character` | Direct property |
    | `boyfriendGroup` | `FlxSpriteGroup` | |
    | `dadGroup` | `FlxSpriteGroup` | |
    | `gfGroup` | `FlxSpriteGroup` | |
    | `camGame` | `FlxCamera` | |
    | `camHUD` | `FlxCamera` | |
    | `camOther` | `FlxCamera` | |
    | `playerStrums` | `FlxTypedGroup<StrumNote>` | |
    | `opponentStrums` | `FlxTypedGroup<StrumNote>` | |
    | `startedCountdown` | `Bool` | |
    | `generatedMusic` | `Bool` | |

=== "Codename Engine"

    **Class:** `funkin.game.PlayState` — Access: `PlayState.instance`

    | Field | Type | Notes |
    |-------|------|-------|
    | `SONG` | `ChartData` | Static |
    | `instance` | `PlayState` | Static |
    | `isStoryMode` | `Bool` | Static |
    | `difficulty` | `String` | Static (string, not int) |
    | `variation` | `Null<String>` | Static |
    | `opponentMode` | `Bool` | Static |
    | `coopMode` | `Bool` | Static |
    | `health` | `Float` | |
    | `maxHealth` | `Float` | |
    | `combo` | `Int` | |
    | `boyfriend` | `Character` | Getter-based |
    | `dad` | `Character` | Getter-based |
    | `gf` | `Character` | Getter-based |
    | `bf` | `Character` | Alias for boyfriend |
    | `strumLines` | `FlxTypedGroup<StrumLine>` | |
    | `playerStrums` | `StrumLine` | Getter-based |
    | `cpuStrums` | `StrumLine` | Getter-based |
    | `player` | `StrumLine` | Getter-based |
    | `cpu` | `StrumLine` | Getter-based |
    | `stage` | `Stage` | |
    | `scrollSpeed` | `Float` | |
    | `downscroll` | `Bool` | Getter-based |
    | `inst` | `FlxSound` | |
    | `vocals` | `FlxSound` | |
    | `iconP1` | `HealthIcon` | |
    | `iconP2` | `HealthIcon` | |
    | `startingSong` | `Bool` | |
    | `generatedMusic` | `Bool` | |
    | `curSong` | `String` | |
    | `scripts` | `ScriptPack` | |

=== "Official Funkin"

    **Class:** `funkin.play.PlayState` — Access: `PlayState.instance`

    | Field | Type | Notes |
    |-------|------|-------|
    | `instance` | `PlayState` | Static |
    | `currentSong` | `Song` | |
    | `currentDifficulty` | `String` | |
    | `currentVariation` | `String` | |
    | `currentStage` | `Null<Stage>` | |
    | `health` | `Float` | |
    | `songScore` | `Int` | |
    | `playbackRate` | `Float` | |
    | `instrumentalVolume` | `Float` | |
    | `playerVocalsVolume` | `Float` | |
    | `opponentVocalsVolume` | `Float` | |
    | `cameraFollowPoint` | `FlxObject` | |
    | `deathCounter` | `Int` | |

    !!! warning "Character Access"
        Characters are **not** direct properties. Access via stage methods:

        - `currentStage.getBoyfriend()` → `BaseCharacter`
        - `currentStage.getDad()` → `BaseCharacter`
        - `currentStage.getGirlfriend()` → `BaseCharacter`

---

## Character

Player, opponent, and girlfriend characters.

=== "Psych Engine"

    **Class:** `objects.Character`

    | Field | Type |
    |-------|------|
    | `curCharacter` | `String` |
    | `isPlayer` | `Bool` |
    | `healthIcon` | `String` |
    | `animationsArray` | `Array<AnimArray>` |
    | `singDuration` | `Float` |
    | `positionArray` | `Array<Float>` |
    | `cameraPosition` | `Array<Float>` |
    | `healthColorArray` | `Array<Int>` |
    | `danceIdle` | `Bool` |
    | `idleSuffix` | `String` |

=== "Codename Engine"

    **Class:** `funkin.game.Character`

    | Field | Type |
    |-------|------|
    | `curCharacter` | `String` |
    | `isPlayer` | `Bool` |
    | `icon` | `String` |
    | `iconColor` | `Null<FlxColor>` |
    | `holdTime` | `Float` |
    | `danceOnBeat` | `Bool` |
    | `idleSuffix` | `String` |
    | `cameraOffset` | `FlxPoint` |
    | `globalOffset` | `FlxPoint` |
    | `gameOverCharacter` | `String` |
    | `xml` | `Access` |

=== "Official Funkin"

    **Class:** `funkin.play.character.BaseCharacter` — Scripted: `ScriptedCharacter`

    **Fields:**

    | Field | Type |
    |-------|------|
    | `characterId` | `String` |
    | `characterName` | `String` |
    | `characterType` | `CharacterType` |
    | `holdTimer` | `Float` |
    | `isDead` | `Bool` |
    | `cameraFocusPoint` | `FlxPoint` |

    **Methods:**

    | Method | Parameters |
    |--------|-----------|
    | `playAnimation` | `name:String, force:Bool` |
    | `singNote` | `direction:NoteDirection, length:Float` |
    | `holdNote` | `direction:NoteDirection` |
    | `playDeath` | _(none)_ |
    | `resetCharacter` | `resetAnimations:Bool` |

---

## Note

Individual note objects during gameplay.

=== "Psych Engine"

    **Class:** `objects.Note`

    | Field | Type |
    |-------|------|
    | `strumTime` | `Float` |
    | `noteData` | `Int` |
    | `mustPress` | `Bool` |
    | `isSustainNote` | `Bool` |
    | `sustainLength` | `Float` |
    | `noteType` | `String` |
    | `canBeHit` | `Bool` |
    | `wasGoodHit` | `Bool` |
    | `missed` | `Bool` |
    | `gfNote` | `Bool` |
    | `noAnimation` | `Bool` |
    | `hitHealth` | `Float` |
    | `missHealth` | `Float` |
    | `texture` | `String` |

=== "Codename Engine"

    **Class:** `funkin.game.Note`

    | Field | Type | Notes |
    |-------|------|-------|
    | `strumTime` | `Float` | |
    | `noteData` | `Int` | |
    | `mustPress` | `Bool` | Getter-based |
    | `isSustainNote` | `Bool` | |
    | `sustainLength` | `Float` | |
    | `noteType` | `String` | Getter-based |
    | `canBeHit` | `Bool` | |
    | `wasGoodHit` | `Bool` | |
    | `tooLate` | `Bool` | Replaces `missed` |
    | `strumLine` | `StrumLine` | |
    | `strumID` | `Int` | Getter-based |
    | `animSuffix` | `String` | |
    | `extra` | `Map<String,Dynamic>` | Custom data |
    | `prevNote` | `Note` | |
    | `nextNote` | `Note` | |

=== "Official Funkin"

    **Class:** `funkin.play.notes.NoteSprite`

    | Field | Type | Notes |
    |-------|------|-------|
    | `strumTime` | `Float` | |
    | `direction` | `NoteDirection` | Replaces `noteData` |
    | `length` | `Float` | |
    | `kind` | `Null<String>` | Replaces `noteType` |
    | `noteData` | `SongNoteData` | Raw note data object |
    | `isHoldNote` | `Bool` | Computed |
    | `scoreable` | `Bool` | |
    | `hasBeenHit` | `Bool` | Replaces `wasGoodHit` |
    | `hasMissed` | `Bool` | Replaces `missed` |

---

## Strumline

Strum receptors and note lanes.

=== "Psych Engine"

    **Class:** `objects.StrumNote` — Individual strum receptor

    | Field | Type |
    |-------|------|
    | `noteData` | `Int` |
    | `direction` | `Float` |
    | `downScroll` | `Bool` |
    | `resetAnim` | `Float` |
    | `texture` | `String` |

    Access groups via `PlayState.instance.playerStrums` / `opponentStrums` (`FlxTypedGroup<StrumNote>`)

=== "Codename Engine"

    **Class:** `funkin.game.StrumLine` — Full strum line group

    | Field | Type |
    |-------|------|
    | `characters` | `Array<Character>` |
    | `cpu` | `Bool` |
    | `opponentSide` | `Bool` |
    | `notes` | `NoteGroup` |
    | `controls` | `Controls` |
    | `vocals` | `FlxSound` |
    | `ghostTapping` | `Null<Bool>` |
    | `strumScale` | `Float` |

    **Signals:**

    | Signal | Type |
    |--------|------|
    | `onHit` | `FlxTypedSignal<NoteHitEvent->Void>` |
    | `onMiss` | `FlxTypedSignal<NoteMissEvent->Void>` |

=== "Official Funkin"

    **Class:** `funkin.play.notes.Strumline`

    | Field | Type |
    |-------|------|
    | `isPlayer` | `Bool` |
    | `scrollSpeed` | `Float` |
    | `notes` | `FlxTypedSpriteGroup<NoteSprite>` |
    | `holdNotes` | `FlxTypedSpriteGroup<SustainTrail>` |
    | `strumlineNotes` | `FlxTypedSpriteGroup<StrumlineNote>` |

    **Constants:** `KEY_COUNT` = 4, `STRUMLINE_SIZE` = 104, `NOTE_SPACING` = 112

---

## Scoring / Rating

Score calculation and rating systems.

=== "Psych Engine"

    **Class:** `backend.Rating`

    | Field | Type |
    |-------|------|
    | `name` | `String` |
    | `image` | `String` |
    | `hitWindow` | `Null<Float>` |
    | `ratingMod` | `Float` |
    | `score` | `Int` |
    | `noteSplash` | `Bool` |
    | `hits` | `Int` |

    Array of Rating objects: `[sick, good, bad, shit]`. Created via `loadDefault()`.

=== "Codename Engine"

    **Class:** `funkin.game.scoring.RatingManager`

    | Method | Parameters |
    |--------|-----------|
    | `judgeNote` | `time:Float` |
    | `addRating` | `data:Dynamic` |
    | `removeRating` | `name:String` |
    | `getHitWindow` | `name:String` |

=== "Official Funkin"

    **Class:** `funkin.play.scoring.Scoring`

    Scoring is handled internally — limited direct access from scripts.

---

## Other Classes

### GameOverSubState

| Engine | Package | Class |
|--------|---------|-------|
| Psych | `substates` | `GameOverSubstate` |
| Codename | `funkin.game` | `GameOverSubstate` |
| Official | `funkin.play` | `GameOverSubState` |

### PauseSubState

| Engine | Package | Class |
|--------|---------|-------|
| Psych | `substates` | `PauseSubState` |
| Codename | `funkin.menus` | `PauseSubState` |
| Official | `funkin.play` | `PauseSubState` |

### Song / Chart Data

| Engine | Package | Class | Notes |
|--------|---------|-------|-------|
| Psych | `backend` | `Song` (typedef `SwagSong`) | Fields: song, notes, events, bpm, needsVoices, speed, offset, player1, player2, gfVersion, stage |
| Codename | `funkin.backend.chart` | `ChartData` | Parsed from various formats |
| Official | `funkin.play.song` | `Song` | Rich class with metadata, variations support |

### Stage

| Engine | Package | Class | Notes |
|--------|---------|-------|-------|
| Psych | `backend` | `BaseStage` | Data: `StageData` |
| Codename | `funkin.game` | `Stage` | XML-based, script-extensible |
| Official | `funkin.play.stage` | `Stage` | Scripted: `ScriptedStage` |

### Countdown

| Engine | Notes |
|--------|-------|
| Psych | Built into PlayState. Callback: `onCountdownTick(swagCounter)` |
| Codename | Built into PlayState. Events: `onStartCountdown`, `onCountdown(CountdownEvent)`, `onPostCountdown` |
| Official | Separate class `funkin.play.Countdown`. Events: `COUNTDOWN_START`, `COUNTDOWN_STEP`, `COUNTDOWN_END` |
