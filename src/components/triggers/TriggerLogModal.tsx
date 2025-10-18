"use client";

import { useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { triggerEventRepository } from "@/lib/repositories/triggerEventRepository";
import { TriggerRecord } from "@/lib/db/schema";

interface TriggerLogModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
}

interface TriggerWithUsage extends TriggerRecord {
  usageCount: number;
  isCommon: boolean;
  recentNotes?: string[];
}

interface ExpandedTrigger {
  triggerId: string;
  intensity: 'low' | 'medium' | 'high';
  notes: string;
}

export function TriggerLogModal({
  userId,
  isOpen,
  onClose,
  onLogged,
}: TriggerLogModalProps) {
  const [triggers, setTriggers] = useState<TriggerWithUsage[]>([]);
  const [expandedTrigger, setExpandedTrigger] = useState<ExpandedTrigger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load triggers and determine common ones
  useEffect(() => {
    if (!isOpen) return;

    const loadTriggers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all active triggers
        const activeTriggers = await triggerRepository.getActive(userId);

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

        // Sort: common triggers first (by usage count), then alphabetically
        triggersWithUsage.sort((a, b) => {
          if (a.isCommon && !b.isCommon) return -1;
          if (!a.isCommon && b.isCommon) return 1;
          if (a.isCommon && b.isCommon) {
            return b.usageCount - a.usageCount;
          }
          return a.name.localeCompare(b.name);
        });

        setTriggers(triggersWithUsage);
      } catch (err) {
        console.error("Failed to load triggers:", err);
        setError("Failed to load triggers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadTriggers();
  }, [userId, isOpen]);

  // Group triggers by category
  const triggersByCategory = useMemo(() => {
    const common = triggers.filter(t => t.isCommon);
    const others = triggers.filter(t => !t.isCommon);

    const grouped = new Map<string, TriggerWithUsage[]>();
    others.forEach(trigger => {
      const category = trigger.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(trigger);
    });

    return { common, grouped };
  }, [triggers]);

  // One-tap logging: immediately log trigger with medium intensity
  const handleTriggerTap = async (trigger: TriggerRecord) => {
    // If already expanded, collapse it
    if (expandedTrigger?.triggerId === trigger.id) {
      setExpandedTrigger(null);
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      // Create trigger event with medium intensity
      await triggerEventRepository.create({
        userId,
        triggerId: trigger.id,
        timestamp: Date.now(),
        intensity: 'medium',
      });

      setSuccessMessage(`${trigger.name} logged`);
      setTimeout(() => setSuccessMessage(null), 2000);

      // Expand for optional details
      setExpandedTrigger({
        triggerId: trigger.id,
        intensity: 'medium',
        notes: '',
      });

      // Notify parent
      onLogged?.();
    } catch (err) {
      console.error("Failed to log trigger:", err);
      setError(`Failed to log ${trigger.name}. Please try again.`);
    }
  };

  // Update intensity and notes (progressive disclosure)
  const handleUpdateDetails = async () => {
    if (!expandedTrigger) return;

    try {
      const trigger = triggers.find(t => t.id === expandedTrigger.triggerId);
      if (!trigger) return;

      // Find the most recent event we just created
      const recentEvents = await triggerEventRepository.findByDateRange(
        userId,
        Date.now() - 60000, // Last minute
        Date.now()
      );

      const event = recentEvents.find(e => e.triggerId === trigger.id);
      if (event) {
        await triggerEventRepository.update(event.id, {
          intensity: expandedTrigger.intensity,
          notes: expandedTrigger.notes,
        });

        setSuccessMessage(`${trigger.name} details updated`);
        setTimeout(() => setSuccessMessage(null), 2000);
      }

      setExpandedTrigger(null);
    } catch (err) {
      console.error("Failed to update details:", err);
      setError("Failed to update details. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-card p-4 sm:p-6 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Log Trigger
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Success/Error messages */}
          {successMessage && (
            <div
              className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading triggers...
            </div>
          ) : triggers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No triggers available
            </div>
          ) : (
            <div className="space-y-6">
              {/* Common triggers section */}
              {triggersByCategory.common.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Common Triggers
                  </h4>
                  <div className="space-y-2">
                    {triggersByCategory.common.map((trigger) => (
                      <div key={trigger.id}>
                        <button
                          type="button"
                          onClick={() => handleTriggerTap(trigger)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          <div className="font-medium text-foreground">
                            {trigger.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {trigger.category}
                          </div>
                        </button>

                        {/* Expanded details form */}
                        {expandedTrigger?.triggerId === trigger.id && (
                          <div className="mt-2 p-4 border border-border rounded-lg bg-background space-y-3">
                            {/* Recent notes chips */}
                            {trigger.recentNotes && trigger.recentNotes.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">
                                  Recent notes:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {trigger.recentNotes.map((note, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() =>
                                        setExpandedTrigger({
                                          ...expandedTrigger,
                                          notes: note,
                                        })
                                      }
                                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    >
                                      {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                Intensity
                              </label>
                              <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map((level) => (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() =>
                                      setExpandedTrigger({
                                        ...expandedTrigger,
                                        intensity: level,
                                      })
                                    }
                                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                      expandedTrigger.intensity === level
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'border-border hover:bg-muted'
                                    }`}
                                  >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">
                                Notes (optional)
                              </label>
                              <textarea
                                value={expandedTrigger.notes}
                                onChange={(e) =>
                                  setExpandedTrigger({
                                    ...expandedTrigger,
                                    notes: e.target.value,
                                  })
                                }
                                rows={2}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                                placeholder="Additional details..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedTrigger(null)}
                                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleUpdateDetails}
                                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                Save Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized triggers */}
              {Array.from(triggersByCategory.grouped.entries()).map(
                ([category, categoryTriggers]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categoryTriggers.map((trigger) => (
                        <div key={trigger.id}>
                          <button
                            type="button"
                            onClick={() => handleTriggerTap(trigger)}
                            className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <div className="font-medium text-foreground">
                              {trigger.name}
                            </div>
                          </button>

                          {/* Expanded details form */}
                          {expandedTrigger?.triggerId === trigger.id && (
                            <div className="mt-2 p-4 border border-border rounded-lg bg-background space-y-3">
                              {/* Recent notes chips */}
                              {trigger.recentNotes && trigger.recentNotes.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">
                                    Recent notes:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {trigger.recentNotes.map((note, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                          setExpandedTrigger({
                                            ...expandedTrigger,
                                            notes: note,
                                          })
                                        }
                                        className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                      >
                                        {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Intensity
                                </label>
                                <div className="flex gap-2">
                                  {(['low', 'medium', 'high'] as const).map((level) => (
                                    <button
                                      key={level}
                                      type="button"
                                      onClick={() =>
                                        setExpandedTrigger({
                                          ...expandedTrigger,
                                          intensity: level,
                                        })
                                      }
                                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                        expandedTrigger.intensity === level
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : 'border-border hover:bg-muted'
                                      }`}
                                    >
                                      {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                  Notes (optional)
                                </label>
                                <textarea
                                  value={expandedTrigger.notes}
                                  onChange={(e) =>
                                    setExpandedTrigger({
                                      ...expandedTrigger,
                                      notes: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                                  placeholder="Additional details..."
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedTrigger(null)}
                                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleUpdateDetails}
                                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                  Save Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
