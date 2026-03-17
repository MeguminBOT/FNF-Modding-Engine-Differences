# Additional Features

| Feature                      | Official Funkin                           | Psych Engine                     | Codename Engine                                 |
| ---------------------------- | ----------------------------------------- | -------------------------------- | ----------------------------------------------- |
| **Dialogue system**          | Built-in (JSON-based)                     | Built-in (JSON, `startDialogue`) | Built-in (XML-based, scripted characters/boxes) |
| **Video cutscenes**          | Supported                                 | Supported (hxvlc, `startVideo`)  | Supported (hxvlc)                               |
| **Shader support**           | Runtime shaders                           | Runtime shaders                  | Scriptable shaders via HScript                  |
| **Custom options**           | Not natively                              | Not natively                     | XML `options.xml` + script                      |
| **Custom controls**          | Not natively                              | Not natively                     | Scripted                                        |
| **Credits menu**             | `credits.json`                            | Built-in credits system          | `credits.xml` with GitHub integration           |
| **Achievements**             | Not currently                             | 16 example achievements          | Not built-in                                    |
| **Mod loading menu**         | Planned                                   | Built-in                         | Built-in                                        |
| **Discord RPC**              | Built-in                                  | Built-in                         | `discord.json` config                           |
| **Variations/Remixes**       | Full variation system (erect, pico, etc.) | Not natively                     | Difficulty-suffixed audio                       |
| **3D rendering**             | Not supported                             | Not supported                    | HScript-based 3D rendering                      |
| **NDLL scripting**           | Not supported                             | Not supported                    | Native library scripting                        |
| **Custom state override**    | Not supported                             | Limited                          | Full state/substate scripts                     |
| **Addon/always-on mods**     | Not supported                             | `runsGlobally` in pack.json      | `./addons/` folder                              |
| **Stage extensions**         | Not supported                             | Not supported                    | `<use-extension>` XML node                      |
| **Transition customization** | Not supported                             | Limited                          | Full transition scripting                       |
