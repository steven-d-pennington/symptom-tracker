'use client';

import { useState } from "react";
import { populateDevDemoData } from "@/lib/dev/populateDemoData";
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
    <div className="mt-10 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-6">
      <h3 className="text-lg font-semibold text-primary">Developer Utilities</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Populate IndexedDB with realistic HS demo data including flare patterns, symptoms, medications, and triggers.
        <strong className="block mt-2">⚠️ This will replace all existing data for the current user!</strong>
      </p>

      <div className="mt-4 flex gap-3">
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
                <button
          type="button"
          onClick={() => handlePopulateClick(48)}
          disabled={isLoading}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Generating…" : "1 Year"}
        </button>
      </div>

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
  );
}

export default DevDataControls;
