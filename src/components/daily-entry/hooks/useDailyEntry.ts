"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DailyEntry,
  DailyMedication,
  DailySymptom,
  DailyTrigger,
} from "@/lib/types/daily-entry";
import {
  MEDICATION_OPTIONS,
  SYMPTOM_OPTIONS,
} from "@/lib/data/daily-entry-presets";

const OFFLINE_QUEUE_KEY = "pst-offline-entry-queue";
const HISTORY_KEY = "pst-entry-history";

const serializeEntry = (entry: DailyEntry) => ({
  ...entry,
  completedAt: entry.completedAt.toISOString(),
});

const deserializeEntry = (entry: ReturnType<typeof serializeEntry>): DailyEntry => ({
  ...entry,
  completedAt: new Date(entry.completedAt),
});

const createInitialEntry = (): DailyEntry => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
  userId: "demo",
  date: new Date().toISOString().slice(0, 10),
  overallHealth: 5,
  energyLevel: 5,
  sleepQuality: 5,
  stressLevel: 5,
  symptoms: [],
  medications: MEDICATION_OPTIONS.map((medication) => ({
    medicationId: medication.id,
    taken: false,
    dosage: medication.dosage,
  })),
  triggers: [],
  duration: 0,
  completedAt: new Date(),
});

interface TouchedSections {
  health: boolean;
  symptoms: boolean;
  medications: boolean;
  triggers: boolean;
  notes: boolean;
}

const defaultTouchedState: TouchedSections = {
  health: false,
  symptoms: false,
  medications: false,
  triggers: false,
  notes: false,
};

const loadPersistedEntries = (storageKey: string) => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(deserializeEntry);
  } catch (error) {
    console.warn(`Unable to parse ${storageKey}`, error);
    return [];
  }
};

export const useDailyEntry = () => {
  const [entry, setEntry] = useState<DailyEntry>(createInitialEntry);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [touchedSections, setTouchedSections] = useState<TouchedSections>(
    defaultTouchedState,
  );
  const [history, setHistory] = useState<DailyEntry[]>(() =>
    loadPersistedEntries(HISTORY_KEY),
  );
  const [queue, setQueue] = useState<DailyEntry[]>(() =>
    loadPersistedEntries(OFFLINE_QUEUE_KEY),
  );
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEntry((prev) => ({
        ...prev,
        duration: Math.max(
          prev.duration,
          Math.floor((Date.now() - startTimeRef.current) / 1000),
        ),
      }));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(history.map(serializeEntry)),
    );
  }, [history]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      OFFLINE_QUEUE_KEY,
      JSON.stringify(queue.map(serializeEntry)),
    );
  }, [queue]);

  const resetEntry = useCallback(() => {
    startTimeRef.current = Date.now();
    setEntry(createInitialEntry());
    setTouchedSections(defaultTouchedState);
  }, []);

  const markSectionTouched = useCallback((section: keyof TouchedSections) => {
    setTouchedSections((prev) => ({ ...prev, [section]: true }));
  }, []);

  const updateEntry = useCallback((changes: Partial<DailyEntry>) => {
    setEntry((prev) => ({
      ...prev,
      ...changes,
      completedAt: changes.completedAt ?? prev.completedAt,
    }));

    if (
      "overallHealth" in changes ||
      "energyLevel" in changes ||
      "sleepQuality" in changes ||
      "stressLevel" in changes
    ) {
      markSectionTouched("health");
    }

    if ("notes" in changes || "mood" in changes || "weather" in changes) {
      markSectionTouched("notes");
    }
  }, [markSectionTouched]);

  const upsertSymptom = useCallback(
    (symptomId: string, changes: Partial<DailySymptom> = {}) => {
      markSectionTouched("symptoms");
      setEntry((prev) => {
        const existing = prev.symptoms.find(
          (symptom) => symptom.symptomId === symptomId,
        );

        const updatedSymptoms: DailySymptom[] = existing
          ? prev.symptoms.map((symptom) =>
              symptom.symptomId === symptomId
                ? {
                    ...symptom,
                    ...changes,
                    symptomId,
                    severity:
                      "severity" in changes
                        ? Math.min(10, Math.max(0, changes.severity ?? symptom.severity))
                        : symptom.severity,
                  }
                : symptom,
            )
          : [
              ...prev.symptoms,
              {
                symptomId,
                severity: changes.severity ?? 5,
                notes: changes.notes,
              },
            ];

        return {
          ...prev,
          symptoms: updatedSymptoms,
        };
      });
    },
    [markSectionTouched],
  );

  const removeSymptom = useCallback((symptomId: string) => {
    markSectionTouched("symptoms");
    setEntry((prev) => ({
      ...prev,
      symptoms: prev.symptoms.filter(
        (symptom) => symptom.symptomId !== symptomId,
      ),
    }));
  }, [markSectionTouched]);

  const updateMedication = useCallback(
    (medicationId: string, changes: Partial<DailyMedication>) => {
      markSectionTouched("medications");
      setEntry((prev) => ({
        ...prev,
        medications: prev.medications.map((medication) =>
          medication.medicationId === medicationId
            ? {
                ...medication,
                ...changes,
              }
            : medication,
        ),
      }));
    },
    [markSectionTouched],
  );

  const toggleMedicationTaken = useCallback(
    (medicationId: string) => {
      markSectionTouched("medications");
      setEntry((prev) => ({
        ...prev,
        medications: prev.medications.map((medication) =>
          medication.medicationId === medicationId
            ? { ...medication, taken: !medication.taken }
            : medication,
        ),
      }));
    },
    [markSectionTouched],
  );

  const upsertTrigger = useCallback(
    (triggerId: string, changes: Partial<DailyTrigger> = {}) => {
      markSectionTouched("triggers");
      setEntry((prev) => {
        const existing = prev.triggers.find(
          (trigger) => trigger.triggerId === triggerId,
        );

        const updatedTriggers: DailyTrigger[] = existing
          ? prev.triggers.map((trigger) =>
              trigger.triggerId === triggerId
                ? {
                    ...trigger,
                    ...changes,
                    triggerId,
                    intensity:
                      "intensity" in changes
                        ? Math.min(10, Math.max(0, changes.intensity ?? trigger.intensity))
                        : trigger.intensity,
                  }
                : trigger,
            )
          : [
              ...prev.triggers,
              {
                triggerId,
                intensity: changes.intensity ?? 5,
                notes: changes.notes,
              },
            ];

        return {
          ...prev,
          triggers: updatedTriggers,
        };
      });
    },
    [markSectionTouched],
  );

  const removeTrigger = useCallback((triggerId: string) => {
    markSectionTouched("triggers");
    setEntry((prev) => ({
      ...prev,
      triggers: prev.triggers.filter(
        (trigger) => trigger.triggerId !== triggerId,
      ),
    }));
  }, [markSectionTouched]);

  const completion = useMemo(() => {
    const touchedCount = Object.values(touchedSections).filter(Boolean).length;
    return Math.round((touchedCount / Object.keys(touchedSections).length) * 100);
  }, [touchedSections]);

  const recentSymptoms = useMemo(() => {
    const fromHistory = history.flatMap((past) => past.symptoms.map((symptom) => symptom.symptomId));
    return Array.from(new Set(fromHistory.concat(SYMPTOM_OPTIONS.map((item) => item.id)))).slice(0, 6);
  }, [history]);

  const saveEntry = useCallback(async () => {
    setIsSaving(true);
    const completedAt = new Date();
    const finalizedEntry: DailyEntry = {
      ...entry,
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      completedAt,
      duration: Math.max(
        entry.duration,
        Math.floor((Date.now() - startTimeRef.current) / 1000),
      ),
    };

    const isOnline = typeof navigator === "undefined" || navigator.onLine;

    const persistHistory = (nextHistory: DailyEntry[]) => {
      setHistory(nextHistory);
    };

    if (!isOnline) {
      setQueue((prev) => [finalizedEntry, ...prev]);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      persistHistory([finalizedEntry, ...history].slice(0, 50));
    }

    setLastSavedAt(completedAt);
    resetEntry();
    setIsSaving(false);
  }, [entry, history, resetEntry]);

  const syncQueuedEntries = useCallback(async () => {
    if (queue.length === 0) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    setHistory((prev) => {
      const merged = [...queue, ...prev].slice(0, 50);
      return merged.sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime(),
      );
    });
    setQueue([]);
  }, [queue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOnline = () => {
      syncQueuedEntries().catch((error) => {
        console.error("Failed to sync queued entries", error);
      });
    };

    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, [syncQueuedEntries]);

  const loadEntry = useCallback((existingEntry: DailyEntry) => {
    startTimeRef.current = Date.now();
    setEntry({
      ...existingEntry,
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      completedAt: new Date(),
      duration: 0,
    });
    setTouchedSections(defaultTouchedState);
  }, []);

  return {
    entry,
    updateEntry,
    upsertSymptom,
    removeSymptom,
    updateMedication,
    toggleMedicationTaken,
    upsertTrigger,
    removeTrigger,
    resetEntry,
    saveEntry,
    isSaving,
    completion,
    lastSavedAt,
    history,
    loadEntry,
    queue,
    syncQueuedEntries,
    recentSymptoms,
  };
};
