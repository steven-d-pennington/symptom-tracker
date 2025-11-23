"use client";

import { TriggerCorrelation } from "@/lib/types/trigger-correlation";

interface CorrelationMatrixProps {
  correlations: TriggerCorrelation[];
  onItemClick?: (item: TriggerCorrelation) => void;
}

export function CorrelationMatrix({ correlations, onItemClick }: CorrelationMatrixProps) {
  const sortedCorrelations = [...correlations].sort((a, b) => b.correlationScore - a.correlationScore);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "low":
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-foreground">Correlation Matrix</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Strength of relationships between triggers and symptoms
        </p>
      </div>

      <div className="divide-y divide-border">
        {sortedCorrelations.slice(0, 10).map((correlation, index) => (
          <div
            key={index}
            className="p-4 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 outline-none"
            role={onItemClick ? "button" : undefined}
            tabIndex={onItemClick ? 0 : undefined}
            aria-label={`View details for ${correlation.triggerName} → ${correlation.symptomName}`}
            onClick={() => onItemClick?.(correlation)}
            onKeyDown={(e) => {
              if (!onItemClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onItemClick(correlation);
              }
            }}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-foreground flex items-center gap-2">
                  {correlation.type === "food" && (
                    <span aria-label="Food trigger">🍽️</span>
                  )}
                  <span>{correlation.triggerName}</span>
                </div>
                <div className="text-sm text-muted-foreground">→ {correlation.symptomName}</div>
              </div>
              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getConfidenceColor(correlation.confidence)}`}>
                {correlation.confidence}
              </span>
            </div>

            <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${correlation.correlationScore * 100}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{(correlation.correlationScore * 100).toFixed(0)}% correlation</span>
              <span>•</span>
              <span>{correlation.occurrences} occurrences</span>
              <span>•</span>
              <span>Avg severity: {correlation.avgSeverityIncrease.toFixed(1)}/10</span>
              {correlation.timeLag && (
                <>
                  <span>•</span>
                  <span>Time-lag: {correlation.timeLag}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
