# data/scripts/

Global scripts that run in **all game states** (not just gameplay). 

Place `.hx` files here for always-on functionality like custom overlays, debug tools, or persistent UI elements.

## Subdirectories

| Folder | Purpose |
|--------|---------|
| `menus/` | Scripts that modify menu behavior |
| `gameOver/` | Custom game-over screen logic |

## Example

```haxe
// data/scripts/debugOverlay.hx

function create() {
    // Runs when the state loads
}

function update(elapsed) {
    // Runs every frame
}
```

## Note on script scope

- `data/scripts/` — Runs in **all** game states (menus, gameplay, etc.)
- `songs/*.hx` — Runs only during **gameplay** (all songs)
- `songs/<name>/scripts/*.hx` — Runs only during a **specific song**
