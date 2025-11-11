'use client';

import { useState } from "react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { generateComprehensiveData } from "@/lib/dev/generators/orchestrator";
import { getScenarioConfig, getAllScenarios, ScenarioType } from "@/lib/dev/config/scenarios";
import { ChevronDown, ChevronUp } from "lucide-react";

export function DevDataControls() {
  const { userId, userName, isLoading: userLoading } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('comprehensive');
  const [selectedYears, setSelectedYears] = useState<number>(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const scenarios = getAllScenarios();

  // Only show dev controls if user's name is "Steven"
  const isAuthorized = userName === "Steven";

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

      // Calculate daily log coverage percentage (Story 6.8)
      const totalDays = Math.floor((new Date(result.endDate).getTime() - new Date(result.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const coveragePercent = result.dailyLogsCreated > 0 ? Math.round((result.dailyLogsCreated / totalDays) * 100) : 0;

      setMessage(
        `✅ Generated comprehensive test data:\\n\\n` +
        `📊 **Health Events:**\\n` +
        `• ${result.flaresCreated} flares\\n` +
        `• ${result.flareEventsCreated} flare events\\n` +
        `• ${result.medicationEventsCreated} medication events\\n` +
        `• ${result.triggerEventsCreated} trigger events\\n` +
        `• ${result.symptomInstancesCreated} symptom instances\\n` +
        `• ${result.foodEventsCreated} food events\\n` +
        (result.bodyMapLocationsCreated > 0 ? `• ${result.bodyMapLocationsCreated} body map locations\\n` : '') +
        (result.photoAttachmentsCreated > 0 ? `• ${result.photoAttachmentsCreated} photos\\n` : '') +
        (result.uxEventsCreated > 0 ? `• ${result.uxEventsCreated} UX events\\n` : '') +
        // Story 6.8: Analytics data section
        (result.dailyLogsCreated > 0 || result.correlationsGenerated > 0 || result.treatmentEffectivenessRecordsCreated > 0 || result.patternsGenerated > 0
          ? `\\n📈 **Analytics & Insights:**\\n` +
            (result.dailyLogsCreated > 0 ? `• ${result.dailyLogsCreated} daily logs with mood + sleep (${coveragePercent}% coverage)\\n` : '') +
            (result.correlationsGenerated > 0 ? `• ${result.correlationsGenerated} correlations (${result.significantCorrelations} significant |ρ| >= 0.3)\\n` : '') +
            (result.treatmentEffectivenessRecordsCreated > 0 ? `• ${result.treatmentEffectivenessRecordsCreated} treatment effectiveness records\\n` : '') +
            (result.patternsGenerated > 0 ? `• ${result.patternsGenerated} intentional patterns\\n` : '')
          : '') +
        `\\n📅 **Time Range:** ${new Date(result.startDate).toLocaleDateString()} to ${new Date(result.endDate).toLocaleDateString()}\\n\\n` +
        `**Where to view:**\\n` +
        `• Daily Log page: View mood + sleep trends\\n` +
        `• Body Map: See flare locations and progression\\n` +
        `• Timeline: Browse all health events\\n` +
        `• Insights: Explore correlations and patterns\\n\\n` +
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

  const handleCheckDefaults = async () => {
    if (!userId) {
      setError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { symptomRepository } = await import("@/lib/repositories/symptomRepository");
      const { foodRepository } = await import("@/lib/repositories/foodRepository");
      const { triggerRepository } = await import("@/lib/repositories/triggerRepository");
      const { medicationRepository } = await import("@/lib/repositories/medicationRepository");
      const { db } = await import("@/lib/db/client");

      const [symptoms, foods, triggers, medications] = await Promise.all([
        symptomRepository.getAll(userId),
        foodRepository.getAll(userId),
        triggerRepository.getAll(userId),
        medicationRepository.getAll(userId),
      ]);

      // Also check total counts across ALL users to detect duplicate user creation
      const [allFoods, allSymptoms, allTriggers, allMedications, allUsers] = await Promise.all([
        db.foods.toArray(),
        db.symptoms.toArray(),
        db.triggers.toArray(),
        db.medications.toArray(),
        db.users.toArray(),
      ]);

      const defaultSymptoms = symptoms.filter(s => s.isDefault);
      const enabledDefaults = defaultSymptoms.filter(s => s.isEnabled);

      // Get unique user IDs from foods
      const uniqueFoodUserIds = new Set(allFoods.map(f => f.userId));

      setMessage(
        `📊 **Database Status for Current User (${userId}):**\\n\\n` +
        `**Symptoms:**\\n` +
        `• Total: ${symptoms.length}\\n` +
        `• Defaults: ${defaultSymptoms.length}\\n` +
        `• Enabled defaults: ${enabledDefaults.length}\\n` +
        `• Sample: ${symptoms.slice(0, 3).map(s => `${s.name} (default:${s.isDefault}, enabled:${s.isEnabled})`).join(', ')}\\n\\n` +
        `**Foods:** ${foods.length} total, ${foods.filter(f => f.isDefault).length} defaults\\n` +
        `**Triggers:** ${triggers.length} total, ${triggers.filter(t => t.isDefault).length} defaults\\n` +
        `**Medications:** ${medications.length} total, ${medications.filter(m => m.isDefault).length} defaults\\n\\n` +
        `⚠️ **GLOBAL DATABASE STATS:**\\n` +
        `• Total users: ${allUsers.length}\\n` +
        `• Total foods (all users): ${allFoods.length}\\n` +
        `• Total symptoms (all users): ${allSymptoms.length}\\n` +
        `• Total triggers (all users): ${allTriggers.length}\\n` +
        `• Total medications (all users): ${allMedications.length}\\n` +
        `• Unique user IDs with foods: ${uniqueFoodUserIds.size}\\n` +
        `• User IDs: ${Array.from(uniqueFoodUserIds).join(', ')}`
      );
    } catch (err) {
      console.error("Failed to check defaults", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while checking defaults."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!userId) {
      setError("No user found. Please complete onboarding first.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { initializeUserDefaults } = await import("@/lib/services/userInitialization");
      const result = await initializeUserDefaults(userId);

      if (result.success) {
        setMessage(
          `✅ Default data initialized successfully!\\n\\n` +
          `📊 **Items Created:**\\n` +
          `• ${result.details?.symptomsCreated || 0} symptoms\\n` +
          `• ${result.details?.foodsCreated || 0} foods\\n` +
          `• ${result.details?.triggersCreated || 0} triggers\\n` +
          `• ${result.details?.medicationsCreated || 0} medications\\n\\n` +
          `**Refresh the page to see your defaults!**`
        );
      } else {
        setError(`Failed to initialize defaults: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Failed to initialize defaults", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while initializing defaults."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!userId) {
      setError("No user found. Please complete onboarding first.");
      return;
    }

    const confirmed = confirm(
      "⚠️ This will delete ALL default items (symptoms, foods, triggers, medications) and recreate them from scratch.\\n\\n" +
      "Your custom items and event data will NOT be affected.\\n\\n" +
      "Continue?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { db } = await import("@/lib/db/client");
      const { symptomRepository } = await import("@/lib/repositories/symptomRepository");
      const { foodRepository } = await import("@/lib/repositories/foodRepository");
      const { triggerRepository } = await import("@/lib/repositories/triggerRepository");
      const { medicationRepository } = await import("@/lib/repositories/medicationRepository");

      // Get all items with isDefault flag
      const [symptoms, foods, triggers, medications] = await Promise.all([
        symptomRepository.getAll(userId),
        foodRepository.getAll(userId),
        triggerRepository.getAll(userId),
        medicationRepository.getAll(userId),
      ]);

      // Filter to defaults and get IDs
      const defaultSymptomIds = symptoms.filter(s => s.isDefault).map(s => s.id);
      const defaultFoodIds = foods.filter(f => f.isDefault).map(f => f.id);
      const defaultTriggerIds = triggers.filter(t => t.isDefault).map(t => t.id);
      const defaultMedicationIds = medications.filter(m => m.isDefault).map(m => m.id);

      console.log('[Reset Defaults] Deleting defaults:', {
        symptoms: defaultSymptomIds.length,
        foods: defaultFoodIds.length,
        triggers: defaultTriggerIds.length,
        medications: defaultMedicationIds.length,
      });

      // Delete by IDs (more reliable than filter().delete())
      await Promise.all([
        db.symptoms.bulkDelete(defaultSymptomIds),
        db.foods.bulkDelete(defaultFoodIds),
        db.triggers.bulkDelete(defaultTriggerIds),
        db.medications.bulkDelete(defaultMedicationIds),
      ]);

      console.log('[Reset Defaults] Deleted all default items');

      // Re-initialize defaults
      const { initializeUserDefaults } = await import("@/lib/services/userInitialization");
      const result = await initializeUserDefaults(userId);

      if (result.success) {
        setMessage(
          `✅ Defaults reset successfully!\\n\\n` +
          `📊 **Items Recreated:**\\n` +
          `• ${result.details?.symptomsCreated || 0} symptoms\\n` +
          `• ${result.details?.foodsCreated || 0} foods\\n` +
          `• ${result.details?.triggersCreated || 0} triggers\\n` +
          `• ${result.details?.medicationsCreated || 0} medications\\n\\n` +
          `**Refresh the page to see your defaults!**`
        );
      } else {
        setError(`Failed to re-initialize defaults: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Failed to reset defaults", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while resetting defaults."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanupGhostUser = async () => {
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { db } = await import("@/lib/db/client");

      // Delete all data for the ghost "default-user-id"
      const ghostUserId = 'default-user-id';

      console.log('[Cleanup Ghost User] Deleting data for:', ghostUserId);

      await Promise.all([
        // Event stream data
        db.medicationEvents?.where({ userId: ghostUserId }).delete(),
        db.triggerEvents?.where({ userId: ghostUserId }).delete(),
        db.symptomInstances?.where({ userId: ghostUserId }).delete(),
        db.flares?.where({ userId: ghostUserId }).delete(),
        db.flareEvents?.where({ userId: ghostUserId }).delete(),
        // Food data
        db.foodEvents?.where({ userId: ghostUserId }).delete(),
        db.foods?.where({ userId: ghostUserId }).delete(),
        db.foodCombinations?.where({ userId: ghostUserId }).delete(),
        // Legacy data
        db.dailyEntries.where({ userId: ghostUserId }).delete(),
        db.analysisResults.where({ userId: ghostUserId }).delete(),
        // Definitions
        db.symptoms.where({ userId: ghostUserId }).delete(),
        db.medications.where({ userId: ghostUserId }).delete(),
        db.triggers.where({ userId: ghostUserId }).delete(),
        // Other data
        db.bodyMapLocations?.where({ userId: ghostUserId }).delete(),
        db.photoAttachments?.where({ userId: ghostUserId }).delete(),
        db.uxEvents?.where({ userId: ghostUserId }).delete(),
      ]);

      setMessage(`✅ Ghost user data cleaned up successfully!\\n\\nDeleted all data for user ID: ${ghostUserId}`);
    } catch (err) {
      console.error("Failed to cleanup ghost user", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while cleaning up ghost user."
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
        // Mood and sleep
        db.moodEntries?.where({ userId }).delete(),
        db.sleepEntries?.where({ userId }).delete(),
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

  // Story 5.2: Body Map Layer Preferences Controls
  const handleResetLayerPreferences = async () => {
    if (!userId) {
      setError("No user found.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { bodyMapPreferencesRepository } = await import("@/lib/repositories/bodyMapPreferencesRepository");

      // Get current prefs to trigger defaults if needed
      await bodyMapPreferencesRepository.get(userId);

      // Reset to defaults
      await bodyMapPreferencesRepository.setLastUsedLayer(userId, "flares");
      await bodyMapPreferencesRepository.setVisibleLayers(userId, ["flares"]);
      await bodyMapPreferencesRepository.setViewMode(userId, "single");

      setMessage("✅ Layer preferences reset to defaults (flares only, single view)");
    } catch (err) {
      console.error("Failed to reset layer preferences", err);
      setError(err instanceof Error ? err.message : "Failed to reset preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetLayer = async (layer: 'flares' | 'pain' | 'inflammation') => {
    if (!userId) {
      setError("No user found.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { bodyMapPreferencesRepository } = await import("@/lib/repositories/bodyMapPreferencesRepository");
      await bodyMapPreferencesRepository.setLastUsedLayer(userId, layer);
      setMessage(`✅ Last used layer set to: ${layer}`);
    } catch (err) {
      console.error("Failed to set layer", err);
      setError(err instanceof Error ? err.message : "Failed to set layer");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPreferences = async () => {
    if (!userId) {
      setError("No user found.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { db } = await import("@/lib/db/client");
      await db.bodyMapPreferences.delete(userId);
      setMessage("✅ Layer preferences cleared (will recreate defaults on next access)");
    } catch (err) {
      console.error("Failed to clear preferences", err);
      setError(err instanceof Error ? err.message : "Failed to clear preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNuclearReset = async () => {
    const confirmed = confirm(
      "🚨 NUCLEAR RESET - EXTREME WARNING 🚨\\n\\n" +
      "This will COMPLETELY ERASE EVERYTHING:\\n\\n" +
      "• ENTIRE IndexedDB database (all tables, all users)\\n" +
      "• ALL localStorage data\\n" +
      "• ALL sessionStorage data\\n" +
      "• ALL cookies\\n" +
      "• User account and preferences\\n\\n" +
      "The app will reload and you'll start from scratch.\\n" +
      "There is NO way to undo this!\\n\\n" +
      "Type 'DELETE EVERYTHING' if you're absolutely sure you want to proceed."
    );

    if (!confirmed) return;

    const doubleCheck = prompt(
      "Type 'DELETE EVERYTHING' (in all caps) to confirm nuclear reset:"
    );

    if (doubleCheck !== "DELETE EVERYTHING") {
      setError("Nuclear reset cancelled. You must type 'DELETE EVERYTHING' to confirm.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      console.log("[Nuclear Reset] Starting complete app reset...");

      // 1. Delete entire IndexedDB database
      const { db } = await import("@/lib/db/client");
      await db.delete();
      console.log("[Nuclear Reset] IndexedDB deleted");

      // 2. Clear localStorage
      localStorage.clear();
      console.log("[Nuclear Reset] localStorage cleared");

      // 3. Clear sessionStorage
      sessionStorage.clear();
      console.log("[Nuclear Reset] sessionStorage cleared");

      // 4. Clear all cookies
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      console.log("[Nuclear Reset] Cookies cleared");

      setMessage("✅ Nuclear reset complete! Reloading app...");

      // 5. Reload the page to start fresh
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error("Failed to complete nuclear reset", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during nuclear reset."
      );
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return null; // Don't show anything while loading
  }

  // Hide dev controls if user is not authorized (name is not "Steven")
  if (!isAuthorized) {
    return null;
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
      {/* Primary Generate Section */}
      <div className="rounded-lg border-2 border-dashed border-purple-500/60 bg-purple-500/10 p-6">
        <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">
          🎯 Generate Power User Data
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate realistic test data simulating years of health tracking by a power user.
          Includes flares, symptoms, triggers, medications, food logs, daily logs, correlations, and body map data.
        </p>

        {/* Year Selector */}
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Range: {selectedYears} {selectedYears === 1 ? 'year' : 'years'} of data
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
          <p className="text-xs text-muted-foreground mt-2">
            Generates approximately {selectedYears === 1 ? '15-25' : selectedYears === 2 ? '30-50' : selectedYears === 3 ? '45-75' : selectedYears === 4 ? '60-100' : '75-125'} flares,
            {' '}{selectedYears === 1 ? '300-600' : selectedYears === 2 ? '600-1200' : selectedYears === 3 ? '900-1800' : selectedYears === 4 ? '1200-2400' : '1500-3000'} events,
            and {selectedYears === 1 ? '220-290' : selectedYears === 2 ? '440-580' : selectedYears === 3 ? '660-870' : selectedYears === 4 ? '880-1160' : '1100-1450'} daily logs
          </p>
        </div>

        {/* Main Generate Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={() => handleGenerateScenario('comprehensive', selectedYears)}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center rounded-md bg-purple-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70 transition-all"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating {selectedYears} {selectedYears === 1 ? 'year' : 'years'} of data...
              </>
            ) : (
              <>
                ✨ Generate {selectedYears} {selectedYears === 1 ? 'Year' : 'Years'} of Power User Data
              </>
            )}
          </button>
        </div>

        {/* Advanced Options Toggle */}
        <div className="mt-6 border-t border-purple-300 dark:border-purple-700 pt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Options: Specific Scenarios
          </button>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose specific test scenarios optimized for particular features (analytics, patterns, stress testing)
          </p>
        </div>

        {/* Advanced Scenario Cards - Collapsible */}
        {showAdvanced && (
          <div className="mt-4 space-y-6 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-purple-200 dark:border-purple-800">
            <div className="space-y-2 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Selected Scenario: {scenarios.find(s => s.id === selectedScenario)?.name || 'Comprehensive'}
              </label>
            </div>

            {/* Scenario Cards - Grouped (Story 6.8) */}
        <div className="mt-6 space-y-6">
          {/* Basic Scenarios */}
          <div>
            <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <span className="mr-2">📚</span>
              Basic Scenarios
              <span className="ml-2 text-xs font-normal text-gray-500">Quick exploration and comprehensive testing</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.filter(s => s.group === 'basic').map((scenario) => (
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
                      <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {scenario.name}
                      </h5>
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
          </div>

          {/* Analytics Scenarios */}
          <div>
            <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <span className="mr-2">📈</span>
              Analytics Scenarios
              <span className="ml-2 text-xs font-normal text-gray-500">Optimized for Epic 6 insights features</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.filter(s => s.group === 'analytics').map((scenario) => (
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
                      <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {scenario.name}
                      </h5>
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
          </div>

          {/* Performance Scenarios */}
          <div>
            <h4 className="text-md font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <span className="mr-2">🚀</span>
              Performance Scenarios
              <span className="ml-2 text-xs font-normal text-gray-500">Stress testing with large datasets</span>
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scenarios.filter(s => s.group === 'performance').map((scenario) => (
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
                      <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {scenario.name}
                      </h5>
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
          </div>
        </div>

            {/* Generate Selected Scenario Button */}
            <div className="mt-6 flex justify-end">
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
            </div>
          </div>
        )}
      </div>

      {/* Database Utility Buttons */}
      <div className="rounded-lg border-2 border-dashed border-blue-500/60 bg-blue-500/10 p-6">
        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">
          🛠️ Database Utilities
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tools for managing default data, checking database state, and clearing test data.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCheckDefaults}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Checking…" : "Check Database"}
          </button>

          <button
            type="button"
            onClick={handleInitializeDefaults}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Initializing…" : "Initialize Defaults"}
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Resetting…" : "Reset Defaults"}
          </button>

          <button
            type="button"
            onClick={handleCleanupGhostUser}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Cleaning…" : "Cleanup Ghost User"}
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

        {/* Layer Preferences Section (Story 5.2) */}
        <div className="mt-6 p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">🗺️</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                Body Map Layer Preferences (Story 5.2)
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                Test layer preference persistence: reset to defaults, set specific layers, or clear preferences entirely.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleResetLayerPreferences}
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Resetting…" : "Reset to Defaults"}
            </button>
            <button
              type="button"
              onClick={() => handleSetLayer('pain')}
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              ⚡ Set Pain Layer
            </button>
            <button
              type="button"
              onClick={() => handleSetLayer('inflammation')}
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              🟣 Set Inflammation Layer
            </button>
            <button
              type="button"
              onClick={handleClearPreferences}
              disabled={isLoading}
              className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Clearing…" : "Clear Preferences"}
            </button>
          </div>
        </div>

        {/* Nuclear Reset Section */}
        <div className="mt-6 p-4 border-2 border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 dark:text-red-200">
                DANGER ZONE: Nuclear Reset
              </h4>
              <p className="text-xs text-red-800 dark:text-red-300 mt-1">
                This will completely erase EVERYTHING: entire database, localStorage, sessionStorage, cookies, and all user data. The app will reload to a completely fresh state.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNuclearReset}
            disabled={isLoading}
            className="inline-flex items-center rounded-md bg-red-700 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70 border-2 border-red-900"
          >
            {isLoading ? "Resetting…" : "🚨 NUCLEAR RESET - DELETE EVERYTHING"}
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
