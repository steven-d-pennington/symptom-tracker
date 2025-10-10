"use client";

import { useEffect, useState } from "react";
import { TriggerCorrelation, TriggerInsight } from "@/lib/types/trigger-correlation";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { CorrelationMatrix } from "./CorrelationMatrix";
import { TriggerInsights } from "./TriggerInsights";

interface TriggerCorrelationDashboardProps {
  userId: string;
}

export function TriggerCorrelationDashboard({ userId }: TriggerCorrelationDashboardProps) {
  const [correlations, setCorrelations] = useState<TriggerCorrelation[]>([]);
  const [insights, setInsights] = useState<TriggerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCorrelations();
  }, [userId]);

  async function loadCorrelations() {
    try {
      setIsLoading(true);

      // Get last 90 days of entries
      const entries = await dailyEntryRepository.getAll(userId);
      const recentEntries = entries.slice(0, 90);

      // Calculate correlations
      const triggerSymptomMap = new Map<string, Map<string, number[]>>();

      recentEntries.forEach((entry) => {
        entry.triggers.forEach((trigger) => {
          entry.symptoms.forEach((symptom) => {
            const key = `${trigger.triggerId}-${symptom.symptomId}`;
            if (!triggerSymptomMap.has(key)) {
              triggerSymptomMap.set(key, new Map());
            }
            const map = triggerSymptomMap.get(key)!;
            if (!map.has(symptom.symptomId)) {
              map.set(symptom.symptomId, []);
            }
            map.get(symptom.symptomId)!.push(symptom.severity);
          });
        });
      });

      // Build correlation objects
      const correlationsList: TriggerCorrelation[] = [];
      triggerSymptomMap.forEach((symptomMap, key) => {
        const [triggerId, symptomId] = key.split("-");
        symptomMap.forEach((severities, sid) => {
          const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
          const score = Math.min(severities.length / 10, 1);

          correlationsList.push({
            triggerId,
            triggerName: `Trigger ${triggerId.slice(0, 8)}`,
            symptomId: sid,
            symptomName: `Symptom ${sid.slice(0, 8)}`,
            correlationScore: score,
            occurrences: severities.length,
            avgSeverityIncrease: avgSeverity,
            confidence: score > 0.7 ? "high" : score > 0.4 ? "medium" : "low",
          });
        });
      });

      setCorrelations(correlationsList);

      // Generate insights
      const generatedInsights: TriggerInsight[] = correlationsList
        .filter((c) => c.confidence === "high")
        .slice(0, 3)
        .map((c) => ({
          type: c.avgSeverityIncrease > 7 ? "warning" : "info",
          title: `Strong correlation detected`,
          description: `${c.triggerName} shows a ${(c.correlationScore * 100).toFixed(0)}% correlation with ${c.symptomName}`,
          affectedSymptoms: [c.symptomName],
          recommendation: "Consider avoiding this trigger to reduce symptom severity",
        }));

      setInsights(generatedInsights);
    } catch (error) {
      console.error("Failed to load correlations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Trigger Analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Identify patterns and correlations between triggers and symptoms
        </p>
      </div>

      {insights.length > 0 && <TriggerInsights insights={insights} />}

      <CorrelationMatrix correlations={correlations} />

      {correlations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
          <svg
            className="mb-4 h-16 w-16 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No data yet</h3>
          <p className="text-sm text-muted-foreground">
            Log triggers and symptoms for at least 2 weeks to see correlations
          </p>
        </div>
      )}
    </div>
  );
}
