# Changelog

Live feed of recent changes from the [GitHub repository](https://github.com/MeguminBOT/FNF-Modding-Engine-Differences).
Click any commit to view its diff.

<div id="changelog-app">
  <div id="changelog-controls" style="display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap;">
    <button id="changelog-refresh" class="md-button" style="font-size: 0.8rem;">Refresh</button>
    <span id="changelog-status" style="font-size: 0.8rem; opacity: 0.7;"></span>
  </div>
  <div id="changelog-list"></div>
  <div id="changelog-pagination" style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;"></div>
</div>

<style>
  .cl-commit {
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    overflow: hidden;
    background: var(--md-code-bg-color);
  }
  .cl-commit-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    user-select: none;
    transition: background 0.15s;
  }
  .cl-commit-header:hover {
    background: var(--md-default-fg-color--lightest);
  }
  .cl-sha {
    font-family: var(--md-code-font-family);
    font-size: 0.78rem;
    color: var(--md-accent-fg-color);
    white-space: nowrap;
    min-width: 5.5em;
    padding-top: 0.15em;
  }
  .cl-info {
    flex: 1;
    min-width: 0;
  }
  .cl-msg {
    font-weight: 600;
    font-size: 0.9rem;
    word-break: break-word;
    white-space: pre-wrap;
  }
  .cl-body {
    font-size: 0.8rem;
    opacity: 0.7;
    white-space: pre-wrap;
    margin-top: 0.25rem;
    word-break: break-word;
  }
  .cl-meta {
    font-size: 0.75rem;
    opacity: 0.6;
    margin-top: 0.25rem;
  }
  .cl-arrow {
    font-size: 0.7rem;
    transition: transform 0.2s;
    padding-top: 0.25em;
    opacity: 0.5;
  }
  .cl-commit.open .cl-arrow {
    transform: rotate(90deg);
  }
  .cl-diff-container {
    display: none;
    border-top: 1px solid var(--md-default-fg-color--lightest);
    padding: 0.5rem;
  }
  .cl-commit.open .cl-diff-container {
    display: block;
  }
  .cl-diff-loading {
    padding: 1rem;
    text-align: center;
    font-size: 0.85rem;
    opacity: 0.6;
  }
  .cl-diff-summary {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
    font-size: 0.78rem;
    opacity: 0.65;
    border-radius: 4px;
    background: var(--md-default-fg-color--lightest);
  }
  .cl-diff-summary .add { color: #2cbe4e; font-weight: 600; }
  .cl-diff-summary .del { color: #f85149; font-weight: 600; }
  .cl-expand-all {
    margin-left: auto;
    cursor: pointer;
    font-size: 0.75rem;
    opacity: 0.8;
    background: none;
    border: 1px solid var(--md-default-fg-color--lightest);
    color: var(--md-default-fg-color);
    border-radius: 4px;
    padding: 0.15rem 0.5rem;
  }
  .cl-expand-all:hover { opacity: 1; }
  .cl-diff-file {
    border: 1px solid var(--md-default-fg-color--lightest);
    border-radius: 6px;
    margin-bottom: 0.4rem;
    overflow: hidden;
    background: var(--md-code-bg-color);
  }
  .cl-diff-file-header {
    padding: 0.45rem 0.75rem;
    font-family: var(--md-code-font-family);
    font-size: 0.78rem;
    font-weight: 600;
    background: var(--md-default-fg-color--lightest);
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
    gap: 0.5rem;
  }
  .cl-diff-file-header:hover {
    filter: brightness(1.1);
  }
  .cl-diff-file-arrow {
    font-size: 0.6rem;
    transition: transform 0.2s;
    opacity: 0.5;
    flex-shrink: 0;
  }
  .cl-diff-file.open .cl-diff-file-arrow {
    transform: rotate(90deg);
  }
  .cl-diff-file-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cl-diff-file-name em {
    opacity: 0.6;
    font-weight: normal;
  }
  .cl-diff-stat {
    font-weight: normal;
    font-size: 0.72rem;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .cl-diff-stat .add { color: #2cbe4e; }
  .cl-diff-stat .del { color: #f85149; }
  .cl-diff-body {
    display: none;
    max-height: 50vh;
    overflow: auto;
  }
  .cl-diff-file.open .cl-diff-body {
    display: block;
  }
  .cl-diff-hunk {
    font-family: var(--md-code-font-family);
    font-size: 0.65rem;
    padding: 0.2rem 0.6rem;
    opacity: 0.45;
    background: var(--md-code-bg-color);
    border-top: 1px solid var(--md-default-fg-color--lightest);
  }
  .cl-diff-line {
    font-family: var(--md-code-font-family);
    font-size: 0.65rem;
    padding: 0.02rem 0.6rem;
    white-space: pre-wrap;
    word-break: break-all;
    display: flex;
    line-height: 1.4;
  }
  .cl-diff-line .ln {
    display: inline-block;
    min-width: 2.5em;
    text-align: right;
    padding-right: 0.5em;
    opacity: 0.3;
    user-select: none;
    flex-shrink: 0;
  }
  .cl-diff-line .code {
    flex: 1;
    min-width: 0;
  }
  .cl-diff-add {
    background: rgba(46, 160, 67, 0.15);
  }
  .cl-diff-del {
    background: rgba(248, 81, 73, 0.15);
  }
  .cl-page-btn {
    padding: 0.3rem 0.75rem;
    border-radius: 4px;
    border: 1px solid var(--md-default-fg-color--lightest);
    background: var(--md-code-bg-color);
    color: var(--md-default-fg-color);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .cl-page-btn:hover {
    background: var(--md-default-fg-color--lightest);
  }
  .cl-page-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .cl-error {
    padding: 1rem;
    text-align: center;
    color: #f85149;
    font-size: 0.85rem;
  }
  .cl-empty {
    padding: 2rem;
    text-align: center;
    opacity: 0.5;
  }
</style>
