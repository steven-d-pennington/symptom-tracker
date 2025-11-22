# PRD_MOBILE – React Native Symptom Tracker

**Author:** AI Planning Assistant  
**Date:** 2025-02-14  
**Status:** Draft for stakeholder review  
**Product Stage:** New Native Application (Greenfield)  
**Target Release:** Beta – Q3 2025, GA – Q4 2025

---

## 1. Background & Vision

The existing symptom-tracker web app serves chronic illness patients who require meticulous daily logging, flare lifecycle management, and privacy-preserving data control. Users have requested native mobile experiences to gain better performance, offline reliability, native camera workflows, and access through App Stores. Competitors are beginning to ship native experiences, creating urgency to deliver a high-quality, privacy-respecting mobile app that aligns with our local-first philosophy.

**Vision:** Deliver a native-quality mobile companion that empowers patients to document and understand their symptoms anywhere, anytime, without sacrificing privacy or increasing operational costs. The app must function fully offline, store all sensitive data locally, and maintain the design language and analytical depth users expect from the web product.

---

## 2. Objectives & Success Metrics

### 2.1 Primary Objectives

1. **Native Experience:** Provide a first-class iOS and Android app with responsive navigation, gesture interactions, and mobile-optimized UI.
2. **Feature Parity:** Support the same critical workflows as the web app (daily entries, flare lifecycle, body map precision, analytics, photo documentation).
3. **Privacy & Security:** Maintain zero external data transmission, client-side encryption, and optional biometric app lock.
4. **Offline Reliability:** Users can capture, review, and analyze data without connectivity and sync seamlessly when optional future cloud sync is introduced.
5. **Operational Efficiency:** Reuse domain logic, minimize recurring costs, and ship with a lean team.

### 2.2 Success Metrics

- ≥ 70% weekly active rate among existing engaged web users after 8 weeks.
- Crash-free sessions ≥ 99% on both platforms.
- App Store rating ≥ 4.6 (iOS) and Play Store rating ≥ 4.5 within 3 months of GA.
- Median time from app launch to log a daily entry ≤ 45 seconds.
- Zero confirmed privacy incidents or data exfiltration pathways.
- At least 60% of beta testers report the mobile app is their primary logging tool.

---

## 3. Target Users & Personas

1. **Primary Persona – Chronic Condition Patient (Alex, 32):** Needs fast, discreet logging during daily routines, values privacy, may have intermittent connectivity.
2. **Secondary Persona – Care Team Collaborator (Jordan, 40):** Reviews logs with patient, occasionally needs exported data; relies on patient device since no multi-user support yet.
3. **Tertiary Persona – Research/Clinical Advisor (Dr. Lee, 45):** Advises on product; requires confidence in data integrity and audit trails.

Accessibility considerations: support users with limited dexterity, vision impairments, and cognitive load challenges.

---

## 4. Scope & Feature Overview

### 4.1 In-Scope (MVP)

- Daily entry capture (symptoms, triggers, medications, notes).
- Body map with precise location tagging and groin enhancements.
- Flare lifecycle management (create, update, resolve) with severity trends.
- Photo capture with encrypted storage and timeline view.
- Analytics dashboards (problem areas, severity trends, duration metrics).
- Data export/import (encrypted files via share sheet).
- Reminders/notifications for logging and medication.
- Optional biometric/PIN app lock.
- Settings (theme, privacy controls, backup/export management).

### 4.2 Future Enhancements (Post-MVP)

- Optional encrypted multi-device sync.
- Caregiver sharing and permissions.
- AI-assisted insights (client-side ML).
- HealthKit/Google Fit integrations.
- Localization beyond English.

### 4.3 Out of Scope (MVP)

- Cloud-based analytics or dashboards.
- Third-party analytics/telemetry.
- Account system or user authentication beyond single local profile.
- Web to mobile data sync beyond manual export/import.

---

## 5. Detailed Functional Requirements

### 5.1 Daily Entry Logging

- **FR-01:** Users can create a daily entry capturing date, overall well-being, pain level, symptoms, triggers, medications, custom notes.
- **FR-02:** Provide preset symptom/trigger lists with toggles and custom additions matching web defaults.
- **FR-03:** Support offline creation with optimistic UI updates.
- **FR-04:** Auto-save drafts and handle multi-session editing.

### 5.2 Body Map & Flare Location Precision

- **FR-05:** Present front/back/side anatomical views with pinch-to-zoom and pan.
- **FR-06:** Allow tap placement to set normalized coordinates; capture groin regions with high precision.
- **FR-07:** Display active, improving, worsening, resolved markers with color-coded legend.
- **FR-08:** Support editing of marker positions before saving.

### 5.3 Flare Lifecycle Management

- **FR-09:** Create flares with metadata (location, severity 1-10, notes, timestamp).
- **FR-10:** Persist unique flare IDs for historical tracking.
- **FR-11:** Update flares with severity changes, trend classification, interventions, photos.
- **FR-12:** Mark flares resolved with resolution date and notes.
- **FR-13:** Show timeline of updates per flare with chronological ordering.

### 5.4 Photo Capture & Encryption

- **FR-14:** Capture photos or import from gallery with user permission.
- **FR-15:** Strip EXIF metadata before storage.
- **FR-16:** Encrypt photos and thumbnails using AES-256-GCM with keys stored in secure enclave/keystore.
- **FR-17:** Provide carousel timeline per flare with pinch-to-zoom preview.
- **FR-18:** Allow deletion of photos with double confirmation.

### 5.5 Analytics & Insights

- **FR-19:** Present problem areas (heat map/list) aggregating flare frequency by body region.
- **FR-20:** Display severity trend charts per flare and overall.
- **FR-21:** Show flare duration metrics (avg, median, longest) with filters by timeframe.
- **FR-22:** Offer timeline of daily entries with highlight of flare milestones.

### 5.6 Data Management

- **FR-23:** Export data as encrypted archive (JSON + media) via share sheet.
- **FR-24:** Import archive, merging data with conflict resolution prompts.
- **FR-25:** Provide storage usage overview and option to purge thumbnails or archived flares.

### 5.7 Notifications & Reminders

- **FR-26:** Schedule local notifications for daily logging, medication reminders, flare check-ins.
- **FR-27:** Allow snooze, skip, and custom recurrence patterns.
- **FR-28:** Respect system quiet hours (iOS Focus, Android Do Not Disturb) automatically.

### 5.8 Security & Privacy

- **FR-29:** Optional biometric/PIN lock to access app; fallback to device passcode.
- **FR-30:** Display privacy dashboard showing data residency (local-only) and encryption status.
- **FR-31:** Zero network calls without explicit user action (e.g., optional feedback email link).

### 5.9 Settings & Personalization

- **FR-32:** Theme toggle (light/dark/system default).
- **FR-33:** Manage default symptom/trigger catalogs and custom entries.
- **FR-34:** Configure analytics refresh frequency (on-demand vs automatic).

---

## 6. Non-Functional Requirements

- **NFR-01:** Cold start < 3s on mid-tier devices (iPhone 12, Pixel 5).
- **NFR-02:** Body map interactions respond within 100ms.
- **NFR-03:** Database operations complete in ≤ 50ms median.
- **NFR-04:** App size < 150MB (combined assets) at launch.
- **NFR-05:** Meet WCAG 2.1 AA standards (support VoiceOver/TalkBack).
- **NFR-06:** Support offline mode indefinitely; data integrity maintained across app restarts.
- **NFR-07:** 80% automated test coverage across business logic modules.
- **NFR-08:** Comply with Apple/Google privacy nutrition labels (no data collection).
- **NFR-09:** Battery impact: background activity < 1%/hour during idle.

---

## 7. Platform-Specific Considerations

### 7.1 iOS

- Native share sheet for export/import (UIDocumentInteractionController).
- WidgetKit exploration post-MVP for quick logging shortcuts.
- Leverage SF Symbols for consistent iconography; fallback to custom set on Android.
- Provide Live Activities integration (stretch goal) for ongoing flare monitoring.

### 7.2 Android

- Support adaptive icons and Material You dynamic color.
- Integrate Quick Settings tile for "Log Symptom" shortcut (Android 13+).
- Respect scoped storage rules; use app-specific directories.
- Implement backup exclusion flags to prevent automatic Google Drive backups unless user opts in via export.

---

## 8. Dependencies & External Integrations

- React Native core libraries and community modules (vision-camera, realm/watermelon, encrypted storage).
- No third-party analytics SDKs.
- Optional open-source crash reporter (Sentry) only if configured for on-device storage with manual upload; default off.
- Design assets from existing Figma library adapted for mobile breakpoints.

---

## 9. User Experience Requirements

- **Navigation:** Bottom tab bar with quick access to Log, Body Map, Flares, Insights, Settings. Use nested stack for details.
- **Gestures:** Swipe actions for flare status changes, pinch-to-zoom on body map/photos.
- **Feedback:** Haptics on critical actions (iOS) and vibration (Android). Inline success toasts (non-network).
- **Empty States:** Provide guidance and education for new users; link to privacy pledge.
- **Onboarding:** 3-step onboarding covering privacy, offline storage, and quick-start logging.
- **Localization:** English only at launch, but structure copy for future i18n.

---

## 10. Analytics & Telemetry Strategy

- No remote analytics by default.
- On-device analytics module caches usage metrics (screen views, feature adoption) for future optional opt-in sync.
- Provide manual export of anonymized diagnostics for support requests.

---

## 11. Data Model & Storage

- Mirror existing Dexie schema with necessary adjustments for Realm/SQLite.
- Maintain versioned migrations; include migration test harness.
- Store media encrypted in app document directory; maintain references in database.
- Implement background job for thumbnail generation and cleanup.

---

## 12. Competitive Landscape & Differentiators

- Competitors (Cara Care, Bearable) use cloud-based architectures with privacy trade-offs.
- Differentiation: local-first, encrypted photos, detailed body map, analytics tailored to HS and related conditions.
- App Store messaging: "Your health data never leaves your device."

---

## 13. Risks & Assumptions

- **Risk:** React Native performance on large data sets → Mitigate with Realm and virtualization.
- **Risk:** App Store review concerns about encryption/export → Document privacy approach, provide support contact.
- **Risk:** Limited engineering bandwidth → Prioritize MVP scope, reuse shared packages.
- **Assumption:** Users continue to export data for physician sharing; no real-time cloud portal required at launch.
- **Assumption:** Existing SVG assets can be adapted for React Native without major redrawing.

---

## 14. Release Plan

1. **Phase 0 – Discovery (2 weeks):** Feasibility spikes for database, encryption, camera.
2. **Phase 1 – Foundation (3 weeks):** Project setup, navigation shell, shared packages.
3. **Phase 2 – Data Layer (4 weeks):** Implement repositories, migrations, encryption service.
4. **Phase 3 – Core Workflows (6 weeks):** Daily entry, flares, body map, photo capture.
5. **Phase 4 – Insights & Notifications (4 weeks):** Analytics dashboards, reminders, export/import.
6. **Phase 5 – Polish & Compliance (3 weeks):** Accessibility, app lock, QA, store submissions.
7. **Phase 6 – Beta (4 weeks):** TestFlight/Play Store beta, telemetry export, bug fixes.
8. **Phase 7 – GA Launch:** Public release with marketing campaign aligned with privacy messaging.

---

## 15. Go/No-Go Checklist

- All FR/NFR items validated via QA sign-off.
- Detox regression suite passing on CI for both platforms.
- Accessibility audit complete with documented fixes.
- App Store privacy questionnaire and Play Console data safety forms approved.
- Security review confirming encryption pipeline and secure key storage.
- Support documentation updated (knowledge base, FAQs).

---

## 16. Appendices

### A. Glossary

- **Flare:** Persistent symptom event tracked over time.
- **Body Map Region:** Discrete anatomical zone used for location tagging.
- **Local-First:** Architecture where all data resides on device by default.

### B. Reference Documents

- [MOBILE_REFACTOR.md](./MOBILE_REFACTOR.md) – technical implementation plan.
- Existing web [PRD](../PRD.md) and [Solution Architecture](../solution-architecture.md) for context.

