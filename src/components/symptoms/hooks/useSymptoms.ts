"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Symptom,
  SymptomDraft,
  SymptomFilter,
  SymptomFilterPreset,
  SymptomSort,
  SymptomStats,
} from "@/lib/types/symptoms";
import {
  exportSymptoms,
  importSymptoms,
  loadFilterPresets,
  loadSymptoms,
  saveFilterPresets,
  saveSymptoms,
} from "@/lib/utils/symptomStorage";

const PAGE_SIZE = 6;

const now = () => new Date();

const SAMPLE_SYMPTOMS: Symptom[] = [
  {
    id: "demo-1",
    userId: "demo",
    name: "Painful nodule",
    category: "pain",
    severity: 6,
    severityScale: {
      type: "numeric",
      min: 0,
      max: 10,
      labels: {
        0: "No pain",
        6: "Moderate",
        10: "Worst",
      },
      colors: {
        0: "#22c55e",
        6: "#f97316",
        10: "#ef4444",
      },
    },
    location: "Left underarm",
    duration: 45,
    triggers: ["Stress"],
    notes: "Felt after long day at work. Responded to warm compress.",
    timestamp: now(),
    updatedAt: now(),
  },
];

const createInitialFilters = (): SymptomFilter => ({
  severityRange: [0, 10],
});

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const applyQueryFilter = (symptom: Symptom, query?: string) => {
  if (!query) {
    return true;
  }

  const haystack = [
    symptom.name,
    symptom.notes ?? "",
    symptom.location ?? "",
    ...(symptom.triggers ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
};

const applyCategoryFilter = (symptom: Symptom, categories?: string[]) => {
  if (!categories?.length) {
    return true;
  }

  return categories.includes(symptom.category);
};

const applySeverityFilter = (symptom: Symptom, range?: [number, number]) => {
  if (!range) {
    return true;
  }

  const [min, max] = range;
  return symptom.severity >= min && symptom.severity <= max;
};

const applyDateFilter = (symptom: Symptom, start?: Date, end?: Date) => {
  if (!start && !end) {
    return true;
  }

  const timestamp = symptom.timestamp.getTime();

  if (start && timestamp < start.getTime()) {
    return false;
  }

  if (end && timestamp > end.getTime()) {
    return false;
  }

  return true;
};

const applyLocationFilter = (symptom: Symptom, location?: string) => {
  if (!location) {
    return true;
  }

  return (symptom.location ?? "").toLowerCase().includes(location.toLowerCase());
};

const getSortValue = (symptom: Symptom, key: SymptomSort["key"]) => {
  switch (key) {
    case "severity":
      return symptom.severity;
    case "name":
      return symptom.name.toLowerCase();
    case "duration":
      return symptom.duration ?? 0;
    case "timestamp":
    default:
      return symptom.timestamp.getTime();
  }
};

const calculateStats = (symptoms: Symptom[]): SymptomStats => {
  if (symptoms.length === 0) {
    return {
      total: 0,
      averageSeverity: 0,
      recentSymptoms: [],
      sevenDayChange: 0,
    };
  }

  const totalSeverity = symptoms.reduce((total, symptom) => total + symptom.severity, 0);
  const sortedByTime = [...symptoms].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );
  const highestSeverity = symptoms.reduce<Symptom | undefined>((current, symptom) => {
    if (!current || symptom.severity > current.severity) {
      return symptom;
    }

    return current;
  }, undefined);

  const nowDate = now();
  const sevenDaysAgo = new Date(nowDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(nowDate.getTime() - 14 * 24 * 60 * 60 * 1000);

  const lastSeven = symptoms.filter(
    (symptom) => symptom.timestamp.getTime() >= sevenDaysAgo.getTime(),
  ).length;
  const previousSeven = symptoms.filter((symptom) => {
    const time = symptom.timestamp.getTime();
    return time < sevenDaysAgo.getTime() && time >= fourteenDaysAgo.getTime();
  }).length;

  return {
    total: symptoms.length,
    averageSeverity: Number((totalSeverity / symptoms.length).toFixed(1)),
    highestSeverity,
    recentSymptoms: sortedByTime.slice(0, 3),
    sevenDayChange: lastSeven - previousSeven,
  };
};

export const useSymptoms = () => {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SymptomFilter>(createInitialFilters);
  const [sort, setSort] = useState<SymptomSort>({ key: "timestamp", direction: "desc" });
  const [page, setPage] = useState(1);
  const [presets, setPresets] = useState<SymptomFilterPreset[]>([]);
  const hasLoaded = useRef(false);

  useEffect(() => {
    const storedSymptoms = loadSymptoms();
    const storedPresets = loadFilterPresets();

    if (storedSymptoms.length > 0) {
      setSymptoms(storedSymptoms);
    } else {
      setSymptoms(SAMPLE_SYMPTOMS);
    }

    setPresets(storedPresets);
    setIsLoading(false);
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }

    saveSymptoms(symptoms);
  }, [symptoms]);

  useEffect(() => {
    if (!hasLoaded.current) {
      return;
    }

    saveFilterPresets(presets);
  }, [presets]);

  const updateFilters = useCallback((next: SymptomFilter) => {
    setFilters(next);
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(createInitialFilters());
    setPage(1);
  }, []);

  const updateSort = useCallback((nextSort: SymptomSort) => {
    setSort(nextSort);
    setPage(1);
  }, []);

  const createSymptom = useCallback((draft: SymptomDraft) => {
    const createdAt = now();
    const id = draft.id ?? (typeof crypto !== "undefined" ? crypto.randomUUID() : `symptom-${createdAt.getTime()}`);
    const timestamp = draft.timestamp ? new Date(draft.timestamp) : createdAt;

    setSymptoms((current) => [
      {
        ...draft,
        id,
        timestamp,
        updatedAt: createdAt,
      },
      ...current,
    ]);
  }, []);

  const updateSymptom = useCallback((id: string, draft: SymptomDraft) => {
    setSymptoms((current) =>
      current.map((symptom) => {
        if (symptom.id !== id) {
          return symptom;
        }

        const timestamp = draft.timestamp ? new Date(draft.timestamp) : symptom.timestamp;

        return {
          ...symptom,
          ...draft,
          id: symptom.id,
          timestamp,
          updatedAt: now(),
        };
      }),
    );
  }, []);

  const deleteSymptom = useCallback((id: string) => {
    setSymptoms((current) => current.filter((symptom) => symptom.id !== id));
  }, []);

  const reassignCategory = useCallback((fromCategory: string, toCategory: string) => {
    setSymptoms((current) =>
      current.map((symptom) => {
        if (symptom.category !== fromCategory) {
          return symptom;
        }

        return {
          ...symptom,
          category: toCategory,
          updatedAt: now(),
        };
      }),
    );
  }, []);

  const exportData = useCallback(() => exportSymptoms(symptoms), [symptoms]);

  const importData = useCallback((payload: string) => {
    const importedSymptoms = importSymptoms(payload);
    setSymptoms(importedSymptoms);
  }, []);

  const savePreset = useCallback(
    (name: string, presetFilters: SymptomFilter) => {
      const preset: SymptomFilterPreset = {
        id:
          typeof crypto !== "undefined"
            ? crypto.randomUUID()
            : `preset-${Date.now()}`,
        name,
        filters: presetFilters,
        createdAt: now(),
      };

      setPresets((current) => [preset, ...current]);
    },
    [],
  );

  const applyPreset = useCallback((presetId: string) => {
    setPresets((current) => {
      const preset = current.find((item) => item.id === presetId);

      if (preset) {
        setFilters(preset.filters);
        setPage(1);
      }

      return current;
    });
  }, []);

  const deletePreset = useCallback((presetId: string) => {
    setPresets((current) => current.filter((preset) => preset.id !== presetId));
  }, []);

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((symptom) => {
      return (
        applyQueryFilter(symptom, filters.query) &&
        applyCategoryFilter(symptom, filters.categories) &&
        applySeverityFilter(symptom, filters.severityRange) &&
        applyDateFilter(symptom, filters.startDate, filters.endDate) &&
        applyLocationFilter(symptom, filters.location)
      );
    });
  }, [filters.categories, filters.endDate, filters.location, filters.query, filters.severityRange, filters.startDate, symptoms]);

  const sortedSymptoms = useMemo(() => {
    const items = [...filteredSymptoms];

    items.sort((a, b) => {
      const aValue = getSortValue(a, sort.key);
      const bValue = getSortValue(b, sort.key);

      if (aValue < bValue) {
        return sort.direction === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sort.direction === "asc" ? 1 : -1;
      }

      return 0;
    });

    return items;
  }, [filteredSymptoms, sort.direction, sort.key]);

  const totalFiltered = sortedSymptoms.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));

  useEffect(() => {
    setPage((currentPage) => clamp(currentPage, 1, totalPages));
  }, [totalPages]);

  const paginatedSymptoms = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return sortedSymptoms.slice(startIndex, startIndex + PAGE_SIZE);
  }, [page, sortedSymptoms]);

  const stats = useMemo(() => calculateStats(symptoms), [symptoms]);

  const locations = useMemo(() => {
    const unique = new Set<string>();
    symptoms.forEach((symptom) => {
      if (symptom.location) {
        unique.add(symptom.location);
      }
    });
    return Array.from(unique).sort();
  }, [symptoms]);

  const triggerSuggestions = useMemo(() => {
    const unique = new Set<string>();
    symptoms.forEach((symptom) => {
      (symptom.triggers ?? []).forEach((trigger) => unique.add(trigger));
    });
    return Array.from(unique).sort();
  }, [symptoms]);

  const symptomNameSuggestions = useMemo(() => {
    const unique = new Set<string>();
    symptoms.forEach((symptom) => unique.add(symptom.name));
    return Array.from(unique).sort();
  }, [symptoms]);

  return {
    symptoms,
    paginatedSymptoms,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    reassignCategory,
    filters,
    updateFilters,
    resetFilters,
    sort,
    updateSort,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    totalFiltered,
    totalPages,
    isLoading,
    stats,
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    exportData,
    importData,
    locations,
    triggerSuggestions,
    symptomNameSuggestions,
  };
};
