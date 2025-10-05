import { TimelineEvent } from "@/lib/types/calendar";

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView = ({ events }: TimelineViewProps) => {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Timeline insights will appear once entries and symptoms are connected to the data layer.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="text-sm font-semibold text-foreground">{event.title}</div>
          <div className="text-xs text-muted-foreground">{event.date.toDateString()}</div>
          {event.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
};
