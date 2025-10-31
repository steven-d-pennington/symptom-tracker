import Link from "next/link";
import { ArrowLeft, Map, MousePointer, Stethoscope, TrendingUp, AlertCircle } from "lucide-react";

export default function TrackingFlaresPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Tracking Flares</h1>
        <p className="text-lg text-muted-foreground">
          Learn how to mark flare locations on the body map and track severity over time
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is a Flare?</h2>
        <p className="text-muted-foreground">
          A flare is a period of increased disease activity or symptom intensity in a specific body region.
          Flares can vary in severity, duration, and location. Tracking them helps you:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Identify patterns and triggers</li>
          <li>Measure intervention effectiveness</li>
          <li>Communicate better with healthcare providers</li>
          <li>Understand your condition's progression</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Create a Flare</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Go to Active Flares or Body Map
            </h3>
            <p className="text-sm text-muted-foreground">
              From the dashboard, click "Active Flares" or navigate to the body map view.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Select Body View
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Choose the appropriate body view (Front, Back, Left, or Right) using the view switcher buttons
              or keyboard shortcuts (F, B, L, R).
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Click on the Body Map
            </h3>
            <p className="text-sm text-muted-foreground">
              Click on the specific location where you're experiencing the flare. The coordinates will be
              captured automatically.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
              Rate the Severity
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Choose a severity rating from 1-10:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li><strong>1-3:</strong> Mild - Noticeable but not limiting</li>
              <li><strong>4-6:</strong> Moderate - Affects daily activities</li>
              <li><strong>7-9:</strong> Severe - Significantly limiting</li>
              <li><strong>10:</strong> Extreme - Unable to function</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">5</span>
              Add Optional Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Add notes about symptoms, triggers, or anything notable about this flare.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Logging Interventions</h2>
        <p className="text-muted-foreground mb-4">
          When you try something to help manage a flare (medication, ice, rest, etc.), log it as an intervention:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">From the Flare Details Page</h4>
            <p className="text-sm text-muted-foreground">
              Click on any active flare to view details, then click "Log Intervention" to record what you tried.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Track Effectiveness</h4>
            <p className="text-sm text-muted-foreground">
              Note whether the intervention helped, and update the flare severity if it changed.
              Over time, this helps you identify what works best for you.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Resolving a Flare</h2>
        <p className="text-muted-foreground mb-4">
          When a flare subsides:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Mark as Resolved</h4>
            <p className="text-sm text-muted-foreground">
              Click the "Mark as Resolved" button on the flare details page. This records the resolution
              date and moves it to your flare history.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Add Resolution Notes</h4>
            <p className="text-sm text-muted-foreground">
              Note what ultimately helped resolve the flare. This information is valuable for future reference.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Pro Tips
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Track flares consistently, even mild ones</li>
                <li>• Update severity regularly as flares change</li>
                <li>• Log interventions immediately after trying them</li>
                <li>• Use the notes field to capture context (stress, weather, diet changes)</li>
                <li>• Review your flare history in Analytics to spot patterns</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/body-map" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Using the Body Map</h3>
            <p className="text-xs text-muted-foreground">Navigate body views effectively</p>
          </Link>
          <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics & Insights</h3>
            <p className="text-xs text-muted-foreground">Understand flare patterns</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
        <Link href="/help/logging-food" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Logging Food
        </Link>
      </div>
    </div>
  );
}
