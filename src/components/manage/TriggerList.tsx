"use client";

import { useState, useMemo, useEffect } from "react";
import { Zap, Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TriggerRecord } from "@/lib/db/schema";
import { EmptyState } from "./EmptyState";
import { TriggerForm } from "./TriggerForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useTriggerManagement } from "@/lib/hooks/useTriggerManagement";

export const TriggerList = () => {
  const {
    triggers,
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
  } = useTriggerManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    trigger: TriggerRecord;
    usageCount: number;
  } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(["__custom__"]));

  // Collapse all categories when triggers load
  useEffect(() => {
    if (triggers.length > 0 && !searchQuery && filterCategory === "all") {
      const allCategories = new Set(categories);
      allCategories.add("__custom__");
      setCollapsedCategories(allCategories);
    }
  }, [triggers.length, categories.length]);

  const handleAddClick = () => {
    setEditingTrigger(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (trigger: TriggerRecord) => {
    setEditingTrigger(trigger);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (trigger: TriggerRecord) => {
    const usageCount = await getTriggerUsageCount(trigger.id);
    setDeleteConfirm({ trigger, usageCount });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteTrigger(deleteConfirm.trigger.id);
    } catch (error) {
      console.error("Failed to delete trigger:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleEnabled = async (trigger: TriggerRecord) => {
    try {
      await toggleTriggerEnabled(trigger.id);
    } catch (error) {
      console.error("Failed to toggle trigger:", error);
    }
  };

  // Group triggers by category
  const triggersByCategory = useMemo(() => {
    const grouped = new Map<string, TriggerRecord[]>();
    
    triggers.forEach((trigger) => {
      const category = trigger.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(trigger);
    });

    // Sort triggers within each category
    for (const [, categoryTriggers] of grouped) {
      categoryTriggers.sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }, [triggers]);

  const customTriggers = triggers.filter(t => !t.isDefault);
  const hasSearch = searchQuery.trim().length > 0;
  const hasFilter = filterCategory !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading triggers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Triggers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage triggers • {triggers.length} total • {customTriggers.length} custom
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Custom Trigger
        </button>
      </div>

      {triggers.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search triggers..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {triggers.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-16 w-16" />}
          title="No triggers found"
          description="Add your first custom trigger to expand beyond the defaults."
          actionLabel="Add Custom Trigger"
          onAction={handleAddClick}
        />
      ) : hasSearch || hasFilter ? (
        /* Search/Filter Results - Flat List */
        <div className="space-y-3">
          {triggers.map((trigger) => {
            const isCustom = !trigger.isDefault;
            return (
              <div
                key={trigger.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-sm",
                  trigger.isEnabled ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                )}
              >
                <div className={cn(
                  "mt-0.5 rounded-lg p-2",
                  isCustom 
                    ? "bg-orange-100 text-orange-700"
                    : trigger.isEnabled 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                )}>
                  <Zap className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{trigger.name}</h3>
                    {isCustom && (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Custom
                      </span>
                    )}
                    {!isCustom && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        trigger.isEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {trigger.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{trigger.category}</p>
                  {trigger.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{trigger.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isCustom ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditClick(trigger)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Edit trigger"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(trigger)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                        aria-label="Delete trigger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(trigger)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={trigger.isEnabled ? "Disable" : "Enable"}
                      aria-label={trigger.isEnabled ? "Disable trigger" : "Enable trigger"}
                    >
                      {trigger.isEnabled ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Category View */
        <div className="space-y-3">
          {/* Custom Triggers Category */}
          {customTriggers.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden bg-orange-50/50 dark:bg-orange-950/20">
              <button
                type="button"
                onClick={() => {
                  const newCollapsed = new Set(collapsedCategories);
                  if (collapsedCategories.has("__custom__")) {
                    newCollapsed.delete("__custom__");
                  } else {
                    newCollapsed.add("__custom__");
                  }
                  setCollapsedCategories(newCollapsed);
                }}
                className="w-full px-4 py-3 bg-orange-100/50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-foreground">Custom Triggers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {customTriggers.length} {customTriggers.length === 1 ? "item" : "items"}
                  </span>
                  {collapsedCategories.has("__custom__") ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {!collapsedCategories.has("__custom__") && (
                <div className="p-4 bg-background space-y-3">
                  {customTriggers.map((trigger) => (
                    <div
                      key={trigger.id}
                      className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="mt-0.5 rounded-lg bg-orange-100 p-2 text-orange-700">
                        <Zap className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{trigger.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{trigger.category}</p>
                        {trigger.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{trigger.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(trigger)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit trigger"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(trigger)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                          aria-label="Delete trigger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Default Triggers by Category */}
          {Array.from(triggersByCategory.entries()).map(([category, categoryTriggers]) => {
            const defaultInCategory = categoryTriggers.filter(t => t.isDefault);
            if (defaultInCategory.length === 0) return null;

            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    const newCollapsed = new Set(collapsedCategories);
                    if (isCollapsed) {
                      newCollapsed.delete(category);
                    } else {
                      newCollapsed.add(category);
                    }
                    setCollapsedCategories(newCollapsed);
                  }}
                  className="w-full px-4 py-3 bg-muted/50 hover:bg-muted flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-foreground">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {defaultInCategory.length} {defaultInCategory.length === 1 ? "item" : "items"}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-4 space-y-3">
                    {defaultInCategory.map((trigger) => (
                      <div
                        key={trigger.id}
                        className={cn(
                          "flex items-start gap-4 rounded-lg border p-4 hover:border-primary/50 transition-colors",
                          trigger.isEnabled ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 rounded-lg p-2",
                          trigger.isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          <Zap className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{trigger.name}</h3>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              trigger.isEnabled
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            )}>
                              {trigger.isEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(trigger)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title={trigger.isEnabled ? "Disable" : "Enable"}
                          aria-label={trigger.isEnabled ? "Disable trigger" : "Enable trigger"}
                        >
                          {trigger.isEnabled ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TriggerForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTrigger(null);
        }}
        onSubmit={async (data) => {
          if (editingTrigger) {
            await updateTrigger(editingTrigger.id, data);
          } else {
            await createTrigger(data);
          }
        }}
        trigger={editingTrigger}
        checkDuplicateName={checkDuplicateName}
        categories={categories}
      />

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Custom Trigger"
          message={
            deleteConfirm.usageCount > 0
              ? `This trigger has been used in ${deleteConfirm.usageCount} daily ${
                  deleteConfirm.usageCount === 1 ? "entry" : "entries"
                }.\n\nDeleting it will permanently remove it from your records.\n\nAre you sure you want to delete "${deleteConfirm.trigger.name}"?`
              : `Are you sure you want to delete "${deleteConfirm.trigger.name}"?`
          }
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};
