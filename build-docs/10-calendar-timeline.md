# Calendar/Timeline - Implementation Plan

## Overview

The Calendar/Timeline system provides a comprehensive temporal view of all health data, enabling users to visualize patterns, identify correlations, and track progress over time. This feature combines calendar-based navigation with detailed timeline views, offering both high-level overviews and granular data exploration. The system supports multiple visualization modes and intelligent filtering to help users understand their health journey.

## Core Requirements

### User Experience Goals
- **Comprehensive Overview**: See all health data in one unified timeline
- **Flexible Navigation**: Switch between calendar, timeline, and chronological views
- **Pattern Discovery**: Visual correlation identification across data types
- **Progress Tracking**: Clear visualization of health trends and improvements
- **Intuitive Interaction**: Touch-optimized navigation and data exploration

### Technical Goals
- **High-Performance Rendering**: Smooth scrolling and zooming with large datasets
- **Multi-Scale Visualization**: Day, week, month, and year views with appropriate detail levels
- **Real-time Updates**: Live data synchronization across all timeline views
- **Advanced Filtering**: Complex queries with multiple criteria
- **Export Capabilities**: Timeline data export for medical consultations

## System Architecture

### Data Model
```typescript
interface TimelineEvent {
  id: string;
  userId: string;
  type: TimelineEventType;
  timestamp: Date;
  title: string;
  description?: string;
  severity?: number; // 1-10 scale
  category: EventCategory;
  data: TimelineEventData;
  metadata: EventMetadata;
  relationships: EventRelationship[];
}

type TimelineEventType =
  | 'symptom'
  | 'medication'
  | 'trigger'
  | 'flare'
  | 'appointment'
  | 'lab-result'
  | 'custom-trackable'
  | 'note'
  | 'milestone';

type EventCategory =
  | 'health'
  | 'medication'
  | 'lifestyle'
  | 'medical'
  | 'personal';

interface TimelineEventData {
  // Type-specific data
  symptom?: {
    type: string;
    severity: number;
    location?: string;
    duration?: number;
  };
  medication?: {
    name: string;
    dosage: string;
    action: 'started' | 'changed' | 'stopped';
  };
  trigger?: {
    type: string;
    intensity: number;
    duration?: number;
  };
  flare?: {
    severity: FlareSeverity;
    status: 'started' | 'peaked' | 'resolved';
    duration?: number;
  };
  appointment?: {
    type: string;
    provider: string;
    location?: string;
    outcome?: string;
  };
  labResult?: {
    testName: string;
    value: number;
    unit: string;
    referenceRange?: {
      min: number;
      max: number;
    };
    abnormal: boolean;
  };
  customTrackable?: {
    trackableId: string;
    trackableName: string;
    value: any;
    unit?: string;
  };
  note?: {
    content: string;
    tags: string[];
  };
  milestone?: {
    type: 'improvement' | 'setback' | 'achievement' | 'anniversary';
    description: string;
  };
}

interface EventMetadata {
  source: 'user' | 'auto' | 'import' | 'integration';
  confidence?: number; // For auto-generated events
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo?: {
    type: string;
    os: string;
  };
  tags: string[];
  visibility: 'private' | 'shared' | 'public';
}

interface EventRelationship {
  relatedEventId: string;
  relationshipType: RelationshipType;
  strength: number; // 0-1
  description?: string;
}

type RelationshipType =
  | 'caused-by'
  | 'relieved-by'
  | 'correlated-with'
  | 'followed-by'
  | 'preceded-by'
  | 'similar-to';

interface TimelineView {
  id: string;
  userId: string;
  name: string;
  type: ViewType;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: TimelineFilter[];
  grouping: GroupingConfig;
  sorting: SortingConfig;
  visualization: VisualizationConfig;
  isDefault: boolean;
  createdAt: Date;
}

type ViewType =
  | 'calendar'
  | 'timeline'
  | 'chronological'
  | 'correlation'
  | 'progress';

interface TimelineFilter {
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  enabled: boolean;
}

type FilterType =
  | 'category'
  | 'type'
  | 'severity'
  | 'date-range'
  | 'location'
  | 'tag'
  | 'relationship';

type FilterOperator =
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'greater-than'
  | 'less-than'
  | 'between'
  | 'in'
  | 'not-in';

interface GroupingConfig {
  enabled: boolean;
  field: string;
  sortGroupsBy: 'name' | 'count' | 'severity';
  collapseGroups: boolean;
}

interface SortingConfig {
  field: 'timestamp' | 'severity' | 'type' | 'title';
  direction: 'asc' | 'desc';
  secondarySort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

interface VisualizationConfig {
  showIcons: boolean;
  colorScheme: 'severity' | 'type' | 'category' | 'custom';
  density: 'compact' | 'normal' | 'detailed';
  showRelationships: boolean;
  highlightPatterns: boolean;
}
```

### Component Architecture
```
CalendarTimelineSystem/
├── TimelineView.tsx                   # Main timeline interface
├── CalendarView.tsx                   # Calendar-based navigation
├── TimelineList.tsx                   # Chronological event list
├── TimelineFilters.tsx                # Advanced filtering system
├── TimelineSearch.tsx                 # Event search and discovery
├── TimelineAnalytics.tsx              # Pattern analysis and insights
├── TimelineExporter.tsx               # Data export functionality
├── TimelineZoom.tsx                   # Multi-scale time navigation
├── TimelineRelationships.tsx          # Event relationship visualization
└── TimelineMilestones.tsx             # Health milestone tracking
```

## Timeline View Implementation

### Main Timeline Component
```tsx
function TimelineView({ userId, initialView = 'timeline' }: TimelineViewProps) {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [filters, setFilters] = useState<TimelineFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<'day' | 'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadTimelineData();
  }, [userId, dateRange]);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const timelineEvents = await loadEventsForDateRange(userId, dateRange);

      // Sort events by timestamp
      timelineEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setEvents(timelineEvents);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    filters.forEach(filter => {
      if (!filter.enabled) return;

      filtered = filtered.filter(event => {
        const fieldValue = getFieldValue(event, filter.field);

        switch (filter.operator) {
          case 'equals':
            return fieldValue === filter.value;
          case 'not-equals':
            return fieldValue !== filter.value;
          case 'contains':
            return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
          case 'greater-than':
            return Number(fieldValue) > Number(filter.value);
          case 'less-than':
            return Number(fieldValue) < Number(filter.value);
          case 'between':
            const [min, max] = filter.value;
            return Number(fieldValue) >= min && Number(fieldValue) <= max;
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(fieldValue);
          case 'not-in':
            return Array.isArray(filter.value) && !filter.value.includes(fieldValue);
          default:
            return true;
        }
      });
    });

    setFilteredEvents(filtered);
  };

  const getFieldValue = (event: TimelineEvent, field: string): any => {
    switch (field) {
      case 'type':
        return event.type;
      case 'category':
        return event.category;
      case 'severity':
        return event.severity;
      case 'timestamp':
        return event.timestamp;
      case 'title':
        return event.title;
      case 'tags':
        return event.metadata.tags;
      default:
        // Handle nested fields like 'data.symptom.severity'
        return field.split('.').reduce((obj, key) => obj?.[key], event);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  const handleZoomChange = (zoom: 'day' | 'week' | 'month' | 'year') => {
    setZoomLevel(zoom);

    // Adjust date range based on zoom level
    const now = new Date();
    let start: Date;

    switch (zoom) {
      case 'day':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    setDateRange({ start, end: now });
  };

  const renderCurrentView = () => {
    const viewProps = {
      events: filteredEvents,
      dateRange,
      zoomLevel,
      onEventClick: (event: TimelineEvent) => {
        // Handle event click - show detail modal
        setSelectedEvent(event);
      },
      onDateRangeChange: handleDateRangeChange
    };

    switch (currentView) {
      case 'calendar':
        return <CalendarView {...viewProps} />;
      case 'timeline':
        return <TimelineVisualization {...viewProps} />;
      case 'chronological':
        return <ChronologicalList {...viewProps} />;
      case 'correlation':
        return <CorrelationView {...viewProps} />;
      case 'progress':
        return <ProgressView {...viewProps} />;
      default:
        return <TimelineVisualization {...viewProps} />;
    }
  };

  return (
    <div className="timeline-view">
      {/* Header with controls */}
      <div className="timeline-header">
        <div className="view-controls">
          <Button
            variant={currentView === 'calendar' ? 'default' : 'outline'}
            onClick={() => handleViewChange('calendar')}
          >
            <CalendarIcon />
            Calendar
          </Button>
          <Button
            variant={currentView === 'timeline' ? 'default' : 'outline'}
            onClick={() => handleViewChange('timeline')}
          >
            <TimelineIcon />
            Timeline
          </Button>
          <Button
            variant={currentView === 'chronological' ? 'default' : 'outline'}
            onClick={() => handleViewChange('chronological')}
          >
            <ListIcon />
            List
          </Button>
        </div>

        <div className="zoom-controls">
          <Select value={zoomLevel} onValueChange={handleZoomChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="filter-controls">
          <TimelineFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableFields={getAvailableFields(events)}
          />
        </div>
      </div>

      {/* Date range indicator */}
      <div className="date-range-indicator">
        <span>
          {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
        </span>
        <Button variant="ghost" size="sm" onClick={() => handleDateRangeChange(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          new Date()
        )}>
          Reset to Last 30 Days
        </Button>
      </div>

      {/* Main content */}
      <div className="timeline-content">
        {loading ? (
          <div className="loading-state">
            <Spinner />
            <p>Loading timeline data...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <CalendarIcon />
            <h3>No events found</h3>
            <p>Try adjusting your filters or date range</p>
          </div>
        ) : (
          renderCurrentView()
        )}
      </div>

      {/* Event detail modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEventEdit}
          onDelete={handleEventDelete}
        />
      )}
    </div>
  );
}
```

### Timeline Visualization
```tsx
function TimelineVisualization({ events, dateRange, zoomLevel, onEventClick }: TimelineVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [date: string]: TimelineEvent[] } = {};

    events.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  // Calculate timeline dimensions
  const timelineWidth = 1000; // Base width
  const dayWidth = zoomLevel === 'day' ? 100 : zoomLevel === 'week' ? 50 : zoomLevel === 'month' ? 20 : 5;
  const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000));
  const totalWidth = totalDays * dayWidth;

  const getEventPosition = (event: TimelineEvent) => {
    const daysSinceStart = (event.timestamp.getTime() - dateRange.start.getTime()) / (24 * 60 * 60 * 1000);
    return (daysSinceStart / totalDays) * 100; // Percentage
  };

  const getEventColor = (event: TimelineEvent) => {
    if (event.severity) {
      // Color based on severity
      if (event.severity >= 8) return '#ef4444'; // Red for high severity
      if (event.severity >= 6) return '#f97316'; // Orange for medium-high
      if (event.severity >= 4) return '#eab308'; // Yellow for medium
      return '#22c55e'; // Green for low
    }

    // Color based on type
    switch (event.type) {
      case 'symptom': return '#3b82f6'; // Blue
      case 'medication': return '#8b5cf6'; // Purple
      case 'trigger': return '#f59e0b'; // Amber
      case 'flare': return '#ef4444'; // Red
      case 'appointment': return '#06b6d4'; // Cyan
      default: return '#6b7280'; // Gray
    }
  };

  const renderTimelineAxis = () => {
    const axisLabels: JSX.Element[] = [];
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      const position = ((current.getTime() - dateRange.start.getTime()) / (dateRange.end.getTime() - dateRange.start.getTime())) * 100;

      let label: string;
      switch (zoomLevel) {
        case 'day':
          label = current.toLocaleDateString([], { month: 'short', day: 'numeric', hour: 'numeric' });
          break;
        case 'week':
          label = current.toLocaleDateString([], { month: 'short', day: 'numeric' });
          break;
        case 'month':
          label = current.toLocaleDateString([], { month: 'short', year: '2-digit' });
          break;
        case 'year':
          label = current.getFullYear().toString();
          break;
      }

      axisLabels.push(
        <div
          key={current.toISOString()}
          className="timeline-axis-label"
          style={{ left: `${position}%` }}
        >
          {label}
        </div>
      );

      // Increment based on zoom level
      switch (zoomLevel) {
        case 'day':
          current.setHours(current.getHours() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 1);
          break;
        case 'month':
          current.setDate(current.getDate() + 7);
          break;
        case 'year':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return axisLabels;
  };

  return (
    <div className="timeline-visualization" ref={containerRef}>
      {/* Timeline axis */}
      <div className="timeline-axis">
        {renderTimelineAxis()}
      </div>

      {/* Timeline tracks */}
      <div className="timeline-tracks">
        {/* Symptom severity track */}
        <div className="timeline-track symptom-track">
          <div className="track-label">Symptoms</div>
          <div className="track-line">
            {events
              .filter(e => e.type === 'symptom')
              .map(event => (
                <div
                  key={event.id}
                  className="timeline-event symptom-event"
                  style={{
                    left: `${getEventPosition(event)}%`,
                    backgroundColor: getEventColor(event),
                    width: `${Math.max(4, (event.data.symptom?.duration || 1) * dayWidth / 24)}px`
                  }}
                  onClick={() => onEventClick(event)}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={event.title}
                >
                  <div className="event-indicator" />
                </div>
              ))}
          </div>
        </div>

        {/* Medication track */}
        <div className="timeline-track medication-track">
          <div className="track-label">Medications</div>
          <div className="track-line">
            {events
              .filter(e => e.type === 'medication')
              .map(event => (
                <div
                  key={event.id}
                  className="timeline-event medication-event"
                  style={{
                    left: `${getEventPosition(event)}%`,
                    backgroundColor: getEventColor(event)
                  }}
                  onClick={() => onEventClick(event)}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={event.title}
                >
                  <PillIcon />
                </div>
              ))}
          </div>
        </div>

        {/* Trigger track */}
        <div className="timeline-track trigger-track">
          <div className="track-label">Triggers</div>
          <div className="track-line">
            {events
              .filter(e => e.type === 'trigger')
              .map(event => (
                <div
                  key={event.id}
                  className="timeline-event trigger-event"
                  style={{
                    left: `${getEventPosition(event)}%`,
                    backgroundColor: getEventColor(event),
                    opacity: (event.data.trigger?.intensity || 5) / 10
                  }}
                  onClick={() => onEventClick(event)}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={event.title}
                >
                  <AlertTriangleIcon />
                </div>
              ))}
          </div>
        </div>

        {/* Flare track */}
        <div className="timeline-track flare-track">
          <div className="track-label">Flares</div>
          <div className="track-line">
            {events
              .filter(e => e.type === 'flare')
              .map(event => (
                <div
                  key={event.id}
                  className="timeline-event flare-event"
                  style={{
                    left: `${getEventPosition(event)}%`,
                    backgroundColor: getEventColor(event),
                    width: `${Math.max(20, (event.data.flare?.duration || 1) * dayWidth)}px`
                  }}
                  onClick={() => onEventClick(event)}
                  onMouseEnter={() => setHoveredEvent(event)}
                  onMouseLeave={() => setHoveredEvent(null)}
                  title={event.title}
                >
                  <FlameIcon />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredEvent && (
        <div className="timeline-tooltip">
          <div className="tooltip-header">
            <span className="event-type">{hoveredEvent.type}</span>
            <span className="event-time">
              {hoveredEvent.timestamp.toLocaleString()}
            </span>
          </div>
          <div className="tooltip-content">
            <h4>{hoveredEvent.title}</h4>
            {hoveredEvent.description && (
              <p>{hoveredEvent.description}</p>
            )}
            {hoveredEvent.severity && (
              <div className="severity-indicator">
                Severity: {hoveredEvent.severity}/10
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scroll controls */}
      <div className="timeline-scroll-controls">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scrollTimeline('left')}
          disabled={visibleRange.start <= 0}
        >
          <ChevronLeftIcon />
        </Button>
        <div className="scroll-indicator">
          <div
            className="scroll-thumb"
            style={{
              left: `${visibleRange.start}%`,
              width: `${visibleRange.end - visibleRange.start}%`
            }}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => scrollTimeline('right')}
          disabled={visibleRange.end >= 100}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
```

## Calendar View
```tsx
function CalendarView({ events, dateRange, onEventClick, onDateRangeChange }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [date: string]: TimelineEvent[] } = {};

    events.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  };

  const getDateClassName = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    const hasEvents = getEventsForDate(date).length > 0;
    const hasHighSeverity = getEventsForDate(date).some(e => (e.severity || 0) >= 7);

    return classNames('calendar-day', {
      'today': isToday,
      'selected': isSelected,
      'has-events': hasEvents,
      'high-severity': hasHighSeverity
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateRangeChange(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
    );
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-view">
      {/* Calendar header */}
      <div className="calendar-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMonthChange('prev')}
        >
          <ChevronLeftIcon />
        </Button>

        <h2 className="calendar-title">
          {currentMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
        </h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMonthChange('next')}
        >
          <ChevronRightIcon />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {/* Day headers */}
        <div className="calendar-week-header">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-days">
          {days.map((date, index) => (
            <div
              key={index}
              className={getDateClassName(date)}
              onClick={() => date && handleDateClick(date)}
            >
              {date && (
                <>
                  <span className="day-number">{date.getDate()}</span>

                  {/* Event indicators */}
                  <div className="day-events">
                    {getEventsForDate(date).slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={`event-indicator ${event.type}`}
                        style={{ backgroundColor: getEventColor(event) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        title={event.title}
                      />
                    ))}

                    {getEventsForDate(date).length > 3 && (
                      <div className="event-overflow">
                        +{getEventsForDate(date).length - 3}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="selected-date-details">
          <h3>{selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</h3>

          <div className="date-events-list">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p>No events on this date</p>
            ) : (
              getEventsForDate(selectedDate).map(event => (
                <div
                  key={event.id}
                  className="date-event-item"
                  onClick={() => onEventClick(event)}
                >
                  <div className="event-icon">
                    <EventIcon type={event.type} />
                  </div>
                  <div className="event-info">
                    <span className="event-title">{event.title}</span>
                    <span className="event-time">
                      {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {event.severity && (
                    <div className="event-severity">
                      {event.severity}/10
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Implementation Checklist

### Timeline Views
- [ ] Calendar view with event indicators
- [ ] Timeline visualization with multiple tracks
- [ ] Chronological list view
- [ ] Correlation view for pattern analysis
- [ ] Progress view for trend tracking

### Navigation & Zoom
- [ ] Multi-scale time navigation (day/week/month/year)
- [ ] Smooth scrolling and zooming
- [ ] Date range selection and presets
- [ ] Keyboard navigation support
- [ ] Touch gesture support

### Filtering & Search
- [ ] Advanced filtering by type, category, severity
- [ ] Date range filtering
- [ ] Tag-based filtering
- [ ] Text search across events
- [ ] Saved filter presets

### Data Visualization
- [ ] Color-coded events by type and severity
- [ ] Interactive event details on hover/click
- [ ] Relationship visualization between events
- [ ] Pattern highlighting and trend lines
- [ ] Export capabilities for reports

### Performance Optimization
- [ ] Virtual scrolling for large datasets
- [ ] Lazy loading of event details
- [ ] Efficient data indexing
- [ ] Background data synchronization
- [ ] Memory management for long timelines

### Advanced Features
- [ ] Event relationship mapping
- [ ] Milestone tracking and celebration
- [ ] Predictive event suggestions
- [ ] Automated pattern detection
- [ ] Integration with external calendars

---

## Related Documents

- [Data Storage Architecture](../16-data-storage.md) - Timeline data persistence
- [Data Analysis](../13-data-analysis.md) - Timeline pattern analysis
- [Data Import/Export](../19-data-import-export.md) - Timeline data export
- [Symptom Tracking](../02-symptom-tracking.md) - Symptom timeline integration
- [Settings](../15-settings.md) - Timeline view preferences

---

*Document Version: 1.0 | Last Updated: October 2025*