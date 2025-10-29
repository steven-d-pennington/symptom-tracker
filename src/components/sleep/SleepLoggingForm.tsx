"use client";

import { useState } from "react";
import { sleepRepository } from "@/lib/repositories/sleepRepository";

interface SleepLoggingFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function SleepLoggingForm({ userId, onSuccess }: SleepLoggingFormProps) {
  const [hours, setHours] = useState(8.0);
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get quality color based on rating.
   * 1-3: red (poor), 4-7: yellow (moderate), 8-10: green (good)
   */
  const getQualityColor = (q: number): string => {
    if (q <= 3) return "bg-red-500";
    if (q <= 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Default timestamp to 12 hours ago (previous night)
      const timestamp = Date.now() - 12 * 60 * 60 * 1000;

      await sleepRepository.create({
        userId,
        hours,
        quality,
        notes: notes.trim() || undefined,
        timestamp,
      });

      // Reset form
      setHours(8.0);
      setQuality(5);
      setNotes("");

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sleep entry");
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
        Log Your Sleep
      </h2>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Hours Slept Input */}
      <div>
        <label
          htmlFor="hours-slept"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Hours Slept: {hours.toFixed(1)}
        </label>
        <input
          id="hours-slept"
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter hours as a decimal (e.g., 7.5, 8.0, 8.5)
        </div>
      </div>

      {/* Sleep Quality Slider */}
      <div>
        <label
          htmlFor="sleep-quality"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Sleep Quality: {quality}/10
        </label>
        <input
          id="sleep-quality"
          type="range"
          min="1"
          max="10"
          value={quality}
          onChange={(e) => setQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          disabled={isSubmitting}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Very Poor</span>
          <span>Moderate</span>
          <span>Excellent</span>
        </div>
        {/* Color Indicator */}
        <div className={`h-3 rounded-full mt-3 ${getQualityColor(quality)}`} />
      </div>

      {/* Notes Textarea */}
      <div>
        <label
          htmlFor="sleep-notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Notes (optional)
        </label>
        <textarea
          id="sleep-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any disturbances or dreams?"
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
        {isSubmitting ? "Saving..." : "Save Sleep"}
      </button>
    </form>
  );
}
