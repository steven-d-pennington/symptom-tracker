'use client';

import { useState } from "react";
import { populateDevDemoData } from "@/lib/dev/populateDemoData";
import { generateEventStreamData, EventStreamPreset } from "@/lib/dev/generateEventStreamData";
import { generateFoodEventData, FoodEventPreset } from "@/lib/dev/generateFoodEventData";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function DevDataControls() {
  // Expose controls to everyone (not just development mode)
  const { userId, isLoading: userLoading } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [quickMessage, setQuickMessage] = useState<string | null>(null);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [foodMessage, setFoodMessage] = useState<string | null>(null);
  const [foodError, setFoodError] = useState<string | null>(null);
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [legacyMessage, setLegacyMessage] = useState<string | null>(null);
  const [legacyError, setLegacyError] = useState<string | null>(null);

  const handlePopulateClick = async (months: number) => {
    if (!userId) {
      setLegacyError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setLegacyMessage(null);
    setLegacyError(null);

    try {
      const result = await populateDevDemoData({ userId, months });
      setLegacyMessage(
        `Generated ${result.entriesCreated} daily entries, ${result.symptomsCreated} symptoms, ${result.medicationsCreated} medications, and ${result.triggersCreated} triggers from ${result.startDate} to ${result.endDate}. Refresh to see the data!`
      );
    } catch (err) {
      console.error("Failed to populate demo data", err);
      setLegacyError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating demo data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventStreamClick = async (preset: EventStreamPreset) => {
    if (!userId) {
      setEventError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setEventMessage(null);
    setEventError(null);

    try {
      const result = await generateEventStreamData({ userId, preset });
      setEventMessage(
        `Generated ${result.medicationEventsCreated} medication events, ${result.triggerEventsCreated} trigger events, ${result.symptomInstancesCreated} symptom instances, and ${result.flaresCreated} flares from ${new Date(result.startDate).toLocaleDateString()} to ${new Date(result.endDate).toLocaleDateString()}. Refresh to see the data!`
      );
    } catch (err) {
      console.error("Failed to generate event stream data", err);
      setEventError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating event stream data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodEventClick = async (preset: FoodEventPreset) => {
    if (!userId) {
      setFoodError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setFoodMessage(null);
    setFoodError(null);

    try {
      const result = await generateFoodEventData({ userId, preset });
      setFoodMessage(
        `Generated ${result.foodEventsCreated} food events across ${result.foodsCreated} different foods from ${new Date(result.startDate).toLocaleDateString()} to ${new Date(result.endDate).toLocaleDateString()}. Refresh to see the data!`
      );
    } catch (err) {
      console.error("Failed to generate food event data", err);
      setFoodError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating food event data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAll = async (preset: "one-week" | "heavy-user") => {
    if (!userId) {
      setQuickError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setQuickMessage(null);
    setQuickError(null);

    try {
      // Generate all data types
      const [eventResult, foodResult] = await Promise.all([
        generateEventStreamData({ userId, preset }),
        generateFoodEventData({ userId, preset }),
      ]);

      setQuickMessage(
        `Generated comprehensive seed data:\n` +
        `• ${eventResult.medicationEventsCreated} medication events\n` +
        `• ${eventResult.triggerEventsCreated} trigger events\n` +
        `• ${eventResult.symptomInstancesCreated} symptom instances\n` +
        `• ${eventResult.flaresCreated} flares\n` +
        `• ${foodResult.foodEventsCreated} food events\n` +
        `Refresh to see the data!`
      );
    } catch (err) {
      console.error("Failed to generate comprehensive data", err);
      setQuickError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating comprehensive data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!userId) {
      setQuickError("No user found. Please complete onboarding first.");
      return;
    }

    const confirmed = confirm(
      "⚠️ WARNING: This will delete ALL data for the current user including:\n\n" +
      "• All event stream data (medications, triggers, symptoms, flares)\n" +
      "• All food logs and events\n" +
      "• All legacy daily entries\n" +
      "• User definitions (symptoms, medications, triggers, foods)\n\n" +
      "This action cannot be undone. Are you sure?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    setQuickMessage(null);
    setQuickError(null);

    try {
      const { db } = await import("@/lib/db/client");

      // Clear all user data
      await Promise.all([
        // Event stream data
        db.medicationEvents?.where({ userId }).delete(),
        db.triggerEvents?.where({ userId }).delete(),
        db.symptomInstances?.where({ userId }).delete(),
        db.flares?.where({ userId }).delete(),
        db.flareEvents?.where({ userId }).delete(),
        // Food data
        db.foodEvents?.where({ userId }).delete(),
        db.foods?.where({ userId }).delete(),
        db.foodCombinations?.where({ userId }).delete(),
        // Legacy data
        db.dailyEntries.where({ userId }).delete(),
        db.analysisResults.where({ userId }).delete(),
        // Definitions
        db.symptoms.where({ userId }).delete(),
        db.medications.where({ userId }).delete(),
        db.triggers.where({ userId }).delete(),
        // Other data
        db.bodyMapLocations?.where({ userId }).delete(),
        db.photoAttachments?.where({ userId }).delete(),
        db.uxEvents?.where({ userId }).delete(),
      ]);

      setQuickMessage("✅ All data has been cleared successfully. The app is now in a fresh state.");
    } catch (err) {
      console.error("Failed to clear data", err);
      setQuickError(
        err instanceof Error
          ? err.message
          : "Something went wrong while clearing data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="mt-10 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold text-primary">Developer Utilities</h3>
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mt-10 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-6">
        <h3 className="text-lg font-semibold text-destructive">Developer Utilities</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Please complete onboarding to use developer utilities.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      {/* Quick Actions */}
      <div className="rounded-lg border-2 border-dashed border-purple-500/60 bg-purple-500/10 p-6">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Quick Actions</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate comprehensive seed data with all features, or clear all data to start fresh.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleGenerateAll("one-week")}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "Generate All (1 Week)"}
          </button>
          <button
            type="button"
            onClick={() => handleGenerateAll("heavy-user")}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "Generate All (30 Days)"}
          </button>
          <button
            type="button"
            onClick={handleClearAllData}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-destructive px-6 py-2.5 text-sm font-semibold text-destructive-foreground shadow-md hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Clearing…" : "Clear All Data"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          <strong>Generate All:</strong> Creates event stream data (medications, triggers, symptoms, flares) + food events in one click<br />
          <strong>Clear All Data:</strong> Removes all user data including events, definitions, and legacy entries
        </p>

        {quickMessage && (
          <p className="mt-3 text-sm text-purple-700 dark:text-purple-400 whitespace-pre-line" role="status">
            ✅ {quickMessage}
          </p>
        )}

        {quickError && (
          <p className="mt-3 text-sm text-destructive whitespace-pre-line" role="alert">
            ❌ {quickError}
          </p>
        )}
      </div>

      {/* Food Event Data (NEWEST) */}
      <div className="rounded-lg border border-dashed border-blue-500/40 bg-blue-500/5 p-6">
        <h3 className="text-lg font-semibold text-blue-600">Food Event Data (NEWEST)</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate realistic food logging data with varied meals (breakfast, lunch, dinner, snacks) using the complete food catalog (210+ foods).
          <strong className="block mt-2">⚠️ This will replace all existing food event data for the current user!</strong>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:flex md:flex-wrap">
          <button
            type="button"
            onClick={() => handleFoodEventClick("first-day")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "First Day"}
          </button>
          <button
            type="button"
            onClick={() => handleFoodEventClick("one-week")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "One Week"}
          </button>
          <button
            type="button"
            onClick={() => handleFoodEventClick("heavy-user")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "Heavy User (30 days)"}
          </button>
          <button
            type="button"
            onClick={() => handleFoodEventClick("one-year-heavy")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "1 Year Heavy User"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          <strong>First Day:</strong> 2-3 meals today with occasional snacks<br />
          <strong>One Week:</strong> 2-3 meals/day with snacks (60% chance)<br />
          <strong>Heavy User:</strong> 3 meals/day for 30 days with frequent snacks (80%)<br />
          <strong>1 Year Heavy User:</strong> 3 meals/day for 364 days with regular snacks (70%)
        </p>

        {foodMessage && (
          <p className="mt-3 text-sm text-blue-600" role="status">
            ✅ {foodMessage}
          </p>
        )}

        {foodError && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            ❌ {foodError}
          </p>
        )}
      </div>

      {/* Event Stream Data */}
      <div className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 p-6">
        <h3 className="text-lg font-semibold text-emerald-600">Event Stream Data</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate realistic event-based data with timestamped medication events, trigger events, symptom instances, and flares with severity progression.
          <strong className="block mt-2">⚠️ This will replace all existing event data for the current user!</strong>
        </p>
        <div className="mt-3 rounded-md bg-amber-500/10 border border-amber-500/30 p-3">
          <p className="text-xs text-amber-900 dark:text-amber-200">
            <strong>First time using event stream?</strong> Close all other tabs with this app open, then refresh this page.
            This upgrades the database to support event stream data (version 10).
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:flex md:flex-wrap">
          <button
            type="button"
            onClick={() => handleEventStreamClick("first-day")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "First Day"}
          </button>
          <button
            type="button"
            onClick={() => handleEventStreamClick("one-week")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "One Week"}
          </button>
          <button
            type="button"
            onClick={() => handleEventStreamClick("heavy-user")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "Heavy User (30 days)"}
          </button>
          <button
            type="button"
            onClick={() => handleEventStreamClick("one-year-heavy")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "1 Year Heavy User"}
          </button>
          <button
            type="button"
            onClick={() => handleEventStreamClick("edge-cases")}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "Edge Cases"}
          </button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          <strong>First Day:</strong> 2-4 events today, 1 active flare<br />
          <strong>One Week:</strong> 3-5 events/day, 1-2 active flares with progression<br />
          <strong>Heavy User:</strong> 5-8 events/day for 30 days, 3-5 flares<br />
          <strong>1 Year Heavy User:</strong> 6-12 events/day for 364 days, 15-25 flares with varied progressions<br />
          <strong>Edge Cases:</strong> Variable patterns, missed meds, unusual timing
        </p>

        {eventMessage && (
          <p className="mt-3 text-sm text-emerald-600" role="status">
            ✅ {eventMessage}
          </p>
        )}

        {eventError && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            ❌ {eventError}
          </p>
        )}
      </div>

      {/* Legacy Daily Entry Data (OLD) */}
      <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-6">
        <h3 className="text-lg font-semibold text-primary">Legacy Daily Entry Data (OLD)</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Legacy daily summary model (deprecated). Use Event Stream Data above for new event-based model.
          <strong className="block mt-2">⚠️ This will replace all existing data for the current user!</strong>
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handlePopulateClick(3)}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "3 Months"}
          </button>
          <button
            type="button"
            onClick={() => handlePopulateClick(6)}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "6 Months"}
          </button>
          <button
            type="button"
            onClick={() => handlePopulateClick(12)}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Generating…" : "1 Year"}
          </button>
        </div>

        {legacyMessage && (
          <p className="mt-3 text-sm text-primary" role="status">
            ✅ {legacyMessage}
          </p>
        )}

        {legacyError && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            ❌ {legacyError}
          </p>
        )}
      </div>
    </div>
  );
}

export default DevDataControls;
