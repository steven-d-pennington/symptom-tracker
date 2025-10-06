# Task 7: Body Mapping System Implementation

## Task Overview

**Status**: Not Started
**Assigned To**: Unassigned
**Priority**: High
**Estimated Hours**: 32
**Dependencies**: Phase 1 complete (all 6 tasks)
**Parallel Work**: Can be worked on simultaneously with Task 8

## Objective

Create an interactive body mapping system that allows users to visually pinpoint exact symptom locations on an anatomical representation of the human body. This feature is crucial for autoimmune conditions like Hidradenitis Suppurativa where symptoms manifest in specific body locations and patterns.

## Detailed Requirements

### User Experience Goals
- **Intuitive Selection**: Natural pointing and tapping on body areas
- **Anatomical Accuracy**: Medically accurate body representation
- **Multiple Views**: Front, back, left side, right side perspectives
- **Touch Optimized**: Smooth interactions on mobile devices
- **Visual Feedback**: Clear indication of selected regions
- **Severity Mapping**: Color-coded severity visualization

### Technical Requirements
- **SVG-Based**: Scalable vector graphics for crisp rendering
- **Performance**: Smooth with 50+ symptom markers
- **Accessibility**: Full keyboard navigation and screen reader support
- **Offline Capable**: No external dependencies
- **Data Integration**: Seamless with daily entry and symptom systems

## Implementation Steps

### Step 1: Data Model and Schema
**Estimated Time**: 3 hours

1. Define TypeScript interfaces:
   ```typescript
   interface BodyRegion {
     id: string;
     name: string;
     category: 'head' | 'torso' | 'limbs' | 'joints' | 'other';
     side?: 'left' | 'right' | 'center';
     svgPath: string; // SVG path data for the region
     commonSymptoms?: string[]; // Common symptoms for this area
     selectable: boolean;
     zIndex: number;
   }

   interface BodyMapLocation {
     id: string;
     userId: string;
     dailyEntryId?: string;
     symptomId: string;
     bodyRegionId: string;
     coordinates?: {
       x: number; // Normalized 0-1
       y: number; // Normalized 0-1
     };
     severity: number; // 1-10
     notes?: string;
     createdAt: Date;
     updatedAt: Date;
   }

   interface BodyView {
     id: 'front' | 'back' | 'left' | 'right';
     name: string;
     regions: BodyRegion[];
     svgContent: string;
   }
   ```

2. Update database schema:
   ```typescript
   // Add to Dexie database
   bodyMapLocations!: Table<BodyMapLocation, string>;

   // In version upgrade
   this.version(3).stores({
     bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, createdAt',
   });
   ```

3. Create component directory structure:
   ```
   components/body-mapping/
   ├── BodyMapViewer.tsx           # Main body map component
   ├── BodyViewSwitcher.tsx        # Front/back/side view switching
   ├── BodyRegionSelector.tsx      # Region selection interface
   ├── SymptomMarker.tsx           # Individual symptom markers
   ├── SymptomOverlay.tsx          # Symptom visualization layer
   ├── ZoomPanControls.tsx         # Zoom and pan functionality
   ├── BodyMapLegend.tsx           # Color coding legend
   ├── bodies/
   │   ├── FrontBody.tsx           # Front view SVG
   │   ├── BackBody.tsx            # Back view SVG
   │   ├── LeftSide.tsx            # Left side view SVG
   │   └── RightSide.tsx           # Right side view SVG
   └── hooks/
       ├── useBodyMap.ts           # Body map state management
       ├── useBodyRegions.ts       # Region data and selection
       └── useSymptomMarkers.ts    # Symptom marker management
   ```

**Files to Create**:
- `lib/types/body-mapping.ts`
- `lib/repositories/bodyMapLocationRepository.ts`
- `components/body-mapping/BodyMapViewer.tsx`

**Testing**: Type definitions compile, database schema updates successfully

---

### Step 2: SVG Body Templates
**Estimated Time**: 6 hours

1. Create anatomically accurate SVG body representations:
   - Front view with labeled regions (head, neck, chest, abdomen, limbs)
   - Back view with labeled regions (spine, shoulders, back, buttocks)
   - Side views for additional detail
   - Each region as separate `<path>` or `<g>` element with unique ID

2. Implement `BodyRegionSelector.tsx`:
   - Highlight regions on hover
   - Select regions on click/tap
   - Show region name tooltip
   - Support multi-select for bilateral symptoms

3. Define body region categories:
   ```typescript
   const BODY_REGIONS = {
     HEAD: ['scalp', 'face', 'ears', 'neck'],
     TORSO: ['chest', 'abdomen', 'back', 'groin'],
     UPPER_LIMBS: ['shoulders', 'arms', 'elbows', 'forearms', 'wrists', 'hands'],
     LOWER_LIMBS: ['hips', 'thighs', 'knees', 'calves', 'ankles', 'feet'],
     SPECIAL: ['armpits', 'under_breasts', 'inner_thighs', 'buttocks'], // HS-specific
   };
   ```

**Files to Create**:
- `components/body-mapping/bodies/FrontBody.tsx`
- `components/body-mapping/bodies/BackBody.tsx`
- `components/body-mapping/BodyRegionSelector.tsx`

**Testing**: SVG renders correctly, regions are selectable, hover effects work

---

### Step 3: Interactive Body Map Component
**Estimated Time**: 6 hours

1. Implement `BodyMapViewer.tsx`:
   ```typescript
   interface BodyMapViewerProps {
     view: 'front' | 'back' | 'left' | 'right';
     symptoms: BodyMapLocation[];
     selectedRegion?: string;
     onRegionSelect: (regionId: string) => void;
     onSymptomAdd: (location: Partial<BodyMapLocation>) => void;
     onSymptomClick: (locationId: string) => void;
     readOnly?: boolean;
   }
   ```

2. Add touch gesture support:
   - Tap to select region
   - Long press to add symptom
   - Pinch to zoom
   - Pan to scroll
   - Double tap to reset view

3. Implement zoom and pan controls:
   - Zoom in/out buttons
   - Reset view button
   - Fit to screen
   - Mouse wheel zoom
   - Touch gestures

**Files to Modify**:
- `components/body-mapping/BodyMapViewer.tsx`
- `components/body-mapping/ZoomPanControls.tsx`

**Testing**: Touch gestures work on mobile, zoom/pan smooth, keyboard navigation functional

---

### Step 4: Symptom Markers and Overlay
**Estimated Time**: 5 hours

1. Create `SymptomMarker.tsx`:
   - Circular markers with severity color coding
   - Size based on severity
   - Pulse animation for active symptoms
   - Tooltip showing symptom name and severity
   - Support for multiple symptoms in same region

2. Implement `SymptomOverlay.tsx`:
   - Layer symptoms over body map
   - Handle overlapping markers
   - Cluster nearby markers
   - Show/hide specific symptom types
   - Date range filtering

3. Add severity color coding:
   ```typescript
   const SEVERITY_COLORS = {
     1-2: '#10b981', // green - minimal
     3-4: '#fbbf24', // yellow - mild
     5-6: '#f59e0b', // orange - moderate
     7-8: '#ef4444', // red - severe
     9-10: '#991b1b', // dark red - extreme
   };
   ```

**Files to Create**:
- `components/body-mapping/SymptomMarker.tsx`
- `components/body-mapping/SymptomOverlay.tsx`
- `components/body-mapping/BodyMapLegend.tsx`

**Testing**: Markers display correctly, colors accurate, clustering works, tooltips show

---

### Step 5: View Switching and Navigation
**Estimated Time**: 4 hours

1. Implement `BodyViewSwitcher.tsx`:
   - Toggle between front/back/sides
   - Smooth transitions between views
   - Preserve zoom level when switching
   - Keyboard shortcuts (F/B/L/R keys)

2. Add quick navigation:
   - Jump to region with most symptoms
   - History of viewed regions
   - Bookmarked regions
   - Search for specific body part

3. Create region detail panel:
   - Show all symptoms in selected region
   - Historical data for that region
   - Common triggers for that area
   - Quick add symptom button

**Files to Create**:
- `components/body-mapping/BodyViewSwitcher.tsx`
- `components/body-mapping/RegionDetailPanel.tsx`

**Testing**: View switching smooth, navigation works, keyboard shortcuts function

---

### Step 6: Integration with Daily Entry
**Estimated Time**: 4 hours

1. Extend `DailyEntryForm.tsx`:
   - Add body mapping section
   - Link symptoms to body locations
   - Show body map summary in entry review
   - Quick map view in timeline

2. Create `BodyMapSection.tsx` for daily entries:
   - Compact body map view
   - Add/edit symptom locations
   - Show existing locations
   - Quick severity adjustment

3. Integration points:
   - Save body map data with daily entry
   - Load existing body map data
   - Update body map when symptoms change
   - Sync with symptom repository

**Files to Modify**:
- `components/daily-entry/EntrySections/BodyMapSection.tsx` (new)
- `components/daily-entry/DailyEntryForm.tsx`

**Testing**: Integration seamless, data saves correctly, loading works, sync functional

---

### Step 7: Body Map Analytics
**Estimated Time**: 4 hours

1. Create analytics utilities:
   - Most affected body regions over time
   - Migration patterns of symptoms
   - Symmetry analysis (left vs right)
   - Severity heatmaps
   - Temporal patterns by body region

2. Implement `BodyMapHistory.tsx`:
   - Timeline of body map changes
   - Comparison between dates
   - Animated symptom progression
   - Export body map images

3. Add reporting features:
   - Generate body map summaries for doctors
   - Highlight concerning patterns
   - Before/after comparisons
   - Print-friendly views

**Files to Create**:
- `lib/utils/bodyMapAnalytics.ts`
- `components/body-mapping/BodyMapHistory.tsx`
- `components/body-mapping/BodyMapReport.tsx`

**Testing**: Analytics accurate, history displays correctly, reports generate properly

---

## Technical Specifications

### Performance Requirements
- Body map load time <1 second
- SVG rendering at 60fps
- Smooth zoom/pan on mobile
- Handle 100+ symptom markers efficiently
- Memory usage <30MB

### Data Storage
- Efficient storage of coordinates
- Index by date for quick retrieval
- Support for historical queries
- Backup-friendly data structure

### Accessibility
- Full keyboard navigation
- Screen reader support with region descriptions
- High contrast mode
- Text alternatives for visual markers
- ARIA labels for all interactive elements

## Testing Checklist

### Unit Tests
- [ ] Body region utilities
- [ ] Coordinate normalization
- [ ] Severity color calculations
- [ ] Marker clustering algorithms

### Component Tests
- [ ] SVG body templates render
- [ ] Region selection works
- [ ] Markers display correctly
- [ ] View switching functions
- [ ] Touch gestures work

### Integration Tests
- [ ] Complete body mapping workflow
- [ ] Integration with daily entries
- [ ] Data persistence and retrieval
- [ ] Analytics calculations
- [ ] Report generation

### Accessibility Tests
- [ ] Keyboard navigation complete
- [ ] Screen reader announces correctly
- [ ] Touch targets adequate size (44px+)
- [ ] Color contrast sufficient
- [ ] Focus indicators visible

## Files Created/Modified

### New Files
- `lib/types/body-mapping.ts`
- `lib/repositories/bodyMapLocationRepository.ts`
- `lib/utils/bodyMapAnalytics.ts`
- `components/body-mapping/BodyMapViewer.tsx`
- `components/body-mapping/BodyViewSwitcher.tsx`
- `components/body-mapping/BodyRegionSelector.tsx`
- `components/body-mapping/SymptomMarker.tsx`
- `components/body-mapping/SymptomOverlay.tsx`
- `components/body-mapping/ZoomPanControls.tsx`
- `components/body-mapping/BodyMapLegend.tsx`
- `components/body-mapping/RegionDetailPanel.tsx`
- `components/body-mapping/BodyMapHistory.tsx`
- `components/body-mapping/BodyMapReport.tsx`
- `components/body-mapping/bodies/FrontBody.tsx`
- `components/body-mapping/bodies/BackBody.tsx`
- `components/body-mapping/bodies/LeftSide.tsx`
- `components/body-mapping/bodies/RightSide.tsx`
- `components/body-mapping/hooks/useBodyMap.ts`
- `components/body-mapping/hooks/useBodyRegions.ts`
- `components/body-mapping/hooks/useSymptomMarkers.ts`
- `components/daily-entry/EntrySections/BodyMapSection.tsx`

### Modified Files
- `src/lib/db/client.ts` (add bodyMapLocations table)
- `src/lib/db/schema.ts` (add BodyMapLocation types)
- `components/daily-entry/DailyEntryForm.tsx`
- `components/calendar/DayView.tsx` (show body map summary)

## Success Criteria

- [ ] Body mapping allows precise symptom location tracking
- [ ] All views (front/back/sides) functional
- [ ] Touch gestures work smoothly on mobile
- [ ] Zoom and pan perform well
- [ ] Symptom markers display clearly
- [ ] Integration with daily entries seamless
- [ ] Analytics provide useful insights
- [ ] Accessibility requirements met
- [ ] Performance targets achieved

## Integration Points

*Integrates with:*
- Task 2: Symptom Tracking (symptom data)
- Task 3: Daily Entry System (body map section)
- Task 4: Calendar/Timeline (historical body maps)
- Task 5: Data Storage (body map locations)
- Task 9: Active Flare Dashboard (body region analysis)

## Notes and Decisions

*Add detailed notes here during implementation:*

- **Date**: [Date]
- **Decision**: [What was decided and why]
- **Impact**: [How it affects other components]
- **Testing**: [Test results and issues found]

## Blockers and Issues

*Document any blockers encountered:*

- **Blocker**: [Description]
- **Date Identified**: [Date]
- **Resolution**: [How it was resolved or @mention for help]
- **Impact**: [Effect on timeline]

---

## Status Updates

*Update this section with daily progress:*

- **Date**: [Date] - **Status**: [Current Status] - **Assigned**: [Your Name]
- **Completed**: [What was finished]
- **Next Steps**: [What's planned next]
- **Hours Spent**: [Time spent today]
- **Total Hours**: [Cumulative time]

---

*Task Document Version: 1.0 | Last Updated: October 5, 2025*
