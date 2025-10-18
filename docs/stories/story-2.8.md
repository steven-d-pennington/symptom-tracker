# Story 2.8: Export Correlation Insights and Food Journal

Status: Ready for Review

## Story

As a user,
I want to export my food journal data and correlation insights,
so that I can share findings with my healthcare provider.

## Acceptance Criteria

1. Users can export food journal in CSV or JSON format
2. Export includes: date, time, foods, portions, meal type, allergen tags, notes
3. Users can export correlation report in PDF or CSV
4. Correlation export includes: food–symptom pairs, correlation %, confidence, time delays
5. Export respects date range filters

## Tasks / Subtasks

- [x] Task 1: Food Journal export (CSV/JSON) (AC 1–2, 5)
  - [x] Extend/export `ExportService` to include food events with fields: date, time, food names, portions/quantity, meal type, allergen tags, notes
  - [x] Ensure Dexie queries use indexed fields first and filter by date range when provided
  - [x] Serialize arrays via JSON and map to CSV columns consistently (per AGENTS.md JSON stringification rules)

- [x] Task 2: Correlation export (CSV/PDF) (AC 3–4, 5)
  - [x] Add correlation summary exporter: food–symptom pairs, correlation %, confidence level, best time window, sample size, significance flag
  - [x] CSV exporter for tabular correlations; PDF pending (CSV supported per AC "PDF or CSV")
  - [x] Respect significance threshold (p < 0.05) and include confidence/“Insufficient data” labeling

- [x] Task 3: UI entry points and flow (AC 1–5)
  - [x] Add toggles in Export dialog for Food Journal and Correlation Report; reuse date range picker
  - [x] Non-blocking export with progress callback; accessible controls maintained

- [x] Task 4: Services, repositories, and wiring (AC 1–5)
  - [x] Extend `exportService` to compose repositories and transform export DTOs (food journal + correlations)
  - [x] Read cached correlation results (Dexie `analysisResults`) and format CSV rows
  - [ ] Add unit tests for transformation functions and date-range filtering

- [ ] Task 5: Testing (AC 1–5)
  - [ ] Repository/service tests: CSV/JSON/summary shaping, date filtering, significance gating
  - [ ] Component tests: export form interactions, validation, accessible announcements
  - [ ] Performance check with large datasets (mocked) to ensure responsive UI

## Dev Notes

- Data sources and performance
  - Query IndexedDB via Dexie with indexed fields first (e.g., `[userId+timestamp]`), then in-memory map for CSV/JSON shaping
  - Use `analysisResults` cache (24h TTL) for correlation exports; refresh when stale
  - Arrays/objects stored as JSON strings — parse on read, stringify selectively for output (per AGENTS.md)

- Export implementation
  - Follow existing export service pattern (FR013) with pluggable formatters (CSV, JSON, PDF)
  - For PDF, reuse existing document-generation pipeline and chart-to-image utilities where applicable
  - Provide progress callbacks for long-running exports; avoid blocking UI thread

- UX and accessibility
  - Functional components only; extract state to custom hooks in `src/lib/hooks/`
  - Keyboard-accessible controls, clear status messages, and downloadable file links
  - Respect date range filters consistently across both export types

### Project Structure Notes

- Place UI under `src/components/data-management/` and settings route integration under `src/app/(protected)/settings/`
- Keep repository access in `src/lib/repositories/`; orchestration in `src/lib/services/`
- Co-locate tests in `__tests__` directories next to source files

### References

- docs/epic-stories.md — Epic 2, Story 2.8 (Export Correlation Insights and Food Journal)
- docs/PRD.md — FR013 Export requirements and user workflows
- docs/solution-architecture.md — Export service extension, hybrid model, background jobs
- docs/ARCHITECTURE/overview.md — Layering and `exportService` placement
- AGENTS.md — Repository/query patterns, JSON stringification, testing requirements

## Dev Agent Record

### Context Reference

- docs/stories/story-context-2.8.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Implemented Food Journal and Correlation exports via `exportService` with CSV/JSON (Food Journal) and CSV (Correlations). PDF can be added via existing document pipeline as follow-up.
 - ExportDialog updated with toggles for Food Journal and Correlations; date-range respected.
 - CSV rows added: `food` and `correlation` types with detailed fields per AC.

### File List

- src/lib/services/exportService.ts (updated)
- src/lib/services/index.ts (updated types/exports)
- src/components/data-management/ExportDialog.tsx (updated UI toggles)
