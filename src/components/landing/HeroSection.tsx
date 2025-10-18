import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Take Control of Your
          <br />
          <span className="bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
            Autoimmune Journey
          </span>
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
          Privacy-first symptom and trigger tracking that helps you understand patterns, 
          prepare for appointments, and make informed health decisions—with local-first 
          privacy and optional cloud backup.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Works 100% Offline
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Local-First Storage
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Encrypted Photos
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/onboarding"
          className="rounded-lg bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
        >
          Start Tracking Now
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
        >
          View Live Demo
        </Link>
      </div>

      {/* Optional: Hero Image Placeholder */}
      <div className="mt-8 w-full max-w-5xl">
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted to-muted/50 shadow-2xl">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              App Screenshot Coming Soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
