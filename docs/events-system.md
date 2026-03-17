# Events System

For the complete event class and callback references, see: [Codename Engine Events Reference](reference/codename-events.md) · [Official Funkin Events Reference](reference/official-events.md) · [Cross-Engine Callbacks](reference/callbacks-map.md).

## Built-in Events

| Event Purpose            | Official Funkin           | Psych Engine              | Codename Engine                      |
| ------------------------ | ------------------------- | ------------------------- | ------------------------------------ |
| **Camera focus**         | `FocusCamera`             | Auto via `mustHitSection` | `Camera Movement` event              |
| **Camera zoom**          | `ZoomCamera`              | `Add Camera Zoom`         | `Add Camera Zoom`                    |
| **Camera flash**         | N/A (scripted)            | N/A (scripted)            | `Camera Flash`                       |
| **Camera bump rate**     | `SetCameraBop`            | N/A                       | `Camera Modulo Change`               |
| **BPM change**           | `timeChanges` in metadata | `changeBPM` per section   | `BPM Change` event                   |
| **Scroll speed change**  | N/A (scripted)            | `Change Scroll Speed`     | `Scroll Speed Change`                |
| **Play animation**       | `Play Animation`          | `Play Animation`          | `Play Animation`                     |
| **Alt animation toggle** | N/A (note type)           | `Alt Idle Animation`      | `Alt Animation Toggle`               |
| **Hey! animation**       | N/A (note type/script)    | `Hey!`                    | Script / `Play Animation`            |
| **Character change**     | N/A                       | `Change Character`        | N/A (scripted)                       |
| **Screen shake**         | N/A (scripted)            | `Screen Shake`            | N/A (scripted)                       |
| **Set GF speed**         | N/A                       | `Set GF Speed`            | N/A (scripted)                       |
| **HScript call**         | N/A                       | N/A                       | `HScript Call` (call named function) |

## Custom Events

| Aspect            | Official Funkin                      | Psych Engine                           | Codename Engine                                                            |
| ----------------- | ------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------- |
| **Definition**    | In chart JSON                        | Lua script in `custom_events/`         | JSON (params) + HScript (handler) in `data/events/`                        |
| **Parameters**    | JSON value object in event `v` field | Two string values (`value1`, `value2`) | Typed params: Bool, Int, Float, String, StrumLine, ColorWheel, DropDown    |
| **Event handler** | Module script / chart event handler  | `onEvent(name, v1, v2)` callback       | `onEvent(event)` callback with `event.event.name` + `event.event.params[]` |
| **Icon**          | N/A                                  | N/A                                    | Optional `.png` in `images/editor/charter/event-icons/`                    |
| **Packaging**     | Part of chart                        | Standalone Lua file                    | `.pack` file (JSON + HScript combined)                                     |
