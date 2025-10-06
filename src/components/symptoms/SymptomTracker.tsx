"use client";

import { useMemo, useRef, useState } from "react";
import { Symptom, SymptomDraft } from "@/lib/types/symptoms";
import { SymptomForm } from "./SymptomForm";
import { SymptomList } from "./SymptomList";
import { SymptomFilters } from "./SymptomFilters";
import { SymptomCategories } from "./SymptomCategories";
import { useSymptoms } from "./hooks/useSymptoms";
import { useSymptomCategories } from "./hooks/useSymptomCategories";

const createDraftFromSymptom = (symptom: Symptom): SymptomDraft => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updatedAt: _updatedAt, ...rest } = symptom;
  return rest;
};

const createNewDraftDefaults = (symptom?: Symptom | null): SymptomDraft | null => {
  if (!symptom) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updatedAt: _updatedAt, id: _id, timestamp: _timestamp, ...rest } = symptom;
  return {
    ...rest,
    id: undefined,
    timestamp: new Date(),
    notes: "",
  };
};

export const SymptomTracker = () => {
  const {
    symptoms,
    paginatedSymptoms,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    reassignCategory,
    filters,
    updateFilters,
    resetFilters,
    sort,
    updateSort,
    page,
    setPage,
    totalFiltered,
    totalPages,
    isLoading,
    stats,
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    exportData,
    importData,
    locations,
    triggerSuggestions,
    symptomNameSuggestions,
  } = useSymptoms();
  const { categories, addCategory, updateCategory, removeCategory, defaultCategoryId } = useSymptomCategories();

  const [editingSymptomId, setEditingSymptomId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editingSymptom = useMemo(
    () => symptoms.find((symptom) => symptom.id === editingSymptomId) ?? null,
    [editingSymptomId, symptoms],
  );

  const editingDraft = useMemo(() => {
    if (!editingSymptom) {
      return null;
    }
    return createDraftFromSymptom(editingSymptom);
  }, [editingSymptom]);

  const smartDefaults = useMemo(() => {
    if (editingDraft) {
      return editingDraft;
    }
    const lastSymptom = stats.recentSymptoms[0];
    return createNewDraftDefaults(lastSymptom);
  }, [editingDraft, stats.recentSymptoms]);

  const usageByCategory = useMemo(() => {
    return symptoms.reduce<Record<string, number>>((accumulator, symptom) => {
      accumulator[symptom.category] = (accumulator[symptom.category] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [symptoms]);

  const handleSymptomSubmit = (draft: SymptomDraft) => {
    if (editingSymptom) {
      updateSymptom(editingSymptom.id, draft);
    } else {
      createSymptom(draft);
    }
    setEditingSymptomId(null);
  };

  const handleSymptomDelete = (symptom: Symptom) => {
    deleteSymptom(symptom.id);
    if (editingSymptomId === symptom.id) {
      setEditingSymptomId(null);
    }
  };

  const handleCategoryDelete = (id: string, transferTo: string) => {
    reassignCategory(id, transferTo);
    removeCategory(id);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `symptoms-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        importData(String(reader.result));
        setImportError(null);
      } catch (error) {
        console.error("Failed to import symptoms", error);
        setImportError("Import failed. Please ensure you're using a valid export file.");
      }
    };
    reader.readAsText(file);
  };

  const totalPagesAdjusted = Math.max(1, totalPages);

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Symptom tracking</h2>
        <p className="text-sm text-muted-foreground">
          Log, review, and manage symptoms with customizable categories, severity scales, and saved filters.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Total logged</h3>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Entries saved on this device</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Average severity</h3>
          <p className="mt-2 text-2xl font-bold text-primary">{stats.averageSeverity}</p>
          <p className="text-xs text-muted-foreground">Across all recorded symptoms</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">7-day trend</h3>
          <p className={`mt-2 text-2xl font-bold ${stats.sevenDayChange >= 0 ? "text-primary" : "text-emerald-500"}`}>
            {stats.sevenDayChange >= 0 ? "+" : ""}
            {stats.sevenDayChange}
          </p>
          <p className="text-xs text-muted-foreground">Change in entries week over week</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <SymptomForm
            key={editingSymptomId ?? (smartDefaults ? "smart-default" : "new")}
            categories={categories}
            onSubmit={handleSymptomSubmit}
            initialValues={editingDraft ?? smartDefaults ?? undefined}
            onCancel={() => setEditingSymptomId(null)}
            triggerSuggestions={triggerSuggestions}
            nameSuggestions={symptomNameSuggestions}
            locationSuggestions={locations}
          />

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Symptom history</h3>
                <p className="text-xs text-muted-foreground">
                  Filter, sort, and review past entries. Export or import data for backups.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  onClick={handleExport}
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import JSON
                </button>
                <input
                  type="file"
                  accept="application/json"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </div>
            {importError ? (
              <p className="mt-3 text-xs text-destructive">{importError}</p>
            ) : null}

            <div className="mt-4 space-y-6">
              <SymptomFilters
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                categories={categories}
                presets={presets}
                onSavePreset={savePreset}
                onApplyPreset={applyPreset}
                onDeletePreset={deletePreset}
                locations={locations}
              />

              <SymptomList
                symptoms={paginatedSymptoms}
                categories={categories}
                isLoading={isLoading}
                onEdit={(symptom) => setEditingSymptomId(symptom.id)}
                onDelete={handleSymptomDelete}
                page={page}
                totalPages={totalPagesAdjusted}
                onPageChange={setPage}
                totalCount={totalFiltered}
                sort={sort}
                onSortChange={updateSort}
              />
            </div>
          </div>
        </div>

        <SymptomCategories
          categories={categories}
          onCreate={addCategory}
          onUpdate={updateCategory}
          onDelete={handleCategoryDelete}
          defaultCategoryId={defaultCategoryId}
          usageByCategory={usageByCategory}
        />
      </div>
    </section>
  );
};
