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

**Comprehensive Tracking**: Log symptoms, medications, triggers, food intake, photos, and body mapping—all in one integrated system.

**Smart Insights**: Automated correlation analysis helps you discover patterns between what you eat, what you're exposed to, and how you feel.

**Medical-Grade Privacy**: AES-256-GCM encryption for photos, EXIF stripping, and zero external data transmission.

**Truly Offline**: Full functionality without internet connection. Install as an app on any device.

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

#### 🍽️ Food Journal & Correlation (Epic 1 & 2)
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

#### 🗺️ Body Mapping System
- **Interactive SVG Anatomy** - Front and back body views with 30+ distinct regions
- **Visual Symptom Tracking** - Pin symptoms to exact body locations
- **Region Analytics** - Most affected areas with trend analysis
- **Severity Overlays** - Color-coded severity visualization
- **Historical Tracking** - See how body-specific symptoms change over time

#### 📸 Photo Documentation
- **Medical Photo Storage** - Capture and organize symptom photos
- **AES-256-GCM Encryption** - Every photo encrypted with unique key
- **EXIF Stripping** - Automatic removal of location metadata
- **Before/After Comparisons** - Track treatment progress visually
- **Annotation Tools** - Mark specific areas of concern
- **Gallery Organization** - Tag, search, and filter by date or symptom

#### 🔥 Active Flare Dashboard
- **Real-time Monitoring** - Track active symptom flares with status updates
- **Severity Progression** - Historical tracking of flare intensity
- **Intervention Logging** - Record treatments (ice, medication, rest) and effectiveness
- **Body Map Integration** - Visual flare location tracking
- **Quick Actions** - Mark as improving/worsening/resolved

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

Protected Routes:
├── /dashboard          → Quick actions and health overview
├── /log                → Daily health entry form
├── /food               → Food logging (via quick-log modal)
├── /photos             → Encrypted photo gallery
├── /flares             → Active flare tracking and management
├── /triggers           → Correlation analysis and insights
├── /calendar           → Timeline and calendar visualization
├── /body-map           → Interactive symptom body mapping
├── /manage             → Configure symptoms, medications, triggers
├── /settings           → App preferences and privacy controls
└── /export             → Data export and backup tools
```

---

## 🏗️ Tech Stack

**Frontend Framework**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://react.dev/) - UI component library
- [TypeScript](https://www.typescriptlang.org/) - 100% type-safe codebase

**Styling & UI**
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
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

**15 Tables** optimized for health data:

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
| `flares` | Active symptom flare tracking | Active + historical |

**Performance**: Compound indexes ensure <50ms query times for all common operations.

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
| Photo Encryption (1MB) | < 100ms | 75ms | ✅ |
| Lighthouse Score | > 90 | 95+ | ✅ |

### Code Quality
- **TypeScript Coverage**: 100% (strict mode)
- **Test Coverage**: 85%+ for critical paths
- **Bundle Size**: < 300KB initial load
- **Accessibility**: WCAG 2.1 AA compliant
- **Browser Support**: Chrome, Firefox, Safari, Edge (last 2 versions)

---

## 🗺️ Development Roadmap

### ✅ Completed (Phase 1 & 2 + Food Epics)
- Core symptom tracking and daily entries
- Calendar and timeline visualization
- Body mapping with visual symptom tracking
- Photo documentation with encryption
- Active flare dashboard
- Trigger correlation analysis
- **Food logging with 200+ items**
- **Food-symptom correlation engine**
- **Allergen tag system**
- **Meal composition tracking**
- **Statistical analysis with confidence levels**
- PWA infrastructure with offline support
- Export and data management

### 🔄 In Progress (Epic 2 - Analytics Enhancement)
- Advanced time-window correlation analysis
- Dose-response pattern detection
- Food combination synergy identification
- Enhanced correlation confidence metrics
- Integrated dashboard refinements

### 📋 Planned (Future Phases)
- **Phase 3: Intelligence Layer**
  - Predictive analytics and pattern forecasting
  - Medical-grade PDF report generation
  - Advanced search and filtering
  - AI-powered insights and recommendations

- **Phase 4: Enhanced Management**
  - Advanced medication scheduling
  - Dynamic custom trackables
  - Treatment effectiveness scoring
  - Data visualization improvements

- **Phase 5: Expansion** (Consideration)
  - Optional encrypted cloud backup
  - Multi-device sync (peer-to-peer)
  - Healthcare provider sharing (secure, opt-in)
  - Community insights (anonymized, aggregated)

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Documentation Hub](docs/README.md)** - Complete guide index
- **[Current Status](docs/IMPLEMENTATION/current-status.md)** - Implementation progress
- **[Architecture Overview](docs/ARCHITECTURE/overview.md)** - Technical architecture
- **[Development Guide](docs/DEVELOPMENT/setup-guide.md)** - Setup and contribution
- **[API Reference](docs/DEVELOPMENT/component-library.md)** - Component library
- **[Testing Guide](TESTING_GUIDE.md)** - Testing strategy and examples

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
