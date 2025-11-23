# UI Components

## Overview

The Symptom Tracker application uses a component-based architecture built with **React** and **Tailwind CSS**. The components are organized by feature domain, with a set of reusable base components in `src/components/ui`.

## Component Structure

### Base Components (`src/components/ui`)

These are low-level, reusable components that form the design system foundation. Many are likely wrappers around **Radix UI** primitives.

- **Badge:** Status indicators and labels.
- **Button:** Primary, secondary, and ghost buttons.
- **Calendar:** Date picker component.
- **Card:** Container for grouped content.
- **Dialog:** Modal windows.
- **Input:** Text input fields.
- **Select:** Dropdown menus.
- **SeveritySlider:** Custom slider for symptom severity (1-10).
- **Sheet:** Side panels / drawers.
- **Tabs:** Tabbed interface navigation.

### Feature Components

Components are grouped by their functional domain:

#### Analytics & Insights
- `analytics/`: Charts and data visualization components.
- `charts/`: Reusable chart wrappers (likely Chart.js).
- `insights/`: Insight cards and summaries.
- `correlation/`: Correlation analysis views.

#### Body Mapping
- `body-map/`: Body map visualization and interaction.
- `body-mapping/`: Unified marker system components.

#### Daily Tracking
- `daily-entry/`: Components for the daily entry form.
- `daily-log/`: Unified daily log view.
- `quick-log/`: Rapid data entry components.
- `timeline/`: Chronological view of entries.

#### Domain Entities
- `flares/`: Flare tracking and management.
- `food/` & `food-logging/`: Food diary and meal logging.
- `medications/` & `medication-logging/`: Medication management.
- `symptoms/` & `symptom-logging/`: Symptom tracking.
- `triggers/` & `trigger-logging/`: Trigger tracking.
- `treatments/` & `treatment-logging/`: Treatment tracking.
- `photos/`: Photo gallery and comparison tools.

#### Core Application
- `dashboard/`: Main dashboard widgets.
- `navigation/`: App navigation (sidebar, bottom nav).
- `settings/`: User preferences and configuration.
- `cloud-sync/`: Backup and sync controls.
- `pwa/`: PWA installation and update prompts.
- `providers/`: Context providers (Theme, Auth, etc.).

## Key Design Patterns

- **Atomic Design:** Separation of base UI atoms from complex feature organisms.
- **Composition:** Heavy use of component composition (e.g., Cards containing Charts).
- **Radix UI:** usage of accessible primitives for complex interactive components.
- **Tailwind CSS:** Utility-first styling for consistency and rapid development.
