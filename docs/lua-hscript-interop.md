# Psych Engine: Lua ↔ HScript Interop

Psych Engine is unique in offering **bidirectional communication** between its two scripting systems. This is not applicable to Official Funkin or Codename Engine (which each have only one scripting language). For the complete Lua function reference, see the [Psych Engine Lua API Reference](reference/psych-lua-api.md).

## From Lua → HScript

```lua
-- Run inline HScript code from within a Lua script
-- (Creates a per-Lua HScript interpreter if one doesn't exist)
runHaxeCode([[
    game.boyfriend.color = 0xFFFF0000;

    function myCustomFunction(value) {
        game.boyfriend.x = value;
    }
]])

-- Call a function defined in a previous runHaxeCode block
runHaxeFunction('myCustomFunction', {500})

-- Import additional classes into the Lua's embedded HScript interpreter
addHaxeLibrary('FlxMath', 'flixel.math')

-- Add/remove standalone .hx script files at runtime
addHScript('scripts/myScript.hx')
removeHScript('scripts/myScript.hx')

-- Set a variable on all HScript instances only
setOnHScript('myVar', 42)

-- Call a function on all HScript instances only
callOnHScript('myCallback', {arg1, arg2})
```

## From HScript → Lua

```haxe
// Create a function callable from ALL Lua scripts
createGlobalCallback('myGlobalFunc', function(arg1:Dynamic) {
    return arg1 * 2;
});

// Create a callback on a specific Lua script (when embedded via runHaxeCode)
createCallback('myFunc', function() {
    trace('called from Lua!');
}, parentLua);

// Access the parent Lua script instance (only available when embedded via runHaxeCode)
parentLua; // reference to the FunkinLua instance
```

## Shared Variable System

Both Lua and HScript share a variable pool via `MusicBeatState.getVariables()`:

```lua
-- Lua: set a shared variable
setVar('sharedData', 42)
```

```haxe
// HScript: read the same variable
var data = getVar('sharedData'); // returns 42
setVar('fromHScript', 'hello'); // Lua can read this with getVar
```

## Cross-Script Function Calls

```lua
-- From Lua: call a function on ALL scripts (Lua + HScript)
callOnScripts('customFunc', {1, 2, 3})

-- From Lua: call on HScripts only
callOnHScript('hscriptOnly', {arg1})
```

## Flow Control Constants

Both systems use the same constants to control callback propagation:

| Constant               | Effect                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| `Function_Continue`    | Normal execution, continue to next script                        |
| `Function_Stop`        | Cancel the operation (e.g., prevent countdown, pause, game over) |
| `Function_StopLua`     | Stop propagation to remaining Lua scripts only                   |
| `Function_StopHScript` | Stop propagation to remaining HScript scripts only               |
| `Function_StopAll`     | Stop propagation to both Lua and HScript scripts                 |

## Pre-Set Classes in HScript Iris

The following classes are available in HScript Iris scripts without needing `import` or `addHaxeLibrary`:

| Category                 | Classes                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Core Haxe**            | `Type`, `File`, `FileSystem`, `StringTools`                                                                        |
| **Flixel**               | `FlxG`, `FlxSprite`, `FlxCamera`, `FlxText`, `FlxMath`, `FlxTimer`, `FlxTween`, `FlxEase`                          |
| **Flixel (via wrapper)** | `FlxColor` → `CustomFlxColor` (abstracts don't work in HScript)                                                    |
| **Psych Engine**         | `PlayState`, `Paths`, `Conductor`, `ClientPrefs`, `Character`, `Note`, `Alphabet`, `CustomSubstate`, `PsychCamera` |
| **Shaders**              | `FlxRuntimeShader`, `ErrorHandledRuntimeShader`, `ShaderFilter`                                                    |
| **Animation**            | `FlxAnimate` (if available)                                                                                        |
| **Enums**                | `Countdown` (from `BaseStage`)                                                                                     |
| **Convenience vars**     | `game` (= `FlxG.state`), `controls` (= `Controls.instance`), `this` (= HScript instance)                           |

## HScript Iris Limitations vs Codename/Funkin HScript

| Limitation                       | Detail                                                               |
| -------------------------------- | -------------------------------------------------------------------- |
| **No class definitions**         | Cannot write `class MyClass { }` — only functions and variables      |
| **No enum definitions**          | Cannot define enums, only use pre-registered ones                    |
| **Abstract types need wrappers** | `FlxColor` exposed as `CustomFlxColor` with color constants as `Int` |
| **Lower callback priority**      | Always executes after all Lua scripts                                |

See [Script Callbacks](script-callbacks.md) for the full cross-engine callback comparison and [Cross-Engine Callbacks Reference](reference/callbacks-map.md) for expanded detail on every callback.
