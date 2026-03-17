# Engine Source Extraction Data

This directory contains structured reference data extracted from all three FNF engine
source codes. This data is used by the script converter to accurately map between engines.

All data verified against actual source files in `engine-sources/`.

## Files

| File | Contents | Size |
|------|----------|------|
| `classes-map.json` | Cross-engine class equivalence table (Conductor, PlayState, Character, Note, etc.) | 12 classes |
| `callbacks-map.json` | Cross-engine callback/event mappings (lifecycle, notes, input, events, etc.) | 50+ callbacks |
| `psych-lua-api.json` | Complete Psych Engine Lua function registry | 250+ functions, 60+ globals, 45+ callbacks |
| `codename-events.json` | Codename Engine event classes, callbacks, script types | 48 event classes, 7 script types |
| `official-events.json` | Official Funkin ScriptEvent types, Scripted* classes, interfaces, modules | 19 events, 43 scripted classes, 9 interfaces |

## Sources

- Psych Engine: `engine-sources/psych-engine/source/`
- Codename Engine: `engine-sources/codename-engine/source/`
- Official Funkin: `engine-sources/official-funkin/source/`
