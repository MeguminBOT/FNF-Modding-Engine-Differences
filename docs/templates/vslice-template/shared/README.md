# shared/

Assets shared across all songs in your mod. Unlike `images/` and `sounds/` at the mod root (which are mod-specific), the `shared/` folder mirrors the game's shared asset pool.

When referencing shared assets in JSON definitions, use the `shared:` prefix in the asset path.  
For example: `"assetPath": "shared:notes"` resolves to `shared/images/notes.png`.

---

## Subfolder Guide

### images/characters/
Character spritesheets — the main visual assets for your characters.

Each character needs:
- **PNG** — the spritesheet image
- **XML** — Sparrow v2 atlas defining animation frames

The `assetPath` in your character JSON (under `data/characters/`) points here.  
Example: `"assetPath": "characters/BOYFRIEND"` → `shared/images/characters/BOYFRIEND.png` + `.xml`

### images/transitionSwag/
Sticker packs for scene transition animations.

Each sticker set folder contains a `stickers.json` defining available sticker characters and their animations, organized into named packs.

To add a character's stickers, add an entry to the `characters` object in `stickers.json`:
```json
"mychar": ["mycharSticker1", "mycharSticker2", "mycharSticker3"]
```

Then add the character to a sticker pack:
```json
"stickerPacks": {
    "all": ["bf", "gf", "mychar"]
}
```

### images/ui/
Shared UI elements used across multiple game states (judgment sprites, countdown graphics, etc.).

The base game includes: `sick.png`, `good.png`, `bad.png`, `shit.png`, `combo.png`, `ready.png`, `set.png`, `go.png`

### music/
Shared music tracks available across all songs/menus.

### sounds/
Shared sound effects available across all songs/menus.
