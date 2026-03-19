# scripts/

HScript (`.hxc`) scripted classes that extend game behavior. These use HaxeFlixel syntax and run at runtime via Polymod's script loader.

## How scripted classes work

Each `.hxc` file defines a class that **extends** a base game class. The file must contain a class declaration with the appropriate `extends` clause.

**Important:** Scripted classes can technically live anywhere, but the conventional directory structure helps organization. Scripted *functions* (non-class scripts) require specific file locations to be discovered.

## Subfolder guide

| Folder | Extends | Purpose |
|--------|---------|---------|
| `characters/` | `Character` | Custom character behavior (special animations, effects) |
| `dialogue/` | `Dialogue` | Custom dialogue sequences |
| `levels/` | `Level` | Level/week logic (unlock conditions, cutscenes between songs) |
| `songs/` | `Song` | Per-song behavior (intro cutscenes, special mechanics) |
| `stages/` | `Stage` | Stage setup (animated backgrounds, beat-synced effects) |
| `shaders/` | — | Custom GLSL shader wrapper classes |

## Example: Song script (cutscene before countdown)

```haxe
// scripts/songs/ugh.hxc
class UghState extends Song {
    override function startCountdown() {
        var event = super.startCountdown();
        if (!event.cancelled && !seenCutscene) {
            seenCutscene = true;
            event.cancel();
            startCutscene("ughCutscene", function() {
                startCountdown();
            });
        }
        return event;
    }
}
```

## Example: Stage script (beat-synced animation)

```haxe
// scripts/stages/tankmanBattlefield.hxc
class TankmanBattlefield extends Stage {
    var cloudSpeed:Float = 0;
    
    override function create() {
        super.create();
        cloudSpeed = FlxG.random.float(5, 15);
    }
    
    override function beatHit(curBeat:Int) {
        foregroundSprites.members[0].animation.play('idle', true);
    }
}
```

## Example: Level script (unlock logic)

```haxe
// scripts/levels/weekend1.hxc
class Weekend1State extends Level {
    override function isUnlocked():Bool {
        return Save.instance.hasBeatenLevel("week7");
    }
}
```

See the included `.hxc` files in each subfolder for full working examples.
