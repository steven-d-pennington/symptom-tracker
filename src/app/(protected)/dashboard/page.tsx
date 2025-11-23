"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw, Flame, Pill, Activity, Zap, UtensilsCrossed, Stethoscope } from "lucide-react";
import TimelineView from "@/components/timeline/TimelineView";
import { TodayTimelineCard } from "@/components/dashboard/TodayTimelineCard";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useUxInstrumentation } from "@/lib/hooks/useUxInstrumentation";
import { cn } from "@/lib/utils/cn";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { GlassActionCard } from "@/components/dashboard/GlassActionCard";
import { InsightSnippet } from "@/components/dashboard/InsightSnippet";

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
    router.push("/flares/place?source=dashboard");
  }, [recordUxEvent, router]);

  const handleLogMedication = useCallback(() => {
    void recordUxEvent("quickAction.medication", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    router.push("/log/medication");
  }, [recordUxEvent, router]);

  const handleLogSymptom = useCallback(() => {
    void recordUxEvent("quickAction.symptom", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    router.push("/log/symptom");
  }, [recordUxEvent, router]);

  const handleLogTrigger = useCallback(() => {
    void recordUxEvent("quickAction.trigger", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    router.push("/log/trigger");
  }, [recordUxEvent, router]);

  const handleLogFood = useCallback(() => {
    void recordUxEvent("quickAction.food", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    performance.mark("food-log-button-click");
    router.push("/log/food");
  }, [router, recordUxEvent]);

  const handleLogTreatment = useCallback(() => {
    void recordUxEvent("quickAction.treatment", {
      metadata: { source: "dashboard", surface: "quickActions" },
    });
    router.push("/log/treatment");
  }, [router, recordUxEvent]);

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="relative h-screen overflow-y-auto bg-background"
    >
      {/* Pull-to-refresh indicator */}
      {isPullToRefresh && (
        <div className="absolute top-0 left-0 right-0 flex justify-center pt-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-md">
            <RefreshCw className={cn("h-5 w-5 text-primary", isRefreshing && "animate-spin")} />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <DashboardHeader />

        <div className="w-full md:w-2/3 space-y-8">
          <InsightSnippet />

          {/* Quick Actions Grid */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground/80">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <GlassActionCard
                title="Log Flare"
                icon={Flame}
                colorClass="text-orange-500"
                gradientClass="from-orange-500/10 to-orange-500/5 hover:border-orange-200"
                onClick={handleLogFlare}
              />
              <GlassActionCard
                title="Symptom"
                icon={Activity}
                colorClass="text-blue-500"
                gradientClass="from-blue-500/10 to-blue-500/5 hover:border-blue-200"
                onClick={handleLogSymptom}
              />
              <GlassActionCard
                title="Medication"
                icon={Pill}
                colorClass="text-emerald-500"
                gradientClass="from-emerald-500/10 to-emerald-500/5 hover:border-emerald-200"
                onClick={handleLogMedication}
              />
              <GlassActionCard
                title="Trigger"
                icon={Zap}
                colorClass="text-yellow-500"
                gradientClass="from-yellow-500/10 to-yellow-500/5 hover:border-yellow-200"
                onClick={handleLogTrigger}
              />
              <GlassActionCard
                title="Food"
                icon={UtensilsCrossed}
                colorClass="text-purple-500"
                gradientClass="from-purple-500/10 to-purple-500/5 hover:border-purple-200"
                onClick={handleLogFood}
              />
              <GlassActionCard
                title="Treatment"
                icon={Stethoscope}
                colorClass="text-pink-500"
                gradientClass="from-pink-500/10 to-pink-500/5 hover:border-pink-200"
                onClick={handleLogTreatment}
              />
            </div>
          </div>

          {/* Today's Timeline Module */}
          <TodayTimelineCard>
            <TimelineView key={`timeline-${refreshKey}`} />
          </TodayTimelineCard>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
