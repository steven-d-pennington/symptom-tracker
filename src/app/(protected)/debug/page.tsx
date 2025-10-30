"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { db } from "@/lib/db/client";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";

export default function DebugFoodPage() {
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
    <div className="p-8 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold">Food Debug Info</h1>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">User ID</h2>
        <pre className="text-xs overflow-auto">{userId}</pre>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Food Records</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(info?.foods, null, 2)}</pre>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Food Events</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(info?.events, null, 2)}</pre>
      </div>

      {info?.error && (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-200">Error</h2>
          <pre className="text-xs overflow-auto">{info.error}</pre>
        </div>
      )}
    </div>
  );
}
