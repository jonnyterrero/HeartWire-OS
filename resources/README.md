# Resources Library

Reference materials used throughout the workspace.

## Categories

- Textbooks
- Research papers
- PDFs
- Images
- Datasets
- Datasheets

## Resource Management

See [RESOURCE_MANAGEMENT.md](./RESOURCE_MANAGEMENT.md) for background on how resources were parsed, organized, and merged into the (now legacy) study app.

## Legacy study-app pipeline

The Python scripts that originally parsed `resources/organized_links.md` and hydrated `Jonny_Study_App/index.html` have been archived because their target app is archived.

- Scripts: `archive/legacy-snapshots/scripts/`
- Target app: `archive/legacy-snapshots/5amClub/5-engineering-projects/Jonny_Study_App/`

To run the pipeline against a rebuilt canonical study app, port the scripts back into `system/automations/` with updated paths.

## Files in this folder

- `organized_resources.json` — structured resources data (output of the archived parser).
- `organized_links.md` — raw source links catalog.
- `RESOURCE_MANAGEMENT.md` — full documentation of the legacy pipeline.
- `Structure rough draft*.ini` — historical drafts of the workspace taxonomy (pre-HeartWire OS).
