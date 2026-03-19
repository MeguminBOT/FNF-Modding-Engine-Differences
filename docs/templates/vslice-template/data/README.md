# data/

Game data definitions in JSON format. Each subfolder corresponds to a specific game system.

---

## characters/

Character JSON files define a character's spritesheet, animations, and behavior.

**Filename matters** — the JSON filename (without extension) becomes the character's ID used in song metadata and scripts.

### Minimal character template:

```json
{
    "version": "1.0.0",
    "name": "My Character",
    "assetPath": "characters/myCharSpritesheet",
    "singTime": 8.0,
    "animations": [
        { "name": "idle", "prefix": "idle0", "offsets": [0, 0] },
        { "name": "singLEFT", "prefix": "singLEFT0", "offsets": [0, 0] },
        { "name": "singDOWN", "prefix": "singDOWN0", "offsets": [0, 0] },
        { "name": "singUP", "prefix": "singUP0", "offsets": [0, 0] },
        { "name": "singRIGHT", "prefix": "singRIGHT0", "offsets": [0, 0] }
    ]
}
```

### Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Format version (`"1.0.0"`) |
| `name` | string | Display name |
| `assetPath` | string | Path to spritesheet in `shared/images/` (no extension) |
| `renderType` | string | `"sparrow"` (default), `"multisparrow"`, `"animateatlas"`, or `"packer"` |
| `flipX` | bool | Mirror the sprite horizontally (default: `false`) |
| `singTime` | float | How long sing poses hold (in steps, default: `8.0`) |
| `healthIcon` | string | Override health icon ID (defaults to character ID) |
| `startingAnimation` | string | Initial animation (default: `"idle"`) |
| `animations[].name` | string | Animation name (`idle`, `singLEFT`, `singDOWN`, `singUP`, `singRIGHT`, etc.) |
| `animations[].prefix` | string | Animation prefix in the spritesheet XML |
| `animations[].offsets` | [x, y] | Position offset for this animation |
| `animations[].looped` | bool | Whether the animation loops (default: `false`) |
| `animations[].frameRate` | int | Playback frame rate (default: `24`) |
| `animations[].frameIndices` | int[] | Specific frame indices to use (for sub-animations) |
| `animations[].assetPath` | string | Per-animation spritesheet override |

See `bftemple.json` for a full player character and `dadtemple.json` for an opponent with hold animations.

---

## levels/

Level (week) definitions for story mode.

**Filename = level ID** — used to reference the level internally.

### Minimal level template:

```json
{
    "version": "1.0.1",
    "name": "MY WEEK",
    "titleAsset": "storymenu/titles/myweek",
    "props": [],
    "background": "#FF0000",
    "songs": ["song1", "song2"]
}
```

### Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Format version (`"1.0.1"`) |
| `name` | string | Display name in story menu |
| `titleAsset` | string | Week title banner image path |
| `props` | array | Animated character props on the story menu (up to 3) |
| `background` | string | Hex color for the story menu background |
| `songs` | string[] | Ordered list of song IDs in this week |
| `visible` | bool | Whether the level appears in the story menu (default: `true`) |

See `week1temple.json` for a full example with animated props.

---

## notestyles/

Custom note skins (arrows, hold notes, splashes).

### Minimal note style template:

```json
{
    "version": "1.0.0",
    "name": "My Notes",
    "author": "Your Name",
    "fallback": "funkin",
    "assets": {
        "note": {
            "assetPath": "shared:myNotes",
            "scale": 1.0
        }
    }
}
```

Set `"fallback"` to `"funkin"` so any assets you don't override will use the defaults.

See `funkintemple.json` for the complete default note style with all asset definitions.

---

## dialogue/

The dialogue system has three components:

### speakers/ — Character portraits
```json
{
    "version": "1.0.0",
    "name": "My Character",
    "assetPath": "weeb/myCharPortrait",
    "scale": 5.4,
    "animations": [
        { "name": "talk", "prefix": "talk0" }
    ]
}
```

### boxes/ — Speech bubble styles
```json
{
    "version": "1.1.0",
    "name": "My Box",
    "assetPath": "my_speech_bubble",
    "isPixel": false,
    "text": {
        "offsets": [100, 200],
        "width": 900,
        "color": "#000000"
    }
}
```

### conversations/ — Dialogue scripts
```json
{
    "version": "1.0.0",
    "dialogue": [
        {
            "speaker": "my-character",
            "box": "default",
            "text": ["Line 1", "Line 2"]
        }
    ]
}
```

See the `roses.json` conversation example and included speaker/box definitions for full working examples.

---

## songs/

Each song gets its own subfolder: `data/songs/<songname>/`

### Required files:

| File | Purpose |
|------|---------|
| `<songname>-metadata.json` | Song info: BPM, artist, characters, stage, difficulties |
| `<songname>-chart.json` | Note data, events, and scroll speeds per difficulty |

### For song variations (erect remixes, etc.):

| File | Purpose |
|------|---------|
| `<songname>-metadata-<variation>.json` | Variation-specific metadata (can override BPM, difficulties) |
| `<songname>-chart-<variation>.json` | Variation-specific chart data |

### Minimal song metadata:

```json
{
    "version": "2.2.1",
    "songName": "My Song",
    "artist": "Artist Name",
    "timeFormat": "ms",
    "timeChanges": [
        { "t": 0, "bpm": 120, "n": 4, "d": 4, "bt": [4, 4, 4, 4] }
    ],
    "playData": {
        "difficulties": ["easy", "normal", "hard"],
        "characters": {
            "player": "bf",
            "girlfriend": "gf",
            "opponent": "dad"
        },
        "stage": "mainStage",
        "noteStyle": "funkin"
    }
}
```

Audio files go in `songs/<songname>/` (at the mod root, not under `data/`):
- `Inst.ogg` — Instrumental
- `Voices-bf.ogg` — Player vocals  
- `Voices-dad.ogg` — Opponent vocals

See the included `bopeebo/` folder for a complete working song with charts, metadata, and an erect variation.

---

## Text Data Files

| File | Format | Purpose |
|------|--------|---------|
| `characterList.txt` | One ID per line | Registers characters for the freeplay DJ character selector |
| `introText.txt` | `line1--line2` per line | Random text shown on the intro/title screen |
| `storychardata.txt` | `charId scaleE scaleN scaleH [offX] [offY]` | Controls story menu character prop rendering |
