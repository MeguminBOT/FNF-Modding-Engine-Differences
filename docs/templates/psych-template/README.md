# Psych Engine Mod Template

A starter template for creating mods for **Friday Night Funkin': Psych Engine**.

## Quick Start

1. Copy this entire `psych-template/` folder into your game's `mods/` directory.
2. Rename the folder to your mod's name (e.g., `mods/my-cool-mod/`).
3. Edit `pack.json` with your mod's info.
4. Start adding your content!

## Folder Structure

```
psych-template/
├── pack.json                # Mod metadata (name, description, color)
│
├── characters/              # Character definitions + scripts
│   ├── <name>.json          #   Character data (spritesheet, anims, health icon)
│   └── <name>.lua           #   Optional per-character Lua script
│
├── stages/                  # Stage definitions + scripts
│   ├── <name>.json          #   Stage data (positions, zoom, preload)
│   └── <name>.lua           #   Optional stage setup Lua script
│
├── weeks/                   # Week/story mode definitions
│   └── <name>.json          #   Week data (songs, characters, unlock rules)
│
├── data/
│   └── <Song>/              # Per-song chart data (folder name = song name)
│       ├── <Song>.json      #   Normal difficulty chart
│       ├── <Song>-easy.json #   Easy difficulty chart
│       ├── <Song>-hard.json #   Hard difficulty chart
│       ├── events.json      #   Separate events file (optional)
│       └── script.lua       #   Per-song Lua script (optional)
│
├── custom_events/           # Custom event Lua scripts
│   └── <EventName>.lua
│
├── custom_notetypes/        # Custom note type Lua scripts
│   └── <NoteType>.lua
│
├── scripts/                 # Global Lua scripts (always active during gameplay)
│   └── *.lua
│
├── images/                  # All image assets
│   ├── characters/          #   Character spritesheets (PNG + XML atlas)
│   ├── icons/               #   Health bar icons (icon-<name>.png)
│   └── ...                  #   Stage backgrounds, UI, etc.
│
├── songs/                   # Per-song audio
│   └── <Song>/
│       ├── Inst.ogg
│       ├── Voices-Player.ogg    # Split vocals (modern Psych)
│       └── Voices-Opponent.ogg
│
├── sounds/                  # Sound effects
├── music/                   # Menu/background music
└── videos/                  # Video cutscenes (.mp4)
```

## Key Files Explained

### `pack.json`

Defines your mod's identity in the mod loader menu.

```json
{
    "name": "My Mod",
    "description": "A cool mod for Psych Engine.",
    "restart": false,
    "runsGlobally": false,
    "color": [170, 0, 255]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name in the mod menu |
| `description` | string | Short description |
| `restart` | bool | Restart the engine when this mod is toggled? |
| `runsGlobally` | bool | Run this mod's scripts regardless of which mod is active? |
| `color` | [R,G,B] | Accent color in the mod menu (0-255 per channel) |

### Character JSON

See `characters/` folder for examples. Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `image` | string | Spritesheet path relative to `images/` |
| `scale` | float | Sprite scale (1 = normal) |
| `healthicon` | string | Icon ID (loads `images/icons/icon-<id>.png`) |
| `position` | [x, y] | Character position offset |
| `camera_position` | [x, y] | Camera offset when focused on this character |
| `flip_x` | bool | Mirror the sprite horizontally |
| `no_antialiasing` | bool | Disable anti-aliasing (for pixel art) |
| `healthbar_colors` | [R,G,B] | Health bar color |
| `sing_duration` | float | How long sing poses hold (in steps) |
| `animations[].anim` | string | Animation identifier (`idle`, `singLEFT`, etc.) |
| `animations[].name` | string | Spritesheet animation prefix |
| `animations[].fps` | int | Frame rate |
| `animations[].loop` | bool | Whether the animation loops |
| `animations[].offsets` | [x, y] | Animation offset |

### Stage JSON

See `stages/` folder for examples. Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `defaultZoom` | float | Camera zoom level |
| `boyfriend` | [x, y] | Boyfriend position |
| `girlfriend` | [x, y] | Girlfriend position |
| `opponent` | [x, y] | Opponent position |
| `hide_girlfriend` | bool | Hide GF on this stage |
| `camera_boyfriend` | [x, y] | Camera offset for BF |
| `camera_opponent` | [x, y] | Camera offset for opponent |
| `camera_speed` | float | Camera follow speed |

### Week JSON

See `weeks/` folder for examples. Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `songs` | array | `[["SongName", "iconChar", [R,G,B]], ...]` |
| `weekCharacters` | [3] | Story menu display characters `[left, center, right]` |
| `weekBackground` | string | Story menu background image |
| `storyName` | string | Display name in story mode |
| `weekName` | string | Internal week name |
| `weekBefore` | string | Previous week ID (for unlock chaining) |
| `startUnlocked` | bool | Available from the start? |

## Scripting

Psych Engine supports **Lua** (primary) and **HScript** (secondary) scripts in the same locations:

| Script Type | Location | Runs When |
|-------------|----------|-----------|
| Stage | `stages/<name>.lua` | Stage loads |
| Song | `data/<Song>/script.lua` | That song plays |
| Character | `characters/<name>.lua` | Character loads |
| Note type | `custom_notetypes/<Name>.lua` | Note of that type appears |
| Event | `custom_events/<Name>.lua` | Event triggers |
| Global | `scripts/*.lua` | Always during gameplay |

Replace `.lua` with `.hx` for HScript variants.

## Included Examples

- **Characters**: `dad.json` (opponent) and `bf.json` (player with miss/death anims)
- **Stage**: `stage.json` (default stage with character positions and preload list)
- **Week**: `week1.json` (3-song week with unlock chain and story menu config)
- **Script**: `stages/stage.lua` (example stage background setup with Lua)

## Further Reading

- [Mod Folder Structure](https://meguminbot.github.io/FNF-Modding-Engine-Differences/mod-folder-structure/)
- [Character Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/character-format/)
- [Chart Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/chart-format/)
- [Stage Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/stage-format/)
- [Week / Level Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/week-format/)
- [Scripting System](https://meguminbot.github.io/FNF-Modding-Engine-Differences/scripting-system/)
- [Psych Lua API Reference](https://meguminbot.github.io/FNF-Modding-Engine-Differences/reference/psych-lua-api/)
