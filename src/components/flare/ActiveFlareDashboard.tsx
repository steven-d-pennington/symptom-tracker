"use client";

import { useEffect, useState } from "react";
import { ActiveFlare, FlareStats } from "@/lib/types/flare";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { FlareCard } from "./FlareCard";
import { FlareStats as FlareStatsComponent } from "./FlareStats";
import { NewFlareDialog } from "./NewFlareDialog";

interface ActiveFlareDashboardProps {
  userId: string;
}

export function ActiveFlareDashboard({ userId }: ActiveFlareDashboardProps) {
  const [activeFlares, setActiveFlares] = useState<ActiveFlare[]>([]);
  const [stats, setStats] = useState<FlareStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewFlareDialog, setShowNewFlareDialog] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "improving" | "worsening">("all");

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    try {
      setIsLoading(true);
      const flares = await flareRepository.getActiveFlares(userId);
      const flareStats = await flareRepository.getStats(userId);

      setActiveFlares(flares);
      setStats(flareStats);
    } catch (error) {
      console.error("Failed to load flares:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredFlares = activeFlares.filter((flare) => {
    if (filter === "all") return true;
    return flare.status === filter;
  });

  const handleFlareCreated = () => {
    setShowNewFlareDialog(false);
    loadData();
  };

  const handleFlareUpdated = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Active Flare Dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and manage your active symptom flares
          </p>
        </div>
        <button
          onClick={() => setShowNewFlareDialog(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flare
        </button>
      </div>

      {/* Stats */}
      {stats && <FlareStatsComponent stats={stats} />}

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-border">
        {[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "improving", label: "Improving" },
          { value: "worsening", label: "Worsening" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.value !== "all" && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {activeFlares.filter((f) => f.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Flare list */}
      {filteredFlares.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center">
          <svg
            className="mb-4 h-16 w-16 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No active flares</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {filter === "all"
              ? "Start tracking a flare to monitor its progression"
              : `No flares with status "${filter}"`}
          </p>
          <button
            onClick={() => setShowNewFlareDialog(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Track New Flare
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlares.map((flare) => (
            <FlareCard key={flare.id} flare={flare} onUpdate={handleFlareUpdated} />
          ))}
        </div>
      )}

      {/* New flare dialog */}
      {showNewFlareDialog && (
        <NewFlareDialog
          userId={userId}
          onClose={() => setShowNewFlareDialog(false)}
          onCreated={handleFlareCreated}
        />
      )}
    </div>
  );
}
