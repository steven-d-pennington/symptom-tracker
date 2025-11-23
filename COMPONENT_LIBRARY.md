# Pocket Symptom Tracker - Component Library Reference

**Last Updated**: October 12, 2025  
**Framework**: React 19.1.0 with TypeScript 5  
**Total Components**: 96 components across 14 feature directories  
**Component Pattern**: Functional components with hooks

---

## Table of Contents

1. [Overview](#overview)
2. [Component Organization](#component-organization)
3. [Analytics Components](#analytics-components)
4. [Body Mapping Components](#body-mapping-components)
5. [Calendar Components](#calendar-components)
6. [Daily Entry Components](#daily-entry-components)
7. [Data Management Components](#data-management-components)
8. [Flare Components](#flare-components)
9. [Management Components](#management-components)
10. [Navigation Components](#navigation-components)
11. [Photo Components](#photo-components)
12. [Provider Components](#provider-components)
13. [PWA Components](#pwa-components)
14. [Settings Components](#settings-components)
15. [Symptom Components](#symptom-components)
16. [Trigger Components](#trigger-components)
17. [Component Patterns](#component-patterns)
18. [Accessibility](#accessibility)
19. [Testing](#testing)

---

## Overview

### Component Architecture

**Type**: Functional components with React Hooks  
**State Management**: React Context API + local state (useState, useReducer)  
**Styling**: Tailwind CSS 4 utility classes  
**UI Framework**: Radix UI primitives for accessible components  
**Forms**: React Hook Form for validation  
**Icons**: Lucide React  

### Design Principles

1. **Composition over Inheritance**: Small, focused components that compose together
2. **Accessibility First**: ARIA labels, keyboard navigation, screen reader support
3. **Mobile-First**: Responsive design with touch-friendly targets
4. **Type Safety**: Full TypeScript coverage with strict mode
5. **Testable**: Shallow component trees, dependency injection, clear interfaces

---

## Component Organization

```
src/components/
├── analytics/          # Intelligence layer (trends, predictions)
├── body-mapping/       # SVG body maps and symptom location tracking
├── calendar/           # Calendar views, timeline, charts
├── daily-entry/        # Daily entry form and sections
├── data-management/    # Import/export/backup
├── flare/              # Active flare tracking dashboard
├── manage/             # Symptom/medication/trigger management
├── navigation/         # App navigation (sidebar, bottom tabs, top bar)
├── photos/             # Photo capture, gallery, annotation
├── providers/          # React context providers
├── pwa/                # PWA features (install, offline, sync)
├── settings/           # Settings and preferences
├── symptoms/           # Symptom tracking components
└── triggers/           # Trigger correlation and insights
```

**Total**: 96 components, 14 feature directories

---

## Analytics Components

**Directory**: `src/components/analytics/`  
**Purpose**: Intelligence layer with trend analysis, predictions, and insights

### AnalyticsDashboard

**File**: `AnalyticsDashboard.tsx`  
**Purpose**: Main analytics dashboard with multiple trend widgets

**Props**: None (uses DashboardContext)

**Usage**:
```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

<DashboardProvider service={trendService}>
  <AnalyticsDashboard />
</DashboardProvider>
```

**Features**:
- Grid layout with trend widgets for key metrics
- Time range selector
- Loading states and error handling
- Responsive grid (1-3 columns)

---

### TrendWidget

**File**: `TrendWidget.tsx`  
**Purpose**: Individual trend visualization widget

**Props**: None (uses DashboardContext)

**Internal State**:
- `metric`: Current metric being displayed
- `timeRange`: Selected time range (7d, 30d, 90d, 365d)
- `trendData`: Loaded trend analysis result

**Usage**:
```tsx
<TrendWidget />
```

**Features**:
- Metric selector dropdown
- TrendChart visualization
- TrendInterpretation (plain language)
- Loading skeleton
- Error state

---

### TrendChart

**File**: `TrendChart.tsx`  
**Purpose**: Line chart with regression trend line

**Props**:
```typescript
interface TrendChartProps {
  data: Point[];                    // Actual data points
  predictions?: Point[];            // Predicted values (regression)
  metric: string;                   // Metric name for labeling
  rSquared?: number;                // R² value for confidence
  variant?: 'full' | 'compact';     // Size variant
}
```

**Usage**:
```tsx
<TrendChart 
  data={actualPoints}
  predictions={regressionPredictions}
  metric="overallHealth"
  rSquared={0.72}
  variant="full"
/>
```

**Features**:
- Chart.js line chart
- Actual values (blue line, dots)
- Predicted values (red dashed line)
- R² displayed in legend
- Responsive sizing

---

### TrendInterpretation

**File**: `TrendInterpretation.tsx`  
**Purpose**: Plain language explanation of trend direction

**Props**:
```typescript
interface TrendInterpretationProps {
  direction: 'improving' | 'stable' | 'worsening' | 'insufficient-data';
  confidence: 'high' | 'medium' | 'low';
}
```

**Usage**:
```tsx
<TrendInterpretation direction="improving" confidence="high" />
// Displays: "Your overall health is improving with high confidence"
```

**Features**:
- Color-coded badges (green/yellow/red)
- Icon indicators
- Tooltips with methodology explanation

---

### TimeRangeSelector

**File**: `TimeRangeSelector.tsx`  
**Purpose**: Time range selection buttons

**Props**:
```typescript
interface TimeRangeSelectorProps {
  value?: '7d' | '30d' | '90d' | '365d';
  onChange: (range: string) => void;
  disabled?: boolean;
}
```

**Usage**:
```tsx
<TimeRangeSelector 
  value={timeRange}
  onChange={setTimeRange}
  disabled={loading}
/>
```

---

### TrendTooltip

**File**: `TrendTooltip.tsx`  
**Purpose**: Educational tooltip for analytics terms

**Props**:
```typescript
interface TrendTooltipProps {
  term: string;          // Term to explain
  explanation: string;   // Explanation text
}
```

**Usage**:
```tsx
<TrendTooltip 
  term="R² Value"
  explanation="Measures how well the trend line fits the data (0-1)"
/>
```

---

### DashboardContext

**File**: `DashboardContext.tsx`  
**Purpose**: Shared state for analytics dashboard

**Provider Props**:
```typescript
interface DashboardProviderProps {
  children: ReactNode;
  service: TrendAnalysisService;
}
```

**Context Value**:
```typescript
interface DashboardContextValue {
  trends: Map<string, RegressionResult>;    // Cached trends by metric
  loading: Map<string, boolean>;            // Loading states
  errors: Map<string, string>;              // Error messages
  loadTrend: (metric: string, range: string) => Promise<void>;
  clearCache: () => void;
}
```

**Hook**:
```tsx
const { trends, loadTrend } = useDashboard();
```

---

## Body Mapping Components

**Directory**: `src/components/body-mapping/`  
**Purpose**: Visual symptom location tracking with SVG body maps

### BodyMapViewer

**File**: `BodyMapViewer.tsx`  
**Purpose**: Interactive SVG body map with symptom markers

**Props**:
```typescript
interface BodyMapViewerProps {
  userId: string;
  selectedSymptomId?: string;        // Filter to one symptom
  dateRange?: { start: Date; end: Date };
  onRegionClick?: (regionId: string) => void;
  interactive?: boolean;              // Allow clicks
}
```

**Usage**:
```tsx
<BodyMapViewer 
  userId="user-123"
  selectedSymptomId="symptom-456"
  dateRange={{ start: thirtyDaysAgo, end: today }}
  onRegionClick={handleRegionClick}
  interactive={true}
/>
```

**Features**:
- Front/back body view toggle
- SVG regions highlighted by symptom frequency
- Color intensity (heatmap)
- Zoom and pan controls
- Click to view region details

---

### BodyRegionSelector

**File**: `BodyRegionSelector.tsx`  
**Purpose**: Body region selection UI (for daily entry)

**Props**:
```typescript
interface BodyRegionSelectorProps {
  symptomId: string;
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
}
```

**Usage**:
```tsx
<BodyRegionSelector 
  symptomId="symptom-123"
  selectedRegions={['left-thigh', 'right-knee']}
  onChange={setSelectedRegions}
/>
```

---

### FrontBody / BackBody

**Files**: `bodies/FrontBody.tsx`, `bodies/BackBody.tsx`  
**Purpose**: SVG body diagrams with clickable regions

**Props**:
```typescript
interface BodyProps {
  selectedRegions?: string[];
  onRegionClick?: (regionId: string) => void;
  symptomData?: Map<string, number>;  // regionId -> severity
  interactive?: boolean;
}
```

**Features**:
- 30+ clickable SVG regions
- Hover effects
- Color intensity based on severity
- Accessible labels

---

### BodyMapHistory

**File**: `BodyMapHistory.tsx`  
**Purpose**: Historical body map data over time

**Props**:
```typescript
interface BodyMapHistoryProps {
  userId: string;
  symptomId: string;
  days: number;  // Number of days to display
}
```

---

### SymptomMarker

**File**: `SymptomMarker.tsx`  
**Purpose**: Marker/pin on body map

**Props**:
```typescript
interface SymptomMarkerProps {
  x: number;
  y: number;
  severity: number;
  symptomName: string;
  onClick?: () => void;
}
```

---

### ZoomPanControls

**File**: `ZoomPanControls.tsx`  
**Purpose**: Zoom in/out and pan controls for body map

**Props**:
```typescript
interface ZoomPanControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  zoomLevel: number;
}
```

---

### RegionDetailPanel

**File**: `RegionDetailPanel.tsx`  
**Purpose**: Side panel showing symptom history for a region

**Props**:
```typescript
interface RegionDetailPanelProps {
  userId: string;
  regionId: string;
  onClose: () => void;
}
```

---

## Calendar Components

**Directory**: `src/components/calendar/`  
**Purpose**: Calendar views, timelines, and data visualization

### CalendarView

**File**: `CalendarView.tsx`  
**Purpose**: Main calendar page with month/week/day views

**Props**: None (page-level component)

**Features**:
- Month grid view
- Week view
- Day detail view
- Entry status indicators
- Navigation controls

---

### CalendarGrid

**File**: `CalendarGrid.tsx`  
**Purpose**: Month grid with entry indicators

**Props**:
```typescript
interface CalendarGridProps {
  userId: string;
  currentDate: Date;
  entries: DailyEntryRecord[];
  onDateSelect: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
}
```

**Features**:
- 6-week grid layout
- Color-coded entry status
- Symptom severity indicators
- Today highlight
- Keyboard navigation

---

### TimelineView

**File**: `TimelineView.tsx`  
**Purpose**: Horizontal timeline of events

**Props**:
```typescript
interface TimelineViewProps {
  events: TimelineEvent[];
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onSelectEvent?: (eventId: string) => void;
  selectedEventId?: string;
}
```

**Features**:
- Horizontal scrolling timeline
- Zoom in/out
- Event markers
- Symptom flares highlighted
- Medication events

---

### ChartView

**File**: `ChartView.tsx`  
**Purpose**: Multi-metric chart visualization

**Props**:
```typescript
interface ChartViewProps {
  metrics: Array<{
    key: string;
    label: string;
    color: string;
    data: Point[];
  }>;
  onRegisterChart?: (chartRef: any) => void;
  variant?: 'full' | 'compact';
}
```

**Usage**:
```tsx
<ChartView 
  metrics={[
    { key: 'overallHealth', label: 'Overall Health', color: '#3b82f6', data: healthData },
    { key: 'energyLevel', label: 'Energy', color: '#10b981', data: energyData }
  ]}
  variant="full"
/>
```

---

### DayView

**File**: `DayView.tsx`  
**Purpose**: Detailed view of a single day's entry

**Props**:
```typescript
interface DayViewProps {
  entry: DailyEntryRecord;
  events?: TimelineEvent[];
  onEdit?: () => void;
}
```

---

### DatePicker

**File**: `DatePicker.tsx`  
**Purpose**: Date range picker

**Props**:
```typescript
interface DatePickerProps {
  dateRange: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
}
```

---

### CalendarControls

**File**: `CalendarControls.tsx`  
**Purpose**: Calendar navigation and view controls

**Props**:
```typescript
interface CalendarControlsProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: string) => void;
}
```

---

## Daily Entry Components

**Directory**: `src/components/daily-entry/`  
**Purpose**: Daily health logging form and sections

### DailyEntryForm

**File**: `DailyEntryForm.tsx`  
**Purpose**: Complete daily entry form (multi-section)

**Props**:
```typescript
interface DailyEntryFormProps {
  userId: string;
  date: string;           // ISO date (YYYY-MM-DD)
  existingEntry?: DailyEntryRecord;
  onSave: (entry: DailyEntryRecord) => void;
  onCancel?: () => void;
}
```

**Usage**:
```tsx
<DailyEntryForm 
  userId="user-123"
  date="2025-10-12"
  existingEntry={existingEntry}
  onSave={handleSave}
/>
```

**Features**:
- Multi-step wizard (6 sections)
- Progress indicator
- Form validation
- Auto-save drafts
- Template support

**Sections**:
1. HealthSection - Overall ratings (health, energy, sleep, stress)
2. SymptomSection - Symptom logging
3. MedicationSection - Med adherence
4. TriggerSection - Trigger exposure
5. BodyMapSection - Body mapping
6. PhotoSection - Photo documentation
7. NotesSection - Free-form notes

---

### HealthSection

**File**: `EntrySections/HealthSection.tsx`  
**Purpose**: Overall health metrics (step 1 of form)

**Props**:
```typescript
interface HealthSectionProps {
  overallHealth: number;
  energyLevel: number;
  sleepQuality: number;
  stressLevel: number;
  onChange: (field: string, value: number) => void;
}
```

**Features**:
- 1-10 sliders for each metric
- Color-coded scales
- Visual feedback

---

### SymptomSection

**File**: `EntrySections/SymptomSection.tsx`  
**Purpose**: Symptom logging (step 2 of form)

**Props**:
```typescript
interface SymptomSectionProps {
  userId: string;
  symptoms: DailySymptomRecord[];
  onChange: (symptoms: DailySymptomRecord[]) => void;
}
```

**Features**:
- Symptom selector (multi-select)
- Severity slider per symptom
- Notes field per symptom
- Add custom symptom

---

### MedicationSection

**File**: `EntrySections/MedicationSection.tsx`  
**Purpose**: Medication adherence logging

**Props**:
```typescript
interface MedicationSectionProps {
  userId: string;
  medications: DailyMedicationRecord[];
  onChange: (meds: DailyMedicationRecord[]) => void;
}
```

**Features**:
- Checkbox list of active medications
- Dosage adjustment
- Notes per medication

---

### TriggerSection

**File**: `EntrySections/TriggerSection.tsx`  
**Purpose**: Trigger exposure logging

**Props**:
```typescript
interface TriggerSectionProps {
  userId: string;
  triggers: DailyTriggerRecord[];
  onChange: (triggers: DailyTriggerRecord[]) => void;
}
```

**Features**:
- Trigger selector (multi-select)
- Intensity slider per trigger
- Notes field

---

### BodyMapSection

**File**: `EntrySections/BodyMapSection.tsx`  
**Purpose**: Body mapping step

**Props**:
```typescript
interface BodyMapSectionProps {
  userId: string;
  bodyMapLocations: BodyMapLocationRecord[];
  onChange: (locations: BodyMapLocationRecord[]) => void;
}
```

**Features**:
- Interactive body map
- Region selection
- Severity per region

---

### PhotoSection

**File**: `EntrySections/PhotoSection.tsx`  
**Purpose**: Photo documentation step

**Props**:
```typescript
interface PhotoSectionProps {
  userId: string;
  dailyEntryId?: string;
  existingPhotos?: PhotoAttachmentRecord[];
  onChange?: (photos: PhotoAttachmentRecord[]) => void;
}
```

**Features**:
- Photo capture (camera/file)
- Gallery view of attached photos
- Photo annotation
- Photo linking (to symptoms/regions)

---

### QuickEntry

**File**: `QuickEntry.tsx`  
**Purpose**: Simplified quick entry (fewer fields)

**Props**:
```typescript
interface QuickEntryProps {
  userId: string;
  date: string;
  onComplete: (entry: DailyEntryRecord) => void;
}
```

**Features**:
- Condensed form (key metrics only)
- Faster data entry
- Template-based

---

### EntryTemplates

**File**: `EntryTemplates.tsx`  
**Purpose**: Manage entry templates (presets)

**Props**:
```typescript
interface EntryTemplatesProps {
  userId: string;
  onSelectTemplate: (template: EntryTemplateRecord) => void;
  activeTemplateId?: string;
}
```

---

### EntryHistory

**File**: `EntryHistory.tsx`  
**Purpose**: List of recent entries

**Props**:
```typescript
interface EntryHistoryProps {
  entries: DailyEntryRecord[];
  onSelectEntry: (entryId: string) => void;
}
```

---

### SmartSuggestions

**File**: `SmartSuggestions.tsx`  
**Purpose**: AI-powered entry suggestions (future)

**Props**:
```typescript
interface SmartSuggestionsProps {
  userId: string;
  date: string;
  onAcceptSuggestion: (field: string, value: any) => void;
}
```

**Status**: Placeholder (not implemented)

---

## Data Management Components

**Directory**: `src/components/data-management/`  
**Purpose**: Import, export, backup functionality

### ExportDialog

**File**: `ExportDialog.tsx`  
**Purpose**: Data export modal

**Props**: None (modal)

**Features**:
- Format selection (JSON/CSV/PDF)
- Date range filter
- Data type selection
- Export button with progress

---

### ImportDialog

**File**: `ImportDialog.tsx`  
**Purpose**: Data import modal

**Props**: None (modal)

**Features**:
- File upload
- Format detection
- Validation warnings
- Import button with progress
- Error reporting

---

### BackupSettings

**File**: `BackupSettings.tsx`  
**Purpose**: Backup configuration

**Features**:
- Auto-backup toggle
- Backup frequency
- Manual backup button
- Restore from backup

---

## Flare Components

**Directory**: `src/components/flare/`  
**Purpose**: Active flare tracking dashboard

### ActiveFlareDashboard

**File**: `ActiveFlareDashboard.tsx`  
**Purpose**: Dashboard showing all active flares

**Props**:
```typescript
interface ActiveFlareDashboardProps {
  userId: string;
}
```

**Usage**:
```tsx
<ActiveFlareDashboard userId="user-123" />
```

**Features**:
- Grid of FlareCard components
- FlareStats summary
- New flare button
- Filter by status
- Sort by severity/date

---

### FlareCard

**File**: `FlareCard.tsx`  
**Purpose**: Individual flare display card

**Props**:
```typescript
interface FlareCardProps {
  flare: FlareRecord;
  onUpdate: (flare: FlareRecord) => void;
}
```

**Features**:
- Symptom name and severity
- Status badge (active/improving/worsening)
- Body regions affected
- Intervention log
- Photo attachments
- Update status button

---

### FlareStats

**File**: `FlareStats.tsx`  
**Purpose**: Flare summary statistics

**Props**:
```typescript
interface FlareStatsProps {
  stats: {
    activeCount: number;
    avgDuration: number;
    mostCommonSymptom: string;
  };
}
```

---

### NewFlareDialog

**File**: `NewFlareDialog.tsx`  
**Purpose**: Create new flare modal

**Props**:
```typescript
interface NewFlareDialogProps {
  userId: string;
  onClose: () => void;
  onCreated: (flare: FlareRecord) => void;
  initialRegion?: string;  // Pre-select region
}
```

**Features**:
- Symptom selector
- Body region selector
- Severity slider
- Initial intervention notes

---

## Management Components

**Directory**: `src/components/manage/`  
**Purpose**: Symptom/medication/trigger CRUD

### SymptomList

**File**: `SymptomList.tsx`  
**Purpose**: List all symptoms with edit/delete

**Props**: None

**Features**:
- Grouped by category
- Search filter
- Edit button (opens SymptomForm)
- Delete button (soft delete)
- Add new symptom

---

### SymptomForm

**File**: `SymptomForm.tsx`  
**Purpose**: Create/edit symptom modal

**Props**:
```typescript
interface SymptomFormProps {
  userId: string;
  symptom?: SymptomRecord;  // Undefined = create mode
  onSave: (symptom: SymptomRecord) => void;
  onCancel: () => void;
}
```

**Features**:
- Name and description fields
- Category selector
- Severity scale configuration
- Common triggers
- Form validation

---

### MedicationList

**File**: `MedicationList.tsx`  
**Purpose**: List all medications

**Features**:
- Active/inactive tabs
- Edit/delete buttons
- Schedule display

---

### MedicationForm

**File**: `MedicationForm.tsx`  
**Purpose**: Create/edit medication modal

**Props**:
```typescript
interface MedicationFormProps {
  userId: string;
  medication?: MedicationRecord;
  onSave: (med: MedicationRecord) => void;
  onCancel: () => void;
}
```

**Features**:
- Name, dosage, frequency
- Schedule builder (time + days of week)
- Side effects
- Active/inactive toggle

---

### TriggerList

**File**: `TriggerList.tsx`  
**Purpose**: List all triggers

**Features**:
- Grouped by category
- Search filter
- Edit/delete buttons

---

### TriggerForm

**File**: `TriggerForm.tsx`  
**Purpose**: Create/edit trigger modal

**Props**:
```typescript
interface TriggerFormProps {
  userId: string;
  trigger?: TriggerRecord;
  onSave: (trigger: TriggerRecord) => void;
  onCancel: () => void;
}
```

---

### ConfirmDialog

**File**: `ConfirmDialog.tsx`  
**Purpose**: Reusable confirmation dialog

**Props**:
```typescript
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

### EmptyState

**File**: `EmptyState.tsx`  
**Purpose**: Placeholder when list is empty

**Props**:
```typescript
interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}
```

---

## Navigation Components

**Directory**: `src/components/navigation/`  
**Purpose**: App navigation and layout

### NavLayout

**File**: `NavLayout.tsx`  
**Purpose**: Main app layout with responsive navigation

**Props**:
```typescript
interface NavLayoutProps {
  children: ReactNode;
}
```

**Features**:
- Desktop: Sidebar + TopBar
- Mobile: BottomTabs + TopBar
- Responsive breakpoints
- Protected routes

---

### Sidebar

**File**: `Sidebar.tsx`  
**Purpose**: Desktop sidebar navigation

**Props**: None

**Features**:
- Main navigation links
- Active route highlighting
- Icon + label
- Collapsible (future)

**Navigation Items**:
- Dashboard
- Daily Entry
- Calendar
- Analytics
- Body Map
- Photos
- Flare Dashboard
- Manage
- Settings

---

### BottomTabs

**File**: `BottomTabs.tsx`  
**Purpose**: Mobile bottom tab navigation

**Props**: None

**Features**:
- Fixed bottom position
- Active tab highlighting
- Icons only (no labels)
- 5 tabs (home, entry, calendar, photos, more)

---

### TopBar

**File**: `TopBar.tsx`  
**Purpose**: Top app bar with title and actions

**Props**:
```typescript
interface TopBarProps {
  title: string;
  showBack?: boolean;
  actions?: ReactNode;
}
```

**Features**:
- Page title
- Back button (conditional)
- Action buttons (right side)
- UserProfileIndicator

---

### UserProfileIndicator

**File**: `UserProfileIndicator.tsx`  
**Purpose**: User avatar/menu in top bar

**Props**: None

**Features**:
- User avatar
- Dropdown menu
- Settings link
- Logout (future)

---

### useActiveRoute Hook

**File**: `hooks/useActiveRoute.tsx`  
**Purpose**: Detect current active route

**Usage**:
```tsx
const activeRoute = useActiveRoute();
// Returns: '/dashboard', '/entry', etc.
```

---

## Photo Components

**Directory**: `src/components/photos/`  
**Purpose**: Photo documentation system with annotation

### PhotoCapture

**File**: `PhotoCapture.tsx`  
**Purpose**: Capture photo from camera or file

**Props**:
```typescript
interface PhotoCaptureProps {
  userId: string;
  onPhotoCaptured: (photo: PhotoAttachmentRecord) => void;
  linkContext?: LinkContext;  // Pre-link to entry/symptom/region
}
```

**Usage**:
```tsx
<PhotoCapture 
  userId="user-123"
  onPhotoCaptured={handleNewPhoto}
  linkContext={{
    dailyEntryId: 'entry-456',
    symptomId: 'symptom-789'
  }}
/>
```

**Features**:
- Camera capture (mobile)
- File upload (desktop)
- EXIF stripping
- Compression to 1920px max
- AES-256-GCM encryption
- Thumbnail generation (150x150)
- Metadata extraction

---

### PhotoGallery

**File**: `PhotoGallery.tsx`  
**Purpose**: Grid gallery of photos

**Props**:
```typescript
interface PhotoGalleryProps {
  userId: string;
  filters?: PhotoFilters;
  onPhotoSelect?: (photo: PhotoAttachmentRecord) => void;
  selectionMode?: boolean;
}
```

**Features**:
- Masonry grid layout
- Lazy loading
- Infinite scroll
- PhotoThumbnail components
- Filter sidebar
- Selection mode (multi-select)

---

### PhotoViewer

**File**: `PhotoViewer.tsx`  
**Purpose**: Full-screen photo viewer

**Props**:
```typescript
interface PhotoViewerProps {
  photo: PhotoAttachmentRecord;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showAnnotations?: boolean;
}
```

**Features**:
- Full-screen overlay
- Decrypt and display photo
- Annotation overlay
- Zoom and pan
- Swipe navigation (mobile)
- Edit button → PhotoAnnotation

---

### PhotoAnnotation

**File**: `PhotoAnnotation.tsx`  
**Purpose**: Photo annotation editor

**Props**:
```typescript
interface PhotoAnnotationProps {
  photo: PhotoAttachmentRecord;
  onSave: (annotations: PhotoAnnotation[]) => void;
  onCancel: () => void;
}
```

**Features**:
- AnnotationCanvas component
- AnnotationToolbar
- Drawing tools: arrow, circle, rectangle, text, blur
- Color picker
- Line width selector
- Undo/redo
- Save annotations (encrypted)

---

### AnnotationCanvas

**File**: `AnnotationCanvas.tsx`  
**Purpose**: Canvas for drawing annotations

**Props**:
```typescript
interface AnnotationCanvasProps {
  imageUrl: string;
  annotations: PhotoAnnotation[];
  selectedTool: AnnotationTool;
  color: string;
  lineWidth: number;
  fontSize?: number;
  blurIntensity?: number;
  onAnnotationsChange: (annotations: PhotoAnnotation[]) => void;
}
```

**Features**:
- HTML canvas rendering
- Touch and mouse drawing
- Annotation shapes: arrow, circle, rectangle, text, blur
- Responsive sizing

---

### AnnotationToolbar

**File**: `AnnotationToolbar.tsx`  
**Purpose**: Toolbar for annotation tools

**Props**:
```typescript
interface AnnotationToolbarProps {
  selectedTool: AnnotationTool;
  onToolSelect: (tool: AnnotationTool) => void;
  disabled?: boolean;
}
```

**Tools**:
- Arrow
- Circle
- Rectangle
- Text
- Blur
- Undo
- Redo

---

### AnnotationColorPicker

**File**: `AnnotationColorPicker.tsx`  
**Purpose**: Color picker for annotations

**Props**:
```typescript
interface AnnotationColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}
```

**Colors**: Red, blue, green, yellow, black, white

---

### LineWidthSelector

**File**: `LineWidthSelector.tsx`  
**Purpose**: Line width selector (1-10px)

**Props**:
```typescript
interface LineWidthSelectorProps {
  selectedWidth: number;
  onWidthSelect: (width: number) => void;
}
```

---

### FontSizeSelector

**File**: `FontSizeSelector.tsx`  
**Purpose**: Font size for text annotations

**Props**:
```typescript
interface FontSizeSelectorProps {
  selectedSize: number;
  onSizeSelect: (size: number) => void;
}
```

---

### BlurIntensitySelector

**File**: `BlurIntensitySelector.tsx`  
**Purpose**: Blur intensity (1-10)

**Props**:
```typescript
interface BlurIntensitySelectorProps {
  selectedIntensity: number;
  onIntensitySelect: (intensity: number) => void;
}
```

---

### PhotoFilters

**File**: `PhotoFilters.tsx`  
**Purpose**: Filter sidebar for photo gallery

**Props**:
```typescript
interface PhotoFiltersProps {
  onFilterChange: (filters: PhotoFilters) => void;
  availableTags: string[];
}
```

**Filters**:
- Date range
- Tags (multi-select)
- Body region
- Symptom
- Annotated only

---

### PhotoLinker

**File**: `PhotoLinker.tsx`  
**Purpose**: Link photo to entry/symptom/region

**Props**:
```typescript
interface PhotoLinkerProps {
  photo: PhotoAttachmentRecord;
  onSave: (linkedPhoto: PhotoAttachmentRecord) => void;
  onCancel: () => void;
}
```

**Features**:
- Daily entry selector
- Symptom selector
- Body region selector
- Save links

---

### PhotoTagger

**File**: `PhotoTagger.tsx`  
**Purpose**: Add tags to photo

**Props**:
```typescript
interface PhotoTaggerProps {
  photo: PhotoAttachmentRecord;
  onUpdate: (photo: PhotoAttachmentRecord) => void;
}
```

**Features**:
- Tag input
- Existing tag suggestions
- Tag chips

---

### PhotoStorageManager

**File**: `PhotoStorageManager.tsx`  
**Purpose**: Photo storage overview and cleanup

**Props**:
```typescript
interface PhotoStorageManagerProps {
  userId: string;
  refreshKey?: number;
}
```

**Features**:
- Total photo count
- Storage used (MB)
- Delete all photos button
- Export photos

---

### PhotoThumbnail

**File**: `PhotoThumbnail.tsx`  
**Purpose**: Thumbnail component for gallery

**Props**:
```typescript
interface PhotoThumbnailProps {
  photo: PhotoAttachmentRecord;
  onClick?: () => void;
  selected?: boolean;
}
```

**Features**:
- Decrypt and display thumbnail
- Selection checkbox
- Annotation indicator
- Tags display

---

### TextInputDialog

**File**: `TextInputDialog.tsx`  
**Purpose**: Text input modal (for text annotations)

**Props**:
```typescript
interface TextInputDialogProps {
  open: boolean;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}
```

---

### BlurWarningDialog

**File**: `BlurWarningDialog.tsx`  
**Purpose**: Warning before using blur tool

**Props**:
```typescript
interface BlurWarningDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Message**: "Blur is not secure. Use for visual privacy only, not HIPAA."

---

## Provider Components

**Directory**: `src/components/providers/`  
**Purpose**: React context providers

### MigrationProvider

**File**: `MigrationProvider.tsx`  
**Purpose**: Database migration on app load

**Props**:
```typescript
interface MigrationProviderProps {
  children: ReactNode;
}
```

**Features**:
- Runs Dexie migrations on mount
- Loading state during migration
- Error handling

**Usage** (in `app/layout.tsx`):
```tsx
<MigrationProvider>
  <AppContent />
</MigrationProvider>
```

---

## PWA Components

**Directory**: `src/components/pwa/`  
**Purpose**: Progressive Web App features

### InstallPrompt

**File**: `InstallPrompt.tsx`  
**Purpose**: Prompt to install app (A2HS)

**Props**: None

**Features**:
- Detects `beforeinstallprompt` event
- Shows banner with install button
- Dismissible

---

### OfflineIndicator

**File**: `OfflineIndicator.tsx`  
**Purpose**: Show offline status

**Props**: None

**Features**:
- Detects `navigator.onLine`
- Toast notification when offline
- Auto-hides when online

---

### SyncStatus

**File**: `SyncStatus.tsx`  
**Purpose**: Background sync status (future)

**Props**: None

**Status**: Placeholder (no backend sync yet)

---

### UpdateNotification

**File**: `UpdateNotification.tsx`  
**Purpose**: Service worker update notification

**Props**: None

**Features**:
- Detects new service worker
- Toast with "Update Available" and reload button

---

## Settings Components

**Directory**: `src/components/settings/`  
**Purpose**: Settings and preferences

### DevDataControls

**File**: `DevDataControls.tsx`  
**Purpose**: Dev tools for generating test data

**Props**: None

**Features**:
- Generate 30 days of test data
- Clear all data
- Environment check (dev only)

**Usage**: Only shown in development mode

---

## Symptom Components

**Directory**: `src/components/symptoms/`  
**Purpose**: Symptom tracking components

### SymptomTracker

**File**: `SymptomTracker.tsx`  
**Purpose**: Standalone symptom logging (outside daily entry)

**Props**: None (page-level component)

**Features**:
- Quick symptom log
- Severity slider
- Location selector
- Photo attachment
- Save to `symptomInstances` table

---

### SymptomList

**File**: `SymptomList.tsx`  
**Purpose**: Filterable symptom list

**Props**:
```typescript
interface SymptomListProps {
  symptoms: SymptomRecord[];
  onSelectSymptom?: (symptom: SymptomRecord) => void;
  selectedSymptomIds?: string[];
}
```

---

### SymptomCard

**File**: `SymptomCard.tsx`  
**Purpose**: Symptom display card

**Props**:
```typescript
interface SymptomCardProps {
  symptom: SymptomRecord;
  category: SymptomCategoryRecord;
  onEdit: () => void;
  onDelete: () => void;
}
```

---

### SymptomForm

**File**: `SymptomForm.tsx`  
**Purpose**: Create/edit symptom (same as manage/SymptomForm)

---

### SymptomFilters

**File**: `SymptomFilters.tsx`  
**Purpose**: Filter symptom list

**Props**:
```typescript
interface SymptomFiltersProps {
  onFilterChange: (filters: SymptomFilters) => void;
  categories: SymptomCategoryRecord[];
}
```

**Filters**:
- Category
- Active/inactive
- Default/custom
- Search text

---

### SymptomCategories

**File**: `SymptomCategories.tsx`  
**Purpose**: Manage symptom categories

**Props**:
```typescript
interface SymptomCategoriesProps {
  categories: SymptomCategoryRecord[];
  onAddCategory: (category: SymptomCategoryRecord) => void;
  onDeleteCategory: (id: string) => void;
}
```

---

### SeverityScale

**File**: `SeverityScale.tsx`  
**Purpose**: Severity slider (1-10)

**Props**:
```typescript
interface SeverityScaleProps {
  value: number;
  onChange: (value: number) => void;
  scale: SeverityScaleRecord;
  ariaLabel?: string;
}
```

**Features**:
- 1-10 slider
- Color gradient (green → yellow → red)
- Custom labels from scale config

---

## Trigger Components

**Directory**: `src/components/triggers/`  
**Purpose**: Trigger correlation and insights

### TriggerCorrelationDashboard

**File**: `TriggerCorrelationDashboard.tsx`  
**Purpose**: Main correlation dashboard

**Props**:
```typescript
interface TriggerCorrelationDashboardProps {
  userId: string;
}
```

**Usage**:
```tsx
<TriggerCorrelationDashboard userId="user-123" />
```

**Features**:
- CorrelationMatrix component
- TriggerInsights component
- Time range selector
- Correlation algorithm: 90-day rolling window

---

### CorrelationMatrix

**File**: `CorrelationMatrix.tsx`  
**Purpose**: Heatmap of trigger-symptom correlations

**Props**:
```typescript
interface CorrelationMatrixProps {
  correlations: Array<{
    triggerId: string;
    triggerName: string;
    symptomId: string;
    symptomName: string;
    correlation: number;  // -1 to 1
  }>;
}
```

**Features**:
- Grid layout (triggers × symptoms)
- Color intensity (red = positive, blue = negative)
- Tooltip with correlation value

---

### TriggerInsights

**File**: `TriggerInsights.tsx`  
**Purpose**: Plain language insights from correlations

**Props**:
```typescript
interface TriggerInsightsProps {
  insights: Array<{
    text: string;
    severity: 'high' | 'medium' | 'low';
  }>;
}
```

**Example Insights**:
- "Dairy consumption strongly correlates with lesion severity (r=0.72)"
- "Stress shows weak correlation with pain (r=0.23)"

---

## Component Patterns

### Compound Components

**Pattern**: Components that work together (e.g., TrendWidget → TrendChart → TrendInterpretation)

**Example**:
```tsx
<TrendWidget>
  <TrendChart data={data} predictions={predictions} />
  <TrendInterpretation direction={direction} confidence={confidence} />
</TrendWidget>
```

---

### Render Props

**Pattern**: Pass render function as prop (rare, mostly use children)

**Example**:
```tsx
<PhotoGallery
  renderThumbnail={(photo) => (
    <CustomThumbnail photo={photo} />
  )}
/>
```

---

### Context Consumers

**Pattern**: Components that consume context via hooks

**Example**:
```tsx
function TrendWidget() {
  const { trends, loadTrend } = useDashboard();
  // ...
}
```

---

### Controlled Components

**Pattern**: Parent controls state via props

**Example**:
```tsx
<TimeRangeSelector 
  value={timeRange}          // Controlled value
  onChange={setTimeRange}    // State setter
/>
```

---

### Uncontrolled Components

**Pattern**: Component manages own state internally (rare)

**Example**:
```tsx
<PhotoCapture 
  onPhotoCaptured={handleNewPhoto}  // Only callback, no value prop
/>
```

---

## Accessibility

### ARIA Labels

All interactive components have `aria-label` or `aria-labelledby`:

```tsx
<button aria-label="Delete symptom">
  <TrashIcon />
</button>
```

### Keyboard Navigation

- **Tab order**: Logical flow through form fields
- **Enter to submit**: Forms submit on Enter
- **Escape to cancel**: Modals close on Escape
- **Arrow keys**: Navigate calendar, sliders

### Screen Reader Support

- **Live regions**: `aria-live="polite"` for status updates
- **Role attributes**: `role="dialog"`, `role="navigation"`
- **Focus management**: Auto-focus first field in modals

### Color Contrast

- **WCAG AA**: All text meets 4.5:1 contrast ratio
- **Color-blind safe**: No information conveyed by color alone

---

## Testing

### Unit Tests

**Framework**: Jest 30.2.0  
**Coverage Target**: 80%  
**Test Files**: `__tests__/*.test.tsx` adjacent to components

**Example**:
```typescript
// src/components/analytics/__tests__/TrendChart.test.tsx
describe('TrendChart', () => {
  it('renders line chart with data', () => {
    render(<TrendChart data={mockData} metric="overallHealth" />);
    expect(screen.getByRole('img', { name: /chart/i })).toBeInTheDocument();
  });
});
```

### Component Tests

**Library**: React Testing Library  
**Approach**: Test user behavior, not implementation

**Example**:
```typescript
it('changes time range on button click', async () => {
  const handleChange = jest.fn();
  render(<TimeRangeSelector onChange={handleChange} />);
  
  await userEvent.click(screen.getByRole('button', { name: '30d' }));
  expect(handleChange).toHaveBeenCalledWith('30d');
});
```

### Integration Tests

**Scope**: Multi-component workflows (e.g., daily entry form)

**Example**:
```typescript
it('completes daily entry workflow', async () => {
  render(<DailyEntryForm userId="user-123" date="2025-10-12" onSave={handleSave} />);
  
  // Step 1: Health metrics
  await userEvent.click(screen.getByRole('slider', { name: 'Overall Health' }));
  // ... interact with form
  
  // Step 6: Submit
  await userEvent.click(screen.getByRole('button', { name: 'Save Entry' }));
  expect(handleSave).toHaveBeenCalled();
});
```

### Snapshot Tests

**Use Case**: Prevent unintended UI regressions

**Example**:
```typescript
it('matches snapshot', () => {
  const { container } = render(<SymptomCard symptom={mockSymptom} />);
  expect(container).toMatchSnapshot();
});
```

---

## References

- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Chart.js**: https://www.chartjs.org/
- **Component Source**: `src/components/`
- **Type Definitions**: `src/lib/db/schema.ts`

---

**For architecture overview, see**: [ARCHITECTURE.md](./ARCHITECTURE.md)  
**For database schema, see**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)  
**For development guide, see**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
