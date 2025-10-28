/**
 * Analytics Repository Tests (Story 3.1 - Task 10, Story 3.2 - Task 11)
 *
 * Test suite for analytics repository data aggregation methods.
 * Tests problem areas calculation, time range filtering, sorting, and thresholds.
 * Tests per-region flare queries and statistics calculation (Story 3.2).
 */

import { db } from '@/lib/db/client';
import { analyticsRepository } from '@/lib/repositories/analyticsRepository';
import { FlareRecord, FlareEventRecord } from '@/lib/db/schema';

describe('analyticsRepository', () => {
  const testUserId = 'test-user-analytics';
  const otherUserId = 'other-user-123';

  beforeEach(async () => {
    // Clear database before each test
    await db.flares.clear();
    await db.flareEvents.clear();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete();
  });

  describe('getProblemAreas', () => {
    // Helper function to create test flares
    const createTestFlare = async (
      bodyRegionId: string,
      daysAgo: number,
      userId: string = testUserId
    ): Promise<FlareRecord> => {
      const startDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      const flare: FlareRecord = {
        id: `flare-${bodyRegionId}-${daysAgo}`,
        userId,
        startDate,
        status: 'active',
        bodyRegionId,
        initialSeverity: 5,
        currentSeverity: 5,
        createdAt: startDate,
        updatedAt: startDate,
      };
      await db.flares.add(flare);
      return flare;
    };

    it('should return sorted array by flare count descending', async () => {
      // Create flares: 5 in left-shoulder, 3 in right-knee, 4 in lower-back
      await createTestFlare('left-shoulder', 10);
      await createTestFlare('left-shoulder', 20);
      await createTestFlare('left-shoulder', 30);
      await createTestFlare('left-shoulder', 40);
      await createTestFlare('left-shoulder', 50);

      await createTestFlare('right-knee', 15);
      await createTestFlare('right-knee', 25);
      await createTestFlare('right-knee', 35);

      await createTestFlare('lower-back', 12);
      await createTestFlare('lower-back', 22);
      await createTestFlare('lower-back', 32);
      await createTestFlare('lower-back', 42);

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      // AC3.1.2: Sorted by flare count descending
      expect(problemAreas).toHaveLength(3);
      expect(problemAreas[0].bodyRegionId).toBe('left-shoulder');
      expect(problemAreas[0].flareCount).toBe(5);
      expect(problemAreas[1].bodyRegionId).toBe('lower-back');
      expect(problemAreas[1].flareCount).toBe(4);
      expect(problemAreas[2].bodyRegionId).toBe('right-knee');
      expect(problemAreas[2].flareCount).toBe(3);
    });

    it('should filter by time range: last30d', async () => {
      // Create flares at different time points
      await createTestFlare('left-shoulder', 10); // 10 days ago - within 30d
      await createTestFlare('left-shoulder', 20); // 20 days ago - within 30d
      await createTestFlare('left-shoulder', 25); // 25 days ago - within 30d
      await createTestFlare('left-shoulder', 40); // 40 days ago - outside 30d
      await createTestFlare('left-shoulder', 50); // 50 days ago - outside 30d

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'last30d');

      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].flareCount).toBe(3); // Only 3 flares within last 30 days
    });

    it('should filter by time range: last90d', async () => {
      await createTestFlare('right-knee', 30); // within 90d
      await createTestFlare('right-knee', 60); // within 90d
      await createTestFlare('right-knee', 85); // within 90d
      await createTestFlare('right-knee', 100); // outside 90d

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'last90d');

      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].flareCount).toBe(3); // Only 3 flares within last 90 days
    });

    it('should filter by time range: lastYear', async () => {
      await createTestFlare('lower-back', 100); // within 1 year
      await createTestFlare('lower-back', 200); // within 1 year
      await createTestFlare('lower-back', 300); // within 1 year
      await createTestFlare('lower-back', 400); // outside 1 year

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'lastYear');

      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].flareCount).toBe(3); // Only 3 flares within last year
    });

    it('should include all flares when timeRange is allTime', async () => {
      await createTestFlare('neck', 10);
      await createTestFlare('neck', 100);
      await createTestFlare('neck', 500);

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].flareCount).toBe(3); // All 3 flares included
    });

    it('should exclude regions with < 3 flares (minimum threshold)', async () => {
      // Create 2 flares in left-shoulder (below threshold)
      await createTestFlare('left-shoulder', 10);
      await createTestFlare('left-shoulder', 20);

      // Create 3 flares in right-knee (at threshold)
      await createTestFlare('right-knee', 15);
      await createTestFlare('right-knee', 25);
      await createTestFlare('right-knee', 35);

      // Create 1 flare in lower-back (below threshold)
      await createTestFlare('lower-back', 12);

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      // AC3.1.2: Only regions with 3+ flares included
      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].bodyRegionId).toBe('right-knee');
    });

    it('should calculate percentage correctly', async () => {
      // Create 6 flares: 4 in left-shoulder, 2 in right-knee (but right-knee excluded by threshold)
      await createTestFlare('left-shoulder', 10);
      await createTestFlare('left-shoulder', 20);
      await createTestFlare('left-shoulder', 30);
      await createTestFlare('left-shoulder', 40);

      await createTestFlare('right-knee', 15);
      await createTestFlare('right-knee', 25);

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      // Only left-shoulder included (right-knee has < 3 flares)
      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].percentage).toBeCloseTo(66.67, 1); // 4/6 * 100 = 66.67%
    });

    it('should return empty array when no flares in time range', async () => {
      // Create flares outside the time range
      await createTestFlare('left-shoulder', 100); // outside last30d

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'last30d');

      expect(problemAreas).toEqual([]);
    });

    it('should return empty array when no flares exist', async () => {
      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      expect(problemAreas).toEqual([]);
    });

    it('should isolate by userId (multi-user support)', async () => {
      // Create flares for test user
      await createTestFlare('left-shoulder', 10, testUserId);
      await createTestFlare('left-shoulder', 20, testUserId);
      await createTestFlare('left-shoulder', 30, testUserId);

      // Create flares for other user (should not be included)
      await createTestFlare('left-shoulder', 15, otherUserId);
      await createTestFlare('left-shoulder', 25, otherUserId);
      await createTestFlare('left-shoulder', 35, otherUserId);

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].flareCount).toBe(3); // Only test user's flares
    });

    it('should include both active and resolved flares', async () => {
      // Create active flares
      const activeFlare1 = await createTestFlare('left-shoulder', 10);
      const activeFlare2 = await createTestFlare('left-shoulder', 20);

      // Create resolved flare
      const resolvedFlare: FlareRecord = {
        id: 'resolved-flare-1',
        userId: testUserId,
        startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
        endDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
        status: 'resolved',
        bodyRegionId: 'left-shoulder',
        initialSeverity: 7,
        currentSeverity: 2,
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      };
      await db.flares.add(resolvedFlare);

      const problemAreas = await analyticsRepository.getProblemAreas(testUserId, 'allTime');

      expect(problemAreas).toHaveLength(1);
      expect(problemAreas[0].flareCount).toBe(3); // Active + resolved = 3
    });
  });

  // Story 3.2 - Task 11: Tests for per-region analytics
  describe('getFlaresByRegion', () => {
    const testRegion = 'left-shoulder';
    const otherRegion = 'right-knee';

    // Helper to create flare with events
    const createFlareWithEvents = async (
      bodyRegionId: string,
      daysAgo: number,
      status: string = 'active',
      severity: number = 5
    ) => {
      const startDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      const flareId = `flare-${bodyRegionId}-${daysAgo}`;

      const flare: FlareRecord = {
        id: flareId,
        userId: testUserId,
        startDate,
        status: status as any,
        bodyRegionId,
        initialSeverity: severity,
        currentSeverity: severity,
        endDate: status === 'resolved' ? Date.now() - (daysAgo - 5) * 24 * 60 * 60 * 1000 : undefined,
        createdAt: startDate,
        updatedAt: startDate,
      };
      await db.flares.add(flare);

      // Add severity event
      const event: FlareEventRecord = {
        id: `event-${flareId}-1`,
        flareId,
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: startDate + 1000,
        severity,
      };
      await db.flareEvents.add(event);

      // Add trend event
      const trendEvent: FlareEventRecord = {
        id: `event-${flareId}-2`,
        flareId,
        userId: testUserId,
        eventType: 'trend_change',
        timestamp: startDate + 2000,
        trend: 'improving',
      };
      await db.flareEvents.add(trendEvent);

      return flare;
    };

    it('should return flares sorted by startDate descending', async () => {
      await createFlareWithEvents(testRegion, 10);
      await createFlareWithEvents(testRegion, 20);
      await createFlareWithEvents(testRegion, 5);

      const flares = await analyticsRepository.getFlaresByRegion(testUserId, testRegion);

      expect(flares).toHaveLength(3);
      expect(flares[0].duration).toBeLessThan(flares[1].duration); // Most recent first
    });

    it('should filter by userId and regionId correctly', async () => {
      await createFlareWithEvents(testRegion, 10);
      await createFlareWithEvents(otherRegion, 10);

      const flare: FlareRecord = {
        id: 'other-user-flare',
        userId: otherUserId,
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'active',
        bodyRegionId: testRegion,
        initialSeverity: 5,
        currentSeverity: 5,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      };
      await db.flares.add(flare);

      const flares = await analyticsRepository.getFlaresByRegion(testUserId, testRegion);

      expect(flares).toHaveLength(1);
      expect(flares[0].flareId).toContain(testRegion);
    });

    it('should calculate duration correctly', async () => {
      await createFlareWithEvents(testRegion, 10, 'resolved');

      const flares = await analyticsRepository.getFlaresByRegion(testUserId, testRegion);

      expect(flares[0].duration).toBeGreaterThan(0);
      expect(flares[0].duration).toBeLessThanOrEqual(10);
    });

    it('should extract peak severity from flare events', async () => {
      const startDate = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const flareId = 'test-severity-flare';

      const flare: FlareRecord = {
        id: flareId,
        userId: testUserId,
        startDate,
        status: 'active',
        bodyRegionId: testRegion,
        initialSeverity: 3,
        currentSeverity: 5,
        createdAt: startDate,
        updatedAt: startDate,
      };
      await db.flares.add(flare);

      // Add events with different severities
      await db.flareEvents.add({
        id: 'event-1',
        flareId,
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: startDate + 1000,
        severity: 5,
      });
      await db.flareEvents.add({
        id: 'event-2',
        flareId,
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: startDate + 2000,
        severity: 8,
      });
      await db.flareEvents.add({
        id: 'event-3',
        flareId,
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: startDate + 3000,
        severity: 6,
      });

      const flares = await analyticsRepository.getFlaresByRegion(testUserId, testRegion);

      expect(flares[0].peakSeverity).toBe(8);
    });

    it('should extract trend outcome from most recent trend event', async () => {
      const startDate = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const flareId = 'test-trend-flare';

      const flare: FlareRecord = {
        id: flareId,
        userId: testUserId,
        startDate,
        status: 'active',
        bodyRegionId: testRegion,
        initialSeverity: 5,
        currentSeverity: 5,
        createdAt: startDate,
        updatedAt: startDate,
      };
      await db.flares.add(flare);

      // Add trend events
      await db.flareEvents.add({
        id: 'trend-1',
        flareId,
        userId: testUserId,
        eventType: 'trend_change',
        timestamp: startDate + 1000,
        trend: 'worsening',
      });
      await db.flareEvents.add({
        id: 'trend-2',
        flareId,
        userId: testUserId,
        eventType: 'trend_change',
        timestamp: startDate + 2000,
        trend: 'improving',
      });

      const flares = await analyticsRepository.getFlaresByRegion(testUserId, testRegion);

      expect(flares[0].trendOutcome).toBe('improving'); // Most recent
    });
  });

  describe('getRegionStatistics', () => {
    const testRegion = 'left-shoulder';

    it('should calculate all four metrics correctly', async () => {
      // Create 3 flares: 2 resolved, 1 active
      const createFlareForStats = async (daysAgo: number, duration: number, severity: number, resolved: boolean) => {
        const startDate = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
        const endDate = resolved ? startDate + duration * 24 * 60 * 60 * 1000 : undefined;
        const flareId = `stats-flare-${daysAgo}`;

        const flare: FlareRecord = {
          id: flareId,
          userId: testUserId,
          startDate,
          endDate,
          status: resolved ? 'resolved' : 'active',
          bodyRegionId: testRegion,
          initialSeverity: severity,
          currentSeverity: severity,
          createdAt: startDate,
          updatedAt: startDate,
        };
        await db.flares.add(flare);

        await db.flareEvents.add({
          id: `${flareId}-event`,
          flareId,
          userId: testUserId,
          eventType: 'severity_update',
          timestamp: startDate + 1000,
          severity,
        });
      };

      await createFlareForStats(50, 10, 6, true);  // Resolved, 10 days
      await createFlareForStats(30, 5, 8, true);   // Resolved, 5 days
      await createFlareForStats(10, 0, 4, false);  // Active

      const stats = await analyticsRepository.getRegionStatistics(testUserId, testRegion);

      expect(stats.totalCount).toBe(3);
      expect(stats.averageDuration).toBeCloseTo(7.5, 1); // (10 + 5) / 2
      expect(stats.averageSeverity).toBeCloseTo(6, 1); // (6 + 8 + 4) / 3
      expect(typeof stats.recurrenceRate).toBe('number');
    });

    it('should return null for averageDuration when no resolved flares', async () => {
      const flare: FlareRecord = {
        id: 'active-only',
        userId: testUserId,
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'active',
        bodyRegionId: testRegion,
        initialSeverity: 5,
        currentSeverity: 5,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      };
      await db.flares.add(flare);

      await db.flareEvents.add({
        id: 'event-1',
        flareId: 'active-only',
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: Date.now(),
        severity: 5,
      });

      const stats = await analyticsRepository.getRegionStatistics(testUserId, testRegion);

      expect(stats.averageDuration).toBeNull();
    });

    it('should return "Insufficient data" for recurrenceRate when < 2 flares', async () => {
      const flare: FlareRecord = {
        id: 'single-flare',
        userId: testUserId,
        startDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'active',
        bodyRegionId: testRegion,
        initialSeverity: 5,
        currentSeverity: 5,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      };
      await db.flares.add(flare);

      await db.flareEvents.add({
        id: 'event-1',
        flareId: 'single-flare',
        userId: testUserId,
        eventType: 'severity_update',
        timestamp: Date.now(),
        severity: 5,
      });

      const stats = await analyticsRepository.getRegionStatistics(testUserId, testRegion);

      expect(stats.recurrenceRate).toBe('Insufficient data');
    });
  });
});
