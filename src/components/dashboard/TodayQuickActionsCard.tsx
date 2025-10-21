"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface TodayQuickActionsCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Container card for Today's Quick Actions module
 * Provides context for quick logging buttons
 */
export function TodayQuickActionsCard({
  children,
  className,
}: TodayQuickActionsCardProps) {
  return (
    <section
      className={cn("space-y-4", className)}
      role="region"
      aria-labelledby="today-quick-actions-heading"
    >
      <h2
        id="today-quick-actions-heading"
        className="text-xl font-semibold text-foreground"
      >
        Quick Actions
      </h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Log events quickly to keep your health timeline up to date.
        </p>
        {children}
      </div>
    </section>
  );
}
