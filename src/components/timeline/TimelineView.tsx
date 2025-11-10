"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { medicationEventRepository } from '@/lib/repositories/medicationEventRepository';
import { triggerEventRepository } from '@/lib/repositories/triggerEventRepository';
import { flareRepository } from '@/lib/repositories/flareRepository';
import { medicationRepository } from '@/lib/repositories/medicationRepository';
import { triggerRepository } from '@/lib/repositories/triggerRepository';
import { foodEventRepository } from '@/lib/repositories/foodEventRepository';
import { foodRepository } from '@/lib/repositories/foodRepository';
import { symptomInstanceRepository } from '@/lib/repositories/symptomInstanceRepository';
import { correlationRepository } from '@/lib/repositories/correlationRepository';
import EventDetailModal from './EventDetailModal';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import type { CorrelationRecord } from '@/lib/db/schema';
import { detectRecurringSequences, type DetectedPattern } from '@/lib/services/patternDetectionService';

// Timeline event types
export type TimelineEventType = 'medication' | 'symptom' | 'trigger' | 'flare-created' | 'flare-updated' | 'flare-resolved' | 'food';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: number;
  summary: string;
  details?: any;
  eventRef: any;
  hasDetails?: boolean;
  allergens?: string[]; // for food events: aggregated allergen tags
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
  const { userId } = useCurrentUser();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedFood, setExpandedFood] = useState<Set<string>>(new Set());
  const [mountTimestamp] = useState(() => Date.now()); // Unique value per mount

  // Story 6.5: Pattern detection correlation state
  const [correlations, setCorrelations] = useState<CorrelationRecord[]>([]);
  const [correlationsLoading, setCorrelationsLoading] = useState(false);
  const [correlationsError, setCorrelationsError] = useState<string | null>(null);

  // Story 6.5: Detected patterns state
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [patternsLoading, setPatternsLoading] = useState(false);

  // Load events for the current date range
  const loadEvents = async (date: Date, append = false) => {
    try {
      if (!userId) {
        return;
      }

      // Calculate date range for the day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Query all event types in parallel
      const [medicationEvents, triggerEvents, symptomInstances, flareRecords, foodEvents] = await Promise.all([
        medicationEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime()),
        triggerEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime()),
        symptomInstanceRepository.getByDateRange(userId, startOfDay, endOfDay),
        flareRepository.getActiveFlares(userId), // Story 2.1: Use new API
        foodEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime())
      ]);

      console.log("📊 Timeline query for date:", date.toLocaleDateString(), {
        dateRange: {
          start: startOfDay.toLocaleString(),
          startMs: startOfDay.getTime(),
          end: endOfDay.toLocaleString(),
          endMs: endOfDay.getTime(),
        },
        counts: {
          medicationEvents: medicationEvents.length,
          triggerEvents: triggerEvents.length,
          symptomInstances: symptomInstances.length,
          flareRecords: flareRecords.length,
          foodEvents: foodEvents.length,
        },
        foodEventDetails: foodEvents.map(e => ({
          id: e.id,
          timestamp: e.timestamp,
          timestampDate: new Date(e.timestamp).toLocaleString(),
          mealType: e.mealType,
          foodIds: e.foodIds,
        })),
      });

      // Story 2.1: Convert flareRecords to ActiveFlare format with trends
      const activeFlares = await Promise.all(
        flareRecords.map(async (flare) => {
          const events = await flareRepository.getFlareHistory(userId, flare.id);

          // Calculate trend from event history
          const severityEvents = events.filter(
            e => e.severity !== undefined && (e.eventType === 'created' || e.eventType === 'severity_update')
          ).sort((a, b) => a.timestamp - b.timestamp);

          let trend: 'worsening' | 'stable' | 'improving' = 'stable';
          if (severityEvents.length >= 2) {
            const recent = severityEvents.slice(-2);
            const change = recent[1].severity! - recent[0].severity!;
            if (change > 0) trend = 'worsening';
            else if (change < 0) trend = 'improving';
          }

          // Convert to ActiveFlare format
          return {
            id: flare.id,
            userId: flare.userId,
            symptomName: flare.bodyRegionId,
            bodyRegions: [flare.bodyRegionId],
            severity: flare.currentSeverity,
            status: flare.status,
            startDate: new Date(flare.startDate),
            endDate: flare.endDate ? new Date(flare.endDate) : undefined,
            notes: undefined, // Notes are in event history now
            trend,
          };
        })
      );

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

      // Prepare food name lookup
      const allFoodIds: string[] = [];
      foodEvents.forEach(evt => {
        try {
          const ids = JSON.parse(evt.foodIds) as string[];
          allFoodIds.push(...ids);
        } catch {
          // ignore parse errors
        }
      });
      const uniqueFoodIds = Array.from(new Set(allFoodIds));
      const foodRecords = uniqueFoodIds.length > 0
        ? await Promise.all(uniqueFoodIds.map(id => foodRepository.getById(id)))
        : [];
      const foodNameById = new Map<string, string>();
      const allergenById = new Map<string, string[]>();
      foodRecords.forEach((record, index) => {
        const id = uniqueFoodIds[index];
        if (record) {
          foodNameById.set(id, record.name);
          try {
            allergenById.set(id, JSON.parse(record.allergenTags) as string[]);
          } catch {
            allergenById.set(id, []);
          }
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
        console.log("➕ Adding trigger event to timeline:", {
          id: event.id,
          trigger,
          intensity,
          timestamp: event.timestamp,
          timestampDate: new Date(event.timestamp).toLocaleString(),
          summary,
        });
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

      // Symptom events (Story 3.5.11: Add symptom logging display)
      symptomInstances.forEach(symptom => {
        const severity = symptom.severity;
        const location = symptom.location ? ` (${symptom.location})` : '';
        const summary = `🩺 ${symptom.name} - severity ${severity}/10${location}`;
        console.log("➕ Adding symptom event to timeline:", {
          id: symptom.id,
          name: symptom.name,
          severity,
          location,
          timestamp: symptom.timestamp.getTime(),
          timestampDate: symptom.timestamp.toLocaleString(),
          summary,
        });
        timelineEvents.push({
          id: symptom.id,
          type: 'symptom',
          timestamp: symptom.timestamp.getTime(),
          summary,
          details: symptom.notes,
          eventRef: symptom,
          hasDetails: !!symptom.notes
        });
      });

      // Flare events (creation, updates, resolution)
      // Filter flares to only those with events in the current date range
      activeFlares.forEach(flare => {
        const location = flare.bodyRegions.length > 0 ? flare.bodyRegions[0] : 'Unknown location';

        // Track if this flare has any events in the current date range
        let hasEventsInRange = false;

        // Flare created event (only if within date range)
        const flareStartTime = flare.startDate.getTime();
        if (flareStartTime >= startOfDay.getTime() && flareStartTime <= endOfDay.getTime()) {
          hasEventsInRange = true;
          timelineEvents.push({
            id: `${flare.id}-created`,
            type: 'flare-created',
            timestamp: flareStartTime,
            summary: `🔥 ${location} flare started, severity ${flare.severity}/10`,
            details: flare.notes,
            eventRef: flare,
            hasDetails: !!flare.notes
          });
        }

        // If flare has severity history, add update events (only those within date range)
        const severityHistory = (flare as any).severityHistory || [];
        if (severityHistory.length > 1) {
          severityHistory.slice(1).forEach((update: any, index: number) => {
            if (update.timestamp >= startOfDay.getTime() && update.timestamp <= endOfDay.getTime()) {
              hasEventsInRange = true;
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
            }
          });
        }

        // If flare is resolved, add resolution event (only if within date range)
        if (flare.endDate) {
          const flareEndTime = flare.endDate.getTime();
          if (flareEndTime >= startOfDay.getTime() && flareEndTime <= endOfDay.getTime()) {
            hasEventsInRange = true;
            const resolutionNotes = (flare as any).resolutionNotes;
            timelineEvents.push({
              id: `${flare.id}-resolved`,
              type: 'flare-resolved',
              timestamp: flareEndTime,
              summary: `🔥 ${location} flare resolved`,
              details: resolutionNotes,
              eventRef: flare,
              hasDetails: !!resolutionNotes
            });
          }
        }
      });

      // Food events (meals grouped by mealId)
      foodEvents.forEach(event => {
        let foods: string[] = [];
        let portions: Record<string, string> = {};
        try {
          const ids = JSON.parse(event.foodIds) as string[];
          foods = ids.map(id => foodNameById.get(id) || id);
        } catch {}
        try {
          portions = JSON.parse(event.portionMap) as Record<string, string>;
        } catch {}

        const portionAbbrev = (p?: string) => {
          switch (p) {
            case 'small': return 'S';
            case 'medium': return 'M';
            case 'large': return 'L';
            default: return '';
          }
        };

        // Build collapsed summary: "MealType: Food1 (M), Food2 (S)"
        let collapsedList = '';
        let allergenList: string[] = [];
        try {
          const foodIdsParsed = JSON.parse(event.foodIds) as string[];
          collapsedList = foodIdsParsed.map(fid => {
            const name = foodNameById.get(fid) || fid;
            const abbrev = portionAbbrev(portions[fid]);
            return abbrev ? `${name} (${abbrev})` : name;
          }).join(', ');

          // Build allergen list
          allergenList = foodIdsParsed
            .flatMap(fid => allergenById.get(fid) || [])
            .filter((v, i, a) => a.indexOf(v) === i);
        } catch (error) {
          console.error('[TimelineView] Failed to parse foodIds for event:', event.id, error);
          collapsedList = 'Invalid food data';
        }

        const mealType = event.mealType;
        const summary = `🍽️ Meal (${mealType}): ${collapsedList}`;
        const detailsParts: string[] = [];
        if (event.notes) detailsParts.push(`Notes: ${event.notes}`);
        if (allergenList.length > 0) detailsParts.push(`Allergens: ${allergenList.join(', ')}`);
        const details = detailsParts.join(' \u2014 ');

        timelineEvents.push({
          id: event.id,
          type: 'food',
          timestamp: event.timestamp,
          summary,
          details: details || undefined,
          eventRef: event,
          hasDetails: !!details,
          allergens: allergenList
        });
      });

      // Sort by timestamp descending (most recent first)
      timelineEvents.sort((a, b) => b.timestamp - a.timestamp);

      console.log("✅ Timeline events ready to display:", {
        totalEvents: timelineEvents.length,
        byType: {
          medication: timelineEvents.filter(e => e.type === 'medication').length,
          trigger: timelineEvents.filter(e => e.type === 'trigger').length,
          symptom: timelineEvents.filter(e => e.type === 'symptom').length,
          flare: timelineEvents.filter(e => e.type.startsWith('flare')).length,
          food: timelineEvents.filter(e => e.type === 'food').length,
        }
      });

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

  // Story 6.5: Load correlations for pattern detection
  const loadCorrelations = async (startTime: number, endTime: number) => {
    try {
      if (!userId) {
        return;
      }

      setCorrelationsLoading(true);
      setCorrelationsError(null);

      console.log("🔗 TimelineView: Loading correlations for pattern detection", {
        userId,
        timeRange: {
          start: new Date(startTime).toLocaleString(),
          end: new Date(endTime).toLocaleString(),
        }
      });

      // Query all correlations for this user
      const allCorrelations = await correlationRepository.findAll(userId);

      // Filter correlations by timeline date range
      // We want correlations that were calculated during or before this time range
      // and could apply to events in this range
      const filteredCorrelations = allCorrelations.filter(correlation => {
        // Include all correlations for now - we'll refine filtering as we build pattern detection
        // Pattern detection algorithm (Task 4) will determine which correlations are relevant
        return true;
      });

      console.log("✅ Correlations loaded:", {
        total: allCorrelations.length,
        filtered: filteredCorrelations.length,
        byType: {
          'food-symptom': filteredCorrelations.filter(c => c.type === 'food-symptom').length,
          'trigger-symptom': filteredCorrelations.filter(c => c.type === 'trigger-symptom').length,
          'medication-symptom': filteredCorrelations.filter(c => c.type === 'medication-symptom').length,
        }
      });

      setCorrelations(filteredCorrelations);
    } catch (err) {
      console.error('Error loading correlations:', err);
      setCorrelationsError('Failed to load pattern correlations');
    } finally {
      setCorrelationsLoading(false);
    }
  };

  // Initial load - load only today
  // mountTimestamp ensures this runs on EVERY mount (Story 3.5.13 fix)
  useEffect(() => {
    const loadInitialEvents = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      console.log("🔄 TimelineView: Loading initial events (mount:", mountTimestamp, ") for userId:", userId);

      // Load only today's events
      const today = new Date();
      await loadEvents(today);

      // Story 6.5: Load correlations for pattern detection
      // Calculate date range for correlation filtering
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      await loadCorrelations(startOfDay.getTime(), endOfDay.getTime());

      setLoading(false);
    };

    loadInitialEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, mountTimestamp]); // Re-run when userId changes OR component remounts

  // Story 6.5: Run pattern detection when events and correlations are loaded
  useEffect(() => {
    if (events.length === 0 || correlations.length === 0) {
      // No patterns to detect without both events and correlations
      setDetectedPatterns([]);
      return;
    }

    setPatternsLoading(true);

    // Debounce pattern detection by 500ms
    const timeoutId = setTimeout(() => {
      console.log('🔍 Running pattern detection...', {
        events: events.length,
        correlations: correlations.length,
      });

      const patterns = detectRecurringSequences(events, correlations);
      setDetectedPatterns(patterns);
      setPatternsLoading(false);

      console.log('✅ Pattern detection complete:', {
        patternsFound: patterns.length,
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setPatternsLoading(false);
    };
  }, [events, correlations]);

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

  // Note: Allergen filtering removed from dashboard timeline
  // Users can filter by allergen on dedicated food/analytics pages

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

  // Toggle inline details for food events
  const toggleFoodDetails = (eventId: string) => {
    setExpandedFood((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId); else next.add(eventId);
      return next;
    });
  };

  const handleDeleteFood = async (eventId: string) => {
    try {
      await foodEventRepository.delete(eventId);
      await loadEvents(currentDate);
    } catch (e) {
      console.error('Failed to delete food event', e);
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
          <p className="text-muted-foreground text-lg">
            No events logged yet today
          </p>
        </div>
      ) : (
        groupedEvents.map((group) => (
          <div key={group.dateLabel} className="space-y-3">
            <h3 className="text-h3 border-b border-border pb-2">
              {group.dateLabel}
            </h3>
            <div className="space-y-2">
              {group.events.map((event) => (
                <article
                  key={event.id}
                  id={`timeline-event-${event.id}`}
                  className="card-hover"
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
                    {event.type === 'food' ? (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFoodDetails(event.id); }}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                          aria-expanded={expandedFood.has(event.id)}
                          aria-controls={`food-details-${event.id}`}
                        >
                          {expandedFood.has(event.id) ? 'Hide details' : 'Show details'}
                        </button>
                        {expandedFood.has(event.id) && (
                          <div id={`food-details-${event.id}`} role="region" className="mt-2 text-sm text-gray-700">
                            {event.details && <p className="mb-2">{event.details}</p>}
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleAddDetails(event); }}
                                className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                                aria-label="Edit this meal"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDeleteFood(event.id); }}
                                className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                                aria-label="Delete this meal"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      event.details && (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {event.details}
                        </p>
                      )
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
