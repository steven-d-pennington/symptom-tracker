"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TodayTimelineCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container card for Today's Timeline module
 * Displays events logged today
 */
export function TodayTimelineCard({
  children,
  className,
}: TodayTimelineCardProps) {
  return (
    <section
      className={cn("space-y-4", className)}
      role="region"
      aria-labelledby="today-timeline-heading"
    >
      <h2
        id="today-timeline-heading"
        className="text-xl font-semibold text-foreground"
      >
        Today&apos;s Timeline
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
