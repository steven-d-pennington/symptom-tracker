"use client";

import { useState } from "react";
import { DailyEntryTemplate } from "@/lib/types/daily-entry";

export const useEntryTemplates = () => {
  const [templates] = useState<DailyEntryTemplate[]>([]);

  return {
    templates,
  };
};
