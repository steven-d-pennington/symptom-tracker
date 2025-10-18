# Pocket Symptom Tracker - Documentation Hub

## Overview

Pocket Symptom Tracker is a privacy-first Progressive Web Application (PWA) designed to help people with autoimmune conditions track symptoms, medications, triggers, and health patterns entirely on their device.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to explore the application.

## Documentation Structure

### 🏗️ [Architecture](./ARCHITECTURE/)
- **[System Overview](./ARCHITECTURE/overview.md)** - High-level system architecture and principles
- **[Data Model](./ARCHITECTURE/data-model.md)** - Database schema and entity relationships
- **[Technical Stack](./ARCHITECTURE/technical-stack.md)** - Technology decisions and frameworks
- **[Security & Privacy](./ARCHITECTURE/security-privacy.md)** - Security architecture and privacy protections

### 📋 [Product](./PRODUCT/)
- **[Requirements](./PRODUCT/requirements.md)** - Consolidated product requirements and user stories
- **[Epics & Roadmap](./PRODUCT/epics-roadmap.md)** - Feature epics and development roadmap
- **[User Stories](./PRODUCT/user-stories.md)** - Key user stories organized by feature

### 🎨 [Design](./DESIGN/)
- **[Design System](./DESIGN/design-system.md)** - Component library and UI patterns
- **[User Experience](./DESIGN/user-experience.md)** - UX specifications and interaction patterns
- **[Accessibility](./DESIGN/accessibility.md)** - Accessibility guidelines and compliance

### 💻 [Development](./DEVELOPMENT/)
- **[Setup Guide](./DEVELOPMENT/setup-guide.md)** - Development environment setup
- **[Component Library](./DEVELOPMENT/component-library.md)** - Component documentation and usage
- **[Testing Strategy](./DEVELOPMENT/testing-strategy.md)** - Testing approach and guidelines
- **[API Reference](./DEVELOPMENT/api-reference.md)** - Internal API documentation
- **[Deployment Guide](./DEVELOPMENT/deployment.md)** - Build and deployment instructions

### 🚀 [Features](./FEATURES/)
- **[Symptom Tracking](./FEATURES/symptom-tracking.md)** - Symptom recording and management
- **[Photo Documentation](./FEATURES/photo-documentation.md)** - Secure medical photo storage
- **[Body Mapping](./FEATURES/body-mapping.md)** - Visual symptom location tracking
- **[Flare Dashboard](./FEATURES/flare-dashboard.md)** - Active symptom monitoring
- **[Trigger Analysis](./FEATURES/trigger-analysis.md)** - Trigger correlation and insights
- **[Calendar & Timeline](./FEATURES/calendar-timeline.md)** - Historical data navigation

### 📊 [Implementation](./IMPLEMENTATION/)
- **[Current Status](./IMPLEMENTATION/current-status.md)** - Up-to-date implementation status
- **[Phase 1 Summary](./IMPLEMENTATION/phase-1-summary.md)** - Phase 1 completion details
- **[Phase 2 Summary](./IMPLEMENTATION/phase-2-summary.md)** - Phase 2 completion details
- **[Future Roadmap](./IMPLEMENTATION/future-roadmap.md)** - Phase 3-4 plans and timeline

### 📖 [Stories](./STORIES/)
- **[Completed Stories](./STORIES/completed/)** - Development stories organized by epic
- **[In Progress](./STORIES/in-progress/)** - Current work and active development

### 📦 [Archive](./ARCHIVE/)
- **[Brainstorming Sessions](./ARCHIVE/brainstorming-sessions.md)** - Historical brainstorming results
- **[Market Research](./ARCHIVE/market-research.md)** - Initial market research findings
- **[Old Tech Specs](./ARCHIVE/old-tech-specs.md)** - Deprecated technical specifications

## Project Status

### Current Phase: Phase 2 Complete ✅

**Phase 1: Core MVP** - ✅ COMPLETE
- ✅ Onboarding system with user education
- ✅ Symptom tracking with flexible categorization  
- ✅ Daily entry system with smart defaults
- ✅ Calendar and timeline views
- ✅ Basic data storage with IndexedDB
- ✅ PWA infrastructure with service workers

**Phase 2: HS-Specific Features** - ✅ COMPLETE
- ✅ Body mapping system for anatomical symptom location
- ✅ Photo documentation with encryption and organization
- ✅ Active flare dashboard with real-time monitoring
- ✅ Enhanced trigger tracking with correlation analysis
- ✅ Navigation system (mobile bottom tabs, desktop sidebar)
- ✅ Body map + flare integration

**Phase 3: Intelligence Layer** - 📋 PLANNED
- 📋 Data analysis with pattern detection and insights
- 📋 Report generation for medical consultations
- 📋 Advanced search and filtering capabilities

**Phase 4: Polish and Scale** - 📋 PLANNED
- 📋 Medication management with effectiveness analysis
- 📋 Custom trackables with dynamic data types
- 📋 Comprehensive settings and customization
- 📋 Data import/export with migration support

## Key Principles

- **Privacy-First**: All data stored locally, zero server dependencies
- **Offline-First**: Full functionality without network connectivity
- **Progressive Enhancement**: Core functionality works everywhere, enhanced features layered on top
- **Type-Safe**: TypeScript throughout with strict mode enabled
- **Modular**: Component-based architecture with clear separation of concerns

## Technology Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Data**: Dexie.js (IndexedDB wrapper)
- **Testing**: Jest + React Testing Library
- **PWA**: Service workers with offline support
- **Deployment**: Vercel (static hosting)

## Getting Help

- 📖 Check the relevant documentation section above
- 🔍 Search existing issues and stories
- 📝 Review implementation status for current work
- 🎯 Check user stories for feature requirements

---

**Last Updated**: October 13, 2025  
**Version**: 2.0  
**Status**: Phase 2 Complete, Phase 3-4 Planned
