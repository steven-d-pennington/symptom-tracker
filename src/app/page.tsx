import Link from "next/link";
import { CalendarView } from "@/components/calendar/CalendarView";
import { DailyEntryForm } from "@/components/daily-entry/DailyEntryForm";
import { SymptomTracker } from "@/components/symptoms/SymptomTracker";

const HomePage = () => {
  return (
    <div className="space-y-16 px-4 py-12">
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-primary">
            Phase 1 Foundations
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Autoimmune Symptom Tracker
          </h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            A privacy-first progressive web app that helps people living with autoimmune conditions capture daily health context, understand patterns, and prepare for appointments—all while keeping data on their device.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/onboarding"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Start onboarding
          </Link>
          <a
            href="https://github.com/"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            View roadmap
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Guided onboarding</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Help new users configure their experience, understand privacy controls, and set smart defaults tailored to autoimmune life.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Navigate to the onboarding flow to experience the multi-step setup and placeholder educational modules that we will expand in later tasks.
          </div>
        </article>
        <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-foreground">Offline-first data</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dexie-powered IndexedDB scaffolding is ready to persist entries, symptoms, and attachments once the feature work lands.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            The database layer is initialized in <code>src/lib/db</code> with future-proofed schemas for symptoms, medications, triggers, and daily entries.
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold text-foreground">Core MVP workspaces</h2>
          <p className="text-sm text-muted-foreground">
            Each foundational module includes placeholder UI and hooks so parallel feature development can begin immediately.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <SymptomTracker />
          </div>
          <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <DailyEntryForm />
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <CalendarView />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
