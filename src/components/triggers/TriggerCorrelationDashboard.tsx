"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { TriggerCorrelation, TriggerInsight } from "@/lib/types/trigger-correlation";
import { triggerEventRepository } from "@/lib/repositories/triggerEventRepository";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { calculateTemporalCorrelation } from "@/lib/utils/correlation";
import { CorrelationMatrix } from "./CorrelationMatrix";
import { TriggerInsights } from "./TriggerInsights";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { foodRepository } from "@/lib/repositories/foodRepository";
import type { TriggerEventRecord } from "@/lib/db/schema";
import { ALLERGEN_LABELS, isValidAllergen } from "@/lib/constants/allergens";
import AllergenFilter from "@/components/filters/AllergenFilter";
import { useAllergenFilter } from "@/lib/hooks/useAllergenFilter";

interface TriggerCorrelationDashboardProps {
  userId: string;
}

export function TriggerCorrelationDashboard({ userId }: TriggerCorrelationDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [correlations, setCorrelations] = useState<TriggerCorrelation[]>([]);
  const [insights, setInsights] = useState<TriggerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "food" | "environment">("all");
  const { selected: selectedAllergen, setSelected: setSelectedAllergen } = useAllergenFilter();
  const [foodAllergensMap, setFoodAllergensMap] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    loadCorrelations();
  }, [userId]);

  async function loadCorrelations() {
    try {
      setIsLoading(true);

      // Get last 90 days of data
      const now = Date.now();
      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

      // Fetch trigger events and symptom instances
      const [triggerEvents, symptomInstances, triggerDefinitions, foodEvents, foods] = await Promise.all([
        triggerEventRepository.findByDateRange(userId, ninetyDaysAgo, now),
        symptomInstanceRepository.getByDateRange(
          userId,
          new Date(ninetyDaysAgo),
          new Date(now)
        ),
        triggerRepository.getAll(userId),
        foodEventRepository.findByDateRange(userId, ninetyDaysAgo, now),
        foodRepository.getAll(userId),
      ]);

      // Calculate temporal correlations
      const correlationsList = calculateTemporalCorrelation(triggerEvents, symptomInstances)
        .map(c => ({ ...c, type: "environment" as const }));

      // Resolve trigger names from IDs
      const triggerNameMap = new Map(
        triggerDefinitions.map((t) => [t.id, t.name])
      );

      correlationsList.forEach((corr) => {
        corr.triggerName = triggerNameMap.get(corr.triggerId) || corr.triggerId;
      });

      // Build synthetic trigger events for foods (treat each food as a trigger)
      const foodNameMap = new Map(foods.map((f) => [f.id, f.name]));
      const allergensMap = new Map<string, string[]>();
      for (const f of foods) {
        try {
          allergensMap.set(f.id, JSON.parse(f.allergenTags || "[]"));
        } catch {
          allergensMap.set(f.id, []);
        }
      }
      setFoodAllergensMap(allergensMap);
      const syntheticFoodTriggers: TriggerEventRecord[] = [] as unknown as TriggerEventRecord[];
      for (const fe of foodEvents) {
        const ids = JSON.parse(fe.foodIds) as string[];
        ids.forEach((fid) => {
          syntheticFoodTriggers.push({
            // Minimal fields needed by calculateTemporalCorrelation
            id: `food-${fid}-${fe.id}`,
            userId: fe.userId,
            triggerId: `food:${fid}`,
            timestamp: fe.timestamp,
            intensity: "medium",
            createdAt: fe.createdAt ?? fe.timestamp,
            updatedAt: fe.updatedAt ?? fe.timestamp,
          } as unknown as TriggerEventRecord);
        });
      }

      const foodCorr = calculateTemporalCorrelation(syntheticFoodTriggers, symptomInstances)
        .map((c) => {
          const fid = c.triggerId.startsWith("food:") ? c.triggerId.slice(5) : c.triggerId;
          return {
            ...c,
            triggerId: fid,
            triggerName: foodNameMap.get(fid) || fid,
            type: "food" as const,
          } as TriggerCorrelation;
        });

      // Merge and sort
      const merged = [...correlationsList, ...foodCorr].sort((a, b) => b.correlationScore - a.correlationScore);

      setCorrelations(merged);

      // Generate insights
      const generatedInsights: TriggerInsight[] = merged
        .filter((c) => c.confidence === "high")
        .slice(0, 3)
        .map((c) => ({
          type: c.avgSeverityIncrease > 7 ? "warning" : "info",
          title: `Strong correlation detected`,
          description: c.timeLag
            ? `${c.triggerName} shows a ${(c.correlationScore * 100).toFixed(0)}% correlation with ${c.symptomName}, typically occurring ${c.timeLag} later`
            : `${c.triggerName} shows a ${(c.correlationScore * 100).toFixed(0)}% correlation with ${c.symptomName}`,
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

  // Apply type filter
  let filteredCorrelations = correlations.filter((c) =>
    filter === "all" ? true : c.type === filter
  );

  // Apply allergen filter to food correlations if set
  if (selectedAllergen) {
    filteredCorrelations = filteredCorrelations.filter((c) => {
      if (c.type !== "food") return false;
      const tags = foodAllergensMap.get(c.triggerId) || [];
      return tags.includes(selectedAllergen);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Trigger Analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Identify patterns and correlations between triggers and symptoms
        </p>
      </div>

      {/* Allergen filter chips (applies to food correlations) */}
      <AllergenFilter
        selected={selectedAllergen}
        onChange={setSelectedAllergen}
        showCount={selectedAllergen ? filteredCorrelations.filter(c => c.type === 'food').length : undefined}
      />

      {/* Simple allergen category summary */}
      {selectedAllergen && isValidAllergen(selectedAllergen) && (
        <div className="rounded-lg border p-4 bg-muted/30" aria-live="polite">
          <p className="text-sm text-muted-foreground mb-1">
            Allergen category: {ALLERGEN_LABELS[selectedAllergen]}
          </p>
          <p className="text-sm">
            {filteredCorrelations.length > 0
              ? `Matching correlations: ${filteredCorrelations.length}. Strongest symptom: ${[...filteredCorrelations].sort((a,b)=>b.correlationScore-a.correlationScore)[0].symptomName}.`
              : 'No correlations found for this allergen in the selected window.'}
          </p>
        </div>
      )}

      {/* Filter toggle */}
      <div className="flex items-center gap-2" role="group" aria-label="Trigger type filter">
        <button
          className={`px-3 py-1 rounded border text-sm ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded border text-sm ${
            filter === "food" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
          aria-pressed={filter === "food"}
          onClick={() => setFilter("food")}
        >
          Food
        </button>
        <button
          className={`px-3 py-1 rounded border text-sm ${
            filter === "environment" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
          aria-pressed={filter === "environment"}
          onClick={() => setFilter("environment")}
        >
          Environmental
        </button>
      </div>

      {insights.length > 0 && <TriggerInsights insights={insights} />}

      <CorrelationMatrix
        correlations={filteredCorrelations}
        onItemClick={(item) => {
          if (item.type === "food") {
            const url = `/foods/${encodeURIComponent(item.triggerId)}/correlation?symptom=${encodeURIComponent(item.symptomName)}`;
            router.push(url);
          }
        }}
      />

      {filteredCorrelations.length === 0 && (
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
