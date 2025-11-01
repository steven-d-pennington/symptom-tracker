"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { OnboardingSelections, SelectionItem } from "../types/onboarding";

/**
 * Onboarding Selections Context
 * Story 3.6.1 - Task 1
 * Manages user selections for symptoms, triggers, medications, and foods during onboarding
 *
 * Features:
 * - State management for all 4 data types
 * - sessionStorage persistence (AC3.6.1.9)
 * - Add/remove/clear/selectAll operations
 */

interface OnboardingSelectionsContextValue {
  selections: OnboardingSelections;
  addItem: (type: keyof OnboardingSelections, item: SelectionItem) => void;
  removeItem: (type: keyof OnboardingSelections, itemName: string) => void;
  clearAll: (type: keyof OnboardingSelections) => void;
  selectAll: (type: keyof OnboardingSelections, items: SelectionItem[]) => void;
  hasSelections: (type: keyof OnboardingSelections) => boolean;
  getSelectionCount: (type: keyof OnboardingSelections) => number;
  clearAllSelections: () => void;
}

const OnboardingSelectionsContext = createContext<OnboardingSelectionsContextValue | undefined>(undefined);

const STORAGE_KEY = "onboarding-selections";

const emptySelections: OnboardingSelections = {
  symptoms: [],
  triggers: [],
  medications: [],
  foods: [],
};

export function OnboardingSelectionsProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<OnboardingSelections>(emptySelections);
  const [hydrated, setHydrated] = useState(false);

  // Load from sessionStorage on mount (AC3.6.1.9 - preserve selections)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OnboardingSelections;
        setSelections(parsed);
      }
    } catch (error) {
      console.error("[OnboardingSelections] Failed to load from sessionStorage:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save to sessionStorage whenever selections change (AC3.6.1.9)
  useEffect(() => {
    if (!hydrated) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
    } catch (error) {
      console.error("[OnboardingSelections] Failed to save to sessionStorage:", error);
    }
  }, [selections, hydrated]);

  const addItem = useCallback((type: keyof OnboardingSelections, item: SelectionItem) => {
    setSelections(prev => {
      // Don't add duplicates (match by name)
      const exists = prev[type].some(i => i.name === item.name);
      if (exists) return prev;

      return {
        ...prev,
        [type]: [...prev[type], item],
      };
    });
  }, []);

  const removeItem = useCallback((type: keyof OnboardingSelections, itemName: string) => {
    setSelections(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.name !== itemName),
    }));
  }, []);

  const clearAll = useCallback((type: keyof OnboardingSelections) => {
    setSelections(prev => ({
      ...prev,
      [type]: [],
    }));
  }, []);

  const selectAll = useCallback((type: keyof OnboardingSelections, items: SelectionItem[]) => {
    setSelections(prev => ({
      ...prev,
      [type]: items,
    }));
  }, []);

  const hasSelections = useCallback((type: keyof OnboardingSelections) => {
    return selections[type].length > 0;
  }, [selections]);

  const getSelectionCount = useCallback((type: keyof OnboardingSelections) => {
    return selections[type].length;
  }, [selections]);

  const clearAllSelections = useCallback(() => {
    setSelections(emptySelections);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("[OnboardingSelections] Failed to clear sessionStorage:", error);
    }
  }, []);

  const value: OnboardingSelectionsContextValue = {
    selections,
    addItem,
    removeItem,
    clearAll,
    selectAll,
    hasSelections,
    getSelectionCount,
    clearAllSelections,
  };

  return (
    <OnboardingSelectionsContext.Provider value={value}>
      {children}
    </OnboardingSelectionsContext.Provider>
  );
}

export function useOnboardingSelections() {
  const context = useContext(OnboardingSelectionsContext);
  if (!context) {
    throw new Error("useOnboardingSelections must be used within OnboardingSelectionsProvider");
  }
  return context;
}
