# Mod Templates

!!! warning "Under Construction"
    This page is under construction. Don't take anything on the template pages as finished.

Starter templates with the correct folder structure, example data, and working scripts so you can jump straight into modding.

Pick your engine to get started:

<div class="grid cards" markdown>

-   :material-star:{ .lg .middle } __Official Funkin' (V-Slice)__

    ---

    Polymod-based template with character JSONs, song charts, dialogue examples, `.hxc` class-based scripts, and full asset structure.

    [:octicons-arrow-right-24: V-Slice Template](template-guides/vslice.md)

-   :material-wrench:{ .lg .middle } __Psych Engine__

    ---

    Template with Psych-format character/stage/week JSONs, Lua stage scripts, custom event and note type script guides.

    [:octicons-arrow-right-24: Psych Template](template-guides/psych.md)

-   :material-code-braces:{ .lg .middle } __Codename Engine__

    ---

    Template with XML stage definitions, function-based HScript, per-difficulty chart files, custom game states, and global song scripts.

    [:octicons-arrow-right-24: Codename Template](template-guides/codename.md)

</div>

---

## At a Glance

| | Official Funkin' (V-Slice) | Psych Engine | Codename Engine |
|---|---|---|---|
| **Mod metadata** | `_polymod_meta.json` | `pack.json` | None (folder name) |
| **Stage format** | JSON | JSON + Lua | XML + HScript |
| **Character format** | JSON (versioned) | JSON | In stage XML / scripts |
| **Chart storage** | All diffs in one file | One file per diff | One file per diff |
| **Script language** | HScript (`.hxc`, class-based) | Lua + HScript | HScript (`.hx`, function-based) |
| **Audio layout** | `songs/<name>/Voices-<char>.ogg` | `songs/<name>/Voices-*.ogg` | `songs/<name>/song/Voices.ogg` |
| **Custom states** | No | No | Yes (`data/states/`) |

---

## Related Documentation

| Topic | Page |
|-------|------|
| Full mod folder layout comparison | [Mod Folder Structure](mod-folder-structure.md) |
| Character JSON across engines | [Character Format](character-format.md) |
| Song/chart JSON across engines | [Chart Format](chart-format.md) |
| Stage definition across engines | [Stage Format](stage-format.md) |
| Week/level JSON across engines | [Week / Level Format](week-format.md) |
| Scripting systems compared | [Scripting System](scripting-system.md) |
| Events across engines | [Events System](events-system.md) |
