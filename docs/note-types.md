# Note Types

| Aspect                  | Official Funkin               | Psych Engine                                          | Codename Engine                               |
| ----------------------- | ----------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| **Definition**          | `k` (kind) field in note data | 4th element in note array                             | `noteType` field on note objects              |
| **Custom note scripts** | Module scripts                | Lua in `custom_notetypes/`                            | HScript in `data/notes/`                      |
| **Custom note sprites** | Via script                    | Via script                                            | Auto-replace from `images/game/notes/<type>`  |
| **Built-in types**      | Standard                      | Alt Animation, Hey, Hurt Notes, GF Sing, No Animation | Standard                                      |
| **Handler callback**    | Script module handlers        | `goodNoteHit`/`opponentNoteHit` + check type          | `onPlayerHit(event)` + check `event.noteType` |
