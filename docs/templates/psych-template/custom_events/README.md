# custom_events/

Custom event scripts. Each `.lua` (or `.hx`) file here defines a custom event that can be placed in the chart editor.

The filename becomes the event name — e.g., `My Cool Event.lua` creates an event called "My Cool Event".

## Example event script

```lua
-- custom_events/My Cool Event.lua

function onEvent(name, value1, value2)
    if name == 'My Cool Event' then
        -- value1 and value2 are strings from the chart editor
        -- Do something when this event triggers
    end
end
```

## Callback reference

| Callback | When it fires |
|----------|---------------|
| `onEvent(name, value1, value2)` | When the event triggers during gameplay |
| `onCreate()` | When the script loads |
| `onDestroy()` | When the script unloads |

Events placed in the chart editor have two string value fields. Parse them in your script as needed (e.g., `tonumber(value1)` for numeric values).
