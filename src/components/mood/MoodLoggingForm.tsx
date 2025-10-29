"use client";

import { useState } from "react";
import { moodRepository } from "@/lib/repositories/moodRepository";
import { MoodType } from "@/types/mood";

const MOOD_EMOJIS: Record<MoodType, string> = {
  [MoodType.Happy]: "😊",
  [MoodType.Neutral]: "😐",
  [MoodType.Sad]: "😢",
  [MoodType.Anxious]: "😰",
  [MoodType.Stressed]: "😫",
};

interface MoodLoggingFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function MoodLoggingForm({ userId, onSuccess }: MoodLoggingFormProps) {
  const [mood, setMood] = useState(5);
  const [moodType, setMoodType] = useState<MoodType | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await moodRepository.create({
        userId,
        mood,
        moodType,
        notes: notes.trim() || undefined,
        timestamp: Date.now(),
      });

      // Reset form
      setMood(5);
      setMoodType(undefined);
      setNotes("");

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save mood");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Log Your Mood
      </h2>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Mood Scale Slider */}
      <div>
        <label
          htmlFor="mood-slider"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Mood Level: {mood}/10
        </label>
        <input
          id="mood-slider"
          type="range"
          min="1"
          max="10"
          value={mood}
          onChange={(e) => setMood(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Very Bad</span>
          <span>Neutral</span>
          <span>Very Good</span>
        </div>
      </div>

      {/* Emotion Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          How are you feeling?
        </label>
        <div className="flex gap-3 flex-wrap">
          {(Object.entries(MOOD_EMOJIS) as [MoodType, string][]).map(
            ([type, emoji]) => (
              <button
                key={type}
                type="button"
                onClick={() => setMoodType(moodType === type ? undefined : type)}
                className={`text-4xl p-3 rounded-lg transition-colors ${
                  moodType === type
                    ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                title={type.charAt(0).toUpperCase() + type.slice(1)}
                disabled={isSubmitting}
              >
                {emoji}
              </button>
            )
          )}
        </div>
      </div>

      {/* Notes Textarea */}
      <div>
        <label
          htmlFor="mood-notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Notes (optional)
        </label>
        <textarea
          id="mood-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling today?"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {notes.length}/1000
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isSubmitting ? "Saving..." : "Save Mood"}
      </button>
    </form>
  );
}
