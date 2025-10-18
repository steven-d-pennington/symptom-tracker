"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { correlationOrchestrationService } from "@/lib/services/correlation/CorrelationOrchestrationService";
import { computeConsistency, WINDOW_SET, type WindowRange } from "@/lib/services/correlation/CorrelationService";
import { determineConfidence, P_VALUE_THRESHOLD } from "@/lib/services/correlation/ConfidenceCalculationService";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import FoodCorrelationDelayChart from "@/components/charts/FoodCorrelationDelayChart";
import { useRouter } from "next/navigation";

interface FoodCorrelationDetailViewProps {
  userId: string;
  foodId: string;
  symptomName: string;
  rangeDays?: number;
}

type InstanceRow = {
  foodTime: number;
  symptomTimes: number[];
  hasSymptom: boolean;
};

export function FoodCorrelationDetailView(props: FoodCorrelationDetailViewProps) {
  const { userId, foodId, symptomName, rangeDays = 90 } = props;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correlationPct, setCorrelationPct] = useState<number>(0);
  const [confidence, setConfidence] = useState<"low" | "medium" | "high" | null>(null);
  const [bestWindowLabel, setBestWindowLabel] = useState<string | null>(null);
  const [buckets, setBuckets] = useState<{ label: string; score: number; sampleSize: number }[]>([]);
  const [instances, setInstances] = useState<InstanceRow[]>([]);

  const range = useMemo(() => {
    const end = Date.now();
    const start = end - rangeDays * 24 * 60 * 60 * 1000;
    return { start, end };
  }, [rangeDays]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Compute correlation across windows
        const result = await correlationOrchestrationService.computeCorrelation({
          userId,
          foodId,
          symptomId: symptomName,
          range,
        });

        // Build chart buckets from window scores
        const chartBuckets = result.windowScores.map((ws) => ({
          label: ws.window,
          score: ws.score,
          sampleSize: ws.sampleSize,
        }));

        // Identify best window
        const best = result.bestWindow;

        // Hydrate events to compute consistency and instance list
        const [allFoodEvents, allSymptoms] = await Promise.all([
          foodEventRepository.findByDateRange(userId, range.start, range.end),
          symptomInstanceRepository.getByDateRange(userId, new Date(range.start), new Date(range.end)),
        ]);

        // Narrow to target food events
        const targetFoodEvents = allFoodEvents.filter((e) => {
          try {
            const ids = JSON.parse(e.foodIds) as string[];
            return ids.includes(foodId);
          } catch {
            return false;
          }
        });

        // Narrow to target symptom name
        const targetSymptoms = allSymptoms.filter((s) => s.name === symptomName);

        let consistency = 0;
        let conf: "low" | "medium" | "high" | null = null;
        let inst: InstanceRow[] = [];

        if (best) {
          const windowDef: WindowRange | undefined = WINDOW_SET.find((w) => w.label === best.window);
          if (windowDef) {
            // Convert to lightweight arrays for consistency
            const foodEventsLite = targetFoodEvents.map((e) => ({ timestamp: e.timestamp }));
            const symptomsLite = targetSymptoms.map((s) => ({
              timestamp: s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime(),
            }));

            consistency = computeConsistency(foodEventsLite, symptomsLite, windowDef);
            // Confidence requires p-value from best window + sample size
            conf = determineConfidence(result.sampleSize, consistency, best.pValue);

            // Build instance rows: for each food event, list symptoms within window
            inst = targetFoodEvents.map((fe) => {
              const ft = fe.timestamp;
              const stimes = targetSymptoms
                .map((s) => (s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime()))
                .filter((t) => t >= ft + windowDef.startMs && t <= ft + windowDef.endMs)
                .sort();
              return { foodTime: ft, symptomTimes: stimes, hasSymptom: stimes.length > 0 };
            });
          }
        }

        if (!isMounted) return;
        setBuckets(chartBuckets);
        setBestWindowLabel(best ? best.window : null);
        setCorrelationPct(Math.round(consistency * 100));
        setConfidence(conf);
        setInstances(inst);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to compute correlation");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, foodId, symptomName, range.start, range.end]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center" aria-busy="true" aria-live="polite">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="rounded border border-destructive/30 bg-destructive/10 p-3 text-destructive">
        {error}
      </div>
    );
  }

  const insufficient = buckets.length > 0 && bestWindowLabel && (() => {
    const best = buckets.find((b) => b.label === bestWindowLabel);
    return best ? best.sampleSize < 3 || (best as any).pValue >= P_VALUE_THRESHOLD : false;
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{`Correlation: ${foodId} → ${symptomName}`}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Detailed food-specific correlation report with time delay pattern and instance history
          </p>
        </div>
        <button
          className="px-3 py-1 rounded border text-sm bg-muted"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          Back
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Correlation %</div>
          <div className="text-2xl font-semibold">{correlationPct}%</div>
          {bestWindowLabel && (
            <div className="text-xs text-muted-foreground">Typical delay: {bestWindowLabel}</div>
          )}
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Confidence</div>
          <div className={cn(
            "inline-flex items-center rounded px-2 py-1 text-sm font-medium",
            confidence === "high" && "bg-green-600 text-white",
            confidence === "medium" && "bg-amber-500 text-white",
            confidence === "low" && "bg-red-600 text-white"
          )}>
            {confidence ? confidence.toUpperCase() : "Unknown"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Sample Size</div>
          <div className="text-2xl font-semibold">{(() => {
            const best = buckets.find((b) => b.label === bestWindowLabel);
            return best ? best.sampleSize : 0;
          })()}</div>
        </div>
      </div>

      {/* Delay pattern visualization */}
      <FoodCorrelationDelayChart
        buckets={buckets}
        bestLabel={bestWindowLabel ?? undefined}
      />

      {/* Instance history */}
      <section aria-labelledby="instance-history-title" className="space-y-3">
        <h3 id="instance-history-title" className="text-base font-semibold text-foreground">
          Instance History
        </h3>
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm" aria-label="Food and symptom instances">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 py-1 text-left">Food Time</th>
                <th className="px-2 py-1 text-left">Symptoms within window</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((row, idx) => (
                <tr key={`${row.foodTime}-${idx}`} className={cn(row.hasSymptom ? "bg-green-500/5" : undefined)}>
                  <td className="px-2 py-1">{new Date(row.foodTime).toLocaleString()}</td>
                  <td className="px-2 py-1">
                    {row.symptomTimes.length > 0
                      ? row.symptomTimes.map((t) => new Date(t).toLocaleString()).join(", ")
                      : "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default FoodCorrelationDetailView;
