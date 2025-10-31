import { CalendarDayDetail, TimelineEvent } from "@/lib/types/calendar";

interface DayViewProps {
  entry?: CalendarDayDetail;
  events?: TimelineEvent[];
  onEdit?: (date: string) => void;
}

const formatImpact = (value: "low" | "medium" | "high") => {
  switch (value) {
    case "high":
      return "High impact";
    case "medium":
      return "Moderate impact";
    default:
      return "Low impact";
  }
};

export const DayView = ({ entry, events = [], onEdit }: DayViewProps) => {
  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Select a day to review detailed entry information.
      </div>
    );
  }

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{entry.date}</h3>
          <p className="text-sm text-muted-foreground">
            {entry.hasEntry ? (
              <>
                {entry.symptomCount} symptoms · {entry.medicationCount} medications · {entry.triggerCount} triggers
                {/* Story 3.5.7: Display counts for new data types */}
                {entry.foodCount > 0 && ` · ${entry.foodCount} meals`}
                {entry.moodCount > 0 && ` · ${entry.moodCount} mood`}
                {entry.sleepCount > 0 && ` · ${entry.sleepCount} sleep`}
                {entry.flareCount > 0 && ` · ${entry.flareCount} flares`}
              </>
            ) : (
              "No entry recorded"
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onEdit?.(entry.date)}
          className="rounded-lg border border-border px-3 py-1 text-sm text-foreground hover:bg-muted"
        >
          Open in daily log
        </button>
      </header>

      <section className="grid gap-3 text-sm text-muted-foreground">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p>Mood: {entry.mood ?? "Not recorded"}</p>
          <p>
            Energy: {typeof entry.energyLevel === "number" ? `${entry.energyLevel}/10` : "n/a"}
          </p>
          <p>Notes: {entry.notesSummary ?? "Add notes from the daily log."}</p>
        </div>

        {entry.symptomsDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Symptoms</h4>
            <ul className="space-y-2">
              {entry.symptomsDetails.map((symptom) => (
                <li key={symptom.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{symptom.name}</span>
                    <span className="text-xs text-muted-foreground">Severity {symptom.severity}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Category: {symptom.category}</p>
                  {symptom.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">{symptom.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.medicationDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Medications</h4>
            <ul className="space-y-2">
              {entry.medicationDetails.map((medication) => (
                <li key={medication.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{medication.name}</span>
                    <span className="text-xs text-muted-foreground">{medication.dose}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {medication.taken ? "Taken" : "Missed"} · {medication.schedule}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {entry.triggerDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Triggers</h4>
            <ul className="space-y-2">
              {entry.triggerDetails.map((trigger) => (
                <li key={trigger.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{trigger.name}</span>
                    <span className="text-xs text-muted-foreground">{formatImpact(trigger.impact)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Category: {trigger.category}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Story 3.5.7: Food entries section */}
        {entry.foodDetails && entry.foodDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Food</h4>
            <ul className="space-y-2">
              {entry.foodDetails.map((food) => (
                <li key={food.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{food.mealType}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(food.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{food.foodIds.length} food items</p>
                  {food.notes ? <p className="mt-1 text-xs text-muted-foreground">{food.notes}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Story 3.5.7: Mood entries section */}
        {entry.moodDetails && entry.moodDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Mood</h4>
            <ul className="space-y-2">
              {entry.moodDetails.map((mood) => (
                <li key={mood.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">Mood: {mood.mood}/10</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(mood.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {mood.moodType ? <p className="text-xs text-muted-foreground">Type: {mood.moodType}</p> : null}
                  {mood.notes ? <p className="mt-1 text-xs text-muted-foreground">{mood.notes}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Story 3.5.7: Sleep entries section */}
        {entry.sleepDetails && entry.sleepDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Sleep</h4>
            <ul className="space-y-2">
              {entry.sleepDetails.map((sleep) => (
                <li key={sleep.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{sleep.hours} hours</span>
                    <span className="text-xs text-muted-foreground">Quality: {sleep.quality}/10</span>
                  </div>
                  {sleep.notes ? <p className="mt-1 text-xs text-muted-foreground">{sleep.notes}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Story 3.5.7: Flare entries section */}
        {entry.flareDetails && entry.flareDetails.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Flares</h4>
            <ul className="space-y-2">
              {entry.flareDetails.map((flare) => (
                <li key={flare.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{flare.bodyRegionId}</span>
                    <span className="text-xs text-muted-foreground">Severity: {flare.currentSeverity}/10</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Status: {flare.status}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {events.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Timeline events</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {events.map((event) => (
                <li key={event.id}>
                  {event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {event.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </article>
  );
};
