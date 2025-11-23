import Link from "next/link";
import { ArrowLeft, CheckCircle, Home, Map, Utensils, BarChart3 } from "lucide-react";

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Welcome & Getting Started
        </h1>
        <p className="text-lg text-muted-foreground">
          Your first steps with Pocket Symptom Tracker
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 mb-8">
          <p className="text-foreground font-medium mb-2">
            👋 Welcome! We're glad you're here.
          </p>
          <p className="text-sm text-muted-foreground">
            Pocket Symptom Tracker is designed to help you track patterns, understand triggers,
            and advocate for yourself with confidence. This guide will help you get started.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Pocket Symptom Tracker?</h2>
        <p className="text-muted-foreground">
          Pocket Symptom Tracker is a privacy-first app that helps people with chronic conditions:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Track flares on an interactive body map</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Log food, symptoms, medications, and triggers</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Record mood and sleep patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Analyze patterns and identify triggers</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Keep all your data private and offline-first</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Your First Week</h2>
        <p className="text-muted-foreground mb-4">
          Here's what we recommend for your first week with the app:
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Day 1: Explore the Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Familiarize yourself with the dashboard layout. Click around and see what's available.
              Don't worry—you can't break anything!
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Day 2-3: Mark Your First Flare
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              If you have an active flare, mark it on the body map. This is the core feature of the app.
            </p>
            <Link
              href="/help/tracking-flares"
              className="text-sm text-primary hover:underline font-medium"
            >
              Learn how to track flares →
            </Link>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              Day 4-5: Start Logging Daily Data
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Begin logging your meals, symptoms, and mood daily. The more consistent you are,
              the better patterns you'll uncover.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link
                href="/help/logging-food"
                className="text-sm text-primary hover:underline"
              >
                Logging Food
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/help/logging-symptoms"
                className="text-sm text-primary hover:underline"
              >
                Logging Symptoms
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/help/mood-and-sleep"
                className="text-sm text-primary hover:underline"
              >
                Mood & Sleep
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Day 6-7: Check Your Analytics
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              After a week of data, check your analytics to see emerging patterns.
            </p>
            <Link
              href="/help/analytics"
              className="text-sm text-primary hover:underline font-medium"
            >
              Learn about analytics →
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Key Features</h2>
        <p className="text-muted-foreground mb-4">
          Here are the main features you'll use regularly:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-1">Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Your home base. See active flares, recent entries, and quick action buttons.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-1">Active Flares</h3>
            <p className="text-sm text-muted-foreground">
              View and manage all your current flares. Mark them on the body map with severity ratings.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-1">Logging Pages</h3>
            <p className="text-sm text-muted-foreground">
              Dedicated pages for logging food, symptoms, medications, and triggers. Fast and intuitive.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-1">Analytics</h3>
            <p className="text-sm text-muted-foreground">
              See patterns emerge with problem area analytics, trend visualization, and intervention effectiveness.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-1">Calendar</h3>
            <p className="text-sm text-muted-foreground">
              View your health timeline. See flares, entries, and patterns over time.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Privacy & Data</h2>
        <p className="text-muted-foreground mb-4">
          Your privacy is our top priority:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong className="text-foreground">Offline-First:</strong> All data is stored locally on your device using IndexedDB</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong className="text-foreground">No Cloud Required:</strong> Your data never leaves your device</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong className="text-foreground">You're in Control:</strong> Export your data anytime</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span><strong className="text-foreground">PWA Technology:</strong> Works like a native app, even offline</span>
          </li>
        </ul>

        <div className="p-6 rounded-lg bg-muted mt-8">
          <h3 className="font-semibold text-foreground mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-muted-foreground">
            Consistency is key! Try to log your data at the same time each day (e.g., after breakfast).
            Even 30 seconds of daily tracking can reveal powerful patterns over time.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link
            href="/help/tracking-flares"
            className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">Learn how to mark and track flares</p>
          </Link>
          <Link
            href="/help/body-map"
            className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold text-foreground text-sm mb-1">Using the Body Map</h3>
            <p className="text-xs text-muted-foreground">Navigate views and mark locations</p>
          </Link>
          <Link
            href="/help/logging-food"
            className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold text-foreground text-sm mb-1">Logging Food</h3>
            <p className="text-xs text-muted-foreground">Track meals and identify triggers</p>
          </Link>
          <Link
            href="/help/analytics"
            className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics & Insights</h3>
            <p className="text-xs text-muted-foreground">Understand your health patterns</p>
          </Link>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
        <Link
          href="/help/tracking-flares"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
        >
          Next: Tracking Flares
        </Link>
      </div>
    </div>
  );
}
