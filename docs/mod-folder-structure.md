# Mod Folder Structure

## Official Funkin (Polymod)

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
├── scripts/                    # HScript module scripts (.hxc)
└── shared/                     # Shared assets
```

## Psych Engine

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

## Codename Engine

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
│   ├── config/                 # discord.json, credits.xml, options.xml
│   └── configs/
│       └── modpack.ini         # Modpack metadata (v1.0+)
├── images/
│   ├── characters/             # Character spritesheets
│   └── stages/                 # Stage images
```

## Key Differences

| Aspect                 | Official Funkin                 | Psych Engine                                    | Codename Engine                                             |
| ---------------------- | ------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| **Metadata file**      | `_polymod_meta.json` (required) | `pack.json` (optional)                          | `data/configs/modpack.ini` (optional, v1.0+)                |
| **Chart location**     | `data/songs/<id>/`              | `data/<Song>/`                                  | `songs/<song>/charts/`                                      |
| **Character data dir** | `data/characters/`              | `characters/`                                   | `data/characters/`                                          |
| **Stage data dir**     | `data/stages/`                  | `stages/`                                       | `data/stages/`                                              |
| **Week data dir**      | `data/levels/`                  | `weeks/`                                        | `data/weeks/weeks/`                                         |
| **Song audio dir**     | `songs/<id>/`                   | `songs/<Song>/`                                 | `songs/<song>/song/`                                        |
| **Scripts location**   | `scripts/`                      | `scripts/` (global), per-song in `data/<Song>/` | `songs/<song>/scripts/` (per-song), `data/states/` (global) |
| **Addons/Always-on**   | N/A                             | N/A                                             | `./addons/` folder                                          |

## Mod Metadata

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

### Codename Engine — `data/configs/modpack.ini`

As of v1.0+, Codename Engine supports an optional `modpack.ini` file located at `./data/configs/modpack.ini` for modpack metadata. Before v1.0, no metadata file was required — the mod was loaded simply by existing as a folder in `./mods/`.

The file uses INI format with multiple sections. Fields in `[Common]` are automatically prefixed with `MOD_`, and fields in `[Discord]` are prefixed with `MOD_DISCORD_`.

```ini
[Common]
NAME="My Mod"
DESCRIPTION="A cool mod."
AUTHOR="ModAuthor"
VERSION="1.0.0"
API_VERSION=1
DOWNLOAD_LINK="https://gamebanana.com/mods/..."
ICON="path/to/icon.png"

[Flags]
DISABLE_WARNING_SCREEN=true
DISABLE_LANGUAGES=true

[Discord]
CLIENT_ID=""
LOGO_KEY=""
LOGO_TEXT=""

[StateRedirects]
;StoryMenuState="funkin.menus.FreeplayState"
;FreeplayState="scriptedFreeplayState"

[StateRedirects.force]
```

#### `[Common]` — Mod Metadata

Fields in this section are automatically prefixed with `MOD_`.

| Field           | Type   | Description                                                      |
| --------------- | ------ | ---------------------------------------------------------------- |
| `NAME`          | String | Display name of the mod                                          |
| `DESCRIPTION`   | String | Short description of the mod                                     |
| `AUTHOR`        | String | Mod author or team name                                          |
| `VERSION`       | String | Version string for the mod                                       |
| `API_VERSION`   | Int    | Internal version for compatibility checks — do not edit          |
| `DOWNLOAD_LINK` | String | Link to the mod's page (e.g. GameBanana)                         |
| `ICON`          | String | Path to a mod icon image                                         |

#### `[Flags]` — Engine Flags

No prefix applied. Controls engine behavior overrides.

| Field                      | Type | Description                                                         |
| -------------------------- | ---- | ------------------------------------------------------------------- |
| `DISABLE_WARNING_SCREEN`   | Bool | Set `true` to skip the warning/disclaimer state on startup          |
| `DISABLE_LANGUAGES`        | Bool | Set `true` if the mod does not include translations                 |

#### `[Discord]` — Discord Rich Presence

Fields in this section are automatically prefixed with `MOD_DISCORD_`.

| Field       | Type   | Description                         |
| ----------- | ------ | ----------------------------------- |
| `CLIENT_ID` | String | Discord application client ID       |
| `LOGO_KEY`  | String | Asset key for the Discord RPC logo  |
| `LOGO_TEXT` | String | Hover text for the Discord RPC logo |

#### `[StateRedirects]` — State Overrides

Allows redirecting built-in engine states to custom ones. Use `[StateRedirects.force]` to override redirects set by subsequent addons/mods.

Config files (Discord RPC, credits, options) go in `./data/config/`.
