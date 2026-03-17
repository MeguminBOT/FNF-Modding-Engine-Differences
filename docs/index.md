# Friday Night Funkin' — Engine Modding API Differences

!!! warning "Work in Progress"
    This documentation is a work in progress and may not be updated regularly. It's up to the community to help improve and maintain this resource. If you find any errors or outdated information, please open an issue or submit a pull request!

A comprehensive comparison of modding APIs and data formats across three major Friday Night Funkin' engines.

This is not a step-by-step porting tutorial — rather, it's a reference to help modders understand the differences between engines, whether you're coming from another engine or considering porting your work. A basic understanding of programming is assumed, but this should be useful to both newcomers and experienced modders alike.

This page also provide interactive conversion tools that can convert various data files between engines. You can find them under the **Tools** tab. Keep in mind that the results are provided as-is and may not always produce a working file — differences in how each engine handles certain features mean that some manual adjustments may still be needed after conversion.

## Engines Covered

| Engine                                                                | Version        | Status                |
| --------------------------------------------------------------------- | -------------- | --------------------- |
| [**Official Funkin**](https://github.com/FunkinCrew/Funkin)           | v0.8.x+        | Active development    |
| [**Psych Engine**](https://github.com/ShadowMario/FNF-PsychEngine)    | v1.0.4 (final) | Archived (March 2025) |
| [**Codename Engine**](https://github.com/CodenameCrew/CodenameEngine) | v1.0.x         | Active development    |

## What's Covered

- [Engine Overview](engine-overview.md) — High-level comparison of each engine
- [Mod Folder Structure](mod-folder-structure.md) — Directory layouts and metadata
- **Data Formats** — How each engine stores game data:
    - [Chart / Song Format](chart-format.md)
    - [Character Format](character-format.md)
    - [Stage Format](stage-format.md)
    - [Week / Level Format](week-format.md)
- [Audio Conventions](audio-conventions.md) — Audio file naming and structure
- **Scripting** — How to write mod scripts:
    - [Scripting System](scripting-system.md) — Language overview and philosophy
    - [Script Callbacks](script-callbacks.md) — Available callback functions
    - [Common Patterns](scripting-patterns.md) — Code examples for common tasks
    - [Psych Lua ↔ HScript Interop](lua-hscript-interop.md) — Psych Engine's dual-language system
- **Gameplay** — Events, notes, and UI:
    - [Events System](events-system.md)
    - [Note Types](note-types.md)
    - [Health Icons](health-icons.md)
- [Additional Features](additional-features.md) — Dialogue, video, shaders, and more
- [Cross-Engine Conversion](cross-engine-conversion.md) — Guides for porting between engines

## References

- [Official Funkin Modding Docs](https://funkincrew.github.io/funkin-modding-docs/)
- [Official Funkin Source](https://github.com/FunkinCrew/Funkin)
- [Psych Engine Source](https://github.com/ShadowMario/FNF-PsychEngine)
- [Psych Engine Lua API](https://shadowmario.github.io/psychengine.lua/)
- [Codename Engine Source](https://github.com/CodenameCrew/CodenameEngine)
- [Codename Engine Wiki](https://codename-engine.com/wiki/)
- [Codename Engine API Docs](https://codename-engine.com/api-docs/)

---

*This site was made with AI assistance. While the content has been reviewed, there may be inaccuracies. If you spot any issues, please [open an issue](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new/choose).*
