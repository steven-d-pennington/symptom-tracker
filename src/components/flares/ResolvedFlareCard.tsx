"use client";

import { useEffect, useState } from "react";
import { FlareRecord } from "@/lib/db/schema";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { FRONT_BODY_REGIONS, BACK_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { formatDistanceToNow } from "@/lib/utils/dateUtils";
import { cn } from "@/lib/utils/cn";

interface ResolvedFlareCardProps {
  flare: FlareRecord;
  userId: string;
  onFlareClick: (flareId: string) => void;
}

/**
 * Individual resolved flare card component for Resolved Flares Archive (Story 2.8)
 * Displays comprehensive resolved flare information with navigation to read-only detail page
 * AC2.8.2: Shows body region, resolution date, duration badge, peak severity badge
 */
export function ResolvedFlareCard({ flare, userId, onFlareClick }: ResolvedFlareCardProps) {
  const [peakSeverity, setPeakSeverity] = useState<number | null>(null);

  // Calculate duration in days (AC2.8.2: total duration = endDate - startDate)
  const durationMs = (flare.endDate || Date.now()) - flare.startDate;
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));

  // Fetch flare history to compute peak severity (AC2.8.2)
  useEffect(() => {
    const fetchPeakSeverity = async () => {
      try {
        const history = await flareRepository.getFlareHistory(userId, flare.id);
        const severities = history
          .map(e => e.severity)
          .filter((s): s is number => s != null);
        const peak = severities.length > 0
          ? Math.max(...severities)
          : flare.currentSeverity;
        setPeakSeverity(peak);
      } catch (error) {
        console.error("Failed to fetch flare history:", error);
        // Fallback to current severity
        setPeakSeverity(flare.currentSeverity);
      }
    };
    fetchPeakSeverity();
  }, [flare.id, userId, flare.currentSeverity]);

  // Lookup body region name from bodyRegions data (AC2.8.2)
  const allRegions = [...FRONT_BODY_REGIONS, ...BACK_BODY_REGIONS];
  const region = allRegions.find(r => r.id === flare.bodyRegionId);
  const regionName = region?.name || flare.bodyRegionId;

  // Format resolution date (AC2.8.2: relative time with full date on hover)
  const resolutionDate = new Date(flare.endDate || Date.now());
  const relativeDate = formatDistanceToNow(resolutionDate);
  const fullDate = resolutionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Duration badge color (AC2.8.2: < 7 days: green, 7-14: yellow, > 14: orange)
  const getDurationColor = (days: number): string => {
    if (days < 7) return 'bg-green-100 text-green-800';
    if (days <= 14) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  // Peak severity badge color (AC2.8.2: 1-10 color scale)
  const getSeverityColor = (severity: number): string => {
    if (severity <= 3) return 'bg-green-100 text-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
    if (severity <= 8) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Handle click navigation (AC2.8.4)
  const handleClick = () => {
    onFlareClick(flare.id);
  };

  // Handle keyboard navigation (AC2.8.4: Enter key triggers navigation)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
        "p-4 border rounded-lg cursor-pointer transition-all min-h-[44px] bg-white",
        "hover:bg-gray-50 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      )}
      aria-label={`View resolved flare in ${regionName}, resolved ${relativeDate}, duration ${durationDays} days, peak severity ${peakSeverity ?? 'unknown'}`}
    >
      {/* Gray indicator matching resolved marker color from Story 1.5 (AC2.8.2) */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-gray-400" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-foreground">{regionName}</h3>
      </div>

      {/* Resolution date with full date on hover (AC2.8.2) */}
      <div className="text-sm text-muted-foreground mb-3" title={fullDate}>
        Resolved {relativeDate}
      </div>

      {/* Badges (AC2.8.2: duration and peak severity) */}
      <div className="flex gap-2 flex-wrap">
        {/* Duration badge with color coding */}
        <span className={cn('text-xs px-2 py-1 rounded font-medium', getDurationColor(durationDays))}>
          {durationDays} {durationDays === 1 ? 'day' : 'days'}
        </span>

        {/* Peak severity badge */}
        {peakSeverity != null && (
          <span className={cn('text-xs px-2 py-1 rounded font-medium', getSeverityColor(peakSeverity))}>
            Peak: {peakSeverity}/10
          </span>
        )}
      </div>
    </div>
  );
}
