# Git + OneDrive safety guards

These scripts reduce accidental repo wipes and OneDrive/git conflicts for HeartWire OS.

## Quick setup (run once per clone)

```powershell
pwsh -File scripts/git/setup-onedrive-guards.ps1
```

This configures local git settings and installs repo hooks via `core.hooksPath`.

## What gets installed

| Guard | Purpose |
| --- | --- |
| `pre-commit` | Blocks commits with mass staged deletions (accidental wipe protection) |
| `pre-push` | Blocks force-push to `main` / `master` |
| Local git config | OneDrive-safe settings (`core.fscache=false`, `core.longpaths=true`, etc.) |

## Health check

```powershell
pwsh -File scripts/git/health-check.ps1
```

Reports OneDrive path risk, remote/upstream sync, hook installation, and deletion counts.

## OneDrive best practices

1. **Always keep on this device** for this repo folder (avoid cloud-only placeholders during git operations).
2. **Pause OneDrive sync** before large `git checkout`, `git restore`, or `git reset` operations.
3. **Prefer a dev clone outside OneDrive** for day-to-day coding (`C:\Dev\HeartWire-OS`), keep OneDrive as backup/mirror if needed.
4. Run the health check if git commands hang or files look deleted.

## Emergency bypass (use sparingly)

```powershell
$env:HEARTWIRE_GIT_GUARD_SKIP = '1'
git commit -m "intentional change"
Remove-Item Env:HEARTWIRE_GIT_GUARD_SKIP
```
