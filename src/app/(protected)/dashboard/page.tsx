"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { QuickLogButtons } from "@/components/quick-log/QuickLogButtons";
import { FlareCreationModal } from "@/components/flares/FlareCreationModal";
import { MedicationLogModal } from "@/components/medications/MedicationLogModal";
// Story 3.5.3: SymptomLogModal deprecated, symptom logging now uses dedicated page at /log/symptom
// Story 3.5.4: FoodLogModal deprecated, food logging now uses dedicated page at /log/food
import { TriggerLogModal } from "@/components/triggers/TriggerLogModal";
import TimelineView from "@/components/timeline/TimelineView";
import { TodayQuickActionsCard } from "@/components/dashboard/TodayQuickActionsCard";
import { TodayTimelineCard } from "@/components/dashboard/TodayTimelineCard";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useUxInstrumentation } from "@/lib/hooks/useUxInstrumentation";
import { cn } from "@/lib/utils/cn";

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

  // Pull-to-refresh handling (mobile)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let startY = 0;
    let currentY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY = e.touches[0].clientY;
        touchStartY.current = startY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop > 0) return;

      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 80 && !isRefreshing) {
        setIsPullToRefresh(true);
      }
    };

    const handleTouchEnd = () => {
      if (isPullToRefresh && !isRefreshing) {
        handleRefresh();
      }
      setIsPullToRefresh(false);
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);
    container.addEventListener("touchend", handleTouchEnd);

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
    router.push("/dashboard?quickAction=medication");
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
    router.push("/dashboard?quickAction=trigger");
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

      {userId && quickAction === "medication" && (
        <MedicationLogModal
          isOpen={true}
          onClose={handleCloseQuickAction}
          onLogged={handleEventLogged}
          userId={userId}
        />
      )}

      {/* Story 3.5.3: Symptom logging moved to dedicated page at /log/symptom */}

      {userId && quickAction === "trigger" && (
        <TriggerLogModal
          isOpen={true}
          onClose={handleCloseQuickAction}
          onLogged={handleEventLogged}
          userId={userId}
        />
      )}

      {/* Story 3.5.4: Food Log Modal removed - food logging now uses dedicated page at /log/food */}
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
