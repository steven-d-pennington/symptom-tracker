# Mobile Refactor & React Native Implementation Plan

**Author:** AI Planning Assistant  
**Date:** 2025-02-14  
**Audience:** Founders, Product, Engineering  
**Status:** Draft for review

---

## 1. Executive Summary

The current symptom-tracker is a Next.js/Tailwind/Dexie progressive web app optimized for desktop and mobile browsers. To unlock App Store distribution, native integrations (camera, notifications, secure biometrics), and higher user trust, we will build a React Native implementation that preserves the local-first, privacy-centric philosophy while preparing for future optional cloud sync.

This document proposes a comprehensive plan to deliver a shared React Native codebase targeting both iOS and Android. It covers architectural decisions, platform-specific adaptations, feature parity strategy, phased execution roadmap, and risk mitigation with a low-burn-rate startup lens.

---

## 2. Product & Technical Objectives

1. **Feature Parity & Quality:** Deliver core flows (daily logging, flare lifecycle, body map, photo management, analytics) with native-grade UX, comparable to the web app.
2. **Privacy Preservation:** Keep all data local to the device, maintain AES-256-GCM encryption for photos, and prepare for future end-to-end encrypted sync.
3. **Offline-First Reliability:** Ensure full functionality without connectivity, leveraging local databases and background task queues.
4. **Scalable Foundation:** Architect with modularity to support future expansion (multi-device sync, caregiver sharing, AI insights) without major rewrites.
5. **Lean Delivery:** Optimize team focus, reuse TypeScript domain logic, automate testing, and minimize recurring infrastructure costs.

---

## 3. Guiding Principles

- **Shared Domain Logic:** Reuse TypeScript business logic and Dexie schema definitions by abstracting platform-specific data access.
- **Native UX Expectations:** Use platform-respective navigation, gestures, typography, and accessibility standards to feel "at home" on each OS.
- **Security-First Mindset:** No third-party analytics or SDKs that jeopardize privacy. Respect system-wide biometrics, secure storage, and sandboxing.
- **Modular Architecture:** Feature slices align with existing web architecture (body-map, flares, photos, analytics) for consistent evolution.
- **Observability Without Telemetry:** Focus on on-device diagnostics, opt-in crash reporting, and synthetic test coverage instead of server-side logging.

---

## 4. Architecture Overview

### 4.1 Technology Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Framework | React Native (0.74+) | Aligns with RN New Architecture (Fabric/TurboModules) |
| Language | TypeScript | Shared models and services |
| Navigation | React Navigation 7 | Stack & tab navigators, deep links |
| State Management | Zustand or Redux Toolkit | Evaluate: Zustand for lighter footprint, keep consistent patterns |
| Local Database | WatermelonDB or Realm | Evaluate Dexie alternatives; prefer SQLite/Realm for RN |
| Secure Storage | react-native-encrypted-storage | Store encryption keys, auth tokens |
| Encryption | react-native-get-random-values + WebCrypto polyfill or native libs | Maintain AES-256-GCM parity |
| Media Handling | react-native-vision-camera | Local capture, EXIF stripping |
| Offline Sync Queue | custom service + MMKV persistent queue | Preps for future sync |
| Testing | Jest, React Native Testing Library, Detox | Automation |

### 4.2 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     React Native App                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                Presentation Layer                   │ │
│ │  - Navigation Shell (Tabs + Stacks)                 │ │
│ │  - Feature Screens (Body Map, Flare Log, Photos)    │ │
│ └──────────────┬──────────────────────────────────────┘ │
│                │                                         │
│ ┌──────────────▼──────────────────────────────────────┐ │
│ │             Feature Modules (Hooks & Stores)        │ │
│ │  - useFlaresStore, useDailyEntryStore               │ │
│ │  - Services: FlareService, PhotoService             │ │
│ └──────────────┬──────────────────────────────────────┘ │
│                │                                         │
│ ┌──────────────▼──────────────────────────────────────┐ │
│ │              Data & Encryption Layer                │ │
│ │  - DatabaseAdapter (Realm/SQLite)                   │ │
│ │  - EncryptionService (AES-256-GCM)                  │ │
│ │  - FileSystemBridge (document dir)                  │ │
│ └──────────────┬──────────────────────────────────────┘ │
│                │                                         │
│ ┌──────────────▼──────────────────────────────────────┐ │
│ │         Native Bridges & Platform Services          │ │
│ │  - Camera, Photo Library, Biometrics                │ │
│ │  - Notifications, Background Tasks                  │ │
│ │  - HealthKit/Google Fit (future)                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Platform-Specific Architecture

### 5.1 iOS (Swift + React Native)

- **App Container:** Swift bridge using the RN New Architecture template.
- **Local Database:** Realm (C++) for high performance, encryption-at-rest support, multi-tabless schema; integrate via CocoaPods.
- **Secure Key Storage:** Keychain Services accessed via `react-native-keychain`.
- **Photo Handling:** `react-native-vision-camera` with native plugin to strip EXIF; store encrypted blobs in app's document directory.
- **Biometrics:** Face ID / Touch ID gating for app unlock (optional feature flag).
- **Notifications:** UserNotifications framework for reminders (medication, check-ins) with local scheduling only.
- **Background Tasks:** BGAppRefreshTask for future sync; ensure compliance with iOS restrictions.
- **Build & Distribution:** Xcode Cloud or fastlane for CI/CD, TestFlight for beta.
- **Accessibility:** Dynamic Type scaling, VoiceOver labels, haptic feedback.
- **Low Budget Consideration:** Reuse Apple-provided frameworks, minimize third-party dependencies, lean on Expo modules only if autoplinked and free.

### 5.2 Android (Kotlin + React Native)

- **App Container:** Gradle-based RN template targeting minSdk 24 (Android 7) for broad device coverage.
- **Local Database:** Use the same Realm database (shared schema) or SQLite via WatermelonDB if Realm licensing is acceptable; ensure encryption module.
- **Secure Key Storage:** Android Keystore via `react-native-encrypted-storage` with AES-GCM keys per user.
- **Photo Handling:** CameraX through `react-native-vision-camera`; implement EXIF metadata stripping using native Kotlin module.
- **Biometrics:** BiometricPrompt integration for app lock.
- **Notifications:** WorkManager for reminder scheduling, respecting Doze mode.
- **Background Tasks:** WorkManager periodic jobs for sync queue flushing; handle battery optimizations gracefully.
- **Build & Distribution:** Gradle build via GitHub Actions, distribute through Play Console internal testing track.
- **Accessibility:** TalkBack support, large font scaling, color contrast testing.
- **Low Budget Consideration:** Avoid Google Play Services dependencies (unless required), rely on open-source libraries with permissive licenses.

---

## 6. Data & Security Strategy

1. **Schema Alignment:** Mirror existing Dexie schema. Generate TypeScript models shared between web and mobile via a `shared/` package.
2. **Database Adapter:** Implement a platform-specific adapter that persists to Realm/SQLite; provide repository interface identical to web services.
3. **Encryption Pipeline:**
   - Generate AES-256-GCM keys using native crypto.
   - Store keys in secure enclave (Keychain/Keystore).
   - Encrypt photo blobs + thumbnails before writing to file system.
   - Store metadata (iv, tag) alongside records.
4. **Data Export:** Provide encrypted ZIP export, share via standard share sheet. No automatic upload.
5. **App Lock:** Optional biometric/PIN lock protecting the app session.
6. **Privacy Review:** Maintain data processing register, ensure compliance with GDPR/CCPA for local processing.

---

## 7. Feature Parity & Enhancements

| Web Feature | Mobile Strategy | Notes |
| --- | --- | --- |
| Daily entry logging | Dedicated mobile-first form with progressive disclosure | Use gesture-friendly controls |
| Body map zoom & groin precision | Port SVG assets to React Native SVG, enable pinch zoom | Maintain coordinate system |
| Flare lifecycle tracking | Native timeline + push reminders | Provide offline caching |
| Photo encryption | Native camera + encryption pipeline | Mirror AES-256 |
| Analytics dashboards | Render via Victory Native / Reanimated charts | Optimize for performance |
| Data export/import | Local file export, QR or file share for import | Validate data integrity |
| Settings & personalization | Use native settings screens | Keep toggles for privacy |

---

## 8. Development Workflow

1. **Repository Structure:**
   - `apps/web` (existing Next.js)
   - `apps/mobile` (React Native)
   - `packages/shared` (TypeScript models, validation, constants)
   - `packages/services` (business logic, reused across platforms)

2. **Tooling:**
   - Yarn workspaces or pnpm for mono repo management.
   - ESLint + TypeScript config shared.
   - Prettier + Husky for formatting.
   - Detox for E2E UI flows.

3. **CI/CD:**
   - GitHub Actions with matrix builds (iOS simulator, Android emulator).
   - Lint + unit tests on every PR; nightly Detox run.
   - Fastlane scripts for beta distribution.

4. **Release Management:**
   - Semantic versioning aligned with web release notes.
   - Feature flags for staged rollout.

---

## 9. Implementation Phases

| Phase | Duration | Outcomes |
| --- | --- | --- |
| **0. Discovery & Spike** | 2 weeks | Decide on database (Realm vs WatermelonDB), POC encryption + camera, confirm feasibility |
| **1. Infrastructure Setup** | 3 weeks | Repo restructuring, shared package extraction, CI pipelines, design system tokens |
| **2. Core Data Layer** | 4 weeks | Implement repositories, encryption pipeline, migration scripts, unit tests |
| **3. Core Features MVP** | 6 weeks | Daily entries, symptom logging, flare lifecycle, body map interactions, photo capture |
| **4. Analytics & Insights** | 4 weeks | Problem areas view, charts, caching, offline support |
| **5. Polish & Compliance** | 3 weeks | Accessibility, localization, legal copy, QA, store assets |
| **6. Beta & Iteration** | 4 weeks | TestFlight / Play Console beta, collect feedback, bug fixes |

Total: ~22 weeks (5.5 months) for a polished dual-platform release with a lean 3-4 person team.

---

## 10. Resource Plan (Lean Startup Lens)

- **Team Composition:**
  - 1 Product Manager (part-time)
  - 1 Design Lead (shared with web)
  - 2 Full-stack engineers (mobile-focused)
  - 1 QA automation contractor (fractional)
- **Cost Controls:**
  - Use open-source libraries with permissive licenses.
  - Favor GitHub Actions free tier, community support.
  - Delay paid services (crash analytics, translations) until post-launch.

---

## 11. Risk & Mitigation

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Database migration mismatch | Data loss | Build automated migration tests, run against sample datasets |
| Performance issues on low-end Android | Poor UX | Optimize images, use Hermes JS engine, profile with Flipper |
| Camera permission rejection | Loss of photo feature | Provide transparent rationale, degrade gracefully |
| App store compliance (privacy) | Rejection | Prepare privacy nutrition labels, document encryption |
| Resource constraints | Delays | Timebox scope, reuse web assets, prioritize MVP |
| Future sync integration complexity | Rework | Design data layer with sync queue abstraction now |

---

## 12. Success Metrics

- App Store rating ≥ 4.6 after 3 months.
- Crash-free sessions ≥ 99%.
- Median cold start time ≤ 2.5s.
- Median camera-to-save time ≤ 1.5s.
- ≥ 70% of beta users engage weekly.
- 0 privacy incidents, zero external data transmissions.

---

## 13. Open Questions

1. Realm vs WatermelonDB vs SQLite custom: evaluate licensing, encryption support, team familiarity.
2. Should we adopt Expo? Pros (faster dev) vs Cons (native module flexibility, size).
3. Scope of offline analytics caching vs recalculation on demand.
4. Prioritize App Lock at launch or defer to post-MVP?
5. Localization timeline (English-only vs bilingual launch).

---

## 14. Next Steps

- Schedule stakeholder review of this plan.
- Kick off Phase 0 spikes (database, encryption, camera modules).
- Produce detailed delivery epics and user stories using PRD_MOBILE.md as reference.
- Align design team on mobile UI kit and body map asset adaptations.

