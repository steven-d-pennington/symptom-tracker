import Link from "next/link";
import { ArrowLeft, Map, MousePointer, Activity, AlertCircle } from "lucide-react";

export default function BodyMarkersPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-6">
                <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Help Center
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-3">Body Markers</h1>
                <p className="text-lg text-muted-foreground">
                    Track Flares, Pain, and Inflammation using the Unified Body Marker System
                </p>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What are Body Markers?</h2>
                <p className="text-muted-foreground">
                    Body Markers are the core way to track physical symptoms in Pocket Symptom Tracker.
                    Instead of separate tools for different issues, you use a single "Marker" to track:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                    <li><strong>🔥 Flares:</strong> Intense periods of disease activity.</li>
                    <li><strong>⚡ Pain:</strong> Specific areas of discomfort.</li>
                    <li><strong>🔴 Inflammation:</strong> Swelling or heat in joints/tissues.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Creating a Marker</h2>

                <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                            Open the Body Map
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Navigate to the <strong>Body Map</strong> tab from the main dashboard.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                            Select a Location
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                            Rotate the model (Front/Back/Left/Right) and tap the exact location on the body where you feel symptoms.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
                            Choose Type & Severity
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Select the type of marker (Flare, Pain, or Inflammation) and rate the severity (1-10).
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Managing Active Markers</h2>
                <p className="text-muted-foreground mb-4">
                    Markers remain "Active" until you resolve them. This lets you track how long a symptom lasts.
                </p>

                <div className="space-y-3">
                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h4 className="font-semibold text-foreground mb-2">Updating Severity</h4>
                        <p className="text-sm text-muted-foreground">
                            As your symptoms change, tap an existing marker to update its severity. The app keeps a history of these changes (Event Sourcing), so you can see if you're getting better or worse.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border bg-card">
                        <h4 className="font-semibold text-foreground mb-2">Resolving a Marker</h4>
                        <p className="text-sm text-muted-foreground">
                            When the symptom stops, tap the marker and select <strong>"Mark as Resolved"</strong>. This moves it to your history and calculates the total duration.
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                💡 Pro Tip: Overlapping Symptoms
                            </p>
                            <p className="text-blue-800 dark:text-blue-200">
                                You can place multiple markers in the same region if you have different symptoms there (e.g., both "Pain" and "Inflammation" in the same knee).
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
                <div className="grid md:grid-cols-2 gap-3">
                    <Link href="/help/analytics" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                        <h3 className="font-semibold text-foreground text-sm mb-1">Analytics</h3>
                        <p className="text-xs text-muted-foreground">View trends over time</p>
                    </Link>
                    <Link href="/help/logging-medications" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
                        <h3 className="font-semibold text-foreground text-sm mb-1">Logging Medications</h3>
                        <p className="text-xs text-muted-foreground">Track treatments for your symptoms</p>
                    </Link>
                </div>
            </div>

            <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
                <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Help Center
                </Link>
                <Link href="/help/logging-symptoms" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                    Next: Logging General Symptoms
                </Link>
            </div>
        </div>
    );
}
