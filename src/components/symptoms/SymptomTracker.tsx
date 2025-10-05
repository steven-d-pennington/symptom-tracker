"use client";

import { useSymptoms } from "./hooks/useSymptoms";
import { SymptomForm } from "./SymptomForm";
import { SymptomList } from "./SymptomList";
import { SymptomFilters } from "./SymptomFilters";

export const SymptomTracker = () => {
  const { symptoms, filters, updateFilters } = useSymptoms();

  return (
    <section className="flex flex-col gap-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Symptom tracking</h2>
        <p className="text-sm text-muted-foreground">
          Log, review, and manage symptoms with customizable categories and severity scales.
        </p>
      </header>

      <SymptomForm onSubmit={() => {}} />
      <SymptomFilters filters={filters} onChange={updateFilters} />
      <SymptomList symptoms={symptoms} />
    </section>
  );
};
