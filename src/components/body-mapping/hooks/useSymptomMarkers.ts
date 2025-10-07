import { useMemo, useState } from "react";
import { BodyMapLocation } from "@/lib/types/body-mapping";

export interface SymptomFilter {
  dateRange?: { start: Date; end: Date };
  severityRange?: { min: number; max: number };
  regionIds?: string[];
  symptomIds?: string[];
}

export function useSymptomMarkers(symptoms: BodyMapLocation[]) {
  const [filter, setFilter] = useState<SymptomFilter>({});

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((symptom) => {
      // Date range filter
      if (filter.dateRange) {
        const symptomDate = new Date(symptom.createdAt);
        if (
          symptomDate < filter.dateRange.start ||
          symptomDate > filter.dateRange.end
        ) {
          return false;
        }
      }

      // Severity range filter
      if (filter.severityRange) {
        if (
          symptom.severity < filter.severityRange.min ||
          symptom.severity > filter.severityRange.max
        ) {
          return false;
        }
      }

      // Region filter
      if (filter.regionIds && filter.regionIds.length > 0) {
        if (!filter.regionIds.includes(symptom.bodyRegionId)) {
          return false;
        }
      }

      // Symptom filter
      if (filter.symptomIds && filter.symptomIds.length > 0) {
        if (!filter.symptomIds.includes(symptom.symptomId)) {
          return false;
        }
      }

      return true;
    });
  }, [symptoms, filter]);

  const symptomsByRegion = useMemo(() => {
    const grouped = new Map<string, BodyMapLocation[]>();
    filteredSymptoms.forEach((symptom) => {
      const existing = grouped.get(symptom.bodyRegionId) || [];
      grouped.set(symptom.bodyRegionId, [...existing, symptom]);
    });
    return grouped;
  }, [filteredSymptoms]);

  const severityByRegion = useMemo(() => {
    const severities: Record<string, number> = {};
    filteredSymptoms.forEach((symptom) => {
      if (
        !severities[symptom.bodyRegionId] ||
        symptom.severity > severities[symptom.bodyRegionId]
      ) {
        severities[symptom.bodyRegionId] = symptom.severity;
      }
    });
    return severities;
  }, [filteredSymptoms]);

  const getMarkerCluster = (regionId: string) => {
    return symptomsByRegion.get(regionId) || [];
  };

  const getHighestSeverityInRegion = (regionId: string): number => {
    const regionSymptoms = symptomsByRegion.get(regionId);
    if (!regionSymptoms || regionSymptoms.length === 0) return 0;
    return Math.max(...regionSymptoms.map((s) => s.severity));
  };

  const getAverageSeverityInRegion = (regionId: string): number => {
    const regionSymptoms = symptomsByRegion.get(regionId);
    if (!regionSymptoms || regionSymptoms.length === 0) return 0;
    const sum = regionSymptoms.reduce((acc, s) => acc + s.severity, 0);
    return sum / regionSymptoms.length;
  };

  const getMostAffectedRegions = (limit: number = 5) => {
    return Array.from(symptomsByRegion.entries())
      .map(([regionId, symptoms]) => ({
        regionId,
        count: symptoms.length,
        avgSeverity:
          symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length,
        maxSeverity: Math.max(...symptoms.map((s) => s.severity)),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  };

  return {
    filter,
    setFilter,
    filteredSymptoms,
    symptomsByRegion,
    severityByRegion,
    getMarkerCluster,
    getHighestSeverityInRegion,
    getAverageSeverityInRegion,
    getMostAffectedRegions,
  };
}
