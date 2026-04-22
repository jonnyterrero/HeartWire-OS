# HeartWire OS

An open operating system for learning, building, and shipping — a public-facing workspace that organizes coursework, self-study, engineering projects, AI agents, automations, and long-term research into a single coherent platform.

> **Mission:** Build a cohesive, extensible system that turns day-to-day learning and tinkering into a durable library of projects, notes, and tools.

## Top-level layout

```txt
/
├── core/            # Mission, systems architecture, onboarding, agent rules
├── learning/        # Study, coursework, homework/problem-solving, cheatsheets, notes
├── build/           # Apps, projects, prototypes, hardware, experiments
├── system/          # Automations, AI agents, integrations, data pipelines
├── resources/       # Textbooks, papers, datasets, reference material
└── archive/         # Deprecated content and legacy snapshots
```

## Navigation

| Directory | Purpose |
| :--- | :--- |
| [`core/`](core/) | Start here. Mission, architecture, onboarding, AI agent rules. |
| [`learning/self-study/`](learning/self-study/) | Independent learning beyond university classes. |
| [`learning/coursework/`](learning/coursework/) | University notes by subject (BME, Physics, CS, Math, etc.). |
| [`learning/cheatsheets/`](learning/cheatsheets/) | Quick references for code, math, and engineering. |
| [`learning/problem-solving/`](learning/problem-solving/) | Problem sets, homework, and practice. |
| [`learning/notes/`](learning/notes/) | Free-form notes, reflections, and writing. |
| [`build/apps/`](build/apps/) | Deployable applications. |
| [`build/projects/`](build/projects/) | Active engineering projects (apps, health, AI, hardware). |
| [`build/prototypes/`](build/prototypes/) | Product/brand prototypes (HeartWire, experiments in design). |
| [`build/hardware/`](build/hardware/) | Arduino, embedded, robotic, and physical builds. |
| [`build/experiments/`](build/experiments/) | Sandbox work and throwaway spikes. |
| [`system/automations/`](system/automations/) | Workflows for ChatGPT, Claude, Cursor, Make.com, etc. |
| [`system/agents/`](system/agents/) | AI agent definitions and orchestration. |
| [`system/integrations/`](system/integrations/) | Cross-service glue (Notion, Supabase, GitHub, Zapier). |
| [`system/pipelines/`](system/pipelines/) | Data/ingest/ETL/evaluation pipelines. |
| [`resources/`](resources/) | Textbooks, papers, PDFs, and datasets. |
| [`archive/`](archive/) | Deprecated files, legacy structures, and history. |

## Quick actions

- **New note**: create a markdown file under `learning/coursework/<subject>/` or `learning/self-study/<topic>/`.
- **New project**: start a folder under `build/projects/` (or pick an idea from the project-ideas backlog).
- **AI context**: see [`core/onboarding.md`](core/onboarding.md) for how AI agents should navigate this repo.

## Integrations

Configure external tools (Notion, ChatGPT, Claude, Make.com, Zapier) in `system/automations/`. See each subfolder's README for specifics.

## Migration note

This repo was migrated from an older numeric taxonomy (`0-docs/`, `1-self-study/` … `9-archive/`) to the HeartWire OS structure above. Old top-level folders have been removed, and the pre-restructure workspace mirrors (`5amClub/`, `5amClub-1/`) are quarantined read-only under `archive/legacy-snapshots/`. See [`core/MIGRATION-STATUS.md`](core/MIGRATION-STATUS.md) for full history and any open follow-ups.
