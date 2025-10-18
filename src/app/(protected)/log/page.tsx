"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { dailyEntryRepository } from "@/lib/repositories/dailyEntryRepository";
import { Info, Moon, Smile, Save, Check } from "lucide-react";

const DailyReflectionPage = () => {
  const { userId, isLoading: userLoading } = useCurrentUser();
  const [mood, setMood] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Load today's reflection if it exists
  useEffect(() => {
    if (!userId) return;

    const loadTodayReflection = async () => {
      const today = new Date().toISOString().split("T")[0];
      const entries = await dailyEntryRepository.getByDateRange(userId, today, today);

      if (entries.length > 0) {
        const entry = entries[0];
        if (entry.mood) {
          // Parse mood as number (1-5 scale)
          const moodValue = parseInt(entry.mood, 10);
          if (!isNaN(moodValue)) setMood(moodValue);
        }
        setSleepQuality(entry.sleepQuality || 3);
        setNotes(entry.notes || "");
      }
    };

    loadTodayReflection();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const entries = await dailyEntryRepository.getByDateRange(userId, today, today);

      const now = new Date();
      const entryData = {
        userId,
        date: today,
        mood: mood.toString(), // Store as string for compatibility
        sleepQuality,
        notes,
        // Keep existing data or use defaults
        overallHealth: entries.length > 0 ? entries[0].overallHealth : 5,
        energyLevel: entries.length > 0 ? entries[0].energyLevel : 5,
        stressLevel: entries.length > 0 ? entries[0].stressLevel : 5,
        symptoms: entries.length > 0 ? entries[0].symptoms : [],
        medications: entries.length > 0 ? entries[0].medications : [],
        triggers: entries.length > 0 ? entries[0].triggers : [],
        duration: 0,
        completedAt: now,
        createdAt: entries.length > 0 ? entries[0].createdAt : now,
        updatedAt: now,
      };

      if (entries.length > 0) {
        await dailyEntryRepository.update(entries[0].id, entryData);
      } else {
        await dailyEntryRepository.create(entryData);
      }

      setLastSavedAt(new Date());
    } catch (error) {
      console.error("Failed to save reflection:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
      {/* Header with Optional Notice */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-1">
            <h2 className="font-semibold text-blue-900 dark:text-blue-100">
              Optional Daily Reflection
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Events are your primary logs. Use this reflection to add end-of-day context about mood, sleep, and overall notes.
            </p>
          </div>
        </div>

        <h1 className="text-3xl font-bold">Daily Reflection</h1>
      </div>

      {/* Simplified Reflection Form */}
      <div className="space-y-8">
        {/* Mood Slider */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Smile className="h-5 w-5 text-muted-foreground" />
            <label className="text-lg font-medium">Overall Mood</label>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Very Low</span>
              <span>Low</span>
              <span>Neutral</span>
              <span>Good</span>
              <span>Very Good</span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-xl font-bold">
                {mood}
              </span>
            </div>
          </div>
        </div>

        {/* Sleep Quality Slider */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-muted-foreground" />
            <label className="text-lg font-medium">Sleep Quality</label>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="1"
              max="5"
              value={sleepQuality}
              onChange={(e) => setSleepQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
            />
            <div className="flex justify-between text-sm text-muted-foreground px-1">
              <span>Very Poor</span>
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            <div className="text-center">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-xl font-bold">
                {sleepQuality}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Notes */}
        <div className="space-y-4">
          <label className="text-lg font-medium">Overall Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How was your day? Any observations, thoughts, or context you'd like to remember..."
            className="w-full min-h-[150px] resize-y rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            rows={6}
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Reflection
              </>
            )}
          </button>

          {lastSavedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600" />
              <span>
                Saved at {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default DailyReflectionPage;
