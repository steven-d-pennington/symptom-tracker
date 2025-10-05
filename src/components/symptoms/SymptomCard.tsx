import { Symptom } from "@/lib/types/symptoms";

interface SymptomCardProps {
  symptom: Symptom;
}

export const SymptomCard = ({ symptom }: SymptomCardProps) => {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{symptom.name}</h3>
          <p className="text-sm text-muted-foreground">{symptom.category}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Severity:</span>
          <span>{symptom.severity}</span>
        </div>
      </header>
      <dl className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
        {symptom.location ? (
          <div>
            <dt className="font-medium text-foreground">Location</dt>
            <dd>{symptom.location}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-medium text-foreground">Logged on</dt>
          <dd>{symptom.timestamp.toLocaleString()}</dd>
        </div>
        {symptom.triggers?.length ? (
          <div>
            <dt className="font-medium text-foreground">Triggers</dt>
            <dd>{symptom.triggers.join(", ")}</dd>
          </div>
        ) : null}
      </dl>
      {symptom.notes ? (
        <p className="mt-3 text-sm text-muted-foreground">{symptom.notes}</p>
      ) : null}
    </article>
  );
};
