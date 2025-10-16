"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { ActiveFlareCards } from "@/components/flares/ActiveFlareCards";
import { QuickLogButtons } from "@/components/quick-log/QuickLogButtons";
import { FlareCreationModal } from "@/components/flares/FlareCreationModal";
import { MedicationLogModal } from "@/components/medications/MedicationLogModal";
import { SymptomLogModal } from "@/components/symptoms/SymptomLogModal";
import { TriggerLogModal } from "@/components/triggers/TriggerLogModal";
import { FoodLogModal } from "@/components/food/FoodLogModal";
import TimelineView from "@/components/timeline/TimelineView";
import { FoodProvider, useFoodContext } from "@/contexts/FoodContext";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { cn } from "@/lib/utils/cn";

function DashboardContent() {
  const { userId } = useCurrentUser();
  const searchParams = useSearchParams();
  const { openFoodLog } = useFoodContext();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPullToRefresh, setIsPullToRefresh] = useState(false);
  const [isFlareCreationModalOpen, setIsFlareCreationModalOpen] = useState(false);
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Quick log handlers
  const handleLogFlare = () => {
    setIsFlareCreationModalOpen(true);
  };

  const handleFlareCreate = async (flareData: {
    bodyRegionId: string;
    severity: number;
    notes?: string;
  }) => {
    if (!userId) return;

    await flareRepository.create({
      userId,
      symptomId: "custom",
      symptomName: "Flare",
      startDate: new Date(),
      severity: flareData.severity,
      bodyRegions: [flareData.bodyRegionId],
      status: "active",
      interventions: [],
      notes: flareData.notes || "",
      photoIds: [],
    });

    // Refresh the dashboard to show the new flare
    setRefreshKey(prev => prev + 1);
    setIsFlareCreationModalOpen(false);
  };

  const handleLogMedication = () => {
    setIsMedicationModalOpen(true);
  };

  const handleMedicationLogged = () => {
    // Refresh the dashboard to show the new medication event
    setRefreshKey(prev => prev + 1);
    setIsMedicationModalOpen(false);
  };

  const handleLogSymptom = () => {
    setIsSymptomModalOpen(true);
  };

  const handleSymptomLogged = () => {
    // Refresh the dashboard to show the new symptom instance
    setRefreshKey(prev => prev + 1);
    setIsSymptomModalOpen(false);
  };

  const handleLogTrigger = () => {
    setIsTriggerModalOpen(true);
  };

  const handleTriggerLogged = () => {
    // Refresh the dashboard to show the new trigger event
    setRefreshKey(prev => prev + 1);
    setIsTriggerModalOpen(false);
  };

  const handleLogFood = () => {
    // Record performance mark for button click (AC4)
    performance.mark("food-log-button-click");
    openFoodLog();
  };

  const handleFoodLogged = () => {
    // Refresh the dashboard to show the new food event
    setRefreshKey(prev => prev + 1);
  };

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

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header with refresh button (desktop) */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Your daily health overview
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

        {/* Active Flares Section */}
        <section className="space-y-4">
          <ActiveFlareCards
            key={`flares-${refreshKey}`}
            userId={userId}
          />
        </section>

        {/* Quick Log Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Log</h2>
          <QuickLogButtons
            onLogFlare={handleLogFlare}
            onLogMedication={handleLogMedication}
            onLogSymptom={handleLogSymptom}
            onLogTrigger={handleLogTrigger}
            onLogFood={handleLogFood}
          />
        </section>

        {/* Timeline View */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Today&apos;s Timeline</h2>
          <TimelineView key={`timeline-${refreshKey}`} />
        </section>
      </div>

      {/* Flare Creation Modal */}
      {userId && (
        <FlareCreationModal
          isOpen={isFlareCreationModalOpen}
          onClose={() => setIsFlareCreationModalOpen(false)}
          onSave={handleFlareCreate}
          userId={userId}
        />
      )}

      {/* Medication Log Modal */}
      {userId && (
        <MedicationLogModal
          isOpen={isMedicationModalOpen}
          onClose={() => setIsMedicationModalOpen(false)}
          onLogged={handleMedicationLogged}
          userId={userId}
        />
      )}

      {/* Symptom Log Modal */}
      {userId && (
        <SymptomLogModal
          isOpen={isSymptomModalOpen}
          onClose={() => setIsSymptomModalOpen(false)}
          onLogged={handleSymptomLogged}
          userId={userId}
        />
      )}

      {/* Trigger Log Modal */}
      {userId && (
        <TriggerLogModal
          isOpen={isTriggerModalOpen}
          onClose={() => setIsTriggerModalOpen(false)}
          onLogged={handleTriggerLogged}
          userId={userId}
        />
      )}

      {/* Food Log Modal */}
      {userId && <FoodLogModal userId={userId} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <FoodProvider>
      <DashboardContent />
    </FoodProvider>
  );
}
