"use client";

import { useCallback, useEffect, useState } from "react";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { TriggerRecord } from "@/lib/db/schema";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { DEFAULT_TRIGGERS } from "@/lib/data/defaultData";

export interface TriggerFormData {
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
}

export const useTriggerManagement = () => {
  const { userId } = useCurrentUser();
  const [triggers, setTriggers] = useState<TriggerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const loadTriggers = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const allTriggers = await triggerRepository.getAll(userId);

      // If no triggers exist, populate with defaults
      if (allTriggers.length === 0) {
        for (const defaultTrigger of DEFAULT_TRIGGERS) {
          await triggerRepository.create({
            userId,
            name: defaultTrigger.name,
            category: defaultTrigger.category,
            description: defaultTrigger.description,
            isActive: true,
            isDefault: true,
            isEnabled: true,
          });
        }
        // Reload after populating
        const populated = await triggerRepository.getAll(userId);
        setTriggers(populated);
      } else {
        setTriggers(allTriggers);
      }
    } catch (error) {
      console.error("Failed to load triggers:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTriggers();
  }, [loadTriggers]);

  const createTrigger = useCallback(async (data: TriggerFormData) => {
    if (!userId) return;

    try {
      const id = await triggerRepository.create({
        userId,
        name: data.name,
        category: data.category,
        description: data.description,
        isActive: data.isActive,
        isDefault: false,
        isEnabled: true,
      });

      await loadTriggers();
      return id;
    } catch (error) {
      console.error("Failed to create trigger:", error);
      throw error;
    }
  }, [userId, loadTriggers]);

  const updateTrigger = useCallback(async (id: string, data: Partial<TriggerFormData>) => {
    try {
      await triggerRepository.update(id, {
        name: data.name,
        category: data.category,
        description: data.description,
        isActive: data.isActive,
      });

      await loadTriggers();
    } catch (error) {
      console.error("Failed to update trigger:", error);
      throw error;
    }
  }, [loadTriggers]);

  const toggleTriggerEnabled = useCallback(async (id: string) => {
    try {
      const trigger = triggers.find(t => t.id === id);
      if (!trigger) return;

      await triggerRepository.update(id, {
        isEnabled: !trigger.isEnabled,
      });

      await loadTriggers();
    } catch (error) {
      console.error("Failed to toggle trigger:", error);
      throw error;
    }
  }, [triggers, loadTriggers]);

  const deleteTrigger = useCallback(async (id: string) => {
    try {
      await triggerRepository.delete(id);
      await loadTriggers();
    } catch (error) {
      console.error("Failed to delete trigger:", error);
      throw error;
    }
  }, [loadTriggers]);

  const getTriggerUsageCount = useCallback(async (triggerId: string): Promise<number> => {
    if (!userId) return 0;

    try {
      const entries = await dailyEntryRepository.getAll(userId);
      const usageCount = entries.filter(entry =>
        entry.triggers.some(t => t.triggerId === triggerId)
      ).length;
      return usageCount;
    } catch (error) {
      console.error("Failed to get trigger usage:", error);
      return 0;
    }
  }, [userId]);

  const checkDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    const lowerName = name.toLowerCase().trim();
    return triggers.some(
      t => t.name.toLowerCase().trim() === lowerName && t.id !== excludeId
    );
  }, [triggers]);

  const resetToDefaults = useCallback(async () => {
    try {
      // Re-enable all default triggers
      for (const trigger of triggers.filter(t => t.isDefault)) {
        await triggerRepository.update(trigger.id, { isEnabled: true });
      }
      await loadTriggers();
    } catch (error) {
      console.error("Failed to reset to defaults:", error);
      throw error;
    }
  }, [triggers, loadTriggers]);

  // Filter triggers
  const filteredTriggers = triggers.filter(trigger => {
    const matchesSearch = trigger.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || trigger.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(triggers.map(t => t.category)));

  return {
    triggers: filteredTriggers,
    loading,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    categories,
    createTrigger,
    updateTrigger,
    toggleTriggerEnabled,
    deleteTrigger,
    getTriggerUsageCount,
    checkDuplicateName,
    resetToDefaults,
    refresh: loadTriggers,
  };
};
