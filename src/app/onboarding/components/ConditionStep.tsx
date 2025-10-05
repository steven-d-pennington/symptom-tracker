"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { OnboardingData, OnboardingStepId } from "../types/onboarding";

const CONDITIONS = [
  "Hidradenitis Suppurativa",
  "Rheumatoid Arthritis",
  "Lupus",
  "Psoriatic Arthritis",
  "Multiple Sclerosis",
];

const EXPERIENCES: OnboardingData["experience"][] = [
  "new",
  "experienced",
  "returning",
];

type StepProps = {
  onContinue: (stepId: OnboardingStepId, data?: Partial<OnboardingData>) => void;
};

export const ConditionStep = ({ onContinue }: StepProps) => {
  const [condition, setCondition] = useState<string>(CONDITIONS[0]!);
  const [experience, setExperience] = useState<OnboardingData["experience"]>(
    "new",
  );

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        onContinue("condition", { condition, experience });
      }}
    >
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
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2"
        >
          {CONDITIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="Other">Other (add later)</option>
        </select>
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
                onChange={() => setExperience(option)}
              />
              <div className="font-semibold capitalize text-foreground">
                {option}
              </div>
              <p className="mt-2 text-muted-foreground">
                {option === "new"
                  ? "I'm new to tracking my health."
                  : option === "experienced"
                    ? "I've tracked symptoms before."
                    : "I'm coming back after a break."}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end gap-3">
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
