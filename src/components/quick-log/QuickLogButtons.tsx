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
  icon?: ElementType;
  emoji?: string;
  stat?: string;
  progress?: number; // 0-100 for progress ring
}

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

function ProgressRing({ progress, size = 40, strokeWidth = 3 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-border"
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="text-primary transition-all duration-300"
      />
    </svg>
  );
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

  // TODO: Replace with real data from hooks/queries
  // For now, using placeholder data to demonstrate the design
  const buttons: QuickLogButtonConfig[] = [
    {
      id: "flare",
      emoji: "🔥",
      label: "New Flare",
      onClick: onLogFlare,
      ariaLabel: "Log new flare",
      stat: "2 active",
      progress: 25, // Example: 2 active flares
    },
    {
      id: "medication",
      emoji: "💊",
      label: "Medication",
      onClick: onLogMedication,
      ariaLabel: "Log medication",
      stat: "Logged 3x today",
      progress: 75, // Example: 3 doses today
    },
    {
      id: "symptom",
      emoji: "😣",
      label: "Symptom",
      onClick: onLogSymptom,
      ariaLabel: "Log symptom",
      stat: "Last: 6/10 severity",
      progress: 50, // Example: last severity was 6/10
    },
    {
      id: "food",
      label: "Food",
      onClick: onLogFood,
      ariaLabel: "Log food",
      icon: Utensils,
      stat: "Log your meal",
      progress: 0, // No meals logged today
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
      aria-label="Quick log actions"
    >
      {/* Redesigned: Streaks-inspired card grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {buttons.map((button) => (
          <button
            key={button.id}
            type="button"
            onClick={handleButtonClick(button)}
            disabled={isDisabled}
            aria-label={button.ariaLabel}
            className={cn(
              // Base card styles
              "relative rounded-xl bg-card border border-border p-5",
              "flex flex-col items-start gap-3",
              "min-h-[140px] sm:min-h-[160px]",
              "transition-all duration-200",
              // Hover and focus states
              !isDisabled && "hover:shadow-lg hover:-translate-y-1 hover:border-primary",
              !isDisabled && "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              !isDisabled && "cursor-pointer",
              // Disabled state
              isDisabled && "opacity-60 cursor-not-allowed",
              // Loading state
              loading && "animate-pulse"
            )}
          >
            {/* Header: Icon + Progress Ring */}
            <div className="flex w-full items-start justify-between">
              {/* Icon */}
              <div className="flex items-center justify-center">
                {button.icon ? (
                  <button.icon
                    aria-hidden="true"
                    className="h-8 w-8 text-foreground"
                    strokeWidth={2}
                  />
                ) : (
                  <span className="text-4xl" role="img" aria-hidden="true">
                    {button.emoji}
                  </span>
                )}
              </div>

              {/* Progress Ring */}
              <div className="relative flex items-center justify-center">
                <ProgressRing progress={button.progress || 0} />
                {button.progress !== undefined && button.progress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {button.id === "flare" ? "2" : button.id === "medication" ? "3" : button.id === "symptom" ? "6" : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 w-full">
              <h4 className="text-base font-semibold text-foreground">
                {loading ? "Loading..." : button.label}
              </h4>
              <p className="text-sm text-text-secondary">
                {button.stat}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
