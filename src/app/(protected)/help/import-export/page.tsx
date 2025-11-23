import Link from "next/link";
import { ArrowLeft, Download, Upload, Shield, AlertCircle } from "lucide-react";

export default function ImportExportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Help Center
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Import & Export</h1>
        <p className="text-lg text-muted-foreground">
          Back up your data and move it between devices
        </p>
      </div>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Import/Export?</h2>
        <p className="text-muted-foreground">
          Since all your data is stored locally on your device, import/export features allow you to:
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li>Create backups of your health data</li>
          <li>Transfer data to a new device</li>
          <li>Share data with healthcare providers</li>
          <li>Migrate between browsers or devices</li>
          <li>Maintain control and portability of your data</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Exporting Your Data</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Navigate to Export
            </h3>
            <p className="text-sm text-muted-foreground">
              Go to Settings → Export Data or click "Export" from the main navigation menu.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Choose What to Export
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Select which data to include:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 pl-4">
              <li>All data (complete backup)</li>
              <li>Specific date range</li>
              <li>Specific data types (flares only, food logs only, etc.)</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Download JSON File
            </h3>
            <p className="text-sm text-muted-foreground">
              Click "Export" to download a JSON file containing your data. Save this file securely
              on your device or cloud storage.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Importing Data</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
              Navigate to Import
            </h3>
            <p className="text-sm text-muted-foreground">
              Go to Settings → Import Data or the data management page.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
              Select JSON File
            </h3>
            <p className="text-sm text-muted-foreground">
              Click "Choose File" and select the JSON file you previously exported.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">3</span>
              Review and Confirm
            </h3>
            <p className="text-sm text-muted-foreground">
              The app will validate the file and show you what will be imported. Review carefully,
              then click "Import" to complete the process.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">4</span>
              Handle Duplicates
            </h3>
            <p className="text-sm text-muted-foreground">
              If importing data that overlaps with existing data, you'll be asked how to handle duplicates:
              merge, skip, or replace.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 mt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                ⚠️ Important Notes
              </p>
              <ul className="text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Always create a backup before importing data on a device with existing data</li>
                <li>• Store export files securely - they contain your health information</li>
                <li>• Verify imports completed successfully before deleting source data</li>
                <li>• JSON files can be large if you have extensive history</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Privacy & Security</h2>

        <div className="space-y-3">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Local-Only Export
            </h4>
            <p className="text-sm text-muted-foreground">
              Export files are saved directly to your device. Your data never touches our servers.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Encrypted Storage</h4>
            <p className="text-sm text-muted-foreground">
              Data in the app is encrypted. Export files are JSON format (human-readable) for
              portability, so store them securely.
            </p>
          </div>

          <div className="p-4 rounded-lg border border-border bg-card">
            <h4 className="font-semibold text-foreground mb-2">Data Portability</h4>
            <p className="text-sm text-muted-foreground">
              JSON is an open standard format. You own your data and can use it with other tools
              or applications if needed.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 mt-6">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">💡 Pro Tips</p>
              <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Export your data monthly as a backup routine</li>
                <li>• Use cloud storage (Google Drive, iCloud) for automatic backup</li>
                <li>• Export before major browser updates or device changes</li>
                <li>• Test imports on a fresh browser profile before trusting them</li>
                <li>• Keep at least 2-3 backup copies in different locations</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Related Topics</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/help/managing-data" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">Managing Data</h3>
            <p className="text-xs text-muted-foreground">Organize before exporting</p>
          </Link>
          <Link href="/about" className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
            <h3 className="font-semibold text-foreground text-sm mb-1">About Privacy</h3>
            <p className="text-xs text-muted-foreground">Learn about our privacy-first approach</p>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-border flex justify-between items-center">
        <Link href="/help/managing-data" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Managing Data
        </Link>
        <Link href="/help" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          Back to Help Center
        </Link>
      </div>
    </div>
  );
}
