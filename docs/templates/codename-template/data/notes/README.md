# data/notes/

Custom note type scripts. Each `.hx` file defines behavior for a custom note type.

The filename becomes the note type name referenced in chart data (via the `noteTypes` array).

## Callbacks

| Callback | Fires When |
|----------|-----------|
| `onNoteCreation(event)` | Note is created — customize appearance |
| `onPlayerHit(event)` | Player hits the note |
| `onPlayerMiss(event)` | Player misses the note |

## Example

```haxe
// data/notes/Fire Note.hx

function onNoteCreation(event) {
    if (event.noteType != "Fire Note") return;

    // Customize note appearance
    var note = event.note;
    note.loadGraphic(Paths.image('game/notes/fire_note'), true, 17, 17);
    note.animation.add("scroll", [event.strumID]);
    note.scale.set(1, 1);
    note.updateHitbox();
}

function onPlayerHit(event) {
    if (event.noteType != "Fire Note") return;
    health -= 0.3;  // Drain health on hit
}

function onPlayerMiss(event) {
    if (event.noteType != "Fire Note") return;
    // Custom miss behavior
}
```

### Event properties

`onNoteCreation` event fields:
- `event.note` — the Note object
- `event.noteType` — note type name (String)
- `event.strumID` — strum index (0–3)
- `event.mustHit` — whether this is a player note

`onPlayerHit` / `onPlayerMiss` event fields:
- `event.note` — the Note object
- `event.noteType` — note type name
- `event.cancel()` — cancel default behavior
