import Link from "next/link";
import { ArrowLeft, Stethoscope, TrendingUp } from "lucide-react";

export default function LoggingSymptomsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Logging Symptoms</h1>
        <p className="text-lg text-muted-foreground">
          Record symptoms with severity ratings and notes
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Track Symptoms?</h2>
        <p className="text-muted-foreground">
          Logging symptoms helps you identify patterns and correlations with food, triggers, and interventions.
          Consistent tracking reveals:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Which symptoms occur most frequently</li>
          <li>Symptom severity trends over time</li>
          <li>Correlations with flares, food, or environmental factors</li>
          <li>Whether interventions are working</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Log Symptoms</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Navigate to Symptom Logging
            </h3>
            <p className="text-sm text-muted-foreground">
              From dashboard, click "Log Symptom" or use keyboard shortcut <kbd className="px-2 py-1 text-xs bg-muted rounded">Shift+S</kbd>
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Select a Symptom
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose from the list of symptoms. Use search to find specific ones quickly.
              Common symptoms are pre-populated, and you can add custom ones in Settings.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Rate Severity (1-10)
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use the severity slider or buttons:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li><strong>1-3:</strong> Mild - Noticeable but manageable</li>
              <li><strong>4-6:</strong> Moderate - Affecting daily function</li>
              <li><strong>7-9:</strong> Severe - Significantly limiting</li>
              <li><strong>10:</strong> Extreme - Requiring immediate attention</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
              Add Details (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Click "Add Details" to include notes about duration, onset, or any relevant context.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">5</span>
              Save the Entry
            </h3>
            <p className="text-sm text-muted-foreground">
              Click "Save" to log the symptom. It will appear in your timeline and be included in analytics.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Quick Log vs. Detailed Entry</h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Quick Log Mode</h4>
            <p className="text-sm text-muted-foreground">
              Select symptom, rate severity, click save. Perfect for logging on the go.
              Takes only 5-10 seconds.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Detailed Entry</h4>
            <p className="text-sm text-muted-foreground">
              Click "Add Details" to include duration, onset time, triggers, relief measures,
              and comprehensive notes. Useful for significant symptoms.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Pro Tips
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Log symptoms as they occur, not just severe ones</li>
                <li>• Be consistent with severity ratings for accurate trends</li>
                <li>• Use notes to capture what might have triggered it</li>
                <li>• Track symptom duration in notes for better insights</li>
                <li>• Review symptom trends in Analytics to spot patterns</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/tracking-flares" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">Track flares alongside symptoms</p>
          </Link>
          <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics & Insights</h3>
            <p className="text-xs text-muted-foreground">View symptom patterns and trends</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/logging-food" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Logging Food
        </Link>
        <Link href="/help/logging-medications" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Logging Medications
        </Link>
      </div>
    </div>
  );
}
