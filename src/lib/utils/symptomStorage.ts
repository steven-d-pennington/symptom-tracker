import {
  Symptom,
  SymptomFilterPreset,
} from "@/lib/types/symptoms";

const SYMPTOM_STORAGE_KEY = "pst:symptoms";
const SYMPTOM_FILTER_PRESETS_KEY = "pst:symptom-filter-presets";

const parseDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  const date = typeof value === "string" || typeof value === "number" ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const hydrateSymptom = (raw: Symptom): Symptom => ({
  ...raw,
  timestamp: parseDate(raw.timestamp),
  updatedAt: parseDate(raw.updatedAt),
});

export const loadSymptoms = (): Symptom[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SYMPTOM_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Symptom[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(hydrateSymptom);
  } catch (error) {
    console.warn("Failed to load symptoms from storage", error);
    return [];
  }
};

export const saveSymptoms = (symptoms: Symptom[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SYMPTOM_STORAGE_KEY, JSON.stringify(symptoms));
  } catch (error) {
    console.warn("Failed to save symptoms", error);
  }
};

export const exportSymptoms = (symptoms: Symptom[]): string => {
  return JSON.stringify(symptoms, null, 2);
};

export const importSymptoms = (payload: string): Symptom[] => {
  const parsed = JSON.parse(payload) as Symptom[];

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid symptom payload");
  }

  return parsed.map(hydrateSymptom);
};

export const loadFilterPresets = (): SymptomFilterPreset[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SYMPTOM_FILTER_PRESETS_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as SymptomFilterPreset[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((preset) => ({
      ...preset,
      createdAt: parseDate(preset.createdAt),
    }));
  } catch (error) {
    console.warn("Failed to load symptom filter presets", error);
    return [];
  }
};

export const saveFilterPresets = (presets: SymptomFilterPreset[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SYMPTOM_FILTER_PRESETS_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn("Failed to save symptom filter presets", error);
  }
};
