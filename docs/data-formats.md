# Data Format Languages

One of the biggest divergences between engines is the data format used for game data files.

| Data Type         | Official Funkin      | Psych Engine    | Codename Engine                   |
| ----------------- | -------------------- | --------------- | --------------------------------- |
| **Charts**        | JSON                 | JSON            | JSON                              |
| **Characters**    | JSON                 | JSON            | **XML**                           |
| **Stages**        | JSON                 | JSON + Lua      | **XML** (+ HScript)               |
| **Weeks/Levels**  | JSON                 | JSON            | **XML**                           |
| **Events**        | JSON (in chart)      | JSON (in chart) | JSON (params) + HScript (handler) |
| **Song Metadata** | JSON (separate file) | JSON (in chart) | JSON (`meta.json`)                |

Codename Engine uses **XML** for characters, stages, and weeks, while both Funkin and Psych use **JSON**. See the individual format pages for detailed field mappings:

- [Chart / Song Format](chart-format.md)
- [Character Format](character-format.md)
- [Stage Format](stage-format.md)
- [Week / Level Format](week-format.md)
