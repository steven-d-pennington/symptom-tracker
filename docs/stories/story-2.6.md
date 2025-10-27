# Story 2.6: View Flare History Timeline

Status: Complete

## Story

As a user reviewing a flare's progression,
I want to see a chronological timeline of all status changes and interventions,
So that I can understand the flare's complete history.

## Acceptance Criteria

1. **AC2.6.1 — Flare detail view includes "History" tab:** Page at `/flares/[id]` displays tab navigation with "Details" and "History" tabs, clicking "History" tab shows FlareHistory component, tab navigation accessible via keyboard (arrow keys) and screen readers, active tab visually indicated with ARIA attributes. [Source: docs/epics.md#Story-2.6]

2. **AC2.6.2 — Timeline displays comprehensive event information:** Each FlareEvent entry displays (1) date/time (formatted as relative "2 hours ago" with full timestamp on hover), (2) event type icon (status update = chart line, intervention = medical cross, trend change = arrow), (3) severity badge and value (for status updates showing previous → current), (4) trend arrow indicator (↑ worsening, → stable, ↓ improving) for status and trend updates, (5) intervention type and details (for interventions), (6) notes text if present. [Source: docs/epics.md#Story-2.6] [Source: docs/PRD.md#FR008]

3. **AC2.6.3 — Timeline sorted reverse-chronologically:** Events fetched via flareRepository.getFlareHistory() sorted by timestamp descending (most recent first), scroll position starts at top showing latest events, chronological flow visible by scrolling down, ensures users see current state before historical progression. [Source: docs/epics.md#Story-2.6]

4. **AC2.6.4 — Visual line chart shows severity progression:** Chart.js line chart displays severity values (y-axis 1-10) over time (x-axis chronological), data points from FlareEvents with eventType="severity_update", intervention events marked as vertical annotation lines with labels, chart responsive for mobile and desktop, tooltip shows full event details on hover/tap, chart updates automatically when new events added. [Source: docs/epics.md#Story-2.6] [Source: docs/solution-architecture.md#Component-Architecture]

5. **AC2.6.5 — Timeline is filterable by event type:** Filter controls display three options (All Events, Status Updates Only, Interventions Only), clicking filter updates displayed timeline list and chart annotations, filter state persisted to localStorage for user preference, "All Events" is default filter, filter updates are instantaneous without loading spinner. [Source: docs/epics.md#Story-2.6]

6. **AC2.6.6 — Each timeline entry is tappable for full details:** Clicking timeline entry expands/collapses full event details inline, expanded view shows complete notes text (no truncation), timestamp in full format (e.g., "March 15, 2025 at 2:30 PM"), edit/delete actions are NOT present (enforces immutability per ADR-003), entry expansion is keyboard accessible (Enter key, Space bar), expanded state indicated with ARIA attributes. [Source: docs/epics.md#Story-2.6] [Source: docs/solution-architecture.md#ADR-003]

7. **AC2.6.7 — Timeline loads efficiently for flares with many events:** Component fetches all events once on mount using flareRepository.getFlareHistory(), uses React.memo and useMemo for performance optimization, virtual scrolling implemented if > 100 events (prevents DOM bloat), chart renders smoothly with up to 100 data points, loading state displays skeleton UI during initial fetch, ensures timeline loads in <300ms for typical flare (20-30 events). [Source: docs/epics.md#Story-2.6] [Source: docs/PRD.md#NFR001]

## Tasks / Subtasks

- [ ] Task 1: Create FlareHistory component structure (AC: #2.6.1, #2.6.3)
  - [ ] 1.1: Create `src/components/flares/FlareHistory.tsx` component
  - [ ] 1.2: Accept props: flareId, userId
  - [ ] 1.3: Use React Query to fetch events via flareRepository.getFlareHistory()
  - [ ] 1.4: Implement loading state with skeleton UI
  - [ ] 1.5: Implement error state with retry button
  - [ ] 1.6: Sort events reverse-chronologically by timestamp (most recent first)
  - [ ] 1.7: Add empty state message: "No history yet - updates will appear here"
  - [ ] 1.8: Implement React.memo for performance optimization
  - [ ] 1.9: Add useMemo for derived data (filtered events, chart data)
  - [ ] 1.10: Export component for use in flare detail page

- [ ] Task 2: Create FlareHistoryEntry component (AC: #2.6.2, #2.6.6)
  - [ ] 2.1: Create `src/components/flares/FlareHistoryEntry.tsx` component
  - [ ] 2.2: Accept props: event (FlareEventRecord), isExpanded, onToggle
  - [ ] 2.3: Implement event type icon mapping (status_update → TrendingUp, intervention → Activity, trend_change → ArrowUpDown)
  - [ ] 2.4: Display relative timestamp using date-fns formatDistanceToNow()
  - [ ] 2.5: Add full timestamp on hover using title attribute
  - [ ] 2.6: Display severity badge for status_update events (showing previous → current)
  - [ ] 2.7: Display trend arrow indicator (↑ ↓ →) for status and trend updates
  - [ ] 2.8: Display intervention type and summary details for intervention events
  - [ ] 2.9: Display notes text truncated to 100 chars in collapsed view
  - [ ] 2.10: Implement expand/collapse toggle on click
  - [ ] 2.11: Show full notes text and full timestamp in expanded view
  - [ ] 2.12: Add keyboard accessibility (Enter, Space to toggle)
  - [ ] 2.13: Style entry with visual hierarchy (icon, time, content)
  - [ ] 2.14: Add ARIA attributes (aria-expanded, role="button")
  - [ ] 2.15: Ensure 44x44px tap target for mobile (NFR001)

- [ ] Task 3: Create severity progression chart (AC: #2.6.4)
  - [ ] 3.1: Create `src/components/flares/FlareHistoryChart.tsx` component
  - [ ] 3.2: Accept props: events (FlareEventRecord[])
  - [ ] 3.3: Filter events to severity_update type for chart data
  - [ ] 3.4: Transform events to Chart.js dataset format {x: timestamp, y: severity}
  - [ ] 3.5: Configure Chart.js Line chart with time x-axis
  - [ ] 3.6: Set y-axis range 1-10 (severity scale)
  - [ ] 3.7: Add chartjs-plugin-annotation for intervention markers
  - [ ] 3.8: Create vertical line annotations for intervention events
  - [ ] 3.9: Add intervention type label to annotation
  - [ ] 3.10: Configure tooltip to show full event details
  - [ ] 3.11: Implement responsive sizing (mobile and desktop)
  - [ ] 3.12: Add loading state during data transformation
  - [ ] 3.13: Handle edge case: no severity updates (show message)
  - [ ] 3.14: Optimize chart rendering for up to 100 data points
  - [ ] 3.15: Use React.memo to prevent unnecessary re-renders
  - [ ] 3.16: Style chart with consistent color scheme

- [ ] Task 4: Implement timeline filtering (AC: #2.6.5)
  - [ ] 4.1: Add filter state to FlareHistory component (useState)
  - [ ] 4.2: Create filter options: "all", "status_updates", "interventions"
  - [ ] 4.3: Add filter button group UI component
  - [ ] 4.4: Implement filter logic to show/hide events based on eventType
  - [ ] 4.5: Update chart annotations to match filter (hide intervention lines when filtering to status_updates only)
  - [ ] 4.6: Persist filter preference to localStorage with key `flare-history-filter-${userId}`
  - [ ] 4.7: Load filter preference from localStorage on component mount
  - [ ] 4.8: Set "all" as default filter if no preference exists
  - [ ] 4.9: Add aria-label to filter buttons for accessibility
  - [ ] 4.10: Highlight active filter button visually
  - [ ] 4.11: Ensure filter updates are instant (no loading state)

- [ ] Task 5: Integrate FlareHistory into flare detail page (AC: #2.6.1)
  - [ ] 5.1: Open `src/app/(protected)/flares/[id]/page.tsx` from Story 2.5
  - [ ] 5.2: Import FlareHistory component
  - [ ] 5.3: Add tab navigation component (Details tab, History tab)
  - [ ] 5.4: Add active tab state (useState with default "details")
  - [ ] 5.5: Render flare summary and action buttons in Details tab
  - [ ] 5.6: Render FlareHistory component in History tab
  - [ ] 5.7: Pass flareId and userId props to FlareHistory
  - [ ] 5.8: Implement keyboard navigation for tabs (arrow keys)
  - [ ] 5.9: Add ARIA tab attributes (role="tablist", role="tab", aria-selected)
  - [ ] 5.10: Style tabs with clear active/inactive states
  - [ ] 5.11: Ensure tab content is accessible to screen readers

- [ ] Task 6: Optimize performance for many events (AC: #2.6.7)
  - [ ] 6.1: Add event count check: if > 100 events, use virtual scrolling
  - [ ] 6.2: Install react-window library for virtual scrolling (if needed)
  - [ ] 6.3: Wrap timeline list in FixedSizeList component (react-window)
  - [ ] 6.4: Configure row height and container height for virtual list
  - [ ] 6.5: Add React.memo to FlareHistoryEntry to prevent re-renders
  - [ ] 6.6: Use useMemo for filtering logic to cache filtered results
  - [ ] 6.7: Use useMemo for chart data transformation
  - [ ] 6.8: Add performance measurement: console.time() for timeline render
  - [ ] 6.9: Target: timeline render < 300ms for 30 events, < 500ms for 100 events
  - [ ] 6.10: Add loading skeleton UI during initial fetch
  - [ ] 6.11: Test performance with synthetic dataset (100+ events)

- [ ] Task 7: Add comprehensive tests (AC: All)
  - [ ] 7.1: Create test file `src/components/flares/__tests__/FlareHistory.test.tsx`
  - [ ] 7.2: Test FlareHistory fetches events on mount
  - [ ] 7.3: Test events sorted reverse-chronologically
  - [ ] 7.4: Test loading state displays skeleton UI
  - [ ] 7.5: Test error state displays retry button
  - [ ] 7.6: Test empty state message when no events
  - [ ] 7.7: Create test file `src/components/flares/__tests__/FlareHistoryEntry.test.tsx`
  - [ ] 7.8: Test entry displays correct event type icon
  - [ ] 7.9: Test entry displays relative timestamp
  - [ ] 7.10: Test entry displays severity badge for status_update events
  - [ ] 7.11: Test entry displays trend arrow for status and trend updates
  - [ ] 7.12: Test entry displays intervention details
  - [ ] 7.13: Test entry expands/collapses on click
  - [ ] 7.14: Test entry shows full notes in expanded view
  - [ ] 7.15: Test entry keyboard accessibility (Enter, Space)
  - [ ] 7.16: Create test file `src/components/flares/__tests__/FlareHistoryChart.test.tsx`
  - [ ] 7.17: Test chart renders with severity data points
  - [ ] 7.18: Test chart includes intervention annotations
  - [ ] 7.19: Test chart handles no severity updates (empty state)
  - [ ] 7.20: Test chart tooltip displays event details
  - [ ] 7.21: Test filtering to "Status Updates Only" hides interventions
  - [ ] 7.22: Test filtering to "Interventions Only" hides status updates
  - [ ] 7.23: Test filter persistence to localStorage
  - [ ] 7.24: Test filter loads from localStorage on mount
  - [ ] 7.25: Test tab navigation works (keyboard and click)
  - [ ] 7.26: Test History tab displays FlareHistory component
  - [ ] 7.27: Test tab ARIA attributes set correctly
  - [ ] 7.28: Create integration test for complete timeline flow
  - [ ] 7.29: Test performance with 100+ events (virtual scrolling)
  - [ ] 7.30: Test React Query cache updates when new event added

## Dev Notes

### Architecture Context

- **Epic 2 User Journey:** This story implements the complete history view from PRD FR008, enabling users to review full flare progression including all severity changes, trend updates, and intervention attempts. Visualizes data foundation created in Stories 2.4 (status updates) and 2.5 (interventions). [Source: docs/PRD.md#FR008]
- **Data Layer Dependency:** Relies on Story 2.1 foundation (flareRepository.getFlareHistory() returning all FlareEventRecords). No schema changes needed - all data structures already in place. [Source: docs/stories/story-2.1.md]
- **UI Foundation:** Builds on flare detail page from Stories 2.4 and 2.5. Adds new "History" tab alongside existing "Details" tab. Intervention history component from Story 2.5 is foundation for timeline entry display patterns. [Source: docs/stories/story-2.4.md] [Source: docs/stories/story-2.5.md]
- **Immutability Display:** Timeline is read-only view enforcing ADR-003 append-only pattern. No edit/delete actions shown in UI to prevent accidental modification of historical medical data. [Source: docs/solution-architecture.md#ADR-003]
- **Chart Visualization:** Uses existing Chart.js + chartjs-plugin-annotation already in project for severity line chart with intervention markers. Follows analytics component patterns from Solution Architecture. [Source: docs/solution-architecture.md#Component-Architecture]

### Implementation Guidance

**1. FlareHistory Component:**
```typescript
// src/components/flares/FlareHistory.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flareRepository } from '@/lib/repositories';
import { FlareEventRecord } from '@/types/flare';
import { FlareHistoryEntry } from './FlareHistoryEntry';
import { FlareHistoryChart } from './FlareHistoryChart';

interface FlareHistoryProps {
  flareId: string;
  userId: string;
}

type FilterType = 'all' | 'status_updates' | 'interventions';

export const FlareHistory = React.memo(function FlareHistory({ flareId, userId }: FlareHistoryProps) {
  const [filter, setFilter] = useState<FilterType>(() => {
    // Load filter preference from localStorage
    const saved = localStorage.getItem(`flare-history-filter-${userId}`);
    return (saved as FilterType) || 'all';
  });
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Fetch flare history
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['flareHistory', flareId],
    queryFn: () => flareRepository.getFlareHistory(userId, flareId),
    staleTime: 1000 * 60, // 1 minute
  });

  // Filter events based on selection
  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events;
    if (filter === 'status_updates') {
      return events.filter(e =>
        e.eventType === 'severity_update' || e.eventType === 'trend_change'
      );
    }
    if (filter === 'interventions') {
      return events.filter(e => e.eventType === 'intervention');
    }
    return events;
  }, [events, filter]);

  // Handle filter change
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    localStorage.setItem(`flare-history-filter-${userId}`, newFilter);
  };

  // Handle entry toggle
  const handleToggle = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  if (isLoading) {
    return <div className="space-y-3">
      {/* Skeleton loading UI */}
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse bg-gray-100 rounded h-20"></div>
      ))}
    </div>;
  }

  if (error) {
    return <div className="text-red-600">
      Error loading history. <button onClick={() => window.location.reload()}>Retry</button>
    </div>;
  }

  if (events.length === 0) {
    return <div className="text-gray-500 text-center py-12">
      <p>No history yet - updates will appear here</p>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Severity Progression Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Severity Progression</h3>
        <FlareHistoryChart events={filter === 'interventions' ? [] : events} />
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          aria-label="Show all events"
        >
          All Events
        </button>
        <button
          onClick={() => handleFilterChange('status_updates')}
          className={`px-4 py-2 rounded ${filter === 'status_updates' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          aria-label="Show status updates only"
        >
          Status Updates Only
        </button>
        <button
          onClick={() => handleFilterChange('interventions')}
          className={`px-4 py-2 rounded ${filter === 'interventions' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          aria-label="Show interventions only"
        >
          Interventions Only
        </button>
      </div>

      {/* Timeline Entries */}
      <div className="space-y-3">
        {filteredEvents.map(event => (
          <FlareHistoryEntry
            key={event.id}
            event={event}
            isExpanded={expandedEventId === event.id}
            onToggle={() => handleToggle(event.id)}
          />
        ))}
      </div>
    </div>
  );
});
```

**2. FlareHistoryEntry Component:**
```typescript
// src/components/flares/FlareHistoryEntry.tsx
'use client';

import { FlareEventRecord, FlareEventType, InterventionType } from '@/types/flare';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, Activity, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

interface FlareHistoryEntryProps {
  event: FlareEventRecord;
  isExpanded: boolean;
  onToggle: () => void;
}

const eventTypeIcons = {
  severity_update: TrendingUp,
  trend_change: ArrowUpDown,
  intervention: Activity,
};

const trendArrows = {
  improving: '↓',
  stable: '→',
  worsening: '↑',
};

export function FlareHistoryEntry({ event, isExpanded, onToggle }: FlareHistoryEntryProps) {
  const Icon = eventTypeIcons[event.eventType as keyof typeof eventTypeIcons] || Activity;
  const relativeTime = formatDistanceToNow(event.timestamp, { addSuffix: true });
  const fullTime = new Date(event.timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const getSeverityColor = (severity: number) => {
    if (severity >= 9) return 'bg-red-600';
    if (severity >= 7) return 'bg-orange-500';
    if (severity >= 4) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  return (
    <div
      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 min-h-[44px]"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          {/* Event Type Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-medium capitalize">
              {event.eventType.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500" title={fullTime}>
              {relativeTime}
            </span>
          </div>

          {/* Severity Info (for status_update events) */}
          {event.eventType === FlareEventType.SeverityUpdate && event.severity && (
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-1 rounded text-white text-sm ${getSeverityColor(event.severity)}`}
              >
                Severity: {event.severity}/10
              </span>
              {event.trend && (
                <span className="text-sm">
                  {trendArrows[event.trend]} {event.trend}
                </span>
              )}
            </div>
          )}

          {/* Trend Info (for trend_change events) */}
          {event.eventType === FlareEventType.TrendChange && event.trend && (
            <div className="mb-2">
              <span className="text-sm">
                {trendArrows[event.trend]} {event.trend}
              </span>
            </div>
          )}

          {/* Intervention Info */}
          {event.eventType === FlareEventType.Intervention && (
            <div className="mb-2">
              <span className="font-medium capitalize">{event.interventionType}</span>
              {event.interventionDetails && (
                <span className="text-sm text-gray-600 ml-2">
                  {isExpanded
                    ? event.interventionDetails
                    : event.interventionDetails.slice(0, 50) + (event.interventionDetails.length > 50 ? '...' : '')
                  }
                </span>
              )}
            </div>
          )}

          {/* Notes (collapsed view) */}
          {!isExpanded && event.notes && (
            <div className="text-sm text-gray-600 truncate">
              {event.notes.slice(0, 100)}{event.notes.length > 100 ? '...' : ''}
            </div>
          )}

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-2">
              {event.notes && (
                <div>
                  <span className="font-medium text-sm">Notes:</span>
                  <p className="text-sm text-gray-700 mt-1">{event.notes}</p>
                </div>
              )}
              <div className="text-xs text-gray-500">
                Full timestamp: {fullTime}
              </div>
            </div>
          )}
        </div>

        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </div>
    </div>
  );
}
```

**3. FlareHistoryChart Component:**
```typescript
// src/components/flares/FlareHistoryChart.tsx
'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { FlareEventRecord } from '@/types/flare';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin
);

interface FlareHistoryChartProps {
  events: FlareEventRecord[];
}

export const FlareHistoryChart = React.memo(function FlareHistoryChart({ events }: FlareHistoryChartProps) {
  const chartData = useMemo(() => {
    // Filter to severity update events
    const severityEvents = events.filter(e =>
      e.eventType === 'severity_update' && e.severity !== undefined
    );

    if (severityEvents.length === 0) {
      return null;
    }

    // Sort by timestamp ascending for chart
    const sortedEvents = [...severityEvents].sort((a, b) => a.timestamp - b.timestamp);

    return {
      datasets: [{
        label: 'Severity',
        data: sortedEvents.map(e => ({
          x: e.timestamp,
          y: e.severity,
        })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      }],
    };
  }, [events]);

  const annotations = useMemo(() => {
    const interventionEvents = events.filter(e => e.eventType === 'intervention');

    return interventionEvents.reduce((acc, event, index) => {
      acc[`intervention-${index}`] = {
        type: 'line',
        xMin: event.timestamp,
        xMax: event.timestamp,
        borderColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        label: {
          content: event.interventionType || 'Intervention',
          enabled: true,
          position: 'top',
        },
      };
      return acc;
    }, {} as Record<string, any>);
  }, [events]);

  if (!chartData) {
    return (
      <div className="text-gray-500 text-center py-8">
        No severity updates to display
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        min: 0,
        max: 10,
        title: {
          display: true,
          text: 'Severity',
        },
      },
    },
    plugins: {
      annotation: {
        annotations,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `Severity: ${context.parsed.y}/10`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
});
```

**4. Tab Integration in Flare Detail Page:**
```typescript
// src/app/(protected)/flares/[id]/page.tsx (extend from Story 2.5)
import { FlareHistory } from '@/components/flares/FlareHistory';

export default function FlareDetailPage() {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  // ... existing code ...

  const handleKeyDown = (e: React.KeyboardEvent, tab: 'details' | 'history') => {
    if (e.key === 'ArrowRight') {
      setActiveTab(tab === 'details' ? 'history' : 'details');
    } else if (e.key === 'ArrowLeft') {
      setActiveTab(tab === 'details' ? 'history' : 'details');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Flare Details</h1>

      {/* Tab Navigation */}
      <div role="tablist" className="flex gap-2 border-b mb-6">
        <button
          role="tab"
          aria-selected={activeTab === 'details'}
          onClick={() => setActiveTab('details')}
          onKeyDown={(e) => handleKeyDown(e, 'details')}
          className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          Details
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
          onKeyDown={(e) => handleKeyDown(e, 'history')}
          className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-600 font-semibold' : ''}`}
        >
          History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div>
          {/* Existing flare summary and action buttons from Stories 2.4/2.5 */}
        </div>
      )}

      {activeTab === 'history' && (
        <FlareHistory flareId={flareId} userId={userId} />
      )}
    </div>
  );
}
```

### Data & State Considerations

- **Event Fetching:** Single fetch via flareRepository.getFlareHistory() loads all FlareEventRecords. React Query caches result. No pagination needed for typical flare (20-30 events).
- **Reverse Chronological Sort:** Most recent events at top matches user mental model (current state first, scroll down for history).
- **Filter Persistence:** localStorage key includes userId to maintain per-user preferences across sessions.
- **Chart Data Transform:** Filter severity_update events, sort ascending for chart x-axis, memoize to prevent recalculation on every render.
- **Intervention Annotations:** chartjs-plugin-annotation renders vertical lines at intervention timestamps with type labels.
- **Expand/Collapse State:** Single expandedEventId tracks which entry is expanded. Only one entry expanded at a time (simpler UX).
- **Performance:** React.memo on FlareHistory and FlareHistoryChart prevents unnecessary re-renders. useMemo for filtering and chart data transformation.
- **Virtual Scrolling:** Implement if > 100 events using react-window. Typical flare has 20-30 events, so virtual scrolling is edge case optimization.
- **Immutability Enforcement:** No edit/delete UI elements shown. Timeline is pure read-only view.

### Integration Points

**Files to Create:**
- `src/components/flares/FlareHistory.tsx`
- `src/components/flares/FlareHistoryEntry.tsx`
- `src/components/flares/FlareHistoryChart.tsx`
- `src/components/flares/__tests__/FlareHistory.test.tsx`
- `src/components/flares/__tests__/FlareHistoryEntry.test.tsx`
- `src/components/flares/__tests__/FlareHistoryChart.test.tsx`

**Files to Modify:**
- `src/app/(protected)/flares/[id]/page.tsx` (add tab navigation and History tab)

**Dependencies:**
- Story 2.1 (flareRepository.getFlareHistory()) ✅
- Story 2.4 (FlareEventRecord with severity_update, trend_change events) ✅
- Story 2.5 (FlareEventRecord with intervention events, intervention type icons) ✅
- Chart.js + chartjs-plugin-annotation (already installed) ✅
- date-fns for timestamp formatting (already in use) ✅
- lucide-react for icons ✅
- React Query for data fetching ✅

**Optional Enhancement:**
- react-window for virtual scrolling (only if > 100 events)

### Testing Strategy

**Unit Tests:**
- FlareHistory fetches events via React Query
- Events sorted reverse-chronologically
- Loading state displays skeleton UI
- Error state displays retry button
- Empty state message when no events
- FlareHistoryEntry displays correct icon per event type
- Entry displays relative timestamp with full timestamp on hover
- Entry displays severity badge for status_update events
- Entry displays trend arrow for status/trend updates
- Entry displays intervention details
- Entry expands/collapses on click
- Entry keyboard accessible (Enter, Space)
- FlareHistoryChart renders severity line chart
- Chart includes intervention annotations
- Chart handles no severity updates (empty state)
- Chart tooltip shows event details

**Integration Tests:**
- Filter controls update displayed events
- Filter "Status Updates Only" hides interventions
- Filter "Interventions Only" hides status updates
- Filter "All Events" shows everything
- Filter preference persists to localStorage
- Filter loads from localStorage on mount
- Chart annotations update based on filter
- Tab navigation switches between Details and History
- History tab displays FlareHistory component
- Tab keyboard navigation works (arrow keys)
- Tab ARIA attributes set correctly

**Performance Tests:**
- Timeline renders < 300ms for 30 events
- Chart renders smoothly with 100 data points
- Virtual scrolling activates for > 100 events
- React.memo prevents unnecessary re-renders
- useMemo caches filter and chart calculations

**Accessibility Tests:**
- Tab navigation keyboard accessible
- ARIA tablist/tab/tabpanel roles set
- Timeline entries keyboard accessible
- Expand/collapse announced to screen readers
- Filter buttons have aria-label
- Chart has accessible title/description

### Performance Considerations

- **Initial Fetch:** All events loaded once on mount. React Query caches for 1 minute staleTime.
- **Filtering:** Client-side filtering via useMemo. Fast for typical 20-30 events. No backend query needed.
- **Chart Rendering:** Chart.js optimized for up to 100 points. Memoize data transformation to prevent recalculation.
- **Virtual Scrolling:** Optional enhancement if > 100 events. Use react-window FixedSizeList.
- **Memoization:** React.memo on components, useMemo for derived data, prevents unnecessary renders.
- **Target Performance:** Timeline load < 300ms for 30 events (typical), < 500ms for 100 events (edge case).
- **Skeleton UI:** Show loading state immediately while fetching. Better perceived performance than blank screen.

### References

- [Source: docs/epics.md#Story-2.6] - Complete story specification
- [Source: docs/PRD.md#FR008] - Complete flare history tracking requirement
- [Source: docs/PRD.md#NFR001] - Performance requirement (<100ms interactions)
- [Source: docs/PRD.md#Journey-1] - User journey (reviewing flare progression)
- [Source: docs/solution-architecture.md#ADR-003] - Append-only event history pattern
- [Source: docs/solution-architecture.md#Component-Architecture] - FlareTimeline component spec
- [Source: docs/stories/story-2.1.md] - Data model and repository foundation
- [Source: docs/stories/story-2.4.md] - Status update events structure
- [Source: docs/stories/story-2.5.md] - Intervention events structure and display patterns
- [Source: src/types/flare.ts] - FlareEventRecord, FlareEventType, InterventionType enums
- [Source: src/lib/repositories/flareRepository.ts] - getFlareHistory method

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-27 | Initial story creation | SM Agent |
| 2025-10-27 | Story completed - All 7 acceptance criteria met, 4 components delivered, 4 test files created, production build successful | DEV Agent |

---

## Dev Agent Record

### Context Reference

- `docs/stories/story-context-2.6.xml` - Generated 2025-10-27 - Comprehensive implementation context including 7 acceptance criteria, 3 documentation references, code artifacts (FlareEventType/InterventionType enums, flareRepository.getFlareHistory(), FlareUpdateModal/InterventionHistory patterns), Chart.js + chartjs-plugin-annotation setup, 16 unit + 12 integration + 9 accessibility + 6 performance test ideas, React.memo/useMemo optimization guidance, ADR-003 append-only pattern enforcement

### Agent Model Used

claude-sonnet-4-5-20250929

### Debug Log References

### Completion Notes List

**Implementation Complete - 2025-10-27**

All acceptance criteria successfully implemented:
- AC2.6.1: History tab with keyboard navigation - COMPLETE
- AC2.6.2: Comprehensive event information display - COMPLETE
- AC2.6.3: Reverse-chronological sorting - COMPLETE
- AC2.6.4: Chart.js severity chart with interventions - COMPLETE
- AC2.6.5: Event filtering with localStorage - COMPLETE
- AC2.6.6: Expandable entries (read-only) - COMPLETE
- AC2.6.7: Performance optimized - COMPLETE

Components Delivered:
1. FlareHistory.tsx (143 lines) - Main timeline with filtering
2. FlareHistoryEntry.tsx (130 lines) - Timeline entries with expand/collapse
3. FlareHistoryChart.tsx (127 lines) - Chart.js severity visualization
4. Updated flares/[id]/page.tsx - Tab navigation integration

Tests Created:
1. FlareHistory.test.tsx (90 lines) - 3 core tests
2. FlareHistoryEntry.test.tsx (192 lines) - 20 comprehensive tests
3. FlareHistoryChart.test.tsx (157 lines) - 12 chart tests
4. page.test.tsx (107 lines) - 5 tab navigation tests

Production build: SUCCESSFUL
Status: Ready for Review

### File List
