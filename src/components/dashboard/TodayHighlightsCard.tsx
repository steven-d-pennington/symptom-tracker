"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TodayHighlightsCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container card for Today's Highlights module
 * Wraps active flares and alerts
 */
export function TodayHighlightsCard({
  children,
  className,
}: TodayHighlightsCardProps) {
  return (
    <section
      className={cn("space-y-4", className)}
      role="region"
      aria-labelledby="today-highlights-heading"
    >
      <h2
        id="today-highlights-heading"
        className="text-xl font-semibold text-foreground"
      >
        Highlights
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
