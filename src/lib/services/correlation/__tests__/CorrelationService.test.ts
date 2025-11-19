import {
  computePairWithData,
  bestWindow,
  computeConsistency,
  WINDOW_SET,
  type WindowRange,
  type CorrelationEventLike,
  type SymptomInstanceLike,
} from '../CorrelationService';

describe('CorrelationService', () => {
  test('computes window scores and selects best window', () => {
    const now = Date.now();
    const foods = [
      { timestamp: now - 60 * 60 * 1000 }, // 1h ago
      { timestamp: now - 3 * 60 * 60 * 1000 }, // 3h ago
      { timestamp: now - 26 * 60 * 60 * 1000 }, // 26h ago
    ];
    const syms = [
      { timestamp: now - 50 * 60 * 1000 }, // 50m ago (within 1h)
      { timestamp: now - 3.5 * 60 * 60 * 1000 }, // 3.5h ago (within 2-4h)
      { timestamp: now - 20 * 60 * 60 * 1000 }, // 20h ago (within 24h)
    ];

    const scores = computePairWithData(foods, syms, {
      start: now - 3 * 24 * 60 * 60 * 1000,
      end: now,
    });

    expect(scores).toHaveLength(WINDOW_SET.length);
    // Should produce non-negative scores
    scores.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.sampleSize).toBe(foods.length);
    });

    const best = bestWindow(scores);
    expect(best).toBeDefined();
    // Best should be one of the defined labels
    expect(WINDOW_SET.map((w) => w.label)).toContain(best!.window);
  });

  describe('computeConsistency', () => {
    const fourHourWindow: WindowRange = {
      label: "2-4h",
      startMs: 0,
      endMs: 4 * 60 * 60 * 1000 // 4 hours
    };

    it('should return 0.70 when 7 out of 10 food events are followed by symptom within window', () => {
      const now = Date.now();
      // Space food events 10 hours apart to avoid symptom overlap
      const foodEvents: CorrelationEventLike[] = Array.from({ length: 10 }, (_, i) => ({
        timestamp: now - (100 - i * 10) * 60 * 60 * 1000 // 100h ago, 90h ago, 80h ago, etc.
      }));

      // Symptoms follow ONLY 7 food events within 4-hour window
      // Food events 3, 6, 8 have NO symptoms within their 4-hour windows
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 2 * 60 * 60 * 1000 },   // 2h after food 0 ✓
        { timestamp: foodEvents[1].timestamp + 3 * 60 * 60 * 1000 },   // 3h after food 1 ✓
        { timestamp: foodEvents[2].timestamp + 1 * 60 * 60 * 1000 },   // 1h after food 2 ✓
        // Food 3 has NO symptom within its 4-hour window
        { timestamp: foodEvents[4].timestamp + 3.5 * 60 * 60 * 1000 }, // 3.5h after food 4 ✓
        { timestamp: foodEvents[5].timestamp + 2.5 * 60 * 60 * 1000 }, // 2.5h after food 5 ✓
        // Food 6 has NO symptom within its 4-hour window
        { timestamp: foodEvents[7].timestamp + 1.5 * 60 * 60 * 1000 }, // 1.5h after food 7 ✓
        // Food 8 has NO symptom within its 4-hour window
        { timestamp: foodEvents[9].timestamp + 2 * 60 * 60 * 1000 },   // 2h after food 9 ✓
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, fourHourWindow);
      expect(consistency).toBe(0.7); // 7/10 = 0.70
    });

    it('should return 0 when no food events are followed by symptom (0% consistency)', () => {
      const now = Date.now();
      const foodEvents: CorrelationEventLike[] = [
        { timestamp: now - 10 * 60 * 60 * 1000 },
        { timestamp: now - 20 * 60 * 60 * 1000 },
        { timestamp: now - 30 * 60 * 60 * 1000 },
        { timestamp: now - 40 * 60 * 60 * 1000 },
        { timestamp: now - 50 * 60 * 60 * 1000 },
      ];

      // Symptoms occur, but outside the 4-hour window (e.g., 6 hours later)
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 6 * 60 * 60 * 1000 },
        { timestamp: foodEvents[2].timestamp + 8 * 60 * 60 * 1000 },
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, fourHourWindow);
      expect(consistency).toBe(0); // 0/5 = 0
    });

    it('should return 1.0 when all food events are followed by symptom (100% consistency)', () => {
      const now = Date.now();
      const foodEvents: CorrelationEventLike[] = [
        { timestamp: now - 10 * 60 * 60 * 1000 },
        { timestamp: now - 20 * 60 * 60 * 1000 },
        { timestamp: now - 30 * 60 * 60 * 1000 },
        { timestamp: now - 40 * 60 * 60 * 1000 },
        { timestamp: now - 50 * 60 * 60 * 1000 },
      ];

      // Every food event followed by symptom within 4-hour window
      const symptomEvents: SymptomInstanceLike[] = foodEvents.map(fe => ({
        timestamp: fe.timestamp + 2 * 60 * 60 * 1000 // 2h after each food
      }));

      const consistency = computeConsistency(foodEvents, symptomEvents, fourHourWindow);
      expect(consistency).toBe(1.0); // 5/5 = 1.0
    });

    it('should return 0.625 for partial occurrences (5 out of 8)', () => {
      const now = Date.now();
      // Space food events 10 hours apart to avoid symptom overlap
      const foodEvents: CorrelationEventLike[] = Array.from({ length: 8 }, (_, i) => ({
        timestamp: now - (80 - i * 10) * 60 * 60 * 1000 // 80h ago, 70h ago, 60h ago, etc.
      }));

      // Symptoms follow ONLY 5 out of 8 food events within 4-hour window
      // Food events 1, 4, 6 have NO symptoms within their 4-hour windows
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 1 * 60 * 60 * 1000 },   // 1h after food 0 ✓
        // Food 1 has NO symptom within its 4-hour window
        { timestamp: foodEvents[2].timestamp + 2 * 60 * 60 * 1000 },   // 2h after food 2 ✓
        { timestamp: foodEvents[3].timestamp + 3 * 60 * 60 * 1000 },   // 3h after food 3 ✓
        // Food 4 has NO symptom within its 4-hour window
        { timestamp: foodEvents[5].timestamp + 1.5 * 60 * 60 * 1000 }, // 1.5h after food 5 ✓
        // Food 6 has NO symptom within its 4-hour window
        { timestamp: foodEvents[7].timestamp + 2.5 * 60 * 60 * 1000 }, // 2.5h after food 7 ✓
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, fourHourWindow);
      expect(consistency).toBe(0.625); // 5/8 = 0.625
    });

    it('should return 0 when food events array is empty', () => {
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: Date.now() },
      ];

      const consistency = computeConsistency([], symptomEvents, fourHourWindow);
      expect(consistency).toBe(0);
    });

    it('should return 0 when symptom events array is empty', () => {
      const foodEvents: CorrelationEventLike[] = [
        { timestamp: Date.now() },
        { timestamp: Date.now() - 60 * 60 * 1000 },
      ];

      const consistency = computeConsistency(foodEvents, [], fourHourWindow);
      expect(consistency).toBe(0); // 0/2 = 0 (no symptoms follow any food)
    });

    it('should respect different time windows (1-hour window)', () => {
      const now = Date.now();
      const oneHourWindow: WindowRange = {
        label: "1h",
        startMs: 0,
        endMs: 60 * 60 * 1000 // 1 hour
      };

      const foodEvents: CorrelationEventLike[] = [
        { timestamp: now - 5 * 60 * 60 * 1000 },
        { timestamp: now - 10 * 60 * 60 * 1000 },
        { timestamp: now - 15 * 60 * 60 * 1000 },
      ];

      // Two symptoms within 1h, one at 2h (outside window)
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 0.5 * 60 * 60 * 1000 }, // 30min after food 0 (within 1h)
        { timestamp: foodEvents[1].timestamp + 2 * 60 * 60 * 1000 },   // 2h after food 1 (outside 1h)
        { timestamp: foodEvents[2].timestamp + 0.9 * 60 * 60 * 1000 }, // 54min after food 2 (within 1h)
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, oneHourWindow);
      expect(consistency).toBeCloseTo(0.6667, 4); // 2/3 ≈ 0.6667
    });

    it('should respect different time windows (24-hour window)', () => {
      const now = Date.now();
      const twentyFourHourWindow: WindowRange = {
        label: "24h",
        startMs: 0,
        endMs: 24 * 60 * 60 * 1000 // 24 hours
      };

      const foodEvents: CorrelationEventLike[] = [
        { timestamp: now - 50 * 60 * 60 * 1000 },
        { timestamp: now - 60 * 60 * 60 * 1000 },
        { timestamp: now - 70 * 60 * 60 * 1000 },
        { timestamp: now - 80 * 60 * 60 * 1000 },
      ];

      // All symptoms within 24h of their respective food events
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 12 * 60 * 60 * 1000 },  // 12h after food 0
        { timestamp: foodEvents[1].timestamp + 20 * 60 * 60 * 1000 },  // 20h after food 1
        { timestamp: foodEvents[2].timestamp + 6 * 60 * 60 * 1000 },   // 6h after food 2
        { timestamp: foodEvents[3].timestamp + 18 * 60 * 60 * 1000 },  // 18h after food 3
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, twentyFourHourWindow);
      expect(consistency).toBe(1.0); // 4/4 = 1.0
    });

    it('should handle delayed symptoms at window boundary (3.9h vs 4.1h with 4h window)', () => {
      const now = Date.now();
      const foodEvents: CorrelationEventLike[] = [
        { timestamp: now - 10 * 60 * 60 * 1000 },
        { timestamp: now - 20 * 60 * 60 * 1000 },
      ];

      // One symptom at 3.9h (within window), one at 4.1h (outside window)
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 3.9 * 60 * 60 * 1000 },  // 3.9h - within 4h window
        { timestamp: foodEvents[1].timestamp + 4.1 * 60 * 60 * 1000 },  // 4.1h - outside 4h window
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, fourHourWindow);
      expect(consistency).toBe(0.5); // 1/2 = 0.5 (only first food followed within window)
    });

    it('should handle multiple symptoms within window for single food event (count as 1 match)', () => {
      const now = Date.now();
      const foodEvents: CorrelationEventLike[] = [
        { timestamp: now - 10 * 60 * 60 * 1000 },
      ];

      // Multiple symptoms within 4h of the single food event
      const symptomEvents: SymptomInstanceLike[] = [
        { timestamp: foodEvents[0].timestamp + 1 * 60 * 60 * 1000 },
        { timestamp: foodEvents[0].timestamp + 2 * 60 * 60 * 1000 },
        { timestamp: foodEvents[0].timestamp + 3 * 60 * 60 * 1000 },
      ];

      const consistency = computeConsistency(foodEvents, symptomEvents, fourHourWindow);
      expect(consistency).toBe(1.0); // 1/1 = 1.0 (single food event is followed by symptom)
    });
  });
});

