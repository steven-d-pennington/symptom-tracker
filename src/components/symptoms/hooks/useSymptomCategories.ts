"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SymptomCategory,
  SymptomCategoryInput,
  SymptomCategoryUpdate,
} from "@/lib/types/symptoms";
import { userRepository } from "@/lib/repositories/userRepository";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

const createDefaultCategories = (userId: string): SymptomCategory[] => {
  const createdAt = new Date("2024-01-01T00:00:00.000Z");
  return [
    {
      id: "uncategorized",
      userId,
      name: "Uncategorized",
      color: "#6b7280",
      description: "Symptoms that have not been categorized yet.",
      icon: "🗂️",
      isDefault: true,
      createdAt,
    },
    {
      id: "pain",
      userId,
      name: "Pain",
      color: "#ef4444",
      description: "Musculoskeletal, nerve, and joint pain experiences.",
      icon: "🔥",
      isDefault: true,
      createdAt,
    },
    {
      id: "fatigue",
      userId,
      name: "Fatigue",
      color: "#f97316",
      description: "Energy, exhaustion, or burnout related symptoms.",
      icon: "💤",
      isDefault: true,
      createdAt,
    },
    {
      id: "skin",
      userId,
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
  const { userId } = useCurrentUser();
  const [categories, setCategories] = useState<SymptomCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadCategories = async () => {
      try {
        const stored = await userRepository.getSymptomCategories(userId);

        if (stored.length > 0) {
          const defaults = createDefaultCategories(userId);
          const mergedMap = new Map(defaults.map((category) => [category.id, category]));

          stored.forEach((category) => {
            mergedMap.set(category.id, hydrateCategory(category as SymptomCategory));
          });

          setCategories(Array.from(mergedMap.values()));
        } else {
          setCategories(createDefaultCategories(userId));
        }
      } catch (error) {
        console.warn("Failed to load symptom categories", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadCategories();
  }, [userId]);

  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }

    const saveCategories = async () => {
      try {
        await userRepository.saveSymptomCategories(userId, categories);
      } catch (error) {
        console.warn("Failed to persist symptom categories", error);
      }
    };

    saveCategories();
  }, [categories, isLoaded, userId]);

  const addCategory = useCallback((input: SymptomCategoryInput) => {
    if (!userId) return;

    const category: SymptomCategory = {
      id: typeof crypto !== "undefined" ? crypto.randomUUID() : `category-${Date.now()}`,
      userId: input.userId ?? userId,
      name: input.name.trim(),
      color: input.color,
      description: input.description,
      icon: input.icon,
      isDefault: false,
      createdAt: new Date(),
    };

    setCategories((current) => [...current, category]);
    return category;
  }, [userId]);

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
