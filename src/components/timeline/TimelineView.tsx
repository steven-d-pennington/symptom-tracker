"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Loader2, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { medicationEventRepository } from '@/lib/repositories/medicationEventRepository';
import { triggerEventRepository } from '@/lib/repositories/triggerEventRepository';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import { medicationRepository } from '@/lib/repositories/medicationRepository';
import { triggerRepository } from '@/lib/repositories/triggerRepository';
import { foodEventRepository } from '@/lib/repositories/foodEventRepository';
import { foodRepository } from '@/lib/repositories/foodRepository';
import { symptomInstanceRepository } from '@/lib/repositories/symptomInstanceRepository';
import { correlationRepository } from '@/lib/repositories/correlationRepository';
import EventDetailModal from './EventDetailModal';
import PatternLegend from './PatternLegend';
import PatternBadge from './PatternBadge';
import PatternDetailPanel from './PatternDetailPanel';
import PatternHighlight from './PatternHighlight';
import TimelineLayerToggle from './TimelineLayerToggle';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { Calendar } from '@/components/ui/calendar';
import type { CorrelationRecord } from '@/lib/db/schema';
import type { CorrelationType } from '@/types/correlation';
import { detectRecurringSequences, type DetectedPattern, type PatternOccurrence } from '@/lib/services/patternDetectionService';
import { downloadTimelineImage, exportPatternSummaryPDF } from '@/lib/services/timelineExportService';

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
  foodNames?: string[]; // for food events: list of food names in the meal
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
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedFood, setExpandedFood] = useState<Set<string>>(new Set());

  // Story 6.5: Pattern detection correlation state
  const [correlations, setCorrelations] = useState<CorrelationRecord[]>([]);
  const [correlationsLoading, setCorrelationsLoading] = useState(false);
  const [correlationsError, setCorrelationsError] = useState<string | null>(null);

  // Story 6.5: Detected patterns state
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [patternsLoading, setPatternsLoading] = useState(false);

  // Story 6.5: Pattern visibility and detail panel state
  const [visiblePatternTypes, setVisiblePatternTypes] = useState<Set<CorrelationType>>(new Set([
    'food-symptom',
    'trigger-symptom',
    'medication-symptom',
    'food-flare',
    'trigger-flare'
  ]));
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);
  const [isPatternPanelOpen, setIsPatternPanelOpen] = useState(false);

  // Story 6.5: Layer toggle state
  const [visibleEventTypes, setVisibleEventTypes] = useState<Set<TimelineEventType>>(new Set([
    'symptom',
    'food',
    'trigger',
    'medication',
    'flare-created',
    'flare-updated',
    'flare-resolved'
  ]));
  const [showPatternHighlights, setShowPatternHighlights] = useState(true);
  const [patternStrengthFilter, setPatternStrengthFilter] = useState<'all' | 'strong' | 'moderate+strong'>('all');

  // Story 6.5: Calendar navigation state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Set initial date on mount to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  }, []);

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
      const [medicationEvents, triggerEvents, symptomInstances, markerRecords, foodEvents] = await Promise.all([
        medicationEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime()),
        triggerEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime()),
        symptomInstanceRepository.getByDateRange(userId, startOfDay, endOfDay),
        bodyMarkerRepository.getActiveMarkers(userId, 'flare'), // Unified marker system with type filter
        foodEventRepository.findByDateRange(userId, startOfDay.getTime(), endOfDay.getTime())
      ]);

      // Process events
      const timelineEvents: TimelineEvent[] = [];

      // Medications
      for (const event of medicationEvents) {
        const med = await medicationRepository.getById(event.medicationId);
        timelineEvents.push({
          id: event.id,
          type: 'medication',
          timestamp: event.timestamp,
          summary: `Took ${med?.name || 'Medication'}`,
          details: event.dosage || undefined,
          eventRef: event,
          hasDetails: !!event.dosage
        });
      }

      // Triggers
      for (const event of triggerEvents) {
        const trigger = await triggerRepository.getById(event.triggerId);
        timelineEvents.push({
          id: event.id,
          type: 'trigger',
          timestamp: event.timestamp,
          summary: `Trigger: ${trigger?.name || 'Unknown'}`,
          details: event.notes,
          eventRef: event,
          hasDetails: !!event.notes
        });
      }

      // Symptoms
      for (const instance of symptomInstances) {
        timelineEvents.push({
          id: instance.id,
          type: 'symptom',
          timestamp: instance.timestamp instanceof Date ? instance.timestamp.getTime() : new Date(instance.timestamp).getTime(),
          summary: `Symptom: ${instance.name}`,
          details: `Severity: ${instance.severity}/10${instance.notes ? ` - ${instance.notes}` : ''}`,
          eventRef: instance,
          hasDetails: true
        });
      }

      // Flares (Markers) - Filter by creation date to only show markers created on this specific day
      for (const marker of markerRecords) {
        // Only include markers created within this day's date range
        const markerCreatedAt = typeof marker.createdAt === 'number' ? marker.createdAt : new Date(marker.createdAt).getTime();
        if (markerCreatedAt >= startOfDay.getTime() && markerCreatedAt <= endOfDay.getTime()) {
          timelineEvents.push({
            id: marker.id,
            type: 'flare-created',
            timestamp: markerCreatedAt,
            summary: `Flare Logged`,
            details: undefined,
            eventRef: marker,
            hasDetails: false
          });
        }
      }

      // Food
      for (const event of foodEvents) {
        // FoodEventRecord has foodIds (array), get all food names
        const foodIds = JSON.parse(event.foodIds) as string[];
        const foods = await Promise.all(
          foodIds.map(id => foodRepository.getById(id))
        );
        const foodNames = foods.map(f => f?.name || 'Unknown food');
        const allergenTags = foods
          .filter(f => f?.allergenTags)
          .flatMap(f => JSON.parse(f!.allergenTags) as string[]);

        timelineEvents.push({
          id: event.id,
          type: 'food',
          timestamp: event.timestamp,
          summary: foodIds.length === 1 ? `Ate ${foodNames[0]}` : `Ate ${foodIds.length} foods`,
          details: event.notes,
          eventRef: event,
          hasDetails: !!event.notes || foodIds.length > 1,
          allergens: allergenTags.length > 0 ? allergenTags : undefined,
          foodNames: foodNames
        });
      }

      // Sort by timestamp descending
      timelineEvents.sort((a, b) => b.timestamp - a.timestamp);

      if (append) {
        setEvents(prev => [...prev, ...timelineEvents]);
      } else {
        setEvents(timelineEvents);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load timeline events:', err);
      setError('Failed to load timeline events. Please try again.');
      setLoading(false);
    }
  };

  const loadCorrelations = async (startMs: number, endMs: number) => {
    if (!userId) return;
    setCorrelationsLoading(true);
    try {
      const records = await correlationRepository.findByDateRange(userId, startMs, endMs);
      setCorrelations(records);
    } catch (e) {
      console.error("Failed to load correlations", e);
      setCorrelationsError("Failed to load correlations");
    } finally {
      setCorrelationsLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted && userId && currentDate) {
      loadEvents(currentDate);
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);
      loadCorrelations(startOfDay.getTime(), endOfDay.getTime());
    }
  }, [isMounted, userId, currentDate]);

  // Pattern detection
  useEffect(() => {
    if (events.length > 0 && correlations.length > 0) {
      setPatternsLoading(true);
      try {
        const patterns = detectRecurringSequences(events, correlations);
        setDetectedPatterns(patterns);
      } catch (e) {
        console.error("Pattern detection failed", e);
      } finally {
        setPatternsLoading(false);
      }
    }
  }, [events, correlations]);

  const handleEventTap = (event: TimelineEvent) => {
    if (onEventTap) onEventTap(event);
    else {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleAddDetails = (event: TimelineEvent) => {
    if (onAddDetails) onAddDetails(event);
    else {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const toggleFoodDetails = (id: string) => {
    const newSet = new Set(expandedFood);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedFood(newSet);
  };

  const handleDeleteFood = async (id: string) => {
    try {
      await foodEventRepository.delete(id);
      if (currentDate) loadEvents(currentDate);
    } catch (e) {
      console.error("Failed to delete food", e);
    }
  };

  const handleModalClose = () => setIsModalOpen(false);
  const handleModalSave = () => { if (currentDate) loadEvents(currentDate); };
  const handleModalDelete = () => { if (currentDate) loadEvents(currentDate); };
  const handlePatternPanelClose = () => setIsPatternPanelOpen(false);
  const handlePatternBadgeClick = (pattern: DetectedPattern) => {
    setSelectedPattern(pattern);
    setIsPatternPanelOpen(true);
  };
  const handleTogglePatternType = (type: CorrelationType) => {
    setVisiblePatternTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const loadPreviousDay = async () => {
    if (!currentDate) return;
    setLoadingMore(true);
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    await loadEvents(prev, true);
    setCurrentDate(prev);
    setLoadingMore(false);
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getPatternsForEvent = (eventId: string) => {
    return detectedPatterns.filter(p =>
      p.occurrences.some(o => o.event1.id === eventId || o.event2.id === eventId)
    );
  };

  const getPatternHighlightsForEvent = (eventId: string) => {
    const highlights: { pattern: DetectedPattern, occurrence: PatternOccurrence }[] = [];
    detectedPatterns.forEach(pattern => {
      pattern.occurrences.forEach(occ => {
        if (occ.event1.id === eventId) {
          highlights.push({ pattern, occurrence: occ });
        }
      });
    });
    return highlights;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setCurrentDate(date);
      setShowCalendar(false);
    }
  };

  // Group events by day
  const groupedEvents = useMemo(() => {
    const groups: Record<string, DayGroup> = {};

    // Filter by visible types
    const filteredEvents = events.filter(e => visibleEventTypes.has(e.type));

    filteredEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const dateKey = date.toDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          dateLabel: date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
          events: []
        };
      }
      groups[dateKey].events.push(event);
    });

    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [events, visibleEventTypes]);

  const filteredPatterns = useMemo(() => {
    return detectedPatterns.filter(p => {
      if (!visiblePatternTypes.has(p.type)) return false;
      if (patternStrengthFilter === 'strong' && p.strength !== 'strong') return false;
      if (patternStrengthFilter === 'moderate+strong' && p.strength === 'weak') return false;
      return true;
    });
  }, [detectedPatterns, visiblePatternTypes, patternStrengthFilter]);

  const availablePatternTypes = useMemo(() => {
    const types = new Set<CorrelationType>();
    detectedPatterns.forEach(p => types.add(p.type));
    return Array.from(types);
  }, [detectedPatterns]);

  if (!isMounted) {
    return (
      <div className="w-full md:w-2/3 space-y-4">
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

  return (
    <div id="timeline-container" className="w-full md:w-2/3 space-y-6">
      <TimelineLayerToggle
        visibleEventTypes={visibleEventTypes}
        onToggleEventType={(type) => {
          setVisibleEventTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) next.delete(type);
            else next.add(type);
            return next;
          });
        }}
        showPatternHighlights={showPatternHighlights}
        onTogglePatternHighlights={() => setShowPatternHighlights(prev => !prev)}
        patternStrengthFilter={patternStrengthFilter}
        onPatternStrengthFilterChange={setPatternStrengthFilter}
      />

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowCalendar(prev => !prev)}
          className={cn(
            "flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-md",
            showCalendar
              ? "bg-primary/10 border-primary/20 text-primary-dark shadow-sm"
              : "bg-background/50 border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {showCalendar ? 'Hide Calendar' : 'Jump to Date'}
        </button>

        {/* Export PDF (kept if patterns exist) */}
        {filteredPatterns.length > 0 && (
          <button
            onClick={() => exportPatternSummaryPDF(filteredPatterns)}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        )}
      </div>

      {showCalendar && (
        <div className="border rounded-xl p-4 bg-card/95 backdrop-blur-sm shadow-lg mb-6 animate-in fade-in slide-in-from-top-2 z-20 relative">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border bg-background"
          />
        </div>
      )}

      {/* Pattern Legend */}
      {filteredPatterns.length > 0 && (
        <PatternLegend
          availableTypes={availablePatternTypes}
          visibleTypes={visiblePatternTypes}
          onToggleType={handleTogglePatternType}
        />
      )}

      {groupedEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Filter className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No events found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your filters or log a new event.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-border/50 ml-4 md:ml-6 space-y-8">
          {groupedEvents.map((group) => (
            <div key={group.dateLabel} className="relative">
              {/* Date Header */}
              <div className="flex items-center -ml-[21px] mb-6">
                <div className="w-10 h-10 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center shadow-sm z-10">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground ml-4">
                  {group.dateLabel}
                </h3>
              </div>

              <div className="space-y-4 pl-6">
                {group.events.map((event, eventIndex) => {
                  const eventPatterns = getPatternsForEvent(event.id);
                  const patternHighlights = getPatternHighlightsForEvent(event.id);

                  // Determine icon and color based on type
                  let icon = '•';
                  let colorClass = 'bg-gray-500';

                  switch (event.type) {
                    case 'medication': icon = '💊'; colorClass = 'bg-emerald-500'; break;
                    case 'symptom': icon = '🤒'; colorClass = 'bg-blue-500'; break;
                    case 'trigger': icon = '⚡'; colorClass = 'bg-yellow-500'; break;
                    case 'food': icon = '🍽️'; colorClass = 'bg-purple-500'; break;
                    case 'flare-created': icon = '🔥'; colorClass = 'bg-orange-500'; break;
                  }

                  return (
                    <React.Fragment key={`${group.dateLabel}-${event.id}-${eventIndex}`}>
                      {/* Pattern Highlights */}
                      {showPatternHighlights && patternHighlights.map(({ pattern, occurrence }) => (
                        <PatternHighlight
                          key={`highlight-${pattern.id}-${occurrence.event1.id}-${occurrence.event2.id}`}
                          event1={occurrence.event1}
                          event2={occurrence.event2}
                          correlationType={pattern.type}
                          lagHours={pattern.lagHours}
                          isVisible={visiblePatternTypes.has(pattern.type)}
                        />
                      ))}

                      <article
                        id={`timeline-event-${event.id}`}
                        className="group relative glass-panel rounded-xl p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary"
                        onClick={() => handleEventTap(event)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleEventTap(event);
                          }
                        }}
                      >
                        {/* Pattern Badge */}
                        {eventPatterns.length > 0 && (
                          <div className="absolute -top-2 -right-2 flex gap-1">
                            {eventPatterns.map(pattern => (
                              <PatternBadge
                                key={pattern.id}
                                pattern={pattern}
                                onClick={() => handlePatternBadgeClick(pattern)}
                              />
                            ))}
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <div className={cn("flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm", colorClass)}>
                            <span className="text-sm">{icon}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-muted-foreground font-mono">
                                {formatTime(event.timestamp)}
                              </span>
                            </div>

                            <h4 className="text-base font-semibold text-foreground leading-tight mb-1">
                              {event.summary.replace(/^[^\s]+\s/, '')}
                            </h4>

                            {event.type === 'food' ? (
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleFoodDetails(event.id); }}
                                  className="text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                                >
                                  {expandedFood.has(event.id) ? 'Hide details' : 'Show details'}
                                </button>
                                {expandedFood.has(event.id) && (
                                  <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
                                    {/* Display food items */}
                                    {event.foodNames && event.foodNames.length > 0 && (
                                      <div className="mb-2">
                                        <p className="font-semibold text-foreground mb-1">Foods:</p>
                                        <ul className="list-disc list-inside">
                                          {event.foodNames.map((name, idx) => (
                                            <li key={idx}>{name}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Display notes if available */}
                                    {event.details && (
                                      <div className="mt-2">
                                        <p className="font-semibold text-foreground mb-1">Notes:</p>
                                        <p>{event.details}</p>
                                      </div>
                                    )}

                                    <div className="flex gap-2 mt-2">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleAddDetails(event); }}
                                        className="text-xs text-primary hover:underline"
                                      >
                                        Edit
                                      </button>
                                      <span className="text-border">|</span>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFood(event.id); }}
                                        className="text-xs text-red-500 hover:underline"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              event.details && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2 group-hover:line-clamp-none transition-all">
                                  {event.details}
                                </p>
                              )
                            )}
                          </div>

                          {!event.hasDetails && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddDetails(event);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-primary"
                              title="Add details"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </article>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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

      {/* Pattern Detail Panel */}
      <PatternDetailPanel
        pattern={selectedPattern}
        isOpen={isPatternPanelOpen}
        onClose={handlePatternPanelClose}
      />
    </div>
  );
};

export default TimelineView;
