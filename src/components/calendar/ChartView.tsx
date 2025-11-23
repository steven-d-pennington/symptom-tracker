"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  Legend as ChartLegend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { CalendarMetrics } from "@/lib/types/calendar";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  ChartLegend,
  Filler,
);

interface ChartViewProps {
  metrics: CalendarMetrics;
  onRegisterChart: (id: string, chart: ChartJS | null) => void;
  variant?: "full" | "health-only";
}

export const ChartView = ({ metrics, onRegisterChart, variant = "full" }: ChartViewProps) => {
  const healthChartRef = useRef<ChartJS | null>(null);
  const symptomChartRef = useRef<ChartJS | null>(null);
  const medicationChartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    onRegisterChart("health-trend", healthChartRef.current);
    if (variant === "health-only") {
      onRegisterChart("symptom-frequency", null);
      onRegisterChart("medication-adherence", null);
    } else {
      onRegisterChart("symptom-frequency", symptomChartRef.current);
      onRegisterChart("medication-adherence", medicationChartRef.current);
    }
    return () => {
      onRegisterChart("health-trend", null);
      onRegisterChart("symptom-frequency", null);
      onRegisterChart("medication-adherence", null);
    };
  }, [metrics, onRegisterChart, variant]);

  const healthTrendData = useMemo(
    () => ({
      labels: metrics.healthTrend.map((point) => point.date.slice(5)),
      datasets: [
        {
          label: "Avg severity",
          data: metrics.healthTrend.map((point) => point.score),
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14,165,233,0.25)",
          fill: true,
          tension: 0.35,
        },
      ],
    }),
    [metrics.healthTrend],
  );

  const symptomFrequencyData = useMemo(
    () => ({
      labels: metrics.symptomFrequency.map((item) => item.name),
      datasets: [
        {
          label: "Occurrences",
          data: metrics.symptomFrequency.map((item) => item.count),
          backgroundColor: "rgba(244,114,182,0.5)",
          borderColor: "rgb(244,114,182)",
          borderWidth: 1,
        },
      ],
    }),
    [metrics.symptomFrequency],
  );

  const medicationAdherenceData = useMemo(
    () => ({
      labels: metrics.medicationAdherence.map((item) => item.name),
      datasets: [
        {
          label: "Taken",
          data: metrics.medicationAdherence.map((item) => item.taken),
          backgroundColor: "rgba(16,185,129,0.6)",
          borderColor: "rgb(16,185,129)",
          stack: "adherence",
        },
        {
          label: "Missed",
          data: metrics.medicationAdherence.map((item) => item.missed),
          backgroundColor: "rgba(248,113,113,0.6)",
          borderColor: "rgb(248,113,113)",
          stack: "adherence",
        },
      ],
    }),
    [metrics.medicationAdherence],
  );

  const emptyState = variant === "health-only"
    ? metrics.healthTrend.length === 0
    : metrics.healthTrend.length === 0 &&
    metrics.symptomFrequency.length === 0 &&
    metrics.medicationAdherence.length === 0;

  if (emptyState) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Chart visualizations will help highlight correlations once analytics are available.
      </section>
    );
  }

  if (variant === "health-only") {
    return (
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Health trend</h3>
        <Line
          ref={(instance) => {
            healthChartRef.current = instance ?? null;
          }}
          data={healthTrendData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" as const },
              tooltip: { mode: "index" as const, intersect: false },
            },
            scales: {
              y: { suggestedMin: 0, suggestedMax: 10 },
            },
          }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="text-base font-semibold text-foreground">Symptom severity trend</h3>
        <Line
          ref={(instance) => {
            healthChartRef.current = instance ?? null;
          }}
          data={healthTrendData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" as const },
              tooltip: { mode: "index" as const, intersect: false },
            },
            scales: {
              y: { suggestedMin: 0, suggestedMax: 10 },
            },
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">Symptom frequency</h3>
          <Bar
            ref={(instance) => {
              symptomChartRef.current = instance ?? null;
            }}
            data={symptomFrequencyData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">Medication adherence</h3>
          <Bar
            ref={(instance) => {
              medicationChartRef.current = instance ?? null;
            }}
            data={medicationAdherenceData}
            options={{
              responsive: true,
              scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
              },
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h3 className="text-base font-semibold text-foreground">Symptom distribution</h3>
          <Doughnut
            data={{
              labels: metrics.symptomFrequency.map((item) => item.name),
              datasets: [
                {
                  data: metrics.symptomFrequency.map((item) => item.count || 1),
                  backgroundColor: [
                    "rgba(244,114,182,0.7)",
                    "rgba(56,189,248,0.7)",
                    "rgba(249,115,22,0.7)",
                    "rgba(129,140,248,0.7)",
                    "rgba(16,185,129,0.7)",
                  ],
                  borderWidth: 0,
                },
              ],
            }}
            options={{ responsive: true }}
          />
        </div>
      </div>
    </section>
  );
};
