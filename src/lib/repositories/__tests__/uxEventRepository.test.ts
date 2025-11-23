import Dexie from 'dexie';
import { jest } from '@jest/globals';
import { uxEventRepository } from '../uxEventRepository';
import { db } from '../../db/client';
import { UxEventRecord } from '../../db/schema';

const mockDexie: any = {
  where: jest.fn(),
  equals: jest.fn(),
  between: jest.fn(),
  and: jest.fn(),
  reverse: jest.fn(),
  limit: jest.fn(),
  toArray: jest.fn(),
  add: jest.fn(),
  delete: jest.fn(),
};

describe('uxEventRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).uxEvents = mockDexie;

    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.between.mockReturnValue(mockDexie);
    mockDexie.and.mockReturnValue(mockDexie);
    mockDexie.reverse.mockReturnValue(mockDexie);
    mockDexie.limit.mockReturnValue(mockDexie);
    mockDexie.toArray.mockResolvedValue([]);
    mockDexie.add.mockResolvedValue(undefined);
    mockDexie.delete.mockResolvedValue(0);
  });

  describe('recordEvent', () => {
    it('persists UX events with JSON-stringified metadata', async () => {
      const metadata = { source: 'dashboard', intent: 'quickAction', action: 'flare' };

      await uxEventRepository.recordEvent({
        userId: 'user-123',
        eventType: 'navigation.quickAction',
        metadata,
        timestamp: 1730000000000,
      });

      expect(mockDexie.add).toHaveBeenCalledTimes(1);
      const savedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as UxEventRecord;
      expect(savedRecord.userId).toBe('user-123');
      expect(savedRecord.eventType).toBe('navigation.quickAction');
      expect(savedRecord.timestamp).toBe(1730000000000);
      expect(savedRecord.metadata).toBe(JSON.stringify(metadata));
      expect(typeof savedRecord.createdAt).toBe('number');
    });

    it('throws when userId is missing', async () => {
      await expect(
        uxEventRepository.recordEvent({
          userId: '',
          eventType: 'navigation.quickAction',
        }),
      ).rejects.toThrow('userId is required');
    });

    it('throws when eventType is missing', async () => {
      await expect(
        uxEventRepository.recordEvent({
          userId: 'user-123',
          eventType: '',
        }),
      ).rejects.toThrow('eventType is required');
    });
  });

  describe('listRecent', () => {
    it('filters by compound index [userId+eventType]', async () => {
      const mockRecord: UxEventRecord = {
        id: 'evt-1',
        userId: 'user-123',
        eventType: 'navigation.quickAction',
        metadata: '{"action":"flare"}',
        timestamp: 1730000000000,
        createdAt: 1730000000001,
      };
      mockDexie.toArray.mockResolvedValue([mockRecord]);

      const results = await uxEventRepository.listRecent('user-123', {
        eventType: 'navigation.quickAction',
        limit: 5,
      });

      expect(mockDexie.where).toHaveBeenCalledWith('[userId+eventType]');
      expect(mockDexie.equals).toHaveBeenCalledWith(['user-123', 'navigation.quickAction']);
      expect(mockDexie.limit).toHaveBeenCalledWith(5);
      expect(results).toHaveLength(1);
      expect(results[0].metadata).toEqual({ action: 'flare' });
    });

    it('defaults to [userId+timestamp] index when eventType not provided', async () => {
      await uxEventRepository.listRecent('user-123');

      expect(mockDexie.where).toHaveBeenCalledWith('[userId+timestamp]');
      expect(mockDexie.between).toHaveBeenCalledWith(
        ['user-123', Dexie.minKey],
        ['user-123', Dexie.maxKey],
      );
    });

    it('applies since filter using collection.and', async () => {
      await uxEventRepository.listRecent('user-123', { since: 1730000000000 });
      expect(mockDexie.and).toHaveBeenCalled();
      const andPredicate = (mockDexie.and as jest.Mock).mock.calls[0][0] as (record: UxEventRecord) => boolean;
      expect(andPredicate({
        id: 'evt-1',
        userId: 'user-123',
        eventType: 'navigation.quickAction',
        metadata: '{}',
        timestamp: 1730000000000,
        createdAt: 1730000000000,
      })).toBe(true);
      expect(andPredicate({
        id: 'evt-2',
        userId: 'user-123',
        eventType: 'navigation.quickAction',
        metadata: '{}',
        timestamp: 1729999999999,
        createdAt: 1729999999999,
      })).toBe(false);
    });

    it('handles malformed metadata gracefully', async () => {
      const malformed: UxEventRecord = {
        id: 'evt-err',
        userId: 'user-123',
        eventType: 'navigation.quickAction',
        metadata: '{malformed',
        timestamp: 1730000000000,
        createdAt: 1730000000000,
      };
      mockDexie.toArray.mockResolvedValue([malformed]);

      const results = await uxEventRepository.listRecent('user-123');
      expect(results[0].metadata).toEqual({});
    });

    it('throws when userId missing', async () => {
      await expect(uxEventRepository.listRecent('', {} as any)).rejects.toThrow('userId is required');
    });
  });

  describe('clear', () => {
    it('clears scoped events via [userId+eventType] index', async () => {
      mockDexie.delete.mockResolvedValue(3);

      const deleted = await uxEventRepository.clear('user-123', {
        eventType: 'navigation.quickAction',
        before: 1730000000000,
      });

      expect(mockDexie.where).toHaveBeenCalledWith('[userId+eventType]');
      expect(mockDexie.equals).toHaveBeenCalledWith(['user-123', 'navigation.quickAction']);
      expect(mockDexie.and).toHaveBeenCalled();
      expect(mockDexie.delete).toHaveBeenCalledTimes(1);
      expect(deleted).toBe(3);
    });

    it('throws when userId missing', async () => {
      await expect(uxEventRepository.clear('', {} as any)).rejects.toThrow('userId is required');
    });
  });
});
