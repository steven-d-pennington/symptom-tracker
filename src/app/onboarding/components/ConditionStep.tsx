"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { OnboardingStepComponentProps } from "../types/onboarding";

const CONDITIONS = [
  "Hidradenitis Suppurativa",
  "Rheumatoid Arthritis",
  "Lupus",
  "Psoriatic Arthritis",
  "Multiple Sclerosis",
  "Other",
];

const CONDITION_DETAILS: Record<string, string> = {
  "Hidradenitis Suppurativa":
    "We prioritize gentle logging interfaces and flare pattern tracking to respect the pain and mobility impacts of HS.",
  "Rheumatoid Arthritis":
    "Joint stiffness, pain, and fatigue insights inform reminders and help you capture daily mobility changes.",
  Lupus:
    "We surface photo-safe note prompts and symptom correlations to help you discuss systemic flares with your care team.",
  "Psoriatic Arthritis":
    "Skin and joint logging combine so you can document flare sites, severity, and treatments in one place.",
  "Multiple Sclerosis":
    "Focus areas highlight fatigue, cognition, and mobility aids so you can track fluctuations over time.",
  Other:
    "Choose a custom focus to shape your dashboard. You can always add more specific conditions later.",
  "General Tracking":
    "We will enable broad health journaling tools until you are ready to personalize further.",
};

const EXPERIENCES = ["new", "experienced", "returning"] as const;

export const ConditionStep = ({
  data,
  onContinue,
  onBack,
  updateData,
}: OnboardingStepComponentProps) => {
  const infoId = useId();
  const otherInputId = useId();

  const initialCondition = useMemo(() => {
    if (!data.condition) {
      return CONDITIONS[0]!;
    }
    if (CONDITIONS.includes(data.condition)) {
      return data.condition;
    }
    return "Other";
  }, [data.condition]);

  const [selectedCondition, setSelectedCondition] = useState<string>(initialCondition);
  const [customCondition, setCustomCondition] = useState(
    initialCondition === "Other" ? data.condition : "",
  );
  const [experience, setExperience] = useState<typeof EXPERIENCES[number]>(
    data.experience ?? "new",
  );
  const [showInfo, setShowInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveCondition =
    selectedCondition === "Other"
      ? customCondition.trim() || ""
      : selectedCondition;

  const insightKey = effectiveCondition || selectedCondition;
  const insightCopy = CONDITION_DETAILS[insightKey] ?? CONDITION_DETAILS.Other;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (selectedCondition === "Other" && !customCondition.trim()) {
      setError("Please describe your condition to continue.");
      return;
    }

    setError(null);

    updateData({
      condition: effectiveCondition || "General Tracking",
      experience,
    });

    onContinue("condition", {
      condition: effectiveCondition || "General Tracking",
      experience,
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Tell us about your condition
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose the condition you primarily want to track. You can add more later.
        </p>
      </div>

      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-foreground">Primary condition</span>
        <select
          value={selectedCondition}
          onChange={(event) => {
            const next = event.target.value;
            setSelectedCondition(next);
            if (next !== "Other") {
              setCustomCondition("");
              updateData({ condition: next });
            }
          }}
          className="rounded-lg border border-border bg-background px-4 py-2"
        >
          {CONDITIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {selectedCondition === "Other" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground" htmlFor={otherInputId}>
              What condition or focus would you like to track?
            </label>
            <input
              id={otherInputId}
              type="text"
              className="w-full rounded-lg border border-border bg-background px-4 py-2"
              placeholder="e.g. Crohn's disease or Long COVID"
              value={customCondition}
              onChange={(event) => {
                const nextValue = event.target.value;
                setCustomCondition(nextValue);
                updateData({ condition: nextValue });
              }}
            />
          </div>
        )}
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">
          Your experience with tracking
        </legend>
        <div className="grid gap-3 md:grid-cols-3">
          {EXPERIENCES.map((option) => (
            <label
              key={option}
              className={cn(
                "cursor-pointer rounded-xl border border-border bg-muted/40 p-4 text-sm shadow-sm transition hover:border-primary",
                experience === option && "border-primary bg-primary/10",
              )}
            >
              <input
                type="radio"
                name="experience"
                value={option}
                className="sr-only"
                checked={experience === option}
                onChange={() => {
                  setExperience(option);
                  updateData({ experience: option });
                }}
              />
              <div className="font-semibold capitalize text-foreground">
                {option}
              </div>
              <p className="mt-2 text-muted-foreground">
                {option === "new"
                  ? "I’m new to tracking my health."
                  : option === "experienced"
                    ? "I’ve tracked symptoms before."
                    : "I’m coming back after a break."}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          aria-expanded={showInfo}
          aria-controls={infoId}
          onClick={() => setShowInfo((prev) => !prev)}
        >
          <span aria-hidden="true">ℹ️</span>
          Why this helps
        </button>
        <div
          id={infoId}
          role="note"
          hidden={!showInfo}
          className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary"
        >
          {insightCopy}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => onBack()}
        >
          Back
        </button>
        <button
          type="button"
          className="rounded-lg border border-dashed border-primary/40 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
          onClick={() =>
            {
              updateData({
                condition: "General Tracking",
                experience,
              });
              onContinue("condition", {
                condition: "General Tracking",
                experience,
              });
            }
          }
        >
          I’m not sure yet
        </button>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </form>
  );
};
