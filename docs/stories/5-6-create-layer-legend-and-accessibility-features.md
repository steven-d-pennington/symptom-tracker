# Story 5.6: Create Layer Legend and Accessibility Features

Status: ready-for-dev

## Story

As a user viewing multi-layer body maps,
I want a clear legend explaining what each marker represents,
so that I can quickly interpret the visualization without confusion.

## Acceptance Criteria

1. **AC5.6.1 — LayerLegend component displays all layer types:** New LayerLegend component created showing icon, color, label, and brief description for each layer type. Uses LAYER_CONFIG from Story 5.1. Component props: visibleLayers (to show only active layers). [Source: docs/epics.md#Story-5.6, docs/epic-5-tech-spec.md#Layer-Legend]

2. **AC5.6.2 — Dynamic legend updates with visible layers:** Legend shows only currently visible layers in multi-layer view. Auto-updates when user toggles layer visibility in LayerToggle component. If single-layer mode, shows only current tracking layer. [Source: docs/epics.md#Story-5.6]

3. **AC5.6.3 — Responsive mobile design:** Legend positioned prominently but non-intrusively. Collapsible on mobile viewports to save screen space. Expand/collapse animation smooth (< 300ms). Default state: expanded on desktop, collapsed on mobile. [Source: docs/epics.md#Story-5.6]

4. **AC5.6.4 — Interactive legend items:** Each legend item clickable to toggle that layer's visibility (if in multi-layer mode). Click calls same onToggleLayer handler as LayerToggle checkboxes. Provides alternative interaction method. [Source: docs/epics.md#Story-5.6]

5. **AC5.6.5 — WCAG AA color contrast compliance:** All legend colors verified for WCAG 2.1 Level AA contrast ratios in both light and dark themes. Text meets 4.5:1 minimum contrast. Icons supplement color for colorblind accessibility. [Source: docs/epics.md#Story-5.6]

6. **AC5.6.6 — Screen reader support:** Legend has proper ARIA structure: role="region", aria-label="Layer legend", list semantics for items. Screen reader announces: "Legend: Flares shown as red flame icons (3 markers), Pain shown as yellow lightning icons (5 markers)..." [Source: docs/epics.md#Story-5.6]

7. **AC5.6.7 — Keyboard navigation:** Tab key navigates through legend items. Enter key toggles layer visibility (if interactive mode). Focus indicators clearly visible. Keyboard shortcuts from Story 5.5 work alongside legend. [Source: docs/epics.md#Story-5.6]

8. **AC5.6.8 — Help tooltip with layer system explanation:** Help icon/button near legend opens tooltip or popover explaining: "Layers separate different tracking types. Switch layers to log different conditions, or view all layers to see comprehensive patterns." Dismissible with ESC or click outside. [Source: docs/epics.md#Story-5.6]

9. **AC5.6.9 — Future integration point for medical exports:** Legend structure designed to support future screenshot export feature (Story 4.x). Legend included in body map screenshots for medical consultations. Note as integration point in documentation. [Source: docs/epics.md#Story-5.6]

## Tasks / Subtasks

- [ ] Task 1: Create LayerLegend component structure (AC: #5.6.1, #5.6.2)
  - [ ] 1.1: Create `src/components/body-map/LayerLegend.tsx`
  - [ ] 1.2: Define LayerLegendProps interface with visibleLayers
  - [ ] 1.3: Import LAYER_CONFIG from schema
  - [ ] 1.4: Filter LAYER_CONFIG by visibleLayers prop
  - [ ] 1.5: Map filtered layers to legend items
  - [ ] 1.6: Display icon, color, label, description for each layer
  - [ ] 1.7: Add optional marker count display per layer

- [ ] Task 2: Implement responsive collapsible design (AC: #5.6.3)
  - [ ] 2.1: Add expand/collapse button for mobile viewports
  - [ ] 2.2: Use CSS media queries or useMediaQuery hook
  - [ ] 2.3: Default expanded on desktop (>= 768px)
  - [ ] 2.4: Default collapsed on mobile (< 768px)
  - [ ] 2.5: Add smooth transition animation (< 300ms)
  - [ ] 2.6: Store collapse state in local component state
  - [ ] 2.7: Test responsive behavior across breakpoints

- [ ] Task 3: Make legend items interactive (AC: #5.6.4)
  - [ ] 3.1: Add onToggleLayer prop to component interface
  - [ ] 3.2: Make legend items clickable (button or interactive element)
  - [ ] 3.3: Call onToggleLayer(layerId) when item clicked
  - [ ] 3.4: Add visual feedback on hover (cursor, background)
  - [ ] 3.5: Only enable interactivity in multi-layer view mode
  - [ ] 3.6: Show checkmark or indicator for active layers
  - [ ] 3.7: Test click interactions on desktop and mobile

- [ ] Task 4: Verify color contrast compliance (AC: #5.6.5)
  - [ ] 4.1: Test legend colors in light theme with contrast checker
  - [ ] 4.2: Test legend colors in dark theme with contrast checker
  - [ ] 4.3: Verify text meets 4.5:1 minimum contrast (WCAG AA)
  - [ ] 4.4: Ensure icons visible and distinct without color
  - [ ] 4.5: Test with color blindness simulation tools
  - [ ] 4.6: Adjust colors if contrast insufficient
  - [ ] 4.7: Document contrast ratios in component

- [ ] Task 5: Implement screen reader support (AC: #5.6.6)
  - [ ] 5.1: Add role="region" to legend wrapper
  - [ ] 5.2: Add aria-label="Layer legend" to wrapper
  - [ ] 5.3: Use semantic list markup (<ul>, <li>)
  - [ ] 5.4: Add aria-label to each legend item with full description
  - [ ] 5.5: Create aria-live region for layer toggle announcements
  - [ ] 5.6: Test with screen reader (NVDA/JAWS/VoiceOver)
  - [ ] 5.7: Verify legend read correctly and in logical order

- [ ] Task 6: Add keyboard navigation (AC: #5.6.7)
  - [ ] 6.1: Make legend items keyboard focusable (tabIndex)
  - [ ] 6.2: Add onKeyDown handlers for Enter key (toggle)
  - [ ] 6.3: Add visible focus indicators (ring, outline)
  - [ ] 6.4: Ensure tab order logical (top to bottom)
  - [ ] 6.5: Test keyboard navigation flow
  - [ ] 6.6: Verify focus indicators meet WCAG visibility standards
  - [ ] 6.7: Ensure keyboard shortcuts from Story 5.5 still work

- [ ] Task 7: Add help tooltip (AC: #5.6.8)
  - [ ] 7.1: Add help icon button (?) near legend title
  - [ ] 7.2: Implement tooltip or popover component
  - [ ] 7.3: Add explanation text about layer system
  - [ ] 7.4: Make tooltip dismissible with ESC key
  - [ ] 7.5: Close tooltip when clicking outside
  - [ ] 7.6: Ensure tooltip accessible (aria-describedby)
  - [ ] 7.7: Test tooltip behavior across devices

- [ ] Task 8: Position legend on body map (AC: #5.6.3)
  - [ ] 8.1: Import LayerLegend into body map page/component
  - [ ] 8.2: Position legend prominently (bottom-left or bottom-right)
  - [ ] 8.3: Use fixed or absolute positioning
  - [ ] 8.4: Ensure legend doesn't obscure body map markers
  - [ ] 8.5: Add z-index to layer above map but below modals
  - [ ] 8.6: Test positioning on different screen sizes
  - [ ] 8.7: Adjust position if conflicts with other UI elements

- [ ] Task 9: Document future export integration (AC: #5.6.9)
  - [ ] 9.1: Add comment in component about export integration point
  - [ ] 9.2: Note legend structure designed for screenshot inclusion
  - [ ] 9.3: Document in Dev Notes section
  - [ ] 9.4: Consider adding data-testid for export selection
  - [ ] 9.5: Ensure legend styling works in static screenshots

- [ ] Task 10: Component testing (AC: All)
  - [ ] 10.1: Create `__tests__/LayerLegend.test.tsx`
  - [ ] 10.2: Write test: "renders legend items for visible layers"
  - [ ] 10.3: Write test: "shows only visible layers, not all layers"
  - [ ] 10.4: Write test: "collapses on mobile viewports"
  - [ ] 10.5: Write test: "toggle layer visibility on item click"
  - [ ] 10.6: Write test: "displays help tooltip on button click"
  - [ ] 10.7: Write test: "keyboard navigation through legend items"
  - [ ] 10.8: Write test: "screen reader attributes present"
  - [ ] 10.9: Write test: "color contrast meets WCAG AA"

## Dev Notes

### Technical Architecture

This story completes Epic 5 by adding the final UI component that helps users interpret the multi-layer visualization. The LayerLegend serves as both a reference guide and an alternative interaction method for layer visibility control.

**Key Architecture Points:**
- **Dynamic Display:** Legend adapts to show only visible layers
- **Dual Purpose:** Visual reference + interactive control
- **Accessibility-First:** WCAG 2.1 Level AA compliance baked in
- **Mobile-Optimized:** Collapsible design saves precious screen space

### Learnings from Previous Story

**From Story 5-5-add-multi-layer-view-controls-and-filtering (Status: drafted)**

- **visibleLayers State:** Story 5.5 established visibleLayers array managed in useBodyMapLayers hook. LayerLegend receives this as prop and displays only those layers.

- **onToggleLayer Handler:** Story 5.5 created toggleLayerVisibility function in useBodyMapLayers. LayerLegend can call same handler making legend items interactive alternative to checkboxes.

- **Keyboard Shortcuts:** Story 5.5 implemented number keys (1-3) and 'A' key for layer control. LayerLegend keyboard navigation should complement (not conflict with) these shortcuts.

- **Marker Counts:** Story 5.5 added getMarkerCountsByLayer() queries. LayerLegend can display counts alongside layer descriptions for additional context.

- **View Mode Context:** Story 5.5 distinguished single vs all layer modes. LayerLegend behavior may differ: single mode shows one layer non-interactively, all mode shows multiple with interactive toggles.

- **Key Pattern for This Story:** Filtered display pattern - `visibleLayers.map(layerId => LAYER_CONFIG[layerId])` ensures legend only shows relevant information without clutter.

[Source: stories/5-5-add-multi-layer-view-controls-and-filtering.md#Dev-Notes]

### Project Structure Notes

**Files to Create:**
```
src/components/body-map/
  ├── LayerLegend.tsx (NEW - legend component)
  └── __tests__/
      └── LayerLegend.test.tsx (NEW - legend tests)

src/components/ui/ (if needed)
  └── Tooltip.tsx (NEW or use existing - help tooltip)
```

### Component Props Interface

**LayerLegendProps:**
```typescript
interface LayerLegendProps {
  visibleLayers: LayerType[];              // Layers to show in legend
  onToggleLayer?: (layer: LayerType) => void; // Optional interactive toggle
  markerCounts?: Record<LayerType, number>;   // Optional counts per layer
  interactive?: boolean;                    // Enable click to toggle (default: false)
  className?: string;                       // Additional styles
}
```

### Component Implementation Pattern

**LayerLegend Component:**
```typescript
import { useState } from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function LayerLegend({
  visibleLayers,
  onToggleLayer,
  markerCounts,
  interactive = false,
  className
}: LayerLegendProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleToggle = (layerId: LayerType) => {
    if (interactive && onToggleLayer) {
      onToggleLayer(layerId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, layerId: LayerType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(layerId);
    }
  };

  return (
    <div
      role="region"
      aria-label="Layer legend"
      className={cn(
        "fixed bottom-4 left-4 bg-background border rounded-lg shadow-lg",
        "transition-all duration-300",
        className
      )}
    >
      {/* Header with collapse button */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Legend</h3>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Show layer system help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="md:hidden"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand legend" : "Collapse legend"}
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Help tooltip */}
      {showHelp && (
        <div className="p-3 bg-muted text-sm border-b">
          <p>
            Layers separate different tracking types. Switch layers to log different conditions,
            or view all layers to see comprehensive patterns.
          </p>
          <button
            className="mt-2 text-xs text-primary hover:underline"
            onClick={() => setShowHelp(false)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Legend items */}
      {!isCollapsed && (
        <ul className="p-2 space-y-1">
          {visibleLayers.map(layerId => {
            const layer = LAYER_CONFIG[layerId];
            const count = markerCounts?.[layerId];

            return (
              <li
                key={layerId}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onClick={() => handleToggle(layerId)}
                onKeyDown={e => handleKeyDown(e, layerId)}
                aria-label={`${layer.label}: ${layer.description}${count !== undefined ? `, ${count} markers` : ''}`}
                className={cn(
                  "flex items-center gap-2 p-2 rounded",
                  interactive && "cursor-pointer hover:bg-accent transition-colors",
                  interactive && "focus:outline-none focus:ring-2 focus:ring-ring"
                )}
              >
                <span className="text-xl">{layer.icon}</span>
                <div className="flex-1">
                  <div className={cn("font-medium text-sm", layer.color)}>
                    {layer.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {layer.description}
                  </div>
                </div>
                {count !== undefined && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {count}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ARIA live region for announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {/* Update when layers toggle */}
      </div>
    </div>
  );
}
```

### Responsive Behavior

**Mobile Collapse Pattern:**
```typescript
// Use CSS or useMediaQuery hook
const isMobile = useMediaQuery('(max-width: 768px)');
const [isCollapsed, setIsCollapsed] = useState(isMobile);

// Alternative: CSS-only approach
<div className={cn(
  "legend-container",
  "max-md:collapsed" // Collapsed on mobile
)}>
```

**CSS Transition:**
```css
.legend-container {
  transition: max-height 300ms ease-in-out;
}

.legend-container.collapsed {
  max-height: 48px; /* Header only */
  overflow: hidden;
}
```

### Color Contrast Verification

**WCAG AA Requirements:**
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (>= 18pt): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Testing Tools:**
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- Axe DevTools browser extension

**Color Adjustments (if needed):**
```typescript
// If default colors fail contrast, override in LAYER_CONFIG
const LAYER_CONFIG_DARK_MODE = {
  flares: { ...LAYER_CONFIG.flares, color: 'text-red-400' }, // Lighter for dark bg
  pain: { ...LAYER_CONFIG.pain, color: 'text-yellow-300' },
  inflammation: { ...LAYER_CONFIG.inflammation, color: 'text-purple-400' }
};
```

### Integration with Body Map

**Parent Component Pattern:**
```typescript
// In body map page
export function BodyMapPage() {
  const { userId } = useUser();
  const {
    visibleLayers,
    viewMode,
    markerCounts,
    toggleLayerVisibility
  } = useBodyMapLayers(userId);

  return (
    <div>
      {/* Other components */}

      <LayerLegend
        visibleLayers={visibleLayers}
        onToggleLayer={toggleLayerVisibility}
        markerCounts={markerCounts}
        interactive={viewMode === 'all'} // Only interactive in multi-layer mode
      />
    </div>
  );
}
```

### Testing Strategy

**Component Tests:**
```typescript
// __tests__/LayerLegend.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerLegend } from '../LayerLegend';

describe('LayerLegend', () => {
  it('should render legend items for visible layers', () => {
    render(
      <LayerLegend
        visibleLayers={['flares', 'pain']}
      />
    );

    expect(screen.getByText('Flares')).toBeInTheDocument();
    expect(screen.getByText('Pain')).toBeInTheDocument();
    expect(screen.queryByText('Inflammation')).not.toBeInTheDocument();
  });

  it('should show only visible layers', () => {
    const { rerender } = render(
      <LayerLegend visibleLayers={['flares']} />
    );

    expect(screen.getByText('Flares')).toBeInTheDocument();
    expect(screen.queryByText('Pain')).not.toBeInTheDocument();

    // Update visible layers
    rerender(<LayerLegend visibleLayers={['flares', 'pain']} />);

    expect(screen.getByText('Pain')).toBeInTheDocument();
  });

  it('should toggle layer on item click when interactive', () => {
    const handleToggle = jest.fn();
    render(
      <LayerLegend
        visibleLayers={['flares', 'pain']}
        onToggleLayer={handleToggle}
        interactive={true}
      />
    );

    fireEvent.click(screen.getByText('Pain'));
    expect(handleToggle).toHaveBeenCalledWith('pain');
  });

  it('should display help tooltip', () => {
    render(<LayerLegend visibleLayers={['flares']} />);

    const helpButton = screen.getByLabelText('Show layer system help');
    fireEvent.click(helpButton);

    expect(screen.getByText(/Layers separate different tracking types/)).toBeInTheDocument();
  });

  it('should support keyboard navigation', () => {
    const handleToggle = jest.fn();
    render(
      <LayerLegend
        visibleLayers={['flares', 'pain']}
        onToggleLayer={handleToggle}
        interactive={true}
      />
    );

    const painItem = screen.getByRole('button', { name: /Pain/ });
    painItem.focus();
    fireEvent.keyDown(painItem, { key: 'Enter' });

    expect(handleToggle).toHaveBeenCalledWith('pain');
  });

  it('should have proper ARIA attributes', () => {
    render(<LayerLegend visibleLayers={['flares']} />);

    const legend = screen.getByRole('region');
    expect(legend).toHaveAttribute('aria-label', 'Layer legend');

    const list = legend.querySelector('ul');
    expect(list).toBeInTheDocument();
  });

  it('should collapse on mobile', () => {
    // Mock window size
    global.innerWidth = 500; // Mobile width

    render(<LayerLegend visibleLayers={['flares']} />);

    const collapseButton = screen.getByLabelText('Expand legend');
    expect(collapseButton).toBeInTheDocument();
  });
});

// Accessibility test
describe('LayerLegend Accessibility', () => {
  it('should meet WCAG AA color contrast', () => {
    const { container } = render(
      <LayerLegend visibleLayers={['flares', 'pain', 'inflammation']} />
    );

    // Use automated accessibility testing
    // (axe-core or similar library)
    // Verify contrast ratios programmatically
  });
});
```

### References

- [Source: docs/epic-5-tech-spec.md#Layer-Legend] - Legend component design
- [Source: docs/epics.md#Story-5.6] - Story acceptance criteria
- [Source: stories/5-1-add-layer-field-to-data-model-and-indexeddb-schema.md] - LAYER_CONFIG source
- [Source: stories/5-5-add-multi-layer-view-controls-and-filtering.md] - visibleLayers state
- [Source: WCAG 2.1 Level AA](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Source: WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Contrast testing

### Integration Points

**This Story Completes Epic 5:**
- All multi-layer visualization components implemented
- Users can select, view, toggle, and understand layers
- Full accessibility compliance achieved
- Mobile-responsive design complete

**Future Integration Point:**
- Story 4.x (Photo Documentation): Legend included in body map screenshot exports
- Medical consultation exports with embedded legend for clarity

**Dependencies:**
- Story 5.1: LAYER_CONFIG for layer metadata
- Story 5.5: visibleLayers state and toggleLayerVisibility handler
- Existing UI component library for Tooltip (or create simple version)

### Performance Considerations

**Minimal Performance Impact:**
- Legend is small component (3-4 items max)
- No heavy computations required
- Static data from LAYER_CONFIG
- Collapse animation uses CSS transitions (GPU-accelerated)

**Optimization:**
- React.memo if re-renders become issue
- CSS transitions preferred over JS animations

### Risk Mitigation

**Risk: Legend obscures body map markers**
- Mitigation: Fixed positioning in corner, collapsible design
- Fallback: Allow user to drag/reposition legend

**Risk: Color contrast fails in dark mode**
- Mitigation: Pre-test all colors in both themes
- Fallback: Adjust color values or add mode-specific overrides

**Risk: Help tooltip confuses users**
- Mitigation: Clear, concise explanation text
- Fallback: Link to full documentation or tutorial

### Future Enhancements

**Potential Story 5.6+ Features:**
- Draggable legend positioning
- Legend export as standalone image
- Custom legend styling options
- Legend keyboard shortcut quick reference

## Dev Agent Record

### Context Reference

- docs/stories/5-6-create-layer-legend-and-accessibility-features.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
