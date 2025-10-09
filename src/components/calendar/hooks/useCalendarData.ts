"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDayDetail,
  CalendarEntry,
  CalendarFilterOptions,
  CalendarFilters,
  CalendarMetrics,
  CalendarViewConfig,
  CalendarViewType,
  DisplayOptions,
  TimelineEvent,
} from "@/lib/types/calendar";
import { DailyEntry } from "@/lib/types/daily-entry";
import {
  MEDICATION_OPTIONS,
  MOOD_OPTIONS,
  SYMPTOM_OPTIONS,
  TRIGGER_OPTIONS,
} from "@/lib/data/daily-entry-presets";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { symptomRepository } from "@/lib/repositories/symptomRepository";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { useDateNavigation } from "./useDateNavigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface CalendarDataHookOptions {
  filters: CalendarFilters;
  searchTerm: string;
}

interface CalendarDataResult {
  viewConfig: CalendarViewConfig;
  updateView: (update: Partial<CalendarViewConfig>) => void;
  entries: CalendarEntry[];
  events: TimelineEvent[];
  metrics: CalendarMetrics;
  filterOptions: CalendarFilterOptions;
  selectedDate?: string;
  selectDate: (date?: string) => void;
  selectedDay?: CalendarDayDetail;
  dayLookup: Map<string, CalendarDayDetail>;
  timelineZoom: "week" | "month" | "quarter" | "year";
  setTimelineZoom: (zoom: "week" | "month" | "quarter" | "year") => void;
  navigation: ReturnType<typeof useDateNavigation>;
  eventsByDate: Map<string, TimelineEvent[]>;
}

type SymptomLookupValue = { label: string; category: string };
type MedicationLookupValue = { name: string; dosage?: string; schedule?: string };
type TriggerLookupValue = { label: string; category: string; description?: string };

const presetSymptomLookup = new Map<string, SymptomLookupValue>(
  SYMPTOM_OPTIONS.map((option) => [option.id, {
    label: option.label,
    category: option.category,
  }]),
);

const presetMedicationLookup = new Map<string, MedicationLookupValue>(
  MEDICATION_OPTIONS.map((option) => [option.id, {
    name: option.name,
    dosage: option.dosage,
    schedule: option.schedule,
  }]),
);

const presetTriggerLookup = new Map<string, TriggerLookupValue>(
  TRIGGER_OPTIONS.map((option) => [option.id, {
    label: option.label,
    description: option.description,
    category: "Trigger",
  }]),
);

const moodLookup = new Map(MOOD_OPTIONS.map((option) => [option.id, option]));

const createPresetSymptomLookup = () => new Map(presetSymptomLookup);
const createPresetMedicationLookup = () => new Map(presetMedicationLookup);
const createPresetTriggerLookup = () => new Map(presetTriggerLookup);

interface LookupMaps {
  symptoms: Map<string, SymptomLookupValue>;
  medications: Map<string, MedicationLookupValue>;
  triggers: Map<string, TriggerLookupValue>;
  moods: Map<string, typeof MOOD_OPTIONS[number]>;
}

const createBaseRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start, end: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
};

const impactFromIntensity = (value: number): "low" | "medium" | "high" => {
  if (value >= 7) {
    return "high";
  }
  if (value >= 4) {
    return "medium";
  }
  return "low";
};

const buildDataset = (history: DailyEntry[], lookups: LookupMaps) => {
  const entries: CalendarEntry[] = [];
  const dayLookup = new Map<string, CalendarDayDetail>();
  const events: TimelineEvent[] = [];

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach((entry) => {
    const iso = entry.date;
    const completedAt = entry.completedAt instanceof Date
      ? entry.completedAt
      : new Date(entry.completedAt);

    const symptomsDetails = entry.symptoms.map((symptom, index) => {
      const option = lookups.symptoms.get(symptom.symptomId);
      return {
        id: `${iso}-symptom-${symptom.symptomId}-${index}`,
        name: option?.label ?? symptom.symptomId,
        severity: Math.max(0, Math.min(10, Math.round(symptom.severity))),
        category: option?.category ?? "Symptom",
        note: symptom.notes,
      };
    });

    const medicationDetails = entry.medications.map((medication, index) => {
      const option = lookups.medications.get(medication.medicationId);
      return {
        id: `${iso}-medication-${medication.medicationId}-${index}`,
        name: option?.name ?? medication.medicationId,
        dose: medication.dosage ?? option?.dosage ?? "",
        taken: medication.taken,
        schedule: option?.schedule,
        category: "Medication",
      };
    });

    const triggerDetails = entry.triggers.map((trigger, index) => {
      const option = lookups.triggers.get(trigger.triggerId);
      return {
        id: `${iso}-trigger-${trigger.triggerId}-${index}`,
        name: option?.label ?? trigger.triggerId,
        category: option?.category ?? "Trigger",
        impact: impactFromIntensity(trigger.intensity),
        intensity: trigger.intensity,
      };
    });

    const moodLabel = entry.mood ? lookups.moods.get(entry.mood)?.label ?? entry.mood : undefined;

    const calendarEntry: CalendarEntry = {
      date: iso,
      hasEntry: true,
      overallHealth: entry.overallHealth,
      symptomCount: symptomsDetails.length,
      medicationCount: medicationDetails.filter((item) => item.taken).length,
      triggerCount: triggerDetails.length,
      mood: moodLabel,
      notes: Boolean(entry.notes),
      symptomCategories: [...new Set(symptomsDetails.map((item) => item.category))],
      triggerCategories: triggerDetails.length > 0 ? ["Trigger"] : [],
      medicationCategories: medicationDetails.length > 0 ? ["Medication"] : [],
      symptomTags: symptomsDetails.map((item) => item.name),
      triggerTags: triggerDetails.map((item) => item.name),
      medicationTags: medicationDetails
        .filter((item) => item.taken)
        .map((item) => item.name),
    };

    const detail: CalendarDayDetail = {
      ...calendarEntry,
      energyLevel: entry.energyLevel,
      notesSummary: entry.notes,
      symptomsDetails,
      medicationDetails,
      triggerDetails,
    };

    entries.push(calendarEntry);
    dayLookup.set(iso, detail);

    symptomsDetails.forEach((symptom, symptomIndex) => {
      const eventDate = new Date(completedAt);
      eventDate.setHours(9 + symptomIndex, 0, 0, 0);
      events.push({
        id: `${iso}-event-symptom-${symptomIndex}`,
        date: eventDate,
        type: "symptom",
        title: `${symptom.name} (${symptom.severity}/10)`,
        severity: symptom.severity,
        description: symptom.note,
        category: symptom.category,
        relatedId: symptom.id,
      });
    });

    medicationDetails.forEach((medication, medicationIndex) => {
      const eventDate = new Date(completedAt);
      eventDate.setHours(7 + medicationIndex, 30, 0, 0);
      events.push({
        id: `${iso}-event-medication-${medicationIndex}`,
        date: eventDate,
        type: "medication",
        title: `${medication.name} ${medication.taken ? "taken" : "missed"}`,
        description: [medication.schedule, medication.dose].filter(Boolean).join(" · "),
        category: "Medication",
        relatedId: medication.id,
      });
    });

    triggerDetails.forEach((trigger, triggerIndex) => {
      const eventDate = new Date(completedAt);
      eventDate.setHours(12 + triggerIndex, 15, 0, 0);
      const baseTrigger = entry.triggers[triggerIndex];
      const severity = baseTrigger
        ? Math.max(0, Math.min(10, Math.round(baseTrigger.intensity)))
        : trigger.impact === "high"
          ? 9
          : trigger.impact === "medium"
            ? 6
            : 2;
      events.push({
        id: `${iso}-event-trigger-${triggerIndex}`,
        date: eventDate,
        type: "trigger",
        title: `${trigger.name} (${trigger.impact})`,
        description: baseTrigger?.notes,
        category: "Trigger",
        relatedId: trigger.id,
        severity,
      });
    });

    if (entry.notes) {
      const eventDate = new Date(completedAt);
      eventDate.setHours(20, 0, 0, 0);
      events.push({
        id: `${iso}-event-note`,
        date: eventDate,
        type: "note",
        title: "Reflection added",
        description: entry.notes,
        category: "Note",
      });
    }
  });

  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  return { entries, dayLookup, events };
};

const includesSome = (source: string[] = [], targets: string[] = []) =>
  targets.length === 0 || targets.some((target) => source.includes(target));

const entryMatchesFilters = (
  entry: CalendarEntry,
  detail: CalendarDayDetail | undefined,
  filters: CalendarFilters,
  searchTerm: string,
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (normalizedSearch) {
    const haystack = [
      entry.date,
      entry.mood ?? "",
      detail?.notesSummary ?? "",
      ...(detail?.symptomsDetails.map((item) => item.name) ?? []),
      ...(detail?.medicationDetails.map((item) => item.name) ?? []),
      ...(detail?.triggerDetails.map((item) => item.name) ?? []),
    ]
      .join(" ")
      .toLowerCase();

    if (!haystack.includes(normalizedSearch)) {
      return false;
    }
  }

  if (filters.severityRange && typeof entry.overallHealth === "number") {
    const [min, max] = filters.severityRange;
    if (entry.overallHealth < min || entry.overallHealth > max) {
      return false;
    }
  }

  if (!includesSome(entry.symptomTags, filters.symptoms)) {
    return false;
  }

  if (!includesSome(entry.medicationTags, filters.medications)) {
    return false;
  }

  if (!includesSome(entry.triggerTags, filters.triggers)) {
    return false;
  }

  if (filters.categories && filters.categories.length > 0) {
    const categories = [
      ...(entry.symptomCategories ?? []),
      ...(entry.medicationCategories ?? []),
      ...(entry.triggerCategories ?? []),
      ...(entry.notes ? ["Note"] : []),
    ];

    if (!includesSome(categories, filters.categories)) {
      return false;
    }
  }

  return true;
};

const eventMatchesFilters = (
  event: TimelineEvent,
  filters: CalendarFilters,
  searchTerm: string,
) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (normalizedSearch) {
    const haystack = `${event.title} ${event.description ?? ""}`.toLowerCase();
    if (!haystack.includes(normalizedSearch)) {
      return false;
    }
  }

  if (filters.categories && filters.categories.length > 0) {
    if (!event.category || !filters.categories.includes(event.category)) {
      return false;
    }
  }

  if (filters.severityRange && typeof event.severity === "number") {
    const [min, max] = filters.severityRange;
    if (event.severity < min || event.severity > max) {
      return false;
    }
  }

  if (filters.symptoms && filters.symptoms.length > 0) {
    if (event.type !== "symptom") {
      return false;
    }

    if (!filters.symptoms.some((symptom) => event.title.toLowerCase().includes(symptom.toLowerCase()))) {
      return false;
    }
  }

  if (filters.medications && filters.medications.length > 0) {
    if (event.type !== "medication") {
      return false;
    }

    if (!filters.medications.some((medication) => event.title.toLowerCase().includes(medication.toLowerCase()))) {
      return false;
    }
  }

  if (filters.triggers && filters.triggers.length > 0) {
    if (event.type !== "trigger") {
      return false;
    }

    if (!filters.triggers.some((trigger) => event.title.toLowerCase().includes(trigger.toLowerCase()))) {
      return false;
    }
  }

  return true;
};

const emptyMetrics: CalendarMetrics = {
  healthTrend: [],
  symptomFrequency: [],
  medicationAdherence: [],
  correlationInsights: [],
};

export const useCalendarData = ({ filters, searchTerm }: CalendarDataHookOptions): CalendarDataResult => {
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    showHealthScore: true,
    showSymptoms: true,
    showMedications: true,
    showTriggers: true,
    colorScheme: "severity",
  });
  const { userId } = useCurrentUser();
  const [timelineZoom, setTimelineZoom] = useState<"week" | "month" | "quarter" | "year">("month");
  const [history, setHistory] = useState<DailyEntry[]>([]);
  const [symptomLookup, setSymptomLookup] = useState<Map<string, SymptomLookupValue>>(
    () => createPresetSymptomLookup(),
  );
  const [medicationLookup, setMedicationLookup] = useState<Map<string, MedicationLookupValue>>(
    () => createPresetMedicationLookup(),
  );
  const [triggerLookup, setTriggerLookup] = useState<Map<string, TriggerLookupValue>>(
    () => createPresetTriggerLookup(),
  );
  const navigation = useDateNavigation(createBaseRange(), viewType);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!userId) {
      setSymptomLookup(createPresetSymptomLookup());
      setMedicationLookup(createPresetMedicationLookup());
      setTriggerLookup(createPresetTriggerLookup());
      return;
    }

    const loadLookups = async () => {
      const [symptoms, medications, triggers] = await Promise.all([
        symptomRepository.getAll(userId),
        medicationRepository.getAll(userId),
        triggerRepository.getAll(userId),
      ]);

      setSymptomLookup(() => {
        const map = createPresetSymptomLookup();
        symptoms.forEach((symptom) => {
          map.set(symptom.id, {
            label: symptom.name,
            category: symptom.category ?? "Symptom",
          });
        });
        return map;
      });

      setMedicationLookup(() => {
        const map = createPresetMedicationLookup();
        medications.forEach((medication) => {
          const scheduleTimes = medication.schedule?.map((slot) => slot.time).join(", ");
          const scheduleSummary = scheduleTimes || medication.frequency;
          map.set(medication.id, {
            name: medication.name,
            dosage: medication.dosage,
            schedule: scheduleSummary,
          });
        });
        return map;
      });

      setTriggerLookup(() => {
        const map = createPresetTriggerLookup();
        triggers.forEach((trigger) => {
          map.set(trigger.id, {
            label: trigger.name,
            category: trigger.category ?? "Trigger",
            description: trigger.description,
          });
        });
        return map;
      });
    };

    loadLookups().catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const loadEntries = async () => {
      const entries = await dailyEntryRepository.getAll(userId);
      // Convert DailyEntryRecord to DailyEntry format
      const converted = entries.map(entry => ({
        ...entry,
        completedAt: new Date(entry.createdAt),
      }));
      setHistory(converted);
    };

    loadEntries().catch(console.error);

    const handleHistoryUpdate = () => {
      loadEntries().catch(console.error);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("daily-entry-updated", handleHistoryUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("daily-entry-updated", handleHistoryUpdate);
      }
    };
  }, [userId]);

  const dataset = useMemo(
    () => buildDataset(history, {
      symptoms: symptomLookup,
      medications: medicationLookup,
      triggers: triggerLookup,
      moods: moodLookup,
    }),
    [history, symptomLookup, medicationLookup, triggerLookup],
  );

  // Initialize selected date to latest entry on first load only
  useEffect(() => {
    if (dataset.entries.length === 0 || selectedDate) {
      return;
    }

    const latest = dataset.entries[dataset.entries.length - 1];
    setSelectedDate(latest.date);
  }, [dataset.entries, selectedDate]);

  const entriesInRange = useMemo(
    () =>
      dataset.entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= navigation.range.start && entryDate <= navigation.range.end;
      }),
    [dataset.entries, navigation.range.end, navigation.range.start],
  );

  const filteredEntries = useMemo(
    () =>
      entriesInRange.filter((entry) =>
        entryMatchesFilters(entry, dataset.dayLookup.get(entry.date), filters, searchTerm),
      ),
    [dataset.dayLookup, entriesInRange, filters, searchTerm],
  );

  const filteredEvents = useMemo(
    () =>
      dataset.events.filter((event) => {
        const inRange =
          event.date >= navigation.range.start && event.date <= navigation.range.end;
        return inRange && eventMatchesFilters(event, filters, searchTerm);
      }),
    [dataset.events, filters, navigation.range.end, navigation.range.start, searchTerm],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    filteredEvents.forEach((event) => {
      const iso = event.date.toISOString().slice(0, 10);
      if (!map.has(iso)) {
        map.set(iso, []);
      }
      map.get(iso)?.push(event);
    });
    return map;
  }, [filteredEvents]);

  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const stillVisible =
      filteredEntries.some((entry) => entry.date === selectedDate) ||
      filteredEvents.some((event) => event.date.toISOString().startsWith(selectedDate));

    if (!stillVisible) {
      setSelectedDate(filteredEntries.at(-1)?.date ?? filteredEntries[0]?.date);
    }
  }, [filteredEntries, filteredEvents, selectedDate]);

  const metrics = useMemo<CalendarMetrics>(() => {
    if (filteredEntries.length === 0) {
      return emptyMetrics;
    }

    const healthTrend = filteredEntries.map((entry) => ({
      date: entry.date,
      score: entry.overallHealth ?? 0,
    }));

    const symptomFrequencyMap = new Map<string, number>();
    filteredEntries.forEach((entry) => {
      const detail = dataset.dayLookup.get(entry.date);
      detail?.symptomsDetails.forEach((symptom) => {
        symptomFrequencyMap.set(
          symptom.name,
          (symptomFrequencyMap.get(symptom.name) ?? 0) + 1,
        );
      });
    });

    const medicationAdherenceMap = new Map<string, { taken: number; missed: number }>();
    filteredEntries.forEach((entry) => {
      const detail = dataset.dayLookup.get(entry.date);
      detail?.medicationDetails.forEach((medication) => {
        const current =
          medicationAdherenceMap.get(medication.name) ?? { taken: 0, missed: 0 };
        if (medication.taken) {
          current.taken += 1;
        } else {
          current.missed += 1;
        }
        medicationAdherenceMap.set(medication.name, current);
      });
    });

    const correlationMap = new Map<
      string,
      { symptom: string; trigger: string; occurrences: number; intensityTotal: number }
    >();

    filteredEntries.forEach((entry) => {
      const detail = dataset.dayLookup.get(entry.date);
      if (!detail) {
        return;
      }

      detail.symptomsDetails.forEach((symptom) => {
        detail.triggerDetails.forEach((trigger) => {
          const key = `${symptom.name}__${trigger.name}`;
          const intensity = trigger.intensity;

          const current =
            correlationMap.get(key) ?? {
              symptom: symptom.name,
              trigger: trigger.name,
              occurrences: 0,
              intensityTotal: 0,
            };

          current.occurrences += 1;
          current.intensityTotal += intensity;
          correlationMap.set(key, current);
        });
      });
    });

    const symptomFrequency = Array.from(symptomFrequencyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const medicationAdherence = Array.from(medicationAdherenceMap.entries())
      .sort((a, b) => b[1].taken + b[1].missed - (a[1].taken + a[1].missed))
      .map(([name, value]) => ({ name, ...value }));

    const correlationInsights = Array.from(correlationMap.values())
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 6)
      .map((item) => ({
        symptom: item.symptom,
        trigger: item.trigger,
        correlation: Number(
          (item.intensityTotal / (item.occurrences * 10)).toFixed(2),
        ),
        occurrences: item.occurrences,
      }));

    return {
      healthTrend,
      symptomFrequency,
      medicationAdherence,
      correlationInsights,
    };
  }, [dataset.dayLookup, filteredEntries]);

  const filterOptions = useMemo<CalendarFilterOptions>(() => {
    const symptomLabels = new Set<string>();
    symptomLookup.forEach((option) => {
      symptomLabels.add(option.label);
    });

    const medicationNames = new Set<string>();
    medicationLookup.forEach((option) => {
      medicationNames.add(option.name);
    });

    const triggerLabels = new Set<string>();
    triggerLookup.forEach((option) => {
      triggerLabels.add(option.label);
    });

    const categories = new Set<string>(["Medication", "Trigger", "Note"]);
    symptomLookup.forEach((option) => categories.add(option.category));
    triggerLookup.forEach((option) => categories.add(option.category));

    return {
      symptoms: Array.from(symptomLabels).sort((a, b) => a.localeCompare(b)),
      medications: Array.from(medicationNames).sort((a, b) => a.localeCompare(b)),
      triggers: Array.from(triggerLabels).sort((a, b) => a.localeCompare(b)),
      categories: Array.from(categories),
    };
  }, [medicationLookup, symptomLookup, triggerLookup]);

  const viewConfig = useMemo<CalendarViewConfig>(
    () => ({
      viewType,
      dateRange: navigation.range,
      filters,
      displayOptions,
    }),
    [displayOptions, filters, navigation.range, viewType],
  );

  const updateView = (update: Partial<CalendarViewConfig>) => {
    if (update.viewType && update.viewType !== viewType) {
      setViewType(update.viewType as CalendarViewType);
    }

    if (update.displayOptions) {
      setDisplayOptions((current) => ({
        ...current,
        ...update.displayOptions,
      }));
    }

    if (update.dateRange) {
      navigation.setRange(update.dateRange);
    }
  };

  return {
    viewConfig,
    updateView,
    entries: filteredEntries,
    events: filteredEvents,
    metrics,
  filterOptions,
    selectedDate,
    selectDate: setSelectedDate,
    selectedDay: selectedDate ? dataset.dayLookup.get(selectedDate) : undefined,
    dayLookup: dataset.dayLookup,
    timelineZoom,
    setTimelineZoom,
    navigation,
    eventsByDate,
  };
};
