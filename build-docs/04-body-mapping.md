# Body Mapping - Implementation Plan

## Overview

The Body Mapping system provides an interactive, visual interface for users to pinpoint exactly where on their body they are experiencing symptoms. This feature is crucial for autoimmune conditions where symptoms can manifest in specific locations and patterns. The system combines anatomical accuracy with user-friendly interaction to create detailed symptom location data.

## Core Requirements

### User Experience Goals
- **Intuitive Interaction**: Natural pointing and selection of body areas
- **Anatomical Accuracy**: Medically accurate body representation
- **Multiple Views**: Front, back, and side perspectives
- **Symptom Visualization**: Clear display of symptom locations and severity
- **Touch Optimized**: Works well on mobile devices

### Technical Goals
- **Scalable Vector Graphics**: Crisp rendering at all sizes
- **Performance Optimized**: Smooth interactions with large datasets
- **Accessibility Compliant**: Keyboard navigation and screen reader support
- **Data Integration**: Seamless connection with symptom logging
- **Offline Capable**: Full functionality without internet

## System Architecture

### Data Model
```typescript
interface BodyMap {
  id: string;
  name: string;
  svgPath: string; // SVG path data for the body region
  category: BodyRegionCategory;
  side?: 'left' | 'right' | 'center'; // For bilateral regions
  zIndex: number; // Drawing order
  selectable: boolean;
  labels: {
    en: string;
    es?: string;
    fr?: string;
  };
}

interface SymptomLocation {
  id: string;
  symptomLogId: string;
  bodyRegionId: string;
  coordinates: {
    x: number; // Normalized 0-1 coordinates
    y: number;
  };
  severity: number; // 1-10
  notes?: string;
  timestamp: Date;
}

interface BodyView {
  id: string;
  name: string;
  svgContent: string; // Complete SVG for the view
  regions: BodyMap[];
  defaultZoom: number;
  defaultPan: { x: number; y: number };
}
```

### Component Architecture
```
BodyMappingSystem/
├── BodyMapViewer.tsx              # Main body map component
├── BodyRegionSelector.tsx         # Region selection interface
├── SymptomOverlay.tsx             # Symptom visualization layer
├── BodyViewSwitcher.tsx           # Front/back/side view switching
├── ZoomPanControls.tsx            # Zoom and pan functionality
├── SymptomMarker.tsx              # Individual symptom markers
├── BodyMapLegend.tsx              # Color coding and severity legend
├── TouchHandler.tsx               # Touch gesture handling
└── AccessibilityLayer.tsx         # Keyboard/screen reader support
```

## Body Map Implementation

### SVG-Based Body Representation
```tsx
function BodyMapViewer({ view, symptoms, onRegionSelect, onSymptomAdd }: BodyMapViewerProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [zoom, setZoom] = useState(view.defaultZoom);
  const [pan, setPan] = useState(view.defaultPan);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Handle region selection
  const handleRegionClick = (regionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedRegion(regionId);
    onRegionSelect(regionId);
  };

  // Handle symptom placement
  const handleMapClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedRegion) return;

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    onSymptomAdd(selectedRegion, { x, y });
  };

  return (
    <div className="body-map-container">
      <svg
        ref={svgRef}
        viewBox="0 0 400 600"
        className="body-map-svg"
        onClick={handleMapClick}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center'
        }}
      >
        {/* Base body outline */}
        <g className="body-outline">
          <path
            d={view.svgContent}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </g>

        {/* Interactive regions */}
        <g className="body-regions">
          {view.regions.map(region => (
            <path
              key={region.id}
              d={region.svgPath}
              fill={selectedRegion === region.id ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
              stroke={selectedRegion === region.id ? '#3b82f6' : 'transparent'}
              strokeWidth="2"
              className="body-region cursor-pointer hover:fill-blue-100"
              onClick={(e) => handleRegionClick(region.id, e)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${region.labels.en} region`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleRegionClick(region.id, e as any);
                }
              }}
            />
          ))}
        </g>

        {/* Symptom markers */}
        <SymptomOverlay symptoms={symptoms} />
      </svg>

      {/* Zoom and pan controls */}
      <ZoomPanControls
        zoom={zoom}
        onZoomChange={setZoom}
        pan={pan}
        onPanChange={setPan}
      />

      {/* Region labels (optional) */}
      <BodyRegionLabels
        regions={view.regions}
        selectedRegion={selectedRegion}
        showLabels={true}
      />
    </div>
  );
}
```

### Symptom Overlay System
```tsx
function SymptomOverlay({ symptoms }: SymptomOverlayProps) {
  // Group symptoms by region for better performance
  const symptomsByRegion = useMemo(() => {
    return symptoms.reduce((acc, symptom) => {
      if (!acc[symptom.bodyRegionId]) {
        acc[symptom.bodyRegionId] = [];
      }
      acc[symptom.bodyRegionId].push(symptom);
      return acc;
    }, {} as Record<string, SymptomLocation[]>);
  }, [symptoms]);

  return (
    <g className="symptom-markers">
      {Object.entries(symptomsByRegion).map(([regionId, regionSymptoms]) => (
        <g key={regionId} className="region-symptoms">
          {regionSymptoms.map(symptom => (
            <SymptomMarker
              key={symptom.id}
              symptom={symptom}
              onClick={() => onSymptomClick(symptom)}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function SymptomMarker({ symptom, onClick }: SymptomMarkerProps) {
  const severity = symptom.severity;
  const color = getSeverityColor(severity);
  const size = getSeveritySize(severity);

  // Convert normalized coordinates to SVG coordinates
  const svgX = symptom.coordinates.x * 400; // Assuming 400px width
  const svgY = symptom.coordinates.y * 600; // Assuming 600px height

  return (
    <g
      className="symptom-marker cursor-pointer"
      onClick={() => onClick(symptom)}
      role="button"
      tabIndex={0}
      aria-label={`Symptom at ${symptom.bodyRegionId}, severity ${severity}`}
    >
      {/* Main marker */}
      <circle
        cx={svgX}
        cy={svgY}
        r={size}
        fill={color}
        stroke="white"
        strokeWidth="2"
        className="hover:stroke-gray-400 transition-colors"
      />

      {/* Severity indicator */}
      <text
        x={svgX}
        y={svgY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-bold fill-white pointer-events-none"
        style={{ fontSize: size * 0.6 }}
      >
        {severity}
      </text>

      {/* Pulsing animation for recent symptoms */}
      {isRecent(symptom.timestamp) && (
        <circle
          cx={svgX}
          cy={svgY}
          r={size + 4}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.6"
          className="animate-ping"
        />
      )}
    </g>
  );
}

function getSeverityColor(severity: number): string {
  // Color gradient from green (mild) to red (severe)
  const colors = [
    '#10b981', // Green - mild
    '#34d399',
    '#6ee7b7',
    '#fbbf24', // Yellow - moderate
    '#f59e0b',
    '#f97316', // Orange
    '#ef4444', // Red - severe
    '#dc2626',
    '#b91c1c',
    '#991b1b'  // Dark red - very severe
  ];

  return colors[Math.min(severity - 1, colors.length - 1)];
}

function getSeveritySize(severity: number): number {
  // Size based on severity (4-12px radius)
  return 4 + (severity - 1) * 0.8;
}

function isRecent(timestamp: Date): boolean {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return timestamp > oneHourAgo;
}
```

### Multi-View Body System
```tsx
function BodyViewSwitcher({ currentView, onViewChange, views }: BodyViewSwitcherProps) {
  return (
    <div className="body-view-switcher">
      <div className="flex gap-2 p-2 bg-muted rounded-lg">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView.id === view.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted-foreground/10'
            }`}
            aria-pressed={currentView.id === view.id}
          >
            {view.name}
          </button>
        ))}
      </div>

      {/* Quick view thumbnails */}
      <div className="grid grid-cols-3 gap-2 mt-2">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view)}
            className={`aspect-square rounded border-2 overflow-hidden ${
              currentView.id === view.id ? 'border-primary' : 'border-transparent'
            }`}
            aria-label={`Switch to ${view.name} view`}
          >
            <svg
              viewBox="0 0 400 600"
              className="w-full h-full"
            >
              <path
                d={view.svgContent}
                fill="currentColor"
                opacity="0.3"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// Predefined body views
const BODY_VIEWS: BodyView[] = [
  {
    id: 'front',
    name: 'Front',
    svgContent: FRONT_BODY_SVG,
    regions: FRONT_BODY_REGIONS,
    defaultZoom: 1,
    defaultPan: { x: 0, y: 0 }
  },
  {
    id: 'back',
    name: 'Back',
    svgContent: BACK_BODY_SVG,
    regions: BACK_BODY_REGIONS,
    defaultZoom: 1,
    defaultPan: { x: 0, y: 0 }
  },
  {
    id: 'left-side',
    name: 'Left Side',
    svgContent: LEFT_SIDE_BODY_SVG,
    regions: SIDE_BODY_REGIONS,
    defaultZoom: 1,
    defaultPan: { x: 0, y: 0 }
  },
  {
    id: 'right-side',
    name: 'Right Side',
    svgContent: RIGHT_SIDE_BODY_SVG,
    regions: SIDE_BODY_REGIONS,
    defaultZoom: 1,
    defaultPan: { x: 0, y: 0 }
  }
];
```

## Advanced Interaction Features

### Touch and Gesture Support
```typescript
class TouchHandler {
  private touchStart: TouchPoint | null = null;
  private lastPinchDistance: number = 0;

  setupTouchHandlers(element: HTMLElement, callbacks: TouchCallbacks) {
    element.addEventListener('touchstart', (e) => this.handleTouchStart(e, callbacks));
    element.addEventListener('touchmove', (e) => this.handleTouchMove(e, callbacks));
    element.addEventListener('touchend', (e) => this.handleTouchEnd(e, callbacks));
  }

  private handleTouchStart(event: TouchEvent, callbacks: TouchCallbacks) {
    if (event.touches.length === 1) {
      // Single touch - potential drag or tap
      const touch = event.touches[0];
      this.touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    } else if (event.touches.length === 2) {
      // Two finger touch - pinch to zoom
      event.preventDefault();
      this.lastPinchDistance = this.getPinchDistance(event.touches);
    }
  }

  private handleTouchMove(event: TouchEvent, callbacks: TouchCallbacks) {
    if (event.touches.length === 1 && this.touchStart) {
      // Single touch drag
      const touch = event.touches[0];
      const deltaX = touch.clientX - this.touchStart.x;
      const deltaY = touch.clientY - this.touchStart.y;

      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        // Moved enough to be a drag
        callbacks.onDrag?.(deltaX, deltaY);
      }
    } else if (event.touches.length === 2) {
      // Pinch zoom
      event.preventDefault();
      const distance = this.getPinchDistance(event.touches);
      const scale = distance / this.lastPinchDistance;

      if (scale > 0.1) {
        callbacks.onZoom?.(scale);
      }

      this.lastPinchDistance = distance;
    }
  }

  private handleTouchEnd(event: TouchEvent, callbacks: TouchCallbacks) {
    if (event.changedTouches.length === 1 && this.touchStart) {
      const touch = event.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - this.touchStart.x);
      const deltaY = Math.abs(touch.clientY - this.touchStart.y);
      const deltaTime = Date.now() - this.touchStart.time;

      if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
        // Quick tap
        callbacks.onTap?.(touch.clientX, touch.clientY);
      }
    }

    this.touchStart = null;
    this.lastPinchDistance = 0;
  }

  private getPinchDistance(touches: TouchList): number {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }
}
```

### Zoom and Pan Controls
```tsx
function ZoomPanControls({ zoom, onZoomChange, pan, onPanChange }: ZoomPanControlsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => onZoomChange(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => onZoomChange(Math.max(zoom / 1.2, 0.5));
  const handleReset = () => {
    onZoomChange(1);
    onPanChange({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newPan = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };

    onPanChange(newPan);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="zoom-pan-controls">
      {/* Zoom controls */}
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <span className="px-2 py-1 text-sm bg-muted rounded">
          {Math.round(zoom * 100)}%
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          disabled={zoom >= 3}
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      {/* Pan controls */}
      <div className="flex gap-1 mt-2">
        <Button
          size="sm"
          variant="outline"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-move"
          aria-label="Pan body map"
        >
          <Move className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          aria-label="Reset zoom and pan"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
```

## Symptom Pattern Analysis

### Pattern Recognition
```typescript
class SymptomPatternAnalyzer {
  // Identify common symptom patterns
  async analyzePatterns(symptoms: SymptomLocation[]): Promise<SymptomPattern[]> {
    const patterns: SymptomPattern[] = [];

    // Group symptoms by region
    const byRegion = this.groupByRegion(symptoms);

    // Look for bilateral symmetry
    const bilateralPatterns = this.findBilateralPatterns(byRegion);
    patterns.push(...bilateralPatterns);

    // Look for dermatome patterns (nerve pathways)
    const dermatomePatterns = this.findDermatomePatterns(symptoms);
    patterns.push(...dermatomePatterns);

    // Look for joint patterns
    const jointPatterns = this.findJointPatterns(byRegion);
    patterns.push(...jointPatterns);

    return patterns;
  }

  private findBilateralPatterns(byRegion: Record<string, SymptomLocation[]>): SymptomPattern[] {
    const patterns: SymptomPattern[] = [];
    const bilateralRegions = [
      ['left-shoulder', 'right-shoulder'],
      ['left-elbow', 'right-elbow'],
      ['left-wrist', 'right-wrist'],
      ['left-hip', 'right-hip'],
      ['left-knee', 'right-knee'],
      ['left-ankle', 'right-ankle']
    ];

    bilateralRegions.forEach(([left, right]) => {
      const leftSymptoms = byRegion[left] || [];
      const rightSymptoms = byRegion[right] || [];

      if (leftSymptoms.length > 0 && rightSymptoms.length > 0) {
        const leftAvgSeverity = this.averageSeverity(leftSymptoms);
        const rightAvgSeverity = this.averageSeverity(rightSymptoms);

        // Check if severities are similar (within 2 points)
        if (Math.abs(leftAvgSeverity - rightAvgSeverity) <= 2) {
          patterns.push({
            type: 'bilateral',
            regions: [left, right],
            description: `Symptom symmetry between ${left} and ${right}`,
            confidence: 0.8,
            severity: (leftAvgSeverity + rightAvgSeverity) / 2
          });
        }
      }
    });

    return patterns;
  }

  private findDermatomePatterns(symptoms: SymptomLocation[]): SymptomPattern[] {
    // Simplified dermatome pattern detection
    // In a real implementation, this would use medical dermatome maps
    const patterns: SymptomPattern[] = [];

    // Group by vertical position (simplified)
    const verticalGroups = this.groupByVerticalPosition(symptoms);

    Object.entries(verticalGroups).forEach(([level, levelSymptoms]) => {
      if (levelSymptoms.length >= 3) {
        patterns.push({
          type: 'dermatome',
          regions: levelSymptoms.map(s => s.bodyRegionId),
          description: `Possible dermatome pattern at ${level} level`,
          confidence: 0.6,
          severity: this.averageSeverity(levelSymptoms)
        });
      }
    });

    return patterns;
  }

  private averageSeverity(symptoms: SymptomLocation[]): number {
    return symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
  }
}
```

### Pattern Visualization
```tsx
function PatternOverlay({ patterns }: PatternOverlayProps) {
  return (
    <g className="pattern-overlay">
      {patterns.map((pattern, index) => (
        <PatternVisualization
          key={index}
          pattern={pattern}
          color={getPatternColor(pattern.type)}
        />
      ))}
    </g>
  );
}

function PatternVisualization({ pattern, color }: PatternVisualizationProps) {
  // Draw connecting lines or shapes to show patterns
  const points = pattern.regions.map(regionId => {
    const region = getRegionById(regionId);
    return {
      x: region.centerX * 400,
      y: region.centerY * 600
    };
  });

  if (points.length < 2) return null;

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <g className="pattern-visualization">
      {/* Connecting line */}
      <path
        d={pathData}
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeDasharray="5,5"
        opacity="0.7"
      />

      {/* Pattern label */}
      <text
        x={points[0].x + 10}
        y={points[0].y - 10}
        className="text-xs font-medium"
        fill={color}
      >
        {pattern.type}
      </text>
    </g>
  );
}

function getPatternColor(type: string): string {
  const colors = {
    bilateral: '#3b82f6',
    dermatome: '#ef4444',
    joint: '#10b981',
    systemic: '#f59e0b'
  };

  return colors[type] || '#6b7280';
}
```

## Accessibility Implementation

### Keyboard Navigation
```typescript
class BodyMapAccessibility {
  private currentRegionIndex = 0;
  private regions: BodyMap[] = [];

  setupKeyboardNavigation(container: HTMLElement, regions: BodyMap[]) {
    this.regions = regions.filter(r => r.selectable);

    container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.navigateToRegion(this.getRegionAbove());
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.navigateToRegion(this.getRegionBelow());
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateToRegion(this.getRegionLeft());
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateToRegion(this.getRegionRight());
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.selectCurrentRegion();
          break;
      }
    });
  }

  private navigateToRegion(region: BodyMap | null) {
    if (!region) return;

    const index = this.regions.findIndex(r => r.id === region.id);
    if (index !== -1) {
      this.currentRegionIndex = index;
      this.focusRegion(region);
      this.announceRegion(region);
    }
  }

  private focusRegion(region: BodyMap) {
    const element = document.querySelector(`[data-region-id="${region.id}"]`) as HTMLElement;
    element?.focus();
  }

  private announceRegion(region: BodyMap) {
    announceToScreenReader(`Selected ${region.labels.en} region`);
  }

  private selectCurrentRegion() {
    const region = this.regions[this.currentRegionIndex];
    if (region) {
      // Trigger region selection
      onRegionSelect(region.id);
    }
  }

  // Spatial navigation logic (simplified)
  private getRegionAbove(): BodyMap | null {
    const current = this.regions[this.currentRegionIndex];
    // Find closest region above current region
    return this.findClosestRegion(current, 'above');
  }

  private findClosestRegion(from: BodyMap, direction: 'above' | 'below' | 'left' | 'right'): BodyMap | null {
    let closest: BodyMap | null = null;
    let minDistance = Infinity;

    this.regions.forEach(region => {
      if (region.id === from.id) return;

      const distance = this.calculateDirectionalDistance(from, region, direction);
      if (distance < minDistance) {
        minDistance = distance;
        closest = region;
      }
    });

    return closest;
  }
}
```

## Implementation Checklist

### Core Body Mapping
- [ ] SVG-based anatomical body representation
- [ ] Interactive region selection
- [ ] Symptom marker placement and visualization
- [ ] Multiple view support (front, back, sides)
- [ ] Zoom and pan functionality

### Symptom Integration
- [ ] Symptom location data model
- [ ] Severity-based visual encoding
- [ ] Symptom marker interactions
- [ ] Pattern recognition and analysis
- [ ] Historical symptom overlay

### User Experience
- [ ] Touch-optimized interactions
- [ ] Gesture support (pinch-to-zoom, drag-to-pan)
- [ ] Responsive design for all screen sizes
- [ ] Loading states and error handling
- [ ] Undo/redo functionality

### Accessibility
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Alternative text for all visual elements
- [ ] Focus management and indicators

### Advanced Features
- [ ] Pattern recognition algorithms
- [ ] Bilateral symmetry detection
- [ ] Dermatome pattern analysis
- [ ] Joint involvement patterns
- [ ] Medical correlation suggestions

### Performance
- [ ] Efficient SVG rendering
- [ ] Lazy loading of body views
- [ ] Optimized marker rendering for large datasets
- [ ] Memory management for symptom history
- [ ] Smooth animations and transitions

---

## Related Documents

- [Symptom Tracking](../02-symptom-tracking.md) - Symptom data integration
- [Data Storage Architecture](../16-data-storage.md) - Location data persistence
- [Accessibility](../20-accessibility.md) - Inclusive body map design
- [Daily Entry System](../03-daily-entry-system.md) - Quick location selection
- [Data Analysis](../11-data-analysis.md) - Pattern analysis integration

---

*Document Version: 1.0 | Last Updated: October 2025*