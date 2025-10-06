"use client";

import { ActiveFlare } from "@/lib/types/flare";
import { flareRepository } from "@/lib/repositories/flareRepository";

interface FlareCardProps {
  flare: ActiveFlare;
  onUpdate: () => void;
}

export function FlareCard({ flare, onUpdate }: FlareCardProps) {
  const duration = Math.floor(
    (new Date().getTime() - new Date(flare.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const statusColors = {
    active: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    improving: "bg-green-500/10 text-green-700 border-green-500/20",
    worsening: "bg-red-500/10 text-red-700 border-red-500/20",
    resolved: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  };

  const handleStatusChange = async (newStatus: ActiveFlare["status"]) => {
    try {
      await flareRepository.update(flare.id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error("Failed to update flare status:", error);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{flare.symptomName}</h3>
          <p className="text-xs text-muted-foreground">{duration} days active</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusColors[flare.status]}`}>
          {flare.status}
        </span>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Severity</span>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${i < flare.severity ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>

        {flare.bodyRegions.length > 0 && (
          <div className="text-sm">
            <span className="text-muted-foreground">Regions: </span>
            <span className="text-foreground">{flare.bodyRegions.join(", ")}</span>
          </div>
        )}
      </div>

      {flare.notes && (
        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{flare.notes}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleStatusChange("improving")}
          disabled={flare.status === "improving"}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-green-500/10 disabled:opacity-50"
        >
          Improving
        </button>
        <button
          onClick={() => handleStatusChange("worsening")}
          disabled={flare.status === "worsening"}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          Worsening
        </button>
        <button
          onClick={() => handleStatusChange("resolved")}
          className="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-blue-500/10"
        >
          Resolve
        </button>
      </div>
    </div>
  );
}
