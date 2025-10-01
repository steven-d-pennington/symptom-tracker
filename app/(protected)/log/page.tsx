export default function LogSymptomPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Log today&apos;s symptoms</h1>
        <p className="text-sm text-muted-foreground">
          Capture your daily metrics to understand patterns across pain, fatigue, mood, and inflammation.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          The interactive symptom logging experience will be available soon. You&apos;ll be able to track multiple
          conditions, record custom symptoms, and link medications or triggers for deeper insights.
        </p>
      </div>
    </div>
  );
}