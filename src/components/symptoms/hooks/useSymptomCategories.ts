"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SymptomCategory,
  SymptomCategoryInput,
  SymptomCategoryUpdate,
} from "@/lib/types/symptoms";

const CATEGORY_STORAGE_KEY = "pst:symptom-categories";

const createDefaultCategories = (): SymptomCategory[] => {
  const createdAt = new Date("2024-01-01T00:00:00.000Z");
  return [
    {
      id: "uncategorized",
      userId: "demo",
      name: "Uncategorized",
      color: "#6b7280",
      description: "Symptoms that have not been categorized yet.",
      icon: "🗂️",
      isDefault: true,
      createdAt,
    },
    {
      id: "pain",
      userId: "demo",
      name: "Pain",
      color: "#ef4444",
      description: "Musculoskeletal, nerve, and joint pain experiences.",
      icon: "🔥",
      isDefault: true,
      createdAt,
    },
    {
      id: "fatigue",
      userId: "demo",
      name: "Fatigue",
      color: "#f97316",
      description: "Energy, exhaustion, or burnout related symptoms.",
      icon: "💤",
      isDefault: true,
      createdAt,
    },
    {
      id: "skin",
      userId: "demo",
      name: "Skin",
      color: "#8b5cf6",
      description: "Rashes, lesions, irritation, and flare markers.",
      icon: "🩹",
      isDefault: true,
      createdAt,
    },
  ];
};

const hydrateCategory = (category: SymptomCategory): SymptomCategory => ({
  ...category,
  createdAt: category.createdAt instanceof Date ? category.createdAt : new Date(category.createdAt),
});

export const useSymptomCategories = () => {
  const [categories, setCategories] = useState<SymptomCategory[]>(createDefaultCategories);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(CATEGORY_STORAGE_KEY);

      if (!raw) {
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as SymptomCategory[];

      if (Array.isArray(parsed) && parsed.length > 0) {
        const defaults = createDefaultCategories();
        const mergedMap = new Map(defaults.map((category) => [category.id, category]));

        parsed.forEach((category) => {
          mergedMap.set(category.id, hydrateCategory(category));
        });

        setCategories(Array.from(mergedMap.values()));
      }
    } catch (error) {
      console.warn("Failed to load symptom categories", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    } catch (error) {
      console.warn("Failed to persist symptom categories", error);
    }
  }, [categories, isLoaded]);

  const addCategory = useCallback((input: SymptomCategoryInput) => {
    const category: SymptomCategory = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `category-${Date.now()}`,
      userId: input.userId ?? "demo",
      name: input.name.trim(),
      color: input.color,
      description: input.description,
      icon: input.icon,
      isDefault: false,
      createdAt: new Date(),
    };

    setCategories((current) => [...current, category]);
    return category;
  }, []);

  const updateCategory = useCallback((id: string, updates: SymptomCategoryUpdate) => {
    setCategories((current) =>
      current.map((category) => {
        if (category.id !== id) {
          return category;
        }

        return {
          ...category,
          ...updates,
          name: updates.name?.trim() ?? category.name,
        };
      }),
    );
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCategories((current) =>
      current.filter((category) => {
        if (category.id !== id) {
          return true;
        }

        return category.isDefault ? true : false;
      }),
    );
  }, []);

  const defaultCategoryId = useMemo(() => {
    const uncategorized = categories.find((category) => category.id === "uncategorized");
    if (uncategorized) {
      return uncategorized.id;
    }

    const fallback = categories.find((category) => category.isDefault);
    return fallback?.id ?? categories[0]?.id ?? "";
  }, [categories]);

  return {
    categories,
    addCategory,
    updateCategory,
    removeCategory,
    defaultCategoryId,
  };
};
