"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TreatmentRecord } from "@/lib/db/schema";

export interface TreatmentFormData {
    name: string;
    category?: string;
    description?: string;
    duration?: number;
    frequency?: string;
    isActive: boolean;
}

interface TreatmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<TreatmentRecord, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<void>;
    treatment?: TreatmentRecord | null;
    checkDuplicateName: (name: string, excludeId?: string) => Promise<boolean>;
}

const FREQUENCY_OPTIONS = [
    { value: "As needed", label: "As needed" },
    { value: "Daily", label: "Daily" },
    { value: "2x daily", label: "2x daily" },
    { value: "Weekly", label: "Weekly" },
    { value: "Custom", label: "Custom" },
];

const CATEGORY_OPTIONS = [
    { value: "Thermal", label: "Thermal" },
    { value: "Physical", label: "Physical" },
    { value: "Manual", label: "Manual" },
    { value: "Electrical", label: "Electrical" },
    { value: "Other", label: "Other" },
];

export const TreatmentForm = ({
    isOpen,
    onClose,
    onSubmit,
    treatment,
    checkDuplicateName,
}: TreatmentFormProps) => {
    const [formData, setFormData] = useState<TreatmentFormData>({
        name: "",
        category: "Physical",
        description: "",
        duration: undefined,
        frequency: "As needed",
        isActive: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (treatment) {
            setFormData({
                name: treatment.name,
                category: treatment.category,
                description: treatment.description,
                duration: treatment.duration,
                frequency: treatment.frequency,
                isActive: treatment.isActive,
            });
        } else {
            setFormData({
                name: "",
                category: "Physical",
                description: "",
                duration: undefined,
                frequency: "As needed",
                isActive: true,
            });
        }
        setErrors({});
    }, [treatment, isOpen]);

    const validate = async (): Promise<boolean> => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Treatment name is required";
        } else if (await checkDuplicateName(formData.name, treatment?.id)) {
            newErrors.name = "A treatment with this name already exists";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!(await validate())) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                ...formData,
                isDefault: false,
                isEnabled: true,
            });
            onClose();
        } catch (error) {
            console.error("Failed to save treatment:", error);
            setErrors({ submit: "Failed to save treatment. Please try again." });
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
                        {treatment ? "Edit Treatment" : "Add Treatment"}
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
                            Treatment Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full rounded-lg border ${errors.name ? "border-red-500" : "border-border"
                                } bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
                            placeholder="e.g., Ice Pack, Heat Therapy, Massage"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Category */}
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
                            {CATEGORY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
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
                            rows={2}
                        />
                    </div>

                    {/* Duration & Frequency Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Duration */}
                        <div>
                            <label htmlFor="duration" className="mb-1.5 block text-sm font-medium text-foreground">
                                Duration (min)
                            </label>
                            <input
                                id="duration"
                                type="number"
                                min="1"
                                value={formData.duration || ""}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="20"
                            />
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
                            Active (available for logging)
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
                            {isSubmitting ? "Saving..." : treatment ? "Update" : "Add Treatment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
