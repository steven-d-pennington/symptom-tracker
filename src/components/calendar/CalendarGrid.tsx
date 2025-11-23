import { useMemo } from "react";
import { Activity, AlertTriangle, Flame } from "lucide-react";
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

interface CalendarMonth {
  label: string;
  monthIndex: number;
  cells: CalendarCell[];
  entryCount: number;
  averageHealth?: number;
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

const createYearMonths = (
  year: number,
  dayLookup: Map<string, CalendarDayDetail>,
  eventsByDate: Map<string, TimelineEvent[]>,
  entryMap: Map<string, CalendarEntry>,
): CalendarMonth[] => {
  const formatter = new Intl.DateTimeFormat("en", { month: "long" });
  const months: CalendarMonth[] = [];

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);

    const cells: CalendarCell[] = [];
    const cursor = new Date(gridStart);
    let entryCount = 0;
    let healthTotal = 0;

    while (cursor <= gridEnd) {
      const iso = cursor.toISOString().slice(0, 10);
      const entry = entryMap.get(iso);
      if (entry) {
        entryCount += 1;
        if (typeof entry.overallHealth === "number") {
          healthTotal += entry.overallHealth;
        }
      }

      cells.push({
        date: iso,
        isCurrentMonth: cursor.getMonth() === monthIndex,
        entry: dayLookup.get(iso),
        events: eventsByDate.get(iso) ?? [],
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    months.push({
      label: formatter.format(monthStart),
      monthIndex,
      cells,
      entryCount,
      averageHealth: entryCount > 0 ? healthTotal / entryCount : undefined,
    });
  }

  return months;
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

const getBackgroundGlow = (entry?: CalendarDayDetail) => {
  if (!entry) return "bg-card";

  const hasSymptoms = (entry.symptomsDetails?.length ?? 0) > 0;
  const hasTriggers = (entry.triggerDetails?.length ?? 0) > 0;
  const hasFlares = (entry.flareDetails?.length ?? 0) > 0;

  // Combine multiple glows for blended effect
  const glows = [];
  if (hasSymptoms) glows.push("bg-blue-50/60 dark:bg-blue-900/20");
  if (hasTriggers) glows.push("bg-yellow-50/60 dark:bg-yellow-900/20");
  if (hasFlares) glows.push("bg-red-50/60 dark:bg-red-900/20");

  if (glows.length === 0) return "bg-card";
  if (glows.length === 1) return glows[0];

  // For multiple types, use a gradient-like effect by layering
  // This creates a subtle blended glow
  return glows.join(" ");
};

const getSeverityClass = (score?: number) => {
  if (score === undefined || score === null) {
    return "border-border hover:bg-muted/50";
  }
  if (score >= 8) {
    return "border-emerald-300 hover:bg-emerald-100/50 dark:border-emerald-700 dark:hover:bg-emerald-900/20";
  }
  if (score >= 6) {
    return "border-sky-300 hover:bg-sky-100/50 dark:border-sky-700 dark:hover:bg-sky-900/20";
  }
  if (score >= 4) {
    return "border-amber-300 hover:bg-amber-100/50 dark:border-amber-700 dark:hover:bg-amber-900/20";
  }
  if (score >= 2) {
    return "border-orange-300 hover:bg-orange-100/50 dark:border-orange-700 dark:hover:bg-orange-900/20";
  }
  return "border-rose-300 hover:bg-rose-100/50 dark:border-rose-700 dark:hover:bg-rose-900/20";
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
  const isYearView = view.viewType === "year";
  const year = view.dateRange.start.getFullYear();
  const yearMonths = useMemo(
    () => (isYearView ? createYearMonths(year, dayLookup, eventsByDate, entryMap) : []),
    [dayLookup, entryMap, eventsByDate, isYearView, year],
  );

  if (isYearView) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {yearMonths.map((month) => (
            <div key={`${view.dateRange.start.getFullYear()}-${month.monthIndex}`} className="space-y-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{month.label}</h3>
                {month.entryCount > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {month.entryCount} {month.entryCount === 1 ? "entry" : "entries"}
                    {typeof month.averageHealth === "number"
                      ? ` · avg ${month.averageHealth.toFixed(1)}`
                      : ""}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No data</span>
                )}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {weekdayLabels.map((label) => (
                  <span key={`${month.label}-${label}`}>{label}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-[11px]" role="grid">
                {month.cells.map((cell) => {
                  const filteredEntry = entryMap.get(cell.date);
                  const entry = filteredEntry ?? cell.entry;
                  const matchesFilters = Boolean(filteredEntry);
                  const isSelected = cell.date === selectedDate;
                  const isToday = cell.date === new Date().toISOString().slice(0, 10);

                  const hasSymptoms = (cell.entry?.symptomsDetails?.length ?? 0) > 0;
                  const hasTriggers = (cell.entry?.triggerDetails?.length ?? 0) > 0;
                  const hasFlares = (cell.entry?.flareDetails?.length ?? 0) > 0;

                  return (
                    <button
                      key={cell.date}
                      type="button"
                      onClick={() => onSelectDate?.(cell.date)}
                      className={`flex h-10 flex-col justify-between rounded-lg border px-2 py-1 text-left transition-colors ${getBackgroundGlow(cell.entry)
                        } ${getSeverityClass(entry?.overallHealth)
                        } ${!cell.isCurrentMonth ? "opacity-30" : ""
                        } ${isSelected ? "ring-2 ring-primary" : ""}`}
                      aria-pressed={isSelected}
                      aria-label={`View details for ${cell.date}`}
                      data-filter-match={matchesFilters}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide">
                        <span>{formatDateLabel(cell.date)}</span>
                        {isToday ? (
                          <span className="rounded bg-primary px-1 py-0.5 text-[9px] text-primary-foreground">
                            Today
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-0.5">
                        {hasSymptoms ? (
                          <Activity className="h-3 w-3 text-blue-600 dark:text-blue-400" aria-label="Has symptoms" />
                        ) : null}
                        {hasTriggers ? (
                          <AlertTriangle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" aria-label="Has triggers" />
                        ) : null}
                        {hasFlares ? (
                          <Flame className="h-3 w-3 text-red-600 dark:text-red-400" aria-label="Has flares" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

            const hasSymptoms = (cell.entry?.symptomsDetails?.length ?? 0) > 0;
            const hasTriggers = (cell.entry?.triggerDetails?.length ?? 0) > 0;
            const hasFlares = (cell.entry?.flareDetails?.length ?? 0) > 0;

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => onSelectDate?.(cell.date)}
                className={`flex h-24 flex-col justify-between rounded-xl border px-3 py-2 text-left text-sm transition-colors ${getBackgroundGlow(cell.entry)
                  } ${getSeverityClass(entry?.overallHealth)
                  } ${!cell.isCurrentMonth ? "opacity-50" : ""
                  } ${isSelected ? "ring-2 ring-primary" : ""}`}
                aria-pressed={isSelected}
                aria-label={`View details for ${cell.date}`}
                data-filter-match={matchesFilters}
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                  <span>{formatDateLabel(cell.date)}</span>
                  {isToday ? <span className="rounded bg-primary px-1 py-0.5 text-[10px] text-primary-foreground">Today</span> : null}
                </div>
                <div className="flex items-center gap-1">
                  {hasSymptoms ? (
                    <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-label="Has symptoms" />
                  ) : null}
                  {hasTriggers ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" aria-label="Has triggers" />
                  ) : null}
                  {hasFlares ? (
                    <Flame className="h-4 w-4 text-red-600 dark:text-red-400" aria-label="Has flares" />
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div >
    </div >
  );
};
