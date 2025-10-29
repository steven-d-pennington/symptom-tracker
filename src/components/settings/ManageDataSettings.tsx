"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { symptomRepository } from "@/lib/repositories/symptomRepository";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface DefaultItem {
  id: string;
  name: string;
  type: "symptom" | "medication" | "trigger" | "food";
  isEnabled: boolean;
  category?: string;
}

export function ManageDataSettings() {
  const { userId, isLoading: userLoading } = useCurrentUser();
  const [items, setItems] = useState<DefaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "symptom" | "medication" | "trigger" | "food">("all");

  // Load all default items
  useEffect(() => {
    if (!userId) return;

    const loadDefaults = async () => {
      try {
        setLoading(true);
        setError(null);

        const [symptoms, medications, triggers, foods] = await Promise.all([
          symptomRepository.getAll(userId),
          medicationRepository.getAll(userId),
          triggerRepository.getAll(userId),
          foodRepository.getAll(userId),
        ]);

        // Filter to only default items and map to common interface
        const defaultItems: DefaultItem[] = [
          ...symptoms
            .filter((s) => s.isDefault)
            .map((s) => ({
              id: s.id,
              name: s.name,
              type: "symptom" as const,
              isEnabled: s.isEnabled,
              category: s.category,
            })),
          ...medications
            .filter((m) => m.isDefault)
            .map((m) => ({
              id: m.id,
              name: m.name,
              type: "medication" as const,
              isEnabled: m.isEnabled,
              category: m.frequency, // Use frequency as category since MedicationRecord doesn't have type field
            })),
          ...triggers
            .filter((t) => t.isDefault)
            .map((t) => ({
              id: t.id,
              name: t.name,
              type: "trigger" as const,
              isEnabled: t.isEnabled,
              category: t.category,
            })),
          ...foods
            .filter((f) => f.isDefault)
            .map((f) => ({
              id: f.id,
              name: f.name,
              type: "food" as const,
              isEnabled: f.isActive, // Foods use isActive instead of isEnabled
              category: f.category,
            })),
        ];

        // Sort by type, then name
        defaultItems.sort((a, b) => {
          if (a.type !== b.type) {
            const order = { symptom: 1, medication: 2, trigger: 3, food: 4 };
            return order[a.type] - order[b.type];
          }
          return a.name.localeCompare(b.name);
        });

        setItems(defaultItems);
      } catch (err) {
        console.error("Failed to load default items:", err);
        setError("Failed to load default items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDefaults();
  }, [userId]);

  // Toggle item visibility
  const handleToggle = async (item: DefaultItem) => {
    try {
      setError(null);
      const newEnabledState = !item.isEnabled;

      // Update in database based on type
      if (item.type === "symptom") {
        await symptomRepository.update(item.id, { isEnabled: newEnabledState });
      } else if (item.type === "medication") {
        await medicationRepository.update(item.id, { isEnabled: newEnabledState } as any);
      } else if (item.type === "trigger") {
        await triggerRepository.update(item.id, { isEnabled: newEnabledState } as any);
      } else if (item.type === "food") {
        // Foods use isActive instead of isEnabled
        await foodRepository.update(item.id, { isActive: newEnabledState });
      }

      // Update local state
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, isEnabled: newEnabledState } : i
        )
      );
    } catch (err) {
      console.error("Failed to toggle item:", err);
      setError(`Failed to update ${item.name}. Please try again.`);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) =>
    filter === "all" ? true : item.type === filter
  );

  if (userLoading || loading) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Loading default items...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Please complete onboarding first.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-200">
              <p className="font-medium mb-1">No default items found</p>
              <p className="text-blue-800 dark:text-blue-300">
                It looks like you don't have any default items yet. Default items are automatically created when you sign up. If you've cleared all data, you can reinitialize defaults by signing out and back in.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeCounts = {
    symptom: items.filter((i) => i.type === "symptom").length,
    medication: items.filter((i) => i.type === "medication").length,
    trigger: items.filter((i) => i.type === "trigger").length,
    food: items.filter((i) => i.type === "food").length,
  };

  return (
    <div className="py-4 space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-medium mb-1">Manage Default Items</p>
            <p className="text-blue-800 dark:text-blue-300">
              Default items are pre-populated when you sign up to help you get started quickly. You can hide items you don't use by toggling them off. Hidden items won't appear in logging interfaces.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({items.length})
        </button>
        <button
          onClick={() => setFilter("symptom")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === "symptom"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Symptoms ({typeCounts.symptom})
        </button>
        <button
          onClick={() => setFilter("medication")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === "medication"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Medications ({typeCounts.medication})
        </button>
        <button
          onClick={() => setFilter("trigger")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === "trigger"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Triggers ({typeCounts.trigger})
        </button>
        <button
          onClick={() => setFilter("food")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            filter === "food"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Foods ({typeCounts.food})
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No {filter} items found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded capitalize">
                    {item.type}
                  </span>
                </div>
                {item.category && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {item.category}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleToggle(item)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  item.isEnabled
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title={item.isEnabled ? "Click to hide" : "Click to show"}
              >
                {item.isEnabled ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
