# Common Scripting Patterns

## Creating a Sprite

=== "Official Funkin (HScript)"

    ```haxe
    var spr = new FlxSprite(100, 200).loadGraphic(Paths.image("mySprite"));
    PlayState.instance.add(spr);
    ```

=== "Psych Engine (Lua)"

    ```lua
    makeLuaSprite('mySprite', 'mySprite', 100, 200)
    addLuaSprite('mySprite', true)
    ```

=== "Psych Engine (HScript Iris)"

    ```haxe
    var spr = new FlxSprite(100, 200).loadGraphic(Paths.image("mySprite"));
    game.add(spr);
    ```

=== "Codename Engine (HScript)"

    ```haxe
    var spr = new FlxSprite(100, 200).loadGraphic(Paths.image("mySprite"));
    add(spr);
    ```

## Tweening

=== "Official Funkin (HScript)"

    ```haxe
    FlxTween.tween(spr, {x: 500, alpha: 0}, 1.0, {ease: FlxEase.quadOut});
    ```

=== "Psych Engine (Lua)"

    ```lua
    doTweenX('tweenTag', 'mySprite', 500, 1, 'quadOut')
    doTweenAlpha('alphaTag', 'mySprite', 0, 1, 'quadOut')
    ```

=== "Psych Engine (HScript Iris)"

    ```haxe
    FlxTween.tween(spr, {x: 500, alpha: 0}, 1.0, {ease: FlxEase.quadOut});
    ```

=== "Codename Engine (HScript)"

    ```haxe
    FlxTween.tween(spr, {x: 500, alpha: 0}, 1.0, {ease: FlxEase.quadOut});
    ```

## Accessing Characters

=== "Official Funkin (HScript)"

    ```haxe
    var bf = PlayState.instance.boyfriend;
    var dad = PlayState.instance.dad;
    ```

=== "Psych Engine (Lua)"

    ```lua
    -- Via string references
    local bfName = boyfriendName
    local dadName = dadName
    -- Character functions
    characterDance('bf')
    setCharacterX('bf', 500)
    ```

=== "Psych Engine (HScript Iris)"

    ```haxe
    // Direct object access via game (= PlayState)
    var bf = game.boyfriend;
    var dad = game.dad;
    bf.x = 500;
    ```

=== "Codename Engine (HScript)"

    ```haxe
    // Direct object access
    trace(boyfriend);
    trace(dad);
    trace(gf);
    // Or via strumlines
    trace(strumLines.members[0].characters[0]); // Opponent
    trace(strumLines.members[1].characters[0]); // Player
    ```

## Playing Character Animations

=== "Official Funkin (HScript)"

    ```haxe
    PlayState.instance.boyfriend.playAnimation("singLEFT", true);
    ```

=== "Psych Engine (Lua)"

    ```lua
    playAnim('boyfriend', 'singLEFT', true)
    ```

=== "Psych Engine (HScript Iris)"

    ```haxe
    game.boyfriend.playAnim("singLEFT", true);
    ```

=== "Codename Engine (HScript)"

    ```haxe
    boyfriend.playAnim("singLEFT", true);
    ```

## Getting/Setting Properties

=== "Official Funkin (HScript)"

    ```haxe
    var health = PlayState.instance.health;
    PlayState.instance.health = 1.5;
    ```

=== "Psych Engine (Lua)"

    ```lua
    local health = getProperty('health')
    setProperty('health', 1.5)
    ```

=== "Psych Engine (HScript Iris)"

    ```haxe
    var health = game.health; // game = FlxG.state (PlayState)
    game.health = 1.5;
    ```

=== "Codename Engine (HScript)"

    ```haxe
    var health = health; // Direct access in gameplay scripts
    health = 1.5;
    ```
