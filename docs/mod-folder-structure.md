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
├── scripts/                    # HScript module scripts (.hxs)
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
│   └── config/                 # discord.json, credits.xml, options.xml
├── images/
│   ├── characters/             # Character spritesheets
│   └── stages/                 # Stage images
└── (no metadata file required)
```

## Key Differences

| Aspect                 | Official Funkin                 | Psych Engine                                    | Codename Engine                                             |
| ---------------------- | ------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| **Metadata file**      | `_polymod_meta.json` (required) | `pack.json` (optional)                          | None required                                               |
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

### Codename Engine

No metadata file required. Mod is loaded simply by existing as a folder in `./mods/`.

Config files (Discord RPC, credits, options) go in `./data/config/`.
