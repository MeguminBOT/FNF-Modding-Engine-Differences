# Friday Night Funkin' — Engine Modding API Differences

> **Disclaimer:** This is a work in progress and may not be updated regularly. Information may be incomplete or outdated. Community contributions are welcome and encouraged to help keep this resource accurate and up to date.

A comparison of modding APIs and data formats across three major Friday Night Funkin' engines:

| Engine                                                                | Version        | Status             |
| --------------------------------------------------------------------- | -------------- | ------------------ |
| [**Official Funkin**](https://github.com/FunkinCrew/Funkin)           | v0.8.x+        | Active development |
| [**Psych Engine**](https://github.com/ShadowMario/FNF-PsychEngine)    | v1.0.4 (final) | Archived           |
| [**Codename Engine**](https://github.com/CodenameCrew/CodenameEngine) | v1.0.x         | Active development |

## What's Covered

- Mod folder structures and metadata
- Chart / song data formats
- Character, stage, and week data formats
- Scripting systems (HScript, Lua, interop)
- Script callbacks and common patterns
- Events, note types, and health icons
- Cross-engine conversion guidance

## Documentation

The full docs site is built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and auto-deploys to GitHub Pages on push to `main`.

- **Browse online:** Once deployed, visit your GitHub Pages URL (e.g., `https://<username>.github.io/FNF-Modding-Engine-Differences/`)
- **Split docs:** The `docs/` folder contains the same content organized into individual pages

### Local Preview

```bash
pip install mkdocs-material
mkdocs serve
```

Then open `http://127.0.0.1:8000` in your browser.

### GitHub Pages Setup

1. Push this repo to GitHub
1. Go to **Settings → Pages**
1. Set **Source** to **GitHub Actions**
1. The included workflow at `.github/workflows/deploy-docs.yml` will build and deploy automatically on every push to `main`

## Contributing

If you spot any errors or outdated information, feel free to open an issue or submit a pull request.

## License

This project is documentation/reference material. See the individual engine repositories for their respective licenses.
