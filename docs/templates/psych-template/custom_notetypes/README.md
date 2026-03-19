# custom_notetypes/

Custom note type scripts. Each `.lua` (or `.hx`) file here defines a custom note type usable in charts.

The filename becomes the note type name — e.g., `Fire Note.lua` creates a note type called "Fire Note".

## Example note type script

```lua
-- custom_notetypes/Fire Note.lua

function onCreate()
    -- Called when the script loads
    -- Precache any assets needed for this note type
    precacheImage('fireNoteTexture')
end

function goodNoteHit(id, direction, noteType, isSustainNote)
    if noteType == 'Fire Note' then
        -- Player hit the note
        setHealth(getHealth() - 0.3)  -- Drain health on hit
    end
end

function noteMiss(id, direction, noteType, isSustainNote)
    if noteType == 'Fire Note' then
        -- Player missed the note (might be beneficial!)
        setHealth(getHealth() + 0.1)
    end
end

function opponentNoteHit(id, direction, noteType, isSustainNote)
    if noteType == 'Fire Note' then
        -- Opponent hit the note
    end
end
```

## Relevant callbacks

| Callback | When it fires |
|----------|---------------|
| `goodNoteHit(id, dir, noteType, isSustain)` | Player hits a note of this type |
| `noteMiss(id, dir, noteType, isSustain)` | Player misses a note of this type |
| `opponentNoteHit(id, dir, noteType, isSustain)` | Opponent hits a note of this type |
| `noteMissPress(direction)` | Player presses a key with no note (ghost tap) |
