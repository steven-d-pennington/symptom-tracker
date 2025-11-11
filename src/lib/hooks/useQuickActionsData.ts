import { useState, useEffect } from "react";
import { db } from "@/lib/db/client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useMarkers } from "./useMarkers";

export interface QuickActionsData {
  activeFlares: number;
  todayMedicationLogs: number;
  lastSymptomSeverity: number | null;
  todayFoodLogs: number;
  todayTriggerLogs: number;
  isLoading: boolean;
}

/**
 * Hook to fetch data for quick action buttons on the dashboard.
 * Provides real-time counts and stats for:
 * - Active flares
 * - Today's medication logs
 * - Last symptom severity
 * - Today's food logs
 * - Today's trigger logs
 */
export function useQuickActionsData(): QuickActionsData {
  const { userId } = useCurrentUser();

  // Use unified markers hook for flares
  const { data: flareMarkers, isLoading: flaresLoading } = useMarkers({
    userId: userId || '',
    type: 'flare',
    includeResolved: false
  });

  const [data, setData] = useState<QuickActionsData>({
    activeFlares: 0,
    todayMedicationLogs: 0,
    lastSymptomSeverity: null,
    todayFoodLogs: 0,
    todayTriggerLogs: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!userId) {
      setData({
        activeFlares: 0,
        todayMedicationLogs: 0,
        lastSymptomSeverity: null,
        todayFoodLogs: 0,
        todayTriggerLogs: 0,
        isLoading: false,
      });
      return;
    }

    let mounted = true;

    async function fetchData() {
      try {
        // Get today's date range (in ms)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();
        const endOfDay = new Date(today).setHours(23, 59, 59, 999);

        // Fetch all data in parallel (excluding flares which come from useMarkers hook)
        const [medicationEvents, symptomInstances, foodEvents, triggerEvents] = await Promise.all([
          // Today's medication logs
          db.medicationEvents
            .where("userId")
            .equals(userId)
            .and(event => event.timestamp >= startOfDay && event.timestamp <= endOfDay)
            .toArray(),

          // Last symptom instance (sorted by timestamp descending, take 1)
          db.symptomInstances
            .where("userId")
            .equals(userId)
            .reverse()
            .sortBy("timestamp"),

          // Today's food logs (unique meals by mealId)
          db.foodEvents
            .where("userId")
            .equals(userId)
            .and(event => event.timestamp >= startOfDay && event.timestamp <= endOfDay)
            .toArray(),

          // Today's trigger logs
          db.triggerEvents
            .where("userId")
            .equals(userId)
            .and(event => event.timestamp >= startOfDay && event.timestamp <= endOfDay)
            .toArray(),
        ]);

        if (!mounted) return;

        // Process the data
        const activeFlares = flareMarkers.length; // Use data from useMarkers hook
        const todayMedicationLogs = medicationEvents.filter(e => e.taken).length; // Only count taken meds
        const lastSymptomSeverity = symptomInstances.length > 0
          ? symptomInstances[0].severity
          : null;

        // Count unique meals (by mealId)
        const uniqueMealIds = new Set(foodEvents.map(e => e.mealId));
        const todayFoodLogs = uniqueMealIds.size;

        // Count trigger events
        const todayTriggerLogs = triggerEvents.length;

        setData({
          activeFlares,
          todayMedicationLogs,
          lastSymptomSeverity,
          todayFoodLogs,
          todayTriggerLogs,
          isLoading: flaresLoading, // Include flares loading state
        });
      } catch (error) {
        console.error("Failed to fetch quick actions data:", error);
        if (mounted) {
          setData({
            activeFlares: 0,
            todayMedicationLogs: 0,
            lastSymptomSeverity: null,
            todayFoodLogs: 0,
            todayTriggerLogs: 0,
            isLoading: false,
          });
        }
      }
    }

    void fetchData();

    return () => {
      mounted = false;
    };
  }, [userId, flareMarkers, flaresLoading]);

  return data;
}
