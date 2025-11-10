# Story 6.5: Timeline Pattern Detection

Status: ready-for-dev

## Story

As a user reviewing my health history,
I want the timeline to visually highlight recurring patterns and symptom-trigger windows,
So that I can see at a glance when patterns occur and what precedes my symptoms.

## Acceptance Criteria

1. **AC6.5.1 — Extend timeline component to query correlation data:** Extend existing TimelineView component (`src/components/timeline/TimelineView.tsx`) to query correlationRepository for correlation data matching timeline events. Query correlations by userId and filter by timeRange matching timeline date range. Load correlation data alongside timeline events (symptoms, foods, triggers, medications, flares). Store correlation data in component state for pattern highlighting. Use existing correlationRepository methods: `findAll(userId)`, `findByType(userId, type)`. [Source: docs/epics.md#Story-6.5]

2. **AC6.5.2 — Implement visual pattern highlighting:** Create visual highlighting system that displays colored bands/connectors around correlated events on timeline. For food-symptom correlations: draw orange band connecting food event to symptom event occurring 6-12 hours later (based on lagHours from correlation). For trigger-symptom correlations: draw red band. For medication-improvement correlations: draw green band connecting medication event to symptom improvement. Bands use semi-transparent colors with distinct styling per correlation type. Bands only visible when both events are in viewport. [Source: docs/epics.md#Story-6.5]

3. **AC6.5.3 — Create pattern legend:** Build PatternLegend component displaying all correlation types with color coding: food-symptom correlations (orange), trigger-symptom correlations (red), medication-improvement correlations (green), custom user patterns (purple). Legend shows icon, color swatch, label, and brief description for each pattern type. Legend positioned above or beside timeline, collapsible on mobile. Clicking legend item toggles visibility of that pattern type on timeline. Legend updates dynamically based on available correlations in current time range. [Source: docs/epics.md#Story-6.5]

4. **AC6.5.4 — Add pattern detection algorithm:** Implement pattern detection service (`src/lib/services/patternDetectionService.ts`) with sliding window analysis. Algorithm analyzes 24-hour windows to detect recurring sequences: food → symptom after N hours, trigger → symptom after N hours, medication → symptom improvement. Identify day-of-week patterns (e.g., "symptoms spike on Mondays"). Pattern detection runs client-side on timeline events, uses correlation data from correlationRepository to validate patterns. Store detected patterns in IndexedDB patternDetections table (schema version 26). Pattern detection runs in background when timeline loads, debounced to avoid blocking UI. [Source: docs/epics.md#Story-6.5]

5. **AC6.5.5 — Build pattern badge/icon system:** Add visual badges/icons to timeline events that are part of detected patterns. Badge appears on event card/row indicating pattern membership. Badge shows pattern type icon (food, trigger, medication) with correlation strength indicator (strong = filled icon, moderate = outlined icon). Tooltip on hover explains pattern: "This food preceded symptoms in 7 of 10 instances" with correlation coefficient and confidence level. Badge clickable to open pattern detail panel. Badges use distinct colors matching pattern legend. Badges positioned non-intrusively (top-right corner of event card). [Source: docs/epics.md#Story-6.5]

6. **AC6.5.6 — Implement timeline layer toggle:** Create TimelineLayerToggle component allowing users to show/hide different event types and pattern highlights. Toggle options: Show/Hide Symptoms, Show/Hide Foods, Show/Hide Triggers, Show/Hide Medications, Show/Hide Flares, Show/Hide Pattern Highlights, Filter by Pattern Strength (All/Strong Only/Moderate+Strong). Toggle state persists in localStorage (key: "timeline-layer-preferences"). When pattern highlights hidden, colored bands disappear but badges remain visible. Layer toggle positioned above timeline, accessible via keyboard (Tab navigation, Enter to toggle). [Source: docs/epics.md#Story-6.5]

7. **AC6.5.7 — Create pattern detail panel:** Build PatternDetailPanel component (side panel or modal) opened when user clicks highlighted pattern or pattern badge. Panel displays: pattern description ("Dairy consumption correlates with Headache 12 hours later"), occurrence frequency ("Occurred in 7 of 10 instances"), statistical confidence ("Strong correlation, ρ = 0.72, p < 0.05"), related insights link (navigates to /insights page with correlation pre-selected), timeline view showing all occurrences of this pattern, export pattern data button. Panel closes via X button, Escape key, or click outside. Panel uses existing modal/drawer patterns from project. [Source: docs/epics.md#Story-6.5]

8. **AC6.5.8 — Add export functionality:** Implement export features for timeline with pattern annotations. Export timeline view as image: capture timeline visualization including pattern highlights and badges, use html2canvas or similar library, include pattern legend in exported image. Generate pattern summary report (PDF): create PDF document listing all detected patterns with statistics, occurrence timeline, correlation data, use jsPDF or similar library. Export button positioned in timeline header. Export respects current layer toggle settings (only exports visible patterns). Export includes medical disclaimer: "Patterns show correlations, not causation." [Source: docs/epics.md#Story-6.5]

9. **AC6.5.9 — Optimize timeline rendering:** Implement performance optimizations for large datasets (>1000 events). Use virtualization: render only visible timeline events using react-window or react-virtualized, lazy load events as user scrolls. Lazy load pattern highlights: calculate pattern highlights only for visible date range, extend highlights as user scrolls. Smooth scrolling: use CSS scroll-behavior: smooth, implement scroll restoration on navigation. Debounce pattern detection: wait 500ms after scroll stops before recalculating visible patterns. Target: maintain 60fps scrolling with 1000+ events, pattern highlights render within 100ms of scroll. [Source: docs/epics.md#Story-6.5]

10. **AC6.5.10 — Create timeline tests:** Write comprehensive test suite for timeline pattern detection features. Unit tests: pattern detection algorithm accuracy (sliding window, day-of-week detection), pattern badge rendering with correct icons/colors, pattern legend toggle functionality, pattern detail panel data display. Integration tests: timeline loads with correlation data, pattern highlights render correctly, clicking pattern opens detail panel, layer toggle filters events/patterns, export generates image/PDF. Performance tests: timeline renders 1000+ events smoothly, pattern highlights lazy load correctly, scroll performance meets 60fps target. Use Jest + React Testing Library, mock correlationRepository and pattern detection service. [Source: docs/epics.md#Story-6.5]

## Tasks / Subtasks

- [x] Task 1: Extend TimelineView to query correlation data (AC: #6.5.1)
  - [x] 1.1: Import correlationRepository from Story 6.3
  - [x] 1.2: Add correlation state: `const [correlations, setCorrelations] = useState<CorrelationResult[]>([])`
  - [x] 1.3: Create `loadCorrelations()` function that queries correlationRepository.findAll(userId)
  - [x] 1.4: Filter correlations by timeRange matching timeline date range
  - [x] 1.5: Call loadCorrelations() in useEffect when timeline events load
  - [x] 1.6: Store correlations in component state for pattern highlighting
  - [x] 1.7: Add loading state for correlations (separate from events loading)
  - [x] 1.8: Handle errors if correlation query fails

- [ ] Task 2: Create pattern highlighting visualization system (AC: #6.5.2)
  - [x] 2.1: Create `src/components/timeline/PatternHighlight.tsx` component
  - [x] 2.2: Define PatternHighlightProps: event1, event2, correlationType, lagHours
  - [x] 2.3: Calculate band position: connect event1 timestamp to event2 timestamp accounting for lagHours
  - [x] 2.4: Implement color mapping: food-symptom (orange), trigger-symptom (red), medication-improvement (green)
  - [x] 2.5: Render semi-transparent colored band/connector using SVG or CSS
  - [x] 2.6: Only render highlight if both events visible in viewport
  - [x] 2.7: Add hover effect: highlight band becomes more opaque on hover
  - [ ] 2.8: Integrate PatternHighlight into TimelineView rendering loop

- [ ] Task 3: Build pattern legend component (AC: #6.5.3)
  - [ ] 3.1: Create `src/components/timeline/PatternLegend.tsx` component
  - [ ] 3.2: Define legend items: food-symptom (orange), trigger-symptom (red), medication-improvement (green), custom (purple)
  - [ ] 3.3: Display icon, color swatch, label, description for each type
  - [ ] 3.4: Implement toggle functionality: clicking item shows/hides that pattern type
  - [ ] 3.5: Store toggle state in component state (will persist in Task 6)
  - [ ] 3.6: Make legend collapsible on mobile (accordion or drawer)
  - [ ] 3.7: Position legend above timeline or in sidebar
  - [ ] 3.8: Update legend dynamically based on available correlations

- [x] Task 4: Implement pattern detection algorithm (AC: #6.5.4)
  - [x] 4.1: Create `src/lib/services/patternDetectionService.ts` module
  - [x] 4.2: Implement `detectRecurringSequences(events: TimelineEvent[], correlations: CorrelationResult[]): Pattern[]`
  - [x] 4.3: Sliding window analysis: iterate 24-hour windows across timeline
  - [x] 4.4: Detect sequences: food → symptom after N hours (use lagHours from correlation)
  - [x] 4.5: Detect day-of-week patterns: group events by day of week, identify recurring spikes
  - [x] 4.6: Validate patterns using correlation data: only mark as pattern if correlation exists in correlationRepository
  - [x] 4.7: Create Pattern interface: { id, type, description, frequency, confidence, occurrences: Event[] }
  - [x] 4.8: Add patternDetections table to IndexedDB schema (version 26)
  - [x] 4.9: Implement debouncing: wait 500ms after data load before running detection
  - [x] 4.10: Run detection in background (non-blocking UI)

- [ ] Task 5: Build pattern badge/icon system (AC: #6.5.5)
  - [ ] 5.1: Create `src/components/timeline/PatternBadge.tsx` component
  - [ ] 5.2: Define PatternBadgeProps: pattern, correlationStrength, eventId
  - [ ] 5.3: Render badge icon based on pattern type (food, trigger, medication icons from Lucide)
  - [ ] 5.4: Style badge: strong correlation = filled icon, moderate = outlined icon
  - [ ] 5.5: Position badge in top-right corner of event card
  - [ ] 5.6: Add tooltip: "This food preceded symptoms in 7 of 10 instances" with correlation details
  - [ ] 5.7: Make badge clickable: onClick opens PatternDetailPanel
  - [ ] 5.8: Integrate PatternBadge into TimelineView event rendering

- [ ] Task 6: Implement timeline layer toggle (AC: #6.5.6)
  - [ ] 6.1: Create `src/components/timeline/TimelineLayerToggle.tsx` component
  - [ ] 6.2: Define toggle options: Symptoms, Foods, Triggers, Medications, Flares, Pattern Highlights, Pattern Strength Filter
  - [ ] 6.3: Implement checkbox/toggle UI for each option
  - [ ] 6.4: Store toggle state in localStorage: key "timeline-layer-preferences"
  - [ ] 6.5: Load preferences on component mount
  - [ ] 6.6: Filter timeline events based on toggle state
  - [ ] 6.7: Hide pattern highlights when "Pattern Highlights" toggle off
  - [ ] 6.8: Filter patterns by strength when "Pattern Strength Filter" set
  - [ ] 6.9: Add keyboard navigation: Tab to focus, Enter to toggle
  - [ ] 6.10: Integrate TimelineLayerToggle into TimelineView

- [ ] Task 7: Create pattern detail panel (AC: #6.5.7)
  - [ ] 7.1: Create `src/components/timeline/PatternDetailPanel.tsx` component
  - [ ] 7.2: Define PatternDetailPanelProps: pattern, isOpen, onClose
  - [ ] 7.3: Display pattern description: "Dairy consumption correlates with Headache 12 hours later"
  - [ ] 7.4: Show occurrence frequency: "Occurred in 7 of 10 instances"
  - [ ] 7.5: Display statistical confidence: coefficient, p-value, sample size
  - [ ] 7.6: Add "View Related Insights" link → navigates to /insights with correlation pre-selected
  - [ ] 7.7: Show timeline view of all pattern occurrences (mini timeline)
  - [ ] 7.8: Add "Export Pattern Data" button (defer PDF to Task 8, show placeholder)
  - [ ] 7.9: Implement close functionality: X button, Escape key, click outside
  - [ ] 7.10: Use existing modal/drawer patterns from project (check ui/ components)

- [ ] Task 8: Add export functionality (AC: #6.5.8)
  - [ ] 8.1: Install/verify html2canvas library for image export
  - [ ] 8.2: Install/verify jsPDF library for PDF export
  - [ ] 8.3: Create `src/lib/services/timelineExportService.ts` module
  - [ ] 8.4: Implement `exportTimelineAsImage()`: capture timeline DOM with html2canvas, include pattern legend, save as PNG
  - [ ] 8.5: Implement `exportPatternSummaryPDF()`: create PDF with jsPDF, list all patterns with statistics, include timeline occurrences
  - [ ] 8.6: Add export button to timeline header
  - [ ] 8.7: Export respects layer toggle settings (only visible patterns)
  - [ ] 8.8: Include medical disclaimer in PDF: "Patterns show correlations, not causation."
  - [ ] 8.9: Handle export errors gracefully

- [ ] Task 9: Optimize timeline rendering performance (AC: #6.5.9)
  - [ ] 9.1: Install/verify react-window or react-virtualized library
  - [ ] 9.2: Implement virtualization: render only visible timeline events
  - [ ] 9.3: Calculate viewport bounds based on scroll position
  - [ ] 9.4: Lazy load events as user scrolls (load next batch when near bottom)
  - [ ] 9.5: Lazy load pattern highlights: calculate only for visible date range
  - [ ] 9.6: Extend pattern highlights as user scrolls (preload next range)
  - [ ] 9.7: Debounce pattern detection: wait 500ms after scroll stops
  - [ ] 9.8: Add CSS scroll-behavior: smooth for smooth scrolling
  - [ ] 9.9: Test performance: verify 60fps with 1000+ events
  - [ ] 9.10: Test pattern highlight rendering: <100ms after scroll

- [ ] Task 10: Write comprehensive tests (AC: #6.5.10)
  - [ ] 10.1: Create `src/lib/services/__tests__/patternDetectionService.test.ts`
  - [ ] 10.2: Test sliding window analysis: detect food → symptom sequences
  - [ ] 10.3: Test day-of-week pattern detection: identify recurring Monday spikes
  - [ ] 10.4: Test pattern validation: only mark patterns if correlation exists
  - [ ] 10.5: Create `src/components/timeline/__tests__/PatternBadge.test.tsx`
  - [ ] 10.6: Test badge rendering with different pattern types
  - [ ] 10.7: Test tooltip display on hover
  - [ ] 10.8: Create `src/components/timeline/__tests__/PatternLegend.test.tsx`
  - [ ] 10.9: Test legend toggle functionality
  - [ ] 10.10: Create `src/components/timeline/__tests__/TimelineView.patterns.test.tsx` integration test
  - [ ] 10.11: Test timeline loads with correlation data
  - [ ] 10.12: Test pattern highlights render correctly
  - [ ] 10.13: Test clicking pattern opens detail panel
  - [ ] 10.14: Test layer toggle filters events/patterns
  - [ ] 10.15: Test export generates image/PDF
  - [ ] 10.16: Mock correlationRepository and patternDetectionService for tests
  - [ ] 10.17: Verify all tests pass with `npm test`

## Dev Notes

### Technical Architecture

This story extends the existing TimelineView component (from Epic 3.5) with pattern detection and visualization capabilities, building on the correlation engine from Story 6.3 and insights UI patterns from Story 6.4. The timeline becomes an intelligent visualization that highlights meaningful relationships between health events, making it easier for users to identify triggers and patterns.

**Key Architecture Points:**
- **Correlation Integration:** Timeline queries correlationRepository to identify which events are correlated
- **Visual Pattern Highlighting:** Colored bands connect correlated events, making patterns immediately visible
- **Pattern Detection:** Sliding window algorithm identifies recurring sequences and day-of-week patterns
- **Performance:** Virtualization and lazy loading ensure smooth UX with large datasets (1000+ events)
- **Export:** Users can export timeline with pattern annotations for medical consultations

### Learnings from Previous Story

**From Story 6-4-health-insights-hub-ui (Status: review)**

- **CorrelationRepository Available:** Story 6.4 uses `correlationRepository.findAll(userId)` to query correlation data. This story will use the same repository methods to load correlations for timeline events. [Source: stories/6-4-health-insights-hub-ui.md#Dev-Agent-Record]

- **CorrelationResult Data Model:** Story 6.4 uses CorrelationResult interface from `src/types/correlation.ts` with fields: type, item1, item2, coefficient, strength, lagHours, confidence, timeRange. This story will use the same interface to match timeline events with correlations. [Source: stories/6-4-health-insights-hub-ui.md#Dev-Agent-Record]

- **Time Range Filtering:** Story 6.4 implements time range filtering (7d/30d/90d/all) for insights. This story will filter correlations by timeline date range to only show relevant patterns. [Source: stories/6-4-health-insights-hub-ui.md#Dev-Agent-Record]

- **Chart.js Integration:** Story 6.4 uses Chart.js for visualizations. This story may use Chart.js for mini timeline in pattern detail panel, but primary visualization is timeline bands/connectors (custom SVG/CSS).

- **Component Patterns:** Story 6.4 created InsightCard, InsightDetailModal, TimeRangeSelector components. This story will follow similar component patterns for PatternBadge, PatternDetailPanel, TimelineLayerToggle.

- **Medical Disclaimer:** Story 6.4 includes medical disclaimer banner. This story will include disclaimer in exported PDF: "Patterns show correlations, not causation."

- **Files Created by Story 6.4:**
  - `src/lib/repositories/correlationRepository.ts` - Use for querying correlations
  - `src/lib/hooks/useCorrelations.ts` - Could reuse hook pattern for timeline correlations
  - `src/components/insights/InsightDetailModal.tsx` - Pattern for PatternDetailPanel modal
  - `src/lib/services/insightPrioritization.ts` - Pattern for patternDetectionService

**Key Pattern for This Story:** Story 6.5 extends existing TimelineView component rather than creating new page. Focus on visualization enhancements (pattern highlighting, badges) and pattern detection algorithm. Reuse correlation data from Story 6.3, follow UI patterns from Story 6.4.

### Project Structure Notes

**Files to Create:**
```
src/components/timeline/
  ├── PatternHighlight.tsx (NEW - colored bands connecting correlated events)
  ├── PatternBadge.tsx (NEW - badge icon on events with patterns)
  ├── PatternLegend.tsx (NEW - legend showing pattern types)
  ├── PatternDetailPanel.tsx (NEW - side panel/modal with pattern details)
  ├── TimelineLayerToggle.tsx (NEW - show/hide event types and patterns)
  └── __tests__/
      ├── PatternBadge.test.tsx (NEW)
      ├── PatternLegend.test.tsx (NEW)
      └── TimelineView.patterns.test.tsx (NEW - integration tests)

src/lib/services/
  ├── patternDetectionService.ts (NEW - sliding window pattern detection)
  ├── timelineExportService.ts (NEW - image/PDF export)
  └── __tests__/
      └── patternDetectionService.test.ts (NEW)
```

**Files to Modify:**
- `src/components/timeline/TimelineView.tsx` - Extend to query correlations, render pattern highlights/badges, integrate layer toggle
- `src/lib/db/schema.ts` - Add PatternDetectionRecord interface
- `src/lib/db/client.ts` - Add patternDetections table (schema version 26)

### Timeline Component Architecture

**Existing TimelineView Structure:**
- Component: `src/components/timeline/TimelineView.tsx`
- Queries: medicationEventRepository, triggerEventRepository, flareRepository, foodEventRepository, symptomInstanceRepository
- Event Types: 'medication' | 'symptom' | 'trigger' | 'flare-created' | 'flare-updated' | 'flare-resolved' | 'food'
- Grouping: Events grouped by day (DayGroup interface)
- Rendering: Chronological list with date headers

**Extension Points:**
- Add correlation query in useEffect when events load
- Render PatternHighlight components between correlated events
- Add PatternBadge to event cards
- Integrate TimelineLayerToggle above timeline
- Add PatternDetailPanel modal state

### Pattern Detection Algorithm

**Sliding Window Approach:**
```typescript
function detectRecurringSequences(events: TimelineEvent[], correlations: CorrelationResult[]): Pattern[] {
  const patterns: Pattern[] = [];
  
  // Iterate 24-hour windows
  for (let i = 0; i < events.length - 1; i++) {
    const windowStart = events[i].timestamp;
    const windowEnd = windowStart + (24 * 60 * 60 * 1000);
    
    // Find events in window
    const windowEvents = events.filter(e => 
      e.timestamp >= windowStart && e.timestamp <= windowEnd
    );
    
    // Check for correlations
    for (const correlation of correlations) {
      const event1 = findEvent(windowEvents, correlation.item1);
      const event2 = findEvent(windowEvents, correlation.item2);
      
      if (event1 && event2 && matchesLag(event1, event2, correlation.lagHours)) {
        patterns.push({
          type: correlation.type,
          description: `${correlation.item1} → ${correlation.item2}`,
          frequency: countOccurrences(events, correlation),
          confidence: correlation.confidence,
          occurrences: [event1, event2]
        });
      }
    }
  }
  
  return patterns;
}
```

**Day-of-Week Pattern Detection:**
- Group events by day of week (Monday, Tuesday, etc.)
- Calculate average symptom severity per day
- Identify days with significantly higher severity (statistical test)
- Mark as pattern if difference is statistically significant

### Pattern Highlighting Visualization

**Band/Connector Rendering:**
- Use SVG `<line>` or `<path>` elements to draw connectors
- Position: absolute positioning based on event timestamps
- Color: orange (food-symptom), red (trigger-symptom), green (medication-improvement)
- Opacity: 0.3 default, 0.7 on hover
- Only render if both events visible in viewport

**Badge Positioning:**
- Top-right corner of event card
- Size: 20x20px minimum (touch-friendly)
- Icon: Lucide icons (Apple, AlertCircle, Pill, Activity)
- Color: matches pattern type

### Export Functionality

**Image Export:**
- Use html2canvas to capture timeline DOM
- Include pattern legend in capture
- Save as PNG file
- Respect layer toggle settings (only visible patterns)

**PDF Export:**
- Use jsPDF library
- Create multi-page PDF with:
  - Cover page: pattern summary statistics
  - Pattern pages: one pattern per page with timeline occurrences
  - Medical disclaimer on every page
- Include correlation coefficients, p-values, sample sizes

### Performance Optimization

**Virtualization:**
- Use react-window FixedSizeList or VariableSizeList
- Render only visible events (viewport + buffer)
- Calculate item heights dynamically based on content

**Lazy Loading:**
- Load events in batches (e.g., 50 events at a time)
- Load next batch when user scrolls near bottom
- Preload pattern highlights for visible range + 1 day buffer

**Debouncing:**
- Wait 500ms after scroll stops before recalculating visible patterns
- Use requestAnimationFrame for smooth rendering

### Testing Strategy

**Unit Tests:**
- Pattern detection algorithm: sliding window, day-of-week detection
- Pattern badge rendering: icons, colors, tooltips
- Pattern legend: toggle functionality, dynamic updates

**Integration Tests:**
- Timeline loads with correlation data
- Pattern highlights render correctly
- Clicking pattern opens detail panel
- Layer toggle filters events/patterns
- Export generates image/PDF

**Performance Tests:**
- Timeline renders 1000+ events smoothly (60fps)
- Pattern highlights lazy load correctly
- Scroll performance meets targets

### References

- [Source: docs/epics.md#Story-6.5] - Story acceptance criteria and requirements
- [Source: stories/6-3-correlation-engine-and-spearman-algorithm.md#Dev-Agent-Record] - CorrelationResult data model and repository methods
- [Source: stories/6-4-health-insights-hub-ui.md#Dev-Agent-Record] - UI component patterns and correlationRepository usage
- [Source: docs/solution-architecture.md#Technology-Stack] - Chart.js, react-window, html2canvas, jsPDF libraries
- [Source: src/components/timeline/TimelineView.tsx] - Existing timeline component structure
- [react-window Documentation] - Virtualization library
- [html2canvas Documentation] - DOM to image conversion
- [jsPDF Documentation] - PDF generation

### Integration Points

**This Story Depends On:**
- Story 6.3: Correlation Engine (done) - Provides correlation data via correlationRepository
- Story 6.4: Health Insights Hub UI (review) - Provides UI patterns and correlationRepository usage examples
- Epic 2: Flare Management (done) - Provides flare events for timeline
- Epic 3.5: Production-Ready UI/UX (done) - Provides existing TimelineView component

**This Story Enables:**
- Story 6.7: Treatment Effectiveness Tracker - Can reuse pattern detection for treatment patterns
- Future analytics features - Pattern detection foundation for advanced analytics

### Risk Mitigation

**Risk: Performance degradation with large datasets**
- Mitigation: Implement virtualization and lazy loading
- Test with 1000+ events to verify 60fps performance
- Use debouncing for pattern detection

**Risk: Pattern highlights clutter timeline**
- Mitigation: Layer toggle allows users to hide pattern highlights
- Badges are small and non-intrusive
- Only show highlights for significant correlations (|ρ| >= 0.3)

**Risk: Pattern detection false positives**
- Mitigation: Only mark patterns if correlation exists in correlationRepository (validated by Story 6.3)
- Require minimum occurrence frequency (e.g., 3+ instances)
- Display confidence levels in pattern detail panel

**Risk: Export functionality complexity**
- Mitigation: Use well-established libraries (html2canvas, jsPDF)
- Handle export errors gracefully
- Test export with various timeline sizes

### Future Enhancements (Out of Scope for This Story)

**Deferred to Future Stories:**
- Real-time pattern detection (currently runs on timeline load)
- Pattern notifications (alert when new pattern detected)
- Pattern sharing (share specific patterns with healthcare provider)
- Advanced pattern types (multi-event sequences, cyclical patterns)

**Nice-to-Have Features:**
- Pattern animation (highlight patterns on timeline load)
- Pattern comparison (compare patterns across time ranges)
- Pattern history (track how patterns change over time)

## Dev Agent Record

### Context Reference

- docs/stories/6-5-timeline-pattern-detection.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

**Date: 2025-11-10 (Story Creation)**
- Created Story 6.5 - Timeline Pattern Detection
- Defined 10 acceptance criteria for timeline pattern visualization and detection
- Created 10 tasks with detailed subtasks (100+ total subtasks)
- Documented pattern detection algorithm, visualization system, export functionality
- Integrated learnings from Story 6.4 (correlation repository patterns and UI components)
- Story ready for context generation and development

