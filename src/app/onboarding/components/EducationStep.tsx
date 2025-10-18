"use client";

import { useMemo, useState } from "react";
import type { OnboardingStepComponentProps } from "../types/onboarding";

const MODULES = [
  {
    id: "symptom-tracking",
    title: "Symptom tracking fundamentals",
    summary:
      "Capture severity, duration, and triggers to understand how symptoms change over time.",
  },
  {
    id: "privacy-basics",
    title: "Privacy controls",
    summary:
      "All information stays on your device. Learn how to export or delete data whenever you choose.",
  },
  {
    id: "motivation",
    title: "Staying consistent",
    summary: "Discover quick logging techniques for difficult days so tracking never feels overwhelming.",
  },
];

export const EducationStep = ({ data, onContinue, onBack, updateData }: OnboardingStepComponentProps) => {
  const [completed, setCompleted] = useState<Set<string>>(
    () => new Set(data.educationalContent.completedModules ?? []),
  );

  const completionProgress = useMemo(() => {
    const total = MODULES.length;
    const done = completed.size;
    return { total, done, percent: Math.round((done / total) * 100) };
  }, [completed]);

  const toggleModule = (moduleId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      updateData({
        educationalContent: {
          completedModules: Array.from(next),
          lastViewedAt: new Date(),
        },
      });
      return next;
    });
  };

  const markReviewed = () => {
    const allIds = MODULES.map((module) => module.id);
    setCompleted(new Set(allIds));
    onContinue("education", {
      educationalContent: {
        completedModules: allIds,
        lastViewedAt: new Date(),
      },
    });
  };

  const handleContinue = () => {
    onContinue("education", {
      educationalContent: {
        completedModules: Array.from(completed),
        lastViewedAt: new Date(),
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Quick learning modules
        </h2>
        <p className="text-sm text-muted-foreground">
          Review these short lessons now or revisit them later from the help center.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <span>
          {completionProgress.done} of {completionProgress.total} modules reviewed
        </span>
        <span className="font-medium text-primary">{completionProgress.percent}% complete</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MODULES.map((module) => (
          <article
            key={module.id}
            className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
                <label className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={completed.has(module.id)}
                    onChange={() => toggleModule(module.id)}
                    aria-label={`Mark ${module.title} as reviewed`}
                  />
                  Reviewed
                </label>
              </div>
              <p className="text-sm text-muted-foreground">{module.summary}</p>
              <details className="rounded-lg border border-dashed border-border/80 bg-background/60 p-3 text-sm">
                <summary className="cursor-pointer text-foreground">Key takeaways</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Why it matters for people managing autoimmune conditions</li>
                  <li>Suggested prompts you can revisit in the help center</li>
                  <li>Offline-friendly exercises to try later</li>
                </ul>
              </details>
            </div>
          </article>
        ))}
      </div>

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
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          onClick={() => onContinue("education")}
        >
          Skip for now
        </button>
        <button
          type="button"
          className="rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          onClick={markReviewed}
        >
          Mark all reviewed
        </button>
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};
