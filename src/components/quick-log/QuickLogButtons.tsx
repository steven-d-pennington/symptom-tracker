"use client";

import { type ElementType, useCallback } from "react";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUxInstrumentation } from "@/lib/hooks/useUxInstrumentation";

interface QuickLogButtonsProps {
  onLogFlare: () => void;
  onLogMedication: () => void;
  onLogSymptom: () => void;
  onLogTrigger: () => void;
  onLogFood: () => void;
  disabled?: boolean;
  loading?: boolean;
  instrumentationContext?: string;
  disableInstrumentation?: boolean;
}

interface QuickLogButtonConfig {
  id: string;
  label: string;
  ariaLabel: string;
  onClick: () => void;
  colorClasses: string;
  icon?: ElementType;
  emoji?: string;
}

export function QuickLogButtons({
  onLogFlare,
  onLogMedication,
  onLogSymptom,
  onLogTrigger,
  onLogFood,
  disabled = false,
  loading = false,
  instrumentationContext = "quick-actions.card",
  disableInstrumentation = false,
}: QuickLogButtonsProps) {
  const isDisabled = disabled || loading;
  const { recordUxEvent } = useUxInstrumentation();

  const buttons: QuickLogButtonConfig[] = [
    {
      id: "flare",
      emoji: "🔥",
      label: "New Flare",
      onClick: onLogFlare,
      colorClasses: "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground",
      ariaLabel: "Log new flare",
    },
    {
      id: "medication",
      emoji: "💊",
      label: "Medication",
      onClick: onLogMedication,
      colorClasses: "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground",
      ariaLabel: "Log medication",
    },
    {
      id: "symptom",
      emoji: "😣",
      label: "Symptom",
      onClick: onLogSymptom,
      colorClasses: "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground",
      ariaLabel: "Log symptom",
    },
    {
      id: "food",
      label: "Food",
      onClick: onLogFood,
      colorClasses: "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground",
      ariaLabel: "Log food",
      icon: Utensils,
    },
    {
      id: "trigger",
      emoji: "⚠️",
      label: "Trigger",
      onClick: onLogTrigger,
      colorClasses: "bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground",
      ariaLabel: "Log trigger",
    },
  ];

  const handleButtonClick = useCallback(
    (config: QuickLogButtonConfig) => () => {
      if (isDisabled) {
        return;
      }

      if (!disableInstrumentation) {
        void recordUxEvent(`quickAction.${config.id}`, {
          metadata: {
            context: instrumentationContext,
            label: config.label,
            ariaLabel: config.ariaLabel,
          },
        });
      }

      config.onClick();
    },
    [disableInstrumentation, instrumentationContext, isDisabled, recordUxEvent],
  );

  return (
    <section
      className="w-full"
      role="region"
      aria-label="Quick log event buttons"
    >
      {/* Mobile: 2x2 grid, Desktop: single row */}
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
        {buttons.map((button) => (
          <button
            key={button.id}
            type="button"
            onClick={handleButtonClick(button)}
            disabled={isDisabled}
            aria-label={button.ariaLabel}
            className={cn(
              // Base styles - minimum 44px tap target
              "min-h-[44px] min-w-[44px] rounded-lg px-4 py-3 font-semibold transition-all",
              "flex flex-col items-center justify-center gap-1",
              "shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
              // Color and hover states
              !isDisabled && button.colorClasses,
              // Disabled state
              isDisabled && "bg-muted text-muted-foreground cursor-not-allowed opacity-60",
              // Loading state
              loading && "animate-pulse"
            )}
          >
            {button.icon ? (
              <button.icon
                aria-hidden="true"
                className="h-6 w-6"
                strokeWidth={2.5}
              />
            ) : (
              <span className="text-2xl" role="img" aria-hidden="true">
                {button.emoji}
              </span>
            )}
            <span className="text-xs sm:text-sm">
              {loading ? "Loading..." : button.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
