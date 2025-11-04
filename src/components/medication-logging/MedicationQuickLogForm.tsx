"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { medicationEventRepository } from "@/lib/repositories/medicationEventRepository";
import { toast } from "@/components/common/Toast";
import { MedicationCategory } from "./MedicationCategory";
import type { MedicationRecord } from "@/lib/db/schema";

interface MedicationQuickLogFormProps {
  userId: string;
}

interface MedicationWithUsage extends MedicationRecord {
  usageCount: number;
  isCommon: boolean;
  recentNotes?: string[];
}

/**
 * Quick Log Form for Medication Logging (Story 3.5.5)
 *
 * Features:
 * - Collapsible categories with smart defaults
 * - Quick log mode with optional details expansion
 * - Custom medications section
 * - Recent notes suggestions
 * - Effectiveness rating
 *
 * AC3.5.5.4: Collapsible categories for medications
 * AC3.5.5.5: Quick log mode for both types
 */
export function MedicationQuickLogForm({ userId }: MedicationQuickLogFormProps) {
  const router = useRouter();

  // Form state - Quick Log fields (essential)
  const [selectedMedication, setSelectedMedication] = useState<MedicationRecord | null>(null);
  const [effectiveness, setEffectiveness] = useState<number>(5);
  // FIX: datetime-local inputs expect LOCAL time, not UTC
  const getLocalDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const [timestamp, setTimestamp] = useState<string>(getLocalDateTimeString());

  // Form state - Add Details fields (optional, progressive disclosure)
  const [showDetails, setShowDetails] = useState(false);
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");

  // Data state
  const [medications, setMedications] = useState<MedicationWithUsage[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load category expansion state from localStorage (AC3.5.5.4)
  useEffect(() => {
    const storageKey = `medication-categories-expanded-${userId}`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setExpandedCategories(new Set(parsed));
      } catch (error) {
        console.error("Failed to parse saved expansion state:", error);
      }
    }
  }, [userId]);

  // Save category expansion state to localStorage (AC3.5.5.4)
  const saveExpansionState = useCallback((categories: Set<string>) => {
    const storageKey = `medication-categories-expanded-${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(categories)));
  }, [userId]);

  // Load medications and determine common ones
  useEffect(() => {
    const loadMedications = async () => {
      try {
        setIsLoading(true);

        // Get all active medications (Story 3.5.1: includes both customs and enabled defaults)
        const allActiveMedications = await medicationRepository.getActive(userId);

        // Filter to only show enabled medications (isEnabled: true) - Story 3.5.1, AC3.5.5.6
        const activeMedications = allActiveMedications.filter(medication => medication.isEnabled);

        // Get usage statistics to determine common medications
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

        const usageMap = new Map<string, number>();
        for (const medication of activeMedications) {
          const events = await medicationEventRepository.findByMedicationId(
            userId,
            medication.id
          );
          const recentEvents = events.filter(e => e.timestamp >= thirtyDaysAgo);
          if (recentEvents.length > 0) {
            usageMap.set(medication.id, recentEvents.length);
          }
        }

        // Get top 10 most used medications
        const sortedByUsage = Array.from(usageMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([id]) => id);

        // Enhance medications with usage data and load recent notes
        const medicationsWithUsage: MedicationWithUsage[] = await Promise.all(
          activeMedications.map(async (medication) => {
            const recentNotes = await medicationEventRepository.getRecentNotes(
              userId,
              medication.id,
              10
            );
            return {
              ...medication,
              usageCount: usageMap.get(medication.id) || 0,
              isCommon: sortedByUsage.includes(medication.id),
              recentNotes,
            };
          })
        );

        // Sort: common first (by usage count), then customs, then defaults, then alphabetically
        medicationsWithUsage.sort((a, b) => {
          // Common always first
          if (a.isCommon && !b.isCommon) return -1;
          if (!a.isCommon && b.isCommon) return 1;
          if (a.isCommon && b.isCommon) {
            return b.usageCount - a.usageCount;
          }

          // Among non-common: customs before defaults
          if (!a.isDefault && b.isDefault) return -1;
          if (a.isDefault && !b.isDefault) return 1;

          // Within same group: alphabetically
          return a.name.localeCompare(b.name);
        });

        setMedications(medicationsWithUsage);

        // Set default expansion state (AC3.5.5.4)
        // - Common medications and Custom medications expanded by default
        // - Other categories collapsed by default
        const defaultExpanded = new Set<string>();
        const hasCommon = medicationsWithUsage.some(m => m.isCommon);
        const hasCustom = medicationsWithUsage.some(m => !m.isDefault);

        if (hasCommon) {
          defaultExpanded.add("Common Medications");
        }
        if (hasCustom) {
          defaultExpanded.add("Custom");
        }

        // Only set default if no saved state
        setExpandedCategories((current) => {
          if (current.size === 0) {
            saveExpansionState(defaultExpanded);
            return defaultExpanded;
          }
          return current;
        });
      } catch (error) {
        console.error("Failed to load medications:", error);
        toast.error("Failed to load medications", {
          description: "Please try refreshing the page"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMedications();
  }, [userId, saveExpansionState]);

  // Group medications by category (AC3.5.5.4)
  const medicationsByCategory = useMemo(() => {
    const common = medications.filter(m => m.isCommon);
    const custom = medications.filter(m => !m.isDefault && !m.isCommon);

    // Group remaining medications by frequency (as a proxy for category)
    const grouped = new Map<string, MedicationWithUsage[]>();
    const remaining = medications.filter(m => !m.isCommon && m.isDefault);

    // Organize by medication type/category
    // We'll extract the type from the frequency field or create categories based on name patterns
    remaining.forEach(medication => {
      // For now, use a simple categorization based on common medication patterns
      let category = "Other";

      const nameLower = medication.name.toLowerCase();
      if (nameLower.includes("ibuprofen") || nameLower.includes("pain") || nameLower.includes("acetaminophen")) {
        category = "Pain Relief";
      } else if (nameLower.includes("antibiotic") || nameLower.includes("anti-inflammatory")) {
        category = "Medication";
      } else if (nameLower.includes("compress") || nameLower.includes("ice") || nameLower.includes("topical") || nameLower.includes("bandage") || nameLower.includes("drainage")) {
        category = "Treatment";
      } else if (nameLower.includes("rest") || medication.frequency === "as-needed") {
        category = "Self-Care";
      }

      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(medication);
    });

    return { common, custom, grouped };
  }, [medications]);

  // Handle category toggle
  const handleCategoryToggle = (categoryName: string, expanded: boolean) => {
    setExpandedCategories((current) => {
      const newSet = new Set(current);
      if (expanded) {
        newSet.add(categoryName);
      } else {
        newSet.delete(categoryName);
      }
      saveExpansionState(newSet);
      return newSet;
    });
  };

  // Handle medication selection
  const handleMedicationSelect = (medication: MedicationRecord) => {
    setSelectedMedication(medication);
    // Pre-fill dosage if available
    if (medication.dosage) {
      setDosage(medication.dosage);
    }

    // Scroll to form after selection on mobile
    setTimeout(() => {
      document.getElementById("quick-log-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  // Handle recent note selection
  const handleNoteSelect = (note: string) => {
    setNotes(note);
    setShowDetails(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedMedication) {
      toast.error("Please select a medication");
      return;
    }

    if (effectiveness < 1 || effectiveness > 10) {
      toast.error("Effectiveness must be between 1 and 10");
      return;
    }

    try {
      setIsSaving(true);

      // Create medication event
      const eventId = await medicationEventRepository.create({
        userId,
        medicationId: selectedMedication.id,
        timestamp: new Date(timestamp).getTime(),
        taken: true, // User is explicitly logging it, so it was taken
        dosage: showDetails && dosage ? dosage : selectedMedication.dosage,
        notes: showDetails && notes ? notes : undefined,
      });

      console.log("✅ Medication event created:", {
        eventId,
        userId,
        medicationId: selectedMedication.id,
        timestamp: new Date(timestamp).getTime(),
        timestampDate: new Date(timestamp).toLocaleString(),
        taken: true,
        dosage: showDetails && dosage ? dosage : selectedMedication.dosage,
        notes: showDetails && notes ? notes : undefined,
      });

      // Success feedback
      toast.success("Medication logged successfully", {
        description: selectedMedication.name,
        duration: 3000,
      });

      // Navigate back to dashboard with refresh flag
      router.push("/dashboard?refresh=medication");
    } catch (error) {
      console.error("Failed to log medication:", error);
      toast.error("Failed to log medication", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading medications...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no medications available
  if (medications.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <p className="text-lg font-medium text-foreground mb-2">No Medications Available</p>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't added any medications yet. Add medications from your settings to start logging.
          </p>
          <button
            onClick={() => router.push("/settings")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  // Get selected medication's recent notes for display
  const selectedMedicationData = selectedMedication
    ? medications.find(m => m.id === selectedMedication.id)
    : null;

  return (
    <div className="space-y-6">
      {/* Medication Categories */}
      {/* Common Medications Section - AC3.5.5.4 */}
      {medicationsByCategory.common.length > 0 && (
        <div>
          <MedicationCategory
            name="Common Medications"
            medications={medicationsByCategory.common}
            isExpanded={expandedCategories.has("Common Medications")}
            onToggle={(expanded) => handleCategoryToggle("Common Medications", expanded)}
            onSelectMedication={handleMedicationSelect}
            selectedMedicationId={selectedMedication?.id}
          />
        </div>
      )}

      {/* Custom Medications Section - AC3.5.5.4 */}
      {medicationsByCategory.custom.length > 0 && (
        <div>
          <MedicationCategory
            name="Custom"
            medications={medicationsByCategory.custom}
            isExpanded={expandedCategories.has("Custom")}
            onToggle={(expanded) => handleCategoryToggle("Custom", expanded)}
            onSelectMedication={handleMedicationSelect}
            selectedMedicationId={selectedMedication?.id}
          />
        </div>
      )}

      {/* Categorized Medications - AC3.5.5.4 */}
      {Array.from(medicationsByCategory.grouped.entries())
        .sort(([a], [b]) => a.localeCompare(b)) // Sort categories alphabetically
        .map(([category, categoryMedications]) => (
          <div key={category}>
            <MedicationCategory
              name={category}
              medications={categoryMedications}
              isExpanded={expandedCategories.has(category)}
              onToggle={(expanded) => handleCategoryToggle(category, expanded)}
              onSelectMedication={handleMedicationSelect}
              selectedMedicationId={selectedMedication?.id}
            />
          </div>
        ))}

      {/* Quick Log Form - AC3.5.5.5 */}
      {selectedMedication && (
        <form
          id="quick-log-form"
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">
            Log {selectedMedication.name}
          </h3>

          {/* Selected Medication Info */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-foreground">{selectedMedication.name}</div>
              {selectedMedication.dosage && (
                <div className="text-xs text-muted-foreground">{selectedMedication.dosage}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedMedication(null)}
              className="text-sm text-primary hover:text-primary/80"
            >
              Change
            </button>
          </div>

          {/* Effectiveness Slider - AC3.5.5.5 */}
          <div>
            <label htmlFor="effectiveness" className="block text-sm font-medium text-foreground mb-2">
              Effectiveness: {effectiveness}/10
            </label>
            <input
              id="effectiveness"
              type="range"
              min="1"
              max="10"
              value={effectiveness}
              onChange={(e) => setEffectiveness(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
              <span>1 (Low)</span>
              <span>5 (Moderate)</span>
              <span>10 (High)</span>
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-foreground mb-2">
              Time
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              max={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Add Details Button - AC3.5.5.5 */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium min-h-[44px]"
          >
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            {showDetails ? "Hide Details" : "Add Details"}
          </button>

          {/* Details Section - AC3.5.5.5 */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-border">
              {/* Dosage */}
              <div>
                <label htmlFor="dosage" className="block text-sm font-medium text-foreground mb-2">
                  Dosage (Optional)
                </label>
                <input
                  id="dosage"
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder={selectedMedication.dosage || "e.g., 200mg, 2 tablets"}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Recent Notes Chips */}
              {selectedMedicationData?.recentNotes && selectedMedicationData.recentNotes.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Recent Notes (tap to use)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedMedicationData.recentNotes.map((note, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleNoteSelect(note)}
                        className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors min-h-[44px]"
                      >
                        {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="How did it help? Any side effects?"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full min-h-[44px] py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : "Log Medication"}
          </button>
        </form>
      )}
    </div>
  );
}
