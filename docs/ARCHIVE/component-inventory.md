# Component Inventory

**Project**: Pocket Symptom Tracker
**Last Updated**: 2025-11-04
**Framework**: React 19 with Next.js 15 App Router
**Total Components**: 298 files (.tsx/.ts)

## Overview

The application uses a comprehensive component library organized into 33 functional categories. Components follow React best practices with TypeScript strict mode, custom hooks for logic reuse, and a design system built on Tailwind CSS v4.

## Component Categories

### 🎯 Core Tracking Features

#### 1. analytics/ (33 components)
**Purpose**: Data visualization and insights dashboard

**Key Components**:
- `AnalyticsDashboard.tsx` - Main analytics view with trend charts
- `TrendChart.tsx` - Time-series visualization with Chart.js
- `TrendInterpretation.tsx` - Statistical analysis display
- `TrendTooltip.tsx` - Interactive chart tooltips
- `TrendWidget.tsx` - Dashboard widget for quick trends
- `TimeRangeSelector.tsx` - Date range picker for analytics
- `DashboardContext.tsx` - State management for analytics

**Dependencies**: Chart.js, chartjs-adapter-date-fns, chartjs-plugin-annotation

---

#### 2. body-mapping/ (18 components)
**Purpose**: Enhanced interactive body map with precision location tracking (Epic 1)

**Key Components**:
- `BodyMap.tsx` - Main interactive body map container
- `BodyMapReport.tsx` - Flare location reporting
- `BodyMapHistory.tsx` - Historical body map visualization
- `BodyMapLegend.tsx` - Color-coded severity legend
- `ZoomPanControls.tsx` - Zoom/pan interaction controls (1x-3x)
- `SymptomMarker.tsx` - Individual flare marker on body map
- `SymptomOverlay.tsx` - Visual overlay for active flares
- `RegionDetailPanel.tsx` - Detailed region information panel

**Bodies** (5 SVG components):
- `FrontBody.tsx` - Front body view with 93 regions
- `BackBody.tsx` - Back body view
- `bodies/` - SVG body templates with groin-specific regions

**Hooks**:
- `useBodyMap.ts` - Body map interaction logic
- `useBodyRegions.ts` - Region data management
- `useSymptomMarkers.ts` - Marker placement and updates

**Features**: Coordinate-level precision, zoom/pan (react-zoom-pan-pinch), accessibility (WCAG 2.1 AA)

---

#### 3. body-map/ (3 components)
**Purpose**: Legacy body map components (being phased out)

**Components**:
- `CoordinateMarker.tsx` - Coordinate-based marker
- `BodyMapZoom.tsx` - Zoom functionality (deprecated, moved to body-mapping/)
- `FlareMarkers.tsx` - Flare visualization (deprecated)

**Status**: Superseded by `body-mapping/` (Epic 1 refactor)

---

#### 4. flare/ & flares/ (4 + folder components)
**Purpose**: Flare lifecycle management (Epic 2)

**Key Components**:
- `FlareCard.tsx` - Individual flare card display
- `FlareDetail.tsx` - Detailed flare view with history
- `FlareHistory.tsx` - Historical flare timeline
- `FlareHistoryChart.tsx` - Flare trend visualization
- `FlareList.tsx` - Active flares list view
- `CreateFlareModal.tsx` - Flare creation from body map
- `UpdateFlareModal.tsx` - Update severity/trend
- `InterventionModal.tsx` - Log intervention (Story 2.5)

**Features**: Persistent entities, severity tracking (1-10), trend indicators, intervention logging, append-only audit trail

---

#### 5. daily-entry/ (5 + sections components)
**Purpose**: Comprehensive daily health reflection

**Key Components**:
- `DailyEntryForm.tsx` - Main entry form with sections
- `EntryHistory.tsx` - Past entries list
- `QuickEntry.tsx` - Simplified quick-log mode
- `SmartSuggestions.tsx` - AI-powered entry suggestions
- `EntryTemplates.tsx` - Reusable entry templates

**Entry Sections** (6 components):
- `SymptomSection.tsx` - Symptom logging
- `MedicationSection.tsx` - Medication adherence
- `TriggerSection.tsx` - Trigger exposure
- `BodyMapSection.tsx` - Body location selection
- `NotesSection.tsx` - Free-form notes
- `PhotoSection.tsx` - Photo attachments

**Hooks**:
- `useDailyEntry.ts` - Form state management
- `useSmartSuggestions.ts` - Suggestion logic
- `useEntryTemplates.ts` - Template CRUD

---

#### 6. food/ & food-logging/ (Multiple components)
**Purpose**: Food journal with correlation analysis

**Key Components**:
- `FoodLogModal.tsx` - Food intake logging
- `FoodSearch.tsx` - Search 200+ food database
- `FoodSelector.tsx` - Multi-food meal composition
- `FoodFavorites.tsx` - Quick-access favorites
- `FoodCorrelationView.tsx` - Correlation insights per food
- `MealTypeSelector.tsx` - Breakfast/lunch/dinner/snack
- `PortionSizeSelector.tsx` - Small/medium/large portions

**Features**: Allergen tags (8 categories), time-delayed analysis, dose-response patterns, combination effects

---

#### 7. medication-logging/ & medications/ (Multiple components)
**Purpose**: Medication management and adherence tracking

**Key Components**:
- `MedicationList.tsx` - Active medications list
- `MedicationLogModal.tsx` - Log intake event
- `MedicationSchedule.tsx` - Schedule management
- `AdherenceChart.tsx` - Compliance visualization
- `MedicationReminders.tsx` - Reminder settings

**Features**: Scheduled reminders, adherence tracking, effectiveness analysis

---

#### 8. symptom-logging/ & symptoms/ (Multiple components)
**Purpose**: Symptom definition and logging

**Key Components**:
- `SymptomList.tsx` - Configured symptoms
- `SymptomLogModal.tsx` - Quick symptom logging
- `SymptomCategoryManager.tsx` - Custom categories
- `SeverityScale.tsx` - 1-10 severity input
- `SymptomPresets.tsx` - 50+ preset symptoms

**Features**: Custom severity scales, category management, common triggers

---

#### 9. trigger-logging/ & triggers/ (Multiple components)
**Purpose**: Trigger exposure tracking

**Key Components**:
- `TriggerList.tsx` - Active triggers list
- `TriggerLogModal.tsx` - Log exposure event
- `TriggerCategories.tsx` - Environmental/lifestyle/dietary
- `IntensitySelector.tsx` - Low/medium/high intensity

**Features**: 30+ preset triggers, custom triggers, correlation analysis

---

### 📊 Analysis & Visualization

#### 10. calendar/ (9 components)
**Purpose**: Timeline and calendar visualization

**Key Components**:
- `CalendarView.tsx` - Monthly calendar with health scores
- `TimelineView.tsx` - Chronological event timeline
- `ChartView.tsx` - Chart-based data visualization
- `DatePicker.tsx` - Date navigation
- `CalendarControls.tsx` - View mode switcher
- `Legend.tsx` - Color-coded legend
- `ExportTools.tsx` - Calendar export functionality

**Hooks**:
- `useDateNavigation.ts` - Date state management
- `useCalendarFilters.ts` - Filter logic
- `useCalendarExport.ts` - Export functionality

---

#### 11. charts/ (1 component)
**Purpose**: Specialized chart components

**Key Components**:
- `FoodCorrelationDelayChart.tsx` - Time-delayed correlation visualization

---

#### 12. correlation/ (2 components)
**Purpose**: Correlation analysis display

**Key Components**:
- `ConfidenceBadge.tsx` - Statistical confidence indicator
- `InsufficientDataBadge.tsx` - Warning for low sample size

**Features**: P-value display, confidence levels (high/medium/low)

---

#### 13. timeline/ (Components)
**Purpose**: Event timeline visualization

**Key Components**:
- `TimelineEntry.tsx` - Individual event card
- `TimelineFilter.tsx` - Filter by event type
- `TimelineExport.tsx` - Timeline export

---

### 🎨 UI & Layout

#### 14. common/ (6 components)
**Purpose**: Reusable UI primitives

**Key Components**:
- `Button.tsx` - Primary button component
- `Card.tsx` - Content card container
- `Modal.tsx` - Modal dialog
- `Toast.tsx` - Notification toast
- `ToastContainer.tsx` - Toast manager
- `MarkdownPreview.tsx` - Markdown rendering

**Design System**: Tailwind CSS v4, Radix UI primitives

---

#### 15. navigation/ (Components)
**Purpose**: App navigation and routing

**Key Components**:
- `NavBar.tsx` - Top navigation bar
- `BottomNav.tsx` - Mobile bottom navigation
- `SideNav.tsx` - Desktop sidebar
- `BreadcrumbNav.tsx` - Page breadcrumbs

**Pillars**: Track, Analyze, Manage, Support (Epic 0)

---

#### 16. landing/ (Components)
**Purpose**: Landing page and onboarding

**Key Components**:
- `LandingHero.tsx` - Hero section
- `FeatureShowcase.tsx` - Feature highlights
- `PrivacySection.tsx` - Privacy commitment
- `CTASection.tsx` - Call-to-action

---

#### 17. empty-states/ (Components)
**Purpose**: Empty state components with CTAs

**Key Components**:
- `EmptyDashboard.tsx` - Dashboard empty state
- `EmptyFlares.tsx` - Flares empty state
- `EmptyCalendar.tsx` - Calendar empty state

**Features**: Guided CTAs, progressive disclosure (Epic 0)

---

#### 18. dashboard/ (4 components)
**Purpose**: "Today" view dashboard (Epic 0)

**Key Components**:
- `TodayHighlightsCard.tsx` - Health score summary
- `TodayTimelineCard.tsx` - Today's events preview
- `TodayQuickActionsCard.tsx` - Quick-access actions
- `TodayEmptyStates.tsx` - Empty state handling

**Features**: Route-based quick actions, flare monitoring, timeline preview

---

### 🔧 Data Management & Settings

#### 19. data-management/ (Components)
**Purpose**: Data export and backup

**Key Components**:
- `ExportData.tsx` - Export to JSON/CSV/PDF
- `ImportData.tsx` - Import from backup
- `BackupManager.tsx` - Automatic backup scheduling
- `DataDeletion.tsx` - One-click data deletion

**Features**: Anonymization options, version control

---

#### 20. manage/ (Components)
**Purpose**: Manage data entities

**Key Components**:
- `ManageSymptoms.tsx` - Symptom CRUD
- `ManageMedications.tsx` - Medication CRUD
- `ManageTriggers.tsx` - Trigger CRUD
- `ManageFoods.tsx` - Food CRUD

---

#### 21. settings/ (Components)
**Purpose**: App preferences and configuration

**Key Components**:
- `SettingsView.tsx` - Main settings page
- `ThemeSettings.tsx` - Light/dark/system theme
- `NotificationSettings.tsx` - Reminder preferences
- `PrivacySettings.tsx` - UX instrumentation toggle
- `ExportFormatSettings.tsx` - Default export format

---

#### 22. filters/ (Components)
**Purpose**: Data filtering UI

**Key Components**:
- `SymptomFilter.tsx` - Filter by symptom
- `DateRangeFilter.tsx` - Date range selection
- `SeverityFilter.tsx` - Filter by severity
- `CategoryFilter.tsx` - Filter by category

---

### 📱 PWA & System

#### 23. pwa/ (Components)
**Purpose**: Progressive Web App functionality

**Key Components**:
- `InstallPrompt.tsx` - Install banner
- `OfflineIndicator.tsx` - Offline status badge
- `UpdatePrompt.tsx` - App update notification
- `ServiceWorkerManager.tsx` - SW registration

**Features**: Install capability, offline-first, service worker caching

---

#### 24. photos/ (Components)
**Purpose**: Photo management with AES-256-GCM encryption

**Key Components**:
- `PhotoGallery.tsx` - Photo grid view
- `PhotoUpload.tsx` - Photo capture/upload
- `PhotoViewer.tsx` - Full-screen photo viewer
- `PhotoComparison.tsx` - Before/after comparison
- `PhotoAnnotation.tsx` - Annotation tools

**Security**: Per-photo encryption keys, EXIF stripping, secure deletion

---

#### 25. providers/ (Components)
**Purpose**: React Context providers

**Key Components**:
- `DatabaseProvider.tsx` - Dexie database context
- `ThemeProvider.tsx` - Theme context
- `NotificationProvider.tsx` - Notification context
- `UserProvider.tsx` - User context

---

#### 26. mood/ & sleep/ (Components)
**Purpose**: Mood and sleep tracking (Story 3.5.2)

**Key Components**:
- `MoodLogger.tsx` - Mood entry form (1-10 scale)
- `SleepLogger.tsx` - Sleep quality and duration
- `MoodChart.tsx` - Mood trend visualization
- `SleepChart.tsx` - Sleep pattern analysis

---

#### 27. quick-log/ (Components)
**Purpose**: One-tap quick logging from dashboard

**Key Components**:
- `QuickLogFood.tsx` - Quick food logging
- `QuickLogSymptom.tsx` - Quick symptom logging
- `QuickLogMedication.tsx` - Quick medication check-in

---

## Component Patterns

### Custom Hooks

Components extensively use custom hooks for logic reuse:

**Data Hooks**:
- `useDatabase.ts` - Dexie database access
- `useSymptoms.ts` - Symptom CRUD operations
- `useMedications.ts` - Medication CRUD
- `useTriggers.ts` - Trigger CRUD
- `useFoods.ts` - Food database queries
- `useFlares.ts` - Flare entity management

**UI Hooks**:
- `useModal.ts` - Modal state management
- `useToast.ts` - Toast notifications
- `useTheme.ts` - Theme switching
- `useMediaQuery.ts` - Responsive breakpoints

**Analytics Hooks**:
- `useCorrelation.ts` - Correlation computation
- `useTrends.ts` - Trend analysis
- `useAnalytics.ts` - Analytics data aggregation

### Repository Pattern

Data access abstracted through repositories (`src/lib/repositories/`):
- `symptomInstanceRepository.ts`
- `medicationEventRepository.ts`
- `foodEventRepository.ts`
- `flareRepository.ts`
- `flareEventRepository.ts`

### State Management

- **Global State**: React Context API (`providers/`)
- **Local State**: React hooks (`useState`, `useReducer`)
- **Form State**: Controlled components with Zod validation
- **Cache**: Custom hooks with `useEffect` for data fetching

### Styling Conventions

- **Framework**: Tailwind CSS v4
- **Utilities**: `@apply` for component-specific styles
- **Dark Mode**: `dark:` prefix for theme variants
- **Accessibility**: `focus:`, `hover:`, `active:` states

---

## Testing Strategy

**Coverage**: 85%+ for critical paths

**Test Files**: 50+ test files in `__tests__/` folders

**Testing Tools**:
- Jest for unit tests
- React Testing Library for component tests
- fake-indexeddb for database mocking

**Test Patterns**:
- Arrange-Act-Assert
- User-centric queries (`getByRole`, `getByLabelText`)
- Accessibility testing (`@testing-library/jest-dom`)

---

## Reusability Matrix

### Highly Reusable (20+ usages)
- `Button` - Used across all forms and actions
- `Card` - Primary content container
- `Modal` - Dialogs throughout app
- `Toast` - Notifications system-wide

### Moderately Reusable (10-20 usages)
- `ConfidenceBadge` - Correlation analysis
- `SeverityScale` - Symptom/flare severity
- `DatePicker` - Date selection across features
- `EmptyState` - Empty states per feature

### Feature-Specific (<10 usages)
- `BodyMap` - Body mapping feature only
- `FlareCard` - Flare tracking only
- `FoodCorrelationDelayChart` - Food analysis only

---

## Component Dependencies

### External Dependencies

**UI Components**:
- `@radix-ui/react-tooltip` - Accessible tooltips
- `lucide-react` - Icon library (500+ icons)
- `react-zoom-pan-pinch` - Body map zoom/pan

**Visualization**:
- `chart.js` - Chart rendering
- `react-chartjs-2` - React wrapper for Chart.js
- `chartjs-adapter-date-fns` - Date handling for charts
- `chartjs-plugin-annotation` - Chart annotations

**Utilities**:
- `date-fns` - Date manipulation
- `uuid` - UUID generation
- `zod` - Schema validation

---

## Architecture Decisions

**Component Structure**:
- Functional components (no class components)
- TypeScript strict mode (100% type coverage)
- Props destructuring with default values
- Forward refs for imperative handles

**File Organization**:
- One component per file (except small related components)
- Co-located tests (`__tests__/` folders)
- Co-located hooks (`hooks/` folders)
- Index files for clean imports (`index.ts`)

**Naming Conventions**:
- PascalCase for components (`Button.tsx`)
- camelCase for hooks (`useModal.ts`)
- kebab-case for utilities (`date-utils.ts`)
- Descriptive names over abbreviations

**Performance Optimizations**:
- Lazy loading for large components (body map, charts)
- Memoization for expensive calculations (`useMemo`, `useCallback`)
- Code splitting at route level (Next.js automatic)
- Virtual scrolling for long lists (food database, flare history)

---

## Future Enhancements

**Planned Components**:
- `FlareClusterAnalysis.tsx` - Cluster detection visualization (Epic 3)
- `InterventionEffectivenessChart.tsx` - Intervention analysis (Epic 3)
- `ProblemAreasHeatmap.tsx` - Body region heatmap (Epic 3)
- `PhotoTimeline.tsx` - Flare photo progression (Epic 4)
- `PhotoAnnotationTools.tsx` - Enhanced annotation (Epic 4)

**Under Consideration**:
- Component library extraction (shared package)
- Storybook integration for component documentation
- Visual regression testing (Chromatic/Percy)
- Accessibility audit automation
