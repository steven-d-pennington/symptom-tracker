"use client";

import { useState } from "react";
import { Activity, Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { TreatmentRecord } from "@/lib/db/schema";
import { EmptyState } from "./EmptyState";
import { TreatmentForm } from "./TreatmentForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useTreatmentManagement } from "@/lib/hooks/useTreatmentManagement";

export const TreatmentList = () => {
    const {
        treatments,
        loading,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        createTreatment,
        updateTreatment,
        toggleTreatmentActive,
        deleteTreatment,
        getTreatmentUsageCount,
        checkDuplicateName,
    } = useTreatmentManagement();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState<TreatmentRecord | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        treatment: TreatmentRecord;
        usageCount: number;
    } | null>(null);

    const handleAddClick = () => {
        setEditingTreatment(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (treatment: TreatmentRecord) => {
        setEditingTreatment(treatment);
        setIsFormOpen(true);
    };

    const handleDeleteClick = async (treatment: TreatmentRecord) => {
        const usageCount = await getTreatmentUsageCount(treatment.id);
        setDeleteConfirm({ treatment, usageCount });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteTreatment(deleteConfirm.treatment.id);
        } catch (error) {
            console.error("Failed to delete treatment:", error);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const handleToggleActive = async (treatment: TreatmentRecord) => {
        try {
            await toggleTreatmentActive(treatment.id);
        } catch (error) {
            console.error("Failed to toggle treatment:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading treatments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Treatments</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your physical treatments and interventions
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleAddClick}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" />
                    Add Treatment
                </button>
            </div>

            {/* Search and Filter */}
            {treatments.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search treatments..."
                            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                        className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Treatments</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            )}

            {/* List */}
            {treatments.length === 0 ? (
                <EmptyState
                    icon={<Activity className="h-16 w-16" />}
                    title="No treatments yet"
                    description="Add your first treatment to start tracking physical interventions like ice, heat, compression, etc."
                    actionLabel="Add Treatment"
                    onAction={handleAddClick}
                />
            ) : (
                <div className="space-y-3">
                    {treatments.map((treatment) => (
                        <div
                            key={treatment.id}
                            className={`flex items-start gap-4 rounded-lg border ${treatment.isActive ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                                } p-4 transition-all hover:shadow-sm`}
                        >
                            {/* Icon */}
                            <div className={`mt-0.5 rounded-lg p-2 ${treatment.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                }`}>
                                <Activity className="h-5 w-5" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">
                                            {treatment.name}
                                        </h3>
                                        {treatment.category && (
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                {treatment.category}
                                            </p>
                                        )}
                                        {treatment.frequency && (
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                {treatment.frequency}
                                            </p>
                                        )}
                                        {treatment.duration && (
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {treatment.duration} min
                                            </p>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${treatment.isActive
                                                ? "bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {treatment.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleToggleActive(treatment)}
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    title={treatment.isActive ? "Deactivate" : "Activate"}
                                    aria-label={treatment.isActive ? "Deactivate treatment" : "Activate treatment"}
                                >
                                    {treatment.isActive ? (
                                        <ToggleRight className="h-5 w-5" />
                                    ) : (
                                        <ToggleLeft className="h-5 w-5" />
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleEditClick(treatment)}
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    aria-label="Edit treatment"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteClick(treatment)}
                                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                                    aria-label="Delete treatment"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            <TreatmentForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingTreatment(null);
                }}
                onSubmit={async (data) => {
                    if (editingTreatment) {
                        await updateTreatment(editingTreatment.id, data);
                    } else {
                        await createTreatment(data);
                    }
                }}
                treatment={editingTreatment}
                checkDuplicateName={checkDuplicateName}
            />

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmDialog
                    isOpen={true}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Treatment"
                    message={
                        deleteConfirm.usageCount > 0
                            ? `This treatment has been used ${deleteConfirm.usageCount} time${deleteConfirm.usageCount === 1 ? "" : "s"
                            }.\n\nDeleting it will permanently remove it from your records. Consider deactivating instead to preserve your history.\n\nAre you sure you want to delete "${deleteConfirm.treatment.name}"?`
                            : `Are you sure you want to delete "${deleteConfirm.treatment.name}"?`
                    }
                    confirmLabel="Delete"
                    variant="danger"
                />
            )}
        </div>
    );
};
