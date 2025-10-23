"use client";

import { useState, useEffect } from "react";
import { useFlares } from "@/lib/hooks/useFlares";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { ActiveFlareCard } from "@/components/flares/ActiveFlareCard";
import { ActiveFlaresEmptyState } from "@/components/flares/ActiveFlaresEmptyState";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SortType = "severity" | "recent";

/**
 * Active Flares Dashboard (Story 2.3)
 * Displays list of all active flares with sorting, navigation, and empty state
 */
export default function ActiveFlaresPage() {
  const { userId } = useCurrentUser();
  const { data: flares = [], isLoading, error, refetch } = useFlares({
    userId: userId || "",
    status: "active",
  });
  const [sortBy, setSortBy] = useState<SortType>("severity");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AC2.3.3: Load sort preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("flares-list-sort");
    if (saved === "severity" || saved === "recent") {
      setSortBy(saved);
    }
  }, []);

  // AC2.3.3: Save sort preference to localStorage on change
  const handleSortChange = (newSort: SortType) => {
    setSortBy(newSort);
    localStorage.setItem("flares-list-sort", newSort);
  };

  // AC2.3.3: Sort flares based on preference
  const sortedFlares = [...flares].sort((a, b) => {
    if (sortBy === "severity") {
      // Sort by severity descending (highest first)
      return b.severity - a.severity;
    } else {
      // Sort by updatedAt descending (most recent first)
      const aTime = a.startDate instanceof Date ? a.startDate.getTime() : a.startDate;
      const bTime = b.startDate instanceof Date ? b.startDate.getTime() : b.startDate;
      return bTime - aTime;
    }
  });

  // AC2.3.6: Pull-to-refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // AC2.3.6: Pull-to-refresh touch event handlers (simplified implementation)
  useEffect(() => {
    let startY = 0;
    let pulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        if (diff > 100) {
          pulling = true;
        }
      }
    };

    const handleTouchEnd = () => {
      if (pulling) {
        handleRefresh();
        pulling = false;
      }
    };

    // Only add touch listeners on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, []);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Error loading flares</p>
          <p className="text-sm mt-1">Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* AC2.3.7: Header with flare count badge */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Active Flares
          {flares.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-3 py-1 text-sm font-medium bg-red-500 text-white rounded-full">
              {flares.length}
            </span>
          )}
        </h1>

        {/* AC2.3.3: Sort toggle button */}
        {flares.length > 0 && (
          <button
            onClick={() => handleSortChange(sortBy === "severity" ? "recent" : "severity")}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              "border border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
            aria-label={`Currently sorting by ${sortBy === "severity" ? "severity" : "recent updates"}. Click to switch.`}
          >
            <ArrowUpDown className="w-4 h-4" />
            Sort by: {sortBy === "severity" ? "Severity" : "Recent"}
          </button>
        )}
      </div>

      {/* Pull-to-refresh indicator */}
      {isRefreshing && (
        <div className="mb-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground mt-2">Refreshing...</p>
        </div>
      )}

      {/* AC2.3.5: Empty state when no active flares */}
      {sortedFlares.length === 0 && <ActiveFlaresEmptyState />}

      {/* AC2.3.1, AC2.3.2, AC2.3.4: Flares list */}
      {sortedFlares.length > 0 && (
        <div className="space-y-4">
          {sortedFlares.map((flare) => (
            <ActiveFlareCard key={flare.id} flare={flare} />
          ))}
        </div>
      )}
    </div>
  );
}