import Dexie from 'dexie';
import { BodyMapLocationRecord, LayerType } from '../schema';

/**
 * Migration Test for Dexie Version 22
 * Story 5.1: Add Layer Field to Data Model and IndexedDB Schema
 *
 * Tests that v21 -> v22 migration:
 * 1. Adds layer field to existing bodyMapLocations records
 * 2. Assigns layer='flares' to all existing markers (backward compatibility)
 * 3. Creates [userId+layer+createdAt] compound index for efficient queries
 * 4. Preserves all existing marker data without loss
 */

describe('Dexie Migration v22 (Story 5.1)', () => {
  let testDb: Dexie;

  beforeEach(async () => {
    // Use unique DB name for each test to avoid conflicts
    const dbName = `test-migration-v22-${Date.now()}`;
    testDb = new Dexie(dbName);
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.delete();
    }
  }, 15000);

  describe('Migration from v21 to v22', () => {
    it('should add layer field to bodyMapLocations table', async () => {
      // Setup: Create v21 database with bodyMapLocations (no layer field)
      testDb.version(21).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt',
      });

      await testDb.open();

      // Insert v21 record (without layer field)
      const v21Record = {
        id: 'loc-1',
        userId: 'user-1',
        dailyEntryId: 'entry-1',
        symptomId: 'symptom-1',
        bodyRegionId: 'left-shoulder',
        coordinates: { x: 0.5, y: 0.3 },
        severity: 7,
        notes: 'Test flare location',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      await testDb.table('bodyMapLocations').add(v21Record);
      await testDb.close();

      // Migrate to v22
      testDb.version(22).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
      }).upgrade(async (trans) => {
        await trans.table('bodyMapLocations').toCollection().modify((marker: any) => {
          if (!marker.layer) {
            marker.layer = 'flares';
          }
        });
      });

      await testDb.open();

      // Verify: layer field added with default value 'flares'
      const migratedRecord = await testDb.table('bodyMapLocations').get('loc-1') as BodyMapLocationRecord;

      expect(migratedRecord).toBeDefined();
      expect(migratedRecord.layer).toBe('flares'); // Default value for backward compatibility
      expect(migratedRecord.bodyRegionId).toBe('left-shoulder');
      expect(migratedRecord.severity).toBe(7);
      expect(migratedRecord.notes).toBe('Test flare location');
    }, 15000);

    it('should assign layer=flares to all existing markers during upgrade', async () => {
      // Setup v21 with multiple markers
      testDb.version(21).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt',
      });

      await testDb.open();

      const markers = [
        { id: 'loc-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'left-shoulder', severity: 5, createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
        { id: 'loc-2', userId: 'user-1', symptomId: 's2', bodyRegionId: 'right-knee', severity: 8, createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
        { id: 'loc-3', userId: 'user-2', symptomId: 's1', bodyRegionId: 'lower-back', severity: 6, createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') },
      ];

      await testDb.table('bodyMapLocations').bulkAdd(markers);
      await testDb.close();

      // Migrate to v22
      testDb.version(22).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
      }).upgrade(async (trans) => {
        await trans.table('bodyMapLocations').toCollection().modify((marker: any) => {
          if (!marker.layer) {
            marker.layer = 'flares';
          }
        });
      });

      await testDb.open();

      // Verify: ALL markers have layer='flares'
      const allMarkers = await testDb.table('bodyMapLocations').toArray() as BodyMapLocationRecord[];

      expect(allMarkers).toHaveLength(3);
      allMarkers.forEach(marker => {
        expect(marker.layer).toBe('flares');
      });
    }, 15000);

    it('should preserve all existing marker data during migration', async () => {
      // Setup v21 with comprehensive marker data
      testDb.version(21).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt',
      });

      await testDb.open();

      const originalMarker = {
        id: 'loc-comprehensive',
        userId: 'user-test',
        dailyEntryId: 'entry-test',
        symptomId: 'symptom-test',
        bodyRegionId: 'groin-left',
        coordinates: { x: 0.75, y: 0.42 },
        severity: 9,
        notes: 'Severe flare with detailed notes',
        createdAt: new Date('2024-06-15T10:30:00Z'),
        updatedAt: new Date('2024-06-15T14:20:00Z'),
      };

      await testDb.table('bodyMapLocations').add(originalMarker);
      await testDb.close();

      // Migrate to v22
      testDb.version(22).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
      }).upgrade(async (trans) => {
        await trans.table('bodyMapLocations').toCollection().modify((marker: any) => {
          if (!marker.layer) {
            marker.layer = 'flares';
          }
        });
      });

      await testDb.open();

      // Verify: ALL original fields preserved + layer field added
      const migratedMarker = await testDb.table('bodyMapLocations').get('loc-comprehensive') as BodyMapLocationRecord;

      expect(migratedMarker.id).toBe('loc-comprehensive');
      expect(migratedMarker.userId).toBe('user-test');
      expect(migratedMarker.dailyEntryId).toBe('entry-test');
      expect(migratedMarker.symptomId).toBe('symptom-test');
      expect(migratedMarker.bodyRegionId).toBe('groin-left');
      expect(migratedMarker.coordinates).toEqual({ x: 0.75, y: 0.42 });
      expect(migratedMarker.severity).toBe(9);
      expect(migratedMarker.notes).toBe('Severe flare with detailed notes');
      // Dexie may store dates as Date objects or strings, handle both
      expect(new Date(migratedMarker.createdAt).toISOString()).toBe('2024-06-15T10:30:00.000Z');
      expect(new Date(migratedMarker.updatedAt).toISOString()).toBe('2024-06-15T14:20:00.000Z');
      expect(migratedMarker.layer).toBe('flares'); // New field
    }, 15000);

    it('should support layer-filtered queries after migration using compound index', async () => {
      // Setup v22 directly and test compound index functionality
      testDb.version(22).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
      });

      await testDb.open();

      const now = Date.now();
      const yesterday = now - 24 * 60 * 60 * 1000;
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

      // Insert markers with different layers and timestamps (use epoch ms for Dexie compatibility)
      const markers = [
        { id: 'flare-1', userId: 'user-1', symptomId: 's1', bodyRegionId: 'shoulder', layer: 'flares' as LayerType, severity: 6, createdAt: twoDaysAgo, updatedAt: twoDaysAgo },
        { id: 'flare-2', userId: 'user-1', symptomId: 's2', bodyRegionId: 'knee', layer: 'flares' as LayerType, severity: 7, createdAt: yesterday, updatedAt: yesterday },
        { id: 'pain-1', userId: 'user-1', symptomId: 's3', bodyRegionId: 'back', layer: 'pain' as LayerType, severity: 5, createdAt: yesterday, updatedAt: yesterday },
        { id: 'inflammation-1', userId: 'user-1', symptomId: 's4', bodyRegionId: 'ankle', layer: 'inflammation' as LayerType, severity: 4, createdAt: now, updatedAt: now },
        { id: 'pain-2', userId: 'user-2', symptomId: 's5', bodyRegionId: 'wrist', layer: 'pain' as LayerType, severity: 6, createdAt: now, updatedAt: now },
      ];

      await testDb.table('bodyMapLocations').bulkAdd(markers);

      // Query using compound index [userId+layer+createdAt]
      const user1Flares = await testDb.table('bodyMapLocations')
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'flares', 0], ['user-1', 'flares', now + 1000], true, true)
        .toArray();

      const user1Pain = await testDb.table('bodyMapLocations')
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'pain', 0], ['user-1', 'pain', now + 1000], true, true)
        .toArray();

      const user1Inflammation = await testDb.table('bodyMapLocations')
        .where('[userId+layer+createdAt]')
        .between(['user-1', 'inflammation', 0], ['user-1', 'inflammation', now + 1000], true, true)
        .toArray();

      // Verify: Queries return correct subsets
      expect(user1Flares).toHaveLength(2);
      expect(user1Flares.map(m => m.id).sort()).toEqual(['flare-1', 'flare-2']);

      expect(user1Pain).toHaveLength(1);
      expect(user1Pain[0].id).toBe('pain-1');

      expect(user1Inflammation).toHaveLength(1);
      expect(user1Inflammation[0].id).toBe('inflammation-1');
    }, 15000);

    it('should handle empty database migration gracefully', async () => {
      // Setup v21 with empty bodyMapLocations table
      testDb.version(21).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt',
      });

      await testDb.open();
      await testDb.close();

      // Migrate to v22 with no records
      testDb.version(22).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
      }).upgrade(async (trans) => {
        await trans.table('bodyMapLocations').toCollection().modify((marker: any) => {
          if (!marker.layer) {
            marker.layer = 'flares';
          }
        });
      });

      await testDb.open();

      // Verify: Migration completes without errors
      const count = await testDb.table('bodyMapLocations').count();
      expect(count).toBe(0);

      // Verify: New records can be inserted with layer field
      const newMarker: BodyMapLocationRecord = {
        id: 'new-loc',
        userId: 'user-1',
        symptomId: 'symptom-1',
        bodyRegionId: 'shoulder',
        layer: 'pain', // New field now required
        severity: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await testDb.table('bodyMapLocations').add(newMarker);
      const retrieved = await testDb.table('bodyMapLocations').get('new-loc') as BodyMapLocationRecord;

      expect(retrieved.layer).toBe('pain');
      expect(retrieved.severity).toBe(5);
    }, 15000);

    it('should migrate 50+ markers without performance degradation', async () => {
      // Setup v21 with large dataset
      testDb.version(21).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], createdAt',
      });

      await testDb.open();

      // Generate 60 markers
      const largeDataset = Array.from({ length: 60 }, (_, i) => ({
        id: `loc-${i}`,
        userId: 'user-1',
        symptomId: `symptom-${i % 5}`,
        bodyRegionId: ['shoulder', 'knee', 'back', 'ankle'][i % 4],
        severity: (i % 10) + 1,
        createdAt: new Date(Date.now() - i * 60000),
        updatedAt: new Date(Date.now() - i * 60000),
      }));

      await testDb.table('bodyMapLocations').bulkAdd(largeDataset);
      await testDb.close();

      // Migrate to v22 and measure time
      testDb.version(22).stores({
        bodyMapLocations: 'id, userId, dailyEntryId, symptomId, bodyRegionId, [userId+symptomId], [userId+layer+createdAt], createdAt',
      }).upgrade(async (trans) => {
        await trans.table('bodyMapLocations').toCollection().modify((marker: any) => {
          if (!marker.layer) {
            marker.layer = 'flares';
          }
        });
      });

      const startTime = Date.now();
      await testDb.open();
      const migrationTime = Date.now() - startTime;

      // Verify: Migration completes in reasonable time (< 500ms)
      expect(migrationTime).toBeLessThan(500);

      // Verify: All markers migrated successfully
      const count = await testDb.table('bodyMapLocations').count();
      expect(count).toBe(60);

      // Verify: Random sampling confirms layer assignment
      const sample = await testDb.table('bodyMapLocations').limit(10).toArray() as BodyMapLocationRecord[];
      sample.forEach(marker => {
        expect(marker.layer).toBe('flares');
      });
    }, 15000);
  });
});
