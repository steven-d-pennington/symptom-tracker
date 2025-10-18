"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Chart } from "chart.js";
import { CalendarEntry, CalendarMetrics, TimelineEvent } from "@/lib/types/calendar";

interface UseCalendarExportOptions {
  entries: CalendarEntry[];
  events: TimelineEvent[];
  metrics: CalendarMetrics;
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const createSummaryText = (entries: CalendarEntry[], events: TimelineEvent[]) => {
  const entryCount = entries.length;
  const symptomDays = entries.filter((entry) => entry.symptomCount > 0).length;
  const medicationEvents = events.filter((event) => event.type === "medication").length;

  return [
    `Entries reviewed: ${entryCount}`,
    `Days with symptoms: ${symptomDays}`,
    `Medication events recorded: ${medicationEvents}`,
  ].join("\n");
};

export const useCalendarExport = ({ entries, events, metrics }: UseCalendarExportOptions) => {
  const chartRegistry = useRef(new Map<string, Chart | null>());

  const registerChart = useCallback((id: string, chart: Chart | null) => {
    chartRegistry.current.set(id, chart);
    if (!chart) {
      chartRegistry.current.delete(id);
    }
  }, []);

  const exportCSV = useCallback(() => {
    const header = [
      "date",
      "overallHealth",
      "symptomCount",
      "medicationCount",
      "triggerCount",
      "mood",
    ].join(",");

    const rows = entries.map((entry) =>
      [
        entry.date,
        entry.overallHealth ?? "",
        entry.symptomCount,
        entry.medicationCount,
        entry.triggerCount,
        entry.mood ?? "",
      ].join(","),
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    downloadBlob(blob, `symptom-tracker-${new Date().toISOString().slice(0, 10)}.csv`);
  }, [entries]);

  const exportJSON = useCallback(() => {
    const payload = {
      generatedAt: new Date().toISOString(),
      entries,
      events,
      metrics,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    downloadBlob(blob, `symptom-tracker-${Date.now()}.json`);
  }, [entries, events, metrics]);

  const exportPDF = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const summary = createSummaryText(entries, events)
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("");

    const html = `<!doctype html><html><head><title>Health Summary</title></head><body><h1>Symptom Tracker Summary</h1>${summary}</body></html>`;
    const reportWindow = window.open("", "_blank", "noopener,noreferrer");
    if (reportWindow) {
      reportWindow.document.write(html);
      reportWindow.document.close();
      reportWindow.focus();
      reportWindow.print();
    }
  }, [entries, events]);

  const shareSummary = useCallback(async () => {
    if (typeof navigator === "undefined") {
      return;
    }

    const text = createSummaryText(entries, events);

    if ("share" in navigator) {
      try {
        await navigator.share({
          title: "Pocket Symptom Tracker",
          text,
        });
        return;
      } catch (error) {
        console.error("Share was interrupted", error);
      }
    }

    if ("clipboard" in navigator) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error("Failed to copy summary to clipboard", error);
      }
    }
  }, [entries, events]);

  const exportChartImage = useCallback((chartId: string) => {
    const chart = chartRegistry.current.get(chartId);
    if (!chart) {
      return;
    }

    const url = chart.toBase64Image();
    const link = document.createElement("a");
    link.href = url;
    link.download = `${chartId}.png`;
    link.click();
  }, []);

  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  return {
    exportCSV,
    exportJSON,
    exportPDF,
    shareSummary,
    exportChartImage,
    registerChart,
    canShare,
  };
};
