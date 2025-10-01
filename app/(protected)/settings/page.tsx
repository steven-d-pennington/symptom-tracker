export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details, notifications, data exports, and privacy preferences.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          This settings area is coming soon. You&apos;ll be able to customize reminder schedules, integrate
          wearables, and control data sharing preferences.
        </p>
      </div>
    </div>
  );
}