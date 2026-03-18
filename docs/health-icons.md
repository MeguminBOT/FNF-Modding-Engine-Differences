# Health Icons

| Aspect                  | Official Funkin                          | Psych Engine                                             | Codename Engine                                         |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| **Image location**      | `images/icons/`                          | `images/icons/`                                          | `images/icons/<name>.png` or `images/icons/<name>/icon.png` |
| **Image format**        | Spritesheet (150px per frame)            | 2-3 frames (300x150 or 450x150)                          | N frames (150 * N width), or spritesheet atlas for animated |
| **States**              | neutral, losing, winning                 | neutral, losing (2 frames), optional winning (3rd frame) | Unlimited states (neutral, losing, winning, and custom) |
| **Configuration**       | `healthIcon` object in character JSON: `{id, scale, flipX, isPixel, offsets}` (offsets default `[0, 25]`) | `healthicon` string in character JSON | `icon` attribute in character XML |
| **Icon data.xml**       | N/A                                      | N/A                                                      | `images/icons/<name>/data.xml` — `antialiasing`, `offsetX`, `offsetY`, `scale`, `facing` |
| **Animated icons**      | Via spritesheet frames                   | N/A                                                      | Spritesheet atlas + `data.xml` with `<anim>`, `<transition>`, `<step>` nodes |
| **Health steps**        | Fixed (neutral, losing, winning)         | Fixed (neutral, losing, opt. winning)                    | `<step percent="" name="">` nodes in `data.xml`         |
| **State change script** | N/A                                      | N/A                                                      | `onHealthIconAnimChange` callback                       |
