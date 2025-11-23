"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Check, Star } from "lucide-react";
import { SymptomRecord } from "@/lib/db/schema";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import { cn } from "@/lib/utils/cn";

interface SymptomWithUsage extends SymptomRecord {
  lastLogged?: Date;
  isFavorite: boolean;
}

interface SymptomSelectionListProps {
  symptoms: SymptomRecord[];
  selectedSymptom: SymptomRecord | null;
  onSymptomSelect: (symptom: SymptomRecord) => void;
  isLoading: boolean;
  userId: string;
}

/**
 * Symptom Selection List (Story 3.5.3)
 *
 * Full-page symptom selection interface with:
 * - Search/filter functionality
 * - Favorites (recently logged) at top
 * - Custom symptoms grouped separately
 * - Mobile-optimized touch targets (44x44px minimum)
 * - Natural scrolling (no nested scroll containers)
 *
 * AC3.5.3.7: Symptom selection redesigned for full-page
 * AC3.5.3.8: Mobile responsive with adequate touch targets
 */
export function SymptomSelectionList({
  symptoms,
  selectedSymptom,
  onSymptomSelect,
  isLoading,
  userId,
}: SymptomSelectionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [symptomsWithUsage, setSymptomsWithUsage] = useState<SymptomWithUsage[]>([]);

  // Load usage data to determine favorites
  useEffect(() => {
    const loadUsageData = async () => {
      try {
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

        // Enhance symptoms with usage data
        const enhanced: SymptomWithUsage[] = symptoms.map(symptom => ({
          ...symptom,
          lastLogged: usageMap.get(symptom.name),
          isFavorite: usageMap.has(symptom.name),
        }));

        // Sort: favorites first (by last logged), then customs, then defaults, then alphabetically
        enhanced.sort((a, b) => {
          // Favorites always first
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          if (a.isFavorite && b.isFavorite) {
            return (b.lastLogged?.getTime() || 0) - (a.lastLogged?.getTime() || 0);
          }

          // Among non-favorites: customs before defaults
          if (!a.isDefault && b.isDefault) return -1;
          if (a.isDefault && !b.isDefault) return 1;

          // Within same group: alphabetically
          return a.name.localeCompare(b.name);
        });

        setSymptomsWithUsage(enhanced);
      } catch (error) {
        console.error("Failed to load usage data:", error);
        // Fallback to symptoms without usage data
        setSymptomsWithUsage(symptoms.map(s => ({ ...s, isFavorite: false })));
      }
    };

    if (symptoms.length > 0) {
      loadUsageData();
    }
  }, [symptoms, userId]);

  // Filter symptoms based on search query
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return symptomsWithUsage;

    const query = searchQuery.toLowerCase();
    return symptomsWithUsage.filter(
      symptom =>
        symptom.name.toLowerCase().includes(query) ||
        symptom.category.toLowerCase().includes(query)
    );
  }, [symptomsWithUsage, searchQuery]);

  // Group symptoms for display
  const groupedSymptoms = useMemo(() => {
    const favorites = filteredSymptoms.filter(s => s.isFavorite);
    const customs = filteredSymptoms.filter(s => !s.isFavorite && !s.isDefault);
    const defaults = filteredSymptoms.filter(s => !s.isFavorite && s.isDefault);

    return { favorites, customs, defaults };
  }, [filteredSymptoms]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading symptoms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search symptoms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: "44px" }}
        />
      </div>

      {/* Symptoms display */}
      <div className="space-y-6">
        {/* Favorites section */}
        {groupedSymptoms.favorites.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Recently Logged
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {groupedSymptoms.favorites.map((symptom) => (
                <SymptomButton
                  key={symptom.id}
                  symptom={symptom}
                  isSelected={selectedSymptom?.id === symptom.id}
                  onSelect={onSymptomSelect}
                  showBadge={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom symptoms section */}
        {groupedSymptoms.customs.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Custom Symptoms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {groupedSymptoms.customs.map((symptom) => (
                <SymptomButton
                  key={symptom.id}
                  symptom={symptom}
                  isSelected={selectedSymptom?.id === symptom.id}
                  onSelect={onSymptomSelect}
                  showBadge={true}
                  badgeText="Custom"
                />
              ))}
            </div>
          </div>
        )}

        {/* Default symptoms section */}
        {groupedSymptoms.defaults.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Default Symptoms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {groupedSymptoms.defaults.map((symptom) => (
                <SymptomButton
                  key={symptom.id}
                  symptom={symptom}
                  isSelected={selectedSymptom?.id === symptom.id}
                  onSelect={onSymptomSelect}
                  showBadge={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredSymptoms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? `No symptoms found matching "${searchQuery}"`
                : "No symptoms available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual symptom button component
 * AC3.5.3.8: Minimum 44x44px touch targets
 */
interface SymptomButtonProps {
  symptom: SymptomRecord;
  isSelected: boolean;
  onSelect: (symptom: SymptomRecord) => void;
  showBadge?: boolean;
  badgeText?: string;
}

function SymptomButton({
  symptom,
  isSelected,
  onSelect,
  showBadge = false,
  badgeText = "Custom",
}: SymptomButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(symptom)}
      className={cn(
        "w-full text-left p-3 rounded-lg border-2 transition-all",
        "hover:border-primary hover:bg-primary/5",
        "flex items-center justify-between gap-2",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border bg-background"
      )}
      style={{ minHeight: "44px" }}
      aria-pressed={isSelected}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground text-sm truncate">
            {symptom.name}
          </span>
          {showBadge && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex-shrink-0">
              {badgeText}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {symptom.category}
        </span>
      </div>

      {isSelected && (
        <div className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}
