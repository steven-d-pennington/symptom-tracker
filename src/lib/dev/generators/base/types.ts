/**
 * Base types for data generation system
 */

import { FlareRecord, SymptomRecord, MedicationRecord, TriggerRecord, FoodRecord } from "@/lib/db/schema";

export interface GenerationContext {
  userId: string;
  symptoms: SymptomRecord[];
  medications: MedicationRecord[];
  triggers: TriggerRecord[];
  foods: FoodRecord[];
  startDate: Date;
  endDate: Date;
  daysToGenerate: number;
  flares?: FlareRecord[];
}

export interface GeneratorConfig {
  timeRange: {
    daysBack: number;
    yearsToGenerate?: number;
  };
  flares: {
    count: { min: number; max: number };
    regionClustering: boolean;
    clusteringIntensity?: 'high' | 'medium' | 'low'; // How concentrated the clustering is
    generateEvents: boolean;
    eventsPerFlare: { min: number; max: number };
    interventionProbability: number; // 0-1
  };
  foodPatterns: {
    repeatCombinations: boolean;
    correlationStrength: 'high' | 'medium' | 'low' | 'mixed';
    patternsToCreate: number;
  };
  triggers: {
    correlationWithSymptoms: boolean;
    delayWindow: 'short' | 'medium' | 'long' | 'varied';
    correlationRate: number; // 0-1, percentage of triggers followed by symptoms
  };
  uxEvents: {
    generate: boolean;
    eventsPerDay: { min: number; max: number };
  };
  bodyMapLocations: {
    generate: boolean;
    locationsPerSymptom: { min: number; max: number };
  };
  photoAttachments: {
    generate: boolean;
    photosPerFlare: { min: number; max: number };
  };
}

export interface GeneratedDataResult {
  medicationEventsCreated: number;
  triggerEventsCreated: number;
  symptomInstancesCreated: number;
  flaresCreated: number;
  flareEventsCreated: number;
  foodEventsCreated: number;
  foodCombinationsCreated: number;
  uxEventsCreated: number;
  bodyMapLocationsCreated: number;
  photoAttachmentsCreated: number;
  moodEntriesCreated: number;
  sleepEntriesCreated: number;
  symptomsCreated: number;
  medicationsCreated: number;
  triggersCreated: number;
  foodsCreated: number;
  startDate: string;
  endDate: string;
  userId: string;
}

export interface FoodCombinationPattern {
  name: string;
  foodNames: string[]; // Must match food names in catalog
  repeatCount: number; // How many times to create this combination
  symptomName: string; // Which symptom follows
  delayHours: { min: number; max: number };
  correlationRate: number; // 0-1, what % of instances trigger symptom
  confidence: 'high' | 'medium' | 'low';
}

export interface TriggerCorrelationPattern {
  triggerName: string; // Must match trigger name
  symptomName: string; // Must match symptom name
  delayHours: { min: number; max: number };
  correlationRate: number; // 0-1, what % of trigger events lead to symptom
  intensity: 'low' | 'medium' | 'high' | 'varied';
}
