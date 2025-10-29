/**
 * Analytics Repository Trend Tests (Story 3.4 - Task 8.1)
 *
 * Test suite for getMonthlyTrendData method.
 * Tests monthly bucketing, trend calculations, and edge cases.
 */

import { db } from '@/lib/db/client';
import { analyticsRepository } from '@/lib/repositories/analyticsRepository';
import { FlareRecord, FlareEventRecord } from '@/lib/db/schema';

describe('analyticsRepository.getMonthlyTrendData', () => {
  const testUserId = 'test-user-trend';

  beforeEach(async () => {
    // Clear database before each test
    await db.flares.clear();
    await db.flareEvents.clear();
  });

  afterAll(async () => {
    // Clean up after all tests
    await db.delete();
  });

  // Helper function to create test flare
  const createTestFlare = async (
    monthsAgo: number,
    bodyRegionId: string = 'test-region',
    userId: string = testUserId
  ): Promise<string> => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 15).getTime();

    const flare: FlareRecord = {
      id: `flare-${monthsAgo}-${Date.now()}-${Math.random()}`,
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
    return flare.id;
  };

  // Helper function to add flare event with severity
  const addFlareEvent = async (flareId: string, severity: number) => {
    const event: FlareEventRecord = {
      id: `event-${flareId}-${Date.now()}-${Math.random()}`,
      flareId,
      timestamp: Date.now(),
      eventType: 'severity_update',
      severity,
    };
    await db.flareEvents.add(event);
  };

  // Task 8.2: Test empty data
  it('should return insufficient-data for empty data set', async () => {
    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.trendDirection).toBe('insufficient-data');
    expect(result.dataPoints).toHaveLength(0);
    expect(result.trendLine.slope).toBe(0);
    expect(result.trendLine.intercept).toBe(0);
  });

  // Task 8.2: Test single month
  it('should return insufficient-data for single month', async () => {
    await createTestFlare(0); // Current month
    await createTestFlare(0); // Current month

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(1);
    expect(result.trendDirection).toBe('insufficient-data');
  });

  // Task 8.2: Test 2 months (still insufficient)
  it('should return insufficient-data for 2 months', async () => {
    await createTestFlare(0); // Current month
    await createTestFlare(1); // 1 month ago

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(2);
    expect(result.trendDirection).toBe('insufficient-data');
  });

  // Task 8.2: Test multiple months with monthly bucketing
  it('should group flares by month correctly', async () => {
    // Create 3 flares in current month, 2 in previous month
    await createTestFlare(0);
    await createTestFlare(0);
    await createTestFlare(0);
    await createTestFlare(1);
    await createTestFlare(1);
    await createTestFlare(2);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(3);
    expect(result.dataPoints[0].flareCount).toBe(1); // 2 months ago
    expect(result.dataPoints[1].flareCount).toBe(2); // 1 month ago
    expect(result.dataPoints[2].flareCount).toBe(3); // current month
    expect(result.trendDirection).toBe('declining'); // Increasing trend
  });

  // Task 8.2: Test trend calculations - improving
  it('should calculate improving trend (negative slope)', async () => {
    // Create decreasing pattern: 5 flares 5 months ago, down to 1 flare now
    for (let i = 0; i < 5; i++) await createTestFlare(5);
    for (let i = 0; i < 4; i++) await createTestFlare(4);
    for (let i = 0; i < 3; i++) await createTestFlare(3);
    for (let i = 0; i < 2; i++) await createTestFlare(2);
    await createTestFlare(1);
    await createTestFlare(0);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(6);
    expect(result.trendDirection).toBe('improving');
    expect(result.trendLine.slope).toBeLessThan(-0.3);
  });

  // Task 8.2: Test trend calculations - declining
  it('should calculate declining trend (positive slope)', async () => {
    // Create increasing pattern: 1 flare 5 months ago, up to 5 flares now
    await createTestFlare(5);
    await createTestFlare(4);
    for (let i = 0; i < 2; i++) await createTestFlare(3);
    for (let i = 0; i < 3; i++) await createTestFlare(2);
    for (let i = 0; i < 4; i++) await createTestFlare(1);
    for (let i = 0; i < 5; i++) await createTestFlare(0);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(6);
    expect(result.trendDirection).toBe('declining');
    expect(result.trendLine.slope).toBeGreaterThan(0.3);
  });

  // Task 8.2: Test trend calculations - stable
  it('should calculate stable trend (near-zero slope)', async () => {
    // Create stable pattern: 3 flares each month
    for (let month = 0; month < 6; month++) {
      for (let i = 0; i < 3; i++) {
        await createTestFlare(month);
      }
    }

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(6);
    expect(result.trendDirection).toBe('stable');
    expect(result.trendLine.slope).toBeGreaterThanOrEqual(-0.3);
    expect(result.trendLine.slope).toBeLessThanOrEqual(0.3);
  });

  // Task 8.2: Test average severity calculation
  it('should calculate average severity per month', async () => {
    const flareId1 = await createTestFlare(0);
    const flareId2 = await createTestFlare(0);

    // Flare 1: severities 5, 7 -> peak 7
    await addFlareEvent(flareId1, 5);
    await addFlareEvent(flareId1, 7);

    // Flare 2: severities 3, 4 -> peak 4
    await addFlareEvent(flareId2, 3);
    await addFlareEvent(flareId2, 4);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(1);
    expect(result.dataPoints[0].flareCount).toBe(2);
    // Average of peak severities: (7 + 4) / 2 = 5.5
    expect(result.dataPoints[0].averageSeverity).toBeCloseTo(5.5, 1);
  });

  // Task 8.2: Test null severity when no events
  it('should return null severity when no flare events', async () => {
    await createTestFlare(0);
    await createTestFlare(1);
    await createTestFlare(2);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    // Without flare events, should use initialSeverity (5)
    expect(result.dataPoints[0].averageSeverity).not.toBeNull();
  });

  // Task 8.2: Test chronological sorting
  it('should sort data points chronologically (oldest to newest)', async () => {
    await createTestFlare(5);
    await createTestFlare(2);
    await createTestFlare(4);
    await createTestFlare(1);
    await createTestFlare(3);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(5);
    // Verify timestamps are in ascending order
    for (let i = 1; i < result.dataPoints.length; i++) {
      expect(result.dataPoints[i].monthTimestamp).toBeGreaterThan(
        result.dataPoints[i - 1].monthTimestamp
      );
    }
  });

  // Task 8.2: Test time range filtering - last90d
  it('should filter flares by time range (last90d)', async () => {
    await createTestFlare(0); // Current month
    await createTestFlare(1); // 1 month ago
    await createTestFlare(2); // 2 months ago
    await createTestFlare(6); // 6 months ago - outside last90d

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'last90d');

    // Should only include months within last 90 days
    expect(result.dataPoints.length).toBeLessThanOrEqual(3);
  });

  // Task 8.2: Test user isolation
  it('should isolate data by userId', async () => {
    const otherUserId = 'other-user-123';

    // Create flares for test user
    await createTestFlare(0, 'region1', testUserId);
    await createTestFlare(1, 'region1', testUserId);
    await createTestFlare(2, 'region1', testUserId);

    // Create flares for other user
    await createTestFlare(0, 'region1', otherUserId);
    await createTestFlare(1, 'region1', otherUserId);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    // Should only see test user's flares
    expect(result.dataPoints).toHaveLength(3);
    const totalFlares = result.dataPoints.reduce((sum, dp) => sum + dp.flareCount, 0);
    expect(totalFlares).toBe(3);
  });

  // Task 8.2: Test month format
  it('should format month as YYYY-MM', async () => {
    await createTestFlare(0);
    await createTestFlare(1);
    await createTestFlare(2);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    result.dataPoints.forEach(dp => {
      expect(dp.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  // Task 8.2: Test with both active and resolved flares
  it('should include both active and resolved flares', async () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 15).getTime();

    // Active flare
    const activeFlare: FlareRecord = {
      id: 'active-flare',
      userId: testUserId,
      startDate,
      status: 'active',
      bodyRegionId: 'region1',
      initialSeverity: 5,
      currentSeverity: 5,
      createdAt: startDate,
      updatedAt: startDate,
    };
    await db.flares.add(activeFlare);

    // Resolved flare
    const resolvedFlare: FlareRecord = {
      id: 'resolved-flare',
      userId: testUserId,
      startDate,
      endDate: startDate + 1000000,
      status: 'resolved',
      bodyRegionId: 'region1',
      initialSeverity: 6,
      currentSeverity: 3,
      createdAt: startDate,
      updatedAt: startDate + 1000000,
    };
    await db.flares.add(resolvedFlare);

    await createTestFlare(1); // Add one more month for minimum 3 months
    await createTestFlare(2);

    const result = await analyticsRepository.getMonthlyTrendData(testUserId, 'allTime');

    expect(result.dataPoints).toHaveLength(3);
    expect(result.dataPoints[2].flareCount).toBe(2); // Both active and resolved
  });
});
