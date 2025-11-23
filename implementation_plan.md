# Implementation Plan - Update Help System

## Goal
Update the `/help` section to reflect the latest architectural changes, specifically the **Unified Body Marker System** and **Zero-Knowledge Cloud Sync**.

## User Review Required
> [!IMPORTANT]
> I will be renaming URL routes:
> - `/help/tracking-flares` -> `/help/body-markers`
> - `/help/import-export` -> `/help/sync-and-backup`
> This will break existing bookmarks to these specific help pages.

## Proposed Changes

### UI Components
#### [MODIFY] [src/app/(protected)/help/page.tsx](file:///c:/projects/symptom-tracker/src/app/(protected)/help/page.tsx)
-   Update "Tracking Flares" card to "Body Markers (Flares, Pain, Inflammation)".
-   Update "Import & Export" card to "Sync & Backup".
-   Update links to new routes.

### Feature Pages
#### [NEW] [src/app/(protected)/help/body-markers/page.tsx](file:///c:/projects/symptom-tracker/src/app/(protected)/help/body-markers/page.tsx)
-   Create new page replacing `tracking-flares`.
-   Explain the unified system: One tool for Flares, Pain, and Inflammation.
-   Explain how to use the Body Map to place markers.
-   Explain severity and status (Active/Resolved).

#### [DELETE] [src/app/(protected)/help/tracking-flares/page.tsx](file:///c:/projects/symptom-tracker/src/app/(protected)/help/tracking-flares/page.tsx)
-   Remove obsolete page.

#### [NEW] [src/app/(protected)/help/sync-and-backup/page.tsx](file:///c:/projects/symptom-tracker/src/app/(protected)/help/sync-and-backup/page.tsx)
-   Create new page replacing `import-export`.
-   **New Section**: Zero-Knowledge Cloud Sync (How it works, Security).
-   **Existing Content**: Manual JSON Import/Export (Retain as "Manual Backup").

#### [DELETE] [src/app/(protected)/help/import-export/page.tsx](file:///c:/projects/symptom-tracker/src/app/(protected)/help/import-export/page.tsx)
-   Remove obsolete page.

## Verification Plan

### Automated Tests
-   `npm run build` to verify route validity and link integrity.

### Manual Verification
-   Navigate to `/help`.
-   Click "Body Markers" -> Verify content covers Flares, Pain, Inflammation.
-   Click "Sync & Backup" -> Verify content covers Cloud Sync and JSON Export.
