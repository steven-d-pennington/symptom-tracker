"use client";

import { useState, useMemo, useEffect } from "react";
import { Activity, Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SymptomRecord } from "@/lib/db/schema";
import { EmptyState } from "./EmptyState";
import { SymptomForm } from "./SymptomForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useSymptomManagement } from "@/lib/hooks/useSymptomManagement";

export const SymptomList = () => {
  const {
    symptoms,
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
  } = useSymptomManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<SymptomRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    symptom: SymptomRecord;
    usageCount: number;
  } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(["__custom__"]));

  // Collapse all categories when symptoms load
  useEffect(() => {
    if (symptoms.length > 0 && !searchQuery && filterCategory === "all") {
      const allCategories = new Set(categories);
      allCategories.add("__custom__");
      setCollapsedCategories(allCategories);
    }
  }, [symptoms.length, categories.length]);

  const handleAddClick = () => {
    setEditingSymptom(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (symptom: SymptomRecord) => {
    setEditingSymptom(symptom);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (symptom: SymptomRecord) => {
    const usageCount = await getSymptomUsageCount(symptom.id);
    setDeleteConfirm({ symptom, usageCount });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteSymptom(deleteConfirm.symptom.id);
    } catch (error) {
      console.error("Failed to delete symptom:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleEnabled = async (symptom: SymptomRecord) => {
    try {
      await toggleSymptomEnabled(symptom.id);
    } catch (error) {
      console.error("Failed to toggle symptom:", error);
    }
  };

  // Group symptoms by category
  const symptomsByCategory = useMemo(() => {
    const grouped = new Map<string, SymptomRecord[]>();
    
    symptoms.forEach((symptom) => {
      const category = symptom.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(symptom);
    });

    // Sort symptoms within each category
    for (const [, categorySymptoms] of grouped) {
      categorySymptoms.sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }, [symptoms]);

  const customSymptoms = symptoms.filter(s => !s.isDefault);
  const hasSearch = searchQuery.trim().length > 0;
  const hasFilter = filterCategory !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading symptoms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Symptoms</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage symptoms • {symptoms.length} total • {customSymptoms.length} custom
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Custom Symptom
        </button>
      </div>

      {symptoms.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms..."
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

      {symptoms.length === 0 ? (
        <EmptyState
          icon={<Activity className="h-16 w-16" />}
          title="No symptoms found"
          description="Add your first custom symptom to expand beyond the defaults."
          actionLabel="Add Custom Symptom"
          onAction={handleAddClick}
        />
      ) : hasSearch || hasFilter ? (
        /* Search/Filter Results - Flat List */
        <div className="space-y-3">
          {symptoms.map((symptom) => {
            const isCustom = !symptom.isDefault;
            return (
              <div
                key={symptom.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-sm",
                  symptom.isEnabled ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                )}
              >
                <div className={cn(
                  "mt-0.5 rounded-lg p-2",
                  isCustom 
                    ? "bg-purple-100 text-purple-700"
                    : symptom.isEnabled 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                )}>
                  <Activity className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{symptom.name}</h3>
                    {isCustom && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                        Custom
                      </span>
                    )}
                    {!isCustom && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        symptom.isEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {symptom.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{symptom.category}</p>
                  {symptom.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{symptom.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isCustom ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEditClick(symptom)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label="Edit symptom"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(symptom)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                        aria-label="Delete symptom"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(symptom)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={symptom.isEnabled ? "Disable" : "Enable"}
                      aria-label={symptom.isEnabled ? "Disable symptom" : "Enable symptom"}
                    >
                      {symptom.isEnabled ? (
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
          {/* Custom Symptoms Category */}
          {customSymptoms.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden bg-purple-50/50 dark:bg-purple-950/20">
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
                className="w-full px-4 py-3 bg-purple-100/50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-foreground">Custom Symptoms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {customSymptoms.length} {customSymptoms.length === 1 ? "item" : "items"}
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
                  {customSymptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:border-primary/50 transition-colors"
                    >
                      <div className="mt-0.5 rounded-lg bg-purple-100 p-2 text-purple-700">
                        <Activity className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{symptom.name}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{symptom.category}</p>
                        {symptom.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{symptom.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditClick(symptom)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit symptom"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(symptom)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                          aria-label="Delete symptom"
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

          {/* Default Symptoms by Category */}
          {Array.from(symptomsByCategory.entries()).map(([category, categorySymptoms]) => {
            const defaultInCategory = categorySymptoms.filter(s => s.isDefault);
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
                    {defaultInCategory.map((symptom) => (
                      <div
                        key={symptom.id}
                        className={cn(
                          "flex items-start gap-4 rounded-lg border p-4 hover:border-primary/50 transition-colors",
                          symptom.isEnabled ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                        )}
                      >
                        <div className={cn(
                          "mt-0.5 rounded-lg p-2",
                          symptom.isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          <Activity className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{symptom.name}</h3>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              symptom.isEnabled
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            )}>
                              {symptom.isEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(symptom)}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title={symptom.isEnabled ? "Disable" : "Enable"}
                          aria-label={symptom.isEnabled ? "Disable symptom" : "Enable symptom"}
                        >
                          {symptom.isEnabled ? (
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

      <SymptomForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSymptom(null);
        }}
        onSubmit={async (data) => {
          if (editingSymptom) {
            await updateSymptom(editingSymptom.id, data);
          } else {
            await createSymptom(data);
          }
        }}
        symptom={editingSymptom}
        checkDuplicateName={checkDuplicateName}
        categories={categories}
      />

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Custom Symptom"
          message={
            deleteConfirm.usageCount > 0
              ? `This symptom has been used in ${deleteConfirm.usageCount} daily ${
                  deleteConfirm.usageCount === 1 ? "entry" : "entries"
                }.\n\nDeleting it will permanently remove it from your records.\n\nAre you sure you want to delete "${deleteConfirm.symptom.name}"?`
              : `Are you sure you want to delete "${deleteConfirm.symptom.name}"?`
          }
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};
