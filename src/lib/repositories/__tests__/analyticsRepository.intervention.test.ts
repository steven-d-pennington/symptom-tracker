/**
 * Analytics Repository Intervention Effectiveness Tests (Story 3.5 - Task 9)
 *
 * Test suite for intervention effectiveness calculation methods.
 * Tests severity change calculation, 48h window logic, success rate, ranking, and thresholds.
 */

import { db } from '@/lib/db/client';
import { analyticsRepository } from '@/lib/repositories/analyticsRepository';
import { FlareRecord, FlareEventRecord } from '@/lib/db/schema';

describe('analyticsRepository - Intervention Effectiveness', () => {
  const testUserId = 'test-user-intervention';

  beforeEach(async () => {
    // Clear database before each test
    await db.flares.clear();
    await db.flareEvents.clear();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete();
  });

  // Helper to create a flare with intervention and severity events
  const createFlareWithIntervention = async (params: {
    flareId: string;
    interventionType: 'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other';
    severityBefore: number;
    severityAfter: number | null;
    interventionTimestamp: number;
  }) => {
    const { flareId, interventionType, severityBefore, severityAfter, interventionTimestamp } = params;

    // Create flare
    const flare: FlareRecord = {
      id: flareId,
      userId: testUserId,
      startDate: interventionTimestamp - 1000,
      status: 'active',
      bodyRegionId: 'test-region',
      initialSeverity: severityBefore,
      currentSeverity: severityAfter ?? severityBefore,
      createdAt: interventionTimestamp - 1000,
      updatedAt: Date.now(),
    };
    await db.flares.add(flare);

    // Add severity event before intervention
    const severityEvent: FlareEventRecord = {
      id: `${flareId}-severity-before`,
      flareId,
      userId: testUserId,
      eventType: 'severity_update',
      timestamp: interventionTimestamp - 500,
      severity: severityBefore,
    };
    await db.flareEvents.add(severityEvent);

    // Add intervention event
    const interventionEvent: FlareEventRecord = {
      id: `${flareId}-intervention`,
      flareId,
      userId: testUserId,
      eventType: 'intervention',
      timestamp: interventionTimestamp,
      interventionType,
      interventionDetails: `Applied ${interventionType}`,
    };
    await db.flareEvents.add(interventionEvent);

    // Add severity event 48h after intervention (if provided)
    if (severityAfter !== null) {
      const after48h = interventionTimestamp + (48 * 60 * 60 * 1000);
      const severityEventAfter: FlareEventRecord = {
        id: `${flareId}-severity-after`,
        flareId,
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: after48h,
        severity: severityAfter,
      };
      await db.flareEvents.add(severityEventAfter);
    }
  };

  describe('getInterventionEffectiveness', () => {
    it('should return empty array when no interventions exist', async () => {
      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');
      expect(result).toEqual([]);
    });

    it('should calculate severity change correctly (improvement)', async () => {
      await createFlareWithIntervention({
        flareId: 'flare-1',
        interventionType: 'ice',
        severityBefore: 8,
        severityAfter: 5,
        interventionTimestamp: Date.now() - (10 * 24 * 60 * 60 * 1000),
      });

      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      expect(result).toHaveLength(1);
      expect(result[0].interventionType).toBe('Ice');
      expect(result[0].usageCount).toBe(1);
      expect(result[0].averageSeverityChange).toBe(3); // 8 - 5 = 3 (improvement)
      expect(result[0].successRate).toBe(100); // 100% success (severity decreased)
    });

    it('should calculate severity change correctly (worsening)', async () => {
      await createFlareWithIntervention({
        flareId: 'flare-2',
        interventionType: 'heat',
        severityBefore: 5,
        severityAfter: 8,
        interventionTimestamp: Date.now() - (10 * 24 * 60 * 60 * 1000),
      });

      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      expect(result).toHaveLength(1);
      expect(result[0].interventionType).toBe('Heat');
      expect(result[0].averageSeverityChange).toBe(-3); // 5 - 8 = -3 (worsening)
      expect(result[0].successRate).toBe(0); // 0% success (severity increased)
    });

    it('should handle missing 48h data', async () => {
      await createFlareWithIntervention({
        flareId: 'flare-3',
        interventionType: 'medication',
        severityBefore: 7,
        severityAfter: null,
        interventionTimestamp: Date.now() - (10 * 24 * 60 * 60 * 1000),
      });

      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      expect(result).toHaveLength(1);
      expect(result[0].interventionType).toBe('Medication');
      expect(result[0].usageCount).toBe(1);
      expect(result[0].averageSeverityChange).toBeNull(); // No 48h data
      expect(result[0].successRate).toBeNull(); // No 48h data
    });

    it('should correctly identify sufficient vs insufficient data', async () => {
      // Create 6 ice interventions (sufficient)
      for (let i = 0; i < 6; i++) {
        await createFlareWithIntervention({
          flareId: `flare-ice-${i}`,
          interventionType: 'ice',
          severityBefore: 7,
          severityAfter: 5,
          interventionTimestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        });
      }

      // Create 3 heat interventions (insufficient)
      for (let i = 0; i < 3; i++) {
        await createFlareWithIntervention({
          flareId: `flare-heat-${i}`,
          interventionType: 'heat',
          severityBefore: 6,
          severityAfter: 4,
          interventionTimestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        });
      }

      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      const iceResult = result.find(r => r.interventionType === 'Ice');
      const heatResult = result.find(r => r.interventionType === 'Heat');

      expect(iceResult?.hasSufficientData).toBe(true); // >= 5 uses
      expect(heatResult?.hasSufficientData).toBe(false); // < 5 uses
    });

    it('should sort by success rate descending', async () => {
      // Ice: 100% success rate
      for (let i = 0; i < 5; i++) {
        await createFlareWithIntervention({
          flareId: `flare-ice-${i}`,
          interventionType: 'ice',
          severityBefore: 8,
          severityAfter: 5,
          interventionTimestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        });
      }

      // Heat: 60% success rate (3 out of 5)
      for (let i = 0; i < 5; i++) {
        await createFlareWithIntervention({
          flareId: `flare-heat-${i}`,
          interventionType: 'heat',
          severityBefore: 7,
          severityAfter: i < 3 ? 5 : 8, // First 3 improve, last 2 worsen
          interventionTimestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        });
      }

      // Medication: 40% success rate (2 out of 5)
      for (let i = 0; i < 5; i++) {
        await createFlareWithIntervention({
          flareId: `flare-med-${i}`,
          interventionType: 'medication',
          severityBefore: 6,
          severityAfter: i < 2 ? 4 : 7, // First 2 improve, last 3 worsen
          interventionTimestamp: Date.now() - (i * 24 * 60 * 60 * 1000),
        });
      }

      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      expect(result[0].interventionType).toBe('Ice'); // Highest success rate
      expect(result[1].interventionType).toBe('Heat'); // Middle success rate
      expect(result[2].interventionType).toBe('Medication'); // Lowest success rate
    });

    it('should filter by time range correctly', async () => {
      const now = Date.now();

      // Create intervention 10 days ago (within last30d)
      await createFlareWithIntervention({
        flareId: 'flare-recent',
        interventionType: 'ice',
        severityBefore: 8,
        severityAfter: 5,
        interventionTimestamp: now - (10 * 24 * 60 * 60 * 1000),
      });

      // Create intervention 60 days ago (outside last30d)
      await createFlareWithIntervention({
        flareId: 'flare-old',
        interventionType: 'ice',
        severityBefore: 7,
        severityAfter: 4,
        interventionTimestamp: now - (60 * 24 * 60 * 60 * 1000),
      });

      const result30d = await analyticsRepository.getInterventionEffectiveness(testUserId, 'last30d');
      const resultAllTime = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      expect(result30d[0].usageCount).toBe(1); // Only recent intervention
      expect(resultAllTime[0].usageCount).toBe(2); // Both interventions
    });

    it('should parse all intervention types correctly', async () => {
      const types: Array<'ice' | 'heat' | 'medication' | 'rest' | 'drainage' | 'other'> =
        ['ice', 'heat', 'medication', 'rest', 'drainage', 'other'];

      for (const type of types) {
        await createFlareWithIntervention({
          flareId: `flare-${type}`,
          interventionType: type,
          severityBefore: 7,
          severityAfter: 5,
          interventionTimestamp: Date.now() - (10 * 24 * 60 * 60 * 1000),
        });
      }

      const result = await analyticsRepository.getInterventionEffectiveness(testUserId, 'allTime');

      expect(result).toHaveLength(6);
      expect(result.map(r => r.interventionType)).toContain('Ice');
      expect(result.map(r => r.interventionType)).toContain('Heat');
      expect(result.map(r => r.interventionType)).toContain('Medication');
      expect(result.map(r => r.interventionType)).toContain('Rest');
      expect(result.map(r => r.interventionType)).toContain('Drainage');
      expect(result.map(r => r.interventionType)).toContain('Other');
    });
  });
});
