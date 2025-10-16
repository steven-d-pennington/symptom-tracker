"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import type { FoodRecord, FoodEventRecord } from "@/lib/db/schema";

interface FoodContextValue {
  isFoodLogModalOpen: boolean;
  isLaunchingFoodLog: boolean;
  openFoodLog: () => void;
  closeFoodLog: () => void;
  markFoodLogReady: () => void;
}

const FoodContext = createContext<FoodContextValue | undefined>(undefined);

export function FoodProvider({ children }: { children: ReactNode }) {
  const [isFoodLogModalOpen, setIsFoodLogModalOpen] = useState(false);
  const [isLaunchingFoodLog, setIsLaunchingFoodLog] = useState(false);

  const openFoodLog = useCallback(() => {
    setIsLaunchingFoodLog(true);
    setIsFoodLogModalOpen(true);
  }, []);

  const closeFoodLog = useCallback(() => {
    setIsFoodLogModalOpen(false);
    setIsLaunchingFoodLog(false);
  }, []);

  const markFoodLogReady = useCallback(() => {
    setIsLaunchingFoodLog(false);
  }, []);

  const value = useMemo(
    () => ({
      isFoodLogModalOpen,
      isLaunchingFoodLog,
      openFoodLog,
      closeFoodLog,
      markFoodLogReady,
    }),
    [
      isFoodLogModalOpen,
      isLaunchingFoodLog,
      openFoodLog,
      closeFoodLog,
      markFoodLogReady,
    ],
  );

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}

export function useFoodContext(): FoodContextValue {
  const context = useContext(FoodContext);

  if (!context) {
    throw new Error("useFoodContext must be used within a FoodProvider");
  }

  return context;
}

/**
 * Hook to load and manage foods from the database
 * Provides loading state and error handling
 */
export function useFoods(userId: string) {
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await foodRepository.getActive(userId);
      setFoods(results);
    } catch (err) {
      console.error("Failed to load foods:", err);
      setError(err instanceof Error ? err : new Error("Failed to load foods"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const refresh = useCallback(() => {
    return loadFoods();
  }, [loadFoods]);

  return { foods, loading, error, refresh };
}

/**
 * Hook to load and manage food events from the database
 * Provides loading state, error handling, and time-based queries
 */
export function useFoodEvents(userId: string, options?: {
  startDate?: number;
  endDate?: number;
  limit?: number;
}) {
  const [foodEvents, setFoodEvents] = useState<FoodEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFoodEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let results: FoodEventRecord[];
      
      if (options?.startDate && options?.endDate) {
        // Load events within date range
        results = await foodEventRepository.findByDateRange(
          userId,
          options.startDate,
          options.endDate
        );
      } else if (options?.limit) {
        // Load recent events with limit
        results = await foodEventRepository.getRecent(userId, options.limit);
      } else {
        // Load all events
        results = await foodEventRepository.getAll(userId);
      }
      
      setFoodEvents(results);
    } catch (err) {
      console.error("Failed to load food events:", err);
      setError(err instanceof Error ? err : new Error("Failed to load food events"));
    } finally {
      setLoading(false);
    }
  }, [userId, options?.startDate, options?.endDate, options?.limit]);

  useEffect(() => {
    loadFoodEvents();
  }, [loadFoodEvents]);

  const refresh = useCallback(() => {
    return loadFoodEvents();
  }, [loadFoodEvents]);

  return { foodEvents, loading, error, refresh };
}
