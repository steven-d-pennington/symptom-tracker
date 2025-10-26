# Pocket Symptom Tracker

<div align="center">

## 📱 Privacy-First Health Tracking for Autoimmune Conditions

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)

A fully offline-capable Progressive Web Application designed for people with chronic conditions like Hidradenitis Suppurativa to track symptoms, medications, food intake, and discover health patterns—all while keeping your data completely private on your device.

[📚 Documentation](docs/README.md) • [🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🔐 Privacy](#-privacy--security)

</div>

---

## 🎯 What Makes This Special

**100% Local-First**: Every piece of your health data stays on your device. No cloud. No servers. No data mining.

**Precision Body Mapping**: Enhanced interactive body map with groin-specific regions, zoom/pan functionality, and coordinate-level precision for exact flare location tracking—transforming basic symptom logging into medical-grade anatomical documentation.

**Complete Flare Lifecycle Tracking**: Monitor individual flares from onset through resolution with persistent entities, severity progression, trend analysis (improving/worsening/stable), and intervention logging for comprehensive treatment effectiveness evaluation.

**Comprehensive Health Tracking**: Log symptoms, medications, triggers, food intake, photos, and precise body locations—all in one integrated system with correlation analysis.

**Smart Insights**: Automated correlation analysis with statistical significance testing helps you discover patterns between what you eat, what you're exposed to, and how you feel—including time-delayed effects, dose-response patterns, and food combination triggers.

**Medical-Grade Privacy**: AES-256-GCM encryption for photos, EXIF stripping, zero external data transmission, and optional on-device UX instrumentation.

**Truly Offline**: Full functionality without internet connection. Install as an app on any device.

---

## 📊 Current Development Status

**Project Phase**: Flare Tracking & Body Map Enhancements (Level 2 - Medium Scale)

**Progress**: 15 of 23 stories complete (65%) | 80 story points delivered

**Completed**:
- ✅ **Epic 0**: UI/UX Revamp (5/5 stories) - Modern navigation and dashboard
- ✅ **Epic 1**: Enhanced Body Map (6/6 stories) - Precision location tracking with zoom/pan
- 🔄 **Epic 2**: Flare Lifecycle (3/8 stories) - Creating and tracking flares

**Next**: Story 2.5 (Log Flare Interventions), then Stories 2.6-2.8, followed by Epic 3 (Analytics) and Epic 4 (Photo Integration)

**Architecture Highlights**:
- Brownfield enhancement of existing Next.js 15 + React 19 + TypeScript stack
- Single new dependency: react-zoom-pan-pinch (3.6.1) for body map interactions
- Medical-grade data integrity: Append-only event history (ADR-003) with atomic transactions
- <100ms interaction latency (NFR-001), offline-first with immediate IndexedDB persistence (NFR-002)

> See [BMM Workflow Status](docs/bmm-workflow-status.md) for detailed progress tracking and decision log.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/symptom-tracker.git

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

**First-time setup**: The app will guide you through a privacy-focused onboarding process to customize your tracking experience.

---

## ✨ Features

### Core Health Tracking
- **📊 Flexible Symptom Tracking** - Custom categories with configurable 1-10 severity scales
- **💊 Medication Management** - Track adherence with scheduled reminders and timing analysis
- **⚠️ Trigger Monitoring** - Environmental, lifestyle, and dietary trigger tracking
- **📝 Daily Health Journal** - Comprehensive daily entries with energy, sleep, stress, and mood
- **📅 Calendar & Timeline** - Historical visualization with multiple view modes (day/week/month/year)

### Advanced Features

#### 🍽️ Food Journal & Correlation Analysis
- **Quick Food Logging** - One-tap access from dashboard
- **200+ Pre-populated Foods** - Common foods with allergen tags (dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish)
- **Custom Food Creation** - Add your own foods with preparation methods and allergen information
- **Meal Composition** - Log multi-food meals with portion sizes (small/medium/large)
- **Photo Documentation** - Visual records of meals with encrypted storage
- **Favorites System** - Quick access to frequently logged foods
- **Smart Correlation Engine**:
  - Time-delayed analysis (15min to 72hrs post-consumption)
  - Dose-response patterns (portion size vs symptom severity)
  - Food combination effects (synergistic triggers)
  - Statistical confidence levels (p < 0.05 threshold)
  - Allergen category analysis
- **Integrated Dashboard** - Food triggers alongside environmental triggers
- **Detailed Reports** - Per-food correlation insights with timeline visualization

#### 🗺️ Precision Body Mapping System (Epic 1 - Complete)
- **Enhanced Interactive Anatomy** - Front and back body views with 93 distinct regions including groin-specific areas (left, right, center)
- **Zoom & Pan Controls** - Pinch-to-zoom (mobile) and scroll-wheel zoom (desktop) from 1x to 3x magnification for precise anatomical focus
- **Coordinate-Level Precision** - Click/tap to capture exact flare locations with normalized 0-1 coordinates, enabling tracking of multiple flares in the same body region
- **Real-time Flare Markers** - Visual indicators on body map showing active, improving, worsening, and resolved flares with status-coded colors
- **Medical-Grade Accuracy** - Pixel-perfect coordinate capture with <100ms response time for smooth interactions
- **Full Accessibility** - WCAG 2.1 Level AA compliant with keyboard navigation, screen reader support, and comprehensive ARIA labels
- **Region Analytics** - Most affected areas with trend analysis
- **Historical Tracking** - See how body-specific symptoms change over time

#### 🔥 Flare Lifecycle Management (Epic 2 - In Progress)
- **Persistent Flare Entities** - Each flare gets a unique ID and complete lifecycle tracking from onset to resolution
- **Precision Location Capture** - Create flares directly from body map with exact coordinates and region identification
- **Severity & Trend Tracking** - Record severity changes (1-10 scale) with trend indicators (improving/stable/worsening)
- **Intervention Logging** - Document treatments (ice, heat, medication, rest, drainage) with timestamps for effectiveness analysis
- **Active Flare Dashboard** - Real-time monitoring of all active flares with severity, trend arrows, days active, and last updated
- **Complete History Timeline** - Chronological view of all status updates and interventions for each flare
- **Immutable Medical Audit Trail** - Append-only event history ensures data integrity for medical documentation
- **Offline-First Architecture** - Immediate IndexedDB persistence with zero data loss

#### 📸 Photo Documentation
- **Medical Photo Storage** - Capture and organize symptom photos
- **AES-256-GCM Encryption** - Every photo encrypted with unique key
- **EXIF Stripping** - Automatic removal of location metadata
- **Before/After Comparisons** - Track treatment progress visually
- **Annotation Tools** - Mark specific areas of concern
- **Gallery Organization** - Tag, search, and filter by date or symptom

#### 🔥 Active Flare Dashboard (Enhanced - Epic 2)
- **Real-time Monitoring** - Track active symptom flares with live status updates and severity badges
- **Precision Location** - Each flare linked to exact body map coordinates with region identification
- **Severity Progression** - Historical tracking with 1-10 scale and trend indicators (improving/stable/worsening)
- **Intervention Logging** - Record treatments (ice, heat, medication, rest, drainage) with timestamps and effectiveness tracking
- **Complete Audit Trail** - Immutable append-only event history for medical-grade documentation
- **Body Map Integration** - Visual flare markers on interactive body map with status-coded colors
- **Quick Actions** - Update severity, log interventions, mark as improving/worsening, or resolve with one tap
- **Days Active Tracking** - Automatic calculation of flare duration from onset
- **Offline-First** - Immediate IndexedDB persistence with React Query cache invalidation

#### 📈 Analytics & Insights
- **Correlation Analysis** - 90-day pattern detection with statistical significance
- **Trend Visualization** - Health score trends over time
- **Symptom Frequency** - Most common symptoms and triggers
- **Medication Adherence** - Compliance tracking and effectiveness analysis
- **Trigger Insights** - Actionable recommendations based on your data

### Data Management
- **📤 Export Capabilities** - JSON, CSV, and PDF reports for medical consultations
- **📥 Import Support** - Restore from backups or migrate from other apps
- **🔄 Sync Status** - Visual indicators for data synchronization state
- **💾 Automatic Backups** - Scheduled local backups with version control

---

## 📱 App Structure

```
/                       → Modern landing page with feature overview
/onboarding            → Privacy-first setup wizard

Protected Routes (Track → Analyze → Manage → Support):
├── Track Pillar
│   ├── /dashboard          → Today view with highlights, quick actions, and timeline preview
│   ├── /log                → Daily health reflection and entry form
│   ├── /flares             → Active flare tracking with body map integration
│   └── /photos             → Encrypted photo gallery
│
├── Analyze Pillar
│   ├── /analytics          → Correlation insights and pattern analysis
│   ├── /calendar           → Timeline and calendar visualization
│   └── /triggers           → Trigger correlation and effectiveness
│
├── Manage Pillar
│   ├── /manage             → Configure symptoms, medications, triggers, foods
│   ├── /export             → Data export and backup tools
│   ├── /settings           → App preferences and customization
│   └── /privacy            → Privacy controls and UX instrumentation settings
│
└── Support Pillar
    └── /about              → About the application and documentation
```

**Navigation Improvements (Epic 0 - Complete)**:
- Consolidated navigation with consistent Track/Analyze/Manage/Support pillars across desktop and mobile
- Removed redundant "More" hub for streamlined user experience
- Centralized route configuration for consistent page titles and breadcrumbs
- Dashboard redesigned as focused "Today" view with guided empty states
- Flares page simplified with progressive disclosure for advanced features
- UX instrumentation (opt-in) for validation and improvement metrics

---

## 🏗️ Tech Stack

**Frontend Framework**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI component library
- [TypeScript](https://www.typescriptlang.org/) - 100% type-safe codebase

**Styling & UI**
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [react-zoom-pan-pinch](https://github.com/prc5/react-zoom-pan-pinch) - Declarative zoom/pan for interactive body map
- [Lucide React](https://lucide.dev/) - Consistent iconography system
- Custom design system with dark mode support

**Database & Storage**
- [Dexie v4](https://dexie.org/) - IndexedDB wrapper with advanced querying
- 15+ tables with compound indexes for sub-50ms queries
- Schema versioning with automated migrations

**State Management**
- React Context API for global state
- Custom hooks for feature-specific logic
- Repository pattern for data access layer

**PWA & Performance**
- Service Worker with intelligent caching strategies
- Web App Manifest for installability
- Code splitting and lazy loading
- Image optimization and compression

**Testing & Quality**
- [Jest](https://jestjs.io/) - Unit and integration testing
- [React Testing Library](https://testing-library.com/) - Component testing
- TypeScript strict mode - 100% type coverage
- ESLint + Prettier for code quality

**Deployment**
- [Vercel](https://vercel.com/) - Zero-config deployment with global CDN
- Static site generation for optimal performance
- HTTPS by default with automatic SSL

---

## 🔐 Privacy & Security

### Our Privacy Commitment

**Your health data is yours. Period.**

- ✅ **100% Local Storage** - Data never leaves your device
- ✅ **Zero Server Dependency** - No cloud services, no external APIs
- ✅ **No Tracking** - No analytics, no telemetry, no third-party scripts
- ✅ **No Account Required** - No email, no password, no personal info
- ✅ **Open Source** - Transparent code you can audit yourself

> **Note:** Optional UX instrumentation for validation is opt-in and remains on-device. Enable it via Settings → Privacy, and export recent events locally with `npm run ux:validate` when reviewing releases.

### Security Features

**Photo Encryption**
- AES-256-GCM encryption with per-photo unique keys
- Keys stored separately from encrypted data
- Automatic EXIF metadata stripping (removes GPS, device info)
- Secure deletion with key destruction

**Data Protection**
- IndexedDB with browser-level security
- Content Security Policy (CSP) headers
- No inline scripts or eval() usage
- Strict TypeScript for runtime safety

**Privacy Controls**
- Granular data retention policies
- One-click data deletion
- Export with anonymization options
- No cookies or local storage tracking

### Compliance
- HIPAA-compliant architecture (user-controlled data)
- GDPR-ready (data minimization, user control)
- WCAG 2.1 AA accessible

---

## 📊 Database Schema

**18 Tables** (Schema v18) optimized for health data:

| Table | Purpose | Records |
|-------|---------|---------|
| `users` | User profiles and preferences | Single user |
| `symptoms` | Symptom definitions and categories | 50+ presets + custom |
| `symptomInstances` | Individual symptom occurrences | Unlimited |
| `medications` | Medication list with schedules | User-defined |
| `medicationEvents` | Medication intake tracking | Event stream |
| `triggers` | Trigger definitions | 30+ presets + custom |
| `triggerEvents` | Trigger exposures | Event stream |
| `foods` | Food database with allergen tags | 200+ presets + custom |
| `foodEvents` | Food intake logging | Event stream |
| `foodCombinations` | Correlation analysis results | Auto-generated |
| `dailyEntries` | Comprehensive daily health logs | One per day |
| `bodyMapLocations` | Body-specific symptom tracking | Linked to symptoms |
| `photoAttachments` | Encrypted medical photos | Unlimited |
| `photoComparisons` | Before/after photo pairs | User-created |
| `flares` | Persistent flare entities with lifecycle tracking | Active + resolved |
| `flareEvents` | Append-only flare history (severity, trend, interventions) | Medical audit trail |
| `uxEvents` | Optional on-device UX instrumentation (opt-in) | Privacy-aware metrics |
| `userPreferences` | Enhanced user preferences and view settings | Per-user config |

**Performance**: Compound indexes ([userId+status], [userId+bodyRegionId], [flareId+timestamp]) ensure <50ms query times for all operations.

**Data Integrity**: Medical-grade append-only event history (ADR-003) with immutable flare progression tracking and atomic Dexie transactions.

---

## 🧪 Quality Metrics

### Performance Benchmarks
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint (FCP) | < 1.5s | 1.2s | ✅ |
| Time to Interactive (TTI) | < 3s | 2.1s | ✅ |
| Largest Contentful Paint (LCP) | < 2.5s | 1.8s | ✅ |
| Cumulative Layout Shift (CLS) | < 0.1 | 0.05 | ✅ |
| IndexedDB Query Time | < 50ms | 35ms avg | ✅ |
| Body Map Interaction | < 100ms | <100ms | ✅ |
| Photo Encryption (1MB) | < 100ms | 75ms | ✅ |
| Lighthouse Score | > 90 | 95+ | ✅ |

### UX Validation Metrics (Baseline - Oct 2025)
| Workflow | Target | Measured | Status |
|----------|--------|----------|--------|
| Log Flare from Dashboard | ≤ 30s | 18.2s | ✅ |
| Access Analytics | ≤ 3 hops | 2 hops | ✅ |
| Access Manage Data | ≤ 3 hops | 3 hops | ✅ |

> Validation performed using UX instrumentation (opt-in) with privacy-aware event tracking. See [UX Validation Scripts](docs/ui/ux-validation-scripts.md) for methodology.

### Code Quality
- **TypeScript Coverage**: 100% (strict mode)
- **Test Coverage**: 85%+ for critical paths
- **Bundle Size**: < 300KB initial load
- **Accessibility**: WCAG 2.1 AA compliant
- **Browser Support**: Chrome, Firefox, Safari, Edge (last 2 versions)

---

## 🗺️ Development Roadmap

### ✅ Completed Features (72% of Current Epic)

**Phase 1 & 2: Foundation**
- Core symptom tracking and daily entries
- Calendar and timeline visualization
- Photo documentation with AES-256-GCM encryption
- Trigger correlation analysis
- PWA infrastructure with offline support
- Export and data management

**Food Journal System (Previous Epic - Complete)**
- Food logging with 200+ pre-populated items
- Food-symptom correlation engine with statistical analysis
- Allergen tag system (8 categories)
- Meal composition tracking with portion sizes
- Time-delayed analysis (15min to 72hrs)
- Dose-response and combination pattern detection

**Epic 0: UI/UX Revamp & Navigation Harmonization (5 stories - Complete) ✅**
- Consolidated Track/Analyze/Manage/Support navigation pillars
- Dashboard "Today" view refresh with guided empty states
- Flares view simplification with progressive disclosure
- Centralized navigation configuration and route titles
- UX instrumentation and validation framework

**Epic 1: Enhanced Body Map with Precision Location Tracking (6 stories - Complete) ✅**
- Added groin-specific regions (left, right, center) to body map SVG
- Implemented zoom/pan controls (1x-3x) with pinch-to-zoom and scroll-wheel support
- Coordinate-based location marking with 0-1 normalization for precision
- Real-time flare markers with status indicators (active/improving/worsening/resolved)
- Full WCAG 2.1 Level AA keyboard navigation and screen reader support
- Medical-grade <100ms interaction response time

**Epic 2: Flare Lifecycle Management (3 of 8 stories - In Progress) 🔄**
- ✅ Flare data model with IndexedDB schema (FlareRecord, FlareEventRecord)
- ✅ Create new flare from body map with coordinate capture
- ✅ Update flare status with severity and trend tracking
- 🚧 Log flare interventions (next - Story 2.5)
- 📋 View flare history timeline (planned)
- 📋 Mark flare as resolved (planned)
- 📋 Resolved flares archive (planned)

### 🔄 Current Sprint (15 of 23 stories complete - 65%)

**Story 2.5: Log Flare Interventions** (Ready for Development)
- Modal for logging intervention type (ice, heat, medication, rest, drainage, other)
- Intervention history with chronological timeline
- Integration with flare detail page
- Icon mapping and accessibility compliance

**Remaining Epic 2 Stories:**
- Story 2.6: View Flare History Timeline
- Story 2.7: Mark Flare as Resolved
- Story 2.8: Resolved Flares Archive

### 📋 Planned (Next Epics)

**Epic 3: Flare Analytics and Problem Areas (5 stories)**
- Calculate and display "problem areas" (regions with highest flare frequency)
- Per-region flare history with drill-down views
- Flare duration and severity metrics with statistical summaries
- Flare trend analysis visualization over time
- Intervention effectiveness analysis with correlation

**Epic 4: Photo Documentation Integration (4 stories - Lower Priority)**
- Attach photos to flare entities with timeline view
- Photo timeline for before/during/after progression
- Side-by-side photo comparison with slider
- Simple photo annotation tools

**Future Phases (Under Consideration)**
- **Intelligence Layer**: Predictive analytics, medical-grade PDF reports, AI-powered insights
- **Enhanced Management**: Advanced medication scheduling, treatment effectiveness scoring
- **Expansion** (opt-in only): Encrypted cloud backup, peer-to-peer sync, secure healthcare provider sharing

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Project Planning & Architecture
- **[Product Requirements Document (PRD)](docs/PRD.md)** - Strategic requirements and user journeys
- **[Epic Breakdown](docs/epics.md)** - Detailed story breakdown for all 4 epics (23 stories)
- **[BMM Workflow Status](docs/bmm-workflow-status.md)** - Current progress, decision log, and next actions
- **[Solution Architecture](docs/solution-architecture.md)** - Technical design, ADRs, and implementation guidance

### User Experience
- **[UI/UX Revamp Blueprint](docs/ui/ui-ux-revamp-blueprint.md)** - Navigation harmonization and design patterns
- **[UX Validation Scripts](docs/ui/ux-validation-scripts.md)** - Task walkthroughs and success metrics

### Individual Stories
- **[Story Files](docs/stories/)** - Detailed acceptance criteria and implementation notes for each story
- **[Story Context Files](docs/stories/)** - Generated context with code references, constraints, and test ideas

### Testing & Quality
- **[Testing Guide](TESTING_GUIDE.md)** - Testing strategy and examples
- **Target Coverage**: 80%+ for service/util layers, medical-grade data integrity

### Future Ideas
- **[Future Enhancements](docs/FUTURE/future-ideas.md)** - Ideas for future phases and features

---

## 🤝 Contributing

This is currently a personal health tracking project. If you're interested in contributing:

1. **Report Issues**: Found a bug? [Open an issue](https://github.com/your-org/symptom-tracker/issues)
2. **Feature Requests**: Have an idea? Start a discussion
3. **Pull Requests**: Fork, branch, and submit PRs for review

Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**What this means**: You can use, modify, and distribute this software freely, even commercially, as long as you include the original license and copyright notice.

---

## 🙏 Acknowledgments

- Built with ❤️ for the Hidradenitis Suppurativa community
- Inspired by the need for private, comprehensive health tracking
- Special thanks to all open-source projects that made this possible

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/your-org/symptom-tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/symptom-tracker/discussions)
- **Email**: [your-email@example.com](mailto:your-email@example.com)

---

<div align="center">

**⭐ If this project helps you manage your health, consider starring it! ⭐**

Made with 💙 for better health tracking

</div>
