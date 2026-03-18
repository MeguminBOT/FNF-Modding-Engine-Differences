# Week / Level Data Format

## Official Funkin — JSON

**Location:** `data/levels/<name>.json`

```json
{
  "version": "1.0.1",
  "name": "DADDY DEAREST",
  "titleAsset": "storymenu/titles/week1",
  "background": "#F9CF51",
  "songs": ["bopeebo", "fresh", "dad-battle"],
  "visible": true,
  "props": [
    {
      "assetPath": "storymenu/props/dad",
      "scale": 1.0,
      "alpha": 1.0,
      "isPixel": false,
      "danceEvery": 1.0,
      "flipX": false,
      "offsets": [100, 60],
      "animations": [
        { "name": "idle", "prefix": "idle0", "frameRate": 24 },
        { "name": "confirm", "prefix": "confirm0", "frameRate": 24 }
      ],
      "startingAnimation": ""
    }
  ]
}
```

______________________________________________________________________

## Psych Engine — JSON

**Location:** `weeks/<name>.json`

```json
{
  "songs": [
    ["Bopeebo", "dad", [146, 113, 253]],
    ["Fresh", "dad", [146, 113, 253]],
    ["Dad Battle", "dad", [146, 113, 253]]
  ],
  "weekCharacters": ["", "bf", "gf"],
  "weekBackground": "stage",
  "weekBefore": "tutorial",
  "storyName": "DADDY DEAREST",
  "weekName": "Week 1",
  "startUnlocked": true,
  "hiddenUntilUnlocked": false,
  "hideStoryMode": false,
  "hideFreeplay": false,
  "difficulties": ""
}
```

______________________________________________________________________

## Codename Engine — XML

**Location:** `data/weeks/weeks/<name>.xml`

```xml
<week name="DADDY DEAREST" chars="dad,bf,gf" sprite="week1">
    <song>Bopeebo</song>
    <song>Fresh</song>
    <song>Dad Battle</song>
    <difficulty name="Easy"/>
    <difficulty name="Normal"/>
    <difficulty name="Hard"/>
</week>
```

______________________________________________________________________

## Week/Level Field Mapping

| Concept                 | Official Funkin                                 | Psych Engine                                                 | Codename Engine                     |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------------ | ----------------------------------- |
| **Format**              | JSON                                            | JSON                                                         | XML                                 |
| **Display name**        | `name`                                          | `storyName`                                                  | `name` attribute                    |
| **Song list**           | `songs[]` (string IDs)                          | `songs[]` (arrays: [name, icon, color])                      | `<song>` child nodes                |
| **Menu characters**     | `props[]` with animation data                   | `weekCharacters` [3 strings]                                 | `chars` attribute (comma-separated) |
| **Background**          | `background` (color hex or image path)          | `weekBackground` (string)                                    | Via `sprite` attribute              |
| **Title image**         | `titleAsset` (image path)                       | Auto from week filename                                      | `sprite` attribute                  |
| **Visibility**          | `visible` bool                                  | `hideStoryMode` / `hideFreeplay`                             | Present = visible                   |
| **Unlock order**        | Implicit by level order                         | `weekBefore`, `startUnlocked`, `hiddenUntilUnlocked`         | Implicit (via `weeks.txt` ordering) |
| **Difficulties**        | Listed in song metadata `playData.difficulties` | `difficulties` string (comma-separated or empty for default) | `<difficulty>` child nodes          |
| **Week ordering**       | Order of JSON files discovered                  | `weekBefore` chaining                                        | `weeks.txt` file                    |
| **Per-song icon/color** | Not in level data                               | Per-song in `songs` array `[name, icon, [r,g,b]]`            | Not in week data                    |
