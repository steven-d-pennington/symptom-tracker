import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Analytics & Insights</h1>
        <p className="text-lg text-muted-foreground">
          Understand problem areas, trends, and intervention effectiveness
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What Analytics Are Available?</h2>
        <p className="text-muted-foreground mb-4">
          The Analytics page provides insights into your health patterns:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Problem Area Analytics</h3>
            <p className="text-sm text-muted-foreground">
              See which body regions have the most frequent or severe flares. Visualized as a heat map
              showing your most problematic areas.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Flare Duration & Severity</h3>
            <p className="text-sm text-muted-foreground">
              Track average flare duration, severity trends over time, and recovery patterns.
              Helps identify if your condition is improving or worsening.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Intervention Effectiveness</h3>
            <p className="text-sm text-muted-foreground">
              See which interventions (medications, therapies, lifestyle changes) correlate with
              flare reduction or resolution. Helps identify what works best for you.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Trend Visualization</h3>
            <p className="text-sm text-muted-foreground">
              Time-series charts showing symptom frequency, severity trends, and patterns over weeks or months.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Use Analytics</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Navigate to Analytics</h3>
            <p className="text-sm text-muted-foreground">
              From the dashboard or main navigation, click "Analytics" to view your insights.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Filter by Date Range</h3>
            <p className="text-sm text-muted-foreground">
              Adjust the date range to focus on specific time periods (last 7 days, 30 days, 90 days, or custom).
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Drill Down</h3>
            <p className="text-sm text-muted-foreground">
              Click on specific problem areas or time periods to see detailed breakdowns and related data.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Export Insights</h3>
            <p className="text-sm text-muted-foreground">
              Use the export feature to save analytics data for doctor appointments or personal records.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Need at least 2 weeks of consistent data for meaningful patterns</li>
                <li>• Review analytics monthly to spot long-term trends</li>
                <li>• Compare intervention effectiveness before making treatment changes</li>
                <li>• Export analytics reports before doctor appointments</li>
                <li>• Look for correlations between mood/sleep and flare patterns</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/tracking-flares" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">Log data for analytics</p>
          </Link>
          <Link href="/help/import-export" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Import & Export</h3>
            <p className="text-xs text-muted-foreground">Export analytics data</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/body-map" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Body Map
        </Link>
        <Link href="/help/calendar" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Calendar
        </Link>
      </div>
    </div>
  );
}
