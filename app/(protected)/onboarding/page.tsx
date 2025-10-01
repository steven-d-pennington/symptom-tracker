export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Let&apos;s personalize your experience</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll walk through a quick setup to tailor symptom tracking, medications, and reminders to your needs.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Onboarding flows are under construction. Soon you&apos;ll be able to define health goals, select 
          autoimmune conditions, and configure your daily logging cadence.
        </p>
      </div>
    </div>
  );
}