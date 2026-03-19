# scripts/

Global scripts that run during **every** gameplay session, regardless of which song is playing.

Place `.lua` or `.hx` files here for functionality that should always be active (e.g., custom HUD elements, keybind systems, visual effects).

## Example global script

```lua
-- scripts/customHUD.lua

function onCreate()
    -- Setup runs once when gameplay starts
    makeLuaText('myText', 'Score Multiplier: 1x', 300, 10, 10)
    setObjectCamera('myText', 'camHUD')
    addLuaText('myText')
end

function onUpdate(elapsed)
    -- Runs every frame
end

function onSongStart()
    -- Song audio begins playing
end

function onCountdownTick(tick)
    -- Countdown step (0 = ready, 1 = set, 2 = go, 3 = start)
end
```

## Script loading order

1. Global scripts (`scripts/`) load first
2. Stage script loads
3. Song-specific scripts (`data/<Song>/script.lua`) load
4. Character scripts load
5. Note type and event scripts load as needed

All Lua scripts execute before HScript scripts at each callback.
