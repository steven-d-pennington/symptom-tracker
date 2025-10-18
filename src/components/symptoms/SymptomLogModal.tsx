"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search } from "lucide-react";
import { symptomRepository } from "@/lib/repositories/symptomRepository";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import { SymptomRecord } from "@/lib/db/schema";

interface SymptomLogModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
}

interface SymptomWithUsage extends SymptomRecord {
  lastLogged?: Date;
  isFavorite: boolean;
  recentNotes?: string[];
}

interface ExpandedSymptom {
  symptomId: string;
  severity: number;
  notes: string;
}

export function SymptomLogModal({
  userId,
  isOpen,
  onClose,
  onLogged,
}: SymptomLogModalProps) {
  const [symptoms, setSymptoms] = useState<SymptomWithUsage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSymptom, setExpandedSymptom] = useState<ExpandedSymptom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load symptoms and determine favorites
  useEffect(() => {
    if (!isOpen) return;

    const loadSymptoms = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all active symptoms
        const activeSymptoms = await symptomRepository.getActive(userId);

        // Get recent symptom instances (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentInstances = await symptomInstanceRepository.getByDateRange(
          userId,
          thirtyDaysAgo,
          new Date()
        );

        // Build usage map: symptomName -> last logged timestamp
        const usageMap = new Map<string, Date>();
        recentInstances.forEach(instance => {
          const existing = usageMap.get(instance.name);
          if (!existing || instance.timestamp > existing) {
            usageMap.set(instance.name, instance.timestamp);
          }
        });

        // Enhance symptoms with usage data and load recent notes
        const symptomsWithUsage: SymptomWithUsage[] = await Promise.all(
          activeSymptoms.map(async (symptom) => {
            const recentNotes = await symptomInstanceRepository.getRecentNotes(
              userId,
              symptom.name,
              10
            );
            return {
              ...symptom,
              lastLogged: usageMap.get(symptom.name),
              isFavorite: usageMap.has(symptom.name),
              recentNotes,
            };
          })
        );

        // Sort: favorites first (by last logged), then alphabetically
        symptomsWithUsage.sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          if (a.isFavorite && b.isFavorite) {
            return (b.lastLogged?.getTime() || 0) - (a.lastLogged?.getTime() || 0);
          }
          return a.name.localeCompare(b.name);
        });

        setSymptoms(symptomsWithUsage);
      } catch (err) {
        console.error("Failed to load symptoms:", err);
        setError("Failed to load symptoms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSymptoms();
  }, [userId, isOpen]);

  // Filter symptoms based on search query
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return symptoms;

    const query = searchQuery.toLowerCase();
    return symptoms.filter(
      symptom =>
        symptom.name.toLowerCase().includes(query) ||
        symptom.category.toLowerCase().includes(query)
    );
  }, [symptoms, searchQuery]);

  // Group symptoms by category
  const symptomsByCategory = useMemo(() => {
    const favorites = filteredSymptoms.filter(s => s.isFavorite);
    const others = filteredSymptoms.filter(s => !s.isFavorite);

    const grouped = new Map<string, SymptomWithUsage[]>();
    others.forEach(symptom => {
      const category = symptom.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(symptom);
    });

    return { favorites, grouped };
  }, [filteredSymptoms]);

  // One-tap logging: immediately log symptom
  const handleSymptomTap = async (symptom: SymptomRecord) => {
    // If already expanded, collapse it
    if (expandedSymptom?.symptomId === symptom.id) {
      setExpandedSymptom(null);
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);

      // Create symptom instance with minimal data
      await symptomInstanceRepository.create({
        userId,
        name: symptom.name,
        category: symptom.category,
        severity: 5, // Default mid-range severity
        severityScale: {
          type: "numeric",
          ...symptom.severityScale,
        },
        timestamp: new Date(),
      });

      setSuccessMessage(`${symptom.name} logged`);
      setTimeout(() => setSuccessMessage(null), 2000);

      // Expand for optional details
      setExpandedSymptom({
        symptomId: symptom.id,
        severity: 5,
        notes: '',
      });

      // Notify parent
      onLogged?.();
    } catch (err) {
      console.error("Failed to log symptom:", err);
      setError(`Failed to log ${symptom.name}. Please try again.`);
    }
  };

  // Update severity and notes (progressive disclosure)
  const handleUpdateDetails = async () => {
    if (!expandedSymptom) return;

    try {
      const symptom = symptoms.find(s => s.id === expandedSymptom.symptomId);
      if (!symptom) return;

      // Find the most recent instance we just created
      const recentInstances = await symptomInstanceRepository.getByDateRange(
        userId,
        new Date(Date.now() - 60000), // Last minute
        new Date()
      );

      const instance = recentInstances.find(i => i.name === symptom.name);
      if (instance) {
        await symptomInstanceRepository.update(instance.id, {
          severity: expandedSymptom.severity,
          notes: expandedSymptom.notes,
        });

        setSuccessMessage(`${symptom.name} details updated`);
        setTimeout(() => setSuccessMessage(null), 2000);
      }

      setExpandedSymptom(null);
    } catch (err) {
      console.error("Failed to update details:", err);
      setError("Failed to update details. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-card p-4 sm:p-6 my-4 sm:my-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Log Symptom
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search filter */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symptoms..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Success/Error messages */}
          {successMessage && (
            <div
              className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading symptoms...
            </div>
          ) : filteredSymptoms.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery ? 'No symptoms found' : 'No symptoms available'}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Favorites section */}
              {symptomsByCategory.favorites.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Recent / Favorites
                  </h4>
                  <div className="space-y-2">
                    {symptomsByCategory.favorites.map((symptom) => (
                      <div key={symptom.id}>
                        <button
                          type="button"
                          onClick={() => handleSymptomTap(symptom)}
                          className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          <div className="font-medium text-foreground">
                            {symptom.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {symptom.category}
                          </div>
                        </button>

                        {/* Expanded details form */}
                        {expandedSymptom?.symptomId === symptom.id && (
                          <div className="mt-2 p-4 border border-border rounded-lg bg-background space-y-3">
                            {/* Recent notes chips */}
                            {symptom.recentNotes && symptom.recentNotes.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">
                                  Recent notes:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {symptom.recentNotes.map((note, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() =>
                                        setExpandedSymptom({
                                          ...expandedSymptom,
                                          notes: note,
                                        })
                                      }
                                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                    >
                                      {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">
                                Severity: {expandedSymptom.severity}/10
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={expandedSymptom.severity}
                                onChange={(e) =>
                                  setExpandedSymptom({
                                    ...expandedSymptom,
                                    severity: parseInt(e.target.value),
                                  })
                                }
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Minimal</span>
                                <span>Extreme</span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground mb-1">
                                Notes (optional)
                              </label>
                              <textarea
                                value={expandedSymptom.notes}
                                onChange={(e) =>
                                  setExpandedSymptom({
                                    ...expandedSymptom,
                                    notes: e.target.value,
                                  })
                                }
                                rows={2}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                                placeholder="Additional details..."
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedSymptom(null)}
                                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleUpdateDetails}
                                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                Save Details
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized symptoms */}
              {Array.from(symptomsByCategory.grouped.entries()).map(
                ([category, categorySymptoms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {categorySymptoms.map((symptom) => (
                        <div key={symptom.id}>
                          <button
                            type="button"
                            onClick={() => handleSymptomTap(symptom)}
                            className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
                          >
                            <div className="font-medium text-foreground">
                              {symptom.name}
                            </div>
                          </button>

                          {/* Expanded details form */}
                          {expandedSymptom?.symptomId === symptom.id && (
                            <div className="mt-2 p-4 border border-border rounded-lg bg-background space-y-3">
                              {/* Recent notes chips */}
                              {symptom.recentNotes && symptom.recentNotes.length > 0 && (
                                <div className="space-y-1">
                                  <div className="text-xs text-muted-foreground">
                                    Recent notes:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {symptom.recentNotes.map((note, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                          setExpandedSymptom({
                                            ...expandedSymptom,
                                            notes: note,
                                          })
                                        }
                                        className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                                      >
                                        {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                  Severity: {expandedSymptom.severity}/10
                                </label>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={expandedSymptom.severity}
                                  onChange={(e) =>
                                    setExpandedSymptom({
                                      ...expandedSymptom,
                                      severity: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>Minimal</span>
                                  <span>Extreme</span>
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                  Notes (optional)
                                </label>
                                <textarea
                                  value={expandedSymptom.notes}
                                  onChange={(e) =>
                                    setExpandedSymptom({
                                      ...expandedSymptom,
                                      notes: e.target.value,
                                    })
                                  }
                                  rows={2}
                                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                                  placeholder="Additional details..."
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedSymptom(null)}
                                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={handleUpdateDetails}
                                  className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                >
                                  Save Details
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
