# Systems Architecture

HeartWire OS is structured as a modular, scalable, AI-readable knowledge system. Every top-level folder represents a distinct knowledge or engineering domain.

## High-level structure

- **`core/`** — Core documentation, philosophy, onboarding, and AI agent rules.
- **`learning/`** — All learning: coursework, self-study, cheatsheets, problem-solving, and notes.
  - `learning/self-study/` — Independent learning outside university classes.
  - `learning/coursework/` — University notes by subject.
  - `learning/cheatsheets/` — Quick references.
  - `learning/problem-solving/` — Problem sets and solutions (mirrors coursework).
  - `learning/notes/` — Free-form notes, writing, and reflections.
- **`build/`** — All making: apps, projects, prototypes, hardware, and experiments.
  - `build/apps/` — Deployable applications.
  - `build/projects/` — Active engineering projects (apps, health-tech, AI, hardware).
  - `build/prototypes/` — Product / brand prototypes (HeartWire and beyond).
  - `build/hardware/` — Arduino, embedded, robotic, and physical builds.
  - `build/experiments/` — Sandbox and throwaway spikes.
- **`system/`** — The internal operating fabric: automations, AI agents, integrations, and data pipelines.
  - `system/automations/` — Workflows for ChatGPT, Claude, Cursor, Make.com, Zapier, etc.
  - `system/agents/` — AI agent definitions, orchestration, and prompts.
  - `system/integrations/` — Cross-service glue (Notion, Supabase, GitHub, etc.).
  - `system/pipelines/` — Data ingest, ETL, and evaluation pipelines.
- **`resources/`** — Textbooks, papers, PDFs, datasets, and reference materials.
- **`archive/`** — Deprecated content and legacy snapshots.

## Design goals

- Scalability across years of classes and projects
- Consistent, public-facing semantic naming (no numeric prefixes)
- Easy for AI agents to index and navigate
- Easy for future maintainers (including future self) to understand
- Clear separation of concerns between learning, building, and operating
