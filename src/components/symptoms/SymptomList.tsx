import { Symptom } from "@/lib/types/symptoms";
import { SymptomCard } from "./SymptomCard";

interface SymptomListProps {
  symptoms: Symptom[];
}

export const SymptomList = ({ symptoms }: SymptomListProps) => {
  if (symptoms.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        No symptoms logged yet. Your history will appear here once you start tracking.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {symptoms.map((symptom) => (
        <li key={symptom.id}>
          <SymptomCard symptom={symptom} />
        </li>
      ))}
    </ul>
  );
};
