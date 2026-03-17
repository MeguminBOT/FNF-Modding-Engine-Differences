# API Reference Data

This section contains the complete, structured mapping data extracted from all three FNF engine source codes. Use these references for building your own tools, understanding API differences, or looking up specific function signatures.

## Reference Pages

| Page | Description |
|------|-------------|
| [Cross-Engine Class Map](classes-map.md) | Side-by-side class equivalences for Conductor, PlayState, Character, Note, Strumline, and more |
| [Cross-Engine Callbacks](callbacks-map.md) | Complete callback/event mapping across all three engines |
| [Psych Engine Lua API](psych-lua-api.md) | Full Psych Engine Lua function registry (250+ functions), global variables, and callbacks |
| [Codename Engine Events](codename-events.md) | Codename Engine event classes, script types, and callback system |
| [Official Funkin Events](official-events.md) | Official Funkin (V-Slice) ScriptEvent types, Scripted* classes, interfaces, and modules |

## Raw Data Downloads

The raw data files are available for download and programmatic use. You can use these directly in your own conversion tools or scripts.

### JSON

| File | Contents | Download |
|------|----------|----------|
| `classes-map.json` | Cross-engine class equivalences (12 classes) | [Download](../js/engine-data/classes-map.json) |
| `callbacks-map.json` | Cross-engine callback mappings (50+ callbacks) | [Download](../js/engine-data/callbacks-map.json) |
| `psych-lua-api.json` | Psych Engine Lua API (250+ functions, 60+ globals) | [Download](../js/engine-data/psych-lua-api.json) |
| `codename-events.json` | Codename Engine events (48 event classes, 7 script types) | [Download](../js/engine-data/codename-events.json) |
| `official-events.json` | Official Funkin scripting (19 events, 43 scripted classes) | [Download](../js/engine-data/official-events.json) |

### TOON (for LLMs / Coding Agents)

[TOON](https://github.com/phdowling/toon) (Token-Oriented Object Notation) is a compact data format that uses 30–60% fewer tokens than JSON while preserving the same structure. Ideal for feeding into LLMs or coding agents as context.

| File | Contents | Download |
|------|----------|----------|
| `classes-map.toon` | Cross-engine class equivalences (12 classes) | [Download](../js/engine-data/classes-map.toon) |
| `callbacks-map.toon` | Cross-engine callback mappings (50+ callbacks) | [Download](../js/engine-data/callbacks-map.toon) |
| `psych-lua-api.toon` | Psych Engine Lua API (250+ functions, 60+ globals) | [Download](../js/engine-data/psych-lua-api.toon) |
| `codename-events.toon` | Codename Engine events (48 event classes, 7 script types) | [Download](../js/engine-data/codename-events.toon) |
| `official-events.toon` | Official Funkin scripting (19 events, 43 scripted classes) | [Download](../js/engine-data/official-events.toon) |

!!! tip "Using the data"
    All files follow a consistent structure with version fields and descriptive metadata. JSON files can be loaded in any language that supports JSON parsing. TOON files can be included directly in LLM prompts or coding agent context for token-efficient API reference.

## Data Sources

All data was extracted and verified against the actual engine source code, but there may still be missing or incomplete entries.

- **Psych Engine** — [GitHub Repository](https://github.com/ShadowMario/FNF-PsychEngine)
- **Codename Engine** — [GitHub Repository](https://github.com/FNF-CNE-Devs/CodenameEngine)
- **Official Funkin (V-Slice)** — [GitHub Repository](https://github.com/FunkinCrew/Funkin)

!!! warning "Active Development"
    Official Funkin (V-Slice) and Codename Engine are both under active development. APIs, events, and scripting interfaces documented here may change in future versions. Psych Engine is archived as of v1.0.4 (March 2025) and is no longer receiving updates.
