"use client";

import { useState } from "react";
import { DailyEntry } from "@/lib/types/daily-entry";

const createInitialEntry = (): DailyEntry => ({
  id: crypto.randomUUID(),
  userId: "demo",
  date: new Date().toISOString().slice(0, 10),
  overallHealth: 5,
  energyLevel: 5,
  sleepQuality: 5,
  stressLevel: 5,
  symptoms: [],
  medications: [],
  triggers: [],
  duration: 0,
  completedAt: new Date(),
});

export const useDailyEntry = () => {
  const [entry, setEntry] = useState<DailyEntry>(createInitialEntry);

  const updateEntry = (changes: Partial<DailyEntry>) => {
    setEntry((prev) => ({
      ...prev,
      ...changes,
      completedAt: changes.completedAt ?? prev.completedAt,
    }));
  };

  return { entry, updateEntry };
};
