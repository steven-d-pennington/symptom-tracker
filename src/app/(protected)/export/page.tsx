"use client";

import { Download, FileJson, FileText, Upload } from "lucide-react";
import { ExportDialog } from "@/components/data-management/ExportDialog";
import { ImportDialog } from "@/components/data-management/ImportDialog";

export default function ExportPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
        <p className="mt-2 text-muted-foreground">
          Export, import, and backup your health data
        </p>
      </div>

      {/* Profile Transfer Info */}
      <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Transfer Between Browsers or Devices
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Use Export and Import to transfer your data between different browsers, browser profiles, or devices. 
          Your data stays private - everything happens locally on your device.
        </p>
      </div>

      <div className="space-y-6">
        {/* Export Section */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Export Your Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Download your symptom tracking data in JSON or CSV format for backup, 
                transfer to another browser/device, or external analysis.
              </p>
            </div>
          </div>
          <ExportDialog />
        </div>

        {/* Import Section */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
              <Upload className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Import Data
              </h3>
              <p className="text-sm text-muted-foreground">
                Restore from a backup or transfer data from another browser/device. 
                Supports JSON files exported from this app.
              </p>
            </div>
          </div>
          <ImportDialog />
        </div>

        {/* CSV Export Info */}
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                CSV Export Available
              </h3>
              <p className="text-sm text-muted-foreground">
                When you click "Export Data" above, you can choose CSV format for 
                analyzing your data in spreadsheet applications like Excel or Google Sheets.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-lg bg-muted/50">
        <div className="flex items-start gap-3">
          <FileJson className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Privacy First</p>
            <p>
              All exports and imports are processed locally on your device. Your data never
              leaves your browser unless you explicitly share the exported files.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
