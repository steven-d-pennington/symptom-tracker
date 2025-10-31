import Link from "next/link";
import { ArrowLeft, Wind } from "lucide-react";

export default function LoggingTriggersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Logging Triggers</h1>
        <p className="text-lg text-muted-foreground">
          Identify and record environmental or lifestyle triggers
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What are Triggers?</h2>
        <p className="text-muted-foreground">
          Triggers are environmental, lifestyle, or situational factors that may contribute to flares or symptoms. Common triggers include:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li><strong>Environmental:</strong> Weather changes, temperature, humidity, allergens</li>
          <li><strong>Lifestyle:</strong> Stress, lack of sleep, overexertion, travel</li>
          <li><strong>Physical:</strong> Injury, illness, menstrual cycle</li>
          <li><strong>Situational:</strong> Long periods sitting/standing, specific activities</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Log Triggers</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Navigation</h3>
            <p className="text-sm text-muted-foreground">
              From dashboard, click "Log Trigger" or use keyboard shortcut <kbd className="px-2 py-1 text-xs bg-muted rounded">T</kbd>
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Select from Categories</h3>
            <p className="text-sm text-muted-foreground">
              Triggers are organized by collapsible categories (Weather, Stress, Physical Activity, etc.).
              Click category headers to expand/collapse sections.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Add Context</h3>
            <p className="text-sm text-muted-foreground">
              Use notes to add specifics: "heavy rain all day," "deadline stress at work," "walked 5 miles."
              Context helps identify patterns later.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Using Favorites</h2>
        <p className="text-muted-foreground">
          Mark frequently occurring triggers as favorites for quick access. Weather-related triggers or
          recurring stressors are good candidates for favorites.
        </p>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Log triggers even when you don't have a flare - absence of flares is data too</li>
                <li>• Be specific in notes ("cold front moved in" vs. just "weather")</li>
                <li>• Track positive triggers too (good sleep, relaxation)</li>
                <li>• Review trigger correlations in Analytics</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/tracking-flares" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">Connect triggers to flares</p>
          </Link>
          <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Analytics</h3>
            <p className="text-xs text-muted-foreground">Identify trigger patterns</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/logging-medications" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Logging Medications
        </Link>
        <Link href="/help/mood-and-sleep" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Mood & Sleep
        </Link>
      </div>
    </div>
  );
}
