"use client";

import { useCallback, useEffect, useState } from "react";
import { symptomRepository } from "@/lib/repositories/symptomRepository";
import { SymptomRecord } from "@/lib/db/schema";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { DEFAULT_SYMPTOMS } from "@/lib/data/defaultData";

export interface SymptomFormData {
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
}

export const useSymptomManagement = () => {
  const { userId } = useCurrentUser();
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const loadSymptoms = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const allSymptoms = await symptomRepository.getAll(userId);

      // If no symptoms exist, populate with defaults
      if (allSymptoms.length === 0) {
        for (const defaultSymptom of DEFAULT_SYMPTOMS) {
          await symptomRepository.create({
            userId,
            name: defaultSymptom.name,
            category: defaultSymptom.category,
            description: defaultSymptom.description,
            severityScale: { min: 0, max: 10, labels: { 0: "None", 5: "Moderate", 10: "Severe" } },
            isActive: true,
            isDefault: true,
            isEnabled: true,
          });
        }
        // Reload after populating
        const populated = await symptomRepository.getAll(userId);
        setSymptoms(populated);
      } else {
        setSymptoms(allSymptoms);
      }
    } catch (error) {
      console.error("Failed to load symptoms:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSymptoms();
  }, [loadSymptoms]);

  const createSymptom = useCallback(async (data: SymptomFormData) => {
    if (!userId) return;

    try {
      const id = await symptomRepository.create({
        userId,
        name: data.name,
        category: data.category,
        description: data.description,
        severityScale: { min: 0, max: 10, labels: { 0: "None", 5: "Moderate", 10: "Severe" } },
        isActive: data.isActive,
        isDefault: false,
        isEnabled: true,
      });

      await loadSymptoms();
      return id;
    } catch (error) {
      console.error("Failed to create symptom:", error);
      throw error;
    }
  }, [userId, loadSymptoms]);

  const updateSymptom = useCallback(async (id: string, data: Partial<SymptomFormData>) => {
    try {
      await symptomRepository.update(id, {
        name: data.name,
        category: data.category,
        description: data.description,
        isActive: data.isActive,
      });

      await loadSymptoms();
    } catch (error) {
      console.error("Failed to update symptom:", error);
      throw error;
    }
  }, [loadSymptoms]);

  const toggleSymptomEnabled = useCallback(async (id: string) => {
    try {
      const symptom = symptoms.find(s => s.id === id);
      if (!symptom) return;

      await symptomRepository.update(id, {
        isEnabled: !symptom.isEnabled,
      });

      await loadSymptoms();
    } catch (error) {
      console.error("Failed to toggle symptom:", error);
      throw error;
    }
  }, [symptoms, loadSymptoms]);

  const deleteSymptom = useCallback(async (id: string) => {
    try {
      await symptomRepository.delete(id);
      await loadSymptoms();
    } catch (error) {
      console.error("Failed to delete symptom:", error);
      throw error;
    }
  }, [loadSymptoms]);

  const getSymptomUsageCount = useCallback(async (symptomId: string): Promise<number> => {
    if (!userId) return 0;

    try {
      const entries = await dailyEntryRepository.getAll(userId);
      const usageCount = entries.filter(entry =>
        entry.symptoms.some(s => s.symptomId === symptomId)
      ).length;
      return usageCount;
    } catch (error) {
      console.error("Failed to get symptom usage:", error);
      return 0;
    }
  }, [userId]);

  const checkDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    const lowerName = name.toLowerCase().trim();
    return symptoms.some(
      s => s.name.toLowerCase().trim() === lowerName && s.id !== excludeId
    );
  }, [symptoms]);

  const resetToDefaults = useCallback(async () => {
    try {
      // Re-enable all default symptoms
      for (const symptom of symptoms.filter(s => s.isDefault)) {
        await symptomRepository.update(symptom.id, { isEnabled: true });
      }
      await loadSymptoms();
    } catch (error) {
      console.error("Failed to reset to defaults:", error);
      throw error;
    }
  }, [symptoms, loadSymptoms]);

  // Filter symptoms
  const filteredSymptoms = symptoms.filter(symptom => {
    const matchesSearch = symptom.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || symptom.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(symptoms.map(s => s.category)));

  return {
    symptoms: filteredSymptoms,
    loading,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    categories,
    createSymptom,
    updateSymptom,
    toggleSymptomEnabled,
    deleteSymptom,
    getSymptomUsageCount,
    checkDuplicateName,
    resetToDefaults,
    refresh: loadSymptoms,
  };
};
