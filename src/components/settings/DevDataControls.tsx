'use client';

import { useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { generateComprehensiveData } from "@/lib/dev/generators/orchestrator";
import { getScenarioConfig, getAllScenarios, ScenarioType } from "@/lib/dev/config/scenarios";

export function DevDataControls() {
  const { userId, isLoading: userLoading } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('comprehensive');
  const [selectedYears, setSelectedYears] = useState<number>(1);

  const scenarios = getAllScenarios();

  const handleGenerateScenario = async (scenarioId: ScenarioType, years?: number) => {
    if (!userId) {
      setError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const config = getScenarioConfig(scenarioId, years);
      const result = await generateComprehensiveData(userId, config);

      setMessage(
        `✅ Generated comprehensive test data:\\n\\n` +
        `📊 **Event Counts:**\\n` +
        `• ${result.medicationEventsCreated} medication events\\n` +
        `• ${result.triggerEventsCreated} trigger events\\n` +
        `• ${result.symptomInstancesCreated} symptom instances\\n` +
        `• ${result.flaresCreated} flares\\n` +
        `• ${result.flareEventsCreated} flare events\\n` +
        `• ${result.foodEventsCreated} food events\\n` +
        (result.uxEventsCreated > 0 ? `• ${result.uxEventsCreated} UX events\\n` : '') +
        (result.bodyMapLocationsCreated > 0 ? `• ${result.bodyMapLocationsCreated} body map locations\\n` : '') +
        (result.photoAttachmentsCreated > 0 ? `• ${result.photoAttachmentsCreated} photos\\n` : '') +
        `\\n📅 **Time Range:** ${new Date(result.startDate).toLocaleDateString()} to ${new Date(result.endDate).toLocaleDateString()}\\n\\n` +
        `**Refresh the page to see your data!**`
      );
    } catch (err) {
      console.error("Failed to generate scenario data", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating data."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!userId) {
      setError("No user found. Please complete onboarding first.");
      return;
    }

    const confirmed = confirm(
      "⚠️ WARNING: This will delete ALL data for the current user including:\\n\\n" +
      "• All event stream data (medications, triggers, symptoms, flares)\\n" +
      "• All food logs and events\\n" +
      "• All legacy daily entries\\n" +
      "• User definitions (symptoms, medications, triggers, foods)\\n\\n" +
      "This action cannot be undone. Are you sure?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    setMessage(null);
    setError(null);

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

      setMessage("✅ All data has been cleared successfully. The app is now in a fresh state.");
    } catch (err) {
      console.error("Failed to clear data", err);
      setError(
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
      {/* Scenario Selection */}
      <div className="rounded-lg border-2 border-dashed border-purple-500/60 bg-purple-500/10 p-6">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">
          📋 Test Data Scenarios
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a scenario optimized for testing specific features. Each scenario generates realistic data patterns.
        </p>

        {/* Year Selector */}
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data Time Range (Years): {selectedYears} {selectedYears === 1 ? 'year' : 'years'}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={selectedYears}
            onChange={(e) => setSelectedYears(Number(e.target.value))}
            disabled={isLoading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 year</span>
            <span>2 years</span>
            <span>3 years</span>
            <span>4 years</span>
            <span>5 years</span>
          </div>
        </div>

        {/* Scenario Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                selectedScenario === scenario.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-purple-400'
              }`}
              onClick={() => setSelectedScenario(scenario.id)}
            >
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{scenario.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {scenario.name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                    {scenario.description}
                  </p>
                </div>
              </div>
              {selectedScenario === scenario.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleGenerateScenario(selectedScenario, selectedYears)}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating…
              </>
            ) : (
              <>
                Generate {scenarios.find(s => s.id === selectedScenario)?.name}
              </>
            )}
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

        {/* Help Text */}
        <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            <strong>💡 Tip:</strong> Start with "Quick Start" to explore features, then use specific scenarios to test advanced functionality like correlation analysis or flare tracking.
          </p>
        </div>

        {message && (
          <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-900 dark:text-green-200 whitespace-pre-line">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-900 dark:text-red-200 whitespace-pre-line" role="alert">
              ❌ {error}
            </p>
          </div>
        )}
      </div>

      {/* What Gets Generated */}
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📦 What Gets Generated
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Depending on the scenario selected, the following data types may be generated:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="mr-2">💊</span>
            <span><strong>Medication Events:</strong> Scheduled medication tracking with adherence patterns and timing warnings</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">⚠️</span>
            <span><strong>Trigger Events:</strong> Environmental and lifestyle triggers with intensity levels and symptom correlations</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔥</span>
            <span><strong>Flare Tracking:</strong> Complete flare lifecycle with severity progression, interventions, and resolutions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🍽️</span>
            <span><strong>Food Events:</strong> Meal logging with intentional patterns for testing correlation analysis</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📍</span>
            <span><strong>Body Map Locations:</strong> Symptom and flare locations with coordinate precision</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📸</span>
            <span><strong>Photo Attachments:</strong> Placeholder photo blobs for testing photo features (if supported)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">📊</span>
            <span><strong>UX Events:</strong> Simulated user interaction analytics</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default DevDataControls;
