"use client";

import { useState } from "react";
import { SymptomCategory } from "@/lib/types/symptoms";

const SAMPLE_CATEGORIES: SymptomCategory[] = [
  {
    id: "pain",
    userId: "demo",
    name: "Pain",
    color: "#ef4444",
    isDefault: true,
    createdAt: new Date(),
    description: "Pain-related symptoms including intensity and duration",
  },
  {
    id: "skin",
    userId: "demo",
    name: "Skin",
    color: "#f97316",
    isDefault: true,
    createdAt: new Date(),
    description: "Skin changes, lesions, and irritation",
  },
];

export const useSymptomCategories = () => {
  const [categories] = useState<SymptomCategory[]>(SAMPLE_CATEGORIES);

  return {
    categories,
  };
};
