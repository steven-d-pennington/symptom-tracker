"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { triggerEventRepository } from "@/lib/repositories/triggerEventRepository";
import { generateId } from "@/lib/utils/idGenerator";
import { toast } from "@/components/common/Toast";
import { TriggerCategory } from "./TriggerCategory";
import type { TriggerRecord } from "@/lib/db/schema";

interface TriggerQuickLogFormProps {
  userId: string;
}

interface TriggerWithUsage extends TriggerRecord {
  usageCount: number;
  isCommon: boolean;
  recentNotes?: string[];
}

/**
 * Quick Log Form for Trigger Logging (Story 3.5.5)
 *
 * Features:
 * - Collapsible categories with smart defaults
 * - Quick log mode with optional details expansion
 * - Custom triggers section
 * - Recent notes suggestions
 *
 * AC3.5.5.3: Collapsible categories for triggers
 * AC3.5.5.5: Quick log mode for both types
 */
export function TriggerQuickLogForm({ userId }: TriggerQuickLogFormProps) {
  const router = useRouter();

  // Form state - Quick Log fields (essential)
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerRecord | null>(null);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Form state - Add Details fields (optional, progressive disclosure)
  const [showDetails, setShowDetails] = useState(false);
  const [notes, setNotes] = useState("");

  // Data state
  const [triggers, setTriggers] = useState<TriggerWithUsage[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load category expansion state from localStorage (AC3.5.5.3)
  useEffect(() => {
    const storageKey = `trigger-categories-expanded-${userId}`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setExpandedCategories(new Set(parsed));
      } catch (error) {
        console.error("Failed to parse saved expansion state:", error);
      }
    }
  }, [userId]);

  // Save category expansion state to localStorage (AC3.5.5.3)
  const saveExpansionState = useCallback((categories: Set<string>) => {
    const storageKey = `trigger-categories-expanded-${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(categories)));
  }, [userId]);

  // Load triggers and determine common ones
  useEffect(() => {
    const loadTriggers = async () => {
      try {
        setIsLoading(true);

        // Get all active triggers (Story 3.5.1: includes both customs and enabled defaults)
        const allActiveTriggers = await triggerRepository.getActive(userId);

        // Filter to only show enabled triggers (isEnabled: true) - Story 3.5.1, AC3.5.5.6
        const activeTriggers = allActiveTriggers.filter(trigger => trigger.isEnabled);

        // Get most common triggers
        const commonTriggers = await triggerEventRepository.getMostCommonTriggers(
          userId,
          10
        );

        // Build usage map
        const usageMap = new Map<string, number>();
        commonTriggers.forEach(({ triggerId, count }) => {
          usageMap.set(triggerId, count);
        });

        // Enhance triggers with usage data and load recent notes
        const triggersWithUsage: TriggerWithUsage[] = await Promise.all(
          activeTriggers.map(async (trigger) => {
            const recentNotes = await triggerEventRepository.getRecentNotes(
              userId,
              trigger.id,
              10
            );
            return {
              ...trigger,
              usageCount: usageMap.get(trigger.id) || 0,
              isCommon: usageMap.has(trigger.id),
              recentNotes,
            };
          })
        );

        // Sort: common first (by usage count), then customs, then defaults, then alphabetically
        triggersWithUsage.sort((a, b) => {
          // Common always first
          if (a.isCommon && !b.isCommon) return -1;
          if (!a.isCommon && b.isCommon) return 1;
          if (a.isCommon && b.isCommon) {
            return b.usageCount - a.usageCount;
          }

          // Among non-common: customs before defaults
          if (!a.isDefault && b.isDefault) return -1;
          if (a.isDefault && !b.isDefault) return 1;

          // Within same group: alphabetically
          return a.name.localeCompare(b.name);
        });

        setTriggers(triggersWithUsage);

        // Set default expansion state (AC3.5.5.3)
        // - Common triggers and Custom triggers expanded by default
        // - Other categories collapsed by default
        const defaultExpanded = new Set<string>();
        const hasCommon = triggersWithUsage.some(t => t.isCommon);
        const hasCustom = triggersWithUsage.some(t => !t.isDefault);

        if (hasCommon) {
          defaultExpanded.add("Common Triggers");
        }
        if (hasCustom) {
          defaultExpanded.add("Custom");
        }

        // Only set default if no saved state
        setExpandedCategories((current) => {
          if (current.size === 0) {
            saveExpansionState(defaultExpanded);
            return defaultExpanded;
          }
          return current;
        });
      } catch (error) {
        console.error("Failed to load triggers:", error);
        toast.error("Failed to load triggers", {
          description: "Please try refreshing the page"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTriggers();
  }, [userId, saveExpansionState]);

  // Group triggers by category (AC3.5.5.3)
  const triggersByCategory = useMemo(() => {
    const common = triggers.filter(t => t.isCommon);
    const custom = triggers.filter(t => !t.isDefault && !t.isCommon);

    // Group remaining triggers by category
    const grouped = new Map<string, TriggerWithUsage[]>();
    const remaining = triggers.filter(t => !t.isCommon && t.isDefault);

    remaining.forEach(trigger => {
      const category = trigger.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(trigger);
    });

    return { common, custom, grouped };
  }, [triggers]);

  // Handle category toggle
  const handleCategoryToggle = (categoryName: string, expanded: boolean) => {
    setExpandedCategories((current) => {
      const newSet = new Set(current);
      if (expanded) {
        newSet.add(categoryName);
      } else {
        newSet.delete(categoryName);
      }
      saveExpansionState(newSet);
      return newSet;
    });
  };

  // Handle trigger selection
  const handleTriggerSelect = (trigger: TriggerRecord) => {
    setSelectedTrigger(trigger);

    // Scroll to form after selection on mobile
    setTimeout(() => {
      document.getElementById("quick-log-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  // Handle recent note selection
  const handleNoteSelect = (note: string) => {
    setNotes(note);
    setShowDetails(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedTrigger) {
      toast.error("Please select a trigger");
      return;
    }

    try {
      setIsSaving(true);

      // Create trigger event
      const eventId = await triggerEventRepository.create({
        userId,
        triggerId: selectedTrigger.id,
        timestamp: new Date(timestamp).getTime(),
        intensity,
        notes: showDetails && notes ? notes : undefined,
      });

      console.log("✅ Trigger event created:", {
        eventId,
        userId,
        triggerId: selectedTrigger.id,
        timestamp: new Date(timestamp).getTime(),
        timestampDate: new Date(timestamp).toLocaleString(),
        intensity,
        notes: showDetails && notes ? notes : undefined,
      });

      // CRITICAL: Wait for IndexedDB transaction to fully commit
      // Mobile devices especially need time for disk writes (Story 3.5.13)
      await new Promise(resolve => setTimeout(resolve, 200));

      // Success feedback
      toast.success("Trigger logged successfully", {
        description: selectedTrigger.name,
        duration: 3000,
      });

      // Navigate back to dashboard with refresh flag
      // Delay ensures IndexedDB commit completes before navigation
      setTimeout(() => {
        router.push("/dashboard?refresh=trigger");
      }, 500);
    } catch (error) {
      console.error("Failed to log trigger:", error);
      toast.error("Failed to log trigger", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading triggers...</p>
        </div>
      </div>
    );
  }

  // Get selected trigger's recent notes for display
  const selectedTriggerData = selectedTrigger
    ? triggers.find(t => t.id === selectedTrigger.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Trigger Categories */}
      {/* Common Triggers Section - AC3.5.5.3 */}
      {triggersByCategory.common.length > 0 && (
        <div>
          <TriggerCategory
            name="Common Triggers"
            triggers={triggersByCategory.common}
            isExpanded={expandedCategories.has("Common Triggers")}
            onToggle={(expanded) => handleCategoryToggle("Common Triggers", expanded)}
            onSelectTrigger={handleTriggerSelect}
            selectedTriggerId={selectedTrigger?.id}
          />
        </div>
      )}

      {/* Custom Triggers Section - AC3.5.5.3 */}
      {triggersByCategory.custom.length > 0 && (
        <div>
          <TriggerCategory
            name="Custom"
            triggers={triggersByCategory.custom}
            isExpanded={expandedCategories.has("Custom")}
            onToggle={(expanded) => handleCategoryToggle("Custom", expanded)}
            onSelectTrigger={handleTriggerSelect}
            selectedTriggerId={selectedTrigger?.id}
          />
        </div>
      )}

      {/* Categorized Triggers - AC3.5.5.3 */}
      {Array.from(triggersByCategory.grouped.entries()).map(
        ([category, categoryTriggers]) => (
          <div key={category}>
            <TriggerCategory
              name={category}
              triggers={categoryTriggers}
              isExpanded={expandedCategories.has(category)}
              onToggle={(expanded) => handleCategoryToggle(category, expanded)}
              onSelectTrigger={handleTriggerSelect}
              selectedTriggerId={selectedTrigger?.id}
            />
          </div>
        )
      )}

      {/* Quick Log Form - AC3.5.5.5 */}
      {selectedTrigger && (
        <form
          id="quick-log-form"
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">
            Log {selectedTrigger.name}
          </h3>

          {/* Selected Trigger Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-foreground">{selectedTrigger.name}</div>
              <div className="text-xs text-muted-foreground">{selectedTrigger.category}</div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTrigger(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Change
            </button>
          </div>

          {/* Intensity Selector - AC3.5.5.5 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setIntensity(level)}
                  className={`min-h-[44px] min-w-[44px] p-3 border rounded-lg transition-all ${
                    intensity === level
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border hover:bg-muted text-foreground"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-foreground mb-2">
              Time
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Details Button - AC3.5.5.5 */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium min-h-[44px]"
          >
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            {showDetails ? "Hide Details" : "Add Details"}
          </button>

          {/* Details Section - AC3.5.5.5 */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-border">
              {/* Recent Notes Chips */}
              {selectedTriggerData?.recentNotes && selectedTriggerData.recentNotes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Recent Notes (tap to use)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTriggerData.recentNotes.map((note, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleNoteSelect(note)}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors min-h-[44px]"
                      >
                        {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Additional details..."
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full min-h-[44px] py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : "Log Trigger"}
          </button>
        </form>
      )}
    </div>
  );
}
