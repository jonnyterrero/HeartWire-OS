# archive/legacy-snapshots/

Quarantine area for deprecated full-workspace snapshots.

## What belongs here

This folder is intended to hold full-workspace mirrors that predate the HeartWire OS restructure. During Stage A of the migration they are identified but **not yet relocated** — they remain at the repo root as:

- `5amClub/`
- `5amClub-1/`

These are near-duplicates of the old numeric taxonomy (including nested copies of `0-docs/` through `9-archive/`) and, in some cases, nested copies of the platform app under `5-engineering-projects/platform/5amClub*/`.

## Why they are not copied here yet

They are byte-for-byte duplicates of content already migrated into the canonical new structure (`core/`, `learning/`, `build/`, `system/`, `resources/`, `archive/`). Copying them into quarantine would roughly double the repo size (thousands of OneDrive-backed PDFs and DOCX files, many of which are currently cloud-only and do not hydrate reliably through `robocopy`).

## Cleanup plan

During the later cleanup stage, after verification:

1. Confirm the canonical copies under `core/…/archive/` cover everything useful in the legacy snapshots.
2. `git mv` (or plain move) the legacy folders into this directory:
   - `5amClub/` → `archive/legacy-snapshots/5amClub/`
   - `5amClub-1/` → `archive/legacy-snapshots/5amClub-1/`
   - also sweep any nested mirrors under `build/projects/platform/5amClub*` if they persist.
3. Keep them here for one release cycle before deleting in a follow-up commit.

## Rules

- Do not edit anything under this directory. It is a read-only historical reference.
- Do not write new content here. New content belongs in the canonical top-level folders (`core/`, `learning/`, `build/`, `system/`, `resources/`, `archive/`).
- AI agents should ignore this directory for content authoring.
