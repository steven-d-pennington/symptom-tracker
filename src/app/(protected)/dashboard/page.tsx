import Link from "next/link";

export default function DashboardPage() {
  const features = [
    {
      title: "Daily Log",
      description: "Record your daily health status, symptoms, and medications",
      href: "/log",
      icon: "📝",
      color: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    },
    {
      title: "Photo Gallery",
      description: "View and manage encrypted medical photos",
      href: "/photos",
      icon: "📷",
      color: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    },
    {
      title: "Active Flares",
      description: "Track and monitor symptom flares in real-time",
      href: "/flares",
      icon: "🔥",
      color: "bg-red-500/10 text-red-700 border-red-500/20",
    },
    {
      title: "Trigger Analysis",
      description: "Discover correlations between triggers and symptoms",
      href: "/triggers",
      icon: "📊",
      color: "bg-green-500/10 text-green-700 border-green-500/20",
    },
    {
      title: "Calendar",
      description: "View your health history on a calendar timeline",
      href: "/",
      icon: "📅",
      color: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    },
    {
      title: "Body Map",
      description: "Visual symptom location tracking on interactive body diagrams",
      href: "/body-map",
      icon: "🗺️",
      color: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Access all your health tracking features
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className={`group rounded-lg border p-6 transition-all hover:shadow-lg ${feature.color}`}
          >
            <div className="mb-4 text-4xl">{feature.icon}</div>
            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm opacity-80">{feature.description}</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100">
              Open
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Entries</div>
          <div className="mt-1 text-2xl font-bold text-foreground">0</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Active Flares</div>
          <div className="mt-1 text-2xl font-bold text-foreground">0</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Photos</div>
          <div className="mt-1 text-2xl font-bold text-foreground">0</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-medium text-muted-foreground">Tracked Symptoms</div>
          <div className="mt-1 text-2xl font-bold text-foreground">0</div>
        </div>
      </div>
    </div>
  );
}
