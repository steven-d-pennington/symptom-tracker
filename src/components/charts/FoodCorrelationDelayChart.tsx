"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface DelayBucket {
  label: string;
  score: number;
  sampleSize: number;
}

interface FoodCorrelationDelayChartProps {
  title?: string;
  buckets: DelayBucket[];
  bestLabel?: string;
}

// Accessible delay visualization using a simple bar representation with a table fallback
// Note: We avoid Chart.js to keep this component lightweight and test-friendly.
export function FoodCorrelationDelayChart(props: FoodCorrelationDelayChartProps) {
  const { title = "Delay Pattern", buckets, bestLabel } = props;

  const maxScore = Math.max(1, ...buckets.map((b) => b.score));

  return (
    <section aria-labelledby="delay-chart-title" className="space-y-3">
      <h3 id="delay-chart-title" className="text-base font-semibold text-foreground">
        {title}
      </h3>

      <div role="img" aria-label="Delay pattern bar chart" className="flex items-end gap-2 h-32">
        {buckets.map((b) => {
          const heightPct = Math.max(4, Math.round((b.score / maxScore) * 100));
          const isBest = bestLabel && b.label === bestLabel;
          return (
            <div key={b.label} className="flex flex-col items-center" aria-label={`Bucket ${b.label}`}>
              <div
                className={cn(
                  "w-6 rounded-t",
                  isBest ? "bg-primary" : "bg-muted"
                )}
                style={{ height: `${heightPct}%` }}
                aria-hidden="true"
              />
              <div className="mt-1 text-xs text-muted-foreground" aria-hidden="true">
                {b.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible data table fallback */}
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm" aria-label="Delay buckets table">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-2 py-1 text-left">Window</th>
              <th className="px-2 py-1 text-left">Score</th>
              <th className="px-2 py-1 text-left">Sample Size</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.label} className={cn(bestLabel === b.label ? "bg-primary/10" : undefined)}>
                <td className="px-2 py-1">{b.label}</td>
                <td className="px-2 py-1">{b.score.toFixed(2)}</td>
                <td className="px-2 py-1">{b.sampleSize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default FoodCorrelationDelayChart;

