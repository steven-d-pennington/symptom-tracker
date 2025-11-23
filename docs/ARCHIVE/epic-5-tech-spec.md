# Epic 5: Body Map Multi-Layer Enhancement - Technical Specification

**Project:** symptom-tracker
**Author:** Steven (with Winston, Architect)
**Date:** 2025-01-05
**Epic Size:** 21 story points (6 stories)
**Status:** Ready for Implementation

---

## Executive Summary

**Objective:** Transform the body map from a single-purpose flare tracking tool into a multi-layer visualization system supporting four distinct tracking types: Flares, Pain, Mobility restrictions, and Inflammation.

**Technical Approach:** Extend existing IndexedDB schema with backward-compatible layer field, add layer preferences table, build layer-aware UI components, implement multi-layer rendering with performance optimization.

**Key Deliverables:**
- Schema migration adding layer support
- Layer preference persistence system
- LayerSelector UI component
- Multi-layer marker rendering engine
- Layer toggle controls and filtering
- Accessible layer legend

---

## Architecture Overview

### System Integration

Epic 5 integrates with existing architecture:

```
┌─────────────────────────────────────────────────────┐
│           Body Map Components (Existing)            │
│  ┌──────────────────────────────────────────────┐  │
│  │  BodyMapInteractive.tsx                      │  │
│  │  ┌──────────────┐  ┌───────────────────┐    │  │
│  │  │ LayerSelector│  │  LayerToggle      │    │  │  ← NEW
│  │  │ (Story 5.3)  │  │  (Story 5.5)      │    │  │
│  │  └──────┬───────┘  └─────────┬─────────┘    │  │
│  │         │                     │              │  │
│  │  ┌──────▼─────────────────────▼──────────┐  │  │
│  │  │   Multi-Layer Marker Renderer         │  │  │  ← NEW
│  │  │   (Story 5.4)                         │  │  │
│  │  └───────────────────┬───────────────────┘  │  │
│  └──────────────────────┼───────────────────────┘  │
└─────────────────────────┼──────────────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │    Layer State Management       │  ← NEW
         │    (useBodyMapLayers hook)      │
         └────────────────┬────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │  bodyMapPreferencesRepository   │  ← NEW
         │  bodyMapRepository (extended)   │
         └────────────────┬────────────────┘
                          │
                  ┌───────▼──────┐
                  │  IndexedDB    │
                  │  + 2 changes: │
                  │  1. layer     │  ← NEW (Story 5.1)
                  │  2. prefs     │  ← NEW (Story 5.2)
                  └───────────────┘
```

---

## Data Architecture

### Story 5.1: Schema Changes

#### 1. Layer Field Addition

**Affected Table:** `bodyMapLocations` (or equivalent marker table)

```typescript
// BEFORE (existing)
interface BodyMapLocationRecord {
  id: string;
  userId: string;
  bodyRegionId: string;
  coordinates?: { x: number; y: number };
  severity: number;
  timestamp: number;
  // ... existing fields
}

// AFTER (with layer support)
interface BodyMapLocationRecord {
  id: string;
  userId: string;
  bodyRegionId: string;
  coordinates?: { x: number; y: number };
  severity: number;
  timestamp: number;
  layer: LayerType;  // ← NEW
  // ... existing fields
}

// NEW: Layer type definition
export type LayerType = 'flares' | 'pain' | 'mobility' | 'inflammation';

// NEW: Layer metadata
export interface LayerMetadata {
  id: LayerType;
  label: string;
  icon: string;  // Emoji
  color: string; // Tailwind color class
  description: string;
}

export const LAYER_CONFIG: Record<LayerType, LayerMetadata> = {
  flares: {
    id: 'flares',
    label: 'Flares',
    icon: '🔥',
    color: 'text-red-500',
    description: 'HS flare tracking'
  },
  pain: {
    id: 'pain',
    label: 'Pain',
    icon: '⚡',
    color: 'text-yellow-500',
    description: 'General body pain'
  },
  mobility: {
    id: 'mobility',
    label: 'Mobility',
    icon: '🔒',
    color: 'text-blue-500',
    description: 'Movement restrictions'
  },
  inflammation: {
    id: 'inflammation',
    label: 'Inflammation',
    icon: '🟣',
    color: 'text-purple-500',
    description: 'Swelling and inflammation'
  }
};
```

#### 2. Dexie Schema Migration

**File:** `src/lib/db/database.ts`

```typescript
import Dexie, { Table } from 'dexie';

class SymptomTrackerDB extends Dexie {
  bodyMapLocations!: Table<BodyMapLocationRecord>;
  bodyMapPreferences!: Table<BodyMapPreferences>; // NEW

  constructor() {
    super('symptom-tracker');

    // PREVIOUS VERSION (example: version 3)
    this.version(3).stores({
      bodyMapLocations: 'id, userId, [userId+bodyRegionId], [userId+timestamp]',
      // ... other tables
    });

    // NEW VERSION 4: Add layer field and preferences table
    this.version(4).stores({
      bodyMapLocations: 'id, userId, [userId+bodyRegionId], [userId+timestamp], [userId+layer+timestamp]',
      bodyMapPreferences: 'userId', // NEW TABLE
      // ... other tables unchanged
    }).upgrade(async (trans) => {
      // Backward compatibility: assign existing markers to 'flares' layer
      await trans.table('bodyMapLocations').toCollection().modify(marker => {
        if (!marker.layer) {
          marker.layer = 'flares';
        }
      });
    });
  }
}

export const db = new SymptomTrackerDB();
```

**Index Strategy:**
- Compound index `[userId+layer+timestamp]` enables efficient layer-filtered queries
- Maintains existing indexes for backward compatibility

#### 3. Migration Safety

**Testing Requirements (Story 5.1 AC #7):**
```typescript
// __tests__/db/migration-v4.test.ts
describe('Schema v4 Migration', () => {
  it('should migrate existing markers to flares layer', async () => {
    // Setup: Create markers in v3 schema (no layer field)
    // Execute: Upgrade to v4
    // Assert: All markers have layer='flares'
    // Assert: No data loss occurred
  });

  it('should support layer-filtered queries', async () => {
    // Assert: Query by userId+layer returns correct subset
  });
});
```

---

### Story 5.2: Preferences Table

#### New Table: bodyMapPreferences

```typescript
export interface BodyMapPreferences {
  userId: string;           // Primary key
  lastUsedLayer: LayerType; // Default: 'flares'
  visibleLayers: LayerType[]; // Default: ['flares']
  defaultViewMode: 'single' | 'all'; // Default: 'single'
  updatedAt: number;        // Timestamp
}

// Default preferences for new users
export const DEFAULT_BODY_MAP_PREFERENCES: Omit<BodyMapPreferences, 'userId'> = {
  lastUsedLayer: 'flares',
  visibleLayers: ['flares'],
  defaultViewMode: 'single',
  updatedAt: Date.now()
};
```

#### Repository Pattern

**File:** `src/lib/repositories/bodyMapPreferencesRepository.ts`

```typescript
import { db } from '@/lib/db/database';
import { BodyMapPreferences, DEFAULT_BODY_MAP_PREFERENCES } from '@/lib/db/schema';

export class BodyMapPreferencesRepository {
  async get(userId: string): Promise<BodyMapPreferences> {
    const prefs = await db.bodyMapPreferences.get(userId);

    if (!prefs) {
      // Initialize defaults for new users
      const defaultPrefs: BodyMapPreferences = {
        userId,
        ...DEFAULT_BODY_MAP_PREFERENCES
      };
      await db.bodyMapPreferences.add(defaultPrefs);
      return defaultPrefs;
    }

    return prefs;
  }

  async setLastUsedLayer(userId: string, layer: LayerType): Promise<void> {
    await db.bodyMapPreferences.update(userId, {
      lastUsedLayer: layer,
      updatedAt: Date.now()
    });
  }

  async setVisibleLayers(userId: string, layers: LayerType[]): Promise<void> {
    await db.bodyMapPreferences.update(userId, {
      visibleLayers: layers,
      updatedAt: Date.now()
    });
  }

  async setViewMode(userId: string, mode: 'single' | 'all'): Promise<void> {
    await db.bodyMapPreferences.update(userId, {
      defaultViewMode: mode,
      updatedAt: Date.now()
    });
  }
}

export const bodyMapPreferencesRepository = new BodyMapPreferencesRepository();
```

---

## Component Architecture

### Story 5.3: LayerSelector Component

**File:** `src/components/body-map/LayerSelector.tsx`

**Purpose:** Allow users to switch the active layer for tracking mode

**Props Interface:**
```typescript
interface LayerSelectorProps {
  currentLayer: LayerType;
  onLayerChange: (layer: LayerType) => void;
  disabled?: boolean;
  lastUsedLayer?: LayerType;
}
```

**UI Design:**
- Dropdown/tab interface showing all 4 layers
- Each option displays: Icon + Label (e.g., "🔥 Flares")
- "Last used" badge when applicable
- Mobile-optimized (44x44px minimum touch targets)
- Keyboard navigation support

**Accessibility Requirements:**
- ARIA labels: "Layer selector. Current: Flares"
- Keyboard nav: Tab to focus, Arrow keys to navigate, Enter to select
- Screen reader announcement: "[Layer] selected"

**Implementation Pattern:**
```typescript
export function LayerSelector({
  currentLayer,
  onLayerChange,
  disabled = false,
  lastUsedLayer
}: LayerSelectorProps) {
  const handleLayerChange = (layer: LayerType) => {
    onLayerChange(layer);
    // Optimistic UI update - preference persists in hook
  };

  return (
    <div role="radiogroup" aria-label="Layer selector">
      {Object.values(LAYER_CONFIG).map(layer => (
        <button
          key={layer.id}
          role="radio"
          aria-checked={currentLayer === layer.id}
          onClick={() => handleLayerChange(layer.id)}
          disabled={disabled}
          className={cn(
            "min-h-[44px] min-w-[44px]", // Touch target
            currentLayer === layer.id && "ring-2 ring-primary"
          )}
        >
          <span className="text-2xl">{layer.icon}</span>
          <span className={layer.color}>{layer.label}</span>
          {lastUsedLayer === layer.id && (
            <Badge>Last used</Badge>
          )}
        </button>
      ))}
    </div>
  );
}
```

---

### Story 5.4: Layer-Aware Marker Rendering

**File:** `src/components/body-map/markers/BodyMapMarker.tsx`

**Purpose:** Render markers with layer-specific styling

**Visual Specifications:**

| Layer | Icon | Base Color | Opacity Rules |
|-------|------|------------|---------------|
| Flares | 🔥 | Red/Orange | < 7 days: 100%, 7-30 days: 70%, > 30 days: 50% |
| Pain | ⚡ | Yellow/Amber | Same opacity rules |
| Mobility | 🔒 | Blue | Same opacity rules |
| Inflammation | 🟣 | Purple | Same opacity rules |

**Size Scaling:**
- Severity 1-3: Small (16px)
- Severity 4-7: Medium (24px)
- Severity 8-10: Large (32px)
- Minimum touch target: 32px (transparent padding)

**Overlap Prevention:**
```typescript
// Smart offset algorithm for multiple markers at same location
function calculateMarkerOffset(
  markers: Marker[],
  currentIndex: number
): { x: number; y: number } {
  const radius = 8; // px offset from center
  const angle = (currentIndex / markers.length) * 2 * Math.PI;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}
```

**Performance Optimization:**
- Use `React.memo` to prevent unnecessary re-renders
- Virtualize markers outside viewport when > 50 markers
- Target: 60fps with all 4 layers visible

---

### Story 5.5: Multi-Layer View Controls

**File:** `src/components/body-map/LayerToggle.tsx`

**Purpose:** Toggle visibility of individual layers in multi-layer view

**Props Interface:**
```typescript
interface LayerToggleProps {
  visibleLayers: LayerType[];
  onToggleLayer: (layer: LayerType) => void;
  markerCounts: Record<LayerType, number>;
  viewMode: 'single' | 'all';
  onViewModeChange: (mode: 'single' | 'all') => void;
}
```

**UI Design:**
```
┌─────────────────────────────────────┐
│ View Mode: ⦿ Single   ○ All Layers │
├─────────────────────────────────────┤
│ ☑ 🔥 Flares (3)                     │
│ ☑ ⚡ Pain (5)                       │
│ ☐ 🔒 Mobility (0)                   │
│ ☑ 🟣 Inflammation (2)               │
└─────────────────────────────────────┘
```

**Keyboard Shortcuts:**
- `1`, `2`, `3`, `4`: Toggle layers 1-4
- `A`: Toggle "All Layers" view mode

**State Management:**
```typescript
// Visibility state separate from active layer
const [visibleLayers, setVisibleLayers] = useState<LayerType[]>(['flares']);

function toggleLayerVisibility(layer: LayerType) {
  setVisibleLayers(prev =>
    prev.includes(layer)
      ? prev.filter(l => l !== layer)
      : [...prev, layer]
  );
  // Persist to preferences
  bodyMapPreferencesRepository.setVisibleLayers(userId, updatedLayers);
}
```

---

### Story 5.6: Layer Legend

**File:** `src/components/body-map/LayerLegend.tsx`

**Purpose:** Provide clear visual guide to layer meanings

**Content:**
```typescript
const legendItems = visibleLayers.map(layerId => ({
  ...LAYER_CONFIG[layerId],
  count: markerCounts[layerId]
}));
```

**Mobile Optimization:**
- Collapsible to save space
- Fixed position at bottom of viewport
- Smooth expand/collapse animation

**Accessibility:**
- ARIA role: "region" with label "Layer legend"
- Screen reader: "Legend: Flares shown as red flame icons (3 markers), Pain shown as yellow lightning icons (5 markers)..."
- Tab navigation through legend items
- Enter to toggle layer visibility

---

## State Management

### Custom Hook: useBodyMapLayers

**File:** `src/lib/hooks/useBodyMapLayers.ts`

**Purpose:** Centralize layer state logic and preferences persistence

```typescript
export function useBodyMapLayers(userId: string) {
  const [currentLayer, setCurrentLayer] = useState<LayerType>('flares');
  const [visibleLayers, setVisibleLayers] = useState<LayerType[]>(['flares']);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      const prefs = await bodyMapPreferencesRepository.get(userId);
      setCurrentLayer(prefs.lastUsedLayer);
      setVisibleLayers(prefs.visibleLayers);
      setViewMode(prefs.defaultViewMode);
      setIsLoading(false);
    }
    void loadPreferences();
  }, [userId]);

  // Persist layer changes
  const changeLayer = useCallback(async (layer: LayerType) => {
    setCurrentLayer(layer);
    await bodyMapPreferencesRepository.setLastUsedLayer(userId, layer);
  }, [userId]);

  // Persist visibility changes
  const toggleLayerVisibility = useCallback(async (layer: LayerType) => {
    setVisibleLayers(prev => {
      const updated = prev.includes(layer)
        ? prev.filter(l => l !== layer)
        : [...prev, layer];

      // Persist (fire-and-forget, optimistic UI)
      void bodyMapPreferencesRepository.setVisibleLayers(userId, updated);

      return updated;
    });
  }, [userId]);

  // Persist view mode changes
  const changeViewMode = useCallback(async (mode: 'single' | 'all') => {
    setViewMode(mode);
    await bodyMapPreferencesRepository.setViewMode(userId, mode);
  }, [userId]);

  // Get markers for current view
  const getVisibleMarkers = useCallback(async () => {
    const layersToShow = viewMode === 'single' ? [currentLayer] : visibleLayers;

    const markers = await Promise.all(
      layersToShow.map(layer =>
        db.bodyMapLocations
          .where('[userId+layer+timestamp]')
          .between([userId, layer, 0], [userId, layer, Date.now()])
          .toArray()
      )
    );

    return markers.flat();
  }, [userId, currentLayer, visibleLayers, viewMode]);

  return {
    currentLayer,
    visibleLayers,
    viewMode,
    isLoading,
    changeLayer,
    toggleLayerVisibility,
    changeViewMode,
    getVisibleMarkers
  };
}
```

---

## Repository Extensions

### Extended: bodyMapRepository

**File:** `src/lib/repositories/bodyMapRepository.ts`

**New Methods:**

```typescript
class BodyMapRepository {
  // Existing methods...

  // NEW: Layer-filtered queries
  async getMarkersByLayer(
    userId: string,
    layer: LayerType,
    options?: { limit?: number; startTime?: number; endTime?: number }
  ): Promise<BodyMapLocationRecord[]> {
    let query = db.bodyMapLocations
      .where('[userId+layer+timestamp]')
      .between(
        [userId, layer, options?.startTime ?? 0],
        [userId, layer, options?.endTime ?? Date.now()]
      );

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query.toArray();
  }

  // NEW: Multi-layer retrieval
  async getMarkersByLayers(
    userId: string,
    layers: LayerType[],
    options?: { limit?: number; startTime?: number; endTime?: number }
  ): Promise<BodyMapLocationRecord[]> {
    const results = await Promise.all(
      layers.map(layer => this.getMarkersByLayer(userId, layer, options))
    );

    return results
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  }

  // NEW: Count markers per layer
  async getMarkerCountsByLayer(userId: string): Promise<Record<LayerType, number>> {
    const counts: Record<LayerType, number> = {
      flares: 0,
      pain: 0,
      mobility: 0,
      inflammation: 0
    };

    for (const layer of Object.keys(counts) as LayerType[]) {
      counts[layer] = await db.bodyMapLocations
        .where('[userId+layer+timestamp]')
        .between([userId, layer, 0], [userId, layer, Date.now()])
        .count();
    }

    return counts;
  }
}
```

---

## Performance Considerations

### NFR001: Response Time < 100ms

**Optimization Strategies:**

1. **Indexed Queries:**
   - Compound index `[userId+layer+timestamp]` enables O(log n) layer lookups
   - Avoid full table scans

2. **Marker Virtualization:**
   ```typescript
   // When > 50 markers visible, use react-window or similar
   const shouldVirtualize = markers.length > 50;
   ```

3. **Memoization:**
   ```typescript
   const MarkerComponent = React.memo(BodyMapMarker, (prev, next) => {
     return prev.id === next.id &&
            prev.layer === next.layer &&
            prev.severity === next.severity;
   });
   ```

4. **Debounce Layer Switches:**
   ```typescript
   const debouncedLayerChange = useMemo(
     () => debounce(changeLayer, 100),
     [changeLayer]
   );
   ```

### NFR002: Offline-First Persistence

**Requirements:**
- Layer preference changes persist immediately to IndexedDB
- No server roundtrip required
- Changes survive page reload/browser restart

**Implementation:**
- All preference updates use `await` to ensure write completion
- Optimistic UI updates for perceived performance
- Error handling with rollback on write failure

---

## Testing Strategy

### Unit Tests (Required per Story)

**Story 5.1 Tests:**
```typescript
// schema.test.ts
describe('LayerType', () => {
  it('should export valid layer types', () => {
    const validLayers: LayerType[] = ['flares', 'pain', 'mobility', 'inflammation'];
    validLayers.forEach(layer => {
      expect(LAYER_CONFIG[layer]).toBeDefined();
    });
  });
});

// migration.test.ts
describe('Schema v4 Migration', () => {
  it('should add layer field to existing markers', async () => {
    // Test migration logic
  });

  it('should create compound index for layer queries', async () => {
    // Verify index exists
  });
});
```

**Story 5.2 Tests:**
```typescript
// bodyMapPreferencesRepository.test.ts
describe('BodyMapPreferencesRepository', () => {
  it('should create default preferences for new users', async () => {
    const prefs = await repo.get('user123');
    expect(prefs.lastUsedLayer).toBe('flares');
  });

  it('should persist layer changes', async () => {
    await repo.setLastUsedLayer('user123', 'pain');
    const prefs = await repo.get('user123');
    expect(prefs.lastUsedLayer).toBe('pain');
  });
});
```

**Story 5.3-5.6 Tests:**
```typescript
// Component tests using React Testing Library
describe('LayerSelector', () => {
  it('should render all layer options', () => {
    render(<LayerSelector currentLayer="flares" onLayerChange={jest.fn()} />);
    expect(screen.getByText('Flares')).toBeInTheDocument();
    expect(screen.getByText('Pain')).toBeInTheDocument();
    // ... etc
  });

  it('should call onLayerChange when option clicked', () => {
    const handleChange = jest.fn();
    render(<LayerSelector currentLayer="flares" onLayerChange={handleChange} />);

    fireEvent.click(screen.getByText('Pain'));
    expect(handleChange).toHaveBeenCalledWith('pain');
  });
});
```

### Integration Tests

**Multi-Layer Rendering:**
```typescript
describe('Multi-Layer Body Map', () => {
  it('should render markers from multiple layers simultaneously', async () => {
    // Setup: Create markers in different layers
    await createMarker({ layer: 'flares', severity: 8 });
    await createMarker({ layer: 'pain', severity: 5 });

    // Render with multi-layer view
    render(<BodyMap viewMode="all" visibleLayers={['flares', 'pain']} />);

    // Assert: Both markers visible
    expect(screen.getByTestId('marker-flares-1')).toBeInTheDocument();
    expect(screen.getByTestId('marker-pain-1')).toBeInTheDocument();
  });

  it('should filter markers when layer visibility toggled', async () => {
    // Test layer toggle functionality
  });
});
```

### Performance Tests

**Marker Rendering Performance:**
```typescript
describe('Performance: Marker Rendering', () => {
  it('should render 50+ markers without lag', async () => {
    // Create 60 markers across layers
    const markers = Array.from({ length: 60 }, (_, i) => ({
      layer: ['flares', 'pain'][i % 2] as LayerType,
      severity: (i % 10) + 1
    }));

    const start = performance.now();
    render(<BodyMap markers={markers} viewMode="all" />);
    const renderTime = performance.now() - start;

    // Target: < 100ms render time (NFR001)
    expect(renderTime).toBeLessThan(100);
  });
});
```

---

## Story Implementation Sequence

### Story 5.1: Data Model & Schema Migration (3 pts)
**Dependencies:** None (foundation story)
**Deliverables:**
- LayerType type definition
- LAYER_CONFIG metadata
- Schema v4 migration script
- Compound index on [userId+layer+timestamp]
- Migration tests

### Story 5.2: Layer Preferences (2 pts)
**Dependencies:** Story 5.1 (schema v4)
**Deliverables:**
- BodyMapPreferences interface
- bodyMapPreferences table
- BodyMapPreferencesRepository
- Default preferences logic
- Repository tests

### Story 5.3: Layer Selector UI (3 pts)
**Dependencies:** Story 5.2 (preferences exist)
**Deliverables:**
- LayerSelector component
- Keyboard navigation
- Accessibility features
- Integration with preferences
- Component tests

### Story 5.4: Layer-Aware Rendering (5 pts)
**Dependencies:** Story 5.3 (layer selection works)
**Deliverables:**
- Refactored BodyMapMarker component
- Layer-specific styling (colors, icons)
- Opacity based on recency
- Smart overlap prevention
- Performance optimization
- Rendering tests

### Story 5.5: Multi-Layer Controls (5 pts)
**Dependencies:** Story 5.4 (markers render correctly)
**Deliverables:**
- LayerToggle component
- View mode selector (single/all)
- Keyboard shortcuts (1-4, A)
- Visibility state management
- Multi-layer integration tests

### Story 5.6: Layer Legend (3 pts)
**Dependencies:** Story 5.5 (multi-layer view works)
**Deliverables:**
- LayerLegend component
- Auto-updating based on visible layers
- Collapsible mobile design
- Accessibility features
- Legend tests

---

## File Checklist

### New Files to Create

#### Data Layer
- [ ] `src/lib/db/schema.ts` - Add LayerType, LAYER_CONFIG
- [ ] `src/lib/db/database.ts` - Schema v4 migration
- [ ] `src/lib/repositories/bodyMapPreferencesRepository.ts`
- [ ] `src/lib/repositories/bodyMapRepository.ts` - Extend with layer methods

#### Component Layer
- [ ] `src/components/body-map/LayerSelector.tsx`
- [ ] `src/components/body-map/LayerToggle.tsx`
- [ ] `src/components/body-map/LayerLegend.tsx`
- [ ] `src/components/body-map/markers/BodyMapMarker.tsx` - Refactor

#### Hooks
- [ ] `src/lib/hooks/useBodyMapLayers.ts`

#### Tests
- [ ] `src/lib/db/__tests__/migration-v4.test.ts`
- [ ] `src/lib/repositories/__tests__/bodyMapPreferencesRepository.test.ts`
- [ ] `src/components/body-map/__tests__/LayerSelector.test.tsx`
- [ ] `src/components/body-map/__tests__/LayerToggle.test.tsx`
- [ ] `src/components/body-map/__tests__/LayerLegend.test.tsx`
- [ ] `src/components/body-map/__tests__/multi-layer-integration.test.tsx`

---

## Integration Points with Existing System

### Existing Components to Update

**BodyMapInteractive.tsx:**
```typescript
// Add layer controls
import { LayerSelector } from './LayerSelector';
import { LayerToggle } from './LayerToggle';
import { LayerLegend } from './LayerLegend';
import { useBodyMapLayers } from '@/lib/hooks/useBodyMapLayers';

export function BodyMapInteractive({ userId }: Props) {
  const {
    currentLayer,
    visibleLayers,
    viewMode,
    changeLayer,
    toggleLayerVisibility,
    changeViewMode,
    getVisibleMarkers
  } = useBodyMapLayers(userId);

  // Existing body map logic...

  return (
    <div>
      <LayerSelector
        currentLayer={currentLayer}
        onLayerChange={changeLayer}
      />

      {viewMode === 'all' && (
        <LayerToggle
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayerVisibility}
          viewMode={viewMode}
          onViewModeChange={changeViewMode}
        />
      )}

      {/* Existing body map SVG */}
      <BodyMapSVG markers={markers} />

      <LayerLegend visibleLayers={visibleLayers} />
    </div>
  );
}
```

### Flare Creation Flow Update

**When creating new markers, include layer:**
```typescript
async function createBodyMapMarker(data: {
  bodyRegionId: string;
  coordinates?: { x: number; y: number };
  severity: number;
  layer: LayerType; // ← NEW: Get from currentLayer state
}) {
  await bodyMapRepository.create({
    ...data,
    userId,
    timestamp: Date.now()
  });
}
```

---

## Backward Compatibility

**Critical Requirement:** Epic 5 must not break existing functionality

### Migration Guarantees

1. **Existing Flare Data:**
   - All existing bodyMapLocations records automatically get `layer: 'flares'`
   - No user data loss
   - Queries without layer filter still work

2. **Existing Queries:**
   - Old queries (without layer filter) remain functional
   - Gradual migration to layer-aware queries

3. **UI Fallbacks:**
   - If preferences table doesn't exist, use defaults
   - Single-layer mode works independently of multi-layer features

### Testing Backward Compatibility

```typescript
describe('Backward Compatibility', () => {
  it('should handle markers created before layer field existed', async () => {
    // Create marker without layer field (simulating old data)
    const oldMarker = { /* no layer field */ };

    // Migration should add layer: 'flares'
    const migrated = await db.bodyMapLocations.get(oldMarker.id);
    expect(migrated.layer).toBe('flares');
  });
});
```

---

## Risk Mitigation

### Technical Risks

**Risk 1: Performance degradation with 50+ markers**
- **Mitigation:** Virtualization, memoization, indexed queries
- **Fallback:** Limit to 100 markers per layer in UI

**Risk 2: Schema migration failure**
- **Mitigation:** Comprehensive migration tests
- **Fallback:** Dexie error handling, rollback mechanism

**Risk 3: Complex multi-layer overlap**
- **Mitigation:** Smart offset algorithm
- **Fallback:** Simple stacking with z-index

### UX Risks

**Risk 1: User confusion about layers**
- **Mitigation:** Clear legend, help tooltips
- **Fallback:** Default to single-layer mode

**Risk 2: Accidental layer switches**
- **Mitigation:** Visual confirmation, persistence
- **Fallback:** Undo mechanism (future story)

---

## Success Criteria

### Functional Success
- ✅ All 6 stories complete with tests passing
- ✅ Users can switch between 4 layers seamlessly
- ✅ Multi-layer view displays all enabled layers
- ✅ Preferences persist across sessions
- ✅ Zero data loss during migration

### Performance Success
- ✅ Layer switch response < 100ms
- ✅ Marker rendering maintains 60fps
- ✅ 50+ markers render without lag

### UX Success
- ✅ WCAG AA accessibility compliance
- ✅ Mobile touch targets ≥ 44x44px
- ✅ Keyboard navigation fully functional
- ✅ Screen reader compatible

---

## Next Steps After Epic 5

**Recommended Follow-Up:**
1. **Analytics per Layer** - Extend Epic 3 analytics to support layer-filtered views
2. **Layer-Specific Exports** - Export data for specific layers
3. **Custom Layer Creation** - Allow users to define custom tracking layers
4. **Layer Correlations** - Identify correlations between layer types (e.g., flares → pain)

---

_This technical specification is ready for implementation. Each story can be developed independently following the sequence outlined above._

_Generated by Winston (Architect) for Epic 5: Body Map Multi-Layer Enhancement_
