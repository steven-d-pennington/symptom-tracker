"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw, Download } from "lucide-react";
import { QuickLogButtons } from "@/components/quick-log/QuickLogButtons";
import { FlareCreationModal } from "@/components/flares/FlareCreationModal";
// Story 3.5.5: MedicationLogModal deprecated, medication logging now uses dedicated page at /log/medication
// Story 3.5.3: SymptomLogModal deprecated, symptom logging now uses dedicated page at /log/symptom
// Story 3.5.4: FoodLogModal deprecated, food logging now uses dedicated page at /log/food
// Story 3.5.5: TriggerLogModal deprecated, trigger logging now uses dedicated page at /log/trigger
import TimelineView from "@/components/timeline/TimelineView";
import { TodayQuickActionsCard } from "@/components/dashboard/TodayQuickActionsCard";
import { TodayTimelineCard } from "@/components/dashboard/TodayTimelineCard";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useUxInstrumentation } from "@/lib/hooks/useUxInstrumentation";
import { cn } from "@/lib/utils/cn";
import { db } from "@/lib/db/client";

function DashboardContent() {
  const { userId } = useCurrentUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordUxEvent } = useUxInstrumentation();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullToRefresh, setIsPullToRefresh] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // DEBUG: Export timeline data to JSON
  const handleExportDebugData = useCallback(async () => {
    if (!userId) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.getTime();
      const endOfDay = new Date(today).setHours(23, 59, 59, 999);

      const [symptoms, triggers, medications, flares, foods] = await Promise.all([
        db.symptomInstances.where("userId").equals(userId).toArray(),
        db.triggerEvents.where("userId").equals(userId).toArray(),
        db.medicationEvents.where("userId").equals(userId).toArray(),
        db.flares.where("userId").equals(userId).toArray(),
        db.foodEvents.where("userId").equals(userId).toArray(),
      ]);

      const debugData = {
        exportedAt: new Date().toISOString(),
        userId,
        todayRange: {
          startOfDay: new Date(startOfDay).toISOString(),
          startMs: startOfDay,
          endOfDay: new Date(endOfDay).toISOString(),
          endMs: endOfDay,
        },
        counts: {
          symptoms: symptoms.length,
          triggers: triggers.length,
          medications: medications.length,
          flares: flares.length,
          foods: foods.length,
        },
        symptoms: symptoms.map(s => ({
          id: s.id,
          name: s.name,
          severity: s.severity,
          timestamp: s.timestamp,
          timestampISO: new Date(s.timestamp).toISOString(),
          timestampMs: s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime(),
          isToday: (s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime()) >= startOfDay && (s.timestamp instanceof Date ? s.timestamp.getTime() : new Date(s.timestamp).getTime()) <= endOfDay,
        })),
        triggers: triggers.map(t => ({
          id: t.id,
          triggerId: t.triggerId,
          intensity: t.intensity,
          timestamp: t.timestamp,
          timestampISO: new Date(t.timestamp).toISOString(),
          timestampMs: t.timestamp,
          isToday: t.timestamp >= startOfDay && t.timestamp <= endOfDay,
        })),
        medications: medications.map(m => ({
          id: m.id,
          medicationId: m.medicationId,
          taken: m.taken,
          timestamp: m.timestamp,
          timestampISO: new Date(m.timestamp).toISOString(),
          timestampMs: m.timestamp,
          isToday: m.timestamp >= startOfDay && m.timestamp <= endOfDay,
        })),
      };

      const json = JSON.stringify(debugData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeline-debug-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      console.log("🔍 DEBUG DATA EXPORTED:", debugData);
    } catch (error) {
      console.error("Failed to export debug data:", error);
    }
  }, [userId]);

  // Route-based modal state derived from search params
  const quickAction = searchParams?.get("quickAction");
  const refreshFlag = searchParams?.get("refresh");

  // Auto-refresh timeline when returning from logging pages (Story 3.5.3, 3.5.4)
  useEffect(() => {
    if (refreshFlag) {
      setRefreshKey(prev => prev + 1);
      // Clear the refresh flag from URL
      router.replace("/dashboard");
    }
  }, [refreshFlag, router]);

  // Scroll to timeline item if eventId is in URL params
  useEffect(() => {
    const eventId = searchParams?.get("eventId");
    if (eventId) {
      // Small delay to ensure timeline is rendered
      setTimeout(() => {
        const element = document.getElementById(`timeline-event-${eventId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          // Temporarily highlight the element
          element.classList.add("bg-yellow-200", "dark:bg-yellow-900");
          setTimeout(() => {
            element.classList.remove("bg-yellow-200", "dark:bg-yellow-900");
          }, 2000);
        }
      }, 500);
    }
  }, [searchParams]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    // Simulate minimum refresh time for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
    setIsPullToRefresh(false);
  }, []);

  // Pull-to-refresh handling (mobile) - Story 3.5.14
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only start tracking if we're at the very top of the container
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        touchStartY.current = startY;
        isPulling = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Ignore if we're not at the top
      if (container.scrollTop > 0) {
        isPulling = false;
        return;
      }

      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      // Only trigger pull-to-refresh for downward swipes (positive diff)
      // and only if diff is significant (> 80px) to avoid false positives
      if (diff > 80 && !isRefreshing && !isPulling) {
        isPulling = true;
        setIsPullToRefresh(true);
        // Prevent default to avoid scroll bounce on iOS
        e.preventDefault();
      } else if (diff < 0) {
        // User is scrolling up, not pulling down - allow normal scroll
        isPulling = false;
      }
    };

    const handleTouchEnd = () => {
      if (isPullToRefresh && !isRefreshing && isPulling) {
        handleRefresh();
      }
      isPulling = false;
      setIsPullToRefresh(false);
    };

    // Use passive: false to allow preventDefault() for pull gesture
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPullToRefresh, isRefreshing, handleRefresh]);

  // Quick log handlers - route-based navigation
  const handleLogFlare = useCallback(() => {
    void recordUxEvent("quickAction.flare", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    router.push("/dashboard?quickAction=flare");
  }, [recordUxEvent, router]);

  const handleLogMedication = useCallback(() => {
    void recordUxEvent("quickAction.medication", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    // Story 3.5.5: Navigate to dedicated medication logging page
    router.push("/log/medication");
  }, [recordUxEvent, router]);

  const handleLogSymptom = useCallback(() => {
    void recordUxEvent("quickAction.symptom", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    // Story 3.5.3: Navigate to dedicated symptom logging page
    router.push("/log/symptom");
  }, [recordUxEvent, router]);

  const handleLogTrigger = useCallback(() => {
    void recordUxEvent("quickAction.trigger", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    // Story 3.5.5: Navigate to dedicated trigger logging page
    router.push("/log/trigger");
  }, [recordUxEvent, router]);

  const handleLogFood = useCallback(() => {
    // Story 3.5.4: Food logging now uses dedicated page at /log/food
    void recordUxEvent("quickAction.food", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    performance.mark("food-log-button-click");
    router.push("/log/food");
  }, [router, recordUxEvent]);

  // Close modal by navigating back to dashboard
  const handleCloseQuickAction = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Handle logged events
  const handleEventLogged = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    router.push("/dashboard");
  }, [router]);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="relative h-screen overflow-y-auto"
    >
      {/* Pull-to-refresh indicator */}
      {isPullToRefresh && (
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-2">
            <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header with refresh button (desktop) */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Your health overview for today
            </p>
          </div>
          <div className="flex gap-2">
            {/* DEBUG: Export data button */}
            <button
              onClick={handleExportDebugData}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-orange-600 text-white hover:bg-orange-700",
                "transition-colors"
              )}
              aria-label="Export debug data"
              title="Export timeline data for debugging"
            >
              <Download className="h-4 w-4" />
              <span>Export Debug</span>
            </button>
            {/* Desktop refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                "hidden md:flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              aria-label="Refresh dashboard"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Module */}
        <TodayQuickActionsCard>
          <QuickLogButtons
            onLogFlare={handleLogFlare}
            onLogMedication={handleLogMedication}
            onLogSymptom={handleLogSymptom}
            onLogTrigger={handleLogTrigger}
            onLogFood={handleLogFood}
            instrumentationContext="dashboard.quickActions"
            disableInstrumentation
          />
        </TodayQuickActionsCard>

        {/* Today's Timeline Module */}
        <TodayTimelineCard>
          <TimelineView key={`timeline-${refreshKey}`} />
        </TodayTimelineCard>
      </div>

      {/* Route-based Quick Action Modals */}
      {userId && quickAction === "flare" && (
        <FlareCreationModal
          isOpen={true}
          onClose={handleCloseQuickAction}
          userId={userId}
          selection={null}
          onCreated={() => {
            // Refresh the dashboard after flare creation
            setRefreshKey(prev => prev + 1);
            router.push("/dashboard");
          }}
        />
      )}

      {/* Story 3.5.5: Medication logging moved to dedicated page at /log/medication */}
      {/* Story 3.5.3: Symptom logging moved to dedicated page at /log/symptom */}
      {/* Story 3.5.5: Trigger logging moved to dedicated page at /log/trigger */}
      {/* Story 3.5.4: Food Log Modal removed - food logging now uses dedicated page at /log/food */}
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
