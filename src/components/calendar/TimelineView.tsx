import { useMemo } from "react";
import { TimelineEvent } from "@/lib/types/calendar";

interface TimelineViewProps {
  events: TimelineEvent[];
  zoom: "week" | "month" | "quarter" | "year";
  onZoomChange: (zoom: "week" | "month" | "quarter" | "year") => void;
  onSelectEvent?: (event: TimelineEvent) => void;
  selectedEventId?: string;
}

const ZOOM_LEVELS: Array<{ label: string; value: TimelineViewProps["zoom"] }> = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
  { label: "Year", value: "year" },
];

const formatBucketLabel = (date: Date, zoom: TimelineViewProps["zoom"]) => {
  switch (zoom) {
    case "week": {
      const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
      const end = new Date(date);
      end.setDate(end.getDate() + 6);
      return `${formatter.format(date)} – ${formatter.format(end)}`;
    }
    case "quarter": {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    }
    case "year":
      return `${date.getFullYear()}`;
    case "month":
    default:
      return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
  }
};

const getBucketKey = (date: Date, zoom: TimelineViewProps["zoom"]) => {
  switch (zoom) {
    case "week":
      const start = new Date(date);
      const offset = (date.getDay() + 6) % 7;
      start.setDate(date.getDate() - offset);
      start.setHours(0, 0, 0, 0);
      return `week-${start.toISOString().slice(0, 10)}`;
    case "quarter":
      return `${date.getFullYear()}-q${Math.floor(date.getMonth() / 3) + 1}`;
    case "year":
      return `year-${date.getFullYear()}`;
    case "month":
    default:
      return `month-${date.getFullYear()}-${date.getMonth() + 1}`;
  }
};

const eventTypeStyles: Record<TimelineEvent["type"], string> = {
  symptom: "bg-rose-500/15 text-rose-700",
  medication: "bg-sky-500/15 text-sky-700",
  trigger: "bg-amber-500/15 text-amber-700",
  note: "bg-slate-500/15 text-slate-700",
  milestone: "bg-emerald-500/15 text-emerald-700",
};

export const TimelineView = ({ events, zoom, onZoomChange, onSelectEvent, selectedEventId }: TimelineViewProps) => {
  const buckets = useMemo(() => {
    const map = new Map<
      string,
      { label: string; start: Date; events: TimelineEvent[]; severityAverage?: number }
    >();

    events.forEach((event) => {
      const bucketKey = getBucketKey(event.date, zoom);
      if (!map.has(bucketKey)) {
        const start = new Date(event.date);
        if (zoom === "month") {
          start.setDate(1);
        } else if (zoom === "quarter") {
          const month = Math.floor(event.date.getMonth() / 3) * 3;
          start.setMonth(month, 1);
        } else if (zoom === "year") {
          start.setMonth(0, 1);
        } else if (zoom === "week") {
          const offset = (event.date.getDay() + 6) % 7;
          start.setDate(event.date.getDate() - offset);
        }

        map.set(bucketKey, {
          label: formatBucketLabel(start, zoom),
          start,
          events: [],
        });
      }

      const bucket = map.get(bucketKey);
      bucket?.events.push(event);
    });

    return Array.from(map.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, zoom]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Timeline insights will appear once entries and symptoms are connected to the data layer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Zoom</span>
          <div className="flex items-center gap-1">
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onZoomChange(level.value)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                  zoom === level.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {events.length} events shown
        </span>
      </div>

      <ol className="space-y-4">
        {buckets.map((bucket) => (
          <li key={bucket.label} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{bucket.label}</h3>
              <span className="text-xs text-muted-foreground">{bucket.events.length} events</span>
            </div>
            <div className="space-y-2">
              {bucket.events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onSelectEvent?.(event)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selectedEventId === event.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                          eventTypeStyles[event.type]
                        }`}
                      >
                        {event.type}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{event.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {event.description ? (
                    <p className="mt-2 text-xs text-muted-foreground">{event.description}</p>
                  ) : null}
                  {typeof event.severity === "number" ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Severity: {event.severity}/10
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
