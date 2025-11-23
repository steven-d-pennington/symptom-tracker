"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FoodRecord } from "@/lib/db/schema";
import { FoodFormData } from "@/lib/hooks/useFoodManagement";
import { ALLERGEN_TYPES, ALLERGEN_LABELS, type AllergenType } from "@/lib/constants/allergens";

interface FoodFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FoodFormData) => Promise<void>;
  food?: FoodRecord | null;
  checkDuplicateName: (name: string, excludeId?: string) => boolean;
  categories: string[];
}

export const FoodForm = ({
  isOpen,
  onClose,
  onSubmit,
  food,
  checkDuplicateName,
  categories,
}: FoodFormProps) => {
  const [formData, setFormData] = useState<FoodFormData>({
    name: "",
    category: "",
    allergenTags: "[]",
    preparationMethod: "",
    isActive: true,
  });
  const [selectedAllergens, setSelectedAllergens] = useState<Set<AllergenType>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (food) {
      const allergens = JSON.parse(food.allergenTags) as AllergenType[];
      setFormData({
        name: food.name,
        category: food.category,
        allergenTags: food.allergenTags,
        preparationMethod: food.preparationMethod || "",
        isActive: food.isActive,
      });
      setSelectedAllergens(new Set(allergens));
    } else {
      setFormData({
        name: "",
        category: categories[0] || "vegetables",
        allergenTags: "[]",
        preparationMethod: "",
        isActive: true,
      });
      setSelectedAllergens(new Set());
    }
    setErrors({});
  }, [food, isOpen, categories]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Food name is required";
    } else if (checkDuplicateName(formData.name, food?.id)) {
      newErrors.name = "A food with this name already exists";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAllergenToggle = (allergen: AllergenType) => {
    const newAllergens = new Set(selectedAllergens);
    if (newAllergens.has(allergen)) {
      newAllergens.delete(allergen);
    } else {
      newAllergens.add(allergen);
    }
    setSelectedAllergens(newAllergens);
    setFormData({
      ...formData,
      allergenTags: JSON.stringify(Array.from(newAllergens)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save food:", error);
      setErrors({ submit: "Failed to save food. Please try again." });
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
            {food ? "Edit Food" : "Add Custom Food"}
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
              Food Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full rounded-lg border ${
                errors.name ? "border-red-500" : "border-border"
              } bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="e.g., Tomato, Chicken Breast"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-foreground">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full rounded-lg border ${
                errors.category ? "border-red-500" : "border-border"
              } bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            >
              {categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              ) : (
                <>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="proteins">Proteins</option>
                  <option value="grains">Grains</option>
                  <option value="dairy">Dairy</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                </>
              )}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Allergen Tags
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALLERGEN_TYPES.map((allergen) => {
                const isSelected = selectedAllergens.has(allergen);
                return (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {ALLERGEN_LABELS[allergen]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="preparationMethod" className="mb-1.5 block text-sm font-medium text-foreground">
              Preparation Method
            </label>
            <input
              id="preparationMethod"
              type="text"
              value={formData.preparationMethod}
              onChange={(e) => setFormData({ ...formData, preparationMethod: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Raw, Steamed, Grilled"
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
              Active (available for food logging)
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
              {isSubmitting ? "Saving..." : food ? "Update" : "Add Food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
