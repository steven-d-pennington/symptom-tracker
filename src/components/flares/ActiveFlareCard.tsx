"use client";

import { useRouter } from "next/navigation";
import { FRONT_BODY_REGIONS, BACK_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { formatDistanceToNow } from "@/lib/utils/dateUtils";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FlareData {
  id: string;
  bodyRegionId?: string;
  bodyRegions?: string[];
  currentSeverity?: number;
  severity?: number;
  startDate: Date | number;
  updatedAt?: Date | number;
  createdAt?: Date | number;
  trend?: "worsening" | "stable" | "improving";
}

interface ActiveFlareCardProps {
  flare: FlareData;
  onClick?: () => void;
}

/**
 * Individual flare card component for Active Flares Dashboard (Story 2.3)
 * Displays comprehensive flare information with navigation to detail page
 */
export function ActiveFlareCard({ flare, onClick }: ActiveFlareCardProps) {
  const router = useRouter();

  // Get region name from bodyRegions lookup
  const allRegions = [...FRONT_BODY_REGIONS, ...BACK_BODY_REGIONS];
  const bodyRegionId = flare.bodyRegionId || (flare.bodyRegions && flare.bodyRegions[0]) || "";
  const region = allRegions.find((r) => r.id === bodyRegionId);
  const regionName = region?.name || bodyRegionId;

  // Calculate days active from startDate to current date
  const startTime = flare.startDate instanceof Date ? flare.startDate.getTime() : flare.startDate;
  const daysActive = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24)) + 1;

  // Get severity value
  const severity = flare.currentSeverity || flare.severity || 0;

  // Determine severity color (AC2.3.2: red 9-10, orange 7-8, yellow 4-6, green 1-3)
  const getSeverityColor = (sev: number): string => {
    if (sev >= 9) return "bg-red-500";
    if (sev >= 7) return "bg-orange-500";
    if (sev >= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Determine trend arrow (AC2.3.2: ↑ worsening, → stable, ↓ improving, or "--")
  const getTrendArrow = (trend?: "improving" | "stable" | "worsening") => {
    if (!trend) return "--";
    if (trend === "improving") return <ArrowDown className="w-4 h-4" aria-label="Improving" />;
    if (trend === "worsening") return <ArrowUp className="w-4 h-4" aria-label="Worsening" />;
    return <ArrowRight className="w-4 h-4" aria-label="Stable" />;
  };

  const getTrendColor = (trend?: "improving" | "stable" | "worsening"): string => {
    if (!trend) return "text-gray-500";
    if (trend === "improving") return "text-green-600";
    if (trend === "worsening") return "text-red-600";
    return "text-yellow-600";
  };

  // Format last updated timestamp in relative format (AC2.3.2: "Updated 2 hours ago")
  const updatedTime = flare.updatedAt instanceof Date
    ? flare.updatedAt
    : flare.updatedAt
      ? new Date(flare.updatedAt)
      : flare.createdAt instanceof Date
        ? flare.createdAt
        : new Date(flare.createdAt || Date.now());
  const lastUpdated = formatDistanceToNow(updatedTime);

  // Handle navigation to detail page (AC2.3.4)
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    router.push(`/body-map/${flare.id}`);
  };

  // Handle keyboard navigation (AC2.3.4: Enter key triggers navigation)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "p-4 border rounded-lg cursor-pointer transition-all",
        "hover:bg-gray-50 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      )}
      aria-label={`Flare at ${regionName}, severity ${flare.currentSeverity}, ${daysActive} days active`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Region and severity */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              getSeverityColor(severity),
              "text-white px-3 py-1 rounded-full font-bold text-sm"
            )}
            aria-label={`Severity ${severity} out of 10`}
          >
            {severity}
          </div>
          <div>
            <div className="font-medium text-foreground">{regionName}</div>
            <div className="text-sm text-muted-foreground">
              {daysActive} day{daysActive !== 1 ? "s" : ""} active
            </div>
          </div>
        </div>

        {/* Right: Trend and last updated */}
        <div className="text-right">
          <div className={cn("text-2xl flex justify-end", getTrendColor(flare.trend))}>
            {getTrendArrow(flare.trend)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Updated {lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
}