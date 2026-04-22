# AI Agent Rules — HeartWire OS

These rules apply to all AI assistants connected to this repo:

- ChatGPT
- Claude
- Cursor
- Perplexity
- Any agent orchestrators

## 1. General behavior

- Always respect the folder structure defined in [`core/onboarding.md`](./onboarding.md).
- Always store new content in the correct directory.
- Keep all generated files clean, readable, and organized.
- Follow each directory's `README.md` for local conventions.
- Ask for clarification only when necessary.

## 2. File storage rules

- Coursework → `learning/coursework/<subject>/`
- Homework / problem sets → `learning/problem-solving/<subject>/`
- Cheatsheets → `learning/cheatsheets/<topic>/`
- Self-study → `learning/self-study/<topic>/`
- Free-form notes → `learning/notes/`
- Engineering projects → `build/projects/<project>/`
- Apps (deployable) → `build/apps/<app>/`
- Prototypes / product/brand work → `build/prototypes/<name>/`
- Hardware (Arduino, robotics, embedded) → `build/hardware/<project>/`
- Experiments / spikes → `build/experiments/<name>/`
- AI automations → `system/automations/<workflow>/`
- AI agents → `system/agents/<agent>/`
- Integrations → `system/integrations/<service>/`
- Data / ETL pipelines → `system/pipelines/<pipeline>/`
- Resources (PDFs, datasets, papers) → `resources/`
- Foundational docs → `core/`

## 3. Content requirements

- Include explanations, steps, or reasoning when appropriate.
- Use fully annotated and well-formatted Markdown.
- When generating code, include comments only where non-obvious intent needs to be captured.
- When writing math, use LaTeX formatting.
- When summarizing PDF or textbook content, cite the location/page.

## 4. Naming conventions

- Use lowercase kebab-case for files and folders:
  - `laplace-transform-summary.md`
  - `week3-homework-solutions.md`
- Do not introduce numeric-prefixed top-level folders (that taxonomy is deprecated).
- Preserve existing filenames for migrated content until a dedicated rename pass is approved.

## 5. Style guide

- Tone: clear, direct, helpful, engineering-focused.
- Avoid filler.
- Prefer precision and structure.
- Use section headers for readability.
- Include diagrams in ASCII, Mermaid, or Markdown when useful.

## 6. Boundaries

AI agents should NOT:

- Generate harmful content.
- Write graded answers that violate academic integrity.
- Replace original student work when prohibited.
- Modify anything under `archive/legacy-snapshots/` — that directory is a read-only quarantine.

## 7. Primary objectives

1. Support learning and mastery.
2. Support engineering creativity.
3. Support personal productivity and automation.
4. Maintain the integrity and longevity of HeartWire OS.

## 8. Update rules

Agents may:

- Update existing documentation when instructed.
- Append new notes.
- Improve clarity.
- Create new directories only if they match the HeartWire OS architecture in [`core/onboarding.md`](./onboarding.md).

## 9. Error handling

If unsure where a file goes:

- Store it under `archive/` for manual sorting.
- Leave a short note explaining the decision and a suggested permanent home.

---

This file ensures all agents behave consistently, intelligently, and safely inside HeartWire OS.
