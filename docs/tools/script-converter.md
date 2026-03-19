# Script Converter

<div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 200px;">
    <label for="script-source-lang"><strong>Source</strong></label>
    <select id="script-source-lang" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="auto">Auto-detect</option>
      <option value="lua">Psych Engine Lua</option>
      <option value="psych-hx">Psych Engine HScript Iris</option>
      <option value="funkin-hx">Official Funkin HScript</option>
      <option value="codename-hx">Codename Engine HScript</option>
    </select>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <label for="script-target-lang"><strong>Target</strong></label>
    <select id="script-target-lang" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="psych-hx">Psych Engine HScript Iris</option>
      <option value="funkin-hx">Official Funkin HScript</option>
      <option value="codename-hx">Codename Engine HScript</option>
      <option value="lua">Psych Engine Lua</option>
    </select>
  </div>
</div>

<div style="margin-bottom: 1rem;">
  <label for="script-file-upload" style="display: inline-block; padding: 0.6rem 1.5rem; border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 4px; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
    Click to upload a script file (.lua / .hx) or drag and drop
    <input type="file" id="script-file-upload" accept=".lua,.hx,.hxc,.hxs" style="display: none;">
  </label>
  <p id="script-file-name" style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--md-default-fg-color--light);"></p>
</div>

<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 300px;">
    <label for="script-input-data"><strong>Input</strong></label>
    <textarea id="script-input-data" rows="24" placeholder="Paste your Lua or HScript code here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="script-btn-convert" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #7e57c2; color: white; font-weight: bold; cursor: pointer; font-size: 0.95rem;">Convert</button>
      <button id="script-btn-clear" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Clear</button>
    </div>
  </div>
  <div style="flex: 1; min-width: 300px;">
    <label for="script-output-data"><strong>Output</strong></label>
    <textarea id="script-output-data" rows="24" readonly placeholder="Converted output will appear here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="script-btn-copy" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Copy Output</button>
      <button id="script-btn-download" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #2e7d32; color: white; cursor: pointer; font-size: 0.95rem;">Download Output</button>
    </div>
  </div>
</div>

<p id="script-converter-status" style="margin-top: 0.75rem; font-weight: bold;"></p>

<div id="script-analysis" style="display: none; margin-top: 1rem; padding: 1rem; border-radius: 8px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color);">
  <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
    <strong style="white-space: nowrap;">Conversion Confidence:</strong>
    <div style="flex: 1; background: var(--md-default-fg-color--lightest); border-radius: 10px; height: 22px; overflow: hidden;">
      <div id="script-confidence-bar" style="height: 100%; border-radius: 10px; transition: width 0.4s ease;"></div>
    </div>
    <span id="script-confidence-text" style="font-weight: bold; font-size: 1.1rem; min-width: 3.5rem; text-align: right;"></span>
  </div>
  <p id="script-issue-summary" style="margin: 0; font-size: 0.9rem;"></p>
  <details id="script-issue-details" style="margin-top: 0.5rem;">
    <summary style="cursor: pointer; font-size: 0.9rem; font-weight: 600;">View details</summary>
    <ul id="script-issue-list" style="font-size: 0.85rem; margin-top: 0.5rem; padding-left: 1.5rem;"></ul>
  </details>
</div>

</div>

## Supported Conversions (Lua → HScript)

| Lua Pattern | Psych HScript Iris | Official Funkin HScript | Codename HScript |
| --- | --- | --- | --- |
| `makeLuaSprite(tag, img, x, y)` | `var tag = new FlxSprite(x, y).loadGraphic(Paths.image(img));` | Same | Same |
| `addLuaSprite(tag, true)` | `game.add(tag);` | `PlayState.instance.add(tag);` | `add(tag);` |
| `addLuaSprite(tag, false)` | `game.insert(..., tag);` | `PlayState.instance.insert(..., tag);` | `insert(..., tag);` |
| `removeLuaSprite(tag)` | `game.remove(tag);` | `PlayState.instance.remove(tag);` | `remove(tag);` |
| `setProperty(path, val)` | `game.path = val;` | `PlayState.instance.path = val;` | `path = val;` |
| `getProperty(path)` | `game.path` | `PlayState.instance.path` | `path` |
| `doTweenX(tag, obj, val, dur, ease)` | `FlxTween.tween(obj, {x: val}, dur, ...);` | Same | Same |
| `playAnim(tag, anim, forced)` | `tag.animation.play(anim, forced);` | Same | Same |
| `scaleObject(tag, sx, sy)` | `tag.scale.set(sx, sy);` | Same | Same |
| `setObjectCamera(tag, cam)` | `tag.cameras = [game.camHUD];` | `tag.cameras = [PlayState.instance.camHUD];` | `tag.cameras = [camHUD];` |

## Callback Mappings

| Event | Psych (Lua & HScript) | Official Funkin | Codename |
| --- | --- | --- | --- |
| Creation | `onCreate()` | `onCreate()` | `create()` |
| Post-creation | `onCreatePost()` | `onCreatePost()` | `postCreate()` |
| Update | `onUpdate(elapsed)` | `onUpdate(event)` — `event.elapsed` | `update(elapsed)` |
| Post-update | `onUpdatePost(elapsed)` | `onUpdatePost(event)` — `event.elapsed` | `postUpdate(elapsed)` |
| Destroy | `onDestroy()` | `onDestroy(event)` | `destroy()` |
| Beat hit | `onBeatHit()` | `onBeatHit(event)` — `event.beat` | `beatHit(curBeat)` |
| Step hit | `onStepHit()` | `onStepHit(event)` — `event.step` | `stepHit(curStep)` |
| Song end | `onEndSong()` | `onSongEnd(event)` | `onSongEnd()` |
| Countdown start | `onStartCountdown()` | `onCountdownStart(event)` | `onStartCountdown()` |
| Player note hit | `goodNoteHit(note)` | `onNoteHit(event)` — `event.note` | `onPlayerHit(event)` |
| Note miss | `noteMiss(note)` | `onNoteMiss(event)` — `event.note` | `onPlayerMiss(event)` |
| Opponent note hit | `opponentNoteHit(note)` | `onNoteHit(event)` | `onDadHit(event)` |
| Ghost miss | `noteMissPress(direction)` | `onNoteGhostMiss(event)` — `event.dir` | `onPlayerMiss(event)` |
| Song event | `onEvent(name, v1, v2)` | `onSongEvent(event)` — `event.eventData` | `onEvent(event)` |
| Song start | `onSongStart()` | `onSongStart(event)` | `onSongStart()` |
| Pause | `onPause()` | `onPause(event)` | `onPause()` |
| Game over | `onGameOver()` | `onGameOver(event)` | `onGameOver(event)` |
| Song retry | — | `onSongRetry(event)` | — |
| Countdown end | — | `onCountdownEnd(event)` | — |

## HScript Variant Differences

| Concept | Psych HScript Iris | Official Funkin | Codename |
| --- | --- | --- | --- |
| PlayState reference | `game` | `PlayState.instance` | _(direct access)_ |
| Add to stage | `game.add(spr)` | `PlayState.instance.add(spr)` | `add(spr)` |
| Access boyfriend | `game.boyfriend` | `PlayState.instance.currentStage.getBoyfriend()` | `boyfriend` |
| Access dad | `game.dad` | `PlayState.instance.currentStage.getDad()` | `dad` |
| Access girlfriend | `game.gf` | `PlayState.instance.currentStage.getGirlfriend()` | `gf` |
| Set health | `game.health = 1.5` | `PlayState.instance.health = 1.5` | `health = 1.5` |
| Character anim | `.playAnim("name")` | `.playAnimation("name")` | `.playAnim("name")` |
| Character ID | `.curCharacter` | `.characterId` | `.curCharacter` |
| Camera ref | `game.camHUD` | `PlayState.instance.camHUD` | `camHUD` |
| Conductor BPM | `Conductor.bpm` | `Conductor.instance.bpm` | `Conductor.bpm` |
| Beat duration | `Conductor.crochet` | `Conductor.instance.beatLengthMs` | `Conductor.crochet` |
| Step duration | `Conductor.stepCrochet` | `Conductor.instance.stepLengthMs` | `Conductor.stepCrochet` |
| Note direction | `note.noteData` | `note.direction` | `note.noteData` |
| Note type | `note.noteType` | `note.kind` | `note.noteType` |
| Is sustain | `note.isSustainNote` | `note.isHoldNote` | `note.isSustainNote` |
| Flow control (stop) | `return Function_Stop;` | `event.cancel(); return;` | `event.cancel(); return;` |
| Flow control (continue) | `return Function_Continue;` | _(default, no action)_ | _(default, no action)_ |

!!! info "Limitations"
    - **Table-driven patterns**: Lua `for _, item in ipairs(tbl)` converts to `for (item in tbl)` and `for k, v in pairs(tbl)` converts to `for (k => v in tbl)`. Complex nested table structures may still need manual review.
    - **String concatenation**: Lua `..` is converted to HScript `+`, which works for strings but may need `Std.string()` wraps for mixed types.
    - **Lua→HScript note callbacks**: Note callbacks like `goodNoteHit(id, direction, noteType, isSustainNote)` are automatically converted to HScript's single-object form `goodNoteHit(note)`, with parameter references remapped (e.g., `direction` → `note.noteData`, `noteType` → `note.noteType`). `onCountdownTick(counter)` gains the additional `tick` parameter. The reverse (HScript→Lua) also converts `note.noteData` → `direction` etc.
    - **Psych built-in variables**: Variables like `downscroll`, `middlescroll`, `boyfriendName`, `dadName` are converted to their Psych HScript equivalents. When targeting Funkin or Codename, these are commented as Psych-specific.
    - **Codename events**: Codename callbacks receive event objects (e.g., `onPlayerHit(event)`) instead of note objects. Note property accesses are automatically remapped — direct event properties like `event.direction`, `event.noteType`, `event.score` are used where available, and `event.note.property` for note-specific fields. Codename event methods like `event.preventAnim()` have no Psych equivalent and are commented.
    - **Funkin ScriptEvents**: Official Funkin uses ScriptEvent-based callbacks (e.g., `onUpdate(event)` with `event.elapsed`, `onNoteHit(event)` with `event.note`). Callbacks are renamed (`goodNoteHit` → `onNoteHit`, `onEndSong` → `onSongEnd`, `onStartCountdown` → `onCountdownStart`), parameters are remapped to event object fields, and note properties are translated (`noteData` → `direction`, `noteType` → `kind`, `isSustainNote` → `isHoldNote`).
    - **Psych-only callbacks**: When converting to Funkin, callbacks with no equivalent (e.g., `onSpawnNote`, `onMoveCamera`, `onRecalculateRating`, `onKeyPress`, `onGhostTap`, `goodNoteHitPre`, `opponentNoteHitPre`) are flagged with a `[Psych-specific]` comment explaining the gap.
    - **Funkin character access**: Characters in Official Funkin are accessed via `PlayState.instance.currentStage.getBoyfriend()` / `getDad()` / `getGirlfriend()` instead of direct properties. The converter handles this automatically.
    - **Funkin Conductor**: Psych uses static `Conductor.bpm`; Funkin uses instance-based `Conductor.instance.bpm`. Field names also differ: `crochet` → `beatLengthMs`, `stepCrochet` → `stepLengthMs`.
    - **Funkin `playAnimation`**: Official Funkin characters use `.playAnimation()` instead of `.playAnim()`. This is handled automatically.
    - **`close(true)`**: The Lua `close()` function closes the running Lua script. HScript scripts are managed differently, so this is commented out with an explanation.
    - **Flow control**: `Function_Stop` and `Function_StopAll` are converted to `event.cancel(); return;` for both Codename and Funkin. `Function_Continue` (the default) is removed. `Function_StopLua` and `Function_StopHScript` are Psych-only and commented. In the reverse direction, `event.cancel()` and `event.cancelEvent()` convert to `return Function_Stop;`.
