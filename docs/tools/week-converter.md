# Week / Level Converter

Convert week/level data files between Friday Night Funkin' engines. Upload a file or paste your source data, pick the target format, and hit **Convert**.

[Report an issue with this tool](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?template=week-converter-issue.yml){ #week-btn-report-issue .md-button }

!!! warning "Beta Tool"
    This converter handles the most common fields. Engine-exclusive fields that have no equivalent in the target format will use sensible defaults. Always review the result before using it in your mod.

<div id="week-converter">

<div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 200px;">
    <label for="week-source-engine"><strong>Source Engine</strong></label>
    <select id="week-source-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="auto">Auto-detect</option>
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
      <option value="codename">Codename Engine</option>
    </select>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <label for="week-target-engine"><strong>Target Engine</strong></label>
    <select id="week-target-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
      <option value="codename">Codename Engine</option>
    </select>
  </div>
</div>

<div style="margin-bottom: 1rem;">
  <label for="week-file-upload" style="display: inline-block; padding: 0.6rem 1.5rem; border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 4px; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
    Click to upload a week file (.json / .xml) or drag and drop
    <input type="file" id="week-file-upload" accept=".json,.xml" style="display: none;">
  </label>
  <p id="week-file-name" style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--md-default-fg-color--light);"></p>
</div>

<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 300px;">
    <label for="week-input-data"><strong>Input</strong></label>
    <textarea id="week-input-data" rows="18" placeholder="Paste your week JSON or XML here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="week-btn-convert" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #7e57c2; color: white; font-weight: bold; cursor: pointer; font-size: 0.95rem;">Convert</button>
      <button id="week-btn-clear" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Clear</button>
    </div>
  </div>
  <div style="flex: 1; min-width: 300px;">
    <label for="week-output-data"><strong>Output</strong></label>
    <textarea id="week-output-data" rows="18" readonly placeholder="Converted output will appear here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="week-btn-copy" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Copy Output</button>
      <button id="week-btn-download" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #2e7d32; color: white; cursor: pointer; font-size: 0.95rem;">Download Output</button>
    </div>
  </div>
</div>

<p id="week-converter-status" style="margin-top: 0.75rem; font-weight: bold;"></p>

</div>

## Supported Fields

The converter maps these fields between engines:

| Field               | Funkin                | Psych              | Codename |
| ------------------- | --------------------- | ------------------ | -------- |
| Display name        | Yes                   | Yes                | Yes      |
| Song list           | Yes                   | Yes                | Yes      |
| Menu characters     | Partial (props array) | Yes                | Yes      |
| Background          | Yes                   | Yes                | No       |
| Visibility flags    | Yes                   | Yes                | No       |
| Difficulties        | No                    | Yes                | Yes      |
| Unlock ordering     | No                    | Yes (`weekBefore`) | No       |
| Per-song icon/color | No                    | Yes                | No       |

!!! info "Field Notes"
    - **Menu characters**: Official Funkin uses a `props` array with full animation data. The converter creates placeholder props when converting *to* Funkin, and extracts character names when converting *from* Funkin.
    - **Per-song icon/color**: Only Psych Engine stores an icon and color per song. When converting *to* Psych, a default icon (`"face"`) and grey color are used.
    - **Difficulties**: Psych uses a comma-separated string (empty = default Easy/Normal/Hard). Codename uses `<difficulty>` child nodes. Official Funkin stores difficulties in song metadata, not the level file.
    - **Background/sprite**: These map loosely between engines and are preserved as-is where possible.
