interface ExportToolsProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportPDF: () => void;
  onShare: () => void;
  onDownloadChart: (chartId: string) => void;
  canShare: boolean;
}

const CHART_EXPORT_TARGETS = [
  { id: "health-trend", label: "Health trend" },
  { id: "symptom-frequency", label: "Symptom frequency" },
  { id: "medication-adherence", label: "Medication adherence" },
  { id: "correlation", label: "Correlation insights" },
];

export const ExportTools = ({
  onExportCSV,
  onExportJSON,
  onExportPDF,
  onShare,
  onDownloadChart,
  canShare,
}: ExportToolsProps) => {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <header>
        <h3 className="text-lg font-semibold text-foreground">Export &amp; sharing</h3>
        <p className="text-xs text-muted-foreground">
          Generate summary reports for appointments or download raw data for further analysis.
        </p>
      </header>

      <div className="grid gap-3 text-sm">
        <button
          type="button"
          onClick={onExportCSV}
          className="rounded-lg border border-border px-3 py-2 text-left text-foreground hover:bg-muted"
        >
          Export CSV data
          <span className="block text-xs text-muted-foreground">Raw entries for spreadsheets</span>
        </button>
        <button
          type="button"
          onClick={onExportJSON}
          className="rounded-lg border border-border px-3 py-2 text-left text-foreground hover:bg-muted"
        >
          Download JSON archive
          <span className="block text-xs text-muted-foreground">Includes events, entries, and analytics</span>
        </button>
        <button
          type="button"
          onClick={onExportPDF}
          className="rounded-lg border border-border px-3 py-2 text-left text-foreground hover:bg-muted"
        >
          Generate printable summary
          <span className="block text-xs text-muted-foreground">Opens a print-ready report you can save as PDF</span>
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={!canShare}
          className={`rounded-lg border px-3 py-2 text-left text-foreground transition ${
            canShare ? "border-border hover:bg-muted" : "cursor-not-allowed border-border/60 text-muted-foreground"
          }`}
        >
          Share quick summary
          <span className="block text-xs text-muted-foreground">
            {canShare ? "Uses the device share sheet" : "Share API not available in this browser"}
          </span>
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <h4 className="font-medium text-foreground">Download chart images</h4>
        <div className="flex flex-wrap gap-2">
          {CHART_EXPORT_TARGETS.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => onDownloadChart(target.id)}
              className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-muted"
            >
              {target.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
