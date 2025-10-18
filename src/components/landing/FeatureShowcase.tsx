import Link from "next/link";

export const FeatureShowcase = () => {
  const features = [
    {
      icon: "📊",
      title: "Daily Symptom Tracking",
      description: "Quick logging with severity scales and custom categories. Track what matters most to you in seconds.",
      href: "/log"
    },
    {
      icon: "🗺️",
      title: "Visual Body Mapping",
      description: "Interactive anatomy diagrams to track symptom locations. See patterns emerge across your body.",
      href: "/body-map"
    },
    {
      icon: "📷",
      title: "Photo Documentation",
      description: "Encrypted medical photos with comparison tools. Track visual changes over time with complete privacy.",
      href: "/photos"
    },
    {
      icon: "🔥",
      title: "Flare Monitoring",
      description: "Real-time tracking of active symptom flares. Monitor interventions and effectiveness in one dashboard.",
      href: "/flares"
    },
    {
      icon: "🧪",
      title: "Trigger Analysis",
      description: "AI-powered correlation detection across 90-day windows. Discover what's affecting your symptoms with statistical confidence.",
      href: "/triggers"
    },
    {
      icon: "📅",
      title: "Timeline & Calendar",
      description: "Historical visualization and pattern recognition. See your health journey at a glance.",
      href: "/calendar"
    }
  ];

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Understand Your Health
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Comprehensive tracking and analysis tools designed specifically for people managing chronic autoimmune conditions.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Explore feature
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
