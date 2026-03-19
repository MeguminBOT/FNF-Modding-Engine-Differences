# images/

Mod-specific image assets. These override or add to the game's visual content.

All sprites use **PNG** format. Animated sprites need a matching **XML** atlas file (Sparrow v2 format) with the same filename.

---

## Subfolder Guide

### fonts/
Custom bitmap fonts used by the game's text rendering.

Each font needs a **PNG** sprite + **XML** atlas pair (e.g., `bold.png` + `bold.xml`).

The included fonts are: `default`, `bold`, and `freeplay-clear`.

### freeplay/
Difficulty label sprites for the freeplay menu (e.g., `freeplayeasy.png`, `freeplayhard.png`).

#### freeplay/icons/
Character icons displayed in the freeplay song list.

- **Size:** 150×150 pixels
- **Format:** Single PNG per character
- **Filename:** Must match the character ID (e.g., `bf.png`, `dad.png`)

### icons/
Health bar character icons shown during gameplay.

- **Size:** 150×150 pixels per frame, arranged as a horizontal strip
- **Frames:** 2 frames minimum (normal state, losing state) — the full image is 300×150
- **Optional:** 3rd frame (winning state) — full image becomes 450×150
- **Filename:** `icon-<characterId>.png` (e.g., `icon-bf.png`)

### soundtray/
Custom sprites for the volume indicator HUD that appears when adjusting volume.

### storymenu/
Story mode (week select) menu assets:

| Subfolder | Contents |
|-----------|----------|
| `difficulties/` | Difficulty name sprites (easy, normal, hard, etc.) |
| `props/` | Animated character sprites on the story menu (PNG + XML atlas pairs) |
| `titles/` | Week title banner images |
| `ui/` | Navigation arrows and lock icon |
