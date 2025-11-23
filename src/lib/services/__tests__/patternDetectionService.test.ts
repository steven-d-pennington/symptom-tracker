/**
 * Pattern Detection Service Tests
 * Story 6.5: Task 10 - Comprehensive test suite for pattern detection
 */

import { detectRecurringSequences, detectDayOfWeekPatterns } from '../patternDetectionService';
import type { TimelineEvent } from '@/components/timeline/TimelineView';
import type { CorrelationRecord } from '@/lib/db/schema';

describe('patternDetectionService', () => {
  const createTimelineEvent = (
    id: string,
    type: TimelineEvent['type'],
    timestamp: number,
    summary: string = `${type} event`
  ): TimelineEvent => ({
    id,
    type,
    timestamp,
    summary,
    eventRef: {},
  });

  const createCorrelation = (
    id: string,
    type: CorrelationRecord['type'],
    coefficient: number,
    lagHours: number = 12,
    item1: string = 'Item1',
    item2: string = 'Item2'
  ): CorrelationRecord => ({
    id,
    userId: 'user-123',
    type,
    item1,
    item2,
    coefficient,
    strength: Math.abs(coefficient) >= 0.7 ? 'strong' : Math.abs(coefficient) >= 0.5 ? 'moderate' : 'weak',
    lagHours,
    confidence: Math.abs(coefficient) >= 0.7 ? 'high' : Math.abs(coefficient) >= 0.5 ? 'medium' : 'low',
    timeRange: {
      start: Date.now() - 7 * 24 * 60 * 60 * 1000,
      end: Date.now(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  describe('detectRecurringSequences', () => {
    it('should detect food-symptom patterns with correct lag hours', () => {
      const baseTime = Date.now();
      
      const events: TimelineEvent[] = [
        createTimelineEvent('food-1', 'food', baseTime, 'Meal: Dairy'),
        createTimelineEvent('symptom-1', 'symptom', baseTime + 12 * 60 * 60 * 1000, 'Headache'),
        createTimelineEvent('food-2', 'food', baseTime + 24 * 60 * 60 * 1000, 'Meal: Dairy'),
        createTimelineEvent('symptom-2', 'symptom', baseTime + 36 * 60 * 60 * 1000, 'Headache'),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'food-symptom', 0.75, 12, 'Dairy', 'Headache'),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('food-symptom');
      expect(patterns[0].frequency).toBe(2);
      expect(patterns[0].lagHours).toBe(12);
      expect(patterns[0].occurrences).toHaveLength(2);
    });

    it('should filter out non-significant correlations (|ρ| < 0.3)', () => {
      const baseTime = Date.now();
      
      const events: TimelineEvent[] = [
        createTimelineEvent('food-1', 'food', baseTime),
        createTimelineEvent('symptom-1', 'symptom', baseTime + 12 * 60 * 60 * 1000),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-weak', 'food-symptom', 0.25, 12), // Below threshold
        createCorrelation('corr-strong', 'food-symptom', 0.75, 12), // Above threshold
      ];

      const patterns = detectRecurringSequences(events, correlations);

      // Should only detect pattern for significant correlation
      expect(patterns).toHaveLength(1);
      expect(patterns[0].coefficient).toBe(0.75);
    });

    it('should handle lag tolerance (±2 hours)', () => {
      const baseTime = Date.now();
      const lagHours = 12;
      const lagMs = lagHours * 60 * 60 * 1000;
      
      const events: TimelineEvent[] = [
        createTimelineEvent('food-1', 'food', baseTime),
        // Symptom occurs 11 hours later (within tolerance)
        createTimelineEvent('symptom-1', 'symptom', baseTime + lagMs - 60 * 60 * 1000),
        createTimelineEvent('food-2', 'food', baseTime + 24 * 60 * 60 * 1000),
        // Symptom occurs 13 hours later (within tolerance)
        createTimelineEvent('symptom-2', 'symptom', baseTime + 24 * 60 * 60 * 1000 + lagMs + 60 * 60 * 1000),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'food-symptom', 0.75, lagHours),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].occurrences).toHaveLength(2);
    });

    it('should not detect patterns outside lag tolerance', () => {
      const baseTime = Date.now();
      const lagHours = 12;
      const lagMs = lagHours * 60 * 60 * 1000;
      
      const events: TimelineEvent[] = [
        createTimelineEvent('food-1', 'food', baseTime),
        // Symptom occurs 15 hours later (outside tolerance)
        createTimelineEvent('symptom-1', 'symptom', baseTime + lagMs + 3 * 60 * 60 * 1000),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'food-symptom', 0.75, lagHours),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].occurrences).toHaveLength(0);
    });

    it('should detect trigger-symptom patterns', () => {
      const baseTime = Date.now();
      
      const events: TimelineEvent[] = [
        createTimelineEvent('trigger-1', 'trigger', baseTime),
        createTimelineEvent('symptom-1', 'symptom', baseTime + 6 * 60 * 60 * 1000),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'trigger-symptom', 0.65, 6),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('trigger-symptom');
      expect(patterns[0].lagHours).toBe(6);
    });

    it('should detect medication-symptom patterns', () => {
      const baseTime = Date.now();
      
      const events: TimelineEvent[] = [
        createTimelineEvent('med-1', 'medication', baseTime),
        createTimelineEvent('symptom-1', 'symptom', baseTime + 24 * 60 * 60 * 1000),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'medication-symptom', 0.8, 24),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(1);
      expect(patterns[0].type).toBe('medication-symptom');
    });

    it('should return empty array when no significant correlations exist', () => {
      const events: TimelineEvent[] = [
        createTimelineEvent('food-1', 'food', Date.now()),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-weak', 'food-symptom', 0.25, 12),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(0);
    });

    it('should return empty array when no events exist', () => {
      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'food-symptom', 0.75, 12),
      ];

      const patterns = detectRecurringSequences([], correlations);

      expect(patterns).toHaveLength(0);
    });

    it('should handle multiple correlation types', () => {
      const baseTime = Date.now();
      
      const events: TimelineEvent[] = [
        createTimelineEvent('food-1', 'food', baseTime),
        createTimelineEvent('symptom-1', 'symptom', baseTime + 12 * 60 * 60 * 1000),
        createTimelineEvent('trigger-1', 'trigger', baseTime + 24 * 60 * 60 * 1000),
        createTimelineEvent('symptom-2', 'symptom', baseTime + 30 * 60 * 60 * 1000),
      ];

      const correlations: CorrelationRecord[] = [
        createCorrelation('corr-1', 'food-symptom', 0.75, 12),
        createCorrelation('corr-2', 'trigger-symptom', 0.65, 6),
      ];

      const patterns = detectRecurringSequences(events, correlations);

      expect(patterns).toHaveLength(2);
      expect(patterns.find(p => p.type === 'food-symptom')).toBeDefined();
      expect(patterns.find(p => p.type === 'trigger-symptom')).toBeDefined();
    });
  });

  describe('detectDayOfWeekPatterns', () => {
    it('should detect day-of-week patterns in symptom events', () => {
      const baseDate = new Date('2025-01-05T10:00:00Z'); // Sunday
      const events: TimelineEvent[] = [];

      // Add symptoms for each day of the week (2 weeks)
      for (let week = 0; week < 2; week++) {
        for (let day = 0; day < 7; day++) {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + week * 7 + day);
          events.push(createTimelineEvent(
            `symptom-${week}-${day}`,
            'symptom',
            date.getTime(),
            `Symptom on ${date.toLocaleDateString()}`
          ));
        }
      }

      const patterns = detectDayOfWeekPatterns(events);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.every(p => p.dayOfWeek >= 0 && p.dayOfWeek <= 6)).toBe(true);
    });

    it('should return empty array when insufficient data (< 7 events)', () => {
      const events: TimelineEvent[] = [
        createTimelineEvent('symptom-1', 'symptom', Date.now()),
        createTimelineEvent('symptom-2', 'symptom', Date.now() + 24 * 60 * 60 * 1000),
      ];

      const patterns = detectDayOfWeekPatterns(events);

      expect(patterns).toHaveLength(0);
    });

    it('should only analyze symptom events', () => {
      const baseDate = new Date('2025-01-05T10:00:00Z');
      const events: TimelineEvent[] = [];

      // Add mix of event types
      for (let i = 0; i < 10; i++) {
        const date = new Date(baseDate);
        date.setDate(baseDate.getDate() + i);
        events.push(createTimelineEvent(`food-${i}`, 'food', date.getTime()));
        events.push(createTimelineEvent(`symptom-${i}`, 'symptom', date.getTime()));
      }

      const patterns = detectDayOfWeekPatterns(events);

      // Should only analyze symptoms, not foods
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should mark significant patterns (50% above average)', () => {
      const baseDate = new Date('2025-01-05T10:00:00Z'); // Sunday
      const events: TimelineEvent[] = [];

      // Add many symptoms on Monday, few on other days
      for (let week = 0; week < 4; week++) {
        for (let day = 0; day < 7; day++) {
          const date = new Date(baseDate);
          date.setDate(baseDate.getDate() + week * 7 + day);
          
          // Add 5 symptoms on Monday (day 1), 1 on other days
          const count = day === 1 ? 5 : 1;
          for (let i = 0; i < count; i++) {
            events.push(createTimelineEvent(
              `symptom-${week}-${day}-${i}`,
              'symptom',
              date.getTime() + i * 60 * 60 * 1000
            ));
          }
        }
      }

      const patterns = detectDayOfWeekPatterns(events);

      const mondayPattern = patterns.find(p => p.dayOfWeek === 1);
      expect(mondayPattern).toBeDefined();
      expect(mondayPattern!.isSignificant).toBe(true);
    });
  });
});

