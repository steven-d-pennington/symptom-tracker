import Link from "next/link";

export const FinalCTA = () => {
  return (
    <section className="bg-gradient-to-br from-primary/5 via-emerald-50/50 to-primary/5 py-16 sm:py-24 dark:from-primary/10 dark:via-emerald-900/20 dark:to-primary/10">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to Understand Your Health Patterns?
        </h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Join others managing autoimmune conditions with privacy-first tracking and intelligent analysis.
        </p>
        
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
          >
            Get Started Free
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Explore Demo
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          No sign-up required • Works offline • 100% free and open source
        </p>
      </div>
    </section>
  );
};
