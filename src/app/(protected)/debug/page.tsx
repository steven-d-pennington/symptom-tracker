"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { db } from "@/lib/db/client";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";

export default function DebugPage() {
  const { userId } = useCurrentUser();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDebugInfo = async () => {
      if (!userId) return;

      try {
        // Check food records
        const allFoods = await db.foods.where({ userId }).toArray();
        const activeFoods = allFoods.filter(f => f.isActive);

        // Check food events
        const allFoodEvents = await db.foodEvents.where({ userId }).toArray();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const todayEvents = allFoodEvents.filter(e =>
          e.timestamp >= todayStart.getTime() && e.timestamp <= todayEnd.getTime()
        );

        // Try the repository methods
        const repoFoods = await foodRepository.getAll(userId);
        const categoryMap = await foodRepository.getAllByCategory(userId);

        // Check treatments
        const allTreatments = await db.treatments.where({ userId }).toArray();
        const activeTreatments = allTreatments.filter(t => t.isActive);

        // Check treatment events
        const allTreatmentEvents = await db.treatmentEvents.where({ userId }).toArray();

        setInfo({
          userId,
          foods: {
            total: allFoods.length,
            active: activeFoods.length,
            viaRepo: repoFoods.length,
            categories: Array.from(categoryMap.keys()),
            sampleFood: activeFoods[0] || null,
          },
          events: {
            total: allFoodEvents.length,
            today: todayEvents.length,
            timestamps: allFoodEvents.map(e => ({
              time: new Date(e.timestamp).toLocaleString(),
              mealType: e.mealType,
              foodCount: JSON.parse(e.foodIds).length,
            })),
            sample: allFoodEvents[0] || null,
          },
          treatments: {
            total: allTreatments.length,
            active: activeTreatments.length,
            categories: [...new Set(allTreatments.map(t => t.category).filter(Boolean))],
            sample: activeTreatments[0] || null,
          },
          treatmentEvents: {
            total: allTreatmentEvents.length,
            timestamps: allTreatmentEvents.map(e => ({
              time: new Date(e.timestamp).toLocaleString(),
              duration: e.duration,
              effectiveness: e.effectiveness,
            })),
            sample: allTreatmentEvents[0] || null,
          },
        });
      } catch (error) {
        console.error("Debug error:", error);
        setInfo({ error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    loadDebugInfo();
  }, [userId]);

  if (loading) return <div className="p-8">Loading debug info...</div>;
  if (!userId) return <div className="p-8">No user ID found</div>;

  return (
    <div className="p-8 space-y-4 bg-background min-h-screen">
      <h1 className="text-2xl font-bold text-foreground">Debug Info</h1>

      <div className="bg-card p-4 rounded shadow border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">User ID</h2>
        <pre className="text-xs overflow-auto text-foreground">{userId}</pre>
      </div>

      <div className="bg-card p-4 rounded shadow border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Food Records</h2>
        <pre className="text-xs overflow-auto text-foreground">{JSON.stringify(info?.foods, null, 2)}</pre>
      </div>

      <div className="bg-card p-4 rounded shadow border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Food Events</h2>
        <pre className="text-xs overflow-auto text-foreground">{JSON.stringify(info?.events, null, 2)}</pre>
      </div>

      <div className="bg-card p-4 rounded shadow border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Treatments</h2>
        <pre className="text-xs overflow-auto text-foreground">{JSON.stringify(info?.treatments, null, 2)}</pre>
      </div>

      <div className="bg-card p-4 rounded shadow border border-border">
        <h2 className="text-lg font-semibold mb-2 text-foreground">Treatment Events</h2>
        <pre className="text-xs overflow-auto text-foreground">{JSON.stringify(info?.treatmentEvents, null, 2)}</pre>
      </div>

      {info?.error && (
        <div className="bg-destructive/10 border border-destructive p-4 rounded">
          <h2 className="text-lg font-semibold mb-2 text-destructive">Error</h2>
          <pre className="text-xs overflow-auto text-destructive">{info.error}</pre>
        </div>
      )}
    </div>
  );
}
