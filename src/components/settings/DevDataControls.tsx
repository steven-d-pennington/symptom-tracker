'use client';

import { useState } from "react";
import { populateDevDemoData } from "@/lib/dev/populateDemoData";
import { generateEventStreamData, EventStreamPreset } from "@/lib/dev/generateEventStreamData";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function DevDataControls() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const { userId, isLoading: userLoading } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePopulateClick = async (months: number) => {
    if (!userId) {
      setError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await populateDevDemoData({ userId, months });
      setMessage(
        `Generated ${result.entriesCreated} daily entries, ${result.symptomsCreated} symptoms, ${result.medicationsCreated} medications, and ${result.triggersCreated} triggers from ${result.startDate} to ${result.endDate}. Refresh to see the data!`
      );
    } catch (err) {
      console.error("Failed to populate demo data", err);
      setError(
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
      setError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await generateEventStreamData({ userId, preset });
      setMessage(
        `Generated ${result.medicationEventsCreated} medication events, ${result.triggerEventsCreated} trigger events, ${result.symptomInstancesCreated} symptom instances, and ${result.flaresCreated} flares from ${new Date(result.startDate).toLocaleDateString()} to ${new Date(result.endDate).toLocaleDateString()}. Refresh to see the data!`
      );
    } catch (err) {
      console.error("Failed to generate event stream data", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating event stream data."
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
      {/* Event Stream Data (NEW) */}
      <div className="rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 p-6">
        <h3 className="text-lg font-semibold text-emerald-600">Event Stream Data (NEW)</h3>
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

        {message && (
          <p className="mt-3 text-sm text-emerald-600" role="status">
            ✅ {message}
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            ❌ {error}
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
      </div>
    </div>
  );
}

export default DevDataControls;
