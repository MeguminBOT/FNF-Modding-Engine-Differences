# Codename Engine Mod Template

A starter template for creating mods for **Friday Night Funkin': Codename Engine**.

## Quick Start

1. Copy this entire `codename-template/` folder into the engine's `mods/` directory.
2. Rename the folder to your mod's name (e.g., `mods/my-cool-mod/`).
3. Start adding your content!

> **Note:** Codename Engine uses an optional `data/config/modpack.ini` file for mod metadata (name, description, author, version, Discord settings, state redirects). If omitted, the folder name in `mods/` is used as the mod identity.

## Folder Structure

```
codename-template/
│
├── data/
│   ├── config/              # Mod configuration
│   │   └── modpack.ini      #   Mod metadata (name, author, version, etc.)
│   ├── characters/          # Character definitions (XML)
│   │   └── <name>.xml
│   ├── stages/              # Stage definitions
│   │   ├── <name>.xml       #   Stage layout (XML format)
│   │   └── <name>.hx        #   Optional stage HScript
│   ├── events/              # Custom event definitions
│   │   ├── <name>.hx        #   Event logic
│   │   └── <name>.json      #   Event parameter definitions
│   ├── notes/               # Custom note type scripts
│   │   └── <name>.hx
│   ├── scripts/             # Global scripts (all game states)
│   │   └── *.hx
│   ├── states/              # Custom game states (full menu replacements)
│   │   └── *.hx
│   └── splashes/            # Note splash definitions
│
├── songs/
│   ├── *.hx                 # Global song scripts (apply to ALL songs)
│   └── <song-name>/
│       ├── meta.json        #   Song metadata (BPM, difficulties, icon)
│       ├── charts/
│       │   ├── hard.json    #   Chart data (one file per difficulty)
│       │   ├── normal.json
│       │   └── easy.json
│       ├── scripts/         #   Per-song HScripts
│       │   └── *.hx
│       └── song/            #   Audio files
│           ├── Inst.ogg
│           └── Voices.ogg
│
├── images/                  # All image assets
│   ├── icons/               #   Health bar icons
│   ├── game/                #   Gameplay UI (notes, ratings, countdown)
│   │   ├── notes/
│   │   └── ui/
│   ├── menus/               #   Menu graphics
│   │   ├── freeplay/
│   │   └── main/
│   └── stages/              #   Stage-specific sprites
│       └── <stagename>/
│
├── shaders/                 # GLSL fragment shaders (.frag)
├── sounds/                  # Sound effects
├── music/                   # Background/menu music
├── videos/                  # Video cutscenes
└── fonts/                   # Custom fonts
```

## Key Differences from Other Engines

| Feature | Codename | Psych / V-Slice |
|---------|----------|-----------------|
| Mod metadata | `data/config/modpack.ini` (INI format, optional) | `pack.json` / `_polymod_meta.json` |
| Stage format | **XML** (`<stage>`, `<sprite>`) | JSON |
| Script language | HScript (`.hx`, function-based) | Lua + HScript |
| Chart storage | One file **per difficulty** | All difficulties in one file |
| Audio location | `songs/<name>/song/` | `songs/<name>/` |
| Character data | `data/characters/*.xml` (XML format) | Separate JSON files |
| Custom game states | `data/states/*.hx` | Not natively supported |
| Global song scripts | Root of `songs/` folder | `scripts/` folder |

## Key Files Explained

### Stage XML (`data/stages/<name>.xml`)

Stages use XML format with a `<!DOCTYPE codename-engine-stage>` declaration.

```xml
<!DOCTYPE codename-engine-stage>
<stage zoom="0.9" name="stage" folder="stages/mainStage">
    <sprite name="bg" x="-600" y="-200" sprite="stageback"
            scroll="0.9" scale="1" antialiasing="true" />

    <gf x="400" y="130" />
    <opponent x="100" y="100" />

    <sprite name="front" x="-650" y="600" sprite="stagefront"
            scroll="0.9" scale="1.1" antialiasing="true" />

    <player x="770" y="100" />
</stage>
```

Element order determines **z-order** (first = back, last = front). Character elements are placed between sprites at the desired depth.

**Character element aliases** (all are valid):
- Player: `<boyfriend>`, `<bf>`, `<player>`
- Opponent: `<dad>`, `<opponent>`
- Girlfriend: `<girlfriend>`, `<gf>`

**Sprite attributes**: `sprite` (asset name), `x`, `y`, `scroll` (both axes), `scrollx`, `scrolly`, `scale`, `scalex`, `scaley`, `antialiasing`, `alpha`, `color`, `angle`, `flipX`, `flipY`, `zoomfactor`, `skewx`, `skewy`

### Song Metadata (`songs/<name>/meta.json`)

```json
{
    "bpm": 100,
    "difficulties": ["easy", "normal", "hard"],
    "displayName": "My Song",
    "name": "my-song",
    "icon": "dad",
    "color": "#AF66CE",
    "needsVoices": true,
    "stepsPerBeat": 4,
    "beatsPerMeasure": 4
}
```

Supports `customValues` for mod-specific data:
```json
{
    "customValues": {
        "gameOverChar": "bf-dead-custom",
        "titleCard": true,
        "credits": "Song by Artist"
    }
}
```

### Chart Data (`songs/<name>/charts/<difficulty>.json`)

Each difficulty gets its own file. Charts use `strumLines` to define note lanes:

```json
{
    "chartVersion": "1.6.0",
    "codenameChart": true,
    "stage": "stage",
    "scrollSpeed": 1.0,
    "noteTypes": [],
    "events": [
        { "name": "FocusCamera", "params": [1], "time": 0 }
    ],
    "strumLines": [
        {
            "position": "dad",
            "type": 0,
            "keyCount": 4,
            "characters": ["dad"],
            "notes": [
                { "time": 1000, "id": 0, "sLen": 0, "type": 0 }
            ]
        },
        {
            "position": "boyfriend",
            "type": 1,
            "keyCount": 4,
            "characters": ["bf"],
            "notes": []
        }
    ]
}
```

| Strum line `type` | Meaning |
|---|---|
| `0` | Opponent |
| `1` | Player |
| `2` | Additional (always CPU) |

**Note fields**: `time` (ms), `id` (strum index 0–3), `sLen` (sustain length ms), `type` (int index into `noteTypes` array, `0` = default)

## Scripting

Codename uses **function-based HScript** (`.hx` files). Scripts don't define classes — they use loose callback functions that the engine calls automatically.

### Script locations

| Location | Scope |
|----------|-------|
| `data/scripts/*.hx` | Always running (global) |
| `data/stages/<name>.hx` | Paired with stage XML |
| `songs/*.hx` | All songs (global song scripts) |
| `songs/<name>/scripts/*.hx` | Specific song only |
| `data/notes/<type>.hx` | Custom note type |
| `data/states/*.hx` | Custom game states |

### Example stage script

```haxe
// data/stages/myStage.hx

function postCreate() {
    // Stage has finished loading — modify sprites, add effects
    var bg = stage.stageSprites["bg"];
    bg.alpha = 0.8;
}

function beatHit(curBeat:Int) {
    // Fires every beat — sync animations to music
    if (curBeat % 4 == 0) {
        camGame.zoom += 0.03;
    }
}
```

### Available globals in scripts

All scripts get these default variables:

| Variable | Type | Description |
|----------|------|-------------|
| `state` | FlxState | Current game state (PlayState during gameplay) |
| `FlxG` | FlxG | Flixel global (input, sound, cameras, etc.) |
| `PlayState` | Class | PlayState class reference (`PlayState.instance` for active) |
| `Paths` | Paths | Asset path utilities |
| `Conductor` | Conductor | Music timing system |
| `ModState` | Class | For switching to custom script states |

During gameplay, PlayState properties are also accessible directly:

| Variable | Type | Description |
|----------|------|-------------|
| `boyfriend` | Character | Player character |
| `dad` | Character | Opponent character |
| `gf` | Character | Girlfriend |
| `health` | Float | Current health |
| `strumLines` | FlxTypedGroup | All strum lines |
| `stage` | Stage | Current stage |
| `camGame` | FlxCamera | Gameplay camera |
| `camHUD` | FlxCamera | HUD camera |
| `SONG` | ChartData | Current chart data |

### Cross-script communication

Use `public var` to share variables between scripts:
```haxe
// In script A
public var mySharedValue = 42;

// In script B — access via importScript()
var scriptA = importScript("data/scripts/scriptA");
trace(scriptA.mySharedValue); // 42
```

## Included Examples

- **Stage**: `myStage.xml` (XML stage with background sprites and character positions) + `myStage.hx` (companion script with beat-synced camera zoom)
- **Song**: Complete `bopeebo/` folder with `meta.json`, `charts/hard.json`, and a song script example
- **Global script**: Camera movement script example in `songs/`
- **Custom state**: Example custom menu state in `data/states/`

## Further Reading

- [Mod Folder Structure](https://meguminbot.github.io/FNF-Modding-Engine-Differences/mod-folder-structure/)
- [Stage Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/stage-format/)
- [Chart Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/chart-format/)
- [Events System](https://meguminbot.github.io/FNF-Modding-Engine-Differences/events-system/)
- [Codename Events Reference](https://meguminbot.github.io/FNF-Modding-Engine-Differences/reference/codename-events/)
- [Scripting System](https://meguminbot.github.io/FNF-Modding-Engine-Differences/scripting-system/)
