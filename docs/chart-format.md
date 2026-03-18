# Chart / Song Data Format

## Official Funkin

Charts are split into two files per song:

### Metadata — `<songid>-metadata.json`

```json
{
  "version": "2.2.4",
  "songName": "Bopeebo",
  "artist": "Kawai Sprite",
  "charter": "ninjamuffin99",
  "playData": {
    "difficulties": ["easy", "normal", "hard"],
    "characters": {
      "player": "bf",
      "opponent": "dad",
      "girlfriend": "gf"
    },
    "stage": "mainStage",
    "noteStyle": "funkin",
    "ratings": { "default": 0 }
  },
  "timeFormat": "ms",
  "timeChanges": [
    { "t": 0, "bpm": 100, "n": 4, "d": 4, "bt": [4, 4, 4, 4] }
  ]
}
```

### Chart Data — `<songid>-chart.json`

```json
{
  "version": "2.1.0",
  "scrollSpeed": { "default": 1.0 },
  "notes": {
    "default": [
      { "t": 1000, "d": 0, "l": 0, "k": "" }
    ]
  },
  "events": [
    { "t": 2000, "e": "FocusCamera", "v": { "char": 1 } }
  ]
}
```

### Note Encoding

- `t` = time in ms
- `d` = direction (0-3 = player, 4-7 = opponent)
- `l` = sustain length in ms
- `k` = note kind/type (optional string)

______________________________________________________________________

## Psych Engine

Single chart file per song/difficulty:

### Chart File — `<Song>.json`

```json
{
  "song": {
    "song": "Bopeebo",
    "bpm": 100,
    "speed": 1.0,
    "needsVoices": true,
    "player1": "bf",
    "player2": "dad",
    "gfVersion": "gf",
    "stage": "stage",
    "notes": [
      {
        "sectionNotes": [
          [1000, 0, 0],
          [1500, 5, 200, "Alt Animation"]
        ],
        "mustHitSection": true,
        "altAnim": false,
        "gfSection": false,
        "bpm": 100,
        "changeBPM": false,
        "lengthInSteps": 16
      }
    ],
    "events": [
      [2000, [["Hey!", "BF", "0.6"]]]
    ]
  }
}
```

### Note Encoding

- `[strumTimeMs, noteData, sustainLengthMs, noteType?]`
- `noteData` 0-3 and 4-7 meaning depends on `mustHitSection`:
    - `mustHitSection: true` → 0-3 = player, 4-7 = opponent
    - `mustHitSection: false` → 0-3 = opponent, 4-7 = player

______________________________________________________________________

## Codename Engine

Per-difficulty chart files stored under the song folder:

### Chart File — `songs/<song>/charts/<difficulty>.json`

Codename Engine uses its own internal chart format with strumline-based note assignment (no `mustHitSection`). Notes belong to specific strumlines directly. The chart editor handles conversion from legacy FNF format automatically.

```json
{
  "strumLines": [
    {
      "position": "dad",
      "type": 0,
      "characters": ["dad"],
      "visible": true,
      "strumScale": 1,
      "strumLinePos": 0.25,
      "strumPos": [0, 50],
      "vocalsSuffix": "",
      "notes": [
        { "id": 3, "sLen": 0, "time": 19200, "type": 0 },
        { "id": 1, "sLen": 1350, "time": 19800, "type": 0 }
      ]
    },
    {
      "position": "boyfriend",
      "type": 1,
      "characters": ["bf"],
      "visible": true,
      "strumScale": 1,
      "strumLinePos": 0.75,
      "strumPos": [0, 50],
      "vocalsSuffix": "",
      "notes": [
        { "id": 2, "sLen": 0, "time": 28800, "type": 0 }
      ]
    }
  ],
  "codenameChart": true,
  "scrollSpeed": 1.5,
  "stage": "stage",
  "noteTypes": [],
  "events": [
    { "name": "Camera Movement", "params": [0], "time": 0 }
  ]
}
```

### Note Encoding

- `id` = direction (0-3, within the strumline)
- `sLen` = sustain length in ms
- `time` = time in ms
- `type` = note type index (0 = normal, indexes into `noteTypes` array)

### Strumline Fields

- `position` = stage character slot (`"dad"`, `"boyfriend"`, `"girlfriend"`)
- `type` = strumline type (0 = opponent, 1 = player, 2 = other/GF)
- `characters` = array of character names assigned to this strumline
- `vocalsSuffix` = suffix for vocal file (e.g. `"_Opponent"` loads `Voices_Opponent.ogg`)
- `strumLinePos` = horizontal position (0.0-1.0, e.g. 0.25 = left, 0.75 = right)
- `strumScale` = note scale multiplier
- `visible` = whether this strumline is visible

### Song Metadata — `songs/<song>/meta.json`

Contains BPM, time signature, display name, and other song properties.

```json
{
  "name": "bopeebo",
  "displayName": "Bopeebo",
  "bpm": 100,
  "stepsPerBeat": 4,
  "beatsPerMeasure": 4,
  "needsVoices": true,
  "icon": "dad",
  "color": "#9271FD",
  "difficulties": ["hard"],
  "opponentModeAllowed": false,
  "coopAllowed": false
}
```

Events can also be stored in a separate `songs/<song>/events.json` file rather than inline in the chart.

______________________________________________________________________

## Chart Format Comparison

| Aspect                | Official Funkin                           | Psych Engine                               | Codename Engine                         |
| --------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------- |
| **File split**        | metadata + chart (2 files)                | Single file                                | meta.json + per-difficulty chart files  |
| **Note structure**    | `{t, d, l, k}` objects                    | `[time, data, sustain, type?]` arrays      | Strumline-based                         |
| **Direction mapping** | 0-3 player, 4-7 opponent (fixed)          | Depends on `mustHitSection`                | Per-strumline                           |
| **Section concept**   | No sections                               | Section-based (`mustHitSection`)           | No sections (`curCameraTarget` instead) |
| **BPM changes**       | `timeChanges` array in metadata           | `changeBPM` flag per section               | Events (`BPM Change` event)             |
| **Events storage**    | In chart JSON                             | In chart JSON (separate `events` array)    | In chart JSON, or separate `events.json` per song |
| **Scroll speed**      | Per-difficulty in chart                   | Single `speed` value                       | Per-difficulty in chart                 |
| **Characters**        | In metadata `playData.characters`         | In chart `player1`, `player2`, `gfVersion` | In meta.json / chart editor             |
| **Difficulties**      | Listed in metadata, separate `notes` keys | Separate files per difficulty              | Separate files per difficulty           |
