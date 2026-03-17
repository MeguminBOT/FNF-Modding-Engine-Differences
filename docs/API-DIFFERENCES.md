# Friday Night Funkin' Engines - API Differences

Compares modding differences and APIs across three major Friday Night Funkin' engines:

- **Official Funkin** (FunkinCrew/Funkin) — v0.8.x+
- **Psych Engine** (ShadowMario/FNF-PsychEngine) — v1.0.4
- **Codename Engine** (CodenameCrew/CodenameEngine) — v1.0.x

If any errors are found, you're more than welcome to point them out or correct them!

Last updated: March 17th, 2026 (11:53 AM)
---

## Table of Contents

1. [Engine Overview](#1-engine-overview)
2. [Mod Folder Structure](#2-mod-folder-structure)
3. [Mod Metadata](#3-mod-metadata)
4. [Data Format Languages](#4-data-format-languages)
5. [Chart / Song Data Format](#5-chart--song-data-format)
6. [Character Data Format](#6-character-data-format)
7. [Stage Data Format](#7-stage-data-format)
8. [Week / Level Data Format](#8-week--level-data-format)
9. [Audio File Conventions](#9-audio-file-conventions)
10. [Scripting System](#10-scripting-system)
11. [Script Callbacks](#11-script-callbacks)
12. [Common Scripting Patterns](#12-common-scripting-patterns)
13. [Psych Engine: Lua ↔ HScript Interop](#13-psych-engine-lua--hscript-interop)
14. [Events System](#14-events-system)
15. [Note Types](#15-note-types)
16. [Health Icons](#16-health-icons)
17. [Additional Features](#17-additional-features)
18. [Cross-Engine Conversion Summary](#18-cross-engine-conversion-summary)

---

## 1. Engine Overview

| Feature | Official Funkin | Psych Engine | Codename Engine |
|---------|----------------|--------------|-----------------|
| **Language** | Haxe (HaxeFlixel) | Haxe (HaxeFlixel) | Haxe (HaxeFlixel) |
| **Modding Framework** | Polymod | Custom (file-override based) | Custom (file-override based) |
| **Scripting Language** | HScript (.hxs) | Lua (.lua) + HScript Iris (.hx) | HScript Improved (.hx) |
| **Data Formats** | JSON | JSON | XML (characters, stages, weeks), JSON (charts, events, song meta) |
| **Platforms** | Windows, Mac, Linux, Web, iOS, Android | Windows, Mac, Linux | Windows, Mac, Linux |
| **Status** | Active development | Archived (March 2025) | Active development |
| **Current Version** | v0.8.3 | v1.0.4 (final) | v1.0.1 |

---

## 2. Mod Folder Structure

### Official Funkin (Polymod)

```
mods/MyMod/
├── _polymod_meta.json          # Required mod metadata
├── data/
│   ├── characters/             # Character JSON files
│   ├── levels/                 # Week/level JSON definitions
│   ├── songs/
│   │   └── <songid>/
│   │       ├── <songid>-metadata.json
│   │       └── <songid>-chart.json
│   └── stages/                 # Stage JSON files
├── images/
│   ├── characters/             # Character spritesheets
│   └── stages/                 # Stage prop images
├── songs/
│   └── <songid>/
│       ├── Inst.ogg
│       ├── Voices-bf.ogg       # Per-character vocals
│       └── Voices-pico.ogg
├── scripts/                    # HScript module scripts (.hxs)
└── shared/                     # Shared assets
```

### Psych Engine

```
mods/MyMod/
├── pack.json                   # Mod metadata
├── characters/                 # Character JSON + Lua scripts
├── custom_events/              # Event Lua scripts
├── custom_notetypes/           # Note type Lua scripts
├── data/
│   └── <Song>/                 # Chart JSON per song
│       └── <Song>.json         # (or difficulty variants)
├── images/                     # Spritesheets, icons, etc.
├── music/                      # Background music
├── scripts/                    # Global Lua scripts (run always)
├── songs/
│   └── <Song>/
│       ├── Inst.ogg
│       └── Voices.ogg          # Single combined or split
├── stages/                     # Stage JSON + Lua scripts
├── sounds/                     # Sound effects
├── videos/                     # Video cutscenes (.mp4)
└── weeks/                      # Week JSON definitions
```

### Codename Engine

```
mods/MyMod/
├── songs/
│   └── <song>/
│       ├── song/
│       │   ├── Inst.ogg
│       │   ├── Voices.ogg
│       │   ├── Voices-dad.ogg  # Per-character vocals
│       │   └── Voices-bf.ogg
│       ├── charts/
│       │   ├── easy.json
│       │   ├── normal.json
│       │   └── hard.json
│       ├── scripts/            # Per-song gameplay scripts
│       │   └── modchart.hx
│       └── meta.json
├── data/
│   ├── characters/             # Character XML files
│   ├── stages/                 # Stage XML files
│   ├── weeks/
│   │   └── weeks/              # Week XML files
│   ├── events/                 # Custom event JSON + HScript
│   ├── notes/                  # Custom note type scripts
│   ├── states/                 # State override scripts
│   └── config/                 # discord.json, credits.xml, options.xml
├── images/
│   ├── characters/             # Character spritesheets
│   └── stages/                 # Stage images
└── (no metadata file required)
```

### Key Differences

| Aspect | Official Funkin | Psych Engine | Codename Engine |
|--------|----------------|--------------|-----------------|
| **Metadata file** | `_polymod_meta.json` (required) | `pack.json` (optional) | None required |
| **Chart location** | `data/songs/<id>/` | `data/<Song>/` | `songs/<song>/charts/` |
| **Character data dir** | `data/characters/` | `characters/` | `data/characters/` |
| **Stage data dir** | `data/stages/` | `stages/` | `data/stages/` |
| **Week data dir** | `data/levels/` | `weeks/` | `data/weeks/weeks/` |
| **Song audio dir** | `songs/<id>/` | `songs/<Song>/` | `songs/<song>/song/` |
| **Scripts location** | `scripts/` | `scripts/` (global), per-song in `data/<Song>/` | `songs/<song>/scripts/` (per-song), `data/states/` (global) |
| **Addons/Always-on** | N/A | N/A | `./addons/` folder |

---

## 3. Mod Metadata

### Official Funkin — `_polymod_meta.json`

```json
{
  "title": "My Mod",
  "description": "A cool mod.",
  "contributors": [
    { "name": "ModAuthor", "role": "Programmer" }
  ],
  "api_version": "0.6.3",
  "mod_version": "1.0.0",
  "license": "Apache-2.0",
  "dependencies": {},
  "optionalDependencies": {}
}
```

### Psych Engine — `pack.json`

```json
{
  "name": "My Mod",
  "description": "A cool mod.",
  "restart": false,
  "runsGlobally": false,
  "color": [170, 0, 255]
}
```

### Codename Engine

No metadata file required. Mod is loaded simply by existing as a folder in `./mods/`.

Config files (Discord RPC, credits, options) go in `./data/config/`.

---

## 4. Data Format Languages

| Data Type | Official Funkin | Psych Engine | Codename Engine |
|-----------|----------------|--------------|-----------------|
| **Charts** | JSON | JSON | JSON |
| **Characters** | JSON | JSON | **XML** |
| **Stages** | JSON | JSON + Lua | **XML** (+ HScript) |
| **Weeks/Levels** | JSON | JSON | **XML** |
| **Events** | JSON (in chart) | JSON (in chart) | JSON (params) + HScript (handler) |
| **Song Metadata** | JSON (separate file) | JSON (in chart) | JSON (`meta.json`) |

This is one of the biggest divergences — Codename Engine uses **XML** for characters, stages, and weeks, while both Funkin and Psych use **JSON**.

---

## 5. Chart / Song Data Format

### Official Funkin

Charts are split into two files per song:

**`<songid>-metadata.json`** — Song properties:
```json
{
  "version": "2.2.4",
  "songName": "Bopeebo",
  "artist": "Kawai Sprite",
  "charter": "ninjamuffin99",
  "playData": {
    "difficulties": ["easy", "normal", "hard"],
    "characters": {
      "player": "bf",
      "opponent": "dad",
      "girlfriend": "gf"
    },
    "stage": "mainStage",
    "noteStyle": "funkin",
    "ratings": { "default": 0 }
  },
  "timeFormat": "ms",
  "timeChanges": [
    { "t": 0, "bpm": 100, "n": 4, "d": 4, "bt": [4, 4, 4, 4] }
  ]
}
```

**`<songid>-chart.json`** — Note data:
```json
{
  "version": "2.1.0",
  "scrollSpeed": { "default": 1.0 },
  "notes": {
    "default": [
      { "t": 1000, "d": 0, "l": 0, "k": "" }
    ]
  },
  "events": [
    { "t": 2000, "e": "FocusCamera", "v": { "char": 1 } }
  ]
}
```

**Note encoding:**
- `t` = time in ms
- `d` = direction (0-3 = player, 4-7 = opponent)
- `l` = sustain length in ms
- `k` = note kind/type (optional string)

### Psych Engine

Single chart file per song/difficulty:

**`<Song>.json`**:
```json
{
  "song": {
    "song": "Bopeebo",
    "bpm": 100,
    "speed": 1.0,
    "needsVoices": true,
    "player1": "bf",
    "player2": "dad",
    "gfVersion": "gf",
    "stage": "stage",
    "notes": [
      {
        "sectionNotes": [
          [1000, 0, 0],
          [1500, 5, 200, "Alt Animation"]
        ],
        "mustHitSection": true,
        "altAnim": false,
        "gfSection": false,
        "bpm": 100,
        "changeBPM": false,
        "lengthInSteps": 16
      }
    ],
    "events": [
      [2000, [["Hey!", "BF", "0.6"]]]
    ]
  }
}
```

**Note encoding:**
- `[strumTimeMs, noteData, sustainLengthMs, noteType?]`
- `noteData` 0-3 and 4-7 meaning depends on `mustHitSection`:
  - `mustHitSection: true` → 0-3 = player, 4-7 = opponent
  - `mustHitSection: false` → 0-3 = opponent, 4-7 = player

### Codename Engine

Per-difficulty chart files stored under the song folder:

**`songs/<song>/charts/<difficulty>.json`**:

Codename Engine uses its own internal chart format with strumline-based note assignment (no `mustHitSection`). Notes belong to specific strumlines directly. The chart editor handles conversion from legacy FNF format automatically.

**`songs/<song>/meta.json`** — Song metadata:
Contains BPM, time signature, display name, and other song properties.

### Chart Format Comparison

| Aspect | Official Funkin | Psych Engine | Codename Engine |
|--------|----------------|--------------|-----------------|
| **File split** | metadata + chart (2 files) | Single file | meta.json + per-difficulty chart files |
| **Note structure** | `{t, d, l, k}` objects | `[time, data, sustain, type?]` arrays | Strumline-based |
| **Direction mapping** | 0-3 player, 4-7 opponent (fixed) | Depends on `mustHitSection` | Per-strumline |
| **Section concept** | No sections | Section-based (`mustHitSection`) | No sections (`curCameraTarget` instead) |
| **BPM changes** | `timeChanges` array in metadata | `changeBPM` flag per section | Events (`BPM Change` event) |
| **Events storage** | In chart JSON | In chart JSON (separate `events` array) | Separate per-event-type files |
| **Scroll speed** | Per-difficulty in chart | Single `speed` value | Per-difficulty in chart |
| **Characters** | In metadata `playData.characters` | In chart `player1`, `player2`, `gfVersion` | In meta.json / chart editor |
| **Difficulties** | Listed in metadata, separate `notes` keys | Separate files per difficulty | Separate files per difficulty |

---

## 6. Character Data Format

### Official Funkin — JSON (`data/characters/<name>.json`)

```json
{
  "version": "1.0.0",
  "name": "Daddy Dearest",
  "renderType": "sparrow",
  "assetPath": "characters/DADDY_DEAREST",
  "startingAnimation": "idle",
  "singTime": 6.1,
  "flipX": false,
  "isPixel": false,
  "healthIcon": { "id": "dad", "scale": 1.0, "flipX": false, "isPixel": false, "offsets": [0, 0] },
  "offsets": [0, 0],
  "cameraOffsets": [0, 0],
  "danceEvery": 1,
  "scale": 1.0,
  "death": { "cameraOffsets": [0, 0], "cameraZoom": 1, "preTransitionDelay": 0 },
  "animations": [
    {
      "name": "idle",
      "prefix": "Dad idle dance",
      "offsets": [0, 0],
      "looped": false,
      "frameRate": 24,
      "frameIndices": [],
      "flipX": false,
      "flipY": false
    },
    {
      "name": "singLEFT",
      "prefix": "Dad Sing Note LEFT",
      "offsets": [-10, 10],
      "looped": false,
      "frameRate": 24
    }
  ]
}
```

### Psych Engine — JSON (`characters/<name>.json`)

```json
{
  "animations": [
    {
      "anim": "idle",
      "name": "Dad idle dance",
      "fps": 24,
      "loop": false,
      "indices": [],
      "offsets": [0, 0]
    },
    {
      "anim": "singLEFT",
      "name": "dad sing note right",
      "fps": 24,
      "loop": false,
      "indices": [],
      "offsets": [-10, 10]
    }
  ],
  "image": "characters/DADDY_DEAREST",
  "scale": 1,
  "sing_duration": 6.1,
  "healthicon": "dad",
  "position": [0, 0],
  "camera_position": [0, 0],
  "flip_x": false,
  "no_antialiasing": false,
  "healthbar_colors": [161, 161, 161]
}
```

### Codename Engine — XML (`data/characters/<name>.xml`)

```xml
<character isPlayer="false" flipX="false" holdTime="6.1" color="#AF66CE"
           icon="dad" scale="1" antialiasing="true"
           x="0" y="0" camx="0" camy="0"
           gameOverChar="bf-dead" sprite="characters/DADDY_DEAREST">
    <anim name="idle" anim="Dad idle dance" fps="24" loop="false" x="0" y="0"/>
    <anim name="singLEFT" anim="dad sing note right" fps="24" loop="false" x="-10" y="10"/>
    <anim name="singDOWN" anim="Dad Sing Note DOWN" fps="24" loop="false" x="0" y="-30"/>
    <anim name="singUP" anim="Dad Sing note UP" fps="24" loop="false" x="-6" y="50"/>
    <anim name="singRIGHT" anim="Dad Sing Note LEFT" fps="24" loop="false" x="0" y="27"/>
</character>
```

### Character Field Mapping

| Concept | Official Funkin | Psych Engine | Codename Engine |
|---------|----------------|--------------|-----------------|
| **Format** | JSON | JSON | XML |
| **Anim internal name** | `animations[].name` | `animations[].anim` | `<anim name="">` |
| **Anim spritesheet prefix** | `animations[].prefix` | `animations[].name` | `<anim anim="">` |
| **Frame rate** | `animations[].frameRate` | `animations[].fps` | `<anim fps="">` |
| **Loop** | `animations[].looped` | `animations[].loop` | `<anim loop="">` |
| **Frame indices** | `animations[].frameIndices` | `animations[].indices` | `<anim indices="">` |
| **Anim offsets** | `animations[].offsets` [x, y] | `animations[].offsets` [x, y] | `<anim x="" y="">` |
| **Spritesheet path** | `assetPath` | `image` | `sprite` attribute |
| **Render type** | `renderType` (sparrow/packer/animateatlas/multisparrow) | Implicit (sparrow default) | Implicit (sparrow default) |
| **Character scale** | `scale` | `scale` | `scale` attribute |
| **Sing hold time** | `singTime` (in steps) | `sing_duration` | `holdTime` |
| **Health icon** | `healthIcon` object `{id, scale, flipX, isPixel, offsets}` | `healthicon` (string) | `icon` attribute (string) |
| **Global position offsets** | `offsets` [x, y] | `position` [x, y] | `x`, `y` attributes |
| **Camera offsets** | `cameraOffsets` [x, y] | `camera_position` [x, y] | `camx`, `camy` attributes |
| **Flip X** | `flipX` | `flip_x` | `flipX` attribute |
| **Pixel/No antialiasing** | `isPixel` | `no_antialiasing` | `antialiasing` (inverted) |
| **Starting animation** | `startingAnimation` | First in list / "idle" | First in list / "idle" |
| **Health bar color** | Not in character data | `healthbar_colors` [r, g, b] | `color` attribute (hex) |
| **Is player** | Determined by stage/chart role | Determined by chart role | `isPlayer` attribute |
| **Game over character** | `death` object | Not in character data | `gameOverChar` attribute |
| **Dance frequency** | `danceEvery` (beats) | Implicit | Implicit |

---

## 7. Stage Data Format

### Official Funkin — JSON (`data/stages/<name>.json`)

```json
{
  "version": "1.0.1",
  "name": "Main Stage",
  "cameraZoom": 1.1,
  "props": [
    {
      "zIndex": 10,
      "position": [-600, -200],
      "scale": [1, 1],
      "name": "stageBack",
      "assetPath": "stages/mainStage/stageback",
      "scroll": [0.9, 0.9],
      "alpha": 1.0,
      "isPixel": false,
      "animType": "sparrow",
      "animations": [],
      "startingAnimation": "",
      "danceEvery": 0
    }
  ],
  "characters": {
    "bf": { "zIndex": 300, "position": [989.5, 885], "cameraOffsets": [-100, -100] },
    "dad": { "zIndex": 200, "position": [335, 885], "cameraOffsets": [150, -100] },
    "gf": { "zIndex": 100, "position": [751.5, 787], "cameraOffsets": [0, 0] }
  }
}
```

### Psych Engine — JSON (`stages/<name>.json`) + Lua

```json
{
  "directory": "",
  "defaultZoom": 0.9,
  "boyfriend": [770, 100],
  "girlfriend": [400, 130],
  "opponent": [100, 100],
  "hide_girlfriend": false,
  "camera_boyfriend": [0, 0],
  "camera_opponent": [0, 0],
  "camera_girlfriend": [0, 0],
  "camera_speed": 1
}
```

> **Important:** Psych Engine stage JSON only defines character positions and camera settings. All visual props (sprites, backgrounds, foregrounds) are defined in a **Lua script** with the same name (`stages/<name>.lua`).

### Codename Engine — XML (`data/stages/<name>.xml`)

```xml
<stage zoom="0.9" name="stage" folder="stages/default/"
       startCamPosX="1000" startCamPosY="600">
    <sprite name="bg" x="-600" y="-200" sprite="stageback" scroll="0.9"/>
    <sprite name="stageFront" x="-600" y="600" sprite="stagefront" scroll="0.9"/>
    <girlfriend/>
    <dad/>
    <boyfriend/>
    <sprite name="stageCurtains" x="-500" y="-300" sprite="stagecurtains" scroll="1.3"/>
</stage>
```

### Stage Field Mapping

| Concept | Official Funkin | Psych Engine | Codename Engine |
|---------|----------------|--------------|-----------------|
| **Format** | JSON | JSON + Lua scripts | XML (+ HScript extensions) |
| **Camera zoom** | `cameraZoom` | `defaultZoom` | `zoom` attribute |
| **Props/Sprites** | `props[]` array in JSON | Lua script (`makeLuaSprite`, etc.) | `<sprite>` XML nodes |
| **Prop z-ordering** | `zIndex` numeric value | Lua add order (`addLuaSprite(tag, front)`) | XML node order (top = back) |
| **Prop scroll factor** | `scroll` [x, y] | Lua `setScrollFactor(tag, x, y)` | `scroll`/`scrollx`/`scrolly` attrs |
| **Prop animations** | `animations[]` in prop | Lua `makeAnimatedLuaSprite` | `<anim>` child nodes of `<sprite>` |
| **Prop dance/beat** | `danceEvery` | Lua scripted | `beatInterval`, `type="beat"` |
| **BF position** | `characters.bf.position` | `boyfriend` [x, y] | `<boyfriend x="" y=""/>` |
| **Dad position** | `characters.dad.position` | `opponent` [x, y] | `<dad x="" y=""/>` |
| **GF position** | `characters.gf.position` | `girlfriend` [x, y] | `<girlfriend x="" y=""/>` |
| **BF camera offset** | `characters.bf.cameraOffsets` | `camera_boyfriend` [x, y] | `<boyfriend camxoffset="" camyoffset=""/>` |
| **Dad camera offset** | `characters.dad.cameraOffsets` | `camera_opponent` [x, y] | `<dad camxoffset="" camyoffset=""/>` |
| **Hide GF** | Omit gf / empty gf char | `hide_girlfriend` bool | Omit `<girlfriend/>` node |
| **Solid/colored box** | Color hex in `assetPath` | Lua `makeGraphic` | `<solid>` / `<box>` node |
| **Stage folder** | Images rel. to `images/` | `directory` field | `folder` attribute |
| **Start camera pos** | Not explicit | Not explicit | `startCamPosX`, `startCamPosY` |
| **Character z-index** | `characters.<char>.zIndex` | Lua add order | XML node order |
| **Ratings position** | Not configurable | Not configurable | `<ratings x="" y=""/>` node |

---

## 8. Week / Level Data Format

### Official Funkin — JSON (`data/levels/<name>.json`)

```json
{
  "version": "1.0.0",
  "name": "DADDY DEAREST",
  "titleAsset": "storymenu/titles/week1",
  "background": "#F9CF51",
  "songs": ["bopeebo", "fresh", "dad-battle"],
  "visible": true,
  "props": [
    {
      "assetPath": "storymenu/props/dad",
      "scale": 1.0,
      "offsets": [100, 60],
      "animations": [
        { "name": "idle", "prefix": "idle0", "frameRate": 24 },
        { "name": "confirm", "prefix": "confirm0", "frameRate": 24 }
      ]
    }
  ]
}
```

### Psych Engine — JSON (`weeks/<name>.json`)

```json
{
  "songs": [
    ["Bopeebo", "dad", [146, 113, 253]],
    ["Fresh", "dad", [146, 113, 253]],
    ["Dad Battle", "dad", [146, 113, 253]]
  ],
  "weekCharacters": ["", "bf", "gf"],
  "weekBackground": "stage",
  "weekBefore": "tutorial",
  "storyName": "DADDY DEAREST",
  "weekName": "Week 1",
  "startUnlocked": true,
  "hiddenUntilUnlocked": false,
  "hideStoryMode": false,
  "hideFreeplay": false,
  "difficulties": ""
}
```

### Codename Engine — XML (`data/weeks/weeks/<name>.xml`)

```xml
<week name="DADDY DEAREST" chars="dad,bf,gf" sprite="week1">
    <song>Bopeebo</song>
    <song>Fresh</song>
    <song>Dad Battle</song>
    <difficulty name="Easy"/>
    <difficulty name="Normal"/>
    <difficulty name="Hard"/>
</week>
```

### Week/Level Field Mapping

| Concept | Official Funkin | Psych Engine | Codename Engine |
|---------|----------------|--------------|-----------------|
| **Format** | JSON | JSON | XML |
| **Display name** | `name` | `storyName` | `name` attribute |
| **Song list** | `songs[]` (string IDs) | `songs[]` (arrays: [name, icon, color]) | `<song>` child nodes |
| **Menu characters** | `props[]` with animation data | `weekCharacters` [3 strings] | `chars` attribute (comma-separated) |
| **Background** | `background` (color hex or image path) | `weekBackground` (string) | Via `sprite` attribute |
| **Title image** | `titleAsset` (image path) | Auto from week filename | `sprite` attribute |
| **Visibility** | `visible` bool | `hideStoryMode` / `hideFreeplay` | Present = visible |
| **Unlock order** | Implicit by level order | `weekBefore`, `startUnlocked`, `hiddenUntilUnlocked` | Implicit (via `weeks.txt` ordering) |
| **Difficulties** | Listed in song metadata `playData.difficulties` | `difficulties` string (comma-separated or empty for default) | `<difficulty>` child nodes |
| **Week ordering** | Order of JSON files discovered | `weekBefore` chaining | `weeks.txt` file |
| **Per-song icon/color** | Not in level data | Per-song in `songs` array `[name, icon, [r,g,b]]` | Not in week data |

---

## 9. Audio File Conventions

| Aspect | Official Funkin | Psych Engine | Codename Engine |
|--------|----------------|--------------|-----------------|
| **Instrumental** | `songs/<id>/Inst.ogg` | `songs/<Song>/Inst.ogg` | `songs/<song>/song/Inst.ogg` |
| **Vocals** | Split per-character: `Voices-bf.ogg`, `Voices-pico.ogg` | Single `Voices.ogg` (or optionally split: `Voices-Player.ogg`, `Voices-Opponent.ogg`) | Single `Voices.ogg` (or split: `Voices-bf.ogg`, `Voices-dad.ogg`) |
| **Per-difficulty audio** | Separate variations system | Separate song folders per difficulty | Same folder, suffix: `Inst-erect.ogg`, `Voices-erect.ogg` |
| **Format** | OGG Vorbis | OGG Vorbis | OGG Vorbis |
| **Song variations** | Full variation system (`erect`, `pico`, etc.) with separate metadata | Not natively supported | Difficulty-suffixed audio files |

---

## 10. Scripting System

### Official Funkin — HScript Modules (.hxs)

- Based on Haxe syntax via Polymod's scripting integration
- Scripts placed in `scripts/` or registered via modules
- Direct access to game classes (e.g., `PlayState.instance`)
- Strong HaxeFlixel integration
- Optional typing

### Psych Engine — Lua (.lua) + HScript Iris (.hx)

Psych Engine offers **two scripting languages** that can be used independently or together:

#### Lua (Primary — `.lua`)
- Custom API of 212+ wrapper functions across 22 categories
- String-tag-based sprite/object management
- Reflection-based property access (`getProperty`, `setProperty`)
- Function return values control execution flow (`Function_Stop`, `Function_Continue`)
- **Higher callback priority** — Lua scripts execute before HScript scripts
- 6 script types: Stage, Note Type, Event, Song, Character, Global

#### HScript Iris (Secondary — `.hx`)
- Uses `hscript-iris` v1.1.3 library (by crowplexus) wrapping the Haxe interpreter
- **Direct Haxe object access** — no string tags or wrapper functions needed
- `game` variable points to `FlxG.state` (PlayState); all PlayState fields accessible directly
- Pre-set classes: `FlxG`, `FlxSprite`, `FlxTween`, `FlxEase`, `FlxMath`, `FlxTimer`, `FlxCamera`, `FlxText`, `PlayState`, `Paths`, `Conductor`, `Character`, `Note`, `Alphabet`, `FlxRuntimeShader`, etc.
- `import` statements and `addHaxeLibrary()` to access additional classes at runtime
- Callbacks receive **full typed objects** (e.g., `goodNoteHit(note:Note)`) instead of decomposed primitives
- **Lower callback priority** — executes after all Lua scripts
- **Cannot define custom classes** (unlike Codename Engine)
- Same 6 script types as Lua, placed in the same directories
- Loading Screen scripts (`LoadingScreen.hx`) are **HScript-exclusive** (Lua too slow to init)
- Full bidirectional interop with Lua via `runHaxeCode`, `runHaxeFunction`, `createGlobalCallback`

### Codename Engine — HScript Improved (.hx)

- Custom fork of HScript with improvements
- Haxe-like syntax, closest to source coding without source access
- Event-based callback system with cancellable events
- Direct object access (no string tags or reflection wrappers)
- Supports custom classes, enums, static extensions, property fields
- Script types: Gameplay, Character, Stage, Event/NoteType, Global, State/Substate, Transition, Dialogue, Custom

### Scripting Philosophy Comparison

| Aspect | Official Funkin | Psych Engine (Lua) | Psych Engine (HScript Iris) | Codename Engine |
|--------|----------------|--------------------|-----------------------------|-----------------|
| **Language** | HScript (.hxs) | Lua (.lua) | HScript Iris (.hx) | HScript Improved (.hx) |
| **Library** | Polymod HScript sandbox | LuaJIT | `hscript-iris` v1.1.3 | Custom `hscript-improved` fork |
| **Typing** | Optional Haxe types | Dynamic (Lua) | Optional Haxe types | Optional Haxe types |
| **Object access** | Direct field access | String-tag reflection API | Direct field access via `game.*` | Direct field access (injected) |
| **Sprite creation** | `new FlxSprite(x,y).loadGraphic(...)` | `makeLuaSprite(tag, image, x, y)` | `new FlxSprite(x,y).loadGraphic(...)` | `new FlxSprite(x,y).loadGraphic(...)` |
| **Property get/set** | `obj.property = value` | `getProperty("prop")` / `setProperty("prop", val)` | `game.property = value` | `obj.property = value` |
| **Callback args** | Full objects | Decomposed primitives | **Full typed objects** (e.g., `note:Note`) | Event objects |
| **Callback priority** | N/A | Higher (executes first) | Lower (executes after Lua) | N/A (only system) |
| **Event cancellation** | Return values / custom | `Function_Stop`, `Function_StopLua`, etc. | `Function_Stop`, `Function_StopHScript`, etc. | `event.cancel()` on event objects |
| **Class definitions** | Extends base classes | Not available | **Not available** | Full custom class support |
| **Enums** | Not available | Not available | Not available | Supported |
| **Abstract types** | Supported | N/A | **Need wrappers** (`CustomFlxColor`) | Supported |
| **Import system** | `import` via Polymod | N/A | `import` + `addHaxeLibrary()` | Native `import` |
| **Interop** | N/A | Can embed HScript via `runHaxeCode` | Can create Lua-callable functions | N/A |
| **IDE support** | Limited | VS Code extension (unofficial) | Follows Haxe conventions | Follows Haxe conventions |

---

## 11. Script Callbacks

### Lifecycle Callbacks

| Event | Official Funkin | Psych Engine (Lua) | Psych Engine (HScript Iris) | Codename Engine |
|-------|-----------------|--------------------|-----------------------------| ------------------|
| **Creation** | `onCreate()` | `onCreate()` | `onCreate()` | `preCreate()`, `create()`, `postCreate()` |
| **Post-creation** | `onCreatePost()` | `onCreatePost()` | `onCreatePost()` | `postCreate()` |
| **Update** | `onUpdate(elapsed)` | `onUpdate(elapsed)` | `onUpdate(elapsed:Float)` | `preUpdate(elapsed)`, `update(elapsed)`, `postUpdate(elapsed)` |
| **Post-update** | `onUpdatePost(elapsed)` | `onUpdatePost(elapsed)` | `onUpdatePost(elapsed:Float)` | `postUpdate(elapsed)` |
| **Destroy** | `onDestroy()` | `onDestroy()` | `onDestroy()` | `destroy()` |

### Song/Beat Callbacks

| Event | Official Funkin | Psych Engine (Lua) | Psych Engine (HScript Iris) | Codename Engine |
|-------|-----------------|--------------------|-----------------------------| ------------------|
| **Beat hit** | `onBeatHit(curBeat)` | `onBeatHit()` (curBeat via variable) | `onBeatHit()` (curBeat via variable) | `beatHit(curBeat)` |
| **Step hit** | `onStepHit(curStep)` | `onStepHit()` (curStep via variable) | `onStepHit()` (curStep via variable) | `stepHit(curStep)` |
| **Section hit** | N/A | `onSectionHit()` | `onSectionHit()` | N/A |
| **Measure hit** | N/A | N/A | N/A | `measureHit(curMeasure)` |
| **Song start** | `onSongStart()` | `onSongStart()` | `onSongStart()` | `onSongStart()`, `onStartSong()` |
| **Song end** | `onEndSong()` | `onEndSong()` | `onEndSong()` | `onSongEnd()` |
| **Countdown start** | `onCountdownStarted()` | `onCountdownStarted()` | `onCountdownStarted()` | `onStartCountdown(event)` |
| **Countdown tick** | N/A | `onCountdownTick(counter)` | `onCountdownTick(tick:Countdown, counter:Int)` | N/A |

### Gameplay Callbacks

| Event | Official Funkin | Psych Engine (Lua) | Psych Engine (HScript Iris) | Codename Engine |
|-------|-----------------|--------------------|-----------------------------| ------------------|
| **Player note hit (pre)** | N/A | N/A | `goodNoteHitPre(note:Note)` | N/A |
| **Player note hit** | `goodNoteHit(note)` | `goodNoteHit(id, dir, type, isSustain)` | `goodNoteHit(note:Note)` | `onPlayerHit(event)` |
| **Note miss** | `noteMiss(note)` | `noteMiss(id, dir, type, isSustain)` | `noteMiss(note:Note)` | `onPlayerMiss(event)` |
| **Ghost miss** | N/A | `noteMissPress(direction)` | `noteMissPress(direction:Int)` | N/A |
| **Opponent note hit (pre)** | N/A | N/A | `opponentNoteHitPre(note:Note)` | N/A |
| **Opponent note hit** | `opponentNoteHit(note)` | `opponentNoteHit(id, dir, type, isSustain)` | `opponentNoteHit(note:Note)` | `onDadHit(event)` |
| **Any note hit** | N/A | N/A | N/A | `onNoteHit(event)` |
| **Note spawn** | N/A | `onSpawnNote(id, data, type, isSustain)` | `onSpawnNote(note:Note)` | N/A |
| **Camera move** | N/A | `onMoveCamera(focus)` | `onMoveCamera(focus:String)` | `onCameraMove(event)` |
| **Game over** | N/A | `onGameOver()` | `onGameOver()` | `onGameOver(event)`, `onPostGameOver(event)` |
| **Pause** | N/A | `onPause()` | `onPause()` | `onGamePause(event)` |
| **Event triggered** | N/A | `onEvent(name, v1, v2)` | `onEvent(name, v1, v2, strumTime)` | `onEvent(event)` |

> **Key difference:** Psych Lua callbacks receive **decomposed primitive values** (id, direction, type as separate arguments), while Psych HScript Iris receives **the actual Haxe object** (e.g., the full `Note` instance with all properties accessible).

### Input Callbacks

| Event | Official Funkin | Psych Engine (Lua) | Psych Engine (HScript Iris) | Codename Engine |
|-------|-----------------|--------------------|-----------------------------| ------------------|
| **Key press (pre)** | N/A | N/A | `onKeyPressPre(key:Int)` | N/A |
| **Key press** | N/A | `onKeyPress(key)` | `onKeyPress(key:Int)` | N/A |
| **Key release (pre)** | N/A | N/A | `onKeyReleasePre(key:Int)` | N/A |
| **Key release** | N/A | `onKeyRelease(key)` | `onKeyRelease(key:Int)` | N/A |
| **Ghost tap** | N/A | `onGhostTap(key)` | `onGhostTap(key:Int)` | N/A |
| **Input update** | N/A | N/A | N/A | `onInputUpdate(event)` |

### Score/Rating Callbacks

| Event | Official Funkin | Psych Engine (Lua) | Psych Engine (HScript Iris) | Codename Engine |
|-------|-----------------|--------------------|-----------------------------| ------------------|
| **Pre-update score** | N/A | N/A | `preUpdateScore(miss:Bool)` | N/A |
| **Update score** | N/A | `onUpdateScore(miss)` | `onUpdateScore(miss:Bool)` | N/A |
| **Recalculate rating** | N/A | `onRecalculateRating()` | `onRecalculateRating()` | `onRatingUpdate(event)` |

---

## 12. Common Scripting Patterns

### Creating a Sprite

**Official Funkin (HScript):**
```haxescript
var spr = new FlxSprite(100, 200).loadGraphic(Paths.image("mySprite"));
PlayState.instance.add(spr);
```

**Psych Engine (Lua):**
```lua
makeLuaSprite('mySprite', 'mySprite', 100, 200)
addLuaSprite('mySprite', true)
```

**Psych Engine (HScript Iris):**
```haxe
var spr = new FlxSprite(100, 200).loadGraphic(Paths.image("mySprite"));
game.add(spr);
```

**Codename Engine (HScript):**
```haxescript
var spr = new FlxSprite(100, 200).loadGraphic(Paths.image("mySprite"));
add(spr);
```

### Tweening

**Official Funkin (HScript):**
```haxescript
FlxTween.tween(spr, {x: 500, alpha: 0}, 1.0, {ease: FlxEase.quadOut});
```

**Psych Engine (Lua):**
```lua
doTweenX('tweenTag', 'mySprite', 500, 1, 'quadOut')
doTweenAlpha('alphaTag', 'mySprite', 0, 1, 'quadOut')
```

**Psych Engine (HScript Iris):**
```haxe
FlxTween.tween(spr, {x: 500, alpha: 0}, 1.0, {ease: FlxEase.quadOut});
```

**Codename Engine (HScript):**
```haxe
FlxTween.tween(spr, {x: 500, alpha: 0}, 1.0, {ease: FlxEase.quadOut});
```

### Accessing Characters

**Official Funkin (HScript):**
```haxescript
var bf = PlayState.instance.boyfriend;
var dad = PlayState.instance.dad;
```

**Psych Engine (Lua):**
```lua
-- Via string references
local bfName = boyfriendName
local dadName = dadName
-- Character functions
characterDance('bf')
setCharacterX('bf', 500)
```

**Psych Engine (HScript Iris):**
```haxe
// Direct object access via game (= PlayState)
var bf = game.boyfriend;
var dad = game.dad;
bf.x = 500;
```

**Codename Engine (HScript):**
```haxescript
// Direct object access
trace(boyfriend);
trace(dad);
trace(gf);
// Or via strumlines
trace(strumLines.members[0].characters[0]); // Opponent
trace(strumLines.members[1].characters[0]); // Player
```

### Playing Character Animations

**Official Funkin (HScript):**
```haxescript
PlayState.instance.boyfriend.playAnimation("singLEFT", true);
```

**Psych Engine (Lua):**
```lua
playAnim('boyfriend', 'singLEFT', true)
```

**Psych Engine (HScript Iris):**
```haxe
game.boyfriend.playAnim("singLEFT", true);
```

**Codename Engine (HScript):**
```haxe
boyfriend.playAnim("singLEFT", true);
```

### Getting/Setting Properties

**Official Funkin (HScript):**
```haxescript
var health = PlayState.instance.health;
PlayState.instance.health = 1.5;
```

**Psych Engine (Lua):**
```lua
local health = getProperty('health')
setProperty('health', 1.5)
```

**Psych Engine (HScript Iris):**
```haxe
var health = game.health; // game = FlxG.state (PlayState)
game.health = 1.5;
```

**Codename Engine (HScript):**
```haxe
var health = health; // Direct access in gameplay scripts
health = 1.5;
```

---

## 13. Psych Engine: Lua ↔ HScript Interop

Psych Engine is unique in offering **bidirectional communication** between its two scripting systems. This is not applicable to Official Funkin or Codename Engine (which each have only one scripting language).

### From Lua → HScript

```lua
-- Run inline HScript code from within a Lua script
-- (Creates a per-Lua HScript interpreter if one doesn't exist)
runHaxeCode([[
    game.boyfriend.color = 0xFFFF0000;

    function myCustomFunction(value) {
        game.boyfriend.x = value;
    }
]])

-- Call a function defined in a previous runHaxeCode block
runHaxeFunction('myCustomFunction', {500})

-- Import additional classes into the Lua's embedded HScript interpreter
addHaxeLibrary('FlxMath', 'flixel.math')

-- Add/remove standalone .hx script files at runtime
addHScript('scripts/myScript.hx')
removeHScript('scripts/myScript.hx')

-- Set a variable on all HScript instances only
setOnHScript('myVar', 42)

-- Call a function on all HScript instances only
callOnHScript('myCallback', {arg1, arg2})
```

### From HScript → Lua

```haxe
// Create a function callable from ALL Lua scripts
createGlobalCallback('myGlobalFunc', function(arg1:Dynamic) {
    return arg1 * 2;
});

// Create a callback on a specific Lua script (when embedded via runHaxeCode)
createCallback('myFunc', function() {
    trace('called from Lua!');
}, parentLua);

// Access the parent Lua script instance (only available when embedded via runHaxeCode)
parentLua; // reference to the FunkinLua instance
```

### Shared Variable System

Both Lua and HScript share a variable pool via `MusicBeatState.getVariables()`:

```lua
-- Lua: set a shared variable
setVar('sharedData', 42)
```

```haxe
// HScript: read the same variable
var data = getVar('sharedData'); // returns 42
setVar('fromHScript', 'hello'); // Lua can read this with getVar
```

### Cross-Script Function Calls

```lua
-- From Lua: call a function on ALL scripts (Lua + HScript)
callOnScripts('customFunc', {1, 2, 3})

-- From Lua: call on HScripts only
callOnHScript('hscriptOnly', {arg1})
```

### Flow Control Constants (Shared)

Both systems use the same constants to control callback propagation:

| Constant | Effect |
|----------|--------|
| `Function_Continue` | Normal execution, continue to next script |
| `Function_Stop` | Cancel the operation (e.g., prevent countdown, pause, game over) |
| `Function_StopLua` | Stop propagation to remaining Lua scripts only |
| `Function_StopHScript` | Stop propagation to remaining HScript scripts only |
| `Function_StopAll` | Stop propagation to both Lua and HScript scripts |

### Pre-Set Classes in HScript Iris

The following classes are available in HScript Iris scripts without needing `import` or `addHaxeLibrary`:

| Category | Classes |
|----------|---------|
| **Core Haxe** | `Type`, `File`, `FileSystem`, `StringTools` |
| **Flixel** | `FlxG`, `FlxSprite`, `FlxCamera`, `FlxText`, `FlxMath`, `FlxTimer`, `FlxTween`, `FlxEase` |
| **Flixel (via wrapper)** | `FlxColor` → `CustomFlxColor` (abstracts don't work in HScript) |
| **Psych Engine** | `PlayState`, `Paths`, `Conductor`, `ClientPrefs`, `Character`, `Note`, `Alphabet`, `CustomSubstate`, `PsychCamera` |
| **Shaders** | `FlxRuntimeShader`, `ErrorHandledRuntimeShader`, `ShaderFilter` |
| **Animation** | `FlxAnimate` (if available) |
| **Enums** | `Countdown` (from `BaseStage`) |
| **Convenience vars** | `game` (= `FlxG.state`), `controls` (= `Controls.instance`), `this` (= HScript instance) |

### HScript Iris Limitations vs Codename/Funkin HScript

| Limitation | Detail |
|-----------|--------|
| **No class definitions** | Cannot write `class MyClass { }` — only functions and variables |
| **No enum definitions** | Cannot define enums, only use pre-registered ones |
| **Abstract types need wrappers** | `FlxColor` exposed as `CustomFlxColor` with color constants as `Int` |
| **Lower callback priority** | Always executes after all Lua scripts |
| **Lua-only callbacks excluded** | `onTweenCompleted`, `onTimerCompleted`, `onSoundFinished` dispatch via `callOnLuas` and are never received by HScript |
| **Variable shadowing** | Local variables shadow `parentInstance` (PlayState) fields — naming a local `health` hides `PlayState.health` |
| **No hot reload** | Scripts cannot be reloaded without restarting the song |
| **No debug console/REPL** | All code must be in files or embedded via `runHaxeCode` |

---

## 14. Events System

### Built-in Events

| Event Purpose | Official Funkin | Psych Engine | Codename Engine |
|---------------|----------------|--------------|-----------------|
| **Camera focus** | `FocusCamera` | Auto via `mustHitSection` | `Camera Movement` event |
| **Camera zoom** | `ZoomCamera` | `Add Camera Zoom` | `Add Camera Zoom` |
| **Camera flash** | N/A (scripted) | N/A (scripted) | `Camera Flash` |
| **Camera bump rate** | `SetCameraBop` | N/A | `Camera Modulo Change` |
| **BPM change** | `timeChanges` in metadata | `changeBPM` per section | `BPM Change` event |
| **Scroll speed change** | N/A (scripted) | `Change Scroll Speed` | `Scroll Speed Change` |
| **Play animation** | `Play Animation` | `Play Animation` | `Play Animation` |
| **Alt animation toggle** | N/A (note type) | `Alt Idle Animation` | `Alt Animation Toggle` |
| **Hey! animation** | N/A (note type/script) | `Hey!` | Script / `Play Animation` |
| **Character change** | N/A | `Change Character` | N/A (scripted) |
| **Screen shake** | N/A (scripted) | `Screen Shake` | N/A (scripted) |
| **Set GF speed** | N/A | `Set GF Speed` | N/A (scripted) |
| **HScript call** | N/A | N/A | `HScript Call` (call named function) |

### Custom Events

| Aspect | Official Funkin | Psych Engine | Codename Engine |
|--------|----------------|--------------|-----------------|
| **Definition** | In chart JSON | Lua script in `custom_events/` | JSON (params) + HScript (handler) in `data/events/` |
| **Parameters** | JSON value object in event `v` field | Two string values (`value1`, `value2`) | Typed params: Bool, Int, Float, String, StrumLine, ColorWheel, DropDown |
| **Event handler** | Module script / chart event handler | `onEvent(name, v1, v2)` callback | `onEvent(event)` callback with `event.event.name` + `event.event.params[]` |
| **Icon** | N/A | N/A | Optional `.png` in `images/editor/charter/event-icons/` |
| **Packaging** | Part of chart | Standalone Lua file | `.pack` file (JSON + HScript combined) |

---

## 15. Note Types

| Aspect | Official Funkin | Psych Engine | Codename Engine |
|--------|----------------|--------------|-----------------|
| **Definition** | `k` (kind) field in note data | 4th element in note array | `noteType` field on note objects |
| **Custom note scripts** | Module scripts | Lua in `custom_notetypes/` | HScript in `data/notes/` |
| **Custom note sprites** | Via script | Via script | Auto-replace from `images/game/notes/<type>` |
| **Built-in types** | Standard | Alt Animation, Hey, Hurt Notes, GF Sing, No Animation | Standard |
| **Handler callback** | Script module handlers | `goodNoteHit`/`opponentNoteHit` + check type | `onPlayerHit(event)` + check `event.noteType` |

---

## 16. Health Icons

| Aspect | Official Funkin | Psych Engine | Codename Engine |
|--------|----------------|--------------|-----------------|
| **Image location** | `images/icons/` | `images/icons/` | `images/icons/` |
| **Image format** | Spritesheet (150px per frame) | 2-3 frames (300x150 or 450x150) | N frames (150 * N width) |
| **States** | neutral, losing, winning | neutral, losing (2 frames), optional winning (3rd frame) | Unlimited states (neutral, losing, winning, and custom) |
| **Configuration** | `healthIcon` object in character JSON | `healthicon` string in character JSON | `icon` attribute in character XML |
| **Icon scale/offset** | `healthIcon.scale`, `healthIcon.offsets` | Not configurable | Not configurable |
| **State change script** | N/A | N/A | `onHealthIconAnimChange` callback |

---

## 17. Additional Features

| Feature | Official Funkin | Psych Engine | Codename Engine |
|---------|----------------|--------------|-----------------|
| **Dialogue system** | Built-in (JSON-based) | Built-in (JSON, `startDialogue`) | Built-in (XML-based, scripted characters/boxes) |
| **Video cutscenes** | Supported | Supported (hxvlc, `startVideo`) | Supported (hxvlc) |
| **Shader support** | Runtime shaders | Runtime shaders | Scriptable shaders via HScript |
| **Custom options** | Not natively | Not natively | XML `options.xml` + script |
| **Custom controls** | Not natively | Not natively | Scripted |
| **Credits menu** | `credits.json` | Built-in credits system | `credits.xml` with GitHub integration |
| **Achievements** | Not currently | 16 example achievements | Not built-in |
| **Mod loading menu** | Planned | Built-in | Built-in |
| **Discord RPC** | Built-in | Built-in | `discord.json` config |
| **Variations/Remixes** | Full variation system (erect, pico, etc.) | Not natively | Difficulty-suffixed audio |
| **3D rendering** | Not supported | Not supported | HScript-based 3D rendering |
| **NDLL scripting** | Not supported | Not supported | Native library scripting |
| **Custom state override** | Not supported | Limited | Full state/substate scripts |
| **Addon/always-on mods** | Not supported | `runsGlobally` in pack.json | `./addons/` folder |
| **Stage extensions** | Not supported | Not supported | `<use-extension>` XML node |
| **Transition customization** | Not supported | Limited | Full transition scripting |

---

## 18. Cross-Engine Conversion Summary

### Psych Engine → Official Funkin

| Component | Difficulty | Notes |
|-----------|-----------|-------|
| **Charts** | Medium | Remap note directions (mustHitSection logic), split into metadata + chart, convert BPM sections to timeChanges |
| **Characters** | Easy | Field rename (anim→name, name→prefix, fps→frameRate, etc.), healthbar_colors has no equivalent |
| **Stages** | Hard | JSON positions map directly, but Lua visual props must be manually converted to JSON `props[]` |
| **Weeks** | Easy | Structural remap, songs array format change, visibility logic inversion |
| **Scripts (Lua)** | Hard | Lua → HScript rewrite, tag-based system → direct object references, 212 Lua functions need mapping |
| **Scripts (HScript Iris)** | Medium | Already Haxe-like syntax; remove `game.` prefix, adjust imports, adapt callback signatures (Psych passes full objects, Funkin passes full objects too but different class hierarchy) |
| **Events** | Medium | Some name mappings exist, Psych 2-value events → Funkin structured event values |
| **Audio** | Easy | Rename/restructure, may need to split combined Voices.ogg |

### Psych Engine → Codename Engine

| Component | Difficulty | Notes |
|-----------|-----------|-------|
| **Charts** | Medium | Section-based → strumline-based, Codename can import legacy FNF charts |
| **Characters** | Medium | JSON → XML conversion, field mapping (anim→name attr, name→anim attr) |
| **Stages** | Hard | Lua visual code → XML nodes, but both support similar sprite properties |
| **Weeks** | Easy | JSON → XML conversion, structural remap |
| **Scripts (Lua)** | Medium | Lua → HScript, Codename HScript is closer to source, event-object based callbacks |
| **Scripts (HScript Iris)** | Easy-Medium | Both use HScript with direct object access; main changes: `game.` → direct access, `Function_Stop` → `event.cancel()`, no `parentLua`/interop APIs, Codename supports class definitions |
| **Events** | Medium | Need JSON param definition + HScript handler per custom event |
| **Audio** | Easy | Move to `songs/<name>/song/` subfolder |

### Official Funkin → Codename Engine

| Component | Difficulty | Notes |
|-----------|-----------|-------|
| **Charts** | Medium | JSON note format → Codename chart format, metadata split differently |
| **Characters** | Medium | JSON → XML, mostly field renaming |
| **Stages** | Medium | JSON props → XML sprite nodes, similar concepts different syntax |
| **Weeks** | Easy | JSON → XML |
| **Scripts** | Easy | Both use HScript with direct object access, minor API differences |
| **Events** | Medium | Chart-embedded → separate JSON+HScript event files |
| **Audio** | Easy | Different subfolder structure |

---

## References

- **Official Funkin Modding Docs:** https://funkincrew.github.io/funkin-modding-docs/
- **Official Funkin Source:** https://github.com/FunkinCrew/Funkin
- **Psych Engine Source:** https://github.com/ShadowMario/FNF-PsychEngine
- **Psych Engine Lua API:** https://shadowmario.github.io/psychengine.lua/
- **Codename Engine Source:** https://github.com/CodenameCrew/CodenameEngine
- **Codename Engine Wiki:** https://codename-engine.com/wiki/
- **Codename Engine API Docs:** https://codename-engine.com/api-docs/
