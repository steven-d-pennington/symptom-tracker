"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SelectionItem } from "../types/onboarding";
import { useOnboardingSelections } from "../contexts/OnboardingSelectionsContext";

/**
 * Reusable SelectionStep Component
 * Story 3.6.1 - Task 2, AC3.6.1.1-6
 *
 * Generic component for selecting items during onboarding
 * Used for symptoms, triggers, medications, and foods
 * Features: search, categories, checkboxes, custom item creation
 */

export interface SelectionStepProps {
  type: "symptoms" | "triggers" | "medications" | "foods";
  title: string;
  description: string;
  defaultItems: Array<{ name: string; category: string; description?: string; [key: string]: any }>;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function SelectionStep({
  type,
  title,
  description,
  defaultItems,
  onNext,
  onSkip,
  onBack,
}: SelectionStepProps) {
  const { selections, addItem, removeItem, clearAll, selectAll } = useOnboardingSelections();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const selectedItems = selections[type];

  // Group items by category
  const itemsByCategory = useMemo(() => {
    const groups: Record<string, typeof defaultItems> = {};
    defaultItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [defaultItems]);

  const categories = useMemo(() => Object.keys(itemsByCategory).sort(), [itemsByCategory]);

  // Filter items by search (AC3.6.1.2)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(category => {
      const categoryMatches = category.toLowerCase().includes(query);
      const hasMatchingItems = itemsByCategory[category].some(item =>
        item.name.toLowerCase().includes(query)
      );
      return categoryMatches || hasMatchingItems;
    });
  }, [categories, searchQuery, itemsByCategory]);

  // Auto-expand matching categories (AC3.6.1.2)
  const categoriesToShow = useMemo(() => {
    if (!searchQuery.trim()) return expandedCategories;

    const expanded = new Set(expandedCategories);
    filteredCategories.forEach(cat => expanded.add(cat));
    return expanded;
  }, [searchQuery, filteredCategories, expandedCategories]);

  const hasSearchResults = filteredCategories.length > 0;

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const isSelected = useCallback((itemName: string) => {
    return selectedItems.some(item => item.name === itemName);
  }, [selectedItems]);

  const toggleItem = useCallback((item: typeof defaultItems[0]) => {
    const selectionItem: SelectionItem = {
      name: item.name,
      category: item.category,
      description: item.description,
      isDefault: true,
      isCustom: false,
    };

    if (isSelected(item.name)) {
      removeItem(type, item.name);
    } else {
      addItem(type, selectionItem);
    }
  }, [isSelected, addItem, removeItem, type]);

  const handleSelectAll = useCallback(() => {
    const allItems: SelectionItem[] = defaultItems.map(item => ({
      name: item.name,
      category: item.category,
      description: item.description,
      isDefault: true,
      isCustom: false,
    }));
    selectAll(type, allItems);
  }, [defaultItems, selectAll, type]);

  const handleClearAll = useCallback(() => {
    clearAll(type);
  }, [clearAll, type]);

  const handleAddCustom = useCallback(() => {
    if (!customName.trim() || !customCategory.trim()) return;

    const customItem: SelectionItem = {
      name: customName.trim(),
      category: customCategory.trim(),
      description: customDescription.trim() || undefined,
      isDefault: false,
      isCustom: true,
    };

    addItem(type, customItem);
    setShowCustomForm(false);
    setCustomName("");
    setCustomCategory("");
    setCustomDescription("");
    setSearchQuery("");
  }, [customName, customCategory, customDescription, addItem, type]);

  const handleNext = useCallback(() => {
    // Validation (AC3.6.1.9)
    if (selectedItems.length === 0) {
      alert(`Please select at least one item or click "Skip for now"`);
      return;
    }
    onNext();
  }, [selectedItems.length, onNext]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {selectedItems.length} selected
        </div>
      </div>

      {/* Search Box (AC3.6.1.2) */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${type}...`}
          aria-label={`Search ${type}`}
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Not Found Prompt (AC3.6.1.3) */}
      {searchQuery && !hasSearchResults && (
        <div className="p-4 border border-border rounded-lg bg-muted/30">
          <p className="text-sm text-foreground mb-3">
            Not found. Add "{searchQuery}" as custom {type.slice(0, -1)}?
          </p>
          {!showCustomForm ? (
            <button
              type="button"
              onClick={() => {
                setShowCustomForm(true);
                setCustomName(searchQuery);
              }}
              className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 underline"
            >
              Add Custom
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
              />
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Category"
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground"
              />
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 rounded border border-border bg-background text-foreground resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={!customName.trim() || !customCategory.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomName("");
                    setCustomCategory("");
                    setCustomDescription("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories and Items (AC3.6.1.1) */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCategories.map((category) => {
          const isExpanded = categoriesToShow.has(category);
          const categoryItems = itemsByCategory[category].filter(item => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return item.name.toLowerCase().includes(query);
          });

          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="font-medium text-foreground">{category}</span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categoryItems.map((item) => (
                    <label
                      key={item.name}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded cursor-pointer transition-colors hover:bg-muted/30",
                        "min-h-[44px]" // AC3.6.1.11 - 44px touch target
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected(item.name)}
                        onChange={() => toggleItem(item)}
                        className="mt-0.5 w-4 h-4 rounded border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {item.name}
                        </div>
                        {item.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Items Display */}
      {selectedItems.filter(item => item.isCustom).length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium text-foreground mb-2">Custom Items</h3>
          <div className="space-y-1">
            {selectedItems.filter(item => item.isCustom).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {item.name} <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Custom</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(type, item.name)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
