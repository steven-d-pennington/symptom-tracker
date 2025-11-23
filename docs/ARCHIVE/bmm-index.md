# Documentation Index

**Project**: Pocket Symptom Tracker
**Type**: Privacy-First Progressive Web Application (Next.js 15 + React 19)
**Status**: Active Development - Epic 3.7 (Body Map UX Enhancements)
**Generated**: 2025-11-04
**Last Updated**: 2025-11-04 (Archive cleanup)
**Purpose**: Master AI retrieval source for brownfield PRD workflows and feature development

> **📌 Status Note**: For current workflow status, always check [bmm-workflow-status.md](./bmm-workflow-status.md) which tracks actual story progression. The project has evolved beyond the original Phase 2 plan documented in the PRD.

---

## 🚀 Quick Start

**For AI Agents**: This is your primary entry point for understanding the codebase. Start here for all feature development, brownfield PRD work, and architectural decisions.

**For Developers**: Navigate to specific sections below based on your task.

---

## 📊 Project Overview

### Project Type

- **Repository**: Monolith (single cohesive web application)
- **Architecture**: Next.js 15 App Router with offline-first IndexedDB storage
- **Language**: TypeScript (100% coverage, strict mode)
- **Parts**: 1 (unified web app with client-side storage)

### Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 15.5.4 |
| UI | React | 19.1.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Database | Dexie (IndexedDB) | v4.2.0 |
| State | React Context API | Built-in |
| Testing | Jest + RTL | 30.2.0 / 16.3.0 |
| Deployment | Vercel | Latest |

### Quick Reference

- **Entry Point**: `src/app/layout.tsx`
- **Database**: `src/lib/db/client.ts` (18 tables, schema v18)
- **Components**: `src/components/` (298 files, 33 categories)
- **API Routes**: `src/app/api/` (3 correlation endpoints)
- **Primary Tech**: Next.js App Router, Dexie v4, Tailwind CSS v4, React Context

---

## 📚 Generated Documentation

### Core Documentation (Generated 2025-11-04)

1. **[Project Overview](./project-overview.md)** ⭐ **START HERE**
   - Executive summary and mission
   - Current development status
   - Feature highlights and capabilities
   - Roadmap and future vision
   - ⚠️ Note: Check [bmm-workflow-status.md](./bmm-workflow-status.md) for actual current story

2. **[Source Tree Analysis](./source-tree-analysis.md)** 🌳
   - Complete annotated directory structure
   - Critical folders explained with purpose
   - Entry points documented
   - File organization patterns
   - 150+ directories mapped

3. **[Component Inventory](./component-inventory.md)** 🧩
   - 298 components across 33 categories
   - Component purposes and relationships
   - Reusability matrix
   - Custom hooks catalog
   - Testing patterns

4. **[Data Models](./data-models.md)** 💾
   - 18 IndexedDB tables (schema v18)
   - Complete field definitions with types
   - Relationships and indexes
   - Data conventions (JSON-stringified fields)
   - Performance optimization (compound indexes)
   - Append-only event history pattern (ADR-003)

5. **[API Contracts](./api-contracts.md)** 🔌
   - 3 API routes documented
   - `/api/correlation/compute` - Correlation computation
   - `/api/correlation/enhanced` - Food combinations
   - `/api/correlation/cron` - Scheduled recomputation
   - Request/response schemas
   - Error handling patterns

6. **[Development Guide](./development-guide.md)** 🛠️
   - Prerequisites and setup
   - Development commands
   - Testing strategy (85%+ coverage)
   - Debugging tips
   - CI/CD pipeline
   - Performance optimization

---

## 📖 Existing Documentation

### Strategic Planning

1. **[Product Requirements Document (PRD)](./PRD.md)** 📋
   - Strategic requirements and vision
   - User journeys and personas
   - Success metrics
   - Current: Phase 2 (Flare Tracking & Body Map)

2. **[Epic Breakdown](./epics.md)** 📊
   - 4 epics, 23 stories breakdown
   - ✅ Epic 0: UI/UX Revamp (5/5 - complete)
   - ✅ Epic 1: Enhanced Body Map (6/6 - complete)
   - 🔄 Epic 2: Flare Lifecycle (3/8 - in progress)
   - 📋 Epic 3: Flare Analytics (planned)
   - 📋 Epic 4: Photo Integration (planned)

3. **[Solution Architecture](./solution-architecture.md)** 🏗️
   - Technical design and decisions
   - Architecture Decision Records (ADRs)
   - Implementation guidance
   - Technology choices and rationale

4. **[BMM Workflow Status](./bmm-workflow-status.md)** 📈
   - Current progress tracking
   - Decision log
   - Next actions
   - Workflow state

5. **[Product Backlog](./backlog.md)** 📝
   - Future features and enhancements
   - Prioritization
   - Dependencies

### User Stories (30+ files)

**Epic 0: UI/UX Revamp (Complete)** ✅
- [Story 0.1](./stories/story-0.1.md) - Navigation harmonization
- [Story 0.2](./stories/story-0.2.md) - Dashboard "Today" view
- [Story 0.3](./stories/story-0.3.md) - Flares view simplification
- [Story 0.4](./stories/story-0.4.md) - Route configuration
- [Story 0.5](./stories/story-0.5.md) - UX instrumentation

**Epic 1: Enhanced Body Map (Complete)** ✅
- [Story 1.1](./stories/story-1.1.md) - Groin-specific regions
- [Story 1.2](./stories/story-1.2.md) - Zoom/pan controls
- [Story 1.3](./stories/story-1.3.md) - Coordinate marking
- [Story 1.4](./stories/story-1.4.md) - Real-time flare markers
- [Story 1.5](./stories/story-1.5.md) - Accessibility (WCAG 2.1 AA)
- [Story 1.6](./stories/story-1.6.md) - Performance (<100ms)

**Epic 2: Flare Lifecycle (In Progress)** 🔄
- [Story 2.1](./stories/story-2.1.md) - Flare data model ✅
- [Story 2.2](./stories/story-2.2.md) - Create flare from body map ✅
- [Story 2.3](./stories/story-2.3.md) - Update flare status ✅
- [Story 2.4](./stories/story-2.4.md) - Active flare dashboard ✅
- [Story 2.5](./stories/story-2.5.md) - Log interventions ⏳ **NEXT**
- [Story 2.6](./stories/story-2.6.md) - View history timeline 📋
- [Story 2.7](./stories/story-2.7.md) - Mark as resolved 📋
- [Story 2.8](./stories/story-2.8.md) - Resolved archive 📋

**Epic 3: Flare Analytics (Planned)** 📋
- [Story 3.1](./stories/story-3.1.md) - Problem areas calculation
- [Story 3.2](./stories/story-3.2.md) - Per-region flare history
- [Story 3.3](./stories/3-3-flare-duration-and-severity-metrics.md) - Duration/severity metrics
- [Story 3.4](./stories/3-4-flare-trend-analysis-visualization.md) - Trend visualization
- [Story 3.5](./stories/3-5-intervention-effectiveness-analysis.md) - Intervention effectiveness

**Epic 3.5: Production UX Polish** 🎨
- [Epic 3.5 Overview](./epic-3.5-production-ux.md)
- [Story 3.5.1](./stories/3-5-1-fix-empty-state-crisis-and-pre-populate-defaults.md) - Empty states
- [Story 3.5.2](./stories/3-5-2-mood-and-sleep-basic-logging.md) - Mood & sleep
- [Story 3.5.3](./stories/3-5-3-redesign-symptom-logging-modal-to-page.md) - Symptom logging
- [Story 3.5.4](./stories/3-5-4-redesign-food-logging-modal-to-page.md) - Food logging
- [Story 3.5.5](./stories/3-5-5-redesign-trigger-and-medication-logging-to-pages.md) - Trigger/med logging
- [Story 3.5.6](./stories/3-5-6-critical-ui-fixes-bundle.md) - UI fixes
- [Story 3.5.7](./stories/3-5-7-fix-calendar-data-wiring.md) - Calendar fixes
- [Story 3.5.8](./stories/3-5-8-add-keyboard-navigation-accessibility.md) - Keyboard navigation
- [Story 3.5.9](./stories/3-5-9-help-pages-and-landing-updates.md) - Help pages
- [Story 3.5.10-14](./stories/) - Additional polish stories

**Epic 3.6: Onboarding** 🚀
- [Story 3.6.1](./stories/3.6.1-onboarding-data-selection-flow.md) - Data selection flow

**Epic 3.7: Body Map Enhancements** 🗺️
- [Story 3.7.1](./stories/3-7-1-region-detail-view-infrastructure.md) - Region detail view
- [Story 3.7.2](./stories/3-7-2-marker-preview-and-positioning.md) - Marker preview
- [Story 3.7.3](./stories/3-7-3-smart-defaults-system.md) - Smart defaults
- [Story 3.7.4](./stories/3-7-4-full-screen-mode.md) - Full-screen mode
- [Story 3.7.5](./stories/3-7-5-history-toggle.md) - History toggle
- [Story 3.7.6](./stories/3-7-6-polish-and-accessibility.md) - Polish & accessibility
- [Story 3.7.7](./stories/3-7-7-multi-location-flare-persistence.md) - Multi-location flares

**Epic 3.8: Critical Fixes** 🐛
- [Story 3.8.1](./stories/3-8-1-critical-regression-bug-fixes.md) - Regression fixes

### UI/UX Documentation

1. **[UI/UX Revamp Blueprint](./ui/ui-ux-revamp-blueprint.md)** 🎨
   - Navigation harmonization design
   - Track/Analyze/Manage/Support pillars
   - Dashboard redesign patterns
   - Progressive disclosure

2. **[UX Validation Scripts](./ui/ux-validation-scripts.md)** ✅
   - Task walkthroughs
   - Success metrics baseline
   - UX instrumentation methodology

### Testing Documentation

1. **[Testing Summary](./test-reports/TESTING-SUMMARY.md)** 🧪
   - Overall testing strategy
   - Coverage reports
   - Test execution history

2. **[Quick Test Guide](./test-reports/QUICK-TEST-GUIDE.md)** ⚡
   - Fast testing reference
   - Critical path tests
   - Smoke test checklist

3. **[P0 Smoke Test Report](./test-reports/p0-smoke-test-execution-report.md)** 💨
   - Critical functionality validation
   - Regression test results

4. **[E2E Test Plans](./e2e-test-plan-complete-app.md)** 🎭
   - End-to-end test scenarios
   - Body map test plan
   - Execution guides

5. **[Test Execution Reports](./test-execution-report-2025-11-03.md)** 📊
   - Recent test runs
   - Bug tracking and progress

### Development Artifacts

1. **[Sprint Change Proposals](./sprint-change-proposal-2025-10-28.md)** 🔄
   - Mid-sprint adjustments
   - Scope changes
   - Replanning decisions

2. **[Brainstorming Results](./brainstorming-session-results-2025-10-29.md)** 💡
   - Feature ideation sessions
   - Creative solutions

3. **[Bug Progress Tracking](./bug-progress.md)** 🐛
   - Open bugs
   - Resolution status
   - Priority tracking

4. **[GitHub Issues](./github-issue-flare-creation-bug.md)** 🔧
   - Bug reports
   - Issue descriptions

5. **[Regression Test Issues](./regression-test-issues-2025-11-03.md)** ⚠️
   - Regression findings
   - Fix tracking

### Retrospectives

1. **[Epic 3 Retrospective](./retrospectives/epic-3-retro-2025-10-29.md)** 🔍
   - Lessons learned
   - Process improvements
   - Team insights

### Findings & Audits

1. **[Dev Data Controls Audit](./findings/dev-data-controls-audit.md)** 🔐
   - Data validation findings
   - Security considerations

2. **[Dev Data Controls Implementation](./findings/dev-data-controls-implementation-summary.md)** ✅
   - Implementation details
   - Results and outcomes

3. **[Flare Clustering Update](./findings/flare-clustering-update.md)** 📍
   - Clustering algorithm findings
   - Performance analysis

### Future Planning

1. **[Future Ideas](./FUTURE/future-ideas.md)** 🚀
   - Long-term vision
   - Feature concepts
   - Innovation opportunities

2. **[Cloud Sync Brainstorm](./FUTURE/CLOUD_SYNC_BRAINSTORM.md)** ☁️
   - Encrypted cloud backup exploration
   - Sync architecture options

3. **[Cloud Sync Implementation](./FUTURE/CLOUD_SYNC_IMPLEMENTATION.md)** 🔧
   - Technical design for sync
   - Implementation plan

4. **[Body Map Layers](./FUTURE/body-map-layers.md)** 🗺️
   - Advanced body map features
   - Layer system design

5. **[Body Map UX Enhancements](./FUTURE/body-map-ux-enhancements.md)** ✨
   - Interaction improvements
   - Visual enhancements

---

## 🏗️ Architecture & Design

### Architecture Documents

1. **[ARCHITECTURE.md](../ARCHITECTURE.md)** (Root Level) 🏛️
   - System architecture overview
   - Component relationships
   - Data flow diagrams

2. **[Solution Architecture](./solution-architecture.md)** 📐
   - Detailed technical design
   - ADRs (Architecture Decision Records)
   - Implementation patterns

### Key Architecture Patterns

**Repository Pattern**: Data access layer separates DB operations from business logic
- Location: `src/lib/repositories/`
- Example: `flareRepository.ts`, `foodEventRepository.ts`

**Service Layer**: Business logic encapsulation
- Location: `src/lib/services/`
- Example: `CorrelationOrchestrationService.ts`, `FlareService.ts`

**Append-Only Event History (ADR-003)**: Medical-grade audit trail
- Tables: `flareEvents`, `medicationEvents`, `triggerEvents`, `foodEvents`
- Immutable events for data integrity

**Component-Based UI**: React functional components with hooks
- Location: `src/components/`
- 33 functional categories, 298 files

---

## 🗄️ Database Schema (18 Tables)

### Entity Tables
- `users` - User profiles and preferences
- `symptoms` - Symptom definitions (50+ presets + custom)
- `medications` - Medication list with schedules
- `triggers` - Trigger definitions (30+ presets + custom)
- `foods` - Food database (200+ presets + custom)

### Event Stream Tables
- `symptomInstances` - Symptom occurrences
- `medicationEvents` - Medication intake tracking
- `triggerEvents` - Trigger exposure tracking
- `foodEvents` - Food intake logging

### Flare Tracking Tables (Epic 2)
- `flares` - Persistent flare entities
- `flareEvents` - Append-only flare history (ADR-003)
- `flareBodyLocations` - Multi-location flare tracking (Story 3.7.7)

### Analysis Tables
- `foodCombinations` - Correlation results (auto-generated)

### Media Tables
- `photoAttachments` - Encrypted medical photos (AES-256-GCM)
- `photoComparisons` - Before/after photo pairs

### Other Tables
- `dailyEntries` - Comprehensive daily health logs
- `bodyMapLocations` - Body-specific symptom tracking
- `uxEvents` - Optional UX instrumentation (opt-in)

**Full Schema**: See [Data Models](./data-models.md)

---

## 🔌 API Routes (3 Endpoints)

### 1. Correlation Compute
**Endpoint**: `/api/correlation/compute`
**Methods**: POST, GET
**Purpose**: Compute food-symptom correlations with caching

### 2. Enhanced Correlation
**Endpoint**: `/api/correlation/enhanced`
**Methods**: POST, GET
**Purpose**: Correlations including food combinations and synergy

### 3. Correlation Cron
**Endpoint**: `/api/correlation/cron`
**Methods**: GET (Vercel Cron only)
**Purpose**: Scheduled correlation recomputation (daily 2 AM UTC)

**Full Details**: See [API Contracts](./api-contracts.md)

---

## 🧩 Component Categories (298 files)

### Major Categories

| Category | Count | Description |
|----------|-------|-------------|
| **analytics** | 33 | Data visualization, trend charts, insights dashboard |
| **body-mapping** | 18 | Enhanced body map with zoom/pan (Epic 1) |
| **flare** | 4+ | Flare lifecycle management (Epic 2) |
| **daily-entry** | 5+ | Daily health reflection form with sections |
| **calendar** | 9 | Timeline and calendar visualization |
| **food** | Multiple | Food journal and correlation |
| **correlation** | 2 | Correlation analysis display |
| **charts** | 1 | Specialized chart components |
| **common** | 6 | Reusable UI primitives (Button, Card, Modal, Toast) |
| **navigation** | Multiple | App navigation (Track/Analyze/Manage/Support) |
| **dashboard** | 4 | "Today" view dashboard components |
| **empty-states** | Multiple | Empty state components with CTAs |
| **providers** | Multiple | React Context providers |
| **pwa** | Multiple | PWA functionality (install, offline, updates) |
| **photos** | Multiple | Photo management with encryption |

**Full Inventory**: See [Component Inventory](./component-inventory.md)

---

## 📂 Source Tree

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/       # Authenticated routes
│   ├── onboarding/        # First-time setup
│   └── api/               # API routes
├── components/             # React components (298 files)
├── lib/                    # Business logic
│   ├── db/                # Dexie database (18 tables)
│   ├── repositories/      # Data access layer
│   ├── services/          # Business logic
│   ├── utils/             # Utilities
│   ├── hooks/             # Global custom hooks
│   ├── data/              # Static data and seeds
│   └── types/             # Shared TypeScript types
└── __tests__/              # Integration tests
```

**Full Tree**: See [Source Tree Analysis](./source-tree-analysis.md)

---

## 🛠️ Development

### Quick Commands

```bash
# Install dependencies
npm install

# Development server (port 3001 with Turbopack)
npm run dev

# Production build
npm run build

# Run tests
npm test

# Test coverage
npm run test:coverage

# Lint code
npm run lint

# UX validation (opt-in)
npm run ux:validate
```

### Prerequisites

- Node.js v20.x+
- npm v10.x+
- Git
- Modern browser (Chrome 100+, Firefox 100+, Safari 15+, Edge 100+)

**Full Guide**: See [Development Guide](./development-guide.md)

---

## 🎯 For AI Agents: Brownfield PRD Workflow

### Step 1: Understand the Context

Start with these documents in order:

1. **[Project Overview](./project-overview.md)** - Get the big picture
2. **[Solution Architecture](./solution-architecture.md)** - Understand technical decisions
3. **[Data Models](./data-models.md)** - Know the data structure
4. **[Component Inventory](./component-inventory.md)** - Identify reusable components
5. **[Source Tree Analysis](./source-tree-analysis.md)** - Navigate the codebase

### Step 2: Review Relevant Stories

- Check completed stories for similar features
- Review in-progress stories for current context
- Read story acceptance criteria for patterns

### Step 3: Identify Reuse Opportunities

**Check for existing**:
- Similar components (analytics, body-mapping, flare)
- Repository methods (flareRepository, foodEventRepository)
- Service logic (CorrelationOrchestrationService, FlareService)
- Utility functions (date-utils, validation)
- Custom hooks (useFlares, useBodyMap)

### Step 4: Follow Patterns

**Adhere to**:
- Repository pattern for data access
- Service layer for business logic
- Functional components with hooks
- TypeScript strict mode (100%)
- Co-located tests
- BMad Method workflow

### Step 5: Extend the System

**When adding new features**:
- Document in `docs/stories/story-X.Y.md`
- Update `docs/backlog.md` if planning
- Follow existing architectural patterns
- Maintain test coverage (85%+)
- Update this index if adding major components

---

## 📊 Current Status Summary

**Phase**: 2d (Flare Lifecycle - Epic 2)
**Progress**: 15 of 23 stories complete (65%)
**Next Story**: 2.5 (Log Flare Interventions)
**Sprint**: Active development
**Architecture**: Stable, no breaking changes planned

---

## 🔍 Finding Information Quickly

### By Task Type

**Adding a new feature**:
1. Check [Component Inventory](./component-inventory.md) for reusable components
2. Review [Data Models](./data-models.md) to see if new tables needed
3. Read [Solution Architecture](./solution-architecture.md) for patterns
4. Check [API Contracts](./api-contracts.md) if adding endpoints

**Fixing a bug**:
1. Check [Test Reports](./test-reports/) for current testing status
2. Review [ARCHIVE](./ARCHIVE/) for historical bug reports (if relevant)
3. Read [Source Tree Analysis](./source-tree-analysis.md) to locate code
4. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

**Understanding a feature**:
1. Find the story in [Epic Breakdown](./epics.md)
2. Read the story file in `docs/stories/`
3. Check [Component Inventory](./component-inventory.md) for implementation details

**Learning the codebase**:
1. Start with [Project Overview](./project-overview.md)
2. Read [Source Tree Analysis](./source-tree-analysis.md)
3. Study [Data Models](./data-models.md)
4. Browse [Component Inventory](./component-inventory.md)

---

## 📞 Support & Resources

### Internal Documentation
- **BMad Framework**: `bmad/` folder for AI-assisted development methodology
- **TROUBLESHOOTING**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### External Resources
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **Dexie Docs**: https://dexie.org
- **Tailwind CSS**: https://tailwindcss.com

---

## 🔍 Code Quality & Maintenance

### Code Audit Report

**[CODE-AUDIT-REPORT.md](./CODE-AUDIT-REPORT.md)** - Comprehensive audit of orphaned files and dead code (Generated 2025-11-04)

**Key Findings**:
- **41 unused component files** (20% of components)
- **26 unused utility exports**
- **9 unused CSS animation classes**
- **0 unused npm dependencies** ✅

**Cleanup Impact**: ~3,100 lines of dead code, ~7% bundle size reduction

### Phase 1 Cleanup - COMPLETED ✅

**[CLEANUP-PHASE1-SUMMARY.md](./CLEANUP-PHASE1-SUMMARY.md)** - Phase 1 execution report (2025-11-04)

**Completed**:
- ✅ 31 files deleted (27 components + 4 test files)
- ✅ 2 entire folders removed (landing/, empty-states/)
- ✅ Build verified - compiles successfully
- ✅ ~1,500+ lines of dead code removed

**Remaining**: Phase 2 (utilities) and Phase 3 (CSS) pending roadmap review

---

## 📦 Historical Documentation

### ARCHIVE Folder

Historical documents that have been completed, superseded, or are no longer actively relevant have been moved to **[ARCHIVE](./ARCHIVE/)** for reference.

**Archive Contents** (18 files):
- **Sprint Planning** (2 files) - Completed proposals and epic planning from Oct 2025
- **Test Reports** (8 files) - Historical test executions from Nov 2025
- **Brainstorming Sessions** (1 file) - UI/UX brainstorming that resulted in Epic 3.5
- **Bug Reports** (2 files) - Resolved bug fix reports from Nov 2025
- **Implementation Findings** (3 files) - Completed implementation summaries
- **Old Validation Reports** (1 file) - Superseded story validation reports

**When to Check ARCHIVE**:
- Understanding historical decisions
- Researching how features evolved
- Audit trail requirements
- Learning from past implementations

See [ARCHIVE/ARCHIVE-MANIFEST.md](./ARCHIVE/ARCHIVE-MANIFEST.md) for complete archive index.

---

## 📝 Documentation Maintenance

**Last Generated**: 2025-11-04
**Generated By**: BMad document-project workflow
**Workflow Version**: 1.2.0
**Scan Level**: Exhaustive

**To Regenerate**:
```bash
# Using BMad workflow
/bmad:bmm:workflows:document-project
```

**Update Frequency**: Regenerate when:
- Major architectural changes
- New epics added
- Significant component refactoring
- Database schema updates
- Every 2-3 months for brownfield projects

---

## ✅ Documentation Completeness

**Generated Documentation** ✅:
- [x] Project Overview
- [x] Source Tree Analysis
- [x] Component Inventory
- [x] Data Models
- [x] API Contracts
- [x] Development Guide

**Existing Documentation** ✅:
- [x] PRD and Epic Breakdown
- [x] Solution Architecture
- [x] User Stories (30+)
- [x] UI/UX Documentation
- [x] Test Reports and Plans
- [x] Retrospectives and Findings
- [x] Future Planning

**Ready for**:
- ✅ Brownfield PRD workflows
- ✅ AI-assisted feature development
- ✅ New team member onboarding
- ✅ Architectural decisions
- ✅ Code reviews and refactoring

---

**🎯 Start here for all feature development and brownfield PRD work!**
