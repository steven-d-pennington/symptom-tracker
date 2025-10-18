/*
 CorrelationService
 - Computes correlations between food events and symptom instances across fixed time windows
 - Designed to be pure and testable; DB wiring can be added via a higher-level service
*/

export type WindowLabel =
  | "15m"
  | "30m"
  | "1h"
  | "2-4h"
  | "6-12h"
  | "24h"
  | "48h"
  | "72h";

export interface WindowRange {
  label: WindowLabel;
  startMs: number; // inclusive offset after food event
  endMs: number; // inclusive offset after food event
}

export interface WindowScore {
  window: WindowLabel;
  score: number; // statistical score (higher = stronger signal)
  sampleSize: number; // number of paired observations considered in this window
  pValue: number; // p-value from chi-square test (statistical significance)
}

export interface TimeRange {
  start: number; // epoch ms
  end: number; // epoch ms
}

export interface FoodEventLike {
  timestamp: number; // epoch ms
}

export interface SymptomInstanceLike {
  timestamp: number; // epoch ms
}

// Fixed windows (ascending)
export const WINDOW_SET: WindowRange[] = [
  { label: "15m", startMs: 0, endMs: 15 * 60 * 1000 },
  { label: "30m", startMs: 0, endMs: 30 * 60 * 1000 },
  { label: "1h", startMs: 0, endMs: 60 * 60 * 1000 },
  { label: "2-4h", startMs: 2 * 60 * 60 * 1000, endMs: 4 * 60 * 60 * 1000 },
  { label: "6-12h", startMs: 6 * 60 * 60 * 1000, endMs: 12 * 60 * 60 * 1000 },
  { label: "24h", startMs: 0, endMs: 24 * 60 * 60 * 1000 },
  { label: "48h", startMs: 0, endMs: 48 * 60 * 60 * 1000 },
  { label: "72h", startMs: 0, endMs: 72 * 60 * 60 * 1000 },
];

// Simple chi-square on 2x2 contingency table
function chiSquare(a: number, b: number, c: number, d: number): number {
  // Table:
  //            symptom    no symptom
  // afterFood     a            b
  // baseline      c            d
  const total = a + b + c + d;
  if (total === 0) return 0;
  const row1 = a + b;
  const row2 = c + d;
  const col1 = a + c;
  const col2 = b + d;
  // Expected values
  const e11 = (row1 * col1) / total;
  const e12 = (row1 * col2) / total;
  const e21 = (row2 * col1) / total;
  const e22 = (row2 * col2) / total;
  // Avoid division by zero
  const terms = [
    { o: a, e: e11 },
    { o: b, e: e12 },
    { o: c, e: e21 },
    { o: d, e: e22 },
  ].filter((t) => t.e > 0);
  const x2 = terms.reduce((sum, t) => sum + (t.o - t.e) * (t.o - t.e) / t.e, 0);
  return x2;
}

/**
 * Convert chi-square score to approximate p-value (df=1)
 * Simplified approximation for chi-square distribution with 1 degree of freedom
 * 
 * @param chiSquareScore Chi-square test statistic
 * @returns Approximate p-value
 * 
 * @see Story 2.4: Confidence calculations require p-value for statistical significance
 */
export function chiSquareToPValue(chiSquareScore: number): number {
  // Critical values for chi-square distribution (df=1)
  // p=0.05: 3.841, p=0.01: 6.635, p=0.001: 10.828
  if (chiSquareScore >= 10.828) return 0.001;
  if (chiSquareScore >= 6.635) return 0.01;
  if (chiSquareScore >= 3.841) return 0.05;
  if (chiSquareScore >= 2.706) return 0.10;
  if (chiSquareScore >= 1.0) return 0.20;
  return 0.30; // Weak or no association
}

function withinWindow(foodTs: number, symTs: number, win: WindowRange): boolean {
  const diff = symTs - foodTs;
  return diff >= win.startMs && diff <= win.endMs;
}

/**
 * Computes consistency metric for food-symptom correlation.
 * 
 * Consistency is the percentage of food occurrences followed by symptom within the time window.
 * Formula: (number of food events followed by symptom) / (total food events)
 * 
 * @param foodEvents Array of food event timestamps
 * @param symptomEvents Array of symptom instance timestamps
 * @param timeWindow Time window to check for symptom occurrence after food event
 * @returns Consistency as decimal 0-1 (e.g., 0.75 for 75% consistency)
 * 
 * @example
 * // User logs "Dairy" 10 times; symptom appears after 7 occurrences within 4-hour window
 * computeConsistency(dairyEvents, symptomEvents, { startMs: 0, endMs: 4 * 60 * 60 * 1000 })
 * // => 0.70 (70% consistency)
 * 
 * @see Story 2.4, Task 2: Consistency Metric Calculation
 */
export function computeConsistency(
  foodEvents: FoodEventLike[],
  symptomEvents: SymptomInstanceLike[],
  timeWindow: WindowRange
): number {
  // Edge case: no food events means no consistency data
  if (foodEvents.length === 0) {
    return 0;
  }

  // Count how many food events are followed by at least one symptom within the time window
  let foodFollowedBySymptom = 0;

  for (const foodEvent of foodEvents) {
    const hasSymptomWithinWindow = symptomEvents.some((symptomEvent) =>
      withinWindow(foodEvent.timestamp, symptomEvent.timestamp, timeWindow)
    );

    if (hasSymptomWithinWindow) {
      foodFollowedBySymptom++;
    }
  }

  // Calculate consistency as decimal (0-1)
  const consistency = foodFollowedBySymptom / foodEvents.length;
  return consistency;
}

export function bestWindow(scores: WindowScore[]): WindowScore | undefined {
  if (!scores.length) return undefined;
  // Prefer highest score; break ties by sample size
  return scores.reduce((best, cur) =>
    !best || cur.score > best.score || (cur.score === best.score && cur.sampleSize > best.sampleSize)
      ? cur
      : best,
  undefined as unknown as WindowScore);
}

// Test-friendly computation using in-memory data
export function computePairWithData(
  foodEvents: FoodEventLike[],
  symptoms: SymptomInstanceLike[],
  range: TimeRange,
  windows: WindowRange[] = WINDOW_SET
): WindowScore[] {
  // Filter by overall range for efficiency
  const events = foodEvents.filter((e) => e.timestamp >= range.start && e.timestamp <= range.end);
  const syms = symptoms.filter((s) => s.timestamp >= range.start && s.timestamp <= range.end);

  return windows.map((w) => {
    let afterFoodWithSymptom = 0;
    let afterFoodNoSymptom = 0;

    // For each food event, check if at least one symptom falls within window
    for (const fe of events) {
      const hasSym = syms.some((s) => withinWindow(fe.timestamp, s.timestamp, w));
      if (hasSym) afterFoodWithSymptom++;
      else afterFoodNoSymptom++;
    }

    // Baseline: symptoms outside of the window following each food event within the overall range
    // Simple proxy: total symptoms minus those matched above
    const matchedSymptomIds = new Set<number>();
    syms.forEach((s, idx) => {
      const matched = events.some((fe) => withinWindow(fe.timestamp, s.timestamp, w));
      if (matched) matchedSymptomIds.add(idx);
    });
    const baselineWithSymptom = syms.length - matchedSymptomIds.size;
    // Approximate baseline no-symptom as remaining range slots (not well-defined without exposure time);
    // use afterFoodNoSymptom as a stand-in to keep the 2x2 table stable.
    const baselineNoSymptom = afterFoodNoSymptom;

    const score = chiSquare(afterFoodWithSymptom, afterFoodNoSymptom, baselineWithSymptom, baselineNoSymptom);
    const sampleSize = events.length;
    const pValue = chiSquareToPValue(score);
    return { window: w.label, score, sampleSize, pValue };
  });
}

// Placeholder for DB-backed computation – to be wired with repositories/services.
export async function computePair(
  _userId: string,
  _foodId: string,
  _symptomId: string,
  range: TimeRange
): Promise<WindowScore[]> {
  // Intentionally not fetching DB data here to keep this layer pure/testable.
  // Upstream service can hydrate events and call computePairWithData.
  if (!range) return [];
  return [];
}

export async function scheduleRecompute(_userId: string, _range?: TimeRange): Promise<void> {
  // Placeholder – integrate with Vercel Cron/API route in app layer
  return;
}

