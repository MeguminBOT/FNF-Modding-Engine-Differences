# Chart / Song Converter

Convert chart and song data files between Friday Night Funkin' engines. Upload a file or paste your source data, pick the target format, and hit **Convert**.

[Report an issue with this tool](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?template=chart-converter-issue.yml){ #chart-btn-report-issue .md-button }

!!! warning "Beta Tool"
    Chart conversion is complex due to fundamental differences in how engines store note data (section-based vs absolute positioning). Always review and test the result in-engine before using it in your mod.

!!! info "Psych Engine Events"
    Psych Engine can store events in a separate `events.json` file. If your song uses one, you can upload it alongside the main chart file using the optional events file input below. The events will be merged into the conversion output.

<div id="chart-converter">

<div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 200px;">
    <label for="chart-source-engine"><strong>Source Engine</strong></label>
    <select id="chart-source-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="auto">Auto-detect</option>
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
    </select>
  </div>
  <div style="flex: 1; min-width: 200px;">
    <label for="chart-target-engine"><strong>Target Engine</strong></label>
    <select id="chart-target-engine" style="width: 100%; padding: 0.5rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
      <option value="funkin">Official Funkin</option>
      <option value="psych">Psych Engine</option>
    </select>
  </div>
</div>

<div style="margin-bottom: 1rem;">
  <label for="chart-file-upload" style="display: inline-block; padding: 0.6rem 1.5rem; border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 4px; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; background: var(--md-code-bg-color); color: var(--md-code-fg-color);">
    Click to upload a chart file (.json) or drag and drop
    <input type="file" id="chart-file-upload" accept=".json" style="display: none;">
  </label>
  <p id="chart-file-name" style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--md-default-fg-color--light);"></p>
</div>

<div id="psych-events-upload" style="margin-bottom: 1rem;">
  <label for="chart-events-upload" style="display: inline-block; padding: 0.5rem 1.25rem; border: 2px dashed var(--md-default-fg-color--lighter); border-radius: 4px; cursor: pointer; text-align: center; width: 100%; box-sizing: border-box; background: var(--md-code-bg-color); color: var(--md-code-fg-color); font-size: 0.9rem;">
    (Optional) Upload Psych Engine events.json
    <input type="file" id="chart-events-upload" accept=".json" style="display: none;">
  </label>
  <p id="chart-events-file-name" style="margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--md-default-fg-color--light);"></p>
</div>

<div style="margin-bottom: 1rem; display: flex; gap: 1.5rem; flex-wrap: wrap;">
  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
    <input type="checkbox" id="chart-strip-note-types"> Strip custom note types
  </label>
  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
    <input type="checkbox" id="chart-strip-events"> Strip events
  </label>
  <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
    <input type="checkbox" id="chart-strip-metadata"> Strip metadata (use defaults)
  </label>
</div>

<div style="display: flex; gap: 1rem; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 300px;">
    <label for="chart-input-data"><strong>Input (Chart)</strong></label>
    <textarea id="chart-input-data" rows="20" placeholder="Paste your chart JSON here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="chart-btn-convert" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #7e57c2; color: white; font-weight: bold; cursor: pointer; font-size: 0.95rem;">Convert</button>
      <button id="chart-btn-clear" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Clear</button>
    </div>
  </div>
  <div style="flex: 1; min-width: 300px;">
    <label for="chart-output-data"><strong>Output</strong></label>
    <textarea id="chart-output-data" rows="20" readonly placeholder="Converted output will appear here..." style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
    <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
      <button id="chart-btn-copy" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Copy Output</button>
      <button id="chart-btn-download" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #2e7d32; color: white; cursor: pointer; font-size: 0.95rem;">Download Output</button>
    </div>
  </div>
</div>

<p id="chart-converter-status" style="margin-top: 0.75rem; font-weight: bold;"></p>

<div id="chart-output-secondary-container" style="display: none; margin-top: 1rem;">
  <label for="chart-output-secondary"><strong>Output (Metadata)</strong> -- Official Funkin outputs a separate metadata file</label>
  <textarea id="chart-output-secondary" rows="12" readonly style="width: 100%; font-family: monospace; font-size: 0.85rem; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--md-default-fg-color--lighter); background: var(--md-code-bg-color); color: var(--md-code-fg-color); resize: vertical;"></textarea>
  <div style="margin-top: 0.75rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
    <button id="chart-btn-copy-meta" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #555; color: white; cursor: pointer; font-size: 0.95rem;">Copy Metadata</button>
    <button id="chart-btn-download-meta" style="padding: 0.6rem 1.5rem; border: none; border-radius: 4px; background: #2e7d32; color: white; cursor: pointer; font-size: 0.95rem;">Download Metadata</button>
  </div>
</div>

</div>

## Supported Fields

| Field                              | Funkin -> Psych       | Psych -> Funkin                 |
| ---------------------------------- | --------------------- | ------------------------------- |
| Notes (timing, direction, sustain) | Yes                   | Yes                             |
| Note types/kinds                   | Yes                   | Yes                             |
| BPM / BPM changes                  | Yes                   | Yes                             |
| Scroll speed                       | Yes                   | Yes                             |
| Events                             | Yes                   | Yes                             |
| Characters (player, opponent, gf)  | Yes                   | Yes                             |
| Stage                              | Yes                   | Yes                             |
| Song name                          | Yes                   | Yes                             |
| Section camera focus               | Generated from events | Generated from `mustHitSection` |
| Needs voices                       | Default true          | Yes                             |

!!! info "Conversion Notes"
    - **Psych to Funkin**: The `mustHitSection` flag is used to resolve note directions to absolute values (0-3 = player, 4-7 = opponent). Camera focus events are generated from `mustHitSection` changes.
    - **Funkin to Psych**: Notes are grouped into sections based on timing. `mustHitSection` is inferred from `FocusCamera` events. Section length defaults to 16 steps.
    - **Events**: Psych events use two string values (`value1`, `value2`). Funkin events use a JSON value object. Common events like camera focus are translated; others are carried over as-is.
    - **Separate events.json**: If you upload a Psych Engine `events.json` alongside the chart, events from both files are merged and sorted by time.
