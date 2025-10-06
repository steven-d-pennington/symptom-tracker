import { Suggestion } from "./hooks/useSmartSuggestions";

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
  offlineCount: number;
  onSync?: () => void;
}

export const SmartSuggestions = ({
  suggestions,
  offlineCount,
  onSync,
}: SmartSuggestionsProps) => {
  return (
    <section className="space-y-4" aria-label="Personalized suggestions">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Smart suggestions</h3>
        <p className="text-sm text-muted-foreground">
          Insights based on today’s log and your recent history.
        </p>
      </header>

      <ul className="space-y-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.id}
            className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${
              suggestion.type === "encouragement"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : suggestion.type === "reminder"
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-sky-200 bg-sky-50 text-sky-900"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span>{suggestion.message}</span>
              {suggestion.actionLabel && (
                <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                  {suggestion.actionLabel}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {offlineCount > 0 && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">
            {offlineCount} entry{offlineCount > 1 ? "ies" : ""} waiting to sync.
          </p>
          <p>
            We’ll automatically upload them when you’re back online. {onSync && "You can also sync manually now."}
          </p>
          {onSync && (
            <button
              type="button"
              onClick={onSync}
              className="mt-2 rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary"
            >
              Sync now
            </button>
          )}
        </div>
      )}
    </section>
  );
};
