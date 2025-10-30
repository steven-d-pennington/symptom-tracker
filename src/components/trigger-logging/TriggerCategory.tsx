"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { TriggerRecord } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";

interface TriggerCategoryProps {
  name: string;
  triggers: TriggerRecord[];
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  onSelectTrigger: (trigger: TriggerRecord) => void;
  selectedTriggerId?: string;
}

/**
 * Collapsible Trigger Category Component (Story 3.5.5)
 *
 * Accordion-style category with expand/collapse functionality.
 *
 * AC3.5.5.3: Collapsible categories for triggers
 * - Category header shows: name, item count, expand state
 * - Clicking category header toggles expansion state
 * - Smooth CSS transitions for expand/collapse animations
 *
 * AC3.5.5.7: Mobile-optimized category interaction
 * - Category headers minimum 44x44px touch targets
 * - Expand/collapse icons clearly visible (chevron up/down)
 * - Trigger item selection uses large touch-friendly cards
 */
export function TriggerCategory({
  name,
  triggers,
  isExpanded,
  onToggle,
  onSelectTrigger,
  selectedTriggerId,
}: TriggerCategoryProps) {
  return (
    <div className="border border-border rounded-lg mb-2 overflow-hidden bg-card">
      {/* Category Header - AC3.5.5.7: 44x44px minimum touch target */}
      <button
        onClick={() => onToggle(!isExpanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px] hover:bg-muted transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`trigger-category-${name}`}
      >
        <span className="font-medium text-foreground">
          {name} ({triggers.length} {triggers.length === 1 ? 'trigger' : 'triggers'})
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground transition-transform" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
        )}
      </button>

      {/* Category Content - AC3.5.5.3: Smooth CSS transition */}
      <div
        id={`trigger-category-${name}`}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 space-y-2">
          {triggers.map((trigger) => (
            <button
              key={trigger.id}
              onClick={() => onSelectTrigger(trigger)}
              className={cn(
                "w-full text-left p-3 border rounded-lg min-h-[44px] transition-all",
                selectedTriggerId === trigger.id
                  ? "bg-primary/10 border-primary ring-2 ring-primary"
                  : "border-border hover:bg-primary/5 hover:border-primary/50"
              )}
              aria-pressed={selectedTriggerId === trigger.id}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1 font-medium text-foreground">
                  {trigger.name}
                </span>
                {/* Visual indicator for default triggers */}
                {trigger.isDefault && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    default
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                {trigger.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
