# Autoimmune Symptom Tracker

This repository contains the Phase 1 foundations for a privacy-first progressive web app that helps people living with autoimmune conditions log symptoms, daily entries, and health insights entirely on their device.

## Getting Started

```bash
npm install
npm run dev
```

The development server runs with Turbopack enabled. Visit `http://localhost:3000` to explore the starter workspaces for onboarding, symptom tracking, daily entries, and calendar views.

## Project Structure

- `src/app` – Next.js App Router pages and layouts. The `/onboarding` route hosts the guided setup flow scaffolded for Task 1.
- `src/components` – Shared UI and feature modules for symptoms, daily entries, and calendar/timeline views.
- `src/lib` – Type definitions, utility helpers, and the Dexie-powered IndexedDB client defined for Task 5.
- `build-docs/` – High-level implementation plans for each major feature area.
- `tasks/` – Detailed task briefs used to track Phase 1 development progress.

## Phase 1 Progress

- ✅ Next.js + Tailwind project initialized with TypeScript and Turbopack
- ✅ Onboarding flow scaffolding with placeholder steps and state management
- ✅ Symptom tracking workspace with sample hooks and data types
- ✅ Daily entry form shell with modular sections and smart suggestion hooks
- ✅ Calendar/timeline workspace with data model definitions and navigation hooks
- ✅ Dexie database client and schema definitions ready for IndexedDB integration

See the [`tasks`](./tasks) folder for detailed requirements and current status notes for each workstream.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Contributing

1. Review the relevant task brief inside `tasks/` before you start coding.
2. Document decisions, blockers, and test results directly in the task file you are working on.
3. Ensure TypeScript strict mode passes and add tests alongside new utilities and components.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
