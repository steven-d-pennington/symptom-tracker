"use client";

import { useEffect, useState } from "react";
import { MoodLoggingForm } from "@/components/mood/MoodLoggingForm";
import { moodRepository } from "@/lib/repositories/moodRepository";
import { MoodEntry, MoodType } from "@/types/mood";
import { Trash2, Edit } from "lucide-react";

const MOOD_EMOJIS: Record<MoodType, string> = {
  [MoodType.Happy]: "😊",
  [MoodType.Neutral]: "😐",
  [MoodType.Sad]: "😢",
  [MoodType.Anxious]: "😰",
  [MoodType.Stressed]: "😫",
};

export default function MoodPage() {
  const userId = "demo-user"; // In a real app, get from auth context
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const data = await moodRepository.getByUserId(userId);
      setEntries(data);
    } catch (error) {
      console.error("Failed to load mood entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mood entry?")) {
      return;
    }

    try {
      await moodRepository.delete(id);
      await loadEntries();
    } catch (error) {
      console.error("Failed to delete mood entry:", error);
      alert("Failed to delete mood entry");
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Mood Tracking
      </h1>

      {/* Logging Form */}
      <div className="mb-12">
        <MoodLoggingForm userId={userId} onSuccess={loadEntries} />
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Mood History
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              Loading mood entries...
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No mood entries yet.
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
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(entry.timestamp)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(entry.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Mood Value */}
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Mood Level
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {entry.mood}/10
                    </span>
                  </div>
                  {/* Mood bar visualization */}
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(entry.mood / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Emotion Type */}
                {entry.moodType && (
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-2xl">
                      {MOOD_EMOJIS[entry.moodType]}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {entry.moodType}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
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
