# HeartWire OS — Migration Status & Fix-Forward List

Status as of **Stage A + B + C + D completion + post-cleanup verification pass**. This document tracks what has moved, what has been updated, and what follow-ups remain (deployments, GitHub rename, platform branding).

> Migration strategy: **copy-first, non-destructive** through Stage C; **Stage D cleanup executed**. Old numeric folders (`0-docs/` … `9-archive/`) have been deleted from the repo root. Legacy workspace mirrors (`5amClub/`, `5amClub-1/`) are now quarantined read-only under `archive/legacy-snapshots/`.

---

## 1. Stage A — copy-first migration

### Folder mapping (executed)

| Old path | New canonical path | Notes |
| :--- | :--- | :--- |
| `0-docs/` | `core/` | Updated in place (README, onboarding, mission, systems-architecture, ai-agent-rules). |
| `1-self-study/` | `learning/self-study/` | |
| `2-coursework/` (excluding nested mirrors) | `learning/coursework/` | Nested mirrors `2-coursework/5amClub/` and `2-coursework/5amClub-1/` were **not** copied. |
| `3-cheatsheets/` | `learning/cheatsheets/` | |
| `4-homework/` | `learning/problem-solving/` | Renamed semantically. |
| `5-engineering-projects/` (excluding nested mirrors, `node_modules`, `.next`, `.git`) | `build/projects/` | |
| `6-product-dev/` | `build/prototypes/heartwire/` | Provisional placement — see §5 below. |
| `7-automations/` | `system/automations/` | |
| `8-resources/` | `resources/` | |
| `9-archive/` | `archive/` | `archive/legacy-snapshots/` is a new subfolder created for Stage D. |

### New folders created but not yet populated

These top-level semantic folders exist in the HeartWire OS architecture and are intentionally empty until real content lands:

- `learning/notes/`
- `build/apps/`
- `build/hardware/`
- `build/experiments/`
- `system/agents/`
- `system/integrations/`
- `system/pipelines/`

### File-count verification

| Source | Src files (real) | New path | Dst files | Delta | Status |
| :--- | ---: | :--- | ---: | ---: | :--- |
| `0-docs/` | 13 | `core/` | 14 | +1 (new `MIGRATION-STATUS.md`) | ✅ complete |
| `1-self-study/` | 13 | `learning/self-study/` | 13 | 0 | ✅ complete |
| `2-coursework/` | 1353 | `learning/coursework/` | 1353 | 0 | ✅ complete (6 stragglers rescued via `Move-Item` during Stage D, preserved as OneDrive placeholders at the canonical path) |
| `3-cheatsheets/` | 32 | `learning/cheatsheets/` | 32 | 0 | ✅ complete |
| `4-homework/` | 7 | `learning/problem-solving/` | 7 | 0 | ✅ complete |
| `5-engineering-projects/` | 80 | `build/projects/` | 80 | 0 | ✅ complete |
| `6-product-dev/` | 2 | `build/prototypes/heartwire/` | 2 | 0 | ✅ complete |
| `7-automations/` | 2 | `system/automations/` | 2 | 0 | ✅ complete |
| `8-resources/` | 19 | `resources/` | 19 | 0 | ✅ complete |
| `9-archive/` | 11 | `archive/` | 11 | 0 | ✅ complete |
| **Total** | **1532** | | **1533** | **+1** | **100% migrated** (extra file = `MIGRATION-STATUS.md`) |

### OneDrive cloud-only stragglers — resolved during Stage D

These files persistently returned `ERROR 389/426` to `robocopy` and `Copy-Item` because OneDrive refused to hydrate them. They were rescued during Stage D by using `Move-Item` (which operates on the reparse-point metadata without requiring hydration) to relocate each placeholder from `2-coursework/…` to `learning/coursework/…`. They remain as cloud-only placeholders and will hydrate on demand when OneDrive allows.

1. `learning/coursework/Biomedical_Engineering/Biomaterials/Biomaterials P.II/unfiled/Grading Excell File - BME_3100C_Biomaterials_2025.xlsx`
2. `learning/coursework/Physiology_for_Engineers/Physiology_for_Engineers_I/3- Homework Assignments and Programs/Physiology Hw attempts/hw3q2and3.xlsx`
3. `learning/coursework/Physiology_for_Engineers/Physiology_for_Engineers_I/physiology/chemistry/2046L_Exp_05_Keq_Excel_Pasishnyk.xlsx`
4. `learning/coursework/Physiology_for_Engineers/Physiology_for_Engineers_I/physiology/chemistry/Calorimetry data.xlsx`
5. `learning/coursework/Physiology_for_Engineers/Physiology_for_Engineers_I/physiology/chemistry/Exp 04 Excel Tables(finished).xlsx`
6. `learning/coursework/Physiology_for_Engineers/Physiology_for_Engineers_I/physiology/chemistry/Exp 04 Excel Tables.xlsx`

No further action required — right-clicking each file in File Explorer → **Always keep on this device** will hydrate them in place.

### Legacy full-workspace mirrors (not copied)

The following are byte-level duplicates of the old taxonomy and were intentionally **not** copied during Stage A (they would roughly double the repo size and hit the same OneDrive wall):

- `5amClub/` at repo root (full workspace mirror)
- `5amClub-1/` at repo root (second full workspace mirror)
- `2-coursework/5amClub/` and `2-coursework/5amClub-1/` (nested inside coursework)
- `5-engineering-projects/platform/5amClub/` and `5-engineering-projects/platform/5amClub-1/` (nested inside the platform app)

They are tracked for relocation into `archive/legacy-snapshots/` during Stage D cleanup. See [`../archive/legacy-snapshots/README.md`](../archive/legacy-snapshots/README.md) for the deferred plan.

---

## 2. Stage B — canonical docs updated

Updated to reflect HeartWire OS branding and the new semantic taxonomy:

- [`../README.md`](../README.md) — root landing page rewritten around the HeartWire OS architecture.
- [`README.md`](./README.md) — rewritten for `core/`.
- [`onboarding.md`](./onboarding.md) — all folder links repointed to `learning/*`, `build/*`, `system/*`, `resources/`, `archive/`.
- [`ai-agent-rules.md`](./ai-agent-rules.md) — file-storage table and boundary rules updated.
- [`mission.md`](./mission.md) — rebranded to HeartWire OS.
- [`systems-architecture.md`](./systems-architecture.md) — rewritten with the new top-level taxonomy and subfolder purpose.
- [`wiki/Home.md`](./wiki/Home.md) — wiki home rebranded.
- [`wiki/AI-Agent-Rules.md`](./wiki/AI-Agent-Rules.md) — mirror of canonical rules with new paths.
- [`wiki/Directory-Structure.md`](./wiki/Directory-Structure.md) — marked stale, now shows the new tree plus the legacy snapshot for reference.

### Not yet touched (low signal, to refresh later)

- `core/wiki/Mission.md` — duplicate of `mission.md`, still references "5amClub workspace".
- `core/wiki/Philosophy.md` — general philosophy, no structural references.
- `core/wiki/Self-Study-Framework.md` — no path references found.
- `core/wiki/GlucoLoop-System-Architecture.md` — project-specific, no repo-structure references.
- `core/learning-roadmap.md` — scoped to learning content, no structural references.

These can be refreshed opportunistically; none block the migration.

---

## 3. Stage C — path audit & fix-forward list

### 3a. References to old numeric paths inside the new canonical tree

After cleanup:

| Location | Status | Action |
| :--- | :--- | :--- |
| `core/wiki/Directory-Structure.md` | ⚠ contains legacy tree | Marked stale in-place; full regen after Stage D cleanup. |
| Everything else under `core/`, `learning/`, `build/`, `system/`, `resources/`, `archive/` | ✅ clean | No numeric-prefix paths found. |

### 3b. References inside the platform app (`build/projects/platform/`)

These reference the string `5amClub` or `5amClub Platform` as **app branding**, not as filesystem paths. They are product-level decisions, not repo-structure issues:

| File | Line | Content | Recommendation |
| :--- | ---: | :--- | :--- |
| `src/app/layout.tsx` | 7 | `title: "5amClub Platform"` | Decide product name before change. |
| `src/app/login/page.tsx` | 68 | `<span …>5amClub</span>` | Same. |
| `src/components/layout/Sidebar.tsx` | 112, 130, 155, 238 | Brand label + comments ("matches 5amClub OS v6 layout") | Same. Comments can be updated freely; the visible brand string needs a product decision. |
| `prisma/seed.ts` | 7 | Comment: "matching the 5amClub workspace resource guide" | Safe to rename to "HeartWire OS workspace resource guide" in a dedicated PR. |
| `public/manifest.json` | 2-3 | PWA `name` / `short_name` | **Warning: changing PWA name can invalidate installed app state.** Do not change silently. |
| `.env.example` | 2 | Comment header | Safe to rename. |

**Suggested approach:** treat the platform app's product name as independent from the repo name. The repo is **HeartWire OS**; the app inside it can remain **5amClub Platform** or be rebranded — that's a separate product decision.

### 3c. Deployment / build config audit

Files checked for hardcoded path assumptions:

| File | Risk | Finding |
| :--- | :--- | :--- |
| `build/projects/platform/package.json` | Low | Scripts use `prisma generate && next build`; no path to old numeric folders. |
| `build/projects/platform/vercel.json` | Low | Standard Vercel config; no repo-relative paths. |
| `build/projects/platform/next.config.mjs` | Low | PWA plugin config only. |
| `build/projects/Jonny_Study_App/vercel.json`, `netlify.toml` | Low | Same — no repo-structure references. |

**Implication:** deployments configured against `5-engineering-projects/platform/` or `5-engineering-projects/Jonny_Study_App/` (absolute paths set in Vercel/Netlify dashboards) **must be re-pointed** to `build/projects/platform/` and `build/projects/Jonny_Study_App/` **before Stage D cleanup removes the old folders**. Track this as a dashboard action, not a code change.

### 3d. Scripts / tooling

No Python/JS scripts at the repo root were found to hardcode numeric paths (`0-docs/`, `1-self-study/`, …). Any in-subfolder scripts that did reference them still run from their own folder, so they are unaffected by the root restructure.

---

## 3e. Stage D — cleanup (executed)

Executed in order:

1. **Rescue** — the 6 OneDrive stragglers in `2-coursework/…` were relocated via `Move-Item` (which does not require hydration) to their canonical `learning/coursework/…` paths. All 6 are now present as cloud placeholders; file-count parity is restored (1353/1353).
2. **Quarantine** — `5amClub/` and `5amClub-1/` at the repo root were moved into `archive/legacy-snapshots/5amClub/` and `archive/legacy-snapshots/5amClub-1/`. They remain read-only per the rules in `core/ai-agent-rules.md`.
3. **Delete old numeric roots** — `0-docs/`, `1-self-study/`, `2-coursework/`, `3-cheatsheets/`, `4-homework/`, `5-engineering-projects/`, `6-product-dev/`, `7-automations/`, `8-resources/`, `9-archive/` were removed. A nested reparse-point junction inside `2-coursework/` required a second-pass delete after clearing attributes; no actual file loss occurred (the junction pointed at content already preserved elsewhere).
4. **Housekeeping** —
   - `HeartWire OS.ini` moved to `core/HeartWire OS.ini` as an archival copy of the target blueprint.
   - `fix_resources.py`, `parse_resources.py`, `merge_resources.py`, and `consolidate_courses.py` were moved from `resources/` (and the old repo root) into `archive/legacy-snapshots/scripts/` because their hardcoded targets (`5-engineering-projects/Jonny_Study_App/index.html`) are themselves legacy artifacts.
   - `resources/README.md` and `resources/RESOURCE_MANAGEMENT.md` were updated to point at the archived scripts and mark the pipeline as legacy.
   - Root `README.md` migration note was updated to past tense.

### Post-cleanup verification

| Check | Result |
| :--- | :--- |
| Required top-level dirs (`core`, `learning`, `build`, `system`, `resources`, `archive`) | ✅ all present |
| All required subfolders (17 total) | ✅ all present |
| `build/projects/platform/{package.json, next.config.mjs, vercel.json, prisma/}` | ✅ all present |
| 6 rescued OneDrive files at canonical paths | ✅ all present |
| Nested `5amClub`/`5amClub-1` mirrors in canonical tree | ✅ none found |
| Reparse-point junctions in canonical tree | ✅ none found |
| `learning/coursework/` file count | ✅ 1353 (matches source) |
| Deploy configs colocated with apps (`vercel.json`/`netlify.toml`) | ✅ `build/projects/5amclubOS/` and `build/projects/platform/` |
| Old numeric paths in canonical docs | ✅ only intentional references remain (migration note, this audit doc, pointers into `archive/legacy-snapshots/`) |
| Old numeric paths in build/deploy configs | ✅ none |
| Root `README.md` links into `archive/legacy-snapshots/` | ✅ only as a quarantine notice, not as navigation |
| Git branch / upstream | ✅ `Backend-development` → `origin/Backend-development` |

### Post-cleanup git working tree

- **~180 `D` entries** — expected: deletions from the old numeric tree awaiting a commit.
- **7 `??` entries** — expected: new canonical top-level dirs (`archive`, `build`, `core`, `learning`, `resources`, `system`) plus `.claude` and untracked binaries under `Obsidian Vault/`.
- **1 `M` entry** — `README.md` (migration-note update).
- No renames are tracked — git sees the migration as delete+add because the copy-first strategy moved content at the filesystem level rather than via `git mv`. This is by design; similarity-detection on commit (`git diff -M`) will still surface the renames in review.

---

## 3f. Stage E — Git LFS configuration (executed)

Decision: **all binaries over ~10 MB are routed through Git LFS** so the repo keeps every resource (textbooks, lecture slides, videos, CAD/MATLAB binaries) without tripping GitHub's 100 MB hard limit or bloating shallow clones.

- `git lfs install --local` — LFS hooks installed for this worktree.
- `.gitattributes` rewritten to declare LFS tracking for documents (`*.pdf`, `*.ppt`, `*.pptx`, `*.pptm`, `*.doc`, `*.docx`, `*.xlsm`, `*.od{p,t,s}`), media (`*.mp4`, `*.mov`, `*.avi`, `*.mkv`, `*.webm`, `*.m4a`, `*.mp3`, `*.wav`, `*.flac`), archives (`*.zip`, `*.rar`, `*.7z`, `*.tar`, `*.gz`, `*.tgz`, `*.bz2`), design files, MATLAB/Simulink binaries (`*.slx`, `*.slxc`, `*.mlx`), CAD (`*.sldprt`, `*.sldasm`, `*.step`, `*.stl`, …), ML artifacts (`*.h5`, `*.pkl`, `*.onnx`, `*.safetensors`, `*.pt`, …), fonts, and high-resolution images (`*.tif`, `*.psd`, `*.psb`). Standard line-ending rules were preserved.
- Filter routing verified with `git check-attr` on representative `.pdf`, `.pptx`, `.mp4`, and `.md` samples. Binary patterns report `filter: lfs`; text files report `filter: unspecified`, as expected.

### Payload after LFS patterning

| Bucket | Files | Size |
| :--- | ---: | ---: |
| LFS-tracked binaries | 1,121 | 3.67 GB |
| Regular git (code, markdown, small assets) | 407 | 0.02 GB |
| **Total staging footprint** | **1,528** | **3.68 GB** |

Both of the previously-blocking 173 MB `.mp4` files are now LFS-bound, so the working tree has **zero** files exceeding the 100 MB GitHub hard limit.

### GitHub LFS quota requirement

Free tier: 1 GB storage + 1 GB bandwidth/month. HeartWire OS needs:

- **Storage**: 3.67 GB → 1 Data Pack ($5/mo → +50 GB).
- **Bandwidth**: every fresh `git clone` pulls the full 3.67 GB of LFS content. Free bandwidth caps at ~1 clone per 3 months. Add another Data Pack if CI, external contributors, or laptop re-clones are expected.

→ **Action before `git push`**: purchase at least **1 Data Pack** at `https://github.com/settings/billing` (Git LFS Data Pack). Without it, the initial push will abort mid-upload once the 1 GB free allowance is exhausted.

---

## 4. Duplicate-content inventory

The legacy mirrors are near-exact duplicates of each other and of the old numeric tree. Before Stage D, decide which snapshot (if any) to keep:

| Path | Relationship | Recommended fate |
| :--- | :--- | :--- |
| `5amClub/` | Full workspace mirror | Move to `archive/legacy-snapshots/5amClub/` during Stage D. |
| `5amClub-1/` | Full workspace mirror | Move to `archive/legacy-snapshots/5amClub-1/` during Stage D. |
| `2-coursework/5amClub/`, `2-coursework/5amClub-1/` | Nested mirrors inside coursework | Delete in Stage D (fully covered by the top-level mirrors). |
| `5-engineering-projects/platform/5amClub/`, `5-engineering-projects/platform/5amClub-1/` | Nested mirrors inside the platform app | Delete in Stage D (same reason). |

---

## 5. Decision needed: `build/prototypes/heartwire/` placement

`6-product-dev/HeartWire/` was provisionally copied to `build/prototypes/heartwire/`. Revisit once there are more than 2 files inside:

- If it becomes a **runnable app** → promote to `build/apps/heartwire/`.
- If it becomes an **active engineering build** → promote to `build/projects/heartwire/`.
- If it stays as **brand / design exploration** → keep under `build/prototypes/heartwire/`.

---

## 6. What's still pending

- [x] ~~Stage D — cleanup: delete old numeric folders and quarantine workspace mirrors.~~ ✅ done.
- [x] ~~Rescue the 6 OneDrive stragglers.~~ ✅ moved via `Move-Item` into canonical paths as placeholders.
- [x] ~~Stage E — configure Git LFS for binaries.~~ ✅ `.gitattributes` rewritten; `git lfs install --local` run; routing verified.
- [ ] Hydrate the 6 OneDrive placeholders in File Explorer (right-click → "Always keep on this device"). Non-blocking; they are already in the correct canonical path.
- [ ] **Purchase 1 × GitHub Git LFS Data Pack** ($5/mo) before the first push — required to host the 3.67 GB of LFS content.
- [ ] Re-point any Vercel/Netlify deployments from `5-engineering-projects/...` to `build/projects/...`. **Now required** — the old paths no longer exist.
- [ ] Decide platform app branding (keep "5amClub Platform" or rebrand to HeartWire). Independent of the repo restructure.
- [ ] Rename the GitHub remote from `5amClub` to `heartwire-os`.
- [ ] Regenerate `core/wiki/Directory-Structure.md` with the live post-cleanup tree.
- [ ] Commit the current diff as the HeartWire OS restructure PR (delete + add; similarity detection will show the renames).
- [ ] Smoke-test `build/projects/platform/` — `npm install && npm run build`.

---

## 7. Recommendation for the next build-mode pass

1. **Commit and push** the restructure diff as a single, well-described PR. Enable rename detection in review (`git diff -M40` on GitHub works by default above 50% similarity) so reviewers see the renames rather than a wall of deletes+adds.
2. **Before merging**, re-point any active Vercel/Netlify deployments from `5-engineering-projects/...` to `build/projects/...`. Once the PR lands, the old paths stop existing and unpatched deployments will fail builds.
3. **Smoke-test** `build/projects/platform/` with `npm install && npm run build` to confirm no tool-level path assumption was missed during the move.
4. **Rename the GitHub remote** from `5amClub` to `heartwire-os` (GitHub → Settings → Rename), then update the local remote (`git remote set-url origin <new-url>`) in every checkout/worktree.
5. **Regenerate** `core/wiki/Directory-Structure.md` from the live tree after the PR is merged.
6. **Resolve the platform-app branding question** in a separate PR (keep "5amClub Platform" vs. rebrand) so the repo-restructure and product-rename changes remain independently revertable.
