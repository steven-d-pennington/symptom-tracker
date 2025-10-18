export const PrivacySection = () => {
  const privacyFeatures = [
    {
      title: "Local-First Architecture",
      items: [
        "All data stored in your browser (IndexedDB)",
        "Advanced analytics run client-side",
        "Works completely offline",
        "Optional cloud backup for premium users (coming soon)"
      ]
    },
    {
      title: "Intelligent Analysis, Zero Cloud Processing",
      items: [
        "Statistical correlation analysis",
        "Pattern detection and forecasting",
        "All computed locally on your device",
        "Your data, your control"
      ]
    },
    {
      title: "Military-Grade Security",
      items: [
        "AES-256-GCM photo encryption",
        "Per-photo encryption keys",
        "Automatic EXIF metadata stripping",
        "No location data in photos"
      ]
    }
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Privacy & Security
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Health Data Stays Private
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Built from the ground up with privacy-first architecture. Your sensitive health information remains under your control.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {privacyFeatures.map((feature, index) => (
            <div key={index} className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
              </div>
              <ul className="space-y-2">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-12 rounded-2xl border border-border bg-muted/50 p-8 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Technical Details
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">AES-256-GCM</code>
              Photo Encryption
            </span>
            <span className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">IndexedDB</code>
              Local Storage
            </span>
            <span className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">PWA</code>
              Offline-First
            </span>
            <span className="flex items-center gap-2">
              <code className="rounded bg-muted px-2 py-1 font-mono text-xs">Zero Cloud</code>
              No External Calls
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
