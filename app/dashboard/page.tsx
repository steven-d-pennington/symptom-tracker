
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="text-3xl font-semibold">{session.user.name ?? "Autoimmune Explorer"}</h1>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Today&apos;s Symptom Summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Log your pain, fatigue, mood, and other key metrics to stay on top of your health trends.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Medication Schedule</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Track adherence, dosages, and reminders to keep your treatment plan on track.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Journal Highlights</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reflect on your day and capture insights into triggers, energy levels, and wins.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Next steps</h2>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
          <li>• Complete your onboarding assessment to tailor your symptom log.</li>
          <li>• Add your autoimmune conditions and medications.</li>
          <li>• Set up reminders for logging symptoms and journaling.</li>
        </ul>
      </section>
    </div>
  );
}