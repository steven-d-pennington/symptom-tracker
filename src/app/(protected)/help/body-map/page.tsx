import Link from "next/link";
import { ArrowLeft, Map, MousePointer } from "lucide-react";

export default function BodyMapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Using the Body Map</h1>
        <p className="text-lg text-muted-foreground">
          Navigate body views and mark problem areas effectively
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Body Map Views</h2>
        <p className="text-muted-foreground">
          The body map offers four anatomical views to accurately mark flare locations:
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Front View (F)</h3>
            <p className="text-sm text-muted-foreground">
              Anterior view showing chest, abdomen, front of limbs, face. Press <kbd className="px-2 py-1 text-xs bg-muted rounded">F</kbd> key to switch.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Back View (B)</h3>
            <p className="text-sm text-muted-foreground">
              Posterior view showing spine, shoulder blades, back of limbs. Press <kbd className="px-2 py-1 text-xs bg-muted rounded">B</kbd> key.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Left View (L)</h3>
            <p className="text-sm text-muted-foreground">
              Left lateral view showing left side profile. Press <kbd className="px-2 py-1 text-xs bg-muted rounded">L</kbd> key.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Right View (R)</h3>
            <p className="text-sm text-muted-foreground">
              Right lateral view showing right side profile. Press <kbd className="px-2 py-1 text-xs bg-muted rounded">R</kbd> key.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Marking Flare Locations</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Click to Mark</h3>
            <p className="text-sm text-muted-foreground">
              Select the appropriate view, then click on the specific location where you're experiencing a flare.
              The coordinates are captured automatically.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Multiple Locations</h3>
            <p className="text-sm text-muted-foreground">
              You can mark multiple flares across different body views. Each flare is tracked independently.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">Visual Indicators</h3>
            <p className="text-sm text-muted-foreground">
              Active flares appear as markers on the body map, color-coded by severity (mild, moderate, severe).
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Keyboard Navigation</h2>
        <p className="text-muted-foreground mb-4">
          Navigate the body map efficiently with keyboard shortcuts:
        </p>

        <div className="p-4 rounded-lg border border-border bg-card">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li><kbd className="px-2 py-1 text-xs bg-muted rounded">F</kbd> - Switch to Front view</li>
            <li><kbd className="px-2 py-1 text-xs bg-muted rounded">B</kbd> - Switch to Back view</li>
            <li><kbd className="px-2 py-1 text-xs bg-muted rounded">L</kbd> - Switch to Left view</li>
            <li><kbd className="px-2 py-1 text-xs bg-muted rounded">R</kbd> - Switch to Right view</li>
            <li><kbd className="px-2 py-1 text-xs bg-muted rounded">Tab</kbd> - Navigate through interactive elements</li>
            <li><kbd className="px-2 py-1 text-xs bg-muted rounded">Esc</kbd> - Close modals and dialogs</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            <em>Note: Keyboard shortcuts are disabled when typing in text fields.</em>
          </p>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Accessibility</h2>
        <p className="text-muted-foreground">
          The body map is fully accessible with screen reader support and keyboard navigation.
          All interactive elements have proper ARIA labels and focus indicators.
        </p>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Map className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Use keyboard shortcuts for faster view switching</li>
                <li>• Be as precise as possible when marking locations</li>
                <li>• Check multiple views to ensure you've marked the right area</li>
                <li>• Update flare markers as they move or change over time</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/tracking-flares" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">Learn how to track flares on the body map</p>
          </Link>
          <Link href="/help/keyboard-shortcuts" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Keyboard Shortcuts</h3>
            <p className="text-xs text-muted-foreground">Full list of shortcuts and accessibility features</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/mood-and-sleep" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Mood & Sleep
        </Link>
        <Link href="/help/analytics" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Analytics
        </Link>
      </div>
    </div>
  );
}
