# Character Data Format

## Official Funkin — JSON

**Location:** `data/characters/<name>.json`

```json
{
  "version": "1.0.0",
  "name": "Daddy Dearest",
  "renderType": "sparrow",
  "assetPath": "characters/DADDY_DEAREST",
  "startingAnimation": "idle",
  "singTime": 6.1,
  "flipX": false,
  "isPixel": false,
  "healthIcon": { "id": "dad", "scale": 1.0, "flipX": false, "isPixel": false, "offsets": [0, 0] },
  "offsets": [0, 0],
  "cameraOffsets": [0, 0],
  "danceEvery": 1,
  "scale": 1.0,
  "death": { "cameraOffsets": [0, 0], "cameraZoom": 1, "preTransitionDelay": 0 },
  "animations": [
    {
      "name": "idle",
      "prefix": "Dad idle dance",
      "offsets": [0, 0],
      "looped": false,
      "frameRate": 24,
      "frameIndices": [],
      "flipX": false,
      "flipY": false
    },
    {
      "name": "singLEFT",
      "prefix": "Dad Sing Note LEFT",
      "offsets": [-10, 10],
      "looped": false,
      "frameRate": 24
    }
  ]
}
```

______________________________________________________________________

## Psych Engine — JSON

**Location:** `characters/<name>.json`

```json
{
  "animations": [
    {
      "anim": "idle",
      "name": "Dad idle dance",
      "fps": 24,
      "loop": false,
      "indices": [],
      "offsets": [0, 0]
    },
    {
      "anim": "singLEFT",
      "name": "dad sing note right",
      "fps": 24,
      "loop": false,
      "indices": [],
      "offsets": [-10, 10]
    }
  ],
  "image": "characters/DADDY_DEAREST",
  "scale": 1,
  "sing_duration": 6.1,
  "healthicon": "dad",
  "position": [0, 0],
  "camera_position": [0, 0],
  "flip_x": false,
  "no_antialiasing": false,
  "healthbar_colors": [161, 161, 161]
}
```

______________________________________________________________________

## Codename Engine — XML

**Location:** `data/characters/<name>.xml` (+ auto-loaded HScript at `data/characters/<name>.hx`)

```xml
<character isPlayer="false" flipX="false" holdTime="6.1" color="#AF66CE"
           icon="dad" scale="1" antialiasing="true"
           x="0" y="0" camx="0" camy="0"
           gameOverChar="bf-dead" sprite="characters/DADDY_DEAREST">
    <anim name="idle" anim="Dad idle dance" fps="24" loop="false" x="0" y="0"/>
    <anim name="singLEFT" anim="dad sing note right" fps="24" loop="false" x="-10" y="10"/>
    <anim name="singDOWN" anim="Dad Sing Note DOWN" fps="24" loop="false" x="0" y="-30"/>
    <anim name="singUP" anim="Dad Sing note UP" fps="24" loop="false" x="-6" y="50"/>
    <anim name="singRIGHT" anim="Dad Sing Note LEFT" fps="24" loop="false" x="0" y="27"/>
</character>
```

### Character Attributes

| Attribute          | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `sprite`           | Spritesheet image path (relative to `images/characters/`) |
| `x`, `y`           | Global position offsets                                  |
| `camx`, `camy`     | Camera offsets when focused on this character             |
| `scale`            | Uniform scale                                            |
| `flipX`            | Flip the sprite                                          |
| `antialiasing`     | `"true"` / `"false"` (default true)                      |
| `isPlayer`         | Whether to use player-side offsets                       |
| `icon`             | Health icon name (defaults to character name)            |
| `color`            | Health bar color (hex string, e.g. `"#AF66CE"`)          |
| `holdTime`         | Steps before returning to idle after singing (default 4) |
| `gameOverChar`     | Character to use on game over screen                     |
| `interval`         | Dance beat interval (auto-detected if danceLeft/danceRight exist) |
| `applyStageMatrix` | `"true"` to apply stage transform matrix (for animate atlas) |
| `swfMode`          | `"true"` for SWF animate mode                            |
| `cacheOnLoad`      | `"true"` to cache animate atlas on load                  |
| `filterQuality`    | Filter quality: `"high"`, `"medium"`, `"low"`, or int     |

Any attributes beyond the built-in set are stored in the character's `extra` map, accessible from scripts.

### Animation Node (`<anim>`)

| Attribute  | Description                                        |
| ---------- | -------------------------------------------------- |
| `name`     | Internal animation name (e.g. `"idle"`, `"singUP"`) |
| `anim`     | Spritesheet prefix / symbol name                   |
| `fps`      | Frame rate (default 24)                            |
| `loop`     | `"true"` to loop                                   |
| `x`, `y`   | Animation offsets                                  |
| `indices`  | Frame indices (e.g. `"0-5"`, `"1,3,5"`)            |
| `label`    | `"true"` to use frame label instead of symbol      |
| `forced`   | `"true"` to force-play the animation               |
| `type`     | Animation type override (e.g. `"beat"`, `"loop"`, `"none"`) |

### Other Child Nodes

| Node                                        | Description                                |
| ------------------------------------------- | ------------------------------------------ |
| `<use-extension>` / `<extension>` / `<ext>` | Import an external HScript into the character |

______________________________________________________________________

## Character Field Mapping

| Concept                     | Official Funkin                                            | Psych Engine                  | Codename Engine            |
| --------------------------- | ---------------------------------------------------------- | ----------------------------- | -------------------------- |
| **Format**                  | JSON                                                       | JSON                          | XML                        |
| **Anim internal name**      | `animations[].name`                                        | `animations[].anim`           | `<anim name="">`           |
| **Anim spritesheet prefix** | `animations[].prefix`                                      | `animations[].name`           | `<anim anim="">`           |
| **Frame rate**              | `animations[].frameRate`                                   | `animations[].fps`            | `<anim fps="">`            |
| **Loop**                    | `animations[].looped`                                      | `animations[].loop`           | `<anim loop="">`           |
| **Frame indices**           | `animations[].frameIndices`                                | `animations[].indices`        | `<anim indices="">`        |
| **Anim offsets**            | `animations[].offsets` [x, y]                              | `animations[].offsets` [x, y] | `<anim x="" y="">`         |
| **Spritesheet path**        | `assetPath`                                                | `image`                       | `sprite` attribute         |
| **Render type**             | `renderType` (sparrow/packer/animateatlas/multisparrow)    | Implicit (sparrow default)    | Implicit (auto-detected)   |
| **Character scale**         | `scale`                                                    | `scale`                       | `scale` attribute          |
| **Sing hold time**          | `singTime` (in steps)                                      | `sing_duration`               | `holdTime` (default 4)     |
| **Health icon**             | `healthIcon` object `{id, scale, flipX, isPixel, offsets}` | `healthicon` (string)         | `icon` attribute (string)  |
| **Global position offsets** | `offsets` [x, y]                                           | `position` [x, y]             | `x`, `y` attributes        |
| **Camera offsets**          | `cameraOffsets` [x, y]                                     | `camera_position` [x, y]      | `camx`, `camy` attributes  |
| **Flip X**                  | `flipX`                                                    | `flip_x`                      | `flipX` attribute          |
| **Pixel/No antialiasing**   | `isPixel`                                                  | `no_antialiasing`             | `antialiasing` (inverted)  |
| **Starting animation**      | `startingAnimation`                                        | First in list / "idle"        | First in list / "idle"     |
| **Health bar color**        | Not in character data                                      | `healthbar_colors` [r, g, b]  | `color` attribute (hex)    |
| **Is player**               | Determined by stage/chart role                             | Determined by chart role      | `isPlayer` attribute       |
| **Game over character**     | `death` object                                             | Not in character data         | `gameOverChar` attribute   |
| **Dance frequency**         | `danceEvery` (beats)                                       | Implicit                      | `interval` attribute       |
| **Stage matrix**            | N/A                                                        | N/A                           | `applyStageMatrix` attr    |
| **Animate atlas settings**  | N/A                                                        | N/A                           | `swfMode`, `cacheOnLoad`, `filterQuality` |
| **Anim label mode**         | N/A                                                        | N/A                           | `label="true"` on `<anim>` |
| **Custom attributes**       | N/A                                                        | N/A                           | Extra attrs in `extra` map |
| **Script extensions**       | N/A                                                        | N/A                           | `<use-extension>` / `<ext>` nodes |

