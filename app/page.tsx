import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-muted/30 py-12">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl bg-background px-8 py-12 shadow-lg">
        <span className="inline-flex w-fit rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Autoimmune Health Companion
        </span>
        <h1 className="text-balance text-4xl font-semibold sm:text-5xl lg:text-6xl">
          Track symptoms, medications, and triggers in one intelligent workspace.
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          Build deeper awareness of your autoimmune conditions with daily logging, medication reminders,
          trigger insights, and guided journaling. Designed to empower you and your care team with actionable data.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            Create my health profile
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-xl border border-input px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-primary">Daily Symptom Journal</dt>
            <dd className="mt-1 text-3xl font-semibold">10+ metrics</dd>
            <p className="mt-2 text-sm text-muted-foreground">
              Capture pain, fatigue, inflammation, mood, sleep quality, and custom symptoms.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-primary">Medication Adherence</dt>
            <dd className="mt-1 text-3xl font-semibold">Smart reminders</dd>
            <p className="mt-2 text-sm text-muted-foreground">
              Stay on schedule with personalized medication plans and adherence tracking.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-primary">Trigger Insights</dt>
            <dd className="mt-1 text-3xl font-semibold">360° awareness</dd>
            <p className="mt-2 text-sm text-muted-foreground">
              Link weather, stress, sleep, and lifestyle factors with symptom flares.
            </p>
          </div>
        </dl>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 sm:grid-cols-2">
        <article className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <header>
            <h2 className="text-xl font-semibold">All-in-one health dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Review daily summaries, medication history, journal reflections, and progress trends in seconds.
            </p>
          </header>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li>• Dynamic timeline of symptom logs with severity trends.</li>
            <li>• Medication adherence insights and refill tracking.</li>
            <li>• Personalized recommendations based on triggers and lifestyle patterns.</li>
          </ul>
          <Link
            href="/dashboard"
            className="mt-auto w-fit rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/90"
          >
            View dashboard preview
          </Link>
        </article>

        <article className="flex flex-col gap-4 rounded-3xl border border-border bg-background p-6 shadow-sm">
          <header>
            <h2 className="text-xl font-semibold">Designed for care partnerships</h2>
            <p className="text-sm text-muted-foreground">
              Share meaningful updates with your specialists and support network effortlessly.
            </p>
          </header>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li>• Export comprehensive reports for upcoming appointments.</li>
            <li>• Highlight major flares, trigger patterns, and medication adjustments.</li>
            <li>• Invite caregivers to contribute observations and reminders.</li>
          </ul>
          <Link
            href="/medications"
            className="mt-auto w-fit rounded-xl border border-input px-4 py-2 text-xs font-semibold transition hover:bg-muted"
          >
            Collaborate with my care team
          </Link>
        </article>
      </section>

      <section className="mx-auto w-full max-w-5xl rounded-3xl border border-border bg-background px-8 py-10 text-center shadow-sm">
        <h2 className="text-2xl font-semibold">Built for real people living with autoimmune conditions.</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          From lupus to rheumatoid arthritis and beyond, the Symptom Tracker puts you in control of your data and your story.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs uppercase tracking-wide text-muted-foreground">
          <span>Lupus</span>
          <span>Psoriatic Arthritis</span>
          <span>Hashimoto&apos;s</span>
          <span>Multiple Sclerosis</span>
          <span>Crohn&apos;s Disease</span>
          <span>Sjögren&apos;s</span>
          <span>Celiac</span>
          <span>Dermatomyositis</span>
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl rounded-3xl bg-primary/5 px-8 py-10 text-center">
        <h3 className="text-xl font-semibold">Ready to transform how you manage your autoimmune health?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign up to start logging or explore the upcoming features—trigger tracking, data visualizations,
          photo journal, and secure report exports.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            Start tracking today
          </Link>
          <Link
            href="/roadmap"
            className="inline-flex items-center justify-center rounded-xl border border-primary/40 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            See what&apos;s coming next →
          </Link>
        </div>
      </footer>
    </div>
  );
}
