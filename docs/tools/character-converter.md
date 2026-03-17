# Character Converter

Convert character data files between Friday Night Funkin' engines. Upload a file or paste your source data, pick the target format, and hit **Convert**.

[Report an issue with this tool](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?template=character-converter-issue.yml){ #btn-report-issue .md-button }

!!! warning "Beta Tool"
    This converter handles the most common fields. Engine-exclusive fields that have no equivalent in the target format will be noted in the output as comments. Always review the result before using it in your mod.

<div id="char-converter">

<div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 200px;">
    <label for="source-engine"><strong>Source Engine</strong></label>
    <select id="source-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="auto">Auto-detect</option>
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
      <option value="codename">Codename Engine</option>
    </select>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <label for="target-engine"><strong>Target Engine</strong></label>
    <select id="target-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
      <option value="codename">Codename Engine</option>
    </select>
  </div>
</div>

<div style="margin-bottom: 1rem;">
  <label for="file-upload" style="display: inline-block; padding: 0.6rem 1.5rem; border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 4px; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
    Click to upload a character file (.json / .xml) or drag and drop
    <input type="file" id="file-upload" accept=".json,.xml" style="display: none;">
  </label>
  <p id="file-name" style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--md-default-fg-color--light);"></p>
</div>

<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 300px;">
    <label for="input-data"><strong>Input</strong></label>
    <textarea id="input-data" rows="20" placeholder="Paste your character JSON or XML here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="btn-convert" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #7e57c2; color: white; font-weight: bold; cursor: pointer; font-size: 0.95rem;">Convert</button>
      <button id="btn-clear" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Clear</button>
    </div>
  </div>
  <div style="flex: 1; min-width: 300px;">
    <label for="output-data"><strong>Output</strong></label>
    <textarea id="output-data" rows="20" readonly placeholder="Converted output will appear here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="btn-copy" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Copy Output</button>
      <button id="btn-download" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #2e7d32; color: white; cursor: pointer; font-size: 0.95rem;">Download Output</button>
    </div>
  </div>
</div>

<p id="converter-status" style="margin-top: 0.75rem; font-weight: bold;"></p>

</div>

## Supported Fields

The converter maps these fields between engines:

| Field                | Funkin | Psych                   | Codename                |
| -------------------- | ------ | ----------------------- | ----------------------- |
| Animations           | Yes    | Yes                     | Yes                     |
| Spritesheet path     | Yes    | Yes                     | Yes                     |
| Scale                | Yes    | Yes                     | Yes                     |
| Sing hold time       | Yes    | Yes                     | Yes                     |
| Health icon          | Yes    | Yes                     | Yes                     |
| Position offsets     | Yes    | Yes                     | Yes                     |
| Camera offsets       | Yes    | Yes                     | Yes                     |
| Flip X               | Yes    | Yes                     | Yes                     |
| Antialiasing / Pixel | Yes    | Yes                     | Yes                     |
| Health bar color     | No     | Yes                     | Yes                     |
| Starting animation   | Yes    | Partial (first in list) | Partial (first in list) |
| Game over character  | Yes    | No                      | Yes                     |
| Is player            | No     | No                      | Yes                     |

!!! info "Field Notes"
    - **Health bar color**: Official Funkin stores this elsewhere, not in the character file. When converting _to_ Funkin, this field is dropped. When converting _from_ Funkin to Psych/Codename, a default grey is used.
    - **Starting animation**: Psych and Codename use the first animation in the list as the default. The converter places the starting animation first when targeting these engines.
    - **Game over character**: Only Funkin and Codename store this. It is dropped or set to a default when not available.
