"use client";

import { useCallback, useEffect, useState } from "react";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { MedicationRecord } from "@/lib/db/schema";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";

export interface MedicationFormData {
  name: string;
  dosage?: string;
  frequency: string;
  schedule: { time: string; daysOfWeek: number[] }[];
  notes?: string;
  isActive: boolean;
}

export const useMedicationManagement = () => {
  const { userId } = useCurrentUser();
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const loadMedications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const allMedications = await medicationRepository.getAll(userId);
      setMedications(allMedications);
    } catch (error) {
      console.error("Failed to load medications:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const createMedication = useCallback(async (data: MedicationFormData) => {
    if (!userId) return;

    try {
      const id = await medicationRepository.create({
        userId,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        schedule: data.schedule,
        sideEffects: [],
        isActive: data.isActive,
        isDefault: false, // Story 3.5.1: Add new fields
        isEnabled: true, // Story 3.5.1: Add new fields
      });

      await loadMedications();
      return id;
    } catch (error) {
      console.error("Failed to create medication:", error);
      throw error;
    }
  }, [userId, loadMedications]);

  const updateMedication = useCallback(async (id: string, data: Partial<MedicationFormData>) => {
    try {
      await medicationRepository.update(id, {
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        schedule: data.schedule,
        isActive: data.isActive,
      });

      await loadMedications();
    } catch (error) {
      console.error("Failed to update medication:", error);
      throw error;
    }
  }, [loadMedications]);

  const toggleMedicationActive = useCallback(async (id: string) => {
    try {
      const medication = medications.find(m => m.id === id);
      if (!medication) return;

      await medicationRepository.update(id, {
        isActive: !medication.isActive,
      });

      await loadMedications();
    } catch (error) {
      console.error("Failed to toggle medication:", error);
      throw error;
    }
  }, [medications, loadMedications]);

  const deleteMedication = useCallback(async (id: string) => {
    try {
      await medicationRepository.delete(id);
      await loadMedications();
    } catch (error) {
      console.error("Failed to delete medication:", error);
      throw error;
    }
  }, [loadMedications]);

  const getMedicationUsageCount = useCallback(async (medicationId: string): Promise<number> => {
    if (!userId) return 0;

    try {
      const entries = await dailyEntryRepository.getAll(userId);
      const usageCount = entries.filter(entry =>
        entry.medications.some(med => med.medicationId === medicationId)
      ).length;
      return usageCount;
    } catch (error) {
      console.error("Failed to get medication usage:", error);
      return 0;
    }
  }, [userId]);

  const checkDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    const lowerName = name.toLowerCase().trim();
    return medications.some(
      med => med.name.toLowerCase().trim() === lowerName && med.id !== excludeId
    );
  }, [medications]);

  // Filter medications based on search and status
  const filteredMedications = medications.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && med.isActive) ||
      (filterStatus === "inactive" && !med.isActive);

    return matchesSearch && matchesStatus;
  });

  return {
    medications: filteredMedications,
    loading,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    createMedication,
    updateMedication,
    toggleMedicationActive,
    deleteMedication,
    getMedicationUsageCount,
    checkDuplicateName,
    refresh: loadMedications,
  };
};
