"use client";

import { useState } from "react";
import { Pill, Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { MedicationRecord } from "@/lib/db/schema";
import { EmptyState } from "./EmptyState";
import { MedicationForm } from "./MedicationForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useMedicationManagement } from "@/lib/hooks/useMedicationManagement";

export const MedicationList = () => {
  const {
    medications,
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
  } = useMedicationManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<MedicationRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    medication: MedicationRecord;
    usageCount: number;
  } | null>(null);

  const handleAddClick = () => {
    setEditingMedication(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (medication: MedicationRecord) => {
    setEditingMedication(medication);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (medication: MedicationRecord) => {
    const usageCount = await getMedicationUsageCount(medication.id);
    setDeleteConfirm({ medication, usageCount });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteMedication(deleteConfirm.medication.id);
    } catch (error) {
      console.error("Failed to delete medication:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (medication: MedicationRecord) => {
    try {
      await toggleMedicationActive(medication.id);
    } catch (error) {
      console.error("Failed to toggle medication:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Medications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your medication list and tracking
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      {/* Search and Filter */}
      {medications.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medications..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Medications</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      )}

      {/* List */}
      {medications.length === 0 ? (
        <EmptyState
          icon={<Pill className="h-16 w-16" />}
          title="No medications yet"
          description="Add your first medication to start tracking your treatments and adherence."
          actionLabel="Add Medication"
          onAction={handleAddClick}
        />
      ) : (
        <div className="space-y-3">
          {medications.map((medication) => (
            <div
              key={medication.id}
              className={`flex items-start gap-4 rounded-lg border ${
                medication.isActive ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
              } p-4 transition-all hover:shadow-sm`}
            >
              {/* Icon */}
              <div className={`mt-0.5 rounded-lg p-2 ${
                medication.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Pill className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {medication.name}
                    </h3>
                    {medication.dosage && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {medication.dosage}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {medication.frequency}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      medication.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {medication.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(medication)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title={medication.isActive ? "Deactivate" : "Activate"}
                  aria-label={medication.isActive ? "Deactivate medication" : "Activate medication"}
                >
                  {medication.isActive ? (
                    <ToggleRight className="h-5 w-5" />
                  ) : (
                    <ToggleLeft className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditClick(medication)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Edit medication"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(medication)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                  aria-label="Delete medication"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <MedicationForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMedication(null);
        }}
        onSubmit={async (data) => {
          if (editingMedication) {
            await updateMedication(editingMedication.id, data);
          } else {
            await createMedication(data);
          }
        }}
        medication={editingMedication}
        checkDuplicateName={checkDuplicateName}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Medication"
          message={
            deleteConfirm.usageCount > 0
              ? `This medication has been used in ${deleteConfirm.usageCount} daily ${
                  deleteConfirm.usageCount === 1 ? "entry" : "entries"
                }.\n\nDeleting it will permanently remove it from your records. Consider deactivating instead to preserve your history.\n\nAre you sure you want to delete "${deleteConfirm.medication.name}"?`
              : `Are you sure you want to delete "${deleteConfirm.medication.name}"?`
          }
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};
