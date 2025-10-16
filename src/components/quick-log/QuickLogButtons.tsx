"use client";

import { type ElementType } from "react";
import { Utensils } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface QuickLogButtonsProps {
  onLogFlare: () => void;
  onLogMedication: () => void;
  onLogSymptom: () => void;
  onLogTrigger: () => void;
  onLogFood: () => void;
  disabled?: boolean;
  loading?: boolean;
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
}: QuickLogButtonsProps) {
  const isDisabled = disabled || loading;

  const buttons: QuickLogButtonConfig[] = [
    {
      id: "flare",
      emoji: "🔥",
      label: "New Flare",
      onClick: onLogFlare,
      colorClasses: "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white",
      ariaLabel: "Log new flare",
    },
    {
      id: "medication",
      emoji: "💊",
      label: "Medication",
      onClick: onLogMedication,
      colorClasses: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white",
      ariaLabel: "Log medication",
    },
    {
      id: "symptom",
      emoji: "😣",
      label: "Symptom",
      onClick: onLogSymptom,
      colorClasses: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white",
      ariaLabel: "Log symptom",
    },
    {
      id: "food",
      label: "Food",
      onClick: onLogFood,
      colorClasses: "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white",
      ariaLabel: "Log food",
      icon: Utensils,
    },
    {
      id: "trigger",
      emoji: "⚠️",
      label: "Trigger",
      onClick: onLogTrigger,
      colorClasses: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white",
      ariaLabel: "Log trigger",
    },
  ];

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
            onClick={button.onClick}
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
