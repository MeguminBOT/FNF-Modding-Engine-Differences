# Psych Engine — Note Scripts

Examples of common custom note types found in many mods. Each example shows you the basics of building a specific kind of note, with tips on how to extend it further.

## Overview

| Detail | Info |
|--------|------|
| **Location** | `custom_notetypes/<Name>.lua` or `.hx` |
| **Languages** | Lua, HScript (Iris) |
| **Key callbacks** | `onCreatePost`, `goodNoteHit`, `noteMiss`, `opponentNoteHit` |
| **Related docs** | [Note Types](../note-types.md) · [Scripting System](../scripting-system.md) · [Psych Lua API](../reference/psych-lua-api.md) |

## How it works

### Functions

- **`onCreatePost`** — Runs once after the song is fully loaded but before it starts playing. This is where you configure your custom notes (set their texture, adjust health values, etc.). You may see older mods use `onCreate`, but this doesn't work on newer Psych Engine versions.
- **`goodNoteHit`** / **`noteMiss`** — Fire when the player hits or misses a note. In Lua the arguments are `(id, noteData, noteType, isSustainNote)`. In HScript you receive the full `note` object instead. This is where you trigger animations, sound effects, or any other gameplay logic.

### Key variables

- **`noteType`** — Every note has a type name. Since note scripts run for *all* notes, you need to check this to make sure your code only affects your custom note. The type name must match the script's filename (e.g. `Dodge Note.lua` handles notes with type `'Dodge Note'`).
- **`texture`** — The name of the spritesheet to use for the note's appearance. You set this on each note during `onCreatePost` by looping through `unspawnNotes`. Spritesheet should be placed in `your-mod/images/DODGENOTE_assets.png` and `.xml`.
- **`mustPress`** — Whether the note is on the player's side. If `true`, the player is expected to hit it. Useful for making sure you only modify player-side notes.
- **`ignoreNote`** — When `true`, the note won't cause a miss penalty if the player doesn't hit it. Setting this to `false` ensures the player *must* hit the note or take a miss.

---
## Basic examples

Here are two of the most common custom note types.
These examples are very basic to make it easier to understand before going into the extending section.

### Dodge Note

A note the player must hit to "dodge" an incoming attack. On a successful hit, the opponent plays an attack animation and the player plays a dodge animation. On a miss, the opponent still attacks but the player gets hurt instead.

=== "Lua"

    ```lua
    function onCreatePost()
        for i = 0, getProperty('unspawnNotes.length') - 1 do
            if getPropertyFromGroup('unspawnNotes', i, 'noteType') == 'Dodge Note' then
                setPropertyFromGroup('unspawnNotes', i, 'texture', 'DODGENOTE_assets')
                if getPropertyFromGroup('unspawnNotes', i, 'mustPress') then
                    setPropertyFromGroup('unspawnNotes', i, 'ignoreNote', false)
                end
            end
        end
    end

    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            playAnim('boyfriend', 'dodge', true)
            playAnim('dad', 'attack', true)
        end
    end

    function noteMiss(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            playAnim('dad', 'attack', true)
            playAnim('boyfriend', 'hurt', true)
        end
    end
    ```

=== "HScript"

    ```haxe
    function onCreatePost() {
        for (i in 0...game.unspawnNotes.length) {
            if (game.unspawnNotes[i].noteType == 'Dodge Note') {
                game.unspawnNotes[i].texture = 'DODGENOTE_assets';
                if (game.unspawnNotes[i].mustPress) {
                    game.unspawnNotes[i].ignoreNote = false;
                }
            }
        }
    }

    function goodNoteHit(note:Note) {
        if (note.noteType == 'Dodge Note') {
            game.boyfriend.playAnim('dodge', true);
            game.dad.playAnim('attack', true);
        }
    }

    function noteMiss(note:Note) {
        if (note.noteType == 'Dodge Note') {
            game.dad.playAnim('attack', true);
            game.boyfriend.playAnim('hurt', true);
        }
    }
    ```

### Instakill Note
A note the player must *avoid* hitting. If the player hits it, their health is instantly set to a negative value, killing them immediately. Missing it has no penalty — that's the intended behavior.

=== "Lua"

    ```lua
    function onCreatePost()
        for i = 0, getProperty('unspawnNotes.length') - 1 do
            if getPropertyFromGroup('unspawnNotes', i, 'noteType') == 'Instakill Note' then
                setPropertyFromGroup('unspawnNotes', i, 'texture', 'INSTAKILLNOTE_assets')

                if getPropertyFromGroup('unspawnNotes', i, 'mustPress') then
                    setPropertyFromGroup('unspawnNotes', i, 'ignoreNote', true)
                end
            end
        end
    end

    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Instakill Note' then
            setProperty('health', -1)
        end
    end

    function noteMiss(id, noteData, noteType, isSustainNote)
        if noteType == 'Instakill Note' then

        end
    end
    ```

=== "HScript"

    ```haxe
    function onCreatePost() {
        for (i in 0...game.unspawnNotes.length) {
            if (game.unspawnNotes[i].noteType == 'Instakill Note') {
                game.unspawnNotes[i].texture = 'INSTAKILLNOTE_assets';

                if (game.unspawnNotes[i].mustPress) {
                    game.unspawnNotes[i].ignoreNote = true;
                }
            }
        }
    }

    function goodNoteHit(note:Note) {
        if (note.noteType == 'Instakill Note') {
            game.health = -1;
        }
    }

    function noteMiss(note:Note) {
        if (note.noteType == 'Instakill Note') {

        }
    }
    ```

!!! note "Key differences from the Dodge Note"
    - **`ignoreNote = true`** — The opposite of the dodge note. Here we *want* the player to avoid hitting it, so missing it should carry no penalty.
    - **`setProperty('health', -1)`** / **`game.health = -1`** — Sets health to a negative value, which the engine treats as an instant death. The value `-1` is to guarantee the kill regardless of current health.
    - **Empty `noteMiss`** — The callback is defined but intentionally left empty. The player is *supposed* to let this note pass, but you can still make something happen when missed, like making the player character do a `hey` animation or gain health.

---

## Extending the basics

Now that you've seen the basic note type structures, you can start building on top of them to create more polished, specific note types. Instead of a generic "Dodge Note", you could turn it into something like a **Bullet Note** — same core idea, but with direction-specific animations, sound effects, camera shake, precaching, and custom health drain.

Below we'll walk through each addition step by step, building up from the basic dodge note into the full Bullet Note script.

### Locking animations with `specialAnim`

Without `specialAnim`, the engine interrupt the animation you set to play when the note is hit/missed/ignored. Setting it to `true` tells the engine to let your animation finish playing.

=== "Lua"

    ```lua
    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            playAnim('boyfriend', 'dodge', true)
            setProperty('boyfriend.specialAnim', true) -- prevents the engine from overriding the animation

            playAnim('dad', 'attack', true)
            setProperty('dad.specialAnim', true)
        end
    end
    ```

=== "HScript"

    ```haxe
    function goodNoteHit(note:Note) {
        if (note.noteType == 'Dodge Note') {
            game.boyfriend.playAnim('dodge', true);
            game.boyfriend.specialAnim = true;

            game.dad.playAnim('attack', true);
            game.dad.specialAnim = true;
        }
    }
    ```

### Sound effects

Adding a sound effect on hit and miss makes the note feel impactful.

=== "Lua"

    ```lua
    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            -- animations ...
            playSound('dodgeNoteHit', 0.5)
        end
    end
    ```

=== "HScript"

    ```haxe
    function goodNoteHit(note:Note) {
        if (note.noteType == 'Dodge Note') {
            // animations ...
            FlxG.sound.play(Paths.sound('dodgeNoteHit'), 0.5);
        }
    }
    ```

#### Preventing duplicate sounds

If multiple notes share the same timestamp (e.g. two arrows on the same beat), the sound will play once for each note. You can track `lastSoundTime` to make sure it only plays once.

Notice that the variable is declared *outside* the function — this is important. Variables inside a function are reset every time it's called, so they can't remember anything between calls. By placing `lastSoundTime` at the top level, it keeps its value across multiple `goodNoteHit` calls throughout the song.

=== "Lua"

    ```lua
    local lastSoundTime = -1

    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            -- animations ...

            local strumTime = getPropertyFromGroup('notes', id, 'strumTime')
            if strumTime ~= lastSoundTime then
                playSound('dodgeNoteHit', 0.5)
                lastSoundTime = strumTime
            end
        end
    end
    ```

=== "HScript"

    ```haxe
    var lastSoundTime:Float = -1;

    function goodNoteHit(note:Note) {
        if (note.noteType == 'Dodge Note') {
            // animations ...

            if (note.strumTime != lastSoundTime) {
                FlxG.sound.play(Paths.sound('dodgeNoteHit'), 0.5);
                lastSoundTime = note.strumTime;
            }
        }
    }
    ```

### Camera shake

A short camera shake reinforces the impact of each hit or miss. You can use different intensities — a softer shake on hit and a stronger one on miss — to make misses feel more punishing.

=== "Lua"

    ```lua
    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            -- animations, sound ...
            cameraShake('game', 0.01, 0.1)
        end
    end

    function noteMiss(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            -- animations, sound ...
            cameraShake('game', 0.02, 0.2)
        end
    end
    ```

=== "HScript"

    ```haxe
    function goodNoteHit(note:Note) {
        if (note.noteType == 'Dodge Note') {
            // animations, sound ...
            game.camGame.shake(0.01, 0.1);
        }
    }

    function noteMiss(note:Note) {
        if (note.noteType == 'Dodge Note') {
            // animations, sound ...
            game.camGame.shake(0.02, 0.2);
        }
    }
    ```

!!! tip
    The first value is the shake intensity and the second is the duration in seconds. Experiment with these to find what feels right for your note type.

### Direction-specific animations

The basic version plays a single `'dodge'` and `'attack'` animation regardless of which arrow the note is on. By using `noteData` (0=left, 1=down, 2=up, 3=right), you can play a different animation for each direction.

You could do this with an if-else chain:

```lua
if noteData == 0 then
    playAnim('boyfriend', 'dodgeLEFT', true)
elseif noteData == 1 then
    playAnim('boyfriend', 'dodgeDOWN', true)
elseif noteData == 2 then
    playAnim('boyfriend', 'dodgeUP', true)
elseif noteData == 3 then
    playAnim('boyfriend', 'dodgeRIGHT', true)
end
```

But this gets repetitive fast — especially when you need the same logic for both the player and the opponent, across both `goodNoteHit` and `noteMiss`. Instead, you can store the animation names in a local table/array and index into it with `noteData`:

=== "Lua"

    ```lua
    local attackAnimations = { 'attackLEFT', 'attackDOWN', 'attackUP', 'attackRIGHT' }
    local dodgeAnimations = { 'dodgeLEFT', 'dodgeDOWN', 'dodgeUP', 'dodgeRIGHT' }

    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Dodge Note' then
            playAnim('boyfriend', dodgeAnimations[noteData + 1], true) -- +1 because Lua tables start at 1
            playAnim('dad', attackAnimations[noteData + 1], true)
        end
    end
    ```

=== "HScript"

    ```haxe
    var attackAnimations = [ 'attackLEFT', 'attackDOWN', 'attackUP', 'attackRIGHT' ];
    var dodgeAnimations = [ 'dodgeLEFT', 'dodgeDOWN', 'dodgeUP', 'dodgeRIGHT' ];

    function goodNoteHit(note:Note) {
        if (note.noteType == 'Dodge Note') {
            game.boyfriend.playAnim(dodgeAnimations[note.noteData], true); // noteData is already 0-indexed
            game.dad.playAnim(attackAnimations[note.noteData], true);
        }
    }
    ```

Two lines instead of eight — and if you ever need to change an animation name, you only update it in one place.

!!! info "Remember"
    Your character spritesheets need to have matching animation names (e.g. `attackLEFT`, `dodgeUP`, etc.) for this to work.

### Custom miss health drain

By default, missing a note causes you to lose a small amount of health. You can increase this in `onCreatePost` by setting `missHealth` on each note to make the penalty harsher.

=== "Lua"

    ```lua
    function onCreatePost()
        for i = 0, getProperty('unspawnNotes.length') - 1 do
            if getPropertyFromGroup('unspawnNotes', i, 'noteType') == 'Dodge Note' then
                setPropertyFromGroup('unspawnNotes', i, 'texture', 'DODGENOTE_assets')
                setPropertyFromGroup('unspawnNotes', i, 'missHealth', 0.6) -- much higher than the default

                if getPropertyFromGroup('unspawnNotes', i, 'mustPress') then
                    setPropertyFromGroup('unspawnNotes', i, 'ignoreNote', false)
                end
            end
        end
    end
    ```

=== "HScript"

    ```haxe
    function onCreatePost() {
        for (i in 0...game.unspawnNotes.length) {
            if (game.unspawnNotes[i].noteType == 'Dodge Note') {
                game.unspawnNotes[i].texture = 'DODGENOTE_assets';
                game.unspawnNotes[i].missHealth = 0.6;

                if (game.unspawnNotes[i].mustPress) {
                    game.unspawnNotes[i].ignoreNote = false;
                }
            }
        }
    }
    ```

### Precaching assets

Without precaching, the first time a note appears the game may stutter while it loads the spritesheet or sound file. Precaching loads them into memory at the start of the song so playback stays smooth.

=== "Lua"

    ```lua
    function onCreate()
        precacheImage('DODGENOTE_assets')
        precacheSound('dodgeNoteHit')
    end
    ```

=== "HScript"

    ```haxe
    var _cachedImages = new haxe.ds.StringMap();
    var _cachedSounds = new haxe.ds.StringMap();

    function onCreate() {
        _cachedImages.set('DODGENOTE_assets', Paths.image('DODGENOTE_assets'));
        _cachedSounds.set('dodgeNoteHit', Paths.sound('dodgeNoteHit'));
    }

    function onDestroy() {
        _cachedImages.clear();
        _cachedSounds.clear();
    }
    ```

!!! note
    In HScript, we store references in a `StringMap` to keep them from being garbage collected. The `onDestroy` callback clears them when the song ends. In Lua, `precacheImage` and `precacheSound` handle this automatically.

### Putting it all together — Bullet Note

Here's the complete script with all the additions combined and specified to be a "Bullet Note":

=== "Lua"

    ```lua
    local attackAnimations = { 'attackLEFT', 'attackDOWN', 'attackUP', 'attackRIGHT' }
    local dodgeAnimations = { 'dodgeLEFT', 'dodgeDOWN', 'dodgeUP', 'dodgeRIGHT' }
    local lastSoundTime = -1

    function onCreate()
        precacheImage('BULLETNOTE_assets', true)
        precacheSound('bulletNoteHit')
    end

    function onCreatePost()
        for i = 0, getProperty('unspawnNotes.length') - 1 do
            if getPropertyFromGroup('unspawnNotes', i, 'noteType') == 'Bullet Note' then
                setPropertyFromGroup('unspawnNotes', i, 'texture', 'BULLETNOTE_assets')
                setPropertyFromGroup('unspawnNotes', i, 'missHealth', 0.6)

                if getPropertyFromGroup('unspawnNotes', i, 'mustPress') then
                    setPropertyFromGroup('unspawnNotes', i, 'ignoreNote', false)
                end
            end
        end
    end

    function goodNoteHit(id, noteData, noteType, isSustainNote)
        if noteType == 'Bullet Note' then
            playAnim('boyfriend', dodgeAnimations[noteData + 1], true)
            setProperty('boyfriend.specialAnim', true)

            playAnim('dad', attackAnimations[noteData + 1], true)
            setProperty('dad.specialAnim', true)

            local strumTime = getPropertyFromGroup('notes', id, 'strumTime')
            if strumTime ~= lastSoundTime then
                playSound('bulletNoteHit', 0.5)
                lastSoundTime = strumTime
            end
            cameraShake('game', 0.01, 0.1)
        end
    end

    function noteMiss(id, noteData, noteType, isSustainNote)
        if noteType == 'Bullet Note' then
            playAnim('dad', attackAnimations[noteData + 1], true)
            setProperty('dad.specialAnim', true)

            playAnim('boyfriend', 'hurt', true)
            setProperty('boyfriend.specialAnim', true)

            local strumTime = getPropertyFromGroup('notes', id, 'strumTime')
            if strumTime ~= lastSoundTime then
                playSound('bulletNoteHit', 0.5)
                lastSoundTime = strumTime
            end
            cameraShake('game', 0.02, 0.2)
        end
    end
    ```

=== "HScript"

    ```haxe
    var attackAnimations = [ 'attackLEFT', 'attackDOWN', 'attackUP', 'attackRIGHT' ];
    var dodgeAnimations = [ 'dodgeLEFT', 'dodgeDOWN', 'dodgeUP', 'dodgeRIGHT' ];

    var _cachedImages = new haxe.ds.StringMap();
    var _cachedSounds = new haxe.ds.StringMap();
    var lastSoundTime:Float = -1;

    function onCreate() {
        _cachedImages.set('BULLETNOTE_assets', Paths.image('BULLETNOTE_assets'));
        _cachedSounds.set('bulletNoteHit', Paths.sound('bulletNoteHit'));
    }

    function onCreatePost() {
        for (i in 0...game.unspawnNotes.length) {
            if (game.unspawnNotes[i].noteType == 'Bullet Note') {
                game.unspawnNotes[i].texture = 'BULLETNOTE_assets';
                game.unspawnNotes[i].missHealth = 0.6;

                if (game.unspawnNotes[i].mustPress) {
                    game.unspawnNotes[i].ignoreNote = false;
                }
            }
        }
    }

    function goodNoteHit(note:Note) {
        if (note.noteType == 'Bullet Note') {
            game.boyfriend.playAnim(dodgeAnimations[note.noteData], true);
            game.boyfriend.specialAnim = true;

            game.dad.playAnim(attackAnimations[note.noteData], true);
            game.dad.specialAnim = true;

            if (note.strumTime != lastSoundTime) {
                FlxG.sound.play(Paths.sound('bulletNoteHit'), 0.5);
                lastSoundTime = note.strumTime;
            }
            game.camGame.shake(0.01, 0.1);
        }
    }

    function noteMiss(note:Note) {
        if (note.noteType == 'Bullet Note') {
            game.dad.playAnim(attackAnimations[note.noteData], true);
            game.dad.specialAnim = true;

            game.boyfriend.playAnim('hurt', true);
            game.boyfriend.specialAnim = true;

            if (note.strumTime != lastSoundTime) {
                FlxG.sound.play(Paths.sound('bulletNoteHit'), 0.5);
                lastSoundTime = note.strumTime;
            }
            game.camGame.shake(0.02, 0.2);
        }
    }

    function onDestroy() {
        _cachedImages.clear();
        _cachedSounds.clear();
    }
    ```

---

## Downloads

Download the example scripts from this page as ready-to-use files:

[Download Lua examples :material-language-lua:](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/raw/main/docs/templates/psych%20engine-script-template/Note_Script_Psych_Engine_Lua_Examples.zip){ .md-button } [Download HScript examples :material-language-haskell:](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/raw/main/docs/templates/psych%20engine-script-template/Note_Script_Psych_Engine_HScript_Examples.zip){ .md-button }