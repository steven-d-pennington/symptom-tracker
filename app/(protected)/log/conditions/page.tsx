export default function ConditionsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Autoimmune conditions</h1>
        <p className="text-sm text-muted-foreground">
          Catalog each diagnosed condition to personalize symptom tracking, logging prompts, and insights.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Soon you&apos;ll add conditions like lupus, rheumatoid arthritis, and Hashimoto&apos;s, customize symptom
          metrics, and align treatment plans to each condition.
        </p>
      </div>
    </div>
  );
}