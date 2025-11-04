# Project Overview

**Project Name**: Pocket Symptom Tracker
**Version**: 0.2.0
**Status**: Active Development (Phase 2 - Flare Tracking & Body Map Enhancements)
**Last Updated**: 2025-11-04

---

## Executive Summary

Pocket Symptom Tracker is a **privacy-first Progressive Web Application** designed for people with chronic autoimmune conditions (specifically Hidradenitis Suppurativa) to track symptoms, medications, food intake, and discover health patterns—all while keeping data completely private on their device.

### Key Differentiators

1. **100% Local-First**: Every piece of health data stays on the device. No cloud, no servers, no data mining.
2. **Precision Body Mapping**: Enhanced interactive body map with 93 distinct regions, zoom/pan functionality, and coordinate-level precision for exact flare location tracking.
3. **Complete Flare Lifecycle**: Monitor individual flares from onset through resolution with persistent entities, severity progression, and intervention logging.
4. **Smart Correlation Analysis**: Automated statistical analysis helps discover patterns between food intake, triggers, and symptoms—including time-delayed effects and food combinations.
5. **Medical-Grade Privacy**: AES-256-GCM photo encryption, EXIF stripping, zero external data transmission.

---

## Project Mission

**Empower individuals with chronic conditions to take control of their health through comprehensive, privacy-respecting data tracking and intelligent pattern recognition.**

---

## Current Development Status

> **📌 For Current Status**: Check [bmm-workflow-status.md](./bmm-workflow-status.md) which is updated in real-time. This overview represents a point-in-time snapshot.

### Active Development (Epic 3.7 - Body Map UX Enhancements)

**Latest Completed**: Story 3.7.1 (Region Detail View Infrastructure) - Nov 2, 2025

**Completed Epics**:
- ✅ **Epic 0**: UI/UX Revamp (5/5 stories) - Modern navigation and dashboard
- ✅ **Epic 1**: Enhanced Body Map (6/6 stories) - Precision location tracking with zoom/pan
- ✅ **Epic 2**: Flare Lifecycle (partially complete)
- ✅ **Epic 3**: Flare Analytics (partially complete)
- ✅ **Epic 3.5**: Production UX (10/10 stories) - Critical UX improvements and bug fixes
- ✅ **Epic 3.6**: Onboarding Enhancement (1/1 story) - Interactive data selection
- 🔄 **Epic 3.7**: Body Map UX Enhancements (1/7 stories) - Enhanced region interaction

**Remaining Backlog**:
- 📋 **Epic 3.7**: Complete remaining body map UX stories (6 stories)
- 📋 **Epic 4**: Photo Integration (4 stories) - Photo attachments, timeline, comparison
- 📋 **Epic 2**: Complete flare lifecycle stories (Story 2.8 - Archive)

**Note**: The project has evolved significantly beyond the original Phase 2 scope documented in the PRD. Multiple additional epics have been completed addressing production readiness, onboarding, and UX refinements.

---

## Architecture Overview

### Type Classification

- **Repository Type**: Monolith
- **Project Type**: Web Application (Next.js 15 + React 19)
- **Parts**: Single unified application
- **Architecture Pattern**: Next.js App Router with offline-first IndexedDB storage

### Technology Stack Summary

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.5.4 | React framework with App Router |
| **UI Library** | React | 19.1.0 | Component-based UI |
| **Language** | TypeScript | 5.x | Type-safe development (100% coverage) |
| **Styling** | Tailwind CSS | v4 | Utility-first CSS |
| **Database** | Dexie | v4.2.0 | IndexedDB wrapper (18 tables) |
| **State** | React Context | Built-in | Global state management |
| **Testing** | Jest + RTL | 30.2.0 / 16.3.0 | Unit & component testing |
| **Deployment** | Vercel | Latest | Zero-config deployment |

### Data Architecture

- **Storage**: IndexedDB via Dexie v4 (client-side only)
- **Tables**: 18 tables with compound indexes
- **Schema Version**: v18
- **Performance**: <50ms query times for all operations
- **Data Integrity**: Append-only event history (ADR-003) for medical-grade audit trails

---

## Key Features

### 🎯 Core Health Tracking

1. **Flexible Symptom Tracking**
   - 50+ preset symptoms + custom
   - Configurable 1-10 severity scales
   - Category management

2. **Medication Management**
   - Scheduled reminders
   - Adherence tracking
   - Effectiveness analysis

3. **Trigger Monitoring**
   - 30+ preset triggers (environmental, lifestyle, dietary)
   - Intensity tracking (low/medium/high)
   - Correlation analysis

4. **Daily Health Journal**
   - Comprehensive daily entries
   - Energy, sleep, stress, mood tracking
   - Timeline visualization

### 🗺️ Enhanced Body Mapping (Epic 1 - Complete)

- **93 Body Regions**: Including groin-specific areas (left, right, center)
- **Zoom/Pan Controls**: 1x-3x magnification with pinch-to-zoom (mobile) and scroll-wheel (desktop)
- **Coordinate Precision**: Exact flare locations with normalized 0-1 coordinates
- **Real-time Markers**: Visual indicators for active/improving/worsening/resolved flares
- **WCAG 2.1 AA**: Full accessibility with keyboard navigation and screen reader support

### 🔥 Flare Lifecycle Management (Epic 2 - In Progress)

- **Persistent Entities**: Each flare gets unique ID and complete lifecycle tracking
- **Severity Tracking**: 1-10 scale with trend indicators (improving/stable/worsening)
- **Intervention Logging**: Document treatments (ice, heat, medication, rest, drainage) with timestamps
- **Active Dashboard**: Real-time monitoring of all active flares
- **Immutable Audit Trail**: Append-only event history for medical documentation (ADR-003)

### 🍽️ Food Journal & Correlation Analysis

- **200+ Food Database**: Pre-populated with allergen tags (8 categories)
- **Smart Correlation Engine**:
  - Time-delayed analysis (15min to 72hrs)
  - Dose-response patterns (portion size vs severity)
  - Food combination effects (synergistic triggers)
  - Statistical confidence levels (p < 0.05 threshold)

### 📸 Photo Documentation

- **AES-256-GCM Encryption**: Every photo encrypted with unique key
- **EXIF Stripping**: Automatic removal of location metadata
- **Before/After Comparisons**: Visual treatment progress tracking
- **Annotation Tools**: Mark specific areas of concern

### 📊 Analytics & Insights

- **Correlation Analysis**: 90-day pattern detection with statistical significance
- **Trend Visualization**: Health score trends over time with Chart.js
- **Symptom Frequency**: Most common symptoms and triggers
- **Medication Adherence**: Compliance tracking

---

## Repository Structure

### Code Organization

```
symptom-tracker/
├── src/                   # Application source (400+ files)
│   ├── app/              # Next.js App Router (pages & API routes)
│   ├── components/       # React components (298 files, 33 categories)
│   ├── lib/              # Business logic
│   │   ├── db/          # Dexie database (18 tables)
│   │   ├── repositories/ # Data access layer
│   │   ├── services/    # Business logic (correlation, flare tracking)
│   │   └── utils/       # Utilities (date, crypto, validation)
│   └── __tests__/        # Integration tests
│
├── public/               # Static assets (PWA icons, manifest)
├── docs/                 # Comprehensive documentation (70+ files)
├── scripts/              # Build and utility scripts
└── bmad/                 # BMad Method framework (AI-assisted development)
```

### Documentation Structure

```
docs/
├── PRD.md                     # Product Requirements Document
├── epics.md                   # Epic breakdown (4 epics, 23 stories)
├── solution-architecture.md   # Technical design and ADRs
├── bmm-workflow-status.md     # Workflow tracking
├── backlog.md                 # Product backlog
│
├── stories/                   # User story files (30+)
├── ui/                        # UI/UX documentation
├── test-reports/              # Test execution reports
├── retrospectives/            # Epic retrospectives
├── findings/                  # Implementation summaries
└── FUTURE/                    # Future enhancements
```

---

## API Endpoints

### Server-Side Routes

All routes located in `src/app/api/`:

1. **`/api/correlation/compute`** (POST/GET)
   - Computes food-symptom correlations
   - Intelligent caching for performance

2. **`/api/correlation/enhanced`** (POST/GET)
   - Enhanced correlations with food combinations
   - Synergy detection for multi-food triggers

3. **`/api/correlation/cron`** (GET - Vercel Cron only)
   - Scheduled correlation recomputation
   - Runs daily at 2 AM UTC

**Authentication**: Cron API protected by bearer token; others are client-side only

---

## Database Schema

### 18 IndexedDB Tables (Schema v18)

**Core Entities**:
- `users` - User profiles and preferences
- `symptoms` - Symptom definitions (50+ presets + custom)
- `medications` - Medication list with schedules
- `triggers` - Trigger definitions (30+ presets + custom)
- `foods` - Food database (200+ presets + custom)

**Event Streams**:
- `symptomInstances` - Symptom occurrences
- `medicationEvents` - Medication intake tracking
- `triggerEvents` - Trigger exposure tracking
- `foodEvents` - Food intake logging

**Flare Tracking** (Epic 2):
- `flares` - Persistent flare entities
- `flareEvents` - Append-only flare history (medical audit trail)
- `flareBodyLocations` - Multi-location flare tracking

**Correlation**:
- `foodCombinations` - Correlation analysis results (auto-generated)

**Media**:
- `photoAttachments` - Encrypted medical photos
- `photoComparisons` - Before/after photo pairs

**Other**:
- `dailyEntries` - Comprehensive daily health logs
- `bodyMapLocations` - Body-specific symptom tracking
- `uxEvents` - Optional UX instrumentation (opt-in)

**Performance**: Compound indexes (`[userId+status]`, `[userId+timestamp]`, `[flareId+timestamp]`) ensure <50ms query times

---

## Components

### Component Library (298 files, 33 categories)

**Major Categories**:

| Category | Count | Purpose |
|----------|-------|---------|
| **analytics** | 33 | Data visualization, trend charts, insights dashboard |
| **body-mapping** | 18 | Enhanced body map with zoom/pan (Epic 1) |
| **flare** | 4+ | Flare lifecycle management (Epic 2) |
| **daily-entry** | 5+ | Daily health reflection form |
| **calendar** | 9 | Timeline and calendar visualization |
| **food** | Multiple | Food journal and correlation |
| **common** | 6 | Reusable UI primitives (Button, Card, Modal, Toast) |
| **navigation** | Multiple | App navigation (Track/Analyze/Manage/Support pillars) |
| **dashboard** | 4 | "Today" view dashboard components |
| **photos** | Multiple | Photo management with encryption |

**Design Patterns**:
- Functional components (no class components)
- TypeScript strict mode (100% type coverage)
- Custom hooks for logic reuse
- Repository pattern for data access
- Co-located tests (`__tests__/` folders)

---

## Privacy & Security

### Privacy Commitment

- ✅ **100% Local Storage** - Data never leaves device
- ✅ **Zero Server Dependency** - No cloud services, no external APIs
- ✅ **No Tracking** - No analytics, no telemetry, no third-party scripts
- ✅ **No Account Required** - No email, no password, no personal info
- ✅ **Open Source** - Transparent code for auditing

### Security Features

**Photo Encryption**:
- AES-256-GCM encryption with per-photo unique keys
- Keys stored separately from encrypted data
- Automatic EXIF metadata stripping (removes GPS, device info)
- Secure deletion with key destruction

**Data Protection**:
- IndexedDB with browser-level security
- Content Security Policy (CSP) headers
- No inline scripts or `eval()` usage
- TypeScript strict mode for runtime safety

---

## Quality Metrics

### Performance Benchmarks

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint | < 1.5s | 1.2s | ✅ |
| Time to Interactive | < 3s | 2.1s | ✅ |
| Largest Contentful Paint | < 2.5s | 1.8s | ✅ |
| Cumulative Layout Shift | < 0.1 | 0.05 | ✅ |
| IndexedDB Query Time | < 50ms | 35ms avg | ✅ |
| Body Map Interaction | < 100ms | <100ms | ✅ |
| Lighthouse Score | > 90 | 95+ | ✅ |

### Code Quality

- **TypeScript Coverage**: 100% (strict mode)
- **Test Coverage**: 85%+ for critical paths
- **Bundle Size**: <300KB initial load
- **Accessibility**: WCAG 2.1 AA compliant
- **Browser Support**: Chrome, Firefox, Safari, Edge (last 2 versions)

---

## Development Workflow

### BMad Method Integration

The project uses the **BMad Method** for AI-assisted development:

1. **Analysis Phase**: Product brief, market research
2. **Planning Phase**: PRD, epics, user stories
3. **Solutioning Phase**: Architecture decisions, tech specs
4. **Implementation Phase**: Story-by-story development

**Workflow Tracking**: `docs/bmm-workflow-status.md`

### Story-Driven Development

**Each story includes**:
- User story format (As a... I want... So that...)
- Acceptance criteria (Given/When/Then)
- Implementation notes
- Test scenarios
- Story context with code references

**Location**: `docs/stories/story-X.Y.md`

---

## Deployment

### Platform

- **Vercel**: Zero-config deployment with global CDN
- **HTTPS**: Automatic SSL certificates
- **Automatic Deployments**: Every push to `main` branch

### Environments

- **Production**: `main` branch → https://symptom-tracker.vercel.app
- **Preview**: Pull requests → Unique preview URLs

### CI/CD

- GitHub Actions for automated testing
- Vercel deployment pipeline
- Cron job for scheduled correlation recomputation

---

## Roadmap

### Completed Phases

**Phase 1**: Foundation
- Core symptom tracking
- Calendar and timeline
- Photo documentation
- PWA infrastructure

**Phase 2a**: Food Journal (Previous Epic)
- Food logging with 200+ database
- Correlation engine with statistical analysis
- Time-delayed analysis
- Food combination detection

**Phase 2b**: Navigation Overhaul (Epic 0)
- Consolidated Track/Analyze/Manage/Support pillars
- Dashboard "Today" view redesign
- UX instrumentation framework

**Phase 2c**: Enhanced Body Map (Epic 1)
- Groin-specific regions
- Zoom/pan controls (1x-3x)
- Coordinate-level precision
- WCAG 2.1 AA accessibility

### Current Phase

**Phase 2d**: Flare Lifecycle (Epic 2 - Partially Complete)
- ✅ Flare data model (Story 2.1)
- ✅ Create from body map (Story 2.2)
- ✅ Update severity/trend (Story 2.3)
- 📋 Remaining stories moved to backlog

**Phase 2e**: Production Readiness (Epic 3.5 - COMPLETE)
- ✅ All 10 stories complete (53 points)
- ✅ Critical bug fixes (mobile scrolling, data persistence)
- ✅ UI/UX improvements across app
- ✅ Accessibility enhancements

**Phase 2f**: Onboarding Enhancement (Epic 3.6 - COMPLETE)
- ✅ Interactive data selection flow (Story 3.6.1)
- ✅ GUID-based user ID for cloud sync prep

**Phase 2g**: Body Map UX Enhancements (Epic 3.7 - IN PROGRESS)
- ✅ Region detail view infrastructure (Story 3.7.1)
- ⏳ Remaining 6 stories in development

### Next Phases

**Phase 2e**: Flare Analytics (Epic 3)
- Problem areas calculation
- Per-region flare history
- Duration and severity metrics
- Trend analysis visualization
- Intervention effectiveness analysis

**Phase 2f**: Photo Integration (Epic 4)
- Attach photos to flares
- Photo timeline for progression
- Side-by-side comparison
- Annotation tools

### Future Vision

**Intelligence Layer**:
- Predictive analytics
- Medical-grade PDF reports
- AI-powered insights

**Enhanced Management**:
- Advanced medication scheduling
- Treatment effectiveness scoring

**Expansion** (opt-in only):
- Encrypted cloud backup
- Peer-to-peer sync
- Secure healthcare provider sharing

---

## Team & Contact

### Development Team

- **Primary Developer**: Individual project
- **AI Assistance**: BMad Method framework integration
- **Target Users**: Hidradenitis Suppurativa community

### Support Channels

- **Issues**: GitHub Issues tracker
- **Discussions**: GitHub Discussions
- **Documentation**: `docs/` folder (70+ files)
- **Email**: [Contact information]

---

## License

**MIT License** - Free to use, modify, and distribute

**What this means**:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ⚠️ Original license and copyright notice required

---

## Quick Links

### Documentation

- [📄 Product Requirements](PRD.md)
- [📊 Epic Breakdown](epics.md)
- [🏗️ Solution Architecture](solution-architecture.md)
- [📈 Workflow Status](bmm-workflow-status.md)
- [🔧 Development Guide](development-guide.md)
- [📦 Component Inventory](component-inventory.md)
- [💾 Data Models](data-models.md)
- [🌐 API Contracts](api-contracts.md)
- [📂 Source Tree Analysis](source-tree-analysis.md)

### External Resources

- **Next.js**: https://nextjs.org
- **React**: https://react.dev
- **Dexie**: https://dexie.org
- **Tailwind CSS**: https://tailwindcss.com
- **BMad Method**: `bmad/` folder

---

## Acknowledgments

- Built with ❤️ for the Hidradenitis Suppurativa community
- Inspired by the need for private, comprehensive health tracking
- Special thanks to all open-source projects that made this possible
- Powered by AI-assisted development with the BMad Method
