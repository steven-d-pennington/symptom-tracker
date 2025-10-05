"use client";

import { useMemo, useState } from "react";
import { Symptom, SymptomFilter } from "@/lib/types/symptoms";

const SAMPLE_SYMPTOMS: Symptom[] = [
  {
    id: "demo-1",
    userId: "demo",
    name: "Painful nodule",
    category: "Pain",
    severity: 6,
    severityScale: { type: "numeric", min: 0, max: 10 },
    location: "Left underarm",
    triggers: ["Stress"],
    timestamp: new Date(),
    updatedAt: new Date(),
  },
];

const createInitialFilters = (): SymptomFilter => ({
  severityRange: [0, 10],
});

export const useSymptoms = () => {
  const [symptoms] = useState<Symptom[]>(SAMPLE_SYMPTOMS);
  const [filters, setFilters] = useState<SymptomFilter>(createInitialFilters);

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((symptom) => {
      if (filters.query) {
        const haystack = `${symptom.name} ${symptom.notes ?? ""} ${symptom.triggers?.join(" ") ?? ""}`.toLowerCase();
        if (!haystack.includes(filters.query.toLowerCase())) {
          return false;
        }
      }

      if (filters.severityRange) {
        const [min, max] = filters.severityRange;
        if (symptom.severity < min || symptom.severity > max) {
          return false;
        }
      }

      if (filters.categories?.length) {
        return filters.categories.includes(symptom.category);
      }

      return true;
    });
  }, [filters.categories, filters.query, filters.severityRange, symptoms]);

  return {
    symptoms: filteredSymptoms,
    filters,
    updateFilters: setFilters,
  };
};
