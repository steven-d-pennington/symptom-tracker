"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { handleModalKeyboard, focusFirstElement } from "@/lib/utils/a11y";
import { AllergenBadge } from "@/components/food/AllergenBadge";
import { ALLERGEN_TYPES, type AllergenType, validateAllergens } from "@/lib/constants/allergens";

// Food categories from seedFoodsService
const FOOD_CATEGORIES = [
  "Breakfast",
  "Proteins",
  "Dairy",
  "Fruits",
  "Vegetables",
  "Nuts & Seeds",
  "Legumes",
  "Seafood",
  "Beverages",
  "Condiments",
  "Snacks",
  "Sweeteners",
] as const;

const PREPARATION_METHODS = [
  "raw",
  "cooked",
  "fried",
  "baked",
  "steamed",
  "fermented",
  "grilled",
  "boiled",
] as const;

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (food: {
    name: string;
    category: string;
    allergenTags: AllergenType[];
    preparationMethod?: string;
  }) => Promise<void>;
}

export function AddFoodModal({ isOpen, onClose, onSave }: AddFoodModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [selectedAllergens, setSelectedAllergens] = useState<AllergenType[]>([]);
  const [preparationMethod, setPreparationMethod] = useState<string>("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = handleModalKeyboard(onClose);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Validate name field
  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Food name is required";
    }
    if (value.trim().length < 2) {
      return "Food name must be at least 2 characters";
    }
    if (value.length > 100) {
      return "Food name must be less than 100 characters";
    }
    return undefined;
  };

  // Handle name change with validation
  const handleNameChange = (value: string) => {
    setName(value);
    const error = validateName(value);
    setErrors((prev) => ({ ...prev, name: error }));
  };

  // Toggle allergen selection
  const toggleAllergen = (allergen: AllergenType) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    const nameError = validateName(name);
    if (nameError) {
      setErrors({ name: nameError });
      return;
    }

    // Validate allergens
    const allergenValidation = validateAllergens(selectedAllergens);
    if (!allergenValidation) {
      console.error("Invalid allergens");
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        name: name.trim(),
        category: category || "Snacks", // Default to Snacks if not selected
        allergenTags: selectedAllergens,
        preparationMethod: preparationMethod || undefined,
      });

      // Reset form after successful save
      setName("");
      setCategory("");
      setSelectedAllergens([]);
      setPreparationMethod("");
      setErrors({});
      setIsSaving(false);
      
      // Close modal after save completes
      onClose();
    } catch (error) {
      console.error("Failed to save custom food:", error);
      setIsSaving(false);
      // Error handling will be done in parent component
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setName("");
    setCategory("");
    setSelectedAllergens([]);
    setPreparationMethod("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const isFormValid = !errors.name && name.trim().length >= 2 && name.length <= 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-food-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <h2 id="add-food-modal-title" className="text-xl font-semibold">
              Add Custom Food
            </h2>
            {/* Custom badge preview */}
            <span
              className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-800"
              aria-label="Custom food badge"
            >
              Custom
            </span>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field (Required) */}
          <div>
            <label htmlFor="food-name" className="block text-sm font-medium text-gray-700 mb-1">
              Food Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameInputRef}
              id="food-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                errors.name ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Enter food name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {name.length}/100 characters
            </p>
          </div>

          {/* Category Dropdown (Optional) */}
          <div>
            <label htmlFor="food-category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="food-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category (optional)</option>
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Allergen Tags (Multi-select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergen Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_TYPES.map((allergen) => (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => toggleAllergen(allergen)}
                  className={cn(
                    "transition-all",
                    selectedAllergens.includes(allergen)
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  )}
                  aria-pressed={selectedAllergens.includes(allergen)}
                  aria-label={`${selectedAllergens.includes(allergen) ? "Deselect" : "Select"} ${allergen} allergen`}
                >
                  <AllergenBadge allergen={allergen} size="md" />
                </button>
              ))}
            </div>
            {selectedAllergens.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedAllergens.length} allergen{selectedAllergens.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Preparation Method (Optional) */}
          <div>
            <label htmlFor="preparation-method" className="block text-sm font-medium text-gray-700 mb-1">
              Preparation Method
            </label>
            <select
              id="preparation-method"
              value={preparationMethod}
              onChange={(e) => setPreparationMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a preparation method (optional)</option>
              {PREPARATION_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSaving}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                isFormValid && !isSaving
                  ? "hover:bg-blue-700"
                  : "opacity-50 cursor-not-allowed"
              )}
              aria-busy={isSaving}
            >
              {isSaving ? "Saving..." : "Add Food"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
