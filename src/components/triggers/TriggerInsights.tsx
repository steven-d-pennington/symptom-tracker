"use client";

import { TriggerInsight } from "@/lib/types/trigger-correlation";

interface TriggerInsightsProps {
  insights: TriggerInsight[];
}

export function TriggerInsights({ insights }: TriggerInsightsProps) {
  const iconColors = {
    warning: "text-yellow-600",
    info: "text-blue-600",
    success: "text-green-600",
  };

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div key={index} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <svg
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColors[insight.type]}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {insight.type === "warning" && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              )}
              {insight.type === "info" && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
              {insight.type === "success" && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{insight.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
              {insight.recommendation && (
                <p className="mt-2 text-sm font-medium text-primary">{insight.recommendation}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
