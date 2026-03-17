# Script Converter

!!! info "Coming Soon"
    The Script Converter is currently under development and will be available in a future update. It will support converting scripts between Psych Engine Lua, Psych Engine HScript Iris, Official Funkin HScript, and Codename Engine HScript.

    In the meantime, check out the [API Reference](../reference/index.md) for cross-engine class maps, callback mappings, and full function listings to help with manual script conversion.

<!-- Tool UI and documentation preserved below — do not remove -->
<!--

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
| Update | `onUpdate(elapsed)` | `onUpdate(elapsed)` | `update(elapsed)` |
| Post-update | `onUpdatePost(elapsed)` | `onUpdatePost(elapsed)` | `postUpdate(elapsed)` |
| Destroy | `onDestroy()` | `onDestroy()` | `destroy()` |
| Beat hit | `onBeatHit()` | `onBeatHit(curBeat)` | `beatHit(curBeat)` |
| Step hit | `onStepHit()` | `onStepHit(curStep)` | `stepHit(curStep)` |
| Song end | `onEndSong()` | `onEndSong()` | `onSongEnd()` |
| Player note hit | `goodNoteHit(note)` | `goodNoteHit(note)` | `onPlayerHit(event)` |
| Note miss | `noteMiss(note)` | `noteMiss(note)` | `onPlayerMiss(event)` |
| Opponent note hit | `opponentNoteHit(note)` | `opponentNoteHit(note)` | `onDadHit(event)` |

## HScript Variant Differences

| Concept | Psych HScript Iris | Official Funkin | Codename |
| --- | --- | --- | --- |
| PlayState reference | `game` | `PlayState.instance` | _(direct access)_ |
| Add to stage | `game.add(spr)` | `PlayState.instance.add(spr)` | `add(spr)` |
| Access boyfriend | `game.boyfriend` | `PlayState.instance.boyfriend` | `boyfriend` |
| Set health | `game.health = 1.5` | `PlayState.instance.health = 1.5` | `health = 1.5` |
| Character anim | `.playAnim("name")` | `.playAnimation("name")` | `.playAnim("name")` |
| Camera ref | `game.camHUD` | `PlayState.instance.camHUD` | `camHUD` |

!!! info "Limitations"
    - **Table-driven patterns**: Lua `for _, item in ipairs(tbl)` converts to `for (item in tbl)` and `for k, v in pairs(tbl)` converts to `for (k => v in tbl)`. Complex nested table structures may still need manual review.
    - **String concatenation**: Lua `..` is converted to HScript `+`, which works for strings but may need `Std.string()` wraps for mixed types.
    - **Psych built-in variables**: Variables like `downscroll`, `middlescroll`, `boyfriendName`, `dadName` are converted to their Psych HScript equivalents. When targeting Funkin or Codename, these are commented as Psych-specific.
    - **Codename events**: Codename callbacks receive event objects (e.g., `onPlayerHit(event)`) instead of note objects. Note property accesses are automatically remapped — direct event properties like `event.direction`, `event.noteType`, `event.score` are used where available, and `event.note.property` for note-specific fields. Codename event methods like `event.preventAnim()` have no Psych equivalent and are commented.
    - **Funkin `playAnimation`**: Official Funkin characters use `.playAnimation()` instead of `.playAnim()`. This is handled automatically.
    - **`close(true)`**: The Lua `close()` function closes the running Lua script. HScript scripts are managed differently, so this is commented out with an explanation.
    - **Flow control**: `Function_Stop` and `Function_StopAll` are converted to `event.cancel(); return;` for Codename. `Function_Continue` (the default) is removed. `Function_StopLua` and `Function_StopHScript` are Psych-only and commented. In the reverse direction, `event.cancel()` converts to `return Function_Stop;`.
-->
