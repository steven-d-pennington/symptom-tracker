import { computePairWithData, bestWindow, WINDOW_SET } from '../CorrelationService';

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
});

