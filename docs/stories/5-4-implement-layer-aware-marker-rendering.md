# Story 5.4: Implement Layer-Aware Marker Rendering

Status: drafted

## Story

As a user viewing marked body areas,
I want to see different visual markers for each layer type,
so that I can instantly distinguish between flares, pain, and inflammation.

## Acceptance Criteria

1. **AC5.4.1 — Generalized BodyMapMarker component:** Refactor existing FlareMarker component into generalized BodyMapMarker that renders layer-specific icons and colors. Component accepts layer prop and renders appropriate visual style using LAYER_CONFIG. Supports all 3 layers: Flares (🔥 red/orange), Pain (⚡ yellow/amber), Inflammation (🟣 purple). [Source: docs/epics.md#Story-5.4, docs/epic-5-tech-spec.md#Layer-Aware-Marker-Rendering]

2. **AC5.4.2 — Severity-based size scaling:** Marker size scales with severity (1-10): Severity 1-3 renders small (16px), severity 4-7 renders medium (24px), severity 8-10 renders large (32px). Minimum touch target maintained at 32px with transparent padding for small markers (NFR001). [Source: docs/epic-5-tech-spec.md#Size-Scaling]

3. **AC5.4.3 — Recency-based opacity:** Marker opacity indicates age: markers < 7 days render 100% opaque, 7-30 days render 70% opaque, > 30 days render 50% opaque. Calculation based on marker timestamp vs current date. Applies to all layers consistently. [Source: docs/epics.md#Story-5.4, docs/epic-5-tech-spec.md#Visual-Specifications]

4. **AC5.4.4 — Smart overlap prevention:** Multiple markers at same body region position with smart offset algorithm preventing complete overlap. Offset calculation uses circular distribution pattern (calculateMarkerOffset function). Markers stagger in radius around central point. [Source: docs/epics.md#Story-5.4, docs/epic-5-tech-spec.md#Overlap-Prevention]

5. **AC5.4.5 — Layer-filtered marker queries:** Body map queries filter markers by active layer in tracking mode (single layer view). Uses bodyMapRepository.getMarkersByLayer() from Story 5.1. Query performance maintained with compound index [userId+layer+timestamp]. [Source: docs/epics.md#Story-5.4]

6. **AC5.4.6 — Performance optimization for 50+ markers:** Marker rendering handles 50+ markers without lag (NFR001). Uses React.memo for marker components preventing unnecessary re-renders. Consider virtualization if marker count exceeds 100. Target: 60fps interactions. [Source: docs/epics.md#Story-5.4, docs/epic-5-tech-spec.md#Performance-Optimization]

7. **AC5.4.7 — Colorblind-friendly design:** All marker types use distinct shapes/icons AND colors ensuring accessibility for colorblind users. Icons alone distinguish layer types even without color. Meets WCAG 2.1 Level AA standards. [Source: docs/epics.md#Story-5.4]

8. **AC5.4.8 — Interactive marker behavior:** Tapping/clicking marker opens layer-appropriate detail view (flare detail, pain log, inflammation log). Hover state provides visual feedback. Active/focus states support keyboard navigation. [Source: docs/epics.md#Story-5.4]

9. **AC5.4.9 — Real-time marker updates:** Markers update immediately when new data logged or layer switched. Body map subscribes to marker data changes and re-renders affected markers. No full page reload required. [Source: docs/epics.md#Story-5.4]

## Tasks / Subtasks

- [ ] Task 1: Refactor FlareMarker to BodyMapMarker (AC: #5.4.1)
  - [ ] 1.1: Locate existing FlareMarker component
  - [ ] 1.2: Rename to BodyMapMarker or create new generalized component
  - [ ] 1.3: Add layer prop to component interface
  - [ ] 1.4: Import LAYER_CONFIG from schema
  - [ ] 1.5: Map layer to icon/color using LAYER_CONFIG
  - [ ] 1.6: Update all references from FlareMarker to BodyMapMarker
  - [ ] 1.7: Ensure backward compatibility with existing flare displays

- [ ] Task 2: Implement severity-based sizing (AC: #5.4.2)
  - [ ] 2.1: Create getSeveritySize(severity) utility function
  - [ ] 2.2: Return size based on ranges: 1-3 → 16px, 4-7 → 24px, 8-10 → 32px
  - [ ] 2.3: Apply size to marker wrapper element
  - [ ] 2.4: Add transparent padding for markers < 32px to meet touch target
  - [ ] 2.5: Test touch target accessibility with DevTools
  - [ ] 2.6: Ensure icon scales proportionally with marker size

- [ ] Task 3: Implement recency-based opacity (AC: #5.4.3)
  - [ ] 3.1: Create getMarkerOpacity(timestamp) utility function
  - [ ] 3.2: Calculate days since marker created (now - timestamp)
  - [ ] 3.3: Return opacity: < 7 days → 1.0, 7-30 days → 0.7, > 30 days → 0.5
  - [ ] 3.4: Apply opacity to marker wrapper or use Tailwind opacity classes
  - [ ] 3.5: Test opacity calculation with various timestamps
  - [ ] 3.6: Ensure opacity works with color contrast (WCAG AA)

- [ ] Task 4: Implement overlap prevention algorithm (AC: #5.4.4)
  - [ ] 4.1: Create calculateMarkerOffset(markers, currentIndex) utility
  - [ ] 4.2: Implement circular distribution pattern (angle = index / count * 2π)
  - [ ] 4.3: Calculate x/y offsets using cos/sin (radius * cos/sin(angle))
  - [ ] 4.4: Use 8-12px radius for offset
  - [ ] 4.5: Group markers by bodyRegionId before calculating offsets
  - [ ] 4.6: Apply offset to marker positioning (CSS transform or x/y props)
  - [ ] 4.7: Test with 2, 3, 4+ markers at same location
  - [ ] 4.8: Ensure offsets don't push markers outside region bounds

- [ ] Task 5: Layer-filtered marker queries (AC: #5.4.5)
  - [ ] 5.1: Update body map data-fetching logic
  - [ ] 5.2: Use bodyMapRepository.getMarkersByLayer(userId, currentLayer)
  - [ ] 5.3: Pass currentLayer from LayerSelector state
  - [ ] 5.4: Test query performance with 50+ markers
  - [ ] 5.5: Verify compound index [userId+layer+timestamp] used
  - [ ] 5.6: Add loading state while markers fetch

- [ ] Task 6: Performance optimization (AC: #5.4.6)
  - [ ] 6.1: Wrap BodyMapMarker with React.memo
  - [ ] 6.2: Define memo comparison function (check id, layer, severity)
  - [ ] 6.3: Test re-render count with React DevTools Profiler
  - [ ] 6.4: Measure frame rate with 50+ markers rendered
  - [ ] 6.5: If < 60fps, implement virtualization (react-window)
  - [ ] 6.6: Consider marker clustering for 100+ markers
  - [ ] 6.7: Benchmark before/after optimization

- [ ] Task 7: Colorblind-friendly design (AC: #5.4.7)
  - [ ] 7.1: Ensure each layer has unique icon shape (🔥 ⚡ 🟣)
  - [ ] 7.2: Test appearance in grayscale mode
  - [ ] 7.3: Verify icons distinguishable without color
  - [ ] 7.4: Check color contrast ratios (WCAG AA: 4.5:1 minimum)
  - [ ] 7.5: Test with color blindness simulation tools
  - [ ] 7.6: Add optional pattern/texture if colors too similar

- [ ] Task 8: Interactive marker behavior (AC: #5.4.8)
  - [ ] 8.1: Add onClick handler to marker component
  - [ ] 8.2: Determine detail view based on layer type
  - [ ] 8.3: Navigate to appropriate detail page/modal
  - [ ] 8.4: Add hover state styling (scale, brightness, border)
  - [ ] 8.5: Add focus state for keyboard navigation
  - [ ] 8.6: Add active state feedback on click
  - [ ] 8.7: Test touch interactions on mobile
  - [ ] 8.8: Ensure cursor changes to pointer on hover

- [ ] Task 9: Real-time marker updates (AC: #5.4.9)
  - [ ] 9.1: Implement useEffect hook to refetch markers on layer change
  - [ ] 9.2: Subscribe to marker data changes (if using state management)
  - [ ] 9.3: Update markers without full page reload
  - [ ] 9.4: Add optimistic UI update when new marker created
  - [ ] 9.5: Test marker updates across different layer views
  - [ ] 9.6: Verify smooth transitions when markers appear/disappear

- [ ] Task 10: Component testing (AC: All)
  - [ ] 10.1: Create `__tests__/BodyMapMarker.test.tsx`
  - [ ] 10.2: Write test: "renders correct icon for each layer"
  - [ ] 10.3: Write test: "applies correct color for each layer"
  - [ ] 10.4: Write test: "scales size based on severity"
  - [ ] 10.5: Write test: "applies opacity based on recency"
  - [ ] 10.6: Write test: "calculates offset for overlapping markers"
  - [ ] 10.7: Write test: "renders with React.memo optimization"
  - [ ] 10.8: Write test: "meets 32px minimum touch target"
  - [ ] 10.9: Write test: "calls detail handler on click"
  - [ ] 10.10: Write integration test: "body map shows filtered markers by layer"

## Dev Notes

### Technical Architecture

This story implements the visual rendering layer for Epic 5's multi-layer marker system. BodyMapMarker becomes a polymorphic component capable of rendering any body-area tracking type with distinct visual characteristics.

**Key Architecture Points:**
- **Visual Differentiation:** Icons + colors create clear distinction between layers
- **Progressive Opacity:** Age-based opacity helps users focus on recent data
- **Smart Layout:** Overlap prevention maintains readability with multiple markers
- **Performance-First:** React.memo and virtualization ensure smooth 60fps rendering

### Learnings from Previous Story

**From Story 5-3-create-layer-selector-component-for-tracking-mode (Status: drafted)**

- **LAYER_CONFIG Reuse:** Story 5.3 established pattern of importing LAYER_CONFIG for icon/color/label. BodyMapMarker will use same config ensuring visual consistency between selector and markers.

- **currentLayer State:** LayerSelector manages currentLayer state which will be passed to body map for marker filtering. Body map queries markers using currentLayer value.

- **Optimistic UI Pattern:** Layer switching updates immediately in UI. Apply same pattern: marker adds appear instantly, IndexedDB persistence async.

- **Accessibility Standards:** Story 5.3 set WCAG 2.1 Level AA bar. Marker colors must meet same contrast standards, plus icon-based distinction for colorblind users.

- **Touch Target Requirements:** 44x44px minimum from story 5.3. Markers need 32px minimum with transparent padding for smaller severity levels.

- **Key Pattern for This Story:** Component reusability through props (layer, severity, timestamp). Single marker component handles all tracking types through configuration-driven rendering.

[Source: stories/5-3-create-layer-selector-component-for-tracking-mode.md#Dev-Notes]

### Project Structure Notes

**Files to Create/Modify:**
```
src/components/body-map/
  ├── markers/
  │   ├── BodyMapMarker.tsx (NEW or REFACTOR from FlareMarker)
  │   └── markerUtils.ts (NEW - utility functions)
  └── __tests__/
      └── BodyMapMarker.test.tsx (NEW - marker tests)

src/lib/utils/
  └── markerCalculations.ts (NEW - offset/opacity/size calculations)
```

### Component Props Interface

**BodyMapMarkerProps:**
```typescript
interface BodyMapMarkerProps {
  id: string;                     // Marker ID
  layer: LayerType;               // Layer determines icon/color
  bodyRegionId: string;           // Body region this marker belongs to
  coordinates?: { x: number; y: number }; // Precise location
  severity: number;               // 1-10 scale
  timestamp: number;              // Creation time (for opacity)
  position: { x: number; y: number }; // SVG position (with offset applied)
  onClick?: () => void;           // Handler for marker click
  className?: string;             // Additional styles
}
```

### Utility Functions

**Marker Calculations:**
```typescript
// markerCalculations.ts

/**
 * Calculate marker size based on severity
 */
export function getSeveritySize(severity: number): number {
  if (severity <= 3) return 16;
  if (severity <= 7) return 24;
  return 32; // severity 8-10
}

/**
 * Calculate marker opacity based on age
 */
export function getMarkerOpacity(timestamp: number): number {
  const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

  if (daysSince < 7) return 1.0;   // 100% opaque
  if (daysSince < 30) return 0.7;  // 70% opaque
  return 0.5;                       // 50% opaque
}

/**
 * Calculate offset for overlapping markers
 * Uses circular distribution pattern
 */
export function calculateMarkerOffset(
  markers: Marker[],
  currentIndex: number
): { x: number; y: number } {
  if (markers.length === 1) {
    return { x: 0, y: 0 }; // No offset needed
  }

  const radius = 8; // px offset from center
  const angle = (currentIndex / markers.length) * 2 * Math.PI;

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}
```

### Component Implementation Pattern

**BodyMapMarker Component:**
```typescript
import React from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import { getSeveritySize, getMarkerOpacity } from '@/lib/utils/markerCalculations';
import { cn } from '@/lib/utils';

interface BodyMapMarkerProps {
  id: string;
  layer: LayerType;
  severity: number;
  timestamp: number;
  position: { x: number; y: number };
  onClick?: () => void;
}

const BodyMapMarkerComponent = ({
  id,
  layer,
  severity,
  timestamp,
  position,
  onClick
}: BodyMapMarkerProps) => {
  const layerConfig = LAYER_CONFIG[layer];
  const size = getSeveritySize(severity);
  const opacity = getMarkerOpacity(timestamp);

  // Ensure minimum touch target
  const touchTargetSize = Math.max(size, 32);
  const padding = (touchTargetSize - size) / 2;

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      opacity={opacity}
      onClick={onClick}
      className="cursor-pointer transition-transform hover:scale-110 focus:scale-110"
      tabIndex={0}
      role="button"
      aria-label={`${layerConfig.label} marker, severity ${severity}`}
    >
      {/* Touch target (transparent padding) */}
      <circle
        r={touchTargetSize / 2}
        fill="transparent"
        className="pointer-events-all"
      />

      {/* Visible marker */}
      <circle
        r={size / 2}
        className={cn(
          layerConfig.color.replace('text-', 'fill-'),
          "stroke-white stroke-2"
        )}
      />

      {/* Icon/emoji overlay */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.7}
      >
        {layerConfig.icon}
      </text>
    </g>
  );
};

// Memoize to prevent unnecessary re-renders
export const BodyMapMarker = React.memo(
  BodyMapMarkerComponent,
  (prev, next) => {
    return (
      prev.id === next.id &&
      prev.layer === next.layer &&
      prev.severity === next.severity &&
      prev.timestamp === next.timestamp &&
      prev.position.x === next.position.x &&
      prev.position.y === next.position.y
    );
  }
);
```

### Overlap Prevention Implementation

**Grouping and Offsetting Markers:**
```typescript
// In body map rendering logic
function renderMarkersWithOffsets(markers: BodyMapLocationRecord[]) {
  // Group markers by body region
  const markersByRegion = markers.reduce((acc, marker) => {
    if (!acc[marker.bodyRegionId]) acc[marker.bodyRegionId] = [];
    acc[marker.bodyRegionId].push(marker);
    return acc;
  }, {} as Record<string, BodyMapLocationRecord[]>);

  // Render with offsets
  return Object.entries(markersByRegion).flatMap(([regionId, regionMarkers]) => {
    return regionMarkers.map((marker, index) => {
      const basePosition = getMarkerPosition(marker); // From body region coords
      const offset = calculateMarkerOffset(regionMarkers, index);

      const finalPosition = {
        x: basePosition.x + offset.x,
        y: basePosition.y + offset.y
      };

      return (
        <BodyMapMarker
          key={marker.id}
          {...marker}
          position={finalPosition}
        />
      );
    });
  });
}
```

### Layer-Filtered Query Pattern

**Body Map Data Fetching:**
```typescript
// In body map component
import { useEffect, useState } from 'react';
import { bodyMapRepository } from '@/lib/repositories/bodyMapRepository';
import { LayerType } from '@/lib/db/schema';

export function useBodyMapMarkers(userId: string, currentLayer: LayerType) {
  const [markers, setMarkers] = useState<BodyMapLocationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkers() {
      setIsLoading(true);
      const data = await bodyMapRepository.getMarkersByLayer(userId, currentLayer);
      setMarkers(data);
      setIsLoading(false);
    }

    void fetchMarkers();
  }, [userId, currentLayer]); // Refetch when layer changes

  return { markers, isLoading };
}
```

### Testing Strategy

**Unit Tests:**
```typescript
// __tests__/BodyMapMarker.test.tsx
import { render, screen } from '@testing-library/react';
import { BodyMapMarker } from '../markers/BodyMapMarker';

describe('BodyMapMarker', () => {
  it('should render correct icon for each layer', () => {
    const { rerender } = render(
      <svg>
        <BodyMapMarker
          id="1"
          layer="flares"
          severity={5}
          timestamp={Date.now()}
          position={{ x: 0, y: 0 }}
        />
      </svg>
    );

    expect(screen.getByText('🔥')).toBeInTheDocument();

    rerender(
      <svg>
        <BodyMapMarker
          id="2"
          layer="pain"
          severity={5}
          timestamp={Date.now()}
          position={{ x: 0, y: 0 }}
        />
      </svg>
    );

    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('should scale size based on severity', () => {
    const { container, rerender } = render(
      <svg>
        <BodyMapMarker
          id="1"
          layer="flares"
          severity={2}
          timestamp={Date.now()}
          position={{ x: 0, y: 0 }}
        />
      </svg>
    );

    let circle = container.querySelector('circle[r="8"]'); // 16px diameter → 8px radius
    expect(circle).toBeInTheDocument();

    rerender(
      <svg>
        <BodyMapMarker
          id="1"
          layer="flares"
          severity={9}
          timestamp={Date.now()}
          position={{ x: 0, y: 0 }}
        />
      </svg>
    );

    circle = container.querySelector('circle[r="16"]'); // 32px diameter → 16px radius
    expect(circle).toBeInTheDocument();
  });

  it('should apply opacity based on recency', () => {
    const oldTimestamp = Date.now() - (31 * 24 * 60 * 60 * 1000); // 31 days ago

    const { container } = render(
      <svg>
        <BodyMapMarker
          id="1"
          layer="flares"
          severity={5}
          timestamp={oldTimestamp}
          position={{ x: 0, y: 0 }}
        />
      </svg>
    );

    const group = container.querySelector('g[opacity]');
    expect(group).toHaveAttribute('opacity', '0.5');
  });
});

// Utility function tests
describe('markerCalculations', () => {
  it('should calculate correct severity sizes', () => {
    expect(getSeveritySize(1)).toBe(16);
    expect(getSeveritySize(5)).toBe(24);
    expect(getSeveritySize(10)).toBe(32);
  });

  it('should calculate marker offsets in circular pattern', () => {
    const markers = [{}, {}, {}]; // 3 markers
    const offsets = markers.map((_, i) => calculateMarkerOffset(markers, i));

    // Verify circular distribution (120° apart)
    expect(offsets[0].x).toBeCloseTo(8); // 0°
    expect(offsets[1].x).toBeCloseTo(-4); // 120°
    expect(offsets[2].x).toBeCloseTo(-4); // 240°
  });
});
```

### References

- [Source: docs/epic-5-tech-spec.md#Layer-Aware-Marker-Rendering] - Marker rendering specification
- [Source: docs/epics.md#Story-5.4] - Story acceptance criteria
- [Source: stories/5-1-add-layer-field-to-data-model-and-indexeddb-schema.md] - LAYER_CONFIG and layer field
- [Source: stories/5-3-create-layer-selector-component-for-tracking-mode.md] - Layer selection context
- [Source: React.memo Documentation](https://react.dev/reference/react/memo) - Performance optimization

### Integration Points

**This Story Enables:**
- Story 5.5: Multi-layer view renders markers from multiple layers simultaneously
- Story 5.6: Layer legend references LAYER_CONFIG for consistent display
- Full body map visualization with layer-specific markers

**Dependencies:**
- Story 5.1: LAYER_CONFIG and layer field in data model
- Story 5.3: currentLayer state from LayerSelector
- Existing body map SVG infrastructure

### Performance Considerations

**NFR001: Response Time < 100ms**
- React.memo prevents re-renders when props unchanged
- Layer-filtered queries use compound index (O(log n))
- Target: 60fps with 50+ markers rendered

**Optimization Strategies:**
- Virtualization for 100+ markers (react-window)
- Marker clustering for extremely dense regions
- Debounce marker updates on rapid layer switching

**Benchmarking:**
```typescript
// Performance test
describe('Performance: Marker Rendering', () => {
  it('should render 50+ markers without lag', async () => {
    const markers = Array.from({ length: 60 }, (_, i) => ({
      id: `marker-${i}`,
      layer: ['flares', 'pain', 'inflammation'][i % 3] as LayerType,
      severity: (i % 10) + 1,
      timestamp: Date.now(),
      position: { x: i * 10, y: i * 10 }
    }));

    const start = performance.now();
    render(
      <svg>
        {markers.map(m => <BodyMapMarker key={m.id} {...m} />)}
      </svg>
    );
    const renderTime = performance.now() - start;

    expect(renderTime).toBeLessThan(100); // < 100ms (NFR001)
  });
});
```

### Risk Mitigation

**Risk: Performance degradation with many markers**
- Mitigation: React.memo, virtualization, clustering
- Fallback: Limit display to 100 most recent markers

**Risk: Overlapping markers become unreadable**
- Mitigation: Smart offset algorithm with 8px radius
- Fallback: Increase offset radius or implement marker clustering

**Risk: Icons not distinct enough in grayscale**
- Mitigation: Test with color blindness simulation
- Fallback: Add optional patterns/textures to markers

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
