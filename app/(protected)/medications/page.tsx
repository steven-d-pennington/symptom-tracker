export default function MedicationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Medication management</h1>
        <p className="text-sm text-muted-foreground">
          Track prescriptions, dosages, adherence, and reminders to stay on top of your treatment plan.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Coming soon: detailed medication schedules, refill tracking, and adherence insights tailored to your
          autoimmune conditions. Stay tuned!
        </p>
      </div>
    </div>
  );
}