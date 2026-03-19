# Official Funkin' (V-Slice) Mod Template

A starter template for creating mods for **Friday Night Funkin'** (Official / V-Slice) using the Polymod modding framework.

## Quick Start

1. Copy this entire `vslice-template/` folder into your game's `mods/` directory.
2. Rename the folder to your mod's name (e.g., `mods/my-cool-mod/`).
3. Edit `_polymod_meta.json` with your mod's info.
4. Replace `_polymod_icon.png` with your mod's icon.
5. Start adding your content!

## Folder Structure

```
vslice-template/
├── _polymod_meta.json      # Mod metadata (name, author, version)
├── _polymod_icon.png        # Mod icon displayed in the mod loader
│
├── data/                    # Game data (JSON definitions)
│   ├── characters/          # Character definitions
│   ├── levels/              # Week/level definitions (story mode)
│   ├── notestyles/          # Custom note skins
│   ├── dialogue/            # Dialogue system data
│   │   ├── boxes/           #   Speech bubble styles
│   │   ├── conversations/   #   Dialogue scripts
│   │   └── speakers/        #   Speaker portrait definitions
│   ├── songs/<songname>/    # Per-song chart + metadata
│   ├── characterList.txt    # Registry of playable character IDs
│   ├── introText.txt        # Random intro screen text lines
│   └── storychardata.txt    # Story menu character scaling/offsets
│
├── images/                  # Mod-specific image assets
│   ├── fonts/               # Custom bitmap fonts (PNG + XML atlas)
│   ├── freeplay/            # Freeplay menu difficulty sprites
│   │   └── icons/           #   Freeplay character icons (150×150px)
│   ├── icons/               # Health bar icons (150×150px, 2-frame grid)
│   ├── soundtray/           # Volume HUD sprites
│   └── storymenu/           # Story mode menu assets
│       ├── difficulties/    #   Difficulty name sprites
│       ├── props/           #   Character props (PNG + XML atlas)
│       ├── titles/          #   Week title banners
│       └── ui/              #   Menu UI elements (arrows, lock)
│
├── music/                   # Music tracks (OGG + metadata JSON)
│
├── scripts/                 # HScript (.hxc) scripted classes
│   ├── characters/          # Character script overrides
│   ├── dialogue/            # Dialogue script overrides
│   ├── levels/              # Level script overrides
│   ├── songs/               # Song script overrides
│   ├── stages/              # Stage script overrides
│   └── shaders/             # Custom shader scripts
│
├── shaders/                 # GLSL shader files
│
├── shared/                  # Assets shared across all songs
│   ├── images/              # Shared sprites
│   │   ├── characters/      #   Character spritesheets (PNG + XML)
│   │   ├── transitionSwag/  #   Transition sticker packs
│   │   └── ui/              #   Shared UI elements
│   ├── music/               # Shared music
│   └── sounds/              # Shared sound effects
│
├── songs/                   # Per-song audio (Inst.ogg, Voices.ogg)
│
└── sounds/                  # Mod-specific sound effects
```

## Key Files Explained

### `_polymod_meta.json`

Defines your mod's identity. The `api_version` must match the game version you're targeting.

```json
{
    "title": "My Mod Name",
    "description": "A short description of your mod",
    "author": "Your Name",
    "api_version": "0.7.3",
    "mod_version": "1.0.0",
    "license": "CC BY 4.0"
}
```

### Data Files

| File | Purpose |
|------|---------|
| `data/characterList.txt` | One character ID per line. Registers characters for the freeplay menu character selector. |
| `data/introText.txt` | Random intro text pairs separated by `--`. Format: `line1--line2` |
| `data/storychardata.txt` | Story menu character rendering. Format: `charId scaleEasy scaleNormal scaleHard [offsetX] [offsetY]` |

### Song Structure

Each song needs a folder under `data/songs/<songname>/` containing:
- `<songname>-metadata.json` — BPM, artist, characters, stage, difficulties
- `<songname>-chart.json` — Note data, events, scroll speeds

Audio goes in `songs/<songname>/`:
- `Inst.ogg` — Instrumental track
- `Voices-<charId>.ogg` — Per-character vocal tracks (e.g., `Voices-bf.ogg`, `Voices-dad.ogg`)

For song variations (e.g., erect remixes), add suffixed files:
- `<songname>-metadata-<variation>.json`
- `<songname>-chart-<variation>.json`

## Included Examples

This template ships with working examples you can reference:

- **Characters**: `bftemple.json` (Boyfriend) and `dadtemple.json` (Daddy Dearest) — demonstrates standard and hold animations
- **Level**: `week1temple.json` — story mode week with 3 character props and song list
- **Note Style**: `funkintemple.json` — default note skin with splash/hold cover assets
- **Dialogue**: Full dialogue example from "Roses" with speakers, boxes, and conversation script
- **Song**: Complete Bopeebo chart + metadata (including erect variation)
- **Scripts**: Three `.hxc` examples showing level unlocks, video cutscenes, and stage animations

## Further Reading

For detailed format specifications and cross-engine comparisons, see the full documentation:

- [Character Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/character-format/)
- [Chart / Song Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/chart-format/)
- [Stage Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/stage-format/)
- [Week / Level Format](https://meguminbot.github.io/FNF-Modding-Engine-Differences/week-format/)
- [Events System](https://meguminbot.github.io/FNF-Modding-Engine-Differences/events-system/)
- [Scripting System](https://meguminbot.github.io/FNF-Modding-Engine-Differences/scripting-system/)
