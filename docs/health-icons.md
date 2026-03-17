# Health Icons

| Aspect                  | Official Funkin                          | Psych Engine                                             | Codename Engine                                         |
| ----------------------- | ---------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------- |
| **Image location**      | `images/icons/`                          | `images/icons/`                                          | `images/icons/`                                         |
| **Image format**        | Spritesheet (150px per frame)            | 2-3 frames (300x150 or 450x150)                          | N frames (150 * N width)                                |
| **States**              | neutral, losing, winning                 | neutral, losing (2 frames), optional winning (3rd frame) | Unlimited states (neutral, losing, winning, and custom) |
| **Configuration**       | `healthIcon` object in character JSON    | `healthicon` string in character JSON                    | `icon` attribute in character XML                       |
| **Icon scale/offset**   | `healthIcon.scale`, `healthIcon.offsets` | Not configurable                                         | Not configurable                                        |
| **State change script** | N/A                                      | N/A                                                      | `onHealthIconAnimChange` callback                       |
