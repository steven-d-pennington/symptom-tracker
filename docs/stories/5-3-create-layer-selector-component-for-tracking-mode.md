# Story 5.3: Create Layer Selector Component for Tracking Mode

Status: review

## Story

As a user tracking different condition types,
I want to select which layer I'm logging to before marking body regions,
so that my data is categorized correctly without extra steps.

## Acceptance Criteria

1. **AC5.3.1 — LayerSelector component with dropdown/tab interface:** New LayerSelector component created with props: currentLayer, onLayerChange, disabled, lastUsedLayer. Component displays all available layers with visual selection indicator showing active layer. [Source: docs/epics.md#Story-5.3, docs/epic-5-tech-spec.md#LayerSelector-Component]

2. **AC5.3.2 — Layer options with icons and labels:** Component displays 3 layer options: Flares (🔥 red), Pain (⚡ yellow), Inflammation (🟣 purple). Each option shows icon + label using LAYER_CONFIG from Story 5.1. Visual design supports both light and dark themes. [Source: docs/epic-5-tech-spec.md#UI-Design]

3. **AC5.3.3 — Immediate optimistic UI update:** Layer selection updates immediately when user clicks option (no loading delay). Component calls onLayerChange callback which updates parent state optimistically. Persistence happens asynchronously via preference repository without blocking UI. [Source: docs/epics.md#Story-5.3]

4. **AC5.3.4 — Last-used layer badge:** When lastUsedLayer prop provided and differs from currentLayer, display "Last used" badge on that layer option. Badge provides visual context helping users return to their preferred layer quickly. [Source: docs/epics.md#Story-5.3]

5. **AC5.3.5 — Prominent positioning in body map interface:** LayerSelector positioned above body map diagram in tracking mode interface. Placement ensures users see layer selection before marking regions. Responsive layout maintains visibility on mobile and desktop. [Source: docs/epics.md#Story-5.3]

6. **AC5.3.6 — Mobile-optimized touch targets:** All layer option buttons meet NFR001 minimum 44x44px touch target size. Spacing between options prevents accidental taps. Thumb-friendly positioning for one-handed mobile use. [Source: docs/epics.md#Story-5.3, NFR001]

7. **AC5.3.7 — Keyboard navigation support:** Component implements full keyboard accessibility: Tab key focuses selector, Arrow keys navigate between layer options, Enter/Space selects focused option. Visual focus indicator clearly shows which option has keyboard focus. [Source: docs/epics.md#Story-5.3]

8. **AC5.3.8 — Integration with preference repository:** Layer changes call bodyMapPreferencesRepository.setLastUsedLayer(userId, layer) from Story 5.2. Persistence fires asynchronously (fire-and-forget pattern). Parent component manages userId context. [Source: docs/epics.md#Story-5.3]

9. **AC5.3.9 — Screen reader announcements:** Component uses proper ARIA attributes: role="radiogroup", aria-label="Layer selector", aria-checked on active option. Layer selection announces: "[Layer name] layer selected" via ARIA live region. Meets WCAG 2.1 Level AA standards. [Source: docs/epics.md#Story-5.3]

## Tasks / Subtasks

- [x] Task 1: Create LayerSelector component structure (AC: #5.3.1, #5.3.2)
  - [x] 1.1: Create `src/components/body-map/LayerSelector.tsx`
  - [x] 1.2: Define LayerSelectorProps interface with required props
  - [x] 1.3: Import LAYER_CONFIG from schema.ts (Story 5.1)
  - [x] 1.4: Map over LAYER_CONFIG to generate layer option buttons
  - [x] 1.5: Display icon and label for each layer option
  - [x] 1.6: Add visual indicator for currentLayer (ring/border/background)
  - [x] 1.7: Apply Tailwind styling for light/dark theme support

- [x] Task 2: Implement layer selection logic (AC: #5.3.3, #5.3.8)
  - [x] 2.1: Add onClick handler to layer option buttons
  - [x] 2.2: Call onLayerChange(layer) on click
  - [x] 2.3: Ensure disabled prop prevents selection when true
  - [x] 2.4: Implement optimistic UI update (no loading spinner)
  - [x] 2.5: Add console logging for debugging (removable later)

- [x] Task 3: Add last-used layer badge (AC: #5.3.4)
  - [x] 3.1: Check if lastUsedLayer prop provided
  - [x] 3.2: Compare lastUsedLayer with currentLayer
  - [x] 3.3: If different, render inline badge on lastUsedLayer option
  - [x] 3.4: Badge displays "Last" text
  - [x] 3.5: Style badge to be visually distinct but not distracting

- [x] Task 4: Mobile optimization (AC: #5.3.6)
  - [x] 4.1: Set min-h-[44px] min-w-[44px] on all option buttons
  - [x] 4.2: Add appropriate padding for comfortable tapping
  - [x] 4.3: Test touch target size via unit tests
  - [x] 4.4: Add spacing between options (gap-2)
  - [x] 4.5: Responsive flex-wrap for mobile layouts

- [x] Task 5: Keyboard navigation (AC: #5.3.7)
  - [x] 5.1: Add tabIndex management for focus control
  - [x] 5.2: Implement onKeyDown handler for Arrow keys
  - [x] 5.3: Arrow keys cycle focus through layer options
  - [x] 5.4: Enter/Space keys trigger layer selection
  - [x] 5.5: Add visual focus indicator (ring-2 on focus)
  - [x] 5.6: Test keyboard navigation flow in tests
  - [x] 5.7: Ensure focus wraps around correctly

- [x] Task 6: Accessibility (AC: #5.3.9)
  - [x] 6.1: Add role="radiogroup" to component wrapper
  - [x] 6.2: Add aria-label="Layer selector" to wrapper
  - [x] 6.3: Add role="radio" to each layer option button
  - [x] 6.4: Set aria-checked={currentLayer === layer.id} on options
  - [x] 6.5: Create aria-live region for selection announcements
  - [x] 6.6: Update live region text when layer changes
  - [x] 6.7: Test ARIA attributes via unit tests (26 tests passing)

- [x] Task 7: Create useBodyMapLayers hook (AC: #5.3.5, #5.3.8)
  - [x] 7.1: Create `src/lib/hooks/useBodyMapLayers.ts`
  - [x] 7.2: Load preferences on mount from repository
  - [x] 7.3: Implement changeLayer with optimistic updates
  - [x] 7.4: Call bodyMapPreferencesRepository.setLastUsedLayer
  - [x] 7.5: Return currentLayer, lastUsedLayer, changeLayer, isLoading
  - [x] 7.6: Handle userId null/undefined gracefully

- [x] Task 8: Component unit tests (AC: All)
  - [x] 8.1: Create `src/components/body-map/__tests__/LayerSelector.test.tsx`
  - [x] 8.2: Write test: "renders all layer options" ✅
  - [x] 8.3: Write test: "highlights current layer" ✅
  - [x] 8.4: Write test: "calls onLayerChange when option clicked" ✅
  - [x] 8.5: Write test: "displays last-used badge correctly" ✅
  - [x] 8.6: Write test: "disables selection when disabled=true" ✅
  - [x] 8.7: Write test: "keyboard navigation works" ✅
  - [x] 8.8: Write test: "screen reader attributes present" ✅
  - [x] 8.9: Write test: "touch targets meet 44x44px minimum" ✅
  - [x] 8.10: All 26 tests passing

- [x] Task 9: Visual design and polish (AC: All)
  - [x] 9.1: Component supports light and dark themes via Tailwind
  - [x] 9.2: Responsive flex-wrap layout for all viewport sizes
  - [x] 9.3: Consistent design with LAYER_CONFIG colors
  - [x] 9.4: Hover, active, focus states implemented
  - [x] 9.5: Color contrast meets WCAG AA (using Tailwind defaults)
  - [x] 9.6: Smooth transitions on all interactive states
  - [x] 9.7: Component ready for integration with body map

## Dev Notes

### Technical Architecture

This story creates the first UI component for Epic 5's multi-layer system. The LayerSelector provides the primary interface for users to switch between tracking different body-area conditions (flares, pain, inflammation).

**Key Architecture Points:**
- **Controlled Component:** Parent manages currentLayer state, component is presentational
- **Separation of Concerns:** Selection logic in parent, display logic in component
- **Accessibility-First:** ARIA attributes and keyboard navigation baked in from start
- **Mobile-Optimized:** Touch targets and responsive design prioritized

### Learnings from Previous Story

**From Story 5-2-implement-layer-preferences-and-persistence (Status: drafted)**

- **Preference Repository Pattern:** Story 5.2 created bodyMapPreferencesRepository with setLastUsedLayer() method. LayerSelector will call this method when user changes layers.

- **Optimistic UI Pattern:** Preference persistence is fire-and-forget async. UI updates immediately, don't wait for IndexedDB write to complete.

- **Default Layer:** New users start with layer='flares' (from DEFAULT_BODY_MAP_PREFERENCES). LayerSelector should handle this gracefully on first load.

- **User Context Required:** Repository methods need userId. Parent component must provide userId from app auth context.

- **Error Handling:** Repository logs errors but doesn't throw. LayerSelector doesn't need try-catch for preference calls.

- **Key Pattern for This Story:** Optimistic UI update + async persistence = responsive feel. Apply same pattern: call onLayerChange immediately, let parent handle persistence.

[Source: stories/5-2-implement-layer-preferences-and-persistence.md#Dev-Notes]

### Project Structure Notes

**Files to Create:**
```
src/components/body-map/
  ├── LayerSelector.tsx (NEW - main component)
  └── __tests__/
      └── LayerSelector.test.tsx (NEW - component tests)
```

**Files to Modify:**
```
src/app/(protected)/body-map/page.tsx (or similar)
  - Import and render LayerSelector
  - Wire up layer state and persistence
```

### Component Props Interface

**LayerSelectorProps:**
```typescript
interface LayerSelectorProps {
  currentLayer: LayerType;           // Active layer (from parent state)
  onLayerChange: (layer: LayerType) => void; // Callback when user selects
  disabled?: boolean;                // Disable selection (loading states)
  lastUsedLayer?: LayerType;         // Show "Last used" badge
}
```

### Component Implementation Pattern

**LayerSelector Component Structure:**
```typescript
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function LayerSelector({
  currentLayer,
  onLayerChange,
  disabled = false,
  lastUsedLayer
}: LayerSelectorProps) {
  const handleLayerChange = (layer: LayerType) => {
    if (!disabled) {
      onLayerChange(layer);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Implement arrow key navigation
    // Enter/Space to select
  };

  return (
    <div
      role="radiogroup"
      aria-label="Layer selector"
      className="flex gap-2"
      onKeyDown={handleKeyDown}
    >
      {Object.values(LAYER_CONFIG).map(layer => (
        <button
          key={layer.id}
          role="radio"
          aria-checked={currentLayer === layer.id}
          onClick={() => handleLayerChange(layer.id)}
          disabled={disabled}
          className={cn(
            "min-h-[44px] min-w-[44px] p-3 rounded-lg border-2 transition-all",
            "flex flex-col items-center justify-center gap-1",
            currentLayer === layer.id && "ring-2 ring-primary bg-primary/10",
            disabled && "opacity-50 cursor-not-allowed",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        >
          <span className="text-2xl">{layer.icon}</span>
          <span className={cn("text-xs font-medium", layer.color)}>
            {layer.label}
          </span>
          {lastUsedLayer === layer.id && lastUsedLayer !== currentLayer && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Last used
            </Badge>
          )}
        </button>
      ))}

      {/* ARIA live region for screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {LAYER_CONFIG[currentLayer].label} layer selected
      </div>
    </div>
  );
}
```

### Integration with Body Map

**Parent Component Pattern:**
```typescript
// In body map page or component
import { LayerSelector } from '@/components/body-map/LayerSelector';
import { useBodyMapLayers } from '@/lib/hooks/useBodyMapLayers';
import { useUser } from '@/lib/hooks/useUser';

export function BodyMapPage() {
  const { userId } = useUser();
  const {
    currentLayer,
    changeLayer,
    isLoading
  } = useBodyMapLayers(userId);

  // changeLayer already handles preference persistence
  // (implemented in useBodyMapLayers hook)

  return (
    <div>
      <LayerSelector
        currentLayer={currentLayer}
        onLayerChange={changeLayer}
        disabled={isLoading}
        lastUsedLayer={/* from preferences if needed */}
      />

      {/* Body map diagram below */}
    </div>
  );
}
```

### Custom Hook Pattern (Recommended)

**useBodyMapLayers Hook (Story 5.2 setup):**
```typescript
// In src/lib/hooks/useBodyMapLayers.ts
import { useState, useEffect, useCallback } from 'react';
import { LayerType } from '@/lib/db/schema';
import { bodyMapPreferencesRepository } from '@/lib/repositories/bodyMapPreferencesRepository';

export function useBodyMapLayers(userId: string) {
  const [currentLayer, setCurrentLayer] = useState<LayerType>('flares');
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      const prefs = await bodyMapPreferencesRepository.get(userId);
      setCurrentLayer(prefs.lastUsedLayer);
      setIsLoading(false);
    }
    void loadPreferences();
  }, [userId]);

  // Change layer with persistence
  const changeLayer = useCallback(async (layer: LayerType) => {
    setCurrentLayer(layer); // Optimistic update
    await bodyMapPreferencesRepository.setLastUsedLayer(userId, layer);
  }, [userId]);

  return {
    currentLayer,
    changeLayer,
    isLoading
  };
}
```

### Testing Strategy

**Component Tests:**
```typescript
// __tests__/LayerSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerSelector } from '../LayerSelector';

describe('LayerSelector', () => {
  it('should render all layer options', () => {
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={jest.fn()}
      />
    );

    expect(screen.getByText('Flares')).toBeInTheDocument();
    expect(screen.getByText('Pain')).toBeInTheDocument();
    expect(screen.getByText('Inflammation')).toBeInTheDocument();
  });

  it('should highlight current layer', () => {
    render(
      <LayerSelector
        currentLayer="pain"
        onLayerChange={jest.fn()}
      />
    );

    const painButton = screen.getByRole('radio', { name: /pain/i });
    expect(painButton).toHaveAttribute('aria-checked', 'true');
  });

  it('should call onLayerChange when option clicked', () => {
    const handleChange = jest.fn();
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={handleChange}
      />
    );

    fireEvent.click(screen.getByText('Pain'));
    expect(handleChange).toHaveBeenCalledWith('pain');
  });

  it('should display last-used badge', () => {
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={jest.fn()}
        lastUsedLayer="pain"
      />
    );

    expect(screen.getByText('Last used')).toBeInTheDocument();
  });

  it('should prevent selection when disabled', () => {
    const handleChange = jest.fn();
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={handleChange}
        disabled={true}
      />
    );

    fireEvent.click(screen.getByText('Pain'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should support keyboard navigation', () => {
    const handleChange = jest.fn();
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={handleChange}
      />
    );

    const selector = screen.getByRole('radiogroup');
    fireEvent.keyDown(selector, { key: 'ArrowRight' });
    fireEvent.keyDown(selector, { key: 'Enter' });

    // Should select next layer (pain)
    expect(handleChange).toHaveBeenCalledWith('pain');
  });

  it('should have proper ARIA attributes', () => {
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={jest.fn()}
      />
    );

    const radiogroup = screen.getByRole('radiogroup');
    expect(radiogroup).toHaveAttribute('aria-label', 'Layer selector');

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(3); // 3 layers
  });

  it('should meet 44x44px minimum touch target', () => {
    render(
      <LayerSelector
        currentLayer="flares"
        onLayerChange={jest.fn()}
      />
    );

    const buttons = screen.getAllByRole('radio');
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button);
      const minHeight = parseInt(styles.minHeight);
      const minWidth = parseInt(styles.minWidth);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });
  });
});
```

### References

- [Source: docs/epic-5-tech-spec.md#LayerSelector-Component] - Component design specification
- [Source: docs/epics.md#Story-5.3] - Story acceptance criteria
- [Source: stories/5-1-add-layer-field-to-data-model-and-indexeddb-schema.md] - LAYER_CONFIG source
- [Source: stories/5-2-implement-layer-preferences-and-persistence.md] - Preference repository
- [Source: WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards

### Integration Points

**This Story Enables:**
- Story 5.4: Layer-aware rendering uses currentLayer from selector
- Story 5.5: Multi-layer toggle works alongside single-layer selector
- User workflow: Select layer → Mark body regions → Data saved with correct layer

**Dependencies:**
- Story 5.1: LAYER_CONFIG must exist (layer metadata)
- Story 5.2: bodyMapPreferencesRepository for persistence
- UI component library: Badge component (or create simple version)

### Performance Considerations

**NFR001: Response Time < 100ms**
- Optimistic UI update: Layer selection feels instant
- Preference persistence async (fire-and-forget)
- No network calls required (offline-first)

**Optimization:**
- React.memo if re-renders become issue
- Keyboard handler debounce if rapid key presses cause lag

### Risk Mitigation

**Risk: Preference persistence fails silently**
- Mitigation: Repository logs errors to console
- User impact: Minimal - layer still works, just doesn't persist
- Fallback: Next session loads default layer

**Risk: Keyboard navigation conflicts with body map controls**
- Mitigation: Scoped keyboard handling in component
- Test with full body map interface integration

## Dev Agent Record

### Context Reference

- `docs/stories/5-3-create-layer-selector-component-for-tracking-mode.context.xml`

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

Implementation completed successfully following the dev-story workflow.

### Completion Notes List

**✅ Story 5.3 Implementation Complete**

**LayerSelector Component:**
- Created fully accessible radiogroup component with tab-like interface
- All 3 layers displayed with icons (🔥, ⚡, 🟣) and labels from LAYER_CONFIG
- Optimistic UI updates - no loading delays on selection
- Last-used badge displays on previously selected layer
- Full keyboard navigation (Arrow keys, Enter, Space)
- Complete ARIA implementation (role, aria-checked, aria-label, live region)
- Mobile-optimized 44x44px touch targets with proper spacing
- Light/dark theme support via Tailwind

**useBodyMapLayers Hook:**
- Custom hook for managing layer state and preferences
- Loads preferences from repository on mount
- Optimistic updates with fire-and-forget persistence
- Returns currentLayer, lastUsedLayer, changeLayer, isLoading
- Gracefully handles null userId

**Testing:**
- **26/26 unit tests passing** ✅
- Comprehensive test coverage:
  - Rendering and visual states
  - Click and selection logic
  - Last-used badge behavior
  - Disabled state handling
  - Full keyboard navigation
  - ARIA attributes and screen reader announcements
  - Touch target sizes
  - Theme support
  - Integration scenarios

**Key Implementation Details:**
- Controlled component pattern (parent manages state)
- Focus management with refs for keyboard navigation
- Live region for screen reader announcements
- Responsive flex-wrap layout
- Ring/border visual indicators for active state
- Smooth transitions on all interactive states

**Integration Ready:**
- Component exports LayerSelectorProps interface
- Hook provides plug-and-play state management
- Ready for body map page integration (Story 5.4 will use this)
- No breaking changes to existing code

**Next Steps:**
- Story 5.4 will integrate LayerSelector into body map tracking interface
- Story 5.4 will implement layer-aware marker rendering
- Full end-to-end testing will happen during integration

### File List

**New Files:**
- src/components/body-map/LayerSelector.tsx (185 lines)
- src/components/body-map/__tests__/LayerSelector.test.tsx (427 lines, 26 tests)
- src/lib/hooks/useBodyMapLayers.ts (97 lines)

**Modified Files:**
- docs/stories/5-3-create-layer-selector-component-for-tracking-mode.md (updated tasks and completion notes)
- docs/sprint-status.yaml (status: ready-for-dev → in-progress → review)
