# Scripting System

## Official Funkin — HScript Modules (.hxs)

- Based on Haxe syntax via Polymod's scripting integration
- Scripts placed in `scripts/` or registered via modules
- Direct access to game classes (e.g., `PlayState.instance`)
- Strong HaxeFlixel integration
- Optional typing

## Psych Engine — Lua (.lua) + HScript Iris (.hx)

Psych Engine offers **two scripting languages** that can be used independently or together.

### Lua (Primary — `.lua`)

- Custom API of 212+ wrapper functions across 22 categories
- String-tag-based sprite/object management
- Reflection-based property access (`getProperty`, `setProperty`)
- Function return values control execution flow (`Function_Stop`, `Function_Continue`)
- **Higher callback priority** — Lua scripts execute before HScript scripts
- 6 script types: Stage, Note Type, Event, Song, Character, Global

### HScript Iris (Secondary — `.hx`)

- Uses `hscript-iris` v1.1.3 library (by crowplexus) wrapping the Haxe interpreter
- **Direct Haxe object access** — no string tags or wrapper functions needed
- `game` variable points to `FlxG.state` (PlayState); all PlayState fields accessible directly
- Pre-set classes: `FlxG`, `FlxSprite`, `FlxTween`, `FlxEase`, `FlxMath`, `FlxTimer`, `FlxCamera`, `FlxText`, `PlayState`, `Paths`, `Conductor`, `Character`, `Note`, `Alphabet`, `FlxRuntimeShader`, etc.
- `import` statements and `addHaxeLibrary()` to access additional classes at runtime
- Callbacks receive **full typed objects** (e.g., `goodNoteHit(note:Note)`) instead of decomposed primitives
- **Lower callback priority** — executes after all Lua scripts
- **Cannot define custom classes** (unlike Codename Engine)
- Same 6 script types as Lua, placed in the same directories
- Loading Screen scripts (`LoadingScreen.hx`) are **HScript-exclusive** (Lua too slow to init)
- Full bidirectional interop with Lua via `runHaxeCode`, `runHaxeFunction`, `createGlobalCallback`

## Codename Engine — HScript Improved (.hx)

- Custom fork of HScript with improvements
- Haxe-like syntax, closest to source coding without source access
- Event-based callback system with cancellable events
- Direct object access (no string tags or reflection wrappers)
- Supports custom classes, enums, static extensions, property fields
- Script types: Gameplay, Character, Stage, Event/NoteType, Global, State/Substate, Transition, Dialogue, Custom

## Scripting Philosophy Comparison

| Aspect                 | Official Funkin                       | Psych Engine (Lua)                                 | Psych Engine (HScript Iris)                   | Codename Engine                       |
| ---------------------- | ------------------------------------- | -------------------------------------------------- | --------------------------------------------- | ------------------------------------- |
| **Language**           | HScript (.hxs)                        | Lua (.lua)                                         | HScript Iris (.hx)                            | HScript Improved (.hx)                |
| **Library**            | Polymod HScript sandbox               | LuaJIT                                             | `hscript-iris` v1.1.3                         | Custom `hscript-improved` fork        |
| **Typing**             | Optional Haxe types                   | Dynamic (Lua)                                      | Optional Haxe types                           | Optional Haxe types                   |
| **Object access**      | Direct field access                   | String-tag reflection API                          | Direct field access via `game.*`              | Direct field access (injected)        |
| **Sprite creation**    | `new FlxSprite(x,y).loadGraphic(...)` | `makeLuaSprite(tag, image, x, y)`                  | `new FlxSprite(x,y).loadGraphic(...)`         | `new FlxSprite(x,y).loadGraphic(...)` |
| **Property get/set**   | `obj.property = value`                | `getProperty("prop")` / `setProperty("prop", val)` | `game.property = value`                       | `obj.property = value`                |
| **Callback args**      | Full objects                          | Decomposed primitives                              | **Full typed objects** (e.g., `note:Note`)    | Event objects                         |
| **Callback priority**  | N/A                                   | Higher (executes first)                            | Lower (executes after Lua)                    | N/A (only system)                     |
| **Event cancellation** | Return values / custom                | `Function_Stop`, `Function_StopLua`, etc.          | `Function_Stop`, `Function_StopHScript`, etc. | `event.cancel()` on event objects     |
| **Class definitions**  | Extends base classes                  | Not available                                      | **Not available**                             | Full custom class support             |
| **Enums**              | Not available                         | Not available                                      | Not available                                 | Supported                             |
| **Abstract types**     | Supported                             | N/A                                                | **Need wrappers** (`CustomFlxColor`)          | Supported                             |
| **Import system**      | `import` via Polymod                  | N/A                                                | `import` + `addHaxeLibrary()`                 | Native `import`                       |
| **Interop**            | N/A                                   | Can embed HScript via `runHaxeCode`                | Can create Lua-callable functions             | N/A                                   |
| **IDE support**        | Limited                               | VS Code extension (unofficial)                     | Follows Haxe conventions                      | Follows Haxe conventions              |
