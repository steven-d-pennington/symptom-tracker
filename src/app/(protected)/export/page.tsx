import { Download, FileJson, FileText, Database } from "lucide-react";

export default function ExportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Export Data</h1>
        <p className="mt-2 text-muted-foreground">
          Download your health data in various formats
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-700">
              <FileJson className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                JSON Export
              </h3>
              <p className="text-sm text-muted-foreground">
                Export all your data in JSON format for backup or analysis
              </p>
            </div>
          </div>
          <button
            disabled
            className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium opacity-50 cursor-not-allowed"
          >
            Export as JSON (Coming Soon)
          </button>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-700">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">CSV Export</h3>
              <p className="text-sm text-muted-foreground">
                Export daily entries and symptoms as CSV for spreadsheet analysis
              </p>
            </div>
          </div>
          <button
            disabled
            className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium opacity-50 cursor-not-allowed"
          >
            Export as CSV (Coming Soon)
          </button>
        </div>

        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-700">
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Full Database Backup
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a complete backup of your local database including photos
              </p>
            </div>
          </div>
          <button
            disabled
            className="w-full px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium opacity-50 cursor-not-allowed"
          >
            Backup Database (Coming Soon)
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Privacy First</p>
            <p>
              All exports are generated locally on your device. Your data never
              leaves your browser unless you explicitly share the exported files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
