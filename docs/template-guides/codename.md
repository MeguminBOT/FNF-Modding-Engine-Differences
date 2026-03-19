# Codename Engine Template

A starter template for creating mods for **Friday Night Funkin': Codename Engine**.

[:material-download: Download Template](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/tree/main/docs/templates/codename-template){ .md-button }

---

## What's Included

| Category | Examples |
|----------|----------|
| **Stage** | `myStage.xml` (XML stage layout) + `myStage.hx` (companion script with camera effects) |
| **Song** | Complete `bopeebo/` — `meta.json`, `charts/hard.json`, and global song script |
| **Scripts** | README guides for `data/scripts/`, `data/notes/`, and `data/states/` with code examples |
| **Global Script** | `CamZooming.hx` — beat-synced camera example |

## Quick Start

1. Copy the `codename-template/` folder into the engine's `mods/` directory.
2. Rename the folder to your mod name.

!!! note "Optional mod config"
    Codename Engine uses an optional `data/config/modpack.ini` (INI format) for mod metadata — name, description, author, version, Discord RPC, and state redirects. If omitted, the folder name is used as the mod identity.

## Folder Structure

??? info "Full folder tree (click to expand)"
    ```
    codename-template/
    │
    ├── data/
    │   ├── config/              # Mod configuration
    │   │   └── modpack.ini      #   Mod metadata (INI format)
    │   ├── characters/          # Character definitions (XML)
    │   ├── stages/              # Stage definitions
    │   │   ├── <name>.xml       #   Stage layout (XML format!)
    │   │   └── <name>.hx        #   Optional companion HScript
    │   ├── events/              # Custom event definitions (.hx + .json)
    │   ├── notes/               # Custom note type scripts
    │   ├── scripts/             # Global scripts (all game states)
    │   ├── states/              # Custom game states (full menus)
    │   └── splashes/            # Note splash definitions
    │
    ├── songs/
    │   ├── *.hx                 # Global song scripts (all songs)
    │   └── <song-name>/
    │       ├── meta.json        #   Song metadata
    │       ├── charts/
    │       │   └── <diff>.json  #   One chart file per difficulty
    │       ├── scripts/         #   Per-song HScripts
    │       └── song/            #   Audio (Inst.ogg, Voices.ogg)
    │
    ├── images/                  # All image assets
    │   ├── icons/               #   Health bar icons
    │   ├── game/                #   Gameplay UI
    │   ├── menus/               #   Menu graphics
    │   └── stages/              #   Stage-specific sprites
    │
    ├── shaders/                 # GLSL fragment shaders (.frag)
    ├── sounds/                  # Sound effects
    ├── music/                   # Background/menu music
    ├── videos/                  # Video cutscenes
    └── fonts/                   # Custom fonts
    ```

## Key Format Highlights

### Stages (XML)

Codename is the only FNF engine that uses **XML** for stage definitions. Element order determines z-ordering:

```xml
<!DOCTYPE codename-engine-stage>
<stage zoom="0.9" name="myStage" folder="stages/myStage">
    <sprite name="bg" x="-600" y="-200" sprite="stageback"
            scroll="0.9" scale="1" antialiasing="true" />

    <gf x="400" y="130" />
    <opponent x="100" y="100" />

    <sprite name="front" x="-650" y="600" sprite="stagefront" />

    <player x="770" y="100" />
</stage>
```

Character element aliases: `<player>`/`<boyfriend>`/`<bf>`, `<opponent>`/`<dad>`, `<gf>`/`<girlfriend>`

Companion `.hx` scripts can access XML-defined sprites via `stage.stageSprites["name"]` or `stage.getSprite("name")`.

### Songs

Song metadata lives in `songs/<name>/meta.json` — a flat JSON with no versioning:

```json
{
    "name": "my-song",
    "bpm": 100,
    "difficulties": ["easy", "normal", "hard"],
    "displayName": "My Song",
    "icon": "dad",
    "color": "#AF66CE",
    "needsVoices": true
}
```

Charts are stored as **one file per difficulty** in `charts/`:

```json
{
    "chartVersion": "1.6.0",
    "codenameChart": true,
    "stage": "myStage",
    "scrollSpeed": 1.0,
    "noteTypes": [],
    "strumLines": [
        {
            "position": "dad",
            "type": 0,
            "characters": ["dad"],
            "notes": [
                { "time": 1000, "id": 0, "sLen": 0, "type": 0 }
            ]
        },
        {
            "position": "boyfriend",
            "type": 1,
            "characters": ["bf"],
            "notes": []
        }
    ]
}
```

Note `type` is an **integer** index into the `noteTypes` array (`0` = default).

### Audio Layout

Audio files go in `songs/<name>/song/` (extra `song/` subfolder):

```
songs/bopeebo/song/Inst.ogg
songs/bopeebo/song/Voices.ogg
```

!!! warning "Vocal files"
    Codename defaults to a **single combined** `Voices.ogg` file, but supports per-strumline vocals via `vocalsSuffix` on each strumline (e.g. `Voices_Opponent.ogg`).

### Scripting

Codename uses **function-based HScript** (`.hx` files) — no class declarations, just loose callback functions:

```haxe
// data/stages/myStage.hx

function postCreate() {
    var bg = stage.stageSprites["bg"];
    bg.alpha = 0.8;
}

function beatHit(curBeat) {
    if (curBeat % 4 == 0)
        camGame.zoom += 0.03;
}
```

### Unique Features

Codename has capabilities not found in other FNF engines:

| Feature | Description |
|---------|-------------|
| **Custom game states** | `data/states/*.hx` — replace menus via `FlxG.switchState(new ModState("name"))` |
| **Cross-script communication** | `public var` + `importScript()` for sharing data between scripts |
| **Character definitions** | `data/characters/*.xml` — XML-based character data (like stages) |
| **Global song scripts** | Place `.hx` files in the root of `songs/` to apply to all songs |

---

## Related Documentation

- [Stage Format](../stage-format.md) — XML stage specification
- [Chart / Song Format](../chart-format.md) — Codename chart format details
- [Events System](../events-system.md) — Event types and parameters
- [Codename Events](../reference/codename-events.md) — Built-in event reference
- [Scripting System](../scripting-system.md) — Function-based HScript details
- [Mod Folder Structure](../mod-folder-structure.md) — Full folder layout comparison
