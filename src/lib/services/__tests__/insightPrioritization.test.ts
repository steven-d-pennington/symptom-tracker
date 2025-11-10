/**
 * Tests for Insight Prioritization Service (Story 6.4 - Task 14)
 *
 * Tests priority score calculation, sorting, grouping, and filtering algorithms.
 */

import {
  calculatePriorityScore,
  sortInsightsByPriority,
  groupInsightsByType,
  filterWeakCorrelations,
  getTopInsights,
  separateStrongCorrelations,
} from '../insightPrioritization';
import { CorrelationResult } from '@/types/correlation';

// Mock correlation data
const createMockCorrelation = (
  overrides: Partial<CorrelationResult> = {}
): CorrelationResult => ({
  id: 'test-id',
  userId: 'test-user',
  type: 'food-symptom',
  item1: 'Dairy',
  item2: 'Headache',
  coefficient: 0.7,
  strength: 'strong',
  significance: 0.01,
  sampleSize: 30,
  lagHours: 12,
  confidence: 'high',
  timeRange: '30d',
  calculatedAt: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe('calculatePriorityScore', () => {
  it('calculates priority score correctly for normal cases', () => {
    const correlation = createMockCorrelation({ coefficient: 0.72, sampleSize: 30 });
    const score = calculatePriorityScore(correlation);

    // Expected: |0.72| × ln(30) ≈ 0.72 × 3.40 ≈ 2.45
    expect(score).toBeCloseTo(2.45, 1);
  });

  it('handles edge case: sampleSize < 2', () => {
    const correlation = createMockCorrelation({ coefficient: 0.65, sampleSize: 1 });
    const score = calculatePriorityScore(correlation);

    // Expected: fallback to |ρ| only = 0.65
    expect(score).toBe(0.65);
  });

  it('uses absolute value of coefficient', () => {
    const positive = createMockCorrelation({ coefficient: 0.5, sampleSize: 10 });
    const negative = createMockCorrelation({ coefficient: -0.5, sampleSize: 10 });

    expect(calculatePriorityScore(positive)).toBe(calculatePriorityScore(negative));
  });
});

describe('sortInsightsByPriority', () => {
  it('sorts correlations by priority score descending', () => {
    const correlations = [
      createMockCorrelation({ coefficient: 0.5, sampleSize: 10 }), // Lower priority
      createMockCorrelation({ coefficient: 0.85, sampleSize: 50 }), // Highest priority
      createMockCorrelation({ coefficient: 0.65, sampleSize: 15 }), // Medium priority
    ];

    const sorted = sortInsightsByPriority(correlations);

    // Highest priority should be first
    expect(sorted[0].coefficient).toBe(0.85);
    expect(sorted[0].sampleSize).toBe(50);
  });

  it('uses secondary sort by coefficient when scores are equal', () => {
    const correlations = [
      createMockCorrelation({ coefficient: 0.5, sampleSize: 10 }),
      createMockCorrelation({ coefficient: 0.7, sampleSize: 10 }),
    ];

    const sorted = sortInsightsByPriority(correlations);

    // Higher coefficient should be first when sample sizes equal
    expect(sorted[0].coefficient).toBe(0.7);
  });
});

describe('groupInsightsByType', () => {
  it('groups correlations by type correctly', () => {
    const correlations = [
      createMockCorrelation({ type: 'food-symptom', item1: 'Dairy' }),
      createMockCorrelation({ type: 'trigger-symptom', item1: 'Stress' }),
      createMockCorrelation({ type: 'food-symptom', item1: 'Gluten' }),
      createMockCorrelation({ type: 'medication-symptom', item1: 'Ibuprofen' }),
    ];

    const grouped = groupInsightsByType(correlations);

    expect(grouped['food-symptom']).toHaveLength(2);
    expect(grouped['trigger-symptom']).toHaveLength(1);
    expect(grouped['medication-symptom']).toHaveLength(1);
    expect(grouped['food-flare']).toHaveLength(0);
    expect(grouped['trigger-flare']).toHaveLength(0);
  });
});

describe('filterWeakCorrelations', () => {
  it('filters correlations below threshold', () => {
    const correlations = [
      createMockCorrelation({ coefficient: 0.25 }), // Weak - should be filtered
      createMockCorrelation({ coefficient: 0.5 }), // Above threshold
      createMockCorrelation({ coefficient: -0.4 }), // Negative but above threshold
      createMockCorrelation({ coefficient: 0.1 }), // Weak - should be filtered
    ];

    const filtered = filterWeakCorrelations(correlations, 0.3);

    expect(filtered).toHaveLength(2);
    expect(Math.abs(filtered[0].coefficient)).toBeGreaterThanOrEqual(0.3);
    expect(Math.abs(filtered[1].coefficient)).toBeGreaterThanOrEqual(0.3);
  });
});

describe('getTopInsights', () => {
  it('returns top N prioritized insights', () => {
    const correlations = Array.from({ length: 10 }, (_, i) =>
      createMockCorrelation({
        coefficient: 0.3 + i * 0.05,
        sampleSize: 10 + i * 5,
      })
    );

    const top5 = getTopInsights(correlations, 5);

    expect(top5).toHaveLength(5);
    // Verify they are sorted by priority
    for (let i = 0; i < top5.length - 1; i++) {
      const score1 = calculatePriorityScore(top5[i]);
      const score2 = calculatePriorityScore(top5[i + 1]);
      expect(score1).toBeGreaterThanOrEqual(score2);
    }
  });
});

describe('separateStrongCorrelations', () => {
  it('separates strong and moderate correlations', () => {
    const correlations = [
      createMockCorrelation({ coefficient: 0.75 }), // Strong
      createMockCorrelation({ coefficient: 0.5 }), // Moderate
      createMockCorrelation({ coefficient: -0.8 }), // Strong (negative)
      createMockCorrelation({ coefficient: 0.4 }), // Moderate
    ];

    const { strong, moderate } = separateStrongCorrelations(correlations);

    expect(strong).toHaveLength(2);
    expect(moderate).toHaveLength(2);

    // Verify strong correlations
    strong.forEach((c) => {
      expect(Math.abs(c.coefficient)).toBeGreaterThanOrEqual(0.7);
    });

    // Verify moderate correlations
    moderate.forEach((c) => {
      expect(Math.abs(c.coefficient)).toBeLessThan(0.7);
    });
  });
});
