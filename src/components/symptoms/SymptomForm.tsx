"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import {
  SeverityScale,
  SymptomCategory,
  SymptomDraft,
} from "@/lib/types/symptoms";
import { SeverityScale as SeverityScaleInput } from "./SeverityScale";

interface SymptomFormProps {
  categories: SymptomCategory[];
  onSubmit: (symptom: SymptomDraft) => void;
  initialValues?: SymptomDraft | null;
  onCancel?: () => void;
  triggerSuggestions?: string[];
  nameSuggestions?: string[];
  locationSuggestions?: string[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

const SEVERITY_SCALE_OPTIONS: { id: string; label: string; scale: SeverityScale }[] = [
  {
    id: "numeric-10",
    label: "0-10 Numeric",
    scale: {
      type: "numeric",
      min: 0,
      max: 10,
      labels: {
        0: "No symptoms",
        3: "Mild",
        6: "Moderate",
        8: "Severe",
        10: "Worst imaginable",
      },
      colors: {
        0: "#22c55e",
        5: "#facc15",
        10: "#ef4444",
      },
    },
  },
  {
    id: "descriptive-3",
    label: "Descriptive (Mild-Moderate-Severe)",
    scale: {
      type: "descriptive",
      min: 1,
      max: 3,
      labels: {
        1: "Mild",
        2: "Moderate",
        3: "Severe",
      },
      colors: {
        1: "#22c55e",
        2: "#f97316",
        3: "#ef4444",
      },
    },
  },
  {
    id: "custom-5",
    label: "Custom 1-5",
    scale: {
      type: "custom",
      min: 1,
      max: 5,
      step: 1,
      labels: {
        1: "Very low",
        3: "Moderate",
        5: "Very high",
      },
      colors: {
        1: "#60a5fa",
        3: "#f59e0b",
        5: "#ef4444",
      },
    },
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatDateTimeLocal = (date: Date) => {
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseDateTimeLocal = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const resolveScaleId = (scale: SeverityScale): string => {
  const match = SEVERITY_SCALE_OPTIONS.find((option) => {
    return (
      option.scale.type === scale.type &&
      option.scale.min === scale.min &&
      option.scale.max === scale.max
    );
  });

  return match?.id ?? "custom";
};

const createInitialDraft = (
  categories: SymptomCategory[],
  defaults?: SymptomDraft | null,
): SymptomDraft => {
  const defaultCategory = defaults?.category ?? categories[0]?.id ?? "uncategorized";
  const selectedScale = defaults?.severityScale ?? SEVERITY_SCALE_OPTIONS[0].scale;

  return {
    id: defaults?.id,
    userId: defaults?.userId ?? "demo",
    name: defaults?.name ?? "",
    category: defaultCategory,
    severity: defaults ? clamp(defaults.severity, selectedScale.min, selectedScale.max) : 4,
    severityScale: selectedScale,
    location: defaults?.location ?? "",
    duration: defaults?.duration,
    triggers: defaults?.triggers ?? [],
    notes: defaults?.notes ?? "",
    photos: defaults?.photos ?? [],
    timestamp: defaults?.timestamp ?? new Date(),
  };
};

export const SymptomForm = ({
  categories,
  onSubmit,
  initialValues = null,
  onCancel,
  triggerSuggestions = [],
  nameSuggestions = [],
  locationSuggestions = [],
}: SymptomFormProps) => {
  const [draft, setDraft] = useState<SymptomDraft>(() => createInitialDraft(categories, initialValues));
  const [scaleId, setScaleId] = useState(resolveScaleId(draft.severityScale));
  const [errors, setErrors] = useState<FormErrors>({});
  const [triggerInput, setTriggerInput] = useState("");

  useEffect(() => {
    setDraft(createInitialDraft(categories, initialValues));
    setScaleId(resolveScaleId(initialValues?.severityScale ?? SEVERITY_SCALE_OPTIONS[0].scale));
    setTriggerInput("");
    setErrors({});
  }, [categories, initialValues]);

  const isEditing = Boolean(initialValues?.id);

  const activeScale = useMemo(() => {
    const option = SEVERITY_SCALE_OPTIONS.find((item) => item.id === scaleId);
    return option?.scale ?? draft.severityScale;
  }, [draft.severityScale, scaleId]);

  useEffect(() => {
    setDraft((previous) => ({
      ...previous,
      severityScale: activeScale,
      severity: clamp(previous.severity, activeScale.min, activeScale.max),
    }));
  }, [activeScale]);

  const severityLabel = useMemo(() => {
    if (!activeScale.labels) {
      return undefined;
    }

    const roundedValue = Math.round(draft.severity);
    return activeScale.labels[roundedValue];
  }, [activeScale.labels, draft.severity]);

  const availableCategories = useMemo(() => {
    return categories.map((category) => ({
      id: category.id,
      label: category.name,
    }));
  }, [categories]);

  const addTrigger = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned) {
      return;
    }

    setDraft((previous) => {
      const existing = previous.triggers ?? [];
      if (existing.includes(cleaned)) {
        return previous;
      }

      return {
        ...previous,
        triggers: [...existing, cleaned],
      };
    });
  };

  const removeTrigger = (value: string) => {
    setDraft((previous) => ({
      ...previous,
      triggers: (previous.triggers ?? []).filter((trigger) => trigger !== value),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors: FormErrors = {};
    const trimmedName = draft.name.trim();

    if (trimmedName.length < 1 || trimmedName.length > 100) {
      validationErrors.name = "Symptom name must be between 1 and 100 characters.";
    }

    const timestamp = draft.timestamp instanceof Date ? draft.timestamp : new Date(draft.timestamp);
    if (timestamp.getTime() > Date.now() + 60 * 1000) {
      validationErrors.timestamp = "Timestamp cannot be in the future.";
    }

    if (!draft.category) {
      validationErrors.category = "Please select a category.";
    }

    const severity = clamp(draft.severity, activeScale.min, activeScale.max);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const sanitized: SymptomDraft = {
      ...draft,
      name: trimmedName,
      severity,
      severityScale: activeScale,
      triggers: draft.triggers?.map((trigger) => trigger.trim()).filter(Boolean) ?? [],
      timestamp,
    };

    onSubmit(sanitized);
    setErrors({});

    if (!isEditing) {
      const defaults = createInitialDraft(categories, null);
      setDraft({
        ...defaults,
        category: sanitized.category,
        severityScale: activeScale,
        severity,
      });
      setScaleId(resolveScaleId(activeScale));
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTrigger(triggerInput);
      setTriggerInput("");
    }
  };

  return (
    <form
      aria-labelledby="symptom-form-title"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 id="symptom-form-title" className="text-xl font-semibold text-foreground">
            {isEditing ? "Update symptom" : "Log a new symptom"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Capture key context like severity, location, triggers, and notes to build a rich history.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border px-3 py-1">
            {draft.triggers?.length ?? 0} triggers
          </span>
          <span className="rounded-full border border-border px-3 py-1">
            {draft.notes?.length ?? 0} note characters
          </span>
        </div>
      </div>

      <fieldset className="mt-6 grid gap-4 md:grid-cols-2" aria-describedby={errors.name ? "symptom-name-error" : undefined}>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Symptom name</span>
          <input
            list="symptom-name-suggestions"
            name="symptom-name"
            autoComplete="off"
            className="rounded-lg border border-border bg-background px-4 py-2"
            placeholder="e.g. Painful nodule"
            value={draft.name}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "symptom-name-error" : undefined}
            required
          />
          {errors.name ? (
            <span id="symptom-name-error" className="text-xs text-destructive">
              {errors.name}
            </span>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Category</span>
          <select
            className="rounded-lg border border-border bg-background px-4 py-2"
            value={draft.category}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                category: event.target.value,
              }))
            }
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "symptom-category-error" : undefined}
            required
          >
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category ? (
            <span id="symptom-category-error" className="text-xs text-destructive">
              {errors.category}
            </span>
          ) : null}
        </label>
      </fieldset>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="space-y-4">
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Severity scale</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {SEVERITY_SCALE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setScaleId(option.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    scaleId === option.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-foreground/40"
                  }`}
                  aria-pressed={scaleId === option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Severity</span>
              <span className="text-muted-foreground">
                {draft.severity} {severityLabel ? `· ${severityLabel}` : ""}
              </span>
            </div>
            <SeverityScaleInput
              scale={activeScale}
              value={draft.severity}
              onChange={(value) =>
                setDraft((previous) => ({
                  ...previous,
                  severity: value,
                }))
              }
              ariaLabel="Symptom severity"
            />
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Timestamp</span>
            <input
              type="datetime-local"
              className="rounded-lg border border-border bg-background px-4 py-2"
              value={formatDateTimeLocal(draft.timestamp)}
              max={formatDateTimeLocal(new Date())}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  timestamp: parseDateTimeLocal(event.target.value),
                }))
              }
              aria-invalid={Boolean(errors.timestamp)}
              aria-describedby={errors.timestamp ? "symptom-timestamp-error" : undefined}
              required
            />
            {errors.timestamp ? (
              <span id="symptom-timestamp-error" className="text-xs text-destructive">
                {errors.timestamp}
              </span>
            ) : null}
          </label>
        </section>

        <section className="space-y-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Location</span>
            <input
              list="symptom-location-suggestions"
              name="symptom-location"
              className="rounded-lg border border-border bg-background px-4 py-2"
              placeholder="e.g. Left underarm"
              value={draft.location ?? ""}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  location: event.target.value,
                }))
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Duration (minutes)</span>
            <input
              type="number"
              min={0}
              className="rounded-lg border border-border bg-background px-4 py-2"
              value={draft.duration ?? ""}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  duration: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            />
          </label>

          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Triggers</span>
            <div className="flex flex-wrap gap-2">
              {(draft.triggers ?? []).map((trigger) => (
                <span
                  key={trigger}
                  className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs"
                >
                  {trigger}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeTrigger(trigger)}
                    aria-label={`Remove trigger ${trigger}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2"
                placeholder="Press enter after each trigger"
                value={triggerInput}
                onChange={(event) => setTriggerInput(event.target.value)}
                onKeyDown={handleTriggerKeyDown}
              />
              <button
                type="button"
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                onClick={() => {
                  addTrigger(triggerInput);
                  setTriggerInput("");
                }}
              >
                Add
              </button>
            </div>
            {triggerSuggestions.length ? (
              <div className="flex flex-wrap gap-2">
                {triggerSuggestions.map((trigger) => (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => addTrigger(trigger)}
                    className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Notes</span>
            <textarea
              className="min-h-[120px] rounded-lg border border-border bg-background px-4 py-2"
              placeholder="Add helpful context about what you were doing, medication taken, or relief strategies."
              value={draft.notes ?? ""}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  notes: event.target.value,
                }))
              }
            />
          </label>

          <fieldset className="flex flex-col gap-2 text-sm" aria-describedby="photo-upload-hint">
            <span className="font-medium text-foreground">Photos</span>
            <input
              type="file"
              multiple
              disabled
              className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-2 text-muted-foreground"
            />
            <span id="photo-upload-hint" className="text-xs text-muted-foreground">
              Photo attachments will sync with offline storage in Task 5. For now, capture details in the notes field.
            </span>
          </fieldset>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          <span>
            Severity scale: {activeScale.type} {activeScale.min}-{activeScale.max}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <button
              type="button"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            {isEditing ? "Save changes" : "Save symptom"}
          </button>
        </div>
      </div>

      <datalist id="symptom-name-suggestions">
        {nameSuggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="symptom-location-suggestions">
        {locationSuggestions.map((location) => (
          <option key={location} value={location} />
        ))}
      </datalist>
    </form>
  );
};
