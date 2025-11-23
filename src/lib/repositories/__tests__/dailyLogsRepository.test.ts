/**
 * Tests for dailyLogsRepository (Story 6.2 - Task 11)
 *
 * Tests CRUD operations, compound index enforcement, smart defaults, and edge cases.
 */

import { db } from '../../db/client';
import {
  create,
  getByDate,
  listByDateRange,
  update,
  upsert,
  getPreviousDayLog,
  deleteEntry,
  getById,
  dailyLogsRepository,
} from '../dailyLogsRepository';
import { DailyLog } from '@/types/daily-log';

// Setup fake-indexeddb
import 'fake-indexeddb/auto';

describe('dailyLogsRepository', () => {
  const testUserId = 'test-user-123';
  const testDate = '2025-11-10';
  const testDate2 = '2025-11-11';

  beforeEach(async () => {
    // Clear database before each test
    await db.dailyLogs.clear();
  });

  afterAll(async () => {
    // Close database after all tests
    await db.close();
  });

  describe('create()', () => {
    it('should create a new daily log entry', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
        notes: 'Feeling good today!',
      };

      const id = await create(entry);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      // Verify entry was created
      const saved = await db.dailyLogs.get(id);
      expect(saved).toBeDefined();
      expect(saved!.userId).toBe(testUserId);
      expect(saved!.date).toBe(testDate);
      expect(saved!.mood).toBe(4);
      expect(saved!.sleepHours).toBe(7.5);
      expect(saved!.sleepQuality).toBe(4);
      expect(saved!.notes).toBe('Feeling good today!');
      expect(saved!.createdAt).toBeDefined();
      expect(saved!.updatedAt).toBeDefined();
    });

    it('should throw error if userId is missing', async () => {
      const entry: Partial<DailyLog> = {
        date: testDate,
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
      };

      await expect(create(entry)).rejects.toThrow('userId is required');
    });

    it('should throw error if date is missing', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
      };

      await expect(create(entry)).rejects.toThrow('date is required');
    });

    it('should throw error if mood is missing', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        sleepHours: 7.5,
        sleepQuality: 4,
      };

      await expect(create(entry)).rejects.toThrow('mood is required');
    });

    it('should throw error if entry already exists for user and date', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
      };

      // Create first entry
      await create(entry);

      // Try to create duplicate
      await expect(create(entry)).rejects.toThrow('Daily log already exists');
    });

    it('should store flareUpdates as JSON string', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
        flareUpdates: [
          {
            flareId: 'flare-1',
            severity: 5,
            trend: 'improving',
            notes: 'Getting better',
          },
        ],
      };

      const id = await create(entry);
      const saved = await db.dailyLogs.get(id);

      expect(typeof saved!.flareUpdates).toBe('string');
      const parsed = JSON.parse(saved!.flareUpdates as unknown as string);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].flareId).toBe('flare-1');
    });
  });

  describe('getByDate()', () => {
    it('should retrieve entry by userId and date', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
      };

      await create(entry);

      const retrieved = await getByDate(testUserId, testDate);

      expect(retrieved).toBeDefined();
      expect(retrieved!.userId).toBe(testUserId);
      expect(retrieved!.date).toBe(testDate);
      expect(retrieved!.mood).toBe(5);
    });

    it('should return undefined if entry does not exist', async () => {
      const retrieved = await getByDate(testUserId, '2025-01-01');

      expect(retrieved).toBeUndefined();
    });

    it('should parse flareUpdates from JSON string', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7,
        sleepQuality: 4,
        flareUpdates: [
          {
            flareId: 'flare-1',
            severity: 6,
            trend: 'stable',
          },
        ],
      };

      await create(entry);
      const retrieved = await getByDate(testUserId, testDate);

      expect(retrieved!.flareUpdates).toBeInstanceOf(Array);
      expect(retrieved!.flareUpdates).toHaveLength(1);
      expect(retrieved!.flareUpdates![0].flareId).toBe('flare-1');
    });
  });

  describe('listByDateRange()', () => {
    beforeEach(async () => {
      // Create multiple entries
      await create({
        userId: testUserId,
        date: '2025-11-08',
        mood: 3,
        sleepHours: 6.5,
        sleepQuality: 3,
      });

      await create({
        userId: testUserId,
        date: '2025-11-09',
        mood: 4,
        sleepHours: 7,
        sleepQuality: 4,
      });

      await create({
        userId: testUserId,
        date: '2025-11-10',
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
      });

      // Different user entry
      await create({
        userId: 'other-user',
        date: '2025-11-09',
        mood: 2,
        sleepHours: 5,
        sleepQuality: 2,
      });
    });

    it('should retrieve entries within date range', async () => {
      const entries = await listByDateRange(testUserId, '2025-11-08', '2025-11-10');

      expect(entries).toHaveLength(3);
      expect(entries[0].date).toBe('2025-11-08');
      expect(entries[1].date).toBe('2025-11-09');
      expect(entries[2].date).toBe('2025-11-10');
    });

    it('should only return entries for specified user', async () => {
      const entries = await listByDateRange(testUserId, '2025-11-08', '2025-11-10');

      expect(entries.every((e) => e.userId === testUserId)).toBe(true);
    });

    it('should return empty array if no entries in range', async () => {
      const entries = await listByDateRange(testUserId, '2025-01-01', '2025-01-31');

      expect(entries).toHaveLength(0);
    });

    it('should sort entries by date', async () => {
      const entries = await listByDateRange(testUserId, '2025-11-08', '2025-11-10');

      expect(entries[0].date).toBe('2025-11-08');
      expect(entries[1].date).toBe('2025-11-09');
      expect(entries[2].date).toBe('2025-11-10');
    });
  });

  describe('update()', () => {
    it('should update existing entry', async () => {
      const id = await create({
        userId: testUserId,
        date: testDate,
        mood: 3,
        sleepHours: 7,
        sleepQuality: 3,
        notes: 'Original notes',
      });

      await update(id, {
        mood: 5,
        notes: 'Updated notes',
      });

      const updated = await db.dailyLogs.get(id);

      expect(updated!.mood).toBe(5);
      expect(updated!.notes).toBe('Updated notes');
      expect(updated!.sleepHours).toBe(7); // Unchanged
      expect(updated!.updatedAt).toBeGreaterThan(updated!.createdAt);
    });

    it('should throw error if entry does not exist', async () => {
      await expect(update('non-existent-id', { mood: 4 })).rejects.toThrow(
        'Daily log not found'
      );
    });
  });

  describe('upsert()', () => {
    it('should create new entry if none exists', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
      };

      const id = await upsert(entry);

      expect(id).toBeDefined();

      const saved = await db.dailyLogs.get(id);
      expect(saved).toBeDefined();
      expect(saved!.mood).toBe(4);
    });

    it('should update existing entry if one exists', async () => {
      // Create initial entry
      const id1 = await create({
        userId: testUserId,
        date: testDate,
        mood: 3,
        sleepHours: 6,
        sleepQuality: 3,
        notes: 'Original',
      });

      // Upsert with updated data
      const id2 = await upsert({
        userId: testUserId,
        date: testDate,
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
        notes: 'Updated',
      });

      // Should return same ID
      expect(id2).toBe(id1);

      // Verify update
      const updated = await db.dailyLogs.get(id1);
      expect(updated!.mood).toBe(5);
      expect(updated!.sleepHours).toBe(8);
      expect(updated!.notes).toBe('Updated');
    });

    it('should enforce one entry per user per date', async () => {
      await upsert({
        userId: testUserId,
        date: testDate,
        mood: 3,
        sleepHours: 7,
        sleepQuality: 3,
      });

      await upsert({
        userId: testUserId,
        date: testDate,
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
      });

      // Should only have one entry
      const entries = await db.dailyLogs.where('[userId+date]').equals([testUserId, testDate]).toArray();
      expect(entries).toHaveLength(1);
      expect(entries[0].mood).toBe(5); // Latest value
    });
  });

  describe('getPreviousDayLog()', () => {
    it('should retrieve previous day entry', async () => {
      await create({
        userId: testUserId,
        date: '2025-11-09',
        mood: 4,
        sleepHours: 7.5,
        sleepQuality: 4,
      });

      const previous = await getPreviousDayLog(testUserId, '2025-11-10');

      expect(previous).toBeDefined();
      expect(previous!.date).toBe('2025-11-09');
      expect(previous!.mood).toBe(4);
    });

    it('should return undefined if no previous day entry', async () => {
      const previous = await getPreviousDayLog(testUserId, '2025-11-10');

      expect(previous).toBeUndefined();
    });

    it('should correctly calculate previous date', async () => {
      await create({
        userId: testUserId,
        date: '2025-11-30',
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
      });

      const previous = await getPreviousDayLog(testUserId, '2025-12-01');

      expect(previous).toBeDefined();
      expect(previous!.date).toBe('2025-11-30');
    });
  });

  describe('deleteEntry()', () => {
    it('should delete entry by ID', async () => {
      const id = await create({
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7,
        sleepQuality: 4,
      });

      await deleteEntry(id);

      const deleted = await db.dailyLogs.get(id);
      expect(deleted).toBeUndefined();
    });
  });

  describe('getById()', () => {
    it('should retrieve entry by ID', async () => {
      const id = await create({
        userId: testUserId,
        date: testDate,
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
        notes: 'Test notes',
      });

      const retrieved = await getById(id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(id);
      expect(retrieved!.mood).toBe(5);
      expect(retrieved!.notes).toBe('Test notes');
    });

    it('should return undefined if ID does not exist', async () => {
      const retrieved = await getById('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('dailyLogsRepository object', () => {
    it('should export all CRUD methods', () => {
      expect(dailyLogsRepository.create).toBeDefined();
      expect(dailyLogsRepository.getByDate).toBeDefined();
      expect(dailyLogsRepository.listByDateRange).toBeDefined();
      expect(dailyLogsRepository.update).toBeDefined();
      expect(dailyLogsRepository.upsert).toBeDefined();
      expect(dailyLogsRepository.getPreviousDayLog).toBeDefined();
      expect(dailyLogsRepository.delete).toBeDefined();
      expect(dailyLogsRepository.getById).toBeDefined();
    });
  });

  describe('Compound index enforcement', () => {
    it('should enforce unique [userId+date] constraint', async () => {
      const entry: Partial<DailyLog> = {
        userId: testUserId,
        date: testDate,
        mood: 4,
        sleepHours: 7,
        sleepQuality: 4,
      };

      // Create first entry
      await create(entry);

      // Try to create duplicate - should fail
      await expect(create(entry)).rejects.toThrow('Daily log already exists');
    });

    it('should allow same date for different users', async () => {
      await create({
        userId: 'user-1',
        date: testDate,
        mood: 4,
        sleepHours: 7,
        sleepQuality: 4,
      });

      await create({
        userId: 'user-2',
        date: testDate,
        mood: 3,
        sleepHours: 6,
        sleepQuality: 3,
      });

      const entries = await db.dailyLogs.where('date').equals(testDate).toArray();
      expect(entries).toHaveLength(2);
    });

    it('should allow same user with different dates', async () => {
      await create({
        userId: testUserId,
        date: '2025-11-09',
        mood: 4,
        sleepHours: 7,
        sleepQuality: 4,
      });

      await create({
        userId: testUserId,
        date: '2025-11-10',
        mood: 5,
        sleepHours: 8,
        sleepQuality: 5,
      });

      const entries = await db.dailyLogs.where('userId').equals(testUserId).toArray();
      expect(entries).toHaveLength(2);
    });
  });
});
