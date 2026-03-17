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

### Song Metadata — `songs/<song>/meta.json`

Contains BPM, time signature, display name, and other song properties.

______________________________________________________________________

## Chart Format Comparison

| Aspect                | Official Funkin                           | Psych Engine                               | Codename Engine                         |
| --------------------- | ----------------------------------------- | ------------------------------------------ | --------------------------------------- |
| **File split**        | metadata + chart (2 files)                | Single file                                | meta.json + per-difficulty chart files  |
| **Note structure**    | `{t, d, l, k}` objects                    | `[time, data, sustain, type?]` arrays      | Strumline-based                         |
| **Direction mapping** | 0-3 player, 4-7 opponent (fixed)          | Depends on `mustHitSection`                | Per-strumline                           |
| **Section concept**   | No sections                               | Section-based (`mustHitSection`)           | No sections (`curCameraTarget` instead) |
| **BPM changes**       | `timeChanges` array in metadata           | `changeBPM` flag per section               | Events (`BPM Change` event)             |
| **Events storage**    | In chart JSON                             | In chart JSON (separate `events` array)    | Separate per-event-type files           |
| **Scroll speed**      | Per-difficulty in chart                   | Single `speed` value                       | Per-difficulty in chart                 |
| **Characters**        | In metadata `playData.characters`         | In chart `player1`, `player2`, `gfVersion` | In meta.json / chart editor             |
| **Difficulties**      | Listed in metadata, separate `notes` keys | Separate files per difficulty              | Separate files per difficulty           |
