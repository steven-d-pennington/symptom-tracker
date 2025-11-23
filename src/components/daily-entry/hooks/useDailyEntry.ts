"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DailyEntry,
  DailyMedication,
  DailySymptom,
  DailyTrigger,
} from "@/lib/types/daily-entry";
import {
  SYMPTOM_OPTIONS,
} from "@/lib/data/daily-entry-presets";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { MedicationRecord } from "@/lib/db/schema";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import { medicationEventRepository } from "@/lib/repositories/medicationEventRepository";
import { triggerEventRepository } from "@/lib/repositories/triggerEventRepository";

const createInitialEntry = (userId: string, medications: MedicationRecord[] = []): DailyEntry => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
  userId,
  date: new Date().toISOString().slice(0, 10),
  overallHealth: 5,
  energyLevel: 5,
  sleepQuality: 5,
  stressLevel: 5,
  symptoms: [],
  medications: medications.map((medication) => ({
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

export const useDailyEntry = () => {
  const { userId } = useCurrentUser();
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [entry, setEntry] = useState<DailyEntry>(() => createInitialEntry(userId || "", []));
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [touchedSections, setTouchedSections] = useState<TouchedSections>(
    defaultTouchedState,
  );
  const [history, setHistory] = useState<DailyEntry[]>([]);
  const [queue, setQueue] = useState<DailyEntry[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const [isHydrated, setIsHydrated] = useState(false);

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

  // Load medications from IndexedDB on mount
  useEffect(() => {
    if (!userId) return;

    const loadMedications = async () => {
      const meds = await medicationRepository.getActive(userId);
      setMedications(meds);

      // Reset entry with loaded medications
      setEntry(createInitialEntry(userId, meds));
    };

    loadMedications().catch(console.error);
  }, [userId]);

  // Load history from IndexedDB on mount
  useEffect(() => {
    if (!userId) return;

    const loadHistory = async () => {
      const entries = await dailyEntryRepository.getAll(userId);
      const converted = entries.map(entry => ({
        ...entry,
        completedAt: new Date(entry.createdAt),
      }));
      setHistory(converted);
      setIsHydrated(true);
    };

    loadHistory().catch(console.error);
  }, [userId]);

  // Load queue from localStorage (offline entries are ephemeral)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("pst-offline-queue");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setQueue(parsed.map(entry => ({
            ...entry,
            completedAt: new Date(entry.completedAt),
          })));
        }
      } catch (error) {
        console.error("Failed to load offline queue", error);
      }
    }
  }, []);

  // Save queue to localStorage (offline entries are ephemeral)
  useEffect(() => {
    if (typeof window === "undefined" || !isHydrated) return;
    localStorage.setItem("pst-offline-queue", JSON.stringify(queue));
  }, [queue, isHydrated]);

  const resetEntry = useCallback(() => {
    startTimeRef.current = Date.now();
    setEntry(createInitialEntry(userId || "", medications));
    setTouchedSections(defaultTouchedState);
  }, [userId, medications]);

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

    if (!isOnline) {
      setQueue((prev) => [finalizedEntry, ...prev]);
    } else {
      try {
        // Save to IndexedDB (Daily Entry Journal)
        await dailyEntryRepository.create({
          ...finalizedEntry,
          createdAt: completedAt,
          updatedAt: completedAt,
        });

        // Save individual events for Timeline visibility
        // 1. Symptoms
        for (const symptom of finalizedEntry.symptoms) {
          // Fetch symptom definition to get name, category, etc.
          // We need to import symptomRepository for this, but it's not imported yet.
          // Wait, it IS imported in line 15 of the original file? No, line 15 is useCurrentUser.
          // I need to add symptomRepository import.
          // Actually, I can't import it inside the function.
          // I will assume it's imported or I will add the import in a separate chunk if needed.
          // Checking imports... symptomRepository IS imported in the file (line 15 in my previous view, but I might have missed it).
          // Let's check the file content again. Line 13: dailyEntryRepository. Line 14: medicationRepository.
          // I need to add symptomRepository import.

          // Wait, I can't see the imports here. I'll assume I need to add it.
          // But I'm in a replacement chunk.

          // Let's use the existing imports if possible.
          // I'll use a dynamic import or assume it's there.
          // Actually, I'll add the import in a separate chunk.

          // For now, let's write the logic assuming symptomRepository is available.
          // But wait, I can't compile if it's not there.
          // I'll add the import in the top chunk.

          const symptomDef = await import("@/lib/repositories/symptomRepository").then(m => m.symptomRepository.getById(symptom.symptomId));

          if (symptomDef) {
            await symptomInstanceRepository.create({
              userId: finalizedEntry.userId,
              name: symptomDef.name,
              category: symptomDef.category,
              severity: symptom.severity,
              severityScale: {
                type: "numeric",
                min: symptomDef.severityScale.min,
                max: symptomDef.severityScale.max,
                labels: symptomDef.severityScale.labels,
              },
              notes: symptom.notes,
              timestamp: completedAt,
              // Optional fields
              location: undefined,
              duration: undefined,
              triggers: undefined,
              photos: undefined,
            });
          }
        }

        // 2. Medications (only taken ones)
        for (const med of finalizedEntry.medications) {
          if (med.taken) {
            await medicationEventRepository.create({
              userId: finalizedEntry.userId,
              medicationId: med.medicationId,
              taken: true,
              dosage: med.dosage,
              timestamp: completedAt.getTime(),
              notes: "Logged via Daily Entry",
            });
          }
        }

        // 3. Triggers
        for (const trigger of finalizedEntry.triggers) {
          await triggerEventRepository.create({
            userId: finalizedEntry.userId,
            triggerId: trigger.triggerId,
            intensity: trigger.intensity >= 7 ? 'high' : trigger.intensity >= 4 ? 'medium' : 'low',
            notes: trigger.notes,
            timestamp: completedAt.getTime(),
          });
        }

        // Reload history
        const entries = await dailyEntryRepository.getAll("demo");
        const converted = entries.map(entry => ({
          ...entry,
          completedAt: new Date(entry.createdAt),
        }));
        setHistory(converted);

        // Dispatch event for other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("daily-entry-updated"));
          // Also trigger timeline refresh
          window.dispatchEvent(new CustomEvent("timeline-refresh-needed"));
        }
      } catch (error) {
        console.error("Failed to save entry", error);
        setQueue((prev) => [finalizedEntry, ...prev]);
      }
    }

    setLastSavedAt(completedAt);
    resetEntry();
    setIsSaving(false);
  }, [entry, resetEntry]);

  const syncQueuedEntries = useCallback(async () => {
    if (queue.length === 0) {
      return;
    }

    try {
      // Save all queued entries to IndexedDB
      for (const queuedEntry of queue) {
        await dailyEntryRepository.create({
          ...queuedEntry,
          createdAt: queuedEntry.completedAt,
          updatedAt: queuedEntry.completedAt,
        });
      }

      // Reload history from IndexedDB
      const entries = await dailyEntryRepository.getAll("demo");
      const converted = entries.map(entry => ({
        ...entry,
        completedAt: new Date(entry.createdAt),
      }));
      setHistory(converted);

      // Clear queue
      setQueue([]);

      // Dispatch event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("daily-entry-updated"));
      }
    } catch (error) {
      console.error("Failed to sync queued entries", error);
    }
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
    medications,
  };
};
