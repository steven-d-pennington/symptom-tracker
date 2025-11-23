"use client";

import React from "react";
import { SimpleDailyLogForm } from "@/components/daily-log/SimpleDailyLogForm";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function DailyLogPage() {
  const { userId } = useCurrentUser();

  if (!userId) {
    return null; // Or a loading spinner/redirect
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <SimpleDailyLogForm userId={userId} />
    </div>
  );
}
