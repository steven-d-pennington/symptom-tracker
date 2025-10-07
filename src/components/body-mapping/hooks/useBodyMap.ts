import { useState, useCallback } from "react";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { bodyMapLocationRepository } from "@/lib/repositories/bodyMapLocationRepository";

export function useBodyMap(userId: string) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");
  const [symptoms, setSymptoms] = useState<BodyMapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSymptoms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bodyMapLocationRepository.getAll(userId);
      setSymptoms(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load symptoms"));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadSymptomsByDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await bodyMapLocationRepository.getByDateRange(
          userId,
          startDate,
          endDate
        );
        setSymptoms(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load symptoms")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  const addSymptomLocation = useCallback(
    async (
      location: Omit<BodyMapLocation, "id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      try {
        setError(null);
        await bodyMapLocationRepository.create({
          ...location,
          userId,
        });
        await loadSymptoms();
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to add symptom")
        );
        throw err;
      }
    },
    [userId, loadSymptoms]
  );

  const updateSymptomLocation = useCallback(
    async (id: string, updates: Partial<BodyMapLocation>) => {
      try {
        setError(null);
        await bodyMapLocationRepository.update(id, updates);
        await loadSymptoms();
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update symptom")
        );
        throw err;
      }
    },
    [loadSymptoms]
  );

  const deleteSymptomLocation = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await bodyMapLocationRepository.delete(id);
        await loadSymptoms();
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to delete symptom")
        );
        throw err;
      }
    },
    [loadSymptoms]
  );

  const getSymptomsForRegion = useCallback(
    (regionId: string) => {
      return symptoms.filter((s) => s.bodyRegionId === regionId);
    },
    [symptoms]
  );

  const changeView = useCallback((view: "front" | "back" | "left" | "right") => {
    setCurrentView(view);
    setSelectedRegion(null); // Clear selection when changing views
  }, []);

  return {
    selectedRegion,
    setSelectedRegion,
    currentView,
    changeView,
    symptoms,
    isLoading,
    error,
    loadSymptoms,
    loadSymptomsByDateRange,
    addSymptomLocation,
    updateSymptomLocation,
    deleteSymptomLocation,
    getSymptomsForRegion,
  };
}
