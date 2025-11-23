"use client";

import { useEffect, useState } from "react";
import { SleepLoggingForm } from "@/components/sleep/SleepLoggingForm";
import { sleepRepository } from "@/lib/repositories/sleepRepository";
import { SleepEntry, WeeklySleepAverage } from "@/types/sleep";
import { Trash2 } from "lucide-react";

export default function SleepPage() {
  const userId = "demo-user"; // In a real app, get from auth context
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [weeklyAverage, setWeeklyAverage] = useState<WeeklySleepAverage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const data = await sleepRepository.getByUserId(userId);
      setEntries(data);

      // Calculate weekly average for the past 7 days
      const now = Date.now();
      const weekStart = now - 7 * 24 * 60 * 60 * 1000;
      const average = await sleepRepository.getWeeklyAverage(userId, weekStart);
      setWeeklyAverage(average);
    } catch (error) {
      console.error("Failed to load sleep entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sleep entry?")) {
      return;
    }

    try {
      await sleepRepository.delete(id);
      await loadEntries();
    } catch (error) {
      console.error("Failed to delete sleep entry:", error);
      alert("Failed to delete sleep entry");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Get quality color based on rating.
   * 1-3: red (poor), 4-7: yellow (moderate), 8-10: green (good)
   */
  const getQualityColor = (quality: number): string => {
    if (quality <= 3) return "bg-red-500";
    if (quality <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getQualityLabel = (quality: number): string => {
    if (quality <= 3) return "Poor";
    if (quality <= 7) return "Moderate";
    return "Good";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Sleep Tracking
      </h1>

      {/* Weekly Average Card */}
      {weeklyAverage && (weeklyAverage.avgHours > 0 || weeklyAverage.avgQuality > 0) && (
        <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Past 7 Days Average</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm opacity-90 mb-1">Average Hours</p>
              <p className="text-3xl font-bold">{weeklyAverage.avgHours}h</p>
            </div>
            <div>
              <p className="text-sm opacity-90 mb-1">Average Quality</p>
              <p className="text-3xl font-bold">
                {weeklyAverage.avgQuality}/10
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Logging Form */}
      <div className="mb-12">
        <SleepLoggingForm userId={userId} onSuccess={loadEntries} />
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Sleep History
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Loading sleep entries...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No sleep entries yet.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Start tracking above! ↑
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                {/* Header with Date and Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(entry.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Hours Slept */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Hours Slept
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {entry.hours.toFixed(1)}h
                    </span>
                  </div>
                </div>

                {/* Sleep Quality */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Sleep Quality
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {entry.quality}/10
                    </span>
                  </div>
                  {/* Quality indicator bar */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 rounded-full flex-1 ${getQualityColor(
                        entry.quality
                      )}`}
                      style={{ width: `${(entry.quality / 10) * 100}%` }}
                    />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {getQualityLabel(entry.quality)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {entry.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {entry.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
