"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { treatmentRepository } from "@/lib/repositories/treatmentRepository";
import { treatmentEventRepository } from "@/lib/repositories/treatmentEventRepository";
import { toast } from "@/components/common/Toast";
import { TreatmentCategory } from "./TreatmentCategory";
import type { TreatmentRecord } from "@/lib/db/schema";
import { scheduleRecalculation } from "@/lib/services/correlationCalculationService";

interface TreatmentQuickLogFormProps {
    userId: string;
}

interface TreatmentWithUsage extends TreatmentRecord {
    usageCount: number;
    isCommon: boolean;
    recentNotes?: string[];
}

/**
 * Quick Log Form for Treatment Logging
 *
 * Features:
 * - Collapsible categories with smart defaults
 * - Quick log mode with optional details expansion
 * - Custom treatments section
 * - Recent notes suggestions
 * - Effectiveness rating
 * - Duration input
 */
export function TreatmentQuickLogForm({ userId }: TreatmentQuickLogFormProps) {
    const router = useRouter();

    // Form state - Quick Log fields (essential)
    const [selectedTreatment, setSelectedTreatment] = useState<TreatmentRecord | null>(null);
    const [effectiveness, setEffectiveness] = useState<number>(5);

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
    const [duration, setDuration] = useState<string>("");
    const [notes, setNotes] = useState("");

    // Data state
    const [treatments, setTreatments] = useState<TreatmentWithUsage[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load category expansion state from localStorage
    useEffect(() => {
        const storageKey = `treatment-categories-expanded-${userId}`;
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

    // Save category expansion state to localStorage
    const saveExpansionState = useCallback((categories: Set<string>) => {
        const storageKey = `treatment-categories-expanded-${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(categories)));
    }, [userId]);

    // Load treatments and determine common ones
    useEffect(() => {
        const loadTreatments = async () => {
            try {
                setIsLoading(true);

                // Get all active treatments
                const allActiveTreatments = await treatmentRepository.getActive(userId);

                // Filter to only show enabled treatments
                const activeTreatments = allActiveTreatments.filter(t => t.isEnabled);

                // Get usage statistics to determine common treatments
                const now = Date.now();
                const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

                const usageMap = new Map<string, number>();
                for (const treatment of activeTreatments) {
                    const events = await treatmentEventRepository.findByTreatment(
                        userId,
                        treatment.id,
                        thirtyDaysAgo,
                        now
                    );
                    if (events.length > 0) {
                        usageMap.set(treatment.id, events.length);
                    }
                }

                // Get top 10 most used treatments
                const sortedByUsage = Array.from(usageMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([id]) => id);

                // Enhance treatments with usage data and load recent notes
                const treatmentsWithUsage: TreatmentWithUsage[] = await Promise.all(
                    activeTreatments.map(async (treatment) => {
                        const recentNotes = await treatmentEventRepository.getRecentNotes(
                            userId,
                            treatment.id,
                            10
                        );
                        return {
                            ...treatment,
                            usageCount: usageMap.get(treatment.id) || 0,
                            isCommon: sortedByUsage.includes(treatment.id),
                            recentNotes,
                        };
                    })
                );

                // Sort: common first (by usage count), then customs, then defaults, then alphabetically
                treatmentsWithUsage.sort((a, b) => {
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

                setTreatments(treatmentsWithUsage);

                // Set default expansion state
                const defaultExpanded = new Set<string>();
                const hasCommon = treatmentsWithUsage.some(t => t.isCommon);
                const hasCustom = treatmentsWithUsage.some(t => !t.isDefault);

                if (hasCommon) {
                    defaultExpanded.add("Common Treatments");
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
                console.error("Failed to load treatments:", error);
                toast.error("Failed to load treatments", {
                    description: "Please try refreshing the page"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadTreatments();
    }, [userId, saveExpansionState]);

    // Group treatments by category
    const treatmentsByCategory = useMemo(() => {
        const common = treatments.filter(t => t.isCommon);
        const custom = treatments.filter(t => !t.isDefault && !t.isCommon);

        // Group remaining treatments by category
        const grouped = new Map<string, TreatmentWithUsage[]>();
        const remaining = treatments.filter(t => !t.isCommon && t.isDefault);

        remaining.forEach(treatment => {
            const category = treatment.category || "Other";
            if (!grouped.has(category)) {
                grouped.set(category, []);
            }
            grouped.get(category)!.push(treatment);
        });

        return { common, custom, grouped };
    }, [treatments]);

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

    // Handle treatment selection
    const handleTreatmentSelect = (treatment: TreatmentRecord) => {
        setSelectedTreatment(treatment);
        // Pre-fill duration if available
        if (treatment.duration) {
            setDuration(treatment.duration.toString());
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

        if (!selectedTreatment) {
            toast.error("Please select a treatment");
            return;
        }

        if (effectiveness < 1 || effectiveness > 10) {
            toast.error("Effectiveness must be between 1 and 10");
            return;
        }

        try {
            setIsSaving(true);

            const eventId = await treatmentEventRepository.create({
                userId,
                treatmentId: selectedTreatment.id,
                timestamp: new Date(timestamp).getTime(),
                duration: showDetails && duration ? parseInt(duration) : (selectedTreatment.duration || 0),
                effectiveness,
                notes: showDetails && notes ? notes : undefined,
            });

            toast.success("Treatment logged successfully", {
                description: selectedTreatment.name,
                duration: 3000,
            });

            scheduleRecalculation(userId);

            // Navigate back to dashboard with refresh flag
            router.push("/dashboard?refresh=treatment");
        } catch (error) {
            console.error("Failed to log treatment:", error);
            toast.error("Failed to log treatment", {
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
                    <p className="text-sm text-muted-foreground">Loading treatments...</p>
                </div>
            </div>
        );
    }

    if (treatments.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-md">
                    <p className="text-lg font-medium text-foreground mb-2">No Treatments Available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        You haven't added any treatments yet. Add treatments from your settings to start logging.
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

    const selectedTreatmentData = selectedTreatment
        ? treatments.find(t => t.id === selectedTreatment.id)
        : null;

    return (
        <div className="space-y-6">
            {/* Common Treatments Section */}
            {treatmentsByCategory.common.length > 0 && (
                <div>
                    <TreatmentCategory
                        name="Common Treatments"
                        treatments={treatmentsByCategory.common}
                        isExpanded={expandedCategories.has("Common Treatments")}
                        onToggle={(expanded) => handleCategoryToggle("Common Treatments", expanded)}
                        onSelectTreatment={handleTreatmentSelect}
                        selectedTreatmentId={selectedTreatment?.id}
                    />
                </div>
            )}

            {/* Custom Treatments Section */}
            {treatmentsByCategory.custom.length > 0 && (
                <div>
                    <TreatmentCategory
                        name="Custom"
                        treatments={treatmentsByCategory.custom}
                        isExpanded={expandedCategories.has("Custom")}
                        onToggle={(expanded) => handleCategoryToggle("Custom", expanded)}
                        onSelectTreatment={handleTreatmentSelect}
                        selectedTreatmentId={selectedTreatment?.id}
                    />
                </div>
            )}

            {/* Categorized Treatments */}
            {Array.from(treatmentsByCategory.grouped.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, categoryTreatments]) => (
                    <div key={category}>
                        <TreatmentCategory
                            name={category}
                            treatments={categoryTreatments}
                            isExpanded={expandedCategories.has(category)}
                            onToggle={(expanded) => handleCategoryToggle(category, expanded)}
                            onSelectTreatment={handleTreatmentSelect}
                            selectedTreatmentId={selectedTreatment?.id}
                        />
                    </div>
                ))}

            {/* Quick Log Form */}
            {selectedTreatment && (
                <form
                    id="quick-log-form"
                    onSubmit={handleSubmit}
                    className="bg-card border border-border rounded-lg p-6 space-y-4"
                >
                    <h3 className="text-lg font-semibold text-foreground">
                        Log {selectedTreatment.name}
                    </h3>

                    {/* Selected Treatment Info */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                            <div className="font-medium text-foreground">{selectedTreatment.name}</div>
                            {selectedTreatment.duration && (
                                <div className="text-xs text-muted-foreground">{selectedTreatment.duration} mins</div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedTreatment(null)}
                            className="text-sm text-primary hover:text-primary/80"
                        >
                            Change
                        </button>
                    </div>

                    {/* Effectiveness Slider */}
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

                    {/* Add Details Button */}
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium min-h-[44px]"
                    >
                        {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        {showDetails ? "Hide Details" : "Add Details"}
                    </button>

                    {/* Details Section */}
                    {showDetails && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            {/* Duration */}
                            <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-foreground mb-2">
                                    Duration (minutes)
                                </label>
                                <input
                                    id="duration"
                                    type="number"
                                    min="0"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder={selectedTreatment.duration?.toString() || "20"}
                                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Recent Notes Chips */}
                            {selectedTreatmentData?.recentNotes && selectedTreatmentData.recentNotes.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">
                                        Recent Notes (tap to use)
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTreatmentData.recentNotes.map((note, idx) => (
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
                                    placeholder="How did it help?"
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
                        {isSaving ? "Saving..." : "Log Treatment"}
                    </button>
                </form>
            )}
        </div>
    );
}
