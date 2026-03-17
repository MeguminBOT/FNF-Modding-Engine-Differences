# Cross-Engine Conversion Guide

Use the [API Reference](reference/index.md) pages for detailed class, callback, and function mappings when converting between engines. The [Cross-Engine Class Map](reference/classes-map.md) and [Cross-Engine Callbacks](reference/callbacks-map.md) are particularly useful for script conversion.

## Psych Engine → Official Funkin

| Component                  | Notes                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Charts**                 | Remap note directions (mustHitSection logic), split into metadata + chart, convert BPM sections to timeChanges                                                                       |
| **Characters**             | Field rename (anim→name, name→prefix, fps→frameRate, etc.), healthbar_colors has no equivalent                                                                                       |
| **Stages**                 | JSON positions map directly, but Lua visual props must be manually converted to JSON `props[]`                                                                                       |
| **Weeks**                  | Structural remap, songs array format change, visibility logic inversion                                                                                                              |
| **Scripts (Lua)**          | Lua → HScript rewrite, tag-based system → direct object references, 212 Lua functions need mapping                                                                                   |
| **Scripts (HScript Iris)** | Already Haxe-like syntax; remove `game.` prefix, adjust imports, adapt callback signatures (Psych passes full objects, Funkin passes full objects too but different class hierarchy) |
| **Events**                 | Some name mappings exist, Psych 2-value events → Funkin structured event values                                                                                                      |
| **Audio**                  | Rename/restructure, may need to split combined Voices.ogg                                                                                                                            |

## Psych Engine → Codename Engine

| Component                  | Notes                                                                                                                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Charts**                 | Section-based → strumline-based, Codename can import legacy FNF charts                                                                                                                  |
| **Characters**             | JSON → XML conversion, field mapping (anim→name attr, name→anim attr)                                                                                                                   |
| **Stages**                 | Lua visual code → XML nodes, but both support similar sprite properties                                                                                                                 |
| **Weeks**                  | JSON → XML conversion, structural remap                                                                                                                                                 |
| **Scripts (Lua)**          | Lua → HScript, Codename HScript is closer to source, event-object based callbacks                                                                                                       |
| **Scripts (HScript Iris)** | Both use HScript with direct object access; main changes: `game.` → direct access, `Function_Stop` → `event.cancel()`, no `parentLua`/interop APIs, Codename supports class definitions |
| **Events**                 | Need JSON param definition + HScript handler per custom event                                                                                                                           |
| **Audio**                  | Move to `songs/<name>/song/` subfolder                                                                                                                                                  |

## Official Funkin → Codename Engine

| Component      | Notes                                                                |
| -------------- | -------------------------------------------------------------------- |
| **Charts**     | JSON note format → Codename chart format, metadata split differently |
| **Characters** | JSON → XML, mostly field renaming                                    |
| **Stages**     | JSON props → XML sprite nodes, similar concepts different syntax     |
| **Weeks**      | JSON → XML                                                           |
| **Scripts**    | Both use HScript with direct object access, minor API differences    |
| **Events**     | Chart-embedded → separate JSON+HScript event files                   |
| **Audio**      | Different subfolder structure                                        |
