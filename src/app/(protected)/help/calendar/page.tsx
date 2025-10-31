import Link from "next/link";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Calendar View</h1>
        <p className="text-lg text-muted-foreground">
          View your health timeline and navigate historical data
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is the Calendar?</h2>
        <p className="text-muted-foreground">
          The Calendar provides a visual timeline of your health data, showing:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Active and resolved flares</li>
          <li>Food, symptom, medication, and trigger logs</li>
          <li>Mood and sleep entries</li>
          <li>Intervention dates</li>
          <li>Historical patterns at a glance</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Navigating the Calendar</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Month View</h3>
            <p className="text-sm text-muted-foreground">
              See the full month at a glance. Days with logged data are highlighted with colored indicators.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Navigate Between Months</h3>
            <p className="text-sm text-muted-foreground">
              Use the previous/next arrows to move between months. Click "Today" to jump back to the current date.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Click on Any Day</h3>
            <p className="text-sm text-muted-foreground">
              Click a specific day to see all entries logged on that date. This opens a detailed view
              with flares, symptoms, food, medications, triggers, mood, and sleep for that day.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Data Indicators</h2>
        <p className="text-muted-foreground mb-4">
          Days are color-coded to show different types of activity:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Flare Days</h4>
            <p className="text-sm text-muted-foreground">
              Days with active flares appear with a colored marker. Severity is indicated by color intensity.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Logged Data</h4>
            <p className="text-sm text-muted-foreground">
              Small dots or badges indicate food, symptom, medication, or trigger logs on that day.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Mood & Sleep</h4>
            <p className="text-sm text-muted-foreground">
              Icons or colors show mood rating and sleep quality for days where these were logged.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Using the Calendar Effectively</h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Review Patterns</h4>
            <p className="text-sm text-muted-foreground">
              Look for clusters of flares or symptoms. Do they occur on weekends? After certain events?
              Patterns become visible when viewed on a calendar.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Prepare for Appointments</h4>
            <p className="text-sm text-muted-foreground">
              Navigate to relevant months before doctor visits to refresh your memory on recent activity.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Fill in Gaps</h4>
            <p className="text-sm text-muted-foreground">
              Notice days without entries? The calendar helps you identify gaps in your tracking.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use keyboard shortcuts to navigate (left/right arrow for prev/next month)</li>
                <li>• Look for weekly or monthly patterns in the calendar view</li>
                <li>• Screenshot the calendar to share with your doctor</li>
                <li>• Review the calendar monthly to reflect on your health journey</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics</h3>
            <p className="text-xs text-muted-foreground">Deep dive into patterns</p>
          </Link>
          <Link href="/help/tracking-flares" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">View flares on calendar</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/analytics" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Analytics
        </Link>
        <Link href="/help/managing-data" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Managing Data
        </Link>
      </div>
    </div>
  );
}
