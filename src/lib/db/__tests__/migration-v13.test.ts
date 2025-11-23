import Dexie from 'dexie';
import { FoodCombinationRecord } from '../schema';

/**
 * Migration Test for Dexie Version 13
 * Story 2.4: Correlation Confidence Calculations
 * 
 * Tests that v12 -> v13 migration:
 * 1. Adds consistency field to existing foodCombinations records
 * 2. Maintains existing confidence field from Story 2.3
 * 3. Creates [userId+confidence] compound index
 */

describe('Dexie Migration v13 (Story 2.4)', () => {
  let testDb: Dexie;

  beforeEach(async () => {
    // Use unique DB name for each test to avoid conflicts
    const dbName = `test-migration-v13-${Date.now()}`;
    testDb = new Dexie(dbName);
  });

  afterEach(async () => {
    if (testDb) {
      await testDb.delete();
    }
  }, 15000);

  describe('Migration from v12 to v13', () => {
    it('should add consistency field to existing foodCombinations records', async () => {
      // Setup: Create v12 database with foodCombinations
      testDb.version(12).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], lastAnalyzedAt',
      });

      await testDb.open();

      // Insert v12 record (without consistency field)
      const v12Record = {
        id: 'combo-1',
        userId: 'user-1',
        foodIds: JSON.stringify(['food-1', 'food-2']),
        foodNames: JSON.stringify(['Dairy', 'Wheat']),
        symptomId: 'symptom-1',
        symptomName: 'Headache',
        combinationCorrelation: 0.75,
        individualMax: 0.55,
        synergistic: true,
        pValue: 0.02,
        confidence: 'high' as const,
        // consistency field missing (will be added by migration)
        sampleSize: 10,
        lastAnalyzedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await testDb.table('foodCombinations').add(v12Record);
      await testDb.close();

      // Migrate to v13
      testDb.version(13).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt',
      }).upgrade(async (trans) => {
        await trans.table('foodCombinations').toCollection().modify((record: any) => {
          if (record.confidence === undefined) {
            record.confidence = 'low';
          }
          if (record.consistency === undefined) {
            record.consistency = 0;
          }
        });
      });

      await testDb.open();

      // Verify: consistency field added with default value
      const migratedRecord = await testDb.table('foodCombinations').get('combo-1') as FoodCombinationRecord;
      
      expect(migratedRecord).toBeDefined();
      expect(migratedRecord.consistency).toBe(0); // Default value
      expect(migratedRecord.confidence).toBe('high'); // Preserved from v12
      expect(migratedRecord.combinationCorrelation).toBe(0.75);
      expect(migratedRecord.synergistic).toBe(true);
    }, 15000);

    it('should preserve existing confidence field from Story 2.3', async () => {
      // Setup v12 with various confidence levels
      testDb.version(12).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], lastAnalyzedAt',
      });

      await testDb.open();

      const records = [
        { id: 'combo-high', userId: 'user-1', confidence: 'high' as const, symptomId: 's1', foodIds: '[]', foodNames: '[]', combinationCorrelation: 0.8, individualMax: 0.6, synergistic: true, pValue: 0.01, sampleSize: 10, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'combo-medium', userId: 'user-1', confidence: 'medium' as const, symptomId: 's1', foodIds: '[]', foodNames: '[]', combinationCorrelation: 0.6, individualMax: 0.5, synergistic: false, pValue: 0.04, sampleSize: 5, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'combo-low', userId: 'user-1', confidence: 'low' as const, symptomId: 's1', foodIds: '[]', foodNames: '[]', combinationCorrelation: 0.4, individualMax: 0.3, synergistic: false, pValue: 0.08, sampleSize: 3, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ];

      await testDb.table('foodCombinations').bulkAdd(records);
      await testDb.close();

      // Migrate to v13
      testDb.version(13).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt',
      }).upgrade(async (trans) => {
        await trans.table('foodCombinations').toCollection().modify((record: any) => {
          if (record.confidence === undefined) {
            record.confidence = 'low';
          }
          if (record.consistency === undefined) {
            record.consistency = 0;
          }
        });
      });

      await testDb.open();

      // Verify all confidence levels preserved
      const highRecord = await testDb.table('foodCombinations').get('combo-high') as FoodCombinationRecord;
      const mediumRecord = await testDb.table('foodCombinations').get('combo-medium') as FoodCombinationRecord;
      const lowRecord = await testDb.table('foodCombinations').get('combo-low') as FoodCombinationRecord;

      expect(highRecord.confidence).toBe('high');
      expect(highRecord.consistency).toBe(0); // Added by migration
      
      expect(mediumRecord.confidence).toBe('medium');
      expect(mediumRecord.consistency).toBe(0);
      
      expect(lowRecord.confidence).toBe('low');
      expect(lowRecord.consistency).toBe(0);
    }, 15000);

    it('should create [userId+confidence] compound index', async () => {
      // Setup v13 directly (simulating fresh install)
      testDb.version(13).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt',
      });

      await testDb.open();

      // Insert records with different userId and confidence combinations
      const records = [
        { id: 'c1', userId: 'user-1', confidence: 'high' as const, symptomId: 's1', foodIds: '[]', foodNames: '[]', consistency: 0.75, combinationCorrelation: 0.8, individualMax: 0.6, synergistic: true, pValue: 0.01, sampleSize: 10, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'c2', userId: 'user-1', confidence: 'medium' as const, symptomId: 's2', foodIds: '[]', foodNames: '[]', consistency: 0.60, combinationCorrelation: 0.6, individualMax: 0.5, synergistic: false, pValue: 0.04, sampleSize: 5, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'c3', userId: 'user-2', confidence: 'high' as const, symptomId: 's3', foodIds: '[]', foodNames: '[]', consistency: 0.80, combinationCorrelation: 0.85, individualMax: 0.65, synergistic: true, pValue: 0.005, sampleSize: 12, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
        { id: 'c4', userId: 'user-2', confidence: 'low' as const, symptomId: 's4', foodIds: '[]', foodNames: '[]', consistency: 0.40, combinationCorrelation: 0.4, individualMax: 0.3, synergistic: false, pValue: 0.09, sampleSize: 3, lastAnalyzedAt: Date.now(), createdAt: Date.now(), updatedAt: Date.now() },
      ];

      await testDb.table('foodCombinations').bulkAdd(records);

      // Query using compound index [userId+confidence]
      const user1HighConfidence = await testDb.table('foodCombinations')
        .where(['userId', 'confidence'])
        .equals(['user-1', 'high'])
        .toArray();

      const user2HighConfidence = await testDb.table('foodCombinations')
        .where(['userId', 'confidence'])
        .equals(['user-2', 'high'])
        .toArray();

      const user1MediumConfidence = await testDb.table('foodCombinations')
        .where(['userId', 'confidence'])
        .equals(['user-1', 'medium'])
        .toArray();

      // Verify index queries work correctly
      expect(user1HighConfidence).toHaveLength(1);
      expect(user1HighConfidence[0].id).toBe('c1');

      expect(user2HighConfidence).toHaveLength(1);
      expect(user2HighConfidence[0].id).toBe('c3');

      expect(user1MediumConfidence).toHaveLength(1);
      expect(user1MediumConfidence[0].id).toBe('c2');
    }, 15000);

    it('should handle empty foodCombinations table during migration', async () => {
      // Setup v12 with empty table
      testDb.version(12).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], lastAnalyzedAt',
      });

      await testDb.open();
      await testDb.close();

      // Migrate to v13 with no records
      testDb.version(13).stores({
        foodCombinations: 'id, userId, symptomId, [userId+symptomId], [userId+synergistic], [userId+confidence], lastAnalyzedAt',
      }).upgrade(async (trans) => {
        await trans.table('foodCombinations').toCollection().modify((record: any) => {
          if (record.confidence === undefined) {
            record.confidence = 'low';
          }
          if (record.consistency === undefined) {
            record.consistency = 0;
          }
        });
      });

      await testDb.open();

      // Verify migration completes without errors
      const count = await testDb.table('foodCombinations').count();
      expect(count).toBe(0);

      // Verify new records can be inserted with all fields
      const newRecord: FoodCombinationRecord = {
        id: 'new-combo',
        userId: 'user-1',
        foodIds: JSON.stringify(['food-1']),
        foodNames: JSON.stringify(['Dairy']),
        symptomId: 'symptom-1',
        symptomName: 'Headache',
        combinationCorrelation: 0.75,
        individualMax: 0.55,
        synergistic: true,
        pValue: 0.02,
        confidence: 'high',
        consistency: 0.70, // Now required
        sampleSize: 10,
        lastAnalyzedAt: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await testDb.table('foodCombinations').add(newRecord);
      const retrieved = await testDb.table('foodCombinations').get('new-combo') as FoodCombinationRecord;
      
      expect(retrieved.consistency).toBe(0.70);
      expect(retrieved.confidence).toBe('high');
    }, 15000);
  });
});
