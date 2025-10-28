/**
 * Data Generation Scenarios
 *
 * Predefined scenarios for testing different application features.
 * Each scenario is optimized to test specific functionality.
 */

import { GeneratorConfig } from "../generators/base/types";

export type ScenarioType =
  | 'quick-start'
  | 'flare-progression'
  | 'food-correlations'
  | 'trigger-analysis'
  | 'problem-areas'
  | 'comprehensive'
  | 'stress-test';

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  icon: string;
  recommendedYears: number;
  config: (years?: number) => GeneratorConfig;
}

/**
 * All available scenarios
 */
export const SCENARIOS: Record<ScenarioType, Scenario> = {
  'quick-start': {
    id: 'quick-start',
    name: 'Quick Start',
    description: 'Basic 1-week dataset perfect for first-time exploration. Includes a few events of each type.',
    icon: '🎯',
    recommendedYears: 1 / 52, // 1 week
    config: (years = 1 / 52) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 1, max: 2 },
        regionClustering: false,
        generateEvents: true,
        eventsPerFlare: { min: 3, max: 5 },
        interventionProbability: 0.4,
      },
      foodPatterns: {
        repeatCombinations: false, // No patterns, just variety
        correlationStrength: 'mixed',
        patternsToCreate: 0,
      },
      triggers: {
        correlationWithSymptoms: false, // Random for quick start
        delayWindow: 'varied',
        correlationRate: 0.3,
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 3, max: 8 },
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 1 },
      },
      photoAttachments: {
        generate: false, // Skip photos for quick start
        photosPerFlare: { min: 0, max: 0 },
      },
    }),
  },

  'flare-progression': {
    id: 'flare-progression',
    name: 'Flare Progression',
    description: 'Focused on flare tracking with detailed event histories, interventions, and severity progressions.',
    icon: '🔥',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 8, max: 12 },
        regionClustering: true,
        clusteringIntensity: 'low', // Slight preferences, mostly varied
        generateEvents: true,
        eventsPerFlare: { min: 5, max: 10 },
        interventionProbability: 0.7, // High intervention rate
      },
      foodPatterns: {
        repeatCombinations: false,
        correlationStrength: 'low',
        patternsToCreate: 1,
      },
      triggers: {
        correlationWithSymptoms: false,
        delayWindow: 'varied',
        correlationRate: 0.3,
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 5, max: 12 },
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 2 },
      },
      photoAttachments: {
        generate: true,
        photosPerFlare: { min: 1, max: 3 },
      },
    }),
  },

  'food-correlations': {
    id: 'food-correlations',
    name: 'Food Correlations',
    description: 'High-confidence food patterns with synergistic combinations and clear delay windows.',
    icon: '🍽️',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 3, max: 5 },
        regionClustering: false,
        generateEvents: true,
        eventsPerFlare: { min: 3, max: 6 },
        interventionProbability: 0.3,
      },
      foodPatterns: {
        repeatCombinations: true, // KEY: Create intentional patterns
        correlationStrength: 'high',
        patternsToCreate: 4,
      },
      triggers: {
        correlationWithSymptoms: false,
        delayWindow: 'varied',
        correlationRate: 0.3,
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 4, max: 10 },
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 1 },
      },
      photoAttachments: {
        generate: false,
        photosPerFlare: { min: 0, max: 0 },
      },
    }),
  },

  'trigger-analysis': {
    id: 'trigger-analysis',
    name: 'Trigger Analysis',
    description: 'Clear trigger-symptom correlations with realistic time delays for testing correlation dashboard.',
    icon: '⚠️',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 3, max: 5 },
        regionClustering: false,
        generateEvents: true,
        eventsPerFlare: { min: 3, max: 6 },
        interventionProbability: 0.3,
      },
      foodPatterns: {
        repeatCombinations: false,
        correlationStrength: 'medium',
        patternsToCreate: 2,
      },
      triggers: {
        correlationWithSymptoms: true, // KEY: Create causal links
        delayWindow: 'varied',
        correlationRate: 0.75, // High correlation
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 4, max: 10 },
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 1 },
      },
      photoAttachments: {
        generate: false,
        photosPerFlare: { min: 0, max: 0 },
      },
    }),
  },

  'problem-areas': {
    id: 'problem-areas',
    name: 'Problem Areas',
    description: 'Clustered flares in specific regions (3+ per region) to test Problem Areas analytics.',
    icon: '🗺️',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 12, max: 16 }, // More flares for clustering
        regionClustering: true,
        clusteringIntensity: 'high', // KEY: Aggressive clustering for analytics testing
        generateEvents: true,
        eventsPerFlare: { min: 4, max: 8 },
        interventionProbability: 0.5,
      },
      foodPatterns: {
        repeatCombinations: false,
        correlationStrength: 'medium',
        patternsToCreate: 2,
      },
      triggers: {
        correlationWithSymptoms: false,
        delayWindow: 'varied',
        correlationRate: 0.4,
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 5, max: 12 },
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 2 },
      },
      photoAttachments: {
        generate: true,
        photosPerFlare: { min: 1, max: 2 },
      },
    }),
  },

  'comprehensive': {
    id: 'comprehensive',
    name: 'Comprehensive',
    description: 'All features enabled with realistic data volumes. Perfect for complete application testing.',
    icon: '📊',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: Math.floor(years * 15), max: Math.floor(years * 25) },
        regionClustering: true,
        clusteringIntensity: 'medium', // Balanced - some clustering but good variety
        generateEvents: true,
        eventsPerFlare: { min: 5, max: 10 },
        interventionProbability: 0.6,
      },
      foodPatterns: {
        repeatCombinations: true,
        correlationStrength: 'mixed', // All confidence levels
        patternsToCreate: 5,
      },
      triggers: {
        correlationWithSymptoms: true,
        delayWindow: 'varied',
        correlationRate: 0.7,
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 6, max: 15 },
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 2 },
      },
      photoAttachments: {
        generate: true,
        photosPerFlare: { min: 1, max: 3 },
      },
    }),
  },

  'stress-test': {
    id: 'stress-test',
    name: 'Stress Test',
    description: 'High-volume data for performance testing. Tests UI rendering and database performance.',
    icon: '🚀',
    recommendedYears: 2,
    config: (years = 2) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: Math.floor(years * 30), max: Math.floor(years * 40) }, // Many flares
        regionClustering: true,
        clusteringIntensity: 'medium', // Variety for realistic stress testing
        generateEvents: true,
        eventsPerFlare: { min: 8, max: 15 }, // Many events per flare
        interventionProbability: 0.8,
      },
      foodPatterns: {
        repeatCombinations: true,
        correlationStrength: 'mixed',
        patternsToCreate: 8,
      },
      triggers: {
        correlationWithSymptoms: true,
        delayWindow: 'varied',
        correlationRate: 0.7,
      },
      uxEvents: {
        generate: true,
        eventsPerDay: { min: 10, max: 20 }, // High activity
      },
      bodyMapLocations: {
        generate: true,
        locationsPerSymptom: { min: 1, max: 3 },
      },
      photoAttachments: {
        generate: true,
        photosPerFlare: { min: 2, max: 4 },
      },
    }),
  },
};

/**
 * Get scenario by ID
 */
export function getScenario(id: ScenarioType): Scenario {
  return SCENARIOS[id];
}

/**
 * Get all scenarios as array
 */
export function getAllScenarios(): Scenario[] {
  return Object.values(SCENARIOS);
}

/**
 * Get scenario configuration with custom year override
 */
export function getScenarioConfig(id: ScenarioType, years?: number): GeneratorConfig {
  const scenario = getScenario(id);
  return scenario.config(years || scenario.recommendedYears);
}
