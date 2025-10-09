"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { SymptomRecord } from "@/lib/db/schema";
import { SymptomFormData } from "@/lib/hooks/useSymptomManagement";

interface SymptomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SymptomFormData) => Promise<void>;
  symptom?: SymptomRecord | null;
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
  categories: string[];
}

export const SymptomForm = ({
  isOpen,
  onClose,
  onSubmit,
  symptom,
  checkDuplicateName,
  categories,
}: SymptomFormProps) => {
  const [formData, setFormData] = useState<SymptomFormData>({
    name: "",
    category: "pain",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (symptom) {
      setFormData({
        name: symptom.name,
        category: symptom.category,
        description: symptom.description || "",
        isActive: symptom.isActive,
      });
    } else {
      setFormData({
        name: "",
        category: "pain",
        description: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [symptom, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Symptom name is required";
    } else if (checkDuplicateName(formData.name, symptom?.id)) {
      newErrors.name = "A symptom with this name already exists";
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
      console.error("Failed to save symptom:", error);
      setErrors({ submit: "Failed to save symptom. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg rounded-lg border border-border bg-card shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
          <h2 className="text-xl font-semibold text-foreground">
            {symptom ? "Edit Symptom" : "Add Custom Symptom"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
              Symptom Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-lg border ${
                errors.name ? "border-red-500" : "border-border"
              } bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="e.g., Joint Pain, Headache"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              ) : (
                <>
                  <option value="pain">Pain</option>
                  <option value="inflammation">Inflammation</option>
                  <option value="fatigue">Fatigue</option>
                  <option value="digestive">Digestive</option>
                  <option value="skin">Skin</option>
                  <option value="other">Other</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Optional description"
              rows={3}
            />
          </div>

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

          {errors.submit && (
            <div className="rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

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
              {isSubmitting ? "Saving..." : symptom ? "Update" : "Add Symptom"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
