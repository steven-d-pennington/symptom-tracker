"use client";

import { Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils/cn";

interface InfoIconProps {
  content: string | React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

/**
 * InfoIcon Component (Story 3.5.6 - Task 7)
 *
 * Persistent information icon with tooltip/popover.
 * Replaces dismissible info boxes to keep help accessible without being intrusive.
 *
 * AC3.5.6.7: Info icon always visible, opens tooltip on hover/click
 */
export function InfoIcon({ content, className, side = "top" }: InfoIconProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={cn(
              "inline-flex items-center justify-center w-5 h-5 rounded-full",
              "bg-muted hover:bg-muted/80 dark:bg-muted dark:hover:bg-muted/70",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
              className
            )}
            aria-label="More information"
            type="button"
          >
            <Info className="w-3 h-3 text-muted-foreground" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={cn(
              "bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs",
              "text-sm text-foreground z-50",
              "animate-in fade-in-0 zoom-in-95"
            )}
            sideOffset={5}
            side={side}
          >
            {typeof content === "string" ? <p>{content}</p> : content}
            <Tooltip.Arrow className="fill-border" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
