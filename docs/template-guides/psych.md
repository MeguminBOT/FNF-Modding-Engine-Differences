# Psych Engine Template

A starter template for creating mods for **Friday Night Funkin': Psych Engine**.

[:material-download: Download Template](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/tree/main/docs/templates/psych-template){ .md-button }

---

## What's Included

| Category | Examples |
|----------|----------|
| **Characters** | `bf.json` (player with miss/death/hey anims), `dad.json` (opponent) |
| **Stage** | `stage.json` (default stage positions) + `stage.lua` (background setup script) |
| **Week** | `week1.json` — 3-song week with story menu config and unlock chain |
| **Scripts** | README guides for `custom_events/`, `custom_notetypes/`, and `scripts/` with code examples |

## Quick Start

1. Copy the `psych-template/` folder into your game's `mods/` directory.
2. Rename the folder to your mod name.
3. Edit `pack.json`:

```json
{
    "name": "My Mod",
    "description": "A cool mod for Psych Engine.",
    "restart": false,
    "runsGlobally": false,
    "color": [170, 0, 255]
}
```

## Folder Structure

??? info "Full folder tree (click to expand)"
    ```
    psych-template/
    ├── pack.json                # Mod metadata
    │
    ├── characters/              # Character JSON + optional Lua scripts
    │   ├── <name>.json
    │   └── <name>.lua
    │
    ├── stages/                  # Stage JSON + optional Lua scripts
    │   ├── <name>.json
    │   └── <name>.lua
    │
    ├── weeks/                   # Week definitions
    │   └── <name>.json
    │
    ├── data/
    │   └── <Song>/              # Per-song chart data
    │       ├── <Song>.json      #   Normal difficulty
    │       ├── <Song>-easy.json
    │       ├── <Song>-hard.json
    │       ├── events.json      #   Separate events (optional)
    │       └── script.lua       #   Per-song script (optional)
    │
    ├── custom_events/           # Event Lua scripts
    ├── custom_notetypes/        # Note type Lua scripts
    ├── scripts/                 # Global Lua scripts (always active)
    │
    ├── images/
    │   ├── characters/          # Spritesheets (PNG + XML)
    │   └── icons/               # Health icons (icon-<name>.png)
    │
    ├── songs/<Song>/            # Audio (Inst.ogg, Voices-*.ogg)
    ├── sounds/                  # Sound effects
    ├── music/                   # Menu/background music
    └── videos/                  # Cutscene videos (.mp4)
    ```

## Key Format Highlights

### Characters

Psych uses `image` (not `assetPath`), `anim` (not `name`), and `sing_duration` (not `singTime`):

```json
{
    "image": "characters/DADDY_DEAREST",
    "scale": 1,
    "healthicon": "dad",
    "sing_duration": 6.1,
    "flip_x": false,
    "no_antialiasing": false,
    "healthbar_colors": [161, 161, 161],
    "position": [0, 0],
    "camera_position": [0, 0],
    "animations": [
        {
            "anim": "idle",
            "name": "Dad idle dance",
            "fps": 24,
            "loop": false,
            "indices": [],
            "offsets": [0, 0]
        }
    ]
}
```

### Stages

Stage JSON only defines positions and camera — visual setup goes in the companion Lua script:

```json
{
    "defaultZoom": 0.9,
    "boyfriend": [770, 100],
    "girlfriend": [400, 130],
    "opponent": [100, 100],
    "camera_speed": 1
}
```

```lua
-- stages/myStage.lua
function onCreate()
    makeLuaSprite('bg', 'stageback', -600, -200)
    setScrollFactor('bg', 0.9, 0.9)
    addLuaSprite('bg', false)
end
```

### Weeks

Songs array uses tuples: `["SongName", "iconCharacter", [R, G, B]]`

```json
{
    "songs": [
        ["Bopeebo", "dad", [146, 113, 253]],
        ["Fresh", "dad", [146, 113, 253]]
    ],
    "weekCharacters": ["dad", "bf", "gf"],
    "storyName": "DADDY DEAREST",
    "startUnlocked": true
}
```

### Charts

Per-difficulty files (`<Song>.json`, `<Song>-easy.json`, `<Song>-hard.json`) using section-based note layout:

```json
{
    "song": {
        "song": "Bopeebo",
        "bpm": 100,
        "speed": 1.0,
        "player1": "bf",
        "player2": "dad",
        "notes": [
            {
                "sectionNotes": [[1000, 0, 0]],
                "mustHitSection": true,
                "sectionBeats": 4
            }
        ]
    }
}
```

### Scripting

Psych supports **both Lua and HScript** in the same locations. Lua is the primary language with 212+ wrapper functions:

| Script Type | Location |
|-------------|----------|
| Stage | `stages/<name>.lua` or `.hx` |
| Song | `data/<Song>/script.lua` or `.hx` |
| Character | `characters/<name>.lua` or `.hx` |
| Note type | `custom_notetypes/<Name>.lua` or `.hx` |
| Event | `custom_events/<Name>.lua` or `.hx` |
| Global | `scripts/*.lua` or `*.hx` |

---

## Related Documentation

- [Character Format](../character-format.md) — Cross-engine character comparison
- [Chart / Song Format](../chart-format.md) — Psych chart format details
- [Stage Format](../stage-format.md) — Stage JSON specification
- [Week / Level Format](../week-format.md) — Week JSON specification
- [Scripting System](../scripting-system.md) — Lua vs HScript comparison
- [Psych Lua API](../reference/psych-lua-api.md) — Full Lua function reference
- [Lua ↔ HScript Interop](../lua-hscript-interop.md) — Using both languages together
