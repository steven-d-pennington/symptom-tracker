'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import { BodyMarkerEventRecord } from '@/lib/db/schema';
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
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`flare-history-filter-${userId}`);
      return (saved as FilterType) || 'all';
    }
    return 'all';
  });
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<BodyMarkerEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch flare history
  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await bodyMarkerRepository.getMarkerHistory(userId, flareId);
      setEvents(history);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, flareId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
    if (typeof window !== 'undefined') {
      localStorage.setItem(`flare-history-filter-${userId}`, newFilter);
    }
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
      Error loading history. <button onClick={() => window.location.reload()} className="underline">Retry</button>
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
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded min-h-[44px] ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          aria-label="Show all events"
        >
          All Events
        </button>
        <button
          onClick={() => handleFilterChange('status_updates')}
          className={`px-4 py-2 rounded min-h-[44px] ${filter === 'status_updates' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          aria-label="Show status updates only"
        >
          Status Updates Only
        </button>
        <button
          onClick={() => handleFilterChange('interventions')}
          className={`px-4 py-2 rounded min-h-[44px] ${filter === 'interventions' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          aria-label="Show interventions only"
        >
          Interventions Only
        </button>
      </div>

      {/* Timeline Entries */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <p>No events match the current filter</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <FlareHistoryEntry
              key={event.id}
              event={event}
              isExpanded={expandedEventId === event.id}
              onToggle={() => handleToggle(event.id)}
            />
          ))
        )}
      </div>
    </div>
  );
});
