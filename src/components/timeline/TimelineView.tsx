"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { userRepository } from '@/lib/repositories/userRepository';
import { medicationEventRepository } from '@/lib/repositories/medicationEventRepository';
import { triggerEventRepository } from '@/lib/repositories/triggerEventRepository';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { medicationRepository } from '@/lib/repositories/medicationRepository';
import { triggerRepository } from '@/lib/repositories/triggerRepository';
import EventDetailModal from './EventDetailModal';

// Timeline event types
export type TimelineEventType = 'medication' | 'symptom' | 'trigger' | 'flare-created' | 'flare-updated' | 'flare-resolved';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number;
  summary: string;
  details?: any;
  eventRef: any;
  hasDetails?: boolean;
}

interface TimelineViewProps {
  onEventTap?: (event: TimelineEvent) => void;
  onAddDetails?: (event: TimelineEvent) => void;
}

interface DayGroup {
  date: Date;
  dateLabel: string;
  events: TimelineEvent[];
}

const TimelineView: React.FC<TimelineViewProps> = ({
  onEventTap,
  onAddDetails
}) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load events for the current date range
  const loadEvents = async (date: Date, append = false) => {
    try {
      const user = await userRepository.getOrCreateCurrentUser();
      const userId = user.id;

      // Calculate date range for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Query all event types in parallel
      const [medicationEvents, triggerEvents, activeFlares] = await Promise.all([
        medicationEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime()),
        triggerEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime()),
        flareRepository.getActiveFlaresWithTrend(userId)
      ]);

      const medicationIds = Array.from(new Set(medicationEvents.map(event => event.medicationId)));
      const triggerIds = Array.from(new Set(triggerEvents.map(event => event.triggerId)));

      const medicationRecords = medicationIds.length > 0
        ? await Promise.all(medicationIds.map(id => medicationRepository.getById(id)))
        : [];

      const triggerRecords = triggerIds.length > 0
        ? await Promise.all(triggerIds.map(id => triggerRepository.getById(id)))
        : [];

      const medicationNameById = new Map<string, string>();
      medicationRecords.forEach((record, index) => {
        if (record) {
          medicationNameById.set(medicationIds[index], record.name);
        }
      });

      const triggerNameById = new Map<string, string>();
      triggerRecords.forEach((record, index) => {
        if (record) {
          triggerNameById.set(triggerIds[index], record.name);
        }
      });

      // Convert to timeline events
      const timelineEvents: TimelineEvent[] = [];

      // Medication events
      medicationEvents.forEach(event => {
        const medication = medicationNameById.get(event.medicationId) || 'Unknown medication';
        const taken = event.taken;
        const summary = `💊 ${medication} (${taken ? 'taken' : 'skipped'})`;
        timelineEvents.push({
          id: event.id,
          type: 'medication',
          timestamp: event.timestamp,
          summary,
          details: event.notes,
          eventRef: event,
          hasDetails: !!event.notes
        });
      });

      // Trigger events
      triggerEvents.forEach(event => {
        const trigger = triggerNameById.get(event.triggerId) || 'Unknown trigger';
        const intensity = event.intensity;
        const summary = `⚠️ ${trigger} (${intensity} intensity)`;
        timelineEvents.push({
          id: event.id,
          type: 'trigger',
          timestamp: event.timestamp,
          summary,
          details: event.notes,
          eventRef: event,
          hasDetails: !!event.notes
        });
      });

      // Flare events (creation, updates, resolution)
      activeFlares.forEach(flare => {
        const location = flare.bodyRegions.length > 0 ? flare.bodyRegions[0] : 'Unknown location';

        // Flare created event
        timelineEvents.push({
          id: `${flare.id}-created`,
          type: 'flare-created',
          timestamp: flare.startDate.getTime(),
          summary: `🔥 ${location} flare started, severity ${flare.severity}/10`,
          details: flare.notes,
          eventRef: flare,
          hasDetails: !!flare.notes
        });

        // If flare has severity history, add update events
        const severityHistory = (flare as any).severityHistory || [];
        if (severityHistory.length > 1) {
          severityHistory.slice(1).forEach((update: any, index: number) => {
            const prevSeverity = severityHistory[index].severity;
            const change = update.severity - prevSeverity;
            const changeText = change > 0 ? `(+${change})` : change < 0 ? `(${change})` : '';
            timelineEvents.push({
              id: `${flare.id}-update-${index}`,
              type: 'flare-updated',
              timestamp: update.timestamp,
              summary: `🔥 ${location} updated: ${update.severity}/10 ${changeText}`,
              details: update.notes,
              eventRef: { flare, update },
              hasDetails: !!update.notes
            });
          });
        }

        // If flare is resolved, add resolution event
        if (flare.endDate) {
          const resolutionNotes = (flare as any).resolutionNotes;
          timelineEvents.push({
            id: `${flare.id}-resolved`,
            type: 'flare-resolved',
            timestamp: flare.endDate.getTime(),
            summary: `🔥 ${location} flare resolved`,
            details: resolutionNotes,
            eventRef: flare,
            hasDetails: !!resolutionNotes
          });
        }
      });

      // Sort by timestamp descending (most recent first)
      timelineEvents.sort((a, b) => b.timestamp - a.timestamp);

      if (append) {
        setEvents(prev => [...prev, ...timelineEvents]);
      } else {
        setEvents(timelineEvents);
      }
    } catch (err) {
      console.error('Error loading timeline events:', err);
      setError('Failed to load timeline events');
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitialEvents = async () => {
      setLoading(true);
      setError(null);
      await loadEvents(currentDate);
      setLoading(false);
    };

    loadInitialEvents();
  }, [currentDate]);

  // Group events by day
  const groupedEvents = useMemo((): DayGroup[] => {
    const groups: { [key: string]: DayGroup } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    events.forEach(event => {
      const eventDate = new Date(event.timestamp);
      eventDate.setHours(0, 0, 0, 0);
      const dateKey = eventDate.toISOString().split('T')[0];

      if (!groups[dateKey]) {
        let dateLabel: string;
        const diffDays = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          dateLabel = 'Today';
        } else if (diffDays === 1) {
          dateLabel = 'Yesterday';
        } else if (diffDays <= 7) {
          dateLabel = eventDate.toLocaleDateString('en-US', { weekday: 'long' });
        } else {
          dateLabel = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        groups[dateKey] = {
          date: eventDate,
          dateLabel,
          events: []
        };
      }

      groups[dateKey].events.push(event);
    });

    // Sort groups by date descending
    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [events]);

  // Load previous day
  const loadPreviousDay = async () => {
    setLoadingMore(true);
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    await loadEvents(prevDate, true);
    setCurrentDate(prevDate);
    setLoadingMore(false);
  };

  // Format time
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle event tap
  const handleEventTap = (event: TimelineEvent) => {
    if (onEventTap) {
      onEventTap(event);
    } else {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  // Handle add details
  const handleAddDetails = (event: TimelineEvent) => {
    if (onAddDetails) {
      onAddDetails(event);
    } else {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Handle modal save
  const handleModalSave = () => {
    // Reload events to reflect changes
    loadEvents(currentDate);
  };

  // Handle modal delete
  const handleModalDelete = () => {
    // Reload events to reflect deletion
    loadEvents(currentDate);
  };

  if (loading) {
    return (
      <div className="w-full md:w-2/3 space-y-4">
        {/* Skeleton loading */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="space-y-2">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:w-2/3 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-2/3 space-y-6">
      {groupedEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No events today yet. Use quick-log buttons above to get started!
          </p>
        </div>
      ) : (
        groupedEvents.map((group) => (
          <div key={group.dateLabel} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              {group.dateLabel}
            </h3>
            <div className="space-y-2">
              {group.events.map((event) => (
                <article
                  key={event.id}
                  id={`timeline-event-${event.id}`}
                  className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleEventTap(event)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleEventTap(event);
                    }
                  }}
                  aria-label={`Event: ${event.summary} at ${formatTime(event.timestamp)}`}
                >
                  <time
                    className="flex-shrink-0 text-sm text-gray-500 font-mono"
                    dateTime={new Date(event.timestamp).toISOString()}
                  >
                    {formatTime(event.timestamp)}
                  </time>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 truncate">{event.summary}</p>
                      {!event.hasDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddDetails(event);
                          }}
                          className="ml-2 flex items-center text-blue-600 hover:text-blue-800 text-sm min-h-[44px] min-w-[44px]"
                          aria-label="Add details to this event"
                        >
                          Add details
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                    {event.details && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {event.details}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Load previous day button */}
      <div className="text-center pt-4">
        <button
          onClick={loadPreviousDay}
          disabled={loadingMore}
          className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto",
            loadingMore && "cursor-not-allowed"
          )}
          aria-label="Load events from previous day"
        >
          {loadingMore ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            'Load previous day'
          )}
        </button>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        onDelete={handleModalDelete}
      />
    </div>
  );
};

export default TimelineView;