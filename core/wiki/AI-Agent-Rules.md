# AI Agent Rules (Wiki view)

> This page mirrors [`../ai-agent-rules.md`](../ai-agent-rules.md) for the Obsidian-style wiki. The canonical file is `core/ai-agent-rules.md`.

These rules apply to every AI assistant connected to HeartWire OS (ChatGPT, Claude, Cursor, Perplexity, and any orchestrator).

## 1. General behavior

- Always respect the folder structure in [`../onboarding.md`](../onboarding.md).
- Always store new content in the correct canonical directory.
- Follow each directory's local `README.md`.
- Ask for clarification only when necessary.

## 2. File storage rules

- Coursework → `learning/coursework/<subject>/`
- Homework / problem sets → `learning/problem-solving/<subject>/`
- Cheatsheets → `learning/cheatsheets/<topic>/`
- Self-study → `learning/self-study/<topic>/`
- Free-form notes → `learning/notes/`
- Engineering projects → `build/projects/<project>/`
- Deployable apps → `build/apps/<app>/`
- Product / brand prototypes → `build/prototypes/<name>/`
- Hardware builds → `build/hardware/<project>/`
- Experiments / spikes → `build/experiments/<name>/`
- AI automations → `system/automations/<workflow>/`
- AI agents → `system/agents/<agent>/`
- Integrations → `system/integrations/<service>/`
- Data / ETL pipelines → `system/pipelines/<pipeline>/`
- Resources (PDFs, datasets, papers) → `resources/`
- Foundational documentation → `core/`

## 3. Content requirements

- Include reasoning/steps when appropriate.
- Use annotated Markdown.
- Comment code only where non-obvious intent is needed.
- Use LaTeX for math.
- Cite location/page when summarizing PDFs or textbooks.

## 4. Naming conventions

- Lowercase kebab-case for files/folders (`laplace-transform-summary.md`).
- Do not re-introduce numeric-prefixed top-level folders — that taxonomy is deprecated.
- Preserve existing filenames for migrated content until a rename pass is approved.

## 5. Style guide

- Clear, direct, engineering-focused tone.
- No filler. Prefer precision and structure.
- Section headers for readability.
- ASCII/Mermaid/Markdown diagrams when useful.

## 6. Boundaries

AI agents must NOT:

- Generate harmful content.
- Violate academic integrity.
- Replace original student work when prohibited.
- Write anywhere inside `archive/legacy-snapshots/` (read-only quarantine).

## 7. Primary objectives

1. Support learning and mastery.
2. Support engineering creativity.
3. Support personal productivity and automation.
4. Maintain the integrity and longevity of HeartWire OS.

## 8. Update rules

Agents may update existing docs when instructed, append notes, improve clarity, and create new directories only if they match the architecture in [`../onboarding.md`](../onboarding.md).

## 9. Error handling

If unsure where a file goes:

- Store it under `archive/` for manual sorting.
- Leave a note explaining the decision and a suggested permanent home.
