"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCalendarData } from "./hooks/useCalendarData";
import { useCalendarFilters } from "./hooks/useCalendarFilters";
import { CalendarControls } from "./CalendarControls";
import { CalendarGrid } from "./CalendarGrid";
import { TimelineView } from "./TimelineView";
import { ChartView } from "./ChartView";
import { DayView } from "./DayView";

const NO_OP = () => { };

export const CalendarView = () => {
  const router = useRouter();
  const filterState = useCalendarFilters();
  const [activeEventId, setActiveEventId] = useState<string | undefined>(undefined);
  const {
    viewConfig,
    updateView,
    entries,
    events,
    metrics,
    filterOptions,
    selectedDate,
    selectDate,
    selectedDay,
    dayLookup,
    timelineZoom,
    setTimelineZoom,
    navigation,
    eventsByDate,
  } = useCalendarData({ filters: filterState.filters, searchTerm: filterState.searchTerm });

  const eventsForSelectedDay = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];
  const isYearView = viewConfig.viewType === "year";
  const isTimelineView = viewConfig.viewType === "timeline";

  const handleEventSelect = (event: (typeof events)[number]) => {
    const iso = event.date.toISOString().slice(0, 10);
    selectDate(iso);
    setActiveEventId(event.id);
  };

  const handleDayEdit = (date: string) => {
    router.push(`/daily-log?date=${date}`);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Calendar & Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Visualize your health history across calendar, timeline, and analytics views to uncover patterns and prepare for
          appointments.
        </p>
      </header>

      <CalendarControls
        view={viewConfig}
        filters={filterState.filters}
        searchTerm={filterState.searchTerm}
        filterOptions={filterOptions}
        presets={filterState.presets}
        activePresetId={filterState.activePresetId}
        navigation={navigation}
        onViewChange={updateView}
        onDisplayOptionsChange={(displayOptions) =>
          updateView({
            displayOptions: { ...viewConfig.displayOptions, ...displayOptions },
          })}
        onFiltersChange={filterState.updateFilters}
        onSeverityChange={filterState.updateSeverityRange}
        onClearFilters={filterState.clearFilters}
        onSearchTermChange={filterState.setSearchTerm}
        onSavePreset={filterState.savePreset}
        onApplyPreset={filterState.applyPreset}
        onDeletePreset={filterState.deletePreset}
      />

      {isYearView ? (
        <div className="space-y-6">
          <CalendarGrid
            entries={entries}
            view={viewConfig}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              selectDate(date);
              setActiveEventId(undefined);
            }}
            dayLookup={dayLookup}
            eventsByDate={eventsByDate}
          />

          <ChartView
            metrics={metrics}
            onRegisterChart={NO_OP}
            variant="health-only"
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {isTimelineView ? (
              <TimelineView
                events={events}
                zoom={timelineZoom}
                onZoomChange={setTimelineZoom}
                onSelectEvent={handleEventSelect}
                selectedEventId={activeEventId}
              />
            ) : (
              <CalendarGrid
                entries={entries}
                view={viewConfig}
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  selectDate(date);
                  setActiveEventId(undefined);
                }}
                dayLookup={dayLookup}
                eventsByDate={eventsByDate}
              />
            )}

            <ChartView metrics={metrics} onRegisterChart={NO_OP} />
          </div>

          <div className="space-y-6">
            <DayView entry={selectedDay} events={eventsForSelectedDay} onEdit={handleDayEdit} />
          </div>
        </div>
      )}
    </section>
  );
};
