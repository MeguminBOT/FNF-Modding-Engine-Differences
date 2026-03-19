# Official Funkin' (V-Slice) Template

A complete Polymod mod template for **Friday Night Funkin'** (Official / V-Slice engine).

[:material-download: Download Template](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/tree/main/docs/templates/vslice-template){ .md-button }

---

## What's Included

| Category | Examples |
|----------|----------|
| **Characters** | `bftemple.json` (player with miss/death anims), `dadtemple.json` (opponent with hold anims) |
| **Song** | Complete Bopeebo — chart, metadata, and erect variation |
| **Level** | `week1temple.json` — story mode week with animated menu props |
| **Note Style** | `funkintemple.json` — default skin with notes, splashes, hold covers |
| **Dialogue** | Full Roses example — speakers, speech boxes, conversation script |
| **Scripts** | 3 `.hxc` examples — level unlocks, video cutscenes, stage animations |
| **Assets** | Fonts, freeplay icons, difficulty banners, story menu props/titles |

## Quick Start

1. Copy the `vslice-template/` folder into your game's `mods/` directory.
2. Rename the folder to your mod name.
3. Edit `_polymod_meta.json`:

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

## Folder Structure

??? info "Full folder tree (click to expand)"
    ```
    vslice-template/
    ├── _polymod_meta.json       # Mod metadata (name, author, version)
    ├── _polymod_icon.png        # Mod icon for the mod loader
    │
    ├── data/
    │   ├── characters/          # Character definitions (JSON)
    │   ├── levels/              # Week/level definitions (JSON)
    │   ├── notestyles/          # Custom note skins (JSON)
    │   ├── dialogue/
    │   │   ├── boxes/           #   Speech bubble styles
    │   │   ├── conversations/   #   Dialogue scripts
    │   │   └── speakers/        #   Speaker portrait definitions
    │   ├── songs/<name>/        # Per-song chart + metadata
    │   ├── characterList.txt    # Freeplay character registry
    │   ├── introText.txt        # Random intro screen text
    │   └── storychardata.txt    # Story menu character scaling
    │
    ├── images/                  # Mod-specific sprites
    │   ├── fonts/               #   Custom bitmap fonts
    │   ├── freeplay/            #   Freeplay difficulty sprites
    │   │   └── icons/           #   Freeplay character icons (150×150)
    │   ├── icons/               #   Health bar icons (150×150, 2-3 frames)
    │   ├── soundtray/           #   Volume HUD sprites
    │   └── storymenu/           #   Story mode menu assets
    │
    ├── music/                   # Music tracks + metadata JSON
    │
    ├── scripts/                 # HScript (.hxc) scripted classes
    │   ├── characters/          #   class extends Character
    │   ├── levels/              #   class extends Level
    │   ├── songs/               #   class extends Song
    │   ├── stages/              #   class extends Stage
    │   └── shaders/             #   Shader wrapper scripts
    │
    ├── shared/                  # Shared game assets
    │   ├── images/characters/   #   Character spritesheets (PNG + XML)
    │   ├── images/transitionSwag/ # Transition sticker packs
    │   └── images/ui/           #   Shared UI elements
    │
    ├── songs/                   # Per-song audio (Inst.ogg, Voices-*.ogg)
    └── sounds/                  # Sound effects
    ```

## Key Format Highlights

### Characters

V-Slice characters use a `version` field and named `renderType`:

```json
{
    "version": "1.0.0",
    "name": "My Character",
    "renderType": "sparrow",
    "assetPath": "characters/myChar",
    "singTime": 8.0,
    "animations": [
        { "name": "idle", "prefix": "idle0", "offsets": [0, 0] },
        { "name": "singLEFT", "prefix": "singLEFT0", "offsets": [0, 0] }
    ]
}
```

### Songs

Songs require two files per variation in `data/songs/<name>/`:

- `<name>-metadata.json` — BPM, artist, characters, stage, difficulties
- `<name>-chart.json` — Notes, events, scroll speeds per difficulty

Audio goes in `songs/<name>/` with per-character vocal tracks:
`Inst.ogg`, `Voices-bf.ogg`, `Voices-dad.ogg`

### Scripts

V-Slice uses **class-based HScript** (`.hxc` files):

```haxe
class MyStage extends Stage {
    override function create() {
        super.create();
        // Setup code
    }

    override function beatHit(curBeat:Int) {
        // Beat-synced effects
    }
}
```

---

## Related Documentation

- [Character Format](../character-format.md) — Full character JSON specification
- [Chart / Song Format](../chart-format.md) — Song metadata and chart format
- [Stage Format](../stage-format.md) — Stage definition format
- [Week / Level Format](../week-format.md) — Week/level JSON specification
- [Scripting System](../scripting-system.md) — HScript class-based scripting
- [Events System](../events-system.md) — Event types and parameters
- [Official Funkin Events](../reference/official-events.md) — Built-in event reference
