# Workspace Diff Defaults

Whenever you edit code in this repo, VS Code should open a _side-by-side_ comparison view (not a unified/inline diff), showing the file you are currently changing on the right and the previous version on the left. These defaults are enforced by the workspace settings file (`.vscode/settings.json`), which sets:

- `diffEditor.renderSideBySide`: `true` (prevents inline diff)
- `diffEditor.useInlineViewWhenSpaceIsLimited`: `false`
- `git.openDiffOnClick`: `true` (opening a file from Source Control immediately shows the diff)

## Consuming this setup on another machine

1. Sync this repository to the other computer via your usual workflow (e.g. `git clone` / `git pull`). The tracked `.vscode/settings.json` will travel with the repo, so VS Code applies the same diff defaults automatically.
2. Keep your VS Code Settings Sync (if you use it) turned on so workspace settings are honored alongside your personal preferences.
3. When you open Source Control (`Ctrl+Shift+G`) and click a modified file, VS Code now opens the left/right diff. If the editor ever falls back into inline mode, use the diff toolbar menu at the top-right of the diff and uncheck “Inline View.”

With this in place, every time either of us edits a file the diff opens in the split view you want, and the behavior follows you across machines as long as you keep this workspace synced.

## Applying the behavior globally

VS Code workspace settings live inside the repo, so they only affect this project. To make the same side-by-side diff experience consistent across every workspace (project-agnostic), enable these settings in your **User Settings** (`settings.json` under your user profile):

```json
{
	"diffEditor.renderSideBySide": true,
	"diffEditor.useInlineViewWhenSpaceIsLimited": false,
	"git.openDiffOnClick": true
}
```

If you use VS Code Settings Sync, these preferences will automatically follow you to other machines. Otherwise, copy the snippet into each installation's user settings file to guarantee the left/right comparison view everywhere.
