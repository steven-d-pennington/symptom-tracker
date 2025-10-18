"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarFilters, FilterPreset } from "@/lib/types/calendar";

const PRESET_STORAGE_KEY = "pst-calendar-filter-presets";

const loadPresets = (): FilterPreset[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as FilterPreset[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load calendar filter presets", error);
    return [];
  }
};

const persistPresets = (presets: FilterPreset[]) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.error("Failed to persist calendar filter presets", error);
  }
};

const createPresetId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `preset-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
};

export const useCalendarFilters = (initialFilters: CalendarFilters = {}) => {
  const [filters, setFilters] = useState<CalendarFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [presets, setPresets] = useState<FilterPreset[]>(() => loadPresets());
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    persistPresets(presets);
  }, [presets]);

  const updateFilters = useCallback((update: Partial<CalendarFilters>) => {
    setFilters((current) => ({
      ...current,
      ...update,
    }));
    setActivePresetId(null);
  }, []);

  const updateSeverityRange = useCallback(
    (range: [number, number]) => {
      const [min, max] = range;
      const normalized: [number, number] = [
        Math.max(0, Math.min(min, max)),
        Math.min(10, Math.max(min, max)),
      ];
      updateFilters({ severityRange: normalized });
    },
    [updateFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setActivePresetId(null);
  }, []);

  const savePreset = useCallback((name: string) => {
    if (!name.trim()) {
      return;
    }

    setPresets((current) => {
      const nextPreset: FilterPreset = {
        id: createPresetId(),
        name: name.trim(),
        filters,
        createdAt: new Date().toISOString(),
      };

      return [...current.filter((preset) => preset.name !== nextPreset.name), nextPreset];
    });
  }, [filters]);

  const deletePreset = useCallback((presetId: string) => {
    setPresets((current) => current.filter((preset) => preset.id !== presetId));
    setActivePresetId((current) => (current === presetId ? null : current));
  }, []);

  const applyPreset = useCallback((presetId: string) => {
    setPresets((current) => {
      const target = current.find((preset) => preset.id === presetId);
      if (target) {
        setFilters(target.filters);
        setActivePresetId(target.id);
      }
      return current;
    });
  }, []);

  const state = useMemo(
    () => ({
      filters,
      updateFilters,
      updateSeverityRange,
      clearFilters,
      searchTerm,
      setSearchTerm,
      presets,
      savePreset,
      applyPreset,
      deletePreset,
      activePresetId,
    }),
    [
      filters,
      updateFilters,
      updateSeverityRange,
      clearFilters,
      searchTerm,
      presets,
      savePreset,
      applyPreset,
      deletePreset,
      activePresetId,
    ],
  );

  return state;
};
