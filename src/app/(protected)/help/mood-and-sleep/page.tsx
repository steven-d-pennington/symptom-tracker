import Link from "next/link";
import { ArrowLeft, Smile, Moon } from "lucide-react";

export default function MoodAndSleepPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Mood & Sleep Tracking</h1>
        <p className="text-lg text-muted-foreground">
          Track daily mood and sleep patterns to uncover correlations
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Track Mood & Sleep?</h2>
        <p className="text-muted-foreground">
          Mood and sleep are critical health indicators that often correlate with chronic condition symptoms:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Poor sleep can trigger or worsen flares</li>
          <li>Mood changes may precede symptom flare-ups</li>
          <li>Pain and symptoms affect sleep quality and mood</li>
          <li>Tracking both helps identify bidirectional patterns</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Logging Mood</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Navigate to Mood Logging</h3>
            <p className="text-sm text-muted-foreground">
              From dashboard, click "Log Mood" or navigate to /mood page.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Select Your Mood</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Choose from mood options:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>😄 Great - Feeling excellent</li>
              <li>🙂 Good - Positive and content</li>
              <li>😐 Okay - Neutral, neither good nor bad</li>
              <li>😔 Low - Feeling down or stressed</li>
              <li>😢 Very Low - Struggling significantly</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Notes (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Include context: "stressful day at work," "felt energized after walk," etc.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Logging Sleep</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Navigate to Sleep Logging</h3>
            <p className="text-sm text-muted-foreground">
              From dashboard, click "Log Sleep" or navigate to /sleep page.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Record Hours Slept</h3>
            <p className="text-sm text-muted-foreground">
              Enter the approximate hours of sleep (e.g., 7.5 hours).
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Rate Sleep Quality</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Rate quality from 1-5:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li><strong>1:</strong> Very poor - Restless, frequent waking</li>
              <li><strong>2:</strong> Poor - Difficulty falling/staying asleep</li>
              <li><strong>3:</strong> Fair - Some interruptions</li>
              <li><strong>4:</strong> Good - Mostly restful</li>
              <li><strong>5:</strong> Excellent - Deep, uninterrupted sleep</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Details</h3>
            <p className="text-sm text-muted-foreground">
              Note factors affecting sleep: "woke up in pain," "took sleep aid," "new mattress," etc.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Smile className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Log mood daily, ideally at the same time (e.g., evening)</li>
                <li>• Log sleep the morning after (when you know total hours and quality)</li>
                <li>• Be honest with ratings - patterns emerge from consistent data</li>
                <li>• Use Analytics to see correlations between sleep/mood and symptoms</li>
                <li>• Track even good days - positive patterns are valuable too</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics</h3>
            <p className="text-xs text-muted-foreground">View mood and sleep correlations</p>
          </Link>
          <Link href="/help/calendar" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Calendar</h3>
            <p className="text-xs text-muted-foreground">See mood/sleep on timeline</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/logging-triggers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Logging Triggers
        </Link>
        <Link href="/help/body-map" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Body Map
        </Link>
      </div>
    </div>
  );
}
