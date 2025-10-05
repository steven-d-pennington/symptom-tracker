"use client";

import { FormEvent } from "react";

interface SymptomFormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const SymptomForm = ({ onSubmit }: SymptomFormProps) => {
  return (
    <form
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      onSubmit={onSubmit}
    >
      <fieldset className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Symptom name</span>
          <input
            type="text"
            placeholder="e.g. Painful nodule"
            className="rounded-lg border border-border bg-background px-4 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Category</span>
          <select className="rounded-lg border border-border bg-background px-4 py-2">
            <option>Pain</option>
            <option>Skin</option>
            <option>Fatigue</option>
          </select>
        </label>
      </fieldset>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Save symptom
        </button>
      </div>
    </form>
  );
};
