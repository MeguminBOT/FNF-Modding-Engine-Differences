# Stage Data Converter

Convert stage metadata files between Friday Night Funkin' engines. Upload a file or paste your source data, pick the target format, and hit **Convert**.

[Report an issue with this tool](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?template=stage-converter-issue.yml){ #stage-btn-report-issue .md-button }

!!! warning "Beta Tool"
    This converter handles stage **metadata** (camera zoom, character positions, camera offsets). Stage **visuals** (sprites, props, Lua scripts) cannot be automatically converted and must be recreated manually in the target engine. Always review and test the result in-engine.

!!! info "Psych Engine Lua Scripts"
    Psych Engine stages can have a companion Lua script (`stages/<name>.lua`) that creates sprites and handles scripted behavior. This converter only handles the JSON metadata — the Lua stage script must be converted separately using the Script Converter tool.

<div id="stage-converter">

<div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 200px;">
    <label for="stage-source-engine"><strong>Source Engine</strong></label>
    <select id="stage-source-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="auto">Auto-detect</option>
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
      <option value="codename">Codename Engine</option>
    </select>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <label for="stage-target-engine"><strong>Target Engine</strong></label>
    <select id="stage-target-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
      <option value="codename">Codename Engine</option>
    </select>
  </div>
</div>

<div style="margin-bottom: 1rem;">
  <label for="stage-file-upload" style="display: inline-block; padding: 0.6rem 1.5rem; border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 4px; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
    Click to upload a stage file (.json / .xml) or drag and drop
    <input type="file" id="stage-file-upload" accept=".json,.xml" style="display: none;">
  </label>
  <p id="stage-file-name" style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--md-default-fg-color--light);"></p>
</div>

<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 300px;">
    <label for="stage-input-data"><strong>Input</strong></label>
    <textarea id="stage-input-data" rows="20" placeholder="Paste your stage JSON or XML here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="stage-btn-convert" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #7e57c2; color: white; font-weight: bold; cursor: pointer; font-size: 0.95rem;">Convert</button>
      <button id="stage-btn-clear" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Clear</button>
    </div>
  </div>
  <div style="flex: 1; min-width: 300px;">
    <label for="stage-output-data"><strong>Output</strong></label>
    <textarea id="stage-output-data" rows="20" readonly placeholder="Converted output will appear here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="stage-btn-copy" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Copy Output</button>
      <button id="stage-btn-download" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #2e7d32; color: white; cursor: pointer; font-size: 0.95rem;">Download Output</button>
    </div>
  </div>
</div>

<p id="stage-converter-status" style="margin-top: 0.75rem; font-weight: bold;"></p>

</div>

## Supported Fields

| Field                | Funkin -> Psych | Psych -> Funkin | Funkin -> Codename | Codename -> Funkin | Psych -> Codename | Codename -> Psych |
| -------------------- | --------------- | --------------- | ------------------ | ------------------ | ----------------- | ----------------- |
| Camera zoom          | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| BF position          | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| Dad position         | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| GF position          | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| BF camera offset     | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| Dad camera offset    | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| GF camera offset     | Yes             | Yes             | Yes                | Yes                | Yes               | Yes               |
| Hide girlfriend      | Partial         | Partial         | Partial            | Partial            | Partial           | Partial           |
| Stage name           | Yes             | Default         | Yes                | Yes                | Default           | Yes               |
| Camera speed         | No              | No              | No                 | No                 | No                | No                |
| Props/Sprites        | No              | No              | No                 | No                 | No                | No                |
| Character z-index    | Dropped         | Default         | Dropped            | Default            | Default           | Dropped           |

!!! info "Conversion Notes"
    - **Props/Sprites**: Stage visuals (background sprites, foreground elements) are stored differently in each engine and cannot be automatically converted. Funkin uses a `props[]` array, Psych uses Lua scripts, and Codename uses XML `<sprite>` nodes. These must be recreated manually.
    - **Hide girlfriend**: Psych uses an explicit `hide_girlfriend` boolean. In Funkin and Codename, this is handled by omitting the girlfriend character or using an empty character — the converter preserves the flag where possible.
    - **Camera speed**: Psych Engine's `camera_speed` field has no direct equivalent in other engines.
    - **Character z-index**: Funkin uses numeric `zIndex` values. Defaults (bf=300, dad=200, gf=100) are used when converting to Funkin.
