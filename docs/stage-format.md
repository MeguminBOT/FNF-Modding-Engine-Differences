# Stage Data Format

## Official Funkin — JSON

**Location:** `data/stages/<name>.json`

```json
{
  "version": "1.0.1",
  "name": "Main Stage",
  "cameraZoom": 1.1,
  "props": [
    {
      "zIndex": 10,
      "position": [-600, -200],
      "scale": [1, 1],
      "name": "stageBack",
      "assetPath": "stages/mainStage/stageback",
      "scroll": [0.9, 0.9],
      "alpha": 1.0,
      "isPixel": false,
      "animType": "sparrow",
      "animations": [],
      "startingAnimation": "",
      "danceEvery": 0
    }
  ],
  "characters": {
    "bf": { "zIndex": 300, "position": [989.5, 885], "cameraOffsets": [-100, -100] },
    "dad": { "zIndex": 200, "position": [335, 885], "cameraOffsets": [150, -100] },
    "gf": { "zIndex": 100, "position": [751.5, 787], "cameraOffsets": [0, 0] }
  }
}
```

______________________________________________________________________

## Psych Engine — JSON (+ optional Lua)

**Location:** `stages/<name>.json` (+ optionally `stages/<name>.lua` for scripted behavior)

```json
{
  "directory": "",
  "defaultZoom": 0.9,
  "boyfriend": [770, 100],
  "girlfriend": [400, 130],
  "opponent": [100, 100],
  "hide_girlfriend": false,
  "camera_boyfriend": [0, 0],
  "camera_opponent": [0, 0],
  "camera_girlfriend": [0, 0],
  "camera_speed": 1
}
```

The stage editor in Psych Engine defines sprites, their positions, and properties directly in the JSON file. A **Lua script** with the same name (`stages/<name>.lua`) can optionally be used for additional scripted behavior.

______________________________________________________________________

## Codename Engine — XML

**Location:** `data/stages/<name>.xml` (+ auto-loaded HScript at `data/stages/<name>.hx`)

```xml
<stage zoom="0.9" name="stage" folder="stages/default/"
       startCamPosX="1000" startCamPosY="600">
    <sprite name="bg" x="-600" y="-200" sprite="stageback" scroll="0.9" zoomFactor="0.3"/>
    <sprite name="stageFront" x="-600" y="600" sprite="stagefront" scroll="0.9"/>
    <girlfriend x="400" y="130"/>
    <dad x="100" y="100" camxoffset="150" scale="1"/>
    <boyfriend x="770" y="100"/>
    <sprite name="stageCurtains" x="-500" y="-300" sprite="stagecurtains" scroll="1.3" alpha="0.9"/>
    <ratings x="500" y="300"/>
</stage>
```

### Stage-Level Attributes

| Attribute        | Description                                      |
| ---------------- | ------------------------------------------------ |
| `zoom`           | Default camera zoom                              |
| `name`           | Display name of the stage                        |
| `folder`         | Parent folder for sprite image paths             |
| `startCamPosX`   | Initial camera X position                        |
| `startCamPosY`   | Initial camera Y position                        |

Any additional attributes beyond these are stored in the stage's `extra` map, accessible from scripts.

### Node Types

| Node                                           | Description                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `<sprite>` / `<spr>` / `<sparrow>`             | Animated or static sprite (requires `name` and `sprite` attrs)                              |
| `<box>` / `<solid>`                            | Colored rectangle (requires `name`, `width`, `height`; optional `color`)                    |
| `<boyfriend>` / `<bf>` / `<player>`            | Player character position                                                                   |
| `<girlfriend>` / `<gf>`                        | GF character position                                                                       |
| `<dad>` / `<opponent>`                         | Opponent character position                                                                 |
| `<character name="">` / `<char name="">`       | Custom named character position                                                             |
| `<ratings>` / `<combo>`                        | Sets combo/rating popup position (`x`, `y` attrs)                                           |
| `<use-extension>` / `<extension>` / `<ext>`    | Import an external HScript into the stage                                                   |
| `<high-memory>`                                | Wrapper — children only load when low-memory mode is **off**                                |
| `<low-memory>`                                 | Wrapper — children only load when low-memory mode is **on**                                 |

### Sprite Attributes (`<sprite>`)

| Attribute          | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| `name`             | Sprite identifier (also used as default image path)        |
| `sprite`           | Image path relative to `folder` (defaults to `name`)       |
| `x`, `y`           | Position                                                   |
| `scroll`           | Scroll factor (both axes)                                  |
| `scrollx`, `scrolly` | Per-axis scroll factor                                  |
| `scale`            | Uniform scale                                              |
| `scalex`, `scaley` | Per-axis scale                                             |
| `alpha`            | Opacity (0–1)                                              |
| `angle`            | Rotation angle                                             |
| `color`            | Color tint (hex string)                                    |
| `flipX`, `flipY`   | Mirror the sprite                                         |
| `antialiasing`     | `"true"` / `"false"` (default true)                        |
| `zoomfactor`       | Camera zoom influence (0 = unaffected, 1 = normal)         |
| `skewx`, `skewy`   | Skew transform                                            |
| `width`, `height`  | Override dimensions                                        |
| `graphicSize`      | Set graphic size (both axes)                               |
| `graphicSizex`, `graphicSizey` | Set graphic size per axis                    |
| `updateHitbox`     | `"true"` to recalculate hitbox after transforms            |
| `type`             | Animation type: `beat`, `loop`, `none`                     |
| `beatInterval` / `interval` | Beats between animation plays                     |
| `beatOffset`       | Beat offset for animation timing                           |
| `playOnCountdown`  | `"true"` to play during countdown                          |
| `applyStageMatrix` | `"true"` to apply stage transform matrix                   |
| `useRenderTexture` | `"true"` to use render texture                             |

Sprites can also contain `<anim>` child nodes for animation definitions, and `<property>` child nodes to set arbitrary object properties (with `name`, `type`, and `value` attributes).

### Character Position Attributes (`<boyfriend>`, `<dad>`, `<girlfriend>`, etc.)

| Attribute          | Description                                    |
| ------------------ | ---------------------------------------------- |
| `x`, `y`           | Position                                       |
| `camxoffset`       | Camera X offset when focused on this character |
| `camyoffset`       | Camera Y offset when focused on this character |
| `scale`            | Uniform scale                                  |
| `scalex`, `scaley` | Per-axis scale                                 |
| `scroll`           | Scroll factor (both axes)                      |
| `scrollx`, `scrolly` | Per-axis scroll factor                      |
| `alpha`            | Opacity                                        |
| `angle`            | Rotation                                       |
| `flipX` / `flip`   | Flip the character                             |
| `zoomfactor`       | Camera zoom influence                          |
| `skewx`, `skewy`   | Skew transform                                |
| `spacingx`         | Horizontal spacing between multiple characters |
| `spacingy`         | Vertical spacing between multiple characters   |

______________________________________________________________________

## Stage Field Mapping

| Concept                | Official Funkin                | Psych Engine                                                    | Codename Engine                            |
| ---------------------- | ------------------------------ | --------------------------------------------------------------- | ------------------------------------------ |
| **Format**             | JSON                           | JSON (+ optional Lua scripts)                                   | XML (+ auto-loaded HScript)                |
| **Camera zoom**        | `cameraZoom`                   | `defaultZoom`                                                   | `zoom` attribute                           |
| **Props/Sprites**      | `props[]` array in JSON        | Defined in JSON via stage editor (Lua for additional scripting) | `<sprite>` / `<spr>` / `<sparrow>` nodes   |
| **Prop z-ordering**    | `zIndex` numeric value         | Defined in JSON / Lua add order                                 | XML node order (top = back)                |
| **Prop scroll factor** | `scroll` [x, y]                | Defined in JSON / Lua `setScrollFactor(tag, x, y)`              | `scroll`/`scrollx`/`scrolly` attrs         |
| **Prop animations**    | `animations[]` in prop         | Defined in JSON / Lua `makeAnimatedLuaSprite`                   | `<anim>` child nodes of `<sprite>`         |
| **Prop dance/beat**    | `danceEvery`                   | Lua scripted                                                    | `beatInterval`/`interval`, `type="beat"`   |
| **BF position**        | `characters.bf.position`       | `boyfriend` [x, y]                                              | `<boyfriend x="" y=""/>`                   |
| **Dad position**       | `characters.dad.position`      | `opponent` [x, y]                                               | `<dad x="" y=""/>`                         |
| **GF position**        | `characters.gf.position`       | `girlfriend` [x, y]                                             | `<girlfriend x="" y=""/>`                  |
| **BF camera offset**   | `characters.bf.cameraOffsets`  | `camera_boyfriend` [x, y]                                       | `<boyfriend camxoffset="" camyoffset=""/>` |
| **Dad camera offset**  | `characters.dad.cameraOffsets` | `camera_opponent` [x, y]                                        | `<dad camxoffset="" camyoffset=""/>`       |
| **Hide GF**            | Omit gf / empty gf char        | `hide_girlfriend` bool                                          | Omit `<girlfriend/>` node                  |
| **Solid/colored box**  | Color hex in `assetPath`       | Lua `makeGraphic`                                               | `<solid>` / `<box>` node                   |
| **Stage folder**       | Images rel. to `images/`       | `directory` field                                               | `folder` attribute                         |
| **Start camera pos**   | Not explicit                   | Not explicit                                                    | `startCamPosX`, `startCamPosY`             |
| **Character z-index**  | `characters.<char>.zIndex`     | Lua add order                                                   | XML node order                             |
| **Character scale**    | `characters.<char>.scale`      | Not in JSON (Lua scripted)                                      | `scale`/`scalex`/`scaley` on char nodes    |
| **Character scroll**   | Not configurable               | Not configurable                                                | `scroll`/`scrollx`/`scrolly` on char nodes |
| **Character flip**     | Not per-stage                  | Not per-stage                                                   | `flipX`/`flip` on char nodes               |
| **Character alpha**    | Not per-stage                  | Not per-stage                                                   | `alpha` on char nodes                      |
| **Sprite zoom factor** | Not configurable               | Not configurable                                                | `zoomfactor` attr on sprites/char nodes    |
| **Sprite skew**        | Not configurable               | Not configurable                                                | `skewx`, `skewy` on sprites/char nodes     |
| **Sprite alpha**       | `alpha` in prop                | Lua `setProperty(tag, 'alpha', v)`                              | `alpha` attr on `<sprite>`                 |
| **Sprite flipX**       | `flipX` in prop                | Lua `setProperty`                                               | `flipX` attr on `<sprite>`                 |
| **Prop properties**    | Inline in JSON                 | Lua `setProperty`                                               | `<property name="" type="" value="">` child |
| **Ratings position**   | Not configurable               | Not configurable                                                | `<ratings x="" y=""/>` / `<combo>` node    |
| **Custom char slots**  | Fixed (bf, dad, gf)            | Fixed (bf, dad, gf)                                             | `<character name="">` for extra slots      |
| **Memory modes**       | N/A                            | N/A                                                             | `<high-memory>` / `<low-memory>` wrappers  |
| **Script extensions**  | N/A                            | N/A                                                             | `<use-extension>` / `<ext>` nodes          |
| **Custom attributes**  | N/A                            | N/A                                                             | Extra attrs stored in `stage.extra` map    |
