import Link from "next/link";
import { ArrowLeft, Pill, Clock, AlertCircle } from "lucide-react";

export default function LoggingMedicationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Logging Medications</h1>
        <p className="text-lg text-muted-foreground">
          Track medication timing and dosages
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Track Medications?</h2>
        <p className="text-muted-foreground">
          Logging medications helps you:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Ensure consistent adherence to your medication schedule</li>
          <li>Identify medication effectiveness in reducing symptoms</li>
          <li>Track timing and dosage accurately</li>
          <li>Prepare medication lists for doctor appointments</li>
          <li>Understand correlations between meds and symptom relief</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How to Log Medications</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Navigate to Medication Logging
            </h3>
            <p className="text-sm text-muted-foreground">
              From dashboard, click "Log Medication" or use keyboard shortcut <kbd className="px-2 py-1 text-xs bg-muted rounded">M</kbd>
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Select a Medication
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose from your medication list. Common medications are pre-populated.
              You can add custom medications in Settings → Manage Data.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Add Details (Optional)
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Click "Add Details" to include:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>Dosage amount (e.g., "10mg", "2 tablets")</li>
              <li>Custom time (defaults to now)</li>
              <li>Notes (e.g., "with food", "before bed")</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
              Save the Entry
            </h3>
            <p className="text-sm text-muted-foreground">
              Click "Save" to log the medication. It will appear in your timeline.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Managing Your Medication List</h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Add Custom Medications</h4>
            <p className="text-sm text-muted-foreground">
              Navigate to Settings → Manage Data → Medications to add medications not in the default list.
              Include generic and brand names for easy searching.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Hide Discontinued Medications</h4>
            <p className="text-sm text-muted-foreground">
              If you stop taking a medication, you can hide it from the logging list while preserving
              historical logs.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                ⚠️ Important Disclaimer
              </p>
              <p className="text-amber-800 dark:text-amber-200">
                This app is for tracking purposes only. Never change medication dosages or schedules
                without consulting your healthcare provider. Use your prescription labels and doctor's
                instructions as your primary source of truth.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Pill className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Pro Tips
              </p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Log medications immediately after taking them</li>
                <li>• Include dosage in notes for historical reference</li>
                <li>• Add timing notes ("with breakfast", "bedtime") for consistency</li>
                <li>• Review medication logs before doctor appointments</li>
                <li>• Track PRN (as-needed) medications to identify patterns</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/tracking-flares" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Tracking Flares</h3>
            <p className="text-xs text-muted-foreground">Log medications as interventions for flares</p>
          </Link>
          <Link href="/help/managing-data" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Managing Your Data</h3>
            <p className="text-xs text-muted-foreground">Add and organize medications</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/logging-symptoms" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Logging Symptoms
        </Link>
        <Link href="/help/logging-triggers" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Next: Logging Triggers
        </Link>
      </div>
    </div>
  );
}
