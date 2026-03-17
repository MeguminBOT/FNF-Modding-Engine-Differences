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

**Location:** `data/stages/<name>.xml`

```xml
<stage zoom="0.9" name="stage" folder="stages/default/"
       startCamPosX="1000" startCamPosY="600">
    <sprite name="bg" x="-600" y="-200" sprite="stageback" scroll="0.9"/>
    <sprite name="stageFront" x="-600" y="600" sprite="stagefront" scroll="0.9"/>
    <girlfriend/>
    <dad/>
    <boyfriend/>
    <sprite name="stageCurtains" x="-500" y="-300" sprite="stagecurtains" scroll="1.3"/>
</stage>
```

______________________________________________________________________

## Stage Field Mapping

| Concept                | Official Funkin                | Psych Engine                                                    | Codename Engine                            |
| ---------------------- | ------------------------------ | --------------------------------------------------------------- | ------------------------------------------ |
| **Format**             | JSON                           | JSON (+ optional Lua scripts)                                   | XML (+ HScript extensions)                 |
| **Camera zoom**        | `cameraZoom`                   | `defaultZoom`                                                   | `zoom` attribute                           |
| **Props/Sprites**      | `props[]` array in JSON        | Defined in JSON via stage editor (Lua for additional scripting) | `<sprite>` XML nodes                       |
| **Prop z-ordering**    | `zIndex` numeric value         | Defined in JSON / Lua add order                                 | XML node order (top = back)                |
| **Prop scroll factor** | `scroll` [x, y]                | Defined in JSON / Lua `setScrollFactor(tag, x, y)`              | `scroll`/`scrollx`/`scrolly` attrs         |
| **Prop animations**    | `animations[]` in prop         | Defined in JSON / Lua `makeAnimatedLuaSprite`                   | `<anim>` child nodes of `<sprite>`         |
| **Prop dance/beat**    | `danceEvery`                   | Lua scripted                                                    | `beatInterval`, `type="beat"`              |
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
| **Ratings position**   | Not configurable               | Not configurable                                                | `<ratings x="" y=""/>` node                |
