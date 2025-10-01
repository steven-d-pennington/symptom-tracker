export default function JournalPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Daily journal</h1>
        <p className="text-sm text-muted-foreground">
          Reflect on your energy, mood, and experiences to uncover patterns that impact your autoimmune health.
        </p>
      </header>

      <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Your guided journaling experience is on its way. Soon you&apos;ll be able to add prompts, attach photos,
          and share insights with your care team.
        </p>
      </div>
    </div>
  );
}