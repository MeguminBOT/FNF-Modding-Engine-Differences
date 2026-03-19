# data/states/

Custom game states — complete screen/menu replacements written in HScript.

Each `.hx` file here defines a full game state that can replace built-in menus or add entirely new screens.

## Example: Custom menu state

```haxe
// data/states/MyMenuState.hx

var menuBG:FlxSprite;
var selected:Int = 0;
var options:Array<String> = ["Play", "Options", "Exit"];

function create() {
    menuBG = new FlxSprite(0, 0);
    menuBG.makeGraphic(1280, 720, FlxColor.fromString("#1a1a2e"));
    add(menuBG);

    // Add menu text, buttons, etc.
}

function update(elapsed) {
    if (FlxG.keys.justPressed.UP) selected--;
    if (FlxG.keys.justPressed.DOWN) selected++;
    if (FlxG.keys.justPressed.ENTER) {
        // Handle selection
    }
}
```

## Switching to a custom state

From another script, switch to your custom state:
```haxe
FlxG.switchState(new ModState("MyMenuState"));
```

The path is relative to `data/states/` — so `data/states/MyMenuState.hx` becomes `"MyMenuState"`.

This is unique to Codename Engine — other FNF engines don't support script-defined game states.
