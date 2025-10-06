import { useMemo } from "react";
import {
  CalendarDayDetail,
  CalendarEntry,
  CalendarViewConfig,
  TimelineEvent,
} from "@/lib/types/calendar";

interface CalendarGridProps {
  entries: CalendarEntry[];
  view: CalendarViewConfig;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  dayLookup: Map<string, CalendarDayDetail>;
  eventsByDate: Map<string, TimelineEvent[]>;
}

interface CalendarCell {
  date: string;
  isCurrentMonth: boolean;
  entry?: CalendarDayDetail;
  events: TimelineEvent[];
}

const startOfWeek = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = (day + 6) % 7;
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfWeek = (date: Date) => {
  const start = startOfWeek(date);
  start.setDate(start.getDate() + 6);
  start.setHours(23, 59, 59, 999);
  return start;
};

const createMonthCells = (
  view: CalendarViewConfig,
  dayLookup: Map<string, CalendarDayDetail>,
  eventsByDate: Map<string, TimelineEvent[]>,
) => {
  const monthStart = new Date(view.dateRange.start.getFullYear(), view.dateRange.start.getMonth(), 1);
  const monthEnd = new Date(view.dateRange.start.getFullYear(), view.dateRange.start.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const cells: CalendarCell[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const iso = cursor.toISOString().slice(0, 10);
    cells.push({
      date: iso,
      isCurrentMonth: cursor.getMonth() === monthStart.getMonth(),
      entry: dayLookup.get(iso),
      events: eventsByDate.get(iso) ?? [],
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
};

const createWeekCells = (
  view: CalendarViewConfig,
  dayLookup: Map<string, CalendarDayDetail>,
  eventsByDate: Map<string, TimelineEvent[]>,
) => {
  const weekStart = startOfWeek(view.dateRange.start);
  const cells: CalendarCell[] = [];
  const cursor = new Date(weekStart);
  for (let index = 0; index < 7; index += 1) {
    const iso = cursor.toISOString().slice(0, 10);
    cells.push({
      date: iso,
      isCurrentMonth: true,
      entry: dayLookup.get(iso),
      events: eventsByDate.get(iso) ?? [],
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getSeverityClass = (score?: number) => {
  if (typeof score !== "number") {
    return "border-border";
  }

  if (score >= 7) {
    return "border-emerald-300 bg-emerald-100/70 text-emerald-900";
  }

  if (score >= 4) {
    return "border-amber-300 bg-amber-100/70 text-amber-900";
  }

  return "border-rose-300 bg-rose-100/70 text-rose-900";
};

const formatDateLabel = (iso: string) => {
  const date = new Date(iso);
  return date.getDate();
};

export const CalendarGrid = ({
  entries,
  view,
  selectedDate,
  onSelectDate,
  dayLookup,
  eventsByDate,
}: CalendarGridProps) => {
  const entryMap = useMemo(() => new Map(entries.map((entry) => [entry.date, entry])), [entries]);

  const cells = useMemo(() => {
    switch (view.viewType) {
      case "week":
        return createWeekCells(view, dayLookup, eventsByDate);
      case "month":
      default:
        return createMonthCells(view, dayLookup, eventsByDate);
    }
  }, [dayLookup, eventsByDate, view]);

  if (view.viewType === "day") {
    const iso = selectedDate ?? entries.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
    const selected = iso ? dayLookup.get(iso) : undefined;
    const events = iso ? eventsByDate.get(iso) ?? [] : [];

    return (
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-foreground">Daily timeline</h3>
          <span className="text-sm text-muted-foreground">{iso}</span>
        </div>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No timeline events recorded for this day.
          </p>
        ) : (
          <ol className="space-y-2 text-sm">
            {events.map((event) => (
              <li key={event.id} className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{event.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {event.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">{event.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
        {selected ? (
          <p className="text-xs text-muted-foreground">
            {selected.symptomCount} symptoms, {selected.medicationCount} medications, {selected.triggerCount} triggers
            logged.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2" role="grid">
        {cells.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">
            {`The ${view.viewType} view will highlight symptom intensity once daily entries are saved.`}
          </p>
        ) : (
          cells.map((cell) => {
            const filteredEntry = entryMap.get(cell.date);
            const entry = filteredEntry ?? cell.entry;
            const matchesFilters = Boolean(filteredEntry);
            const isSelected = cell.date === selectedDate;
            const isToday = cell.date === new Date().toISOString().slice(0, 10);

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => onSelectDate?.(cell.date)}
                className={`flex h-24 flex-col justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                  getSeverityClass(entry?.overallHealth)
                } ${
                  !cell.isCurrentMonth ? "opacity-50" : ""
                } ${isSelected ? "ring-2 ring-primary" : ""}`}
                aria-pressed={isSelected}
                aria-label={`View details for ${cell.date}`}
                data-filter-match={matchesFilters}
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                  <span>{formatDateLabel(cell.date)}</span>
                  {isToday ? <span className="rounded bg-primary px-1 py-0.5 text-[10px] text-primary-foreground">Today</span> : null}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                        matchesFilters ? "bg-rose-500/20 text-rose-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry?.symptomCount ?? 0} sx
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                        matchesFilters ? "bg-sky-500/20 text-sky-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry?.medicationCount ?? 0} meds
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                        matchesFilters ? "bg-amber-500/20 text-amber-700" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {entry?.triggerCount ?? 0} triggers
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5 text-[11px] text-foreground">
                      {cell.events.length} events
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
