"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { MedicationRecord } from "@/lib/db/schema";
import { MedicationFormData } from "@/lib/hooks/useMedicationManagement";

interface MedicationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicationFormData) => Promise<void>;
  medication?: MedicationRecord | null;
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
}

const FREQUENCY_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Twice daily", label: "Twice daily" },
  { value: "As needed", label: "As needed" },
  { value: "Custom", label: "Custom" },
];

export const MedicationForm = ({
  isOpen,
  onClose,
  onSubmit,
  medication,
  checkDuplicateName,
}: MedicationFormProps) => {
  const [formData, setFormData] = useState<MedicationFormData>({
    name: "",
    dosage: "",
    frequency: "Daily",
    schedule: [],
    notes: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name,
        dosage: medication.dosage || "",
        frequency: medication.frequency,
        schedule: medication.schedule,
        notes: "",
        isActive: medication.isActive,
      });
    } else {
      setFormData({
        name: "",
        dosage: "",
        frequency: "Daily",
        schedule: [],
        notes: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [medication, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Medication name is required";
    } else if (checkDuplicateName(formData.name, medication?.id)) {
      newErrors.name = "A medication with this name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save medication:", error);
      setErrors({ submit: "Failed to save medication. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">
            {medication ? "Edit Medication" : "Add Medication"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Medication Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-lg border ${
                errors.name ? "border-red-500" : "border-border"
              } bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="e.g., Prednisone, Vitamin D3"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Dosage */}
          <div>
            <label htmlFor="dosage" className="mb-1.5 block text-sm font-medium text-foreground">
              Dosage
            </label>
            <input
              id="dosage"
              type="text"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., 200mg, 1 tablet"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Examples: 200mg, 1 tablet, 5ml
            </p>
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="mb-1.5 block text-sm font-medium text-foreground">
              Frequency
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-foreground">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional notes about this medication"
              rows={3}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-4">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
              Active (appears in daily log)
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : medication ? "Update" : "Add Medication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
