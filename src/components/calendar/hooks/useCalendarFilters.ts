"use client";

import { useState } from "react";
import { CalendarFilters } from "@/lib/types/calendar";

export const useCalendarFilters = () => {
  const [filters, setFilters] = useState<CalendarFilters>({});

  return {
    filters,
    updateFilters: setFilters,
  };
};
