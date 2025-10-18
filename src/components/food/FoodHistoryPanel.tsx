"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { userRepository } from "@/lib/repositories/userRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { foodRepository } from "@/lib/repositories/foodRepository";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

const ALLERGENS = [
  "dairy",
  "gluten",
  "nuts",
  "shellfish",
  "nightshades",
  "soy",
  "eggs",
  "fish",
] as const;

export const FoodHistoryPanel: React.FC = () => {
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState<MealType | "">("");
  const [start, setStart] = useState<string>(() => new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [end, setEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [allergenFilters, setAllergenFilters] = useState<string[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await userRepository.getOrCreateCurrentUser();
      const startMs = new Date(start).getTime();
      const endMs = new Date(end).getTime() + 86399999;
      const raw = await foodEventRepository.findByDateRange(user.id, startMs, endMs);

      // Meal type filter (indexed path used when possible upstream)
      const mealTypeFiltered = mealType ? raw.filter((e) => e.mealType === mealType) : raw;

      // Hydrate foods for allergen filtering and name search
      const allFoodIds = new Set<string>();
      mealTypeFiltered.forEach((e) => {
        try {
          JSON.parse(e.foodIds).forEach((id: string) => allFoodIds.add(id));
        } catch {}
      });
      const foodRecords = await Promise.all(Array.from(allFoodIds).map((id) => foodRepository.getById(id)));
      const foodById = new Map<string, any>();
      Array.from(allFoodIds).forEach((id, idx) => {
        if (foodRecords[idx]) foodById.set(id, foodRecords[idx]);
      });

      const hydrated = mealTypeFiltered.map((e) => {
        const ids: string[] = (() => { try { return JSON.parse(e.foodIds); } catch { return []; } })();
        const names = ids.map((id) => (foodById.get(id)?.name ?? id));
        const allergens = ids.flatMap((id) => {
          try { return JSON.parse(foodById.get(id)?.allergenTags ?? "[]") as string[]; } catch { return []; }
        });
        return { ...e, ids, names, allergens };
      });

      // Name query filter
      const nameFiltered = query
        ? hydrated.filter((h) => h.names.some((n: string) => n.toLowerCase().includes(query.toLowerCase())))
        : hydrated;

      // Allergen filters (must contain any of selected allergens)
      const allergenFiltered = allergenFilters.length > 0
        ? nameFiltered.filter((h) => h.allergens.some((a: string) => allergenFilters.includes(a)))
        : nameFiltered;

      // Sort newest first
      allergenFiltered.sort((a, b) => b.timestamp - a.timestamp);
      setEvents(allergenFiltered);
    } catch (e) {
      console.error(e);
      setError("Failed to load food history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onToggleAllergen = (tag: string) => {
    setAllergenFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return Array.from(next);
    });
  };

  useEffect(() => {
    void loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, mealType, start, end, allergenFilters.join(",")]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label htmlFor="fh-query" className="block text-sm font-medium">Search by name</label>
          <input id="fh-query" value={query} onChange={(e) => setQuery(e.target.value)} className="border px-3 py-2 rounded" placeholder="e.g., oatmeal" />
        </div>
        <div>
          <label htmlFor="fh-mealtype" className="block text-sm font-medium">Meal type</label>
          <select id="fh-mealtype" value={mealType} onChange={(e) => setMealType(e.target.value as any)} className="border px-3 py-2 rounded">
            <option value="">All</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <div>
          <label htmlFor="fh-start" className="block text-sm font-medium">Start</label>
          <input id="fh-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div>
          <label htmlFor="fh-end" className="block text-sm font-medium">End</label>
          <input id="fh-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border px-3 py-2 rounded" />
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium mb-2">Allergen filters</span>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((tag) => (
            <label key={tag} className="inline-flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={allergenFilters.includes(tag)}
                onChange={() => onToggleAllergen(tag)}
                aria-label={`Filter by ${tag}`}
              />
              <span className="capitalize">{tag}</span>
            </label>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading history…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matching results</p>
      ) : (
        <ul className="space-y-2" role="list" aria-label="Food history results">
          {events.map((e) => (
            <li key={e.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{new Date(e.timestamp).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground capitalize">{e.mealType}</div>
              </div>
              <div className="text-sm mt-1 truncate">{e.names.join(", ")}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FoodHistoryPanel;

