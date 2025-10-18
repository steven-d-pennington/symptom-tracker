"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "allergenFilter:selected";

export function useAllergenFilter() {
  const [selected, setSelected] = useState<string | null>(null);

  // Initialize from URL or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("allergen");
      const fromStorage = localStorage.getItem(STORAGE_KEY);
      const initial = fromUrl || fromStorage;
      if (initial) setSelected(initial);
    } catch {
      // ignore
    }
  }, []);

  // Persist to URL and localStorage
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selected) {
        url.searchParams.set("allergen", selected);
        localStorage.setItem(STORAGE_KEY, selected);
      } else {
        url.searchParams.delete("allergen");
        localStorage.removeItem(STORAGE_KEY);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  }, [selected]);

  return { selected, setSelected } as const;
}

