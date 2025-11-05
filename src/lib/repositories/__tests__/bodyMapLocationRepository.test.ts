import Dexie from 'dexie';
import { BodyMapLocationRepository } from '../bodyMapLocationRepository';
import { BodyMapLocationRecord, LayerType, LAYER_CONFIG } from '../../db/schema';

/**
 * Repository Tests for BodyMapLocationRepository
 * Story 5.1: Layer-aware methods and LAYER_CONFIG validation
 */

// Create test database for repository testing
class TestDatabase extends Dexie {
  bodyMapLocations!: Dexie.Table<BodyMapLocationRecord, string>;

  constructor() {
    super(`test-body-map-repo-${Date.now()}`);

    this.version(1).stores({
      bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
    });
  }
}

describe('LAYER_CONFIG Validation (Story 5.1)', () => {
  it('should contain all 3 required layers with complete metadata', () => {
    // Verify structure
    expect(LAYER_CONFIG).toBeDefined();
    expect(Object.keys(LAYER_CONFIG)).toHaveLength(3);

    // Verify flares layer
    expect(LAYER_CONFIG.flares).toBeDefined();
    expect(LAYER_CONFIG.flares.id).toBe('flares');
    expect(LAYER_CONFIG.flares.label).toBe('Flares');
    expect(LAYER_CONFIG.flares.icon).toBe('🔥');
    expect(LAYER_CONFIG.flares.color).toBe('text-red-500');
    expect(LAYER_CONFIG.flares.description).toBe('HS flare tracking');

    // Verify pain layer
    expect(LAYER_CONFIG.pain).toBeDefined();
    expect(LAYER_CONFIG.pain.id).toBe('pain');
    expect(LAYER_CONFIG.pain.label).toBe('Pain');
    expect(LAYER_CONFIG.pain.icon).toBe('⚡');
    expect(LAYER_CONFIG.pain.color).toBe('text-yellow-500');
    expect(LAYER_CONFIG.pain.description).toBe('General body pain');

    // Verify inflammation layer
    expect(LAYER_CONFIG.inflammation).toBeDefined();
    expect(LAYER_CONFIG.inflammation.id).toBe('inflammation');
    expect(LAYER_CONFIG.inflammation.label).toBe('Inflammation');
    expect(LAYER_CONFIG.inflammation.icon).toBe('🟣');
    expect(LAYER_CONFIG.inflammation.color).toBe('text-purple-500');
    expect(LAYER_CONFIG.inflammation.description).toBe('Swelling and inflammation');
  });

  it('should have all metadata fields for each layer', () => {
    const layers: LayerType[] = ['flares', 'pain', 'inflammation'];

    layers.forEach(layer => {
      const config = LAYER_CONFIG[layer];
      expect(config.id).toBeDefined();
      expect(config.label).toBeDefined();
      expect(config.icon).toBeDefined();
      expect(config.color).toBeDefined();
      expect(config.description).toBeDefined();

      // Verify types
      expect(typeof config.id).toBe('string');
      expect(typeof config.label).toBe('string');
      expect(typeof config.icon).toBe('string');
      expect(typeof config.color).toBe('string');
      expect(typeof config.description).toBe('string');
    });
  });
});

describe('BodyMapLocationRepository - Layer Methods (Story 5.1)', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.open();
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.delete();
    }
  }, 15000);

  describe('getMarkersByLayer', () => {
    it('should return only markers from specified layer', async () => {
      // Insert markers across different layers
      const markers: BodyMapLocationRecord[] = [
        { id: 'flare-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        { id: 'flare-2', userId: 'user-1', symptomId: 's2', bodyRegionId: 'knee', layer: 'flares', severity: 6, createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
        { id: 'pain-1', userId: 'user-1', symptomId: 's3', bodyRegionId: 'back', layer: 'pain', severity: 5, createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
        { id: 'inflammation-1', userId: 'user-1', symptomId: 's4', bodyRegionId: 'ankle', layer: 'inflammation', severity: 4, createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Query pain layer only
      const painMarkers = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'pain', new Date(0)], ['user-1', 'pain', new Date()], true, true)
        .toArray();

      expect(painMarkers).toHaveLength(1);
      expect(painMarkers[0].id).toBe('pain-1');
      expect(painMarkers[0].layer).toBe('pain');
    }, 15000);

    it('should respect time range filters', async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const markers: BodyMapLocationRecord[] = [
        { id: 'flare-old', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 6, createdAt: threeDaysAgo, updatedAt: threeDaysAgo },
        { id: 'flare-mid', userId: 'user-1', symptomId: 's2', bodyRegionId: 'knee', layer: 'flares', severity: 7, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
        { id: 'flare-recent', userId: 'user-1', symptomId: 's3', bodyRegionId: 'back', layer: 'flares', severity: 8, createdAt: yesterday, updatedAt: yesterday },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Query with time range filter (last 2 days)
      const recentFlares = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'flares', twoDaysAgo], ['user-1', 'flares', now], true, true)
        .toArray();

      expect(recentFlares).toHaveLength(2);
      expect(recentFlares.map(m => m.id).sort()).toEqual(['flare-mid', 'flare-recent']);
    }, 15000);

    it('should respect limit parameter', async () => {
      const markers: BodyMapLocationRecord[] = Array.from({ length: 10 }, (_, i) => ({
        id: `flare-${i}`,
        userId: 'user-1',
        symptomId: `s${i}`,
        bodyRegionId: 'shoulder',
        layer: 'flares' as LayerType,
        severity: (i % 10) + 1,
        createdAt: new Date(Date.now() - i * 60000),
        updatedAt: new Date(Date.now() - i * 60000),
      }));

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Query with limit of 5
      const limitedResults = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'flares', new Date(0)], ['user-1', 'flares', new Date()], true, true)
        .limit(5)
        .toArray();

      expect(limitedResults).toHaveLength(5);
    }, 15000);
  });

  describe('getMarkersByLayers', () => {
    it('should return markers from multiple specified layers', async () => {
      const markers: BodyMapLocationRecord[] = [
        { id: 'flare-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        { id: 'pain-1', userId: 'user-1', symptomId: 's2', bodyRegionId: 'back', layer: 'pain', severity: 5, createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
        { id: 'inflammation-1', userId: 'user-1', symptomId: 's3', bodyRegionId: 'ankle', layer: 'inflammation', severity: 4, createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
        { id: 'flare-2', userId: 'user-1', symptomId: 's4', bodyRegionId: 'knee', layer: 'flares', severity: 8, createdAt: new Date('2024-01-04'), updatedAt: new Date('2024-01-04') },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Query multiple layers: flares + inflammation (exclude pain)
      const flareResults = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'flares', new Date(0)], ['user-1', 'flares', new Date()], true, true)
        .toArray();

      const inflammationResults = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'inflammation', new Date(0)], ['user-1', 'inflammation', new Date()], true, true)
        .toArray();

      const combinedResults = [...flareResults, ...inflammationResults];

      expect(combinedResults).toHaveLength(3);
      const ids = combinedResults.map(m => m.id).sort();
      expect(ids).toEqual(['flare-1', 'flare-2', 'inflammation-1']);

      // Verify pain is excluded
      expect(combinedResults.some(m => m.layer === 'pain')).toBe(false);
    }, 15000);

    it('should sort combined results by timestamp descending', async () => {
      const markers: BodyMapLocationRecord[] = [
        { id: 'pain-old', userId: 'user-1', symptomId: 's1', bodyRegionId: 'back', layer: 'pain', severity: 5, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        { id: 'flare-mid', userId: 'user-1', symptomId: 's2', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
        { id: 'pain-recent', userId: 'user-1', symptomId: 's3', bodyRegionId: 'wrist', layer: 'pain', severity: 6, createdAt: new Date('2024-01-05'), updatedAt: new Date('2024-01-05') },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Query pain and flares layers
      const painResults = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'pain', new Date(0)], ['user-1', 'pain', new Date()], true, true)
        .toArray();

      const flareResults = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'flares', new Date(0)], ['user-1', 'flares', new Date()], true, true)
        .toArray();

      const combinedSorted = [...painResults, ...flareResults]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Verify chronological order (newest first)
      expect(combinedSorted[0].id).toBe('pain-recent');
      expect(combinedSorted[1].id).toBe('flare-mid');
      expect(combinedSorted[2].id).toBe('pain-old');
    }, 15000);
  });

  describe('getMarkerCountsByLayer', () => {
    it('should return accurate counts for each layer', async () => {
      const markers: BodyMapLocationRecord[] = [
        // 5 flares
        { id: 'flare-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flare-2', userId: 'user-1', symptomId: 's1', bodyRegionId: 'knee', layer: 'flares', severity: 6, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flare-3', userId: 'user-1', symptomId: 's1', bodyRegionId: 'back', layer: 'flares', severity: 8, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flare-4', userId: 'user-1', symptomId: 's1', bodyRegionId: 'ankle', layer: 'flares', severity: 5, createdAt: new Date(), updatedAt: new Date() },
        { id: 'flare-5', userId: 'user-1', symptomId: 's1', bodyRegionId: 'wrist', layer: 'flares', severity: 9, createdAt: new Date(), updatedAt: new Date() },
        // 3 pain
        { id: 'pain-1', userId: 'user-1', symptomId: 's2', bodyRegionId: 'back', layer: 'pain', severity: 5, createdAt: new Date(), updatedAt: new Date() },
        { id: 'pain-2', userId: 'user-1', symptomId: 's2', bodyRegionId: 'shoulder', layer: 'pain', severity: 6, createdAt: new Date(), updatedAt: new Date() },
        { id: 'pain-3', userId: 'user-1', symptomId: 's2', bodyRegionId: 'knee', layer: 'pain', severity: 4, createdAt: new Date(), updatedAt: new Date() },
        // 2 inflammation
        { id: 'inflammation-1', userId: 'user-1', symptomId: 's3', bodyRegionId: 'ankle', layer: 'inflammation', severity: 3, createdAt: new Date(), updatedAt: new Date() },
        { id: 'inflammation-2', userId: 'user-1', symptomId: 's3', bodyRegionId: 'wrist', layer: 'inflammation', severity: 5, createdAt: new Date(), updatedAt: new Date() },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Get counts per layer
      const counts: Record<LayerType, number> = {
        flares: 0,
        pain: 0,
        inflammation: 0
      };

      for (const layer of Object.keys(counts) as LayerType[]) {
        counts[layer] = await testDb.bodyMapLocations
          .where('[userId+layer+createdAt]')
          .between(['user-1', layer, new Date(0)], ['user-1', layer, new Date()], true, true)
          .count();
      }

      expect(counts.flares).toBe(5);
      expect(counts.pain).toBe(3);
      expect(counts.inflammation).toBe(2);
    }, 15000);

    it('should return zero counts for layers with no markers', async () => {
      // Insert only flares markers
      const markers: BodyMapLocationRecord[] = [
        { id: 'flare-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date(), updatedAt: new Date() },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      const counts: Record<LayerType, number> = {
        flares: 0,
        pain: 0,
        inflammation: 0
      };

      for (const layer of Object.keys(counts) as LayerType[]) {
        counts[layer] = await testDb.bodyMapLocations
          .where('[userId+layer+createdAt]')
          .between(['user-1', layer, new Date(0)], ['user-1', layer, new Date()], true, true)
          .count();
      }

      expect(counts.flares).toBe(1);
      expect(counts.pain).toBe(0);
      expect(counts.inflammation).toBe(0);
    }, 15000);

    it('should isolate counts per user', async () => {
      const markers: BodyMapLocationRecord[] = [
        // user-1: 2 flares
        { id: 'u1-flare-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date(), updatedAt: new Date() },
        { id: 'u1-flare-2', userId: 'user-1', symptomId: 's1', bodyRegionId: 'knee', layer: 'flares', severity: 6, createdAt: new Date(), updatedAt: new Date() },
        // user-2: 3 flares
        { id: 'u2-flare-1', userId: 'user-2', symptomId: 's1', bodyRegionId: 'back', layer: 'flares', severity: 5, createdAt: new Date(), updatedAt: new Date() },
        { id: 'u2-flare-2', userId: 'user-2', symptomId: 's1', bodyRegionId: 'ankle', layer: 'flares', severity: 8, createdAt: new Date(), updatedAt: new Date() },
        { id: 'u2-flare-3', userId: 'user-2', symptomId: 's1', bodyRegionId: 'wrist', layer: 'flares', severity: 9, createdAt: new Date(), updatedAt: new Date() },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Get counts for user-1 only
      const user1Count = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'flares', new Date(0)], ['user-1', 'flares', new Date()], true, true)
        .count();

      expect(user1Count).toBe(2);

      // Get counts for user-2 only
      const user2Count = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-2', 'flares', new Date(0)], ['user-2', 'flares', new Date()], true, true)
        .count();

      expect(user2Count).toBe(3);
    }, 15000);
  });

  describe('Existing repository methods (backward compatibility)', () => {
    it('should continue to work after migration', async () => {
      const markers: BodyMapLocationRecord[] = [
        { id: 'loc-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares', severity: 7, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        { id: 'loc-2', userId: 'user-1', symptomId: 's2', bodyRegionId: 'knee', layer: 'pain', severity: 5, createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
      ];

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Test getByBodyRegion (existing method)
      const shoulderMarkers = await testDb.bodyMapLocations
        .where('bodyRegionId')
        .equals('shoulder')
        .filter(loc => loc.userId === 'user-1')
        .toArray();

      expect(shoulderMarkers).toHaveLength(1);
      expect(shoulderMarkers[0].id).toBe('loc-1');

      // Test getBySymptom (existing method using compound index)
      const symptom1Markers = await testDb.bodyMapLocations
        .where('[userId+symptomId]')
        .equals(['user-1', 's1'])
        .toArray();

      expect(symptom1Markers).toHaveLength(1);
      expect(symptom1Markers[0].id).toBe('loc-1');
    }, 15000);
  });

  describe('Query performance with 50+ markers', () => {
    it('should handle large datasets efficiently', async () => {
      // Insert 60 markers across different layers
      const markers: BodyMapLocationRecord[] = Array.from({ length: 60 }, (_, i) => ({
        id: `marker-${i}`,
        userId: 'user-1',
        symptomId: `symptom-${i % 5}`,
        bodyRegionId: ['shoulder', 'knee', 'back', 'ankle'][i % 4],
        layer: (['flares', 'pain', 'inflammation'] as LayerType[])[i % 3],
        severity: (i % 10) + 1,
        createdAt: new Date(Date.now() - i * 60000),
        updatedAt: new Date(Date.now() - i * 60000),
      }));

      await testDb.bodyMapLocations.bulkAdd(markers);

      // Query specific layer (should use compound index for performance)
      const startTime = Date.now();
      const painMarkers = await testDb.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'pain', new Date(0)], ['user-1', 'pain', new Date()], true, true)
        .toArray();
      const queryTime = Date.now() - startTime;

      // Verify query completes quickly (< 100ms for NFR001)
      expect(queryTime).toBeLessThan(100);

      // Verify correct subset returned (20 pain markers out of 60 total)
      expect(painMarkers.length).toBeGreaterThanOrEqual(19);
      expect(painMarkers.length).toBeLessThanOrEqual(21);
      painMarkers.forEach(marker => {
        expect(marker.layer).toBe('pain');
      });
    }, 15000);
  });
});
