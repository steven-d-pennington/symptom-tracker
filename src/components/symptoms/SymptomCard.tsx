"use client";

import { useMemo, useState } from "react";
import { Symptom, SymptomCategory } from "@/lib/types/symptoms";

interface SymptomCardProps {
  symptom: Symptom;
  category?: SymptomCategory;
  onEdit?: (symptom: Symptom) => void;
  onDelete?: (symptom: Symptom) => void;
}

const formatDuration = (minutes?: number) => {
  if (!minutes && minutes !== 0) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getSeverityColor = (symptom: Symptom) => {
  const value = symptom.severity;
  const scale = symptom.severityScale;
  const color = scale.colors?.[Math.round(value)];

  if (color) {
    return color;
  }

  const ratio = (value - scale.min) / (scale.max - scale.min || 1);
  if (ratio <= 0.33) {
    return "#22c55e";
  }

  if (ratio <= 0.66) {
    return "#f59e0b";
  }

  return "#ef4444";
};

export const SymptomCard = ({ symptom, category, onEdit, onDelete }: SymptomCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityLabel = useMemo(() => {
    if (!symptom.severityScale.labels) {
      return undefined;
    }

    return symptom.severityScale.labels[Math.round(symptom.severity)];
  }, [symptom.severity, symptom.severityScale.labels]);

  const categoryBadge = useMemo(() => {
    if (!category) {
      return null;
    }

    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs"
        style={{ backgroundColor: `${category.color}1A` }}
      >
        <span className="text-base" aria-hidden>
          {category.icon ?? "🏷️"}
        </span>
        <span className="font-medium text-foreground">{category.name}</span>
      </span>
    );
  }, [category]);

  const handleDelete = () => {
    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm("Delete this symptom entry? This action cannot be undone.");
    if (confirmed) {
      onDelete(symptom);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{symptom.name}</h3>
            {categoryBadge}
          </div>
          <p className="text-xs text-muted-foreground">
            Recorded {formatDateTime(symptom.timestamp)} · Last updated {formatDateTime(symptom.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getSeverityColor(symptom) }}
              aria-hidden
            />
            <span>
              Severity {symptom.severity}
              {severityLabel ? ` · ${severityLabel}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => onEdit?.(symptom)}
              className="rounded-md border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-border px-3 py-1 font-medium text-destructive hover:bg-destructive/10"
            >
              Delete
            </button>
          </div>
        </div>
      </header>

      <dl className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
        <div>
          <dt className="font-medium text-foreground">Duration</dt>
          <dd>{formatDuration(symptom.duration)}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Location</dt>
          <dd>{symptom.location ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Triggers</dt>
          <dd>{symptom.triggers?.length ? symptom.triggers.join(", ") : "—"}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="mt-4 flex items-center gap-2 text-sm font-medium text-primary"
        onClick={() => setIsExpanded((value) => !value)}
        aria-expanded={isExpanded}
      >
        {isExpanded ? "Hide details" : "View details"}
        <span aria-hidden>{isExpanded ? "▴" : "▾"}</span>
      </button>

      {isExpanded ? (
        <div className="mt-4 space-y-4 text-sm text-muted-foreground">
          <section>
            <h4 className="font-medium text-foreground">Notes</h4>
            <p className="mt-1 whitespace-pre-wrap">
              {symptom.notes?.length ? symptom.notes : "No additional notes provided."}
            </p>
          </section>
          <section>
            <h4 className="font-medium text-foreground">Metadata</h4>
            <ul className="mt-1 space-y-1">
              <li>Severity scale: {symptom.severityScale.type}</li>
              <li>
                Range: {symptom.severityScale.min} - {symptom.severityScale.max}
              </li>
              <li>Photos attached: {symptom.photos?.length ?? 0}</li>
            </ul>
          </section>
        </div>
      ) : null}
    </article>
  );
};
