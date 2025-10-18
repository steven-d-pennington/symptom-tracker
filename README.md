# Pocket Symptom Tracker

# Pocket Symptom Tracker

## 📱 Privacy-First PWA for Autoimmune Symptom Tracking

A localized Progressive Web Application designed to help people with autoimmune conditions like Hidradenitis Suppurativa track symptoms, medications, triggers, and health patterns entirely on their device.

## 🚀 Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## ✨ Latest Status: Phase 2 Complete! 🎉

**Phase 1 (Complete ✅)**: Core MVP with onboarding, symptom tracking, daily entries, and basic infrastructure

**Phase 2 (Complete ✅)**: Body mapping, photo documentation, flare dashboard, and trigger analysis

**Total**: 75+ components built, covering 10+ major features with 100% offline functionality

## 📚 Documentation

[![Updated Documentation Structure](https://img.shields.io/badge/Docs-Consolidated-007acc)](docs/README.md)

See the complete [documentation hub](docs/README.md) for:
- [Current Implementation Status](docs/IMPLEMENTATION/current-status.md)
- [Architecture Overview](docs/ARCHITECTURE/overview.md)
- [Development Setup](docs/DEVELOPMENT/setup-guide.md)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Database**: IndexedDB (Dexie v4)
- **State**: React Context + Custom Hooks
- **Testing**: Jest + React Testing Library
- **PWA**: Service Worker + Web App Manifest
- **Deployment**: Vercel (static hosting)

## 🔐 Privacy & Security

- **100% Local-First**: All data stored in browser IndexedDB
- **AES-256-GCM Encryption**: Photos encrypted with per-photo keys
- **EXIF Stripping**: Automatic removal of location metadata
- **Zero External Calls**: No cloud transmission without consent
- **Offline-Only**: Full functionality without internet

## 🌟 Key Features

### Core Features (Phase 1 ✅)
- **Flexible Symptom Tracking**: Custom categories and severity scales
- **Daily Entries**: Comprehensive health logging with modular sections
- **Calendar & Timeline**: Historical data visualization
- **Progressive Web App**: Installable with offline support

### Advanced Features (Phase 2 ✅)
- **Body Mapping**: Visual symptom location tracking on SVG anatomy
- **Photo Documentation**: Encrypted medical photo storage with annotations
- **Active Flare Dashboard**: Real-time symptom flare monitoring
- **Trigger Correlation Analysis**: 90-day pattern detection with AI insights

## 📱 App Structure

```
/                    → Landing page with feature overview
/dashboard           → Main dashboard with quick access
/log                 → Daily entry form
/photos              → Photo gallery with encryption
/flares              → Active flare tracking
/triggers            → Correlation analysis
/calendar            → Timeline and calendar views
/body-map            → Interactive body mapping
/manage              → Symptoms, triggers, medications
/settings            → User preferences
/export              → Data export/import
```

## 📊 Database Schema

**12 Tables** with type-safe IndexedDB storage:
- User profiles and preferences
- Symptoms with customizable categories
- Daily entries with nested structures
- Medication and trigger tracking
- Photo attachments with encryption
- Flare monitoring and interventions
- Body map locations and analysis results

## 🧪 Quality Metrics

- **TypeScript Coverage**: 100% (strict mode enabled)
- **Test Coverage**: 85%+ for critical paths
- **Performance**: <1.5s FCP, <3s TTI, Lighthouse scores >90
- **Architecture**: Repository pattern, service layer, component isolation

## 🚀 Scaling & Future

**Phase 3 (Planned)**: Intelligence Layer
- Advanced data analysis and pattern detection
- PDF report generation for medical consultations

**Phase 4 (Planned)**: Polish & Scale
- Enhanced medication management
- Dynamic custom trackables
- Advanced customization and accessibility

**Phase 5 (Future):** Multi-device sync, healthcare provider integration

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Need the old docs?** Check [docs/ARCHIVE/](../docs/ARCHIVE/) for historical documentation.
