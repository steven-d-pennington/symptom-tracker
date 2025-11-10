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
  | 'stress-test'
  | 'analytics-showcase'
  | 'pattern-detection';

export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
  icon: string;
  recommendedYears: number;
  config: (years?: number) => GeneratorConfig;
  group: 'basic' | 'analytics' | 'performance'; // Story 6.8: Scenario grouping
}

/**
 * All available scenarios
 */
export const SCENARIOS: Record<ScenarioType, Scenario> = {
  'quick-start': {
    id: 'quick-start',
    name: 'Quick Start',
    description: 'Lightweight 2-week dataset for quick exploration. Includes variety of events with enough data to preview features.',
    icon: '🎯',
    group: 'basic',
    recommendedYears: 2 / 52, // 2 weeks
    config: (years = 2 / 52) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 3, max: 5 }, // More flares for better preview
        regionClustering: true, // Enable clustering to show problem areas feature
        clusteringIntensity: 'medium',
        generateEvents: true,
        eventsPerFlare: { min: 4, max: 6 },
        interventionProbability: 0.6,
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
    description: 'Optimized for analytics testing with rich flare histories, interventions, and severity progressions. Generates enough data for all analytics features.',
    icon: '🔥',
    group: 'basic',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: Math.floor(years * 18), max: Math.floor(years * 24) }, // More flares for better analytics
        regionClustering: true,
        clusteringIntensity: 'medium', // Balance between clustering and variety
        generateEvents: true,
        eventsPerFlare: { min: 6, max: 12 }, // More events per flare for richer histories
        interventionProbability: 0.8, // Very high intervention rate for effectiveness analytics
      },
      foodPatterns: {
        repeatCombinations: true, // Enable patterns for correlation testing
        correlationStrength: 'medium',
        patternsToCreate: 3,
      },
      triggers: {
        correlationWithSymptoms: true, // Enable correlations for trigger analysis
        delayWindow: 'varied',
        correlationRate: 0.6,
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
    description: 'High-confidence food patterns with synergistic combinations and clear delay windows. Optimized for food diary and correlation analysis.',
    icon: '🍽️',
    group: 'basic',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: Math.floor(years * 12), max: Math.floor(years * 16) }, // More flares for better correlations
        regionClustering: true,
        clusteringIntensity: 'low',
        generateEvents: true,
        eventsPerFlare: { min: 4, max: 7 },
        interventionProbability: 0.5,
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
    description: 'Clear trigger-symptom correlations with realistic time delays. Optimized for testing correlation and trigger analysis features.',
    icon: '⚠️',
    group: 'basic',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: Math.floor(years * 12), max: Math.floor(years * 16) }, // More flares for better trigger analysis
        regionClustering: true,
        clusteringIntensity: 'low',
        generateEvents: true,
        eventsPerFlare: { min: 4, max: 7 },
        interventionProbability: 0.5,
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
    group: 'basic',
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
    group: 'basic',
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
    group: 'performance',
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

  'analytics-showcase': {
    id: 'analytics-showcase',
    name: 'Analytics Showcase',
    description: 'Demonstrates correlation analysis, treatment effectiveness, and pattern detection with strong intentional patterns for insights testing. High correlation strength, 80% daily log coverage, 12-month timeframe.',
    icon: '📊',
    group: 'analytics',
    recommendedYears: 1,
    config: (years = 1) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 20, max: 25 }, // 20-25 flares for strong clustering
        regionClustering: true,
        clusteringIntensity: 'high', // High clustering for clear patterns
        generateEvents: true,
        eventsPerFlare: { min: 6, max: 10 },
        interventionProbability: 0.8, // High intervention rate for treatment effectiveness
      },
      foodPatterns: {
        repeatCombinations: true,
        correlationStrength: 'high', // Strong correlations (0.85 target)
        patternsToCreate: 4, // Strong food-symptom relationships
      },
      triggers: {
        correlationWithSymptoms: true,
        delayWindow: 'varied',
        correlationRate: 0.8, // High correlation rate for clear patterns
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
      // Story 6.8: Analytics-specific configuration
      dailyLogCoverage: 0.8, // 80% daily log coverage (very high)
      intentionalPatterns: true, // Enable intentional recurring patterns
    }),
  },

  'pattern-detection': {
    id: 'pattern-detection',
    name: 'Pattern Detection',
    description: 'Focused dataset with recurring patterns and consistent time windows for testing timeline pattern highlighting and detection. 6-month concentrated timeframe with day-of-week patterns, food delay windows, and medication effectiveness patterns.',
    icon: '🔍',
    group: 'analytics',
    recommendedYears: 0.5,
    config: (years = 0.5) => ({
      timeRange: {
        daysBack: Math.floor(years * 365),
        yearsToGenerate: years,
      },
      flares: {
        count: { min: 10, max: 14 }, // Fewer flares, more concentrated
        regionClustering: true,
        clusteringIntensity: 'high', // High clustering for pattern clarity
        generateEvents: true,
        eventsPerFlare: { min: 5, max: 8 },
        interventionProbability: 0.7,
      },
      foodPatterns: {
        repeatCombinations: true,
        correlationStrength: 'high', // Consistent delay windows
        patternsToCreate: 3, // Focused patterns (dairy → headache)
      },
      triggers: {
        correlationWithSymptoms: true,
        delayWindow: 'short', // Consistent 6-12 hour delays
        correlationRate: 0.85, // Very high - same triggers → same symptoms repeatedly
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
        generate: false, // Skip photos for pattern focus
        photosPerFlare: { min: 0, max: 0 },
      },
      // Story 6.8: Pattern detection configuration
      dailyLogCoverage: 0.7, // 70% coverage for good daily pattern visibility
      intentionalPatterns: true, // Enable recurring sequence patterns
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
