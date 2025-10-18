import { jest } from '@jest/globals';
import { triggerEventRepository, TriggerEventDraft } from '../triggerEventRepository';
import { db } from '../../db/client';
import { TriggerEventRecord } from '../../db/schema';

const mockDexie: any = {
  where: jest.fn(),
  equals: jest.fn(),
  between: jest.fn(),
  reverse: jest.fn(),
  sortBy: jest.fn(),
  get: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  bulkAdd: jest.fn(),
  toArray: jest.fn(),
  limit: jest.fn(),
};

describe('TriggerEventRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).triggerEvents = mockDexie;

    // Setup default mock chain
    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.between.mockReturnValue(mockDexie);
    mockDexie.reverse.mockReturnValue(mockDexie);
    mockDexie.sortBy.mockResolvedValue([]);
    mockDexie.toArray.mockResolvedValue([]);
    mockDexie.limit.mockReturnValue(mockDexie);
    mockDexie.get.mockResolvedValue(undefined);
    mockDexie.add.mockResolvedValue(undefined);
    mockDexie.update.mockResolvedValue(undefined);
    mockDexie.delete.mockResolvedValue(undefined);
    mockDexie.bulkAdd.mockResolvedValue(undefined);
  });

  describe('create', () => {
    it('should create a trigger event with valid data', async () => {
      const eventData: TriggerEventDraft = {
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'medium',
        notes: 'Ate dairy at lunch',
      };

      const id = await triggerEventRepository.create(eventData);

      expect(id).toBeDefined();
      expect(mockDexie.add).toHaveBeenCalled();
      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as TriggerEventRecord;
      expect(addedRecord.userId).toBe('user-1');
      expect(addedRecord.triggerId).toBe('trigger-1');
      expect(addedRecord.intensity).toBe('medium');
      expect(addedRecord.notes).toBe('Ate dairy at lunch');
      expect(addedRecord.createdAt).toBeDefined();
      expect(addedRecord.updatedAt).toBeDefined();
    });

    it('should throw error when userId is missing', async () => {
      const eventData = {
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'medium',
      } as TriggerEventDraft;

      await expect(triggerEventRepository.create(eventData)).rejects.toThrow('userId is required');
    });

    it('should throw error when triggerId is missing', async () => {
      const eventData = {
        userId: 'user-1',
        timestamp: Date.now(),
        intensity: 'medium',
      } as TriggerEventDraft;

      await expect(triggerEventRepository.create(eventData)).rejects.toThrow('triggerId is required');
    });

    it('should throw error when timestamp is missing', async () => {
      const eventData = {
        userId: 'user-1',
        triggerId: 'trigger-1',
        intensity: 'medium',
      } as any;

      await expect(triggerEventRepository.create(eventData)).rejects.toThrow('timestamp is required');
    });

    it('should throw error when intensity is missing', async () => {
      const eventData = {
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
      } as any;

      await expect(triggerEventRepository.create(eventData)).rejects.toThrow('intensity is required');
    });

    it('should throw error for invalid intensity value', async () => {
      const eventData = {
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'very-high', // Invalid
      } as any;

      await expect(triggerEventRepository.create(eventData)).rejects.toThrow(
        "intensity must be 'low', 'medium', or 'high'"
      );
    });

    it('should create event with low intensity', async () => {
      const eventData: TriggerEventDraft = {
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'low',
      };

      await triggerEventRepository.create(eventData);

      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as TriggerEventRecord;
      expect(addedRecord.intensity).toBe('low');
    });

    it('should create event with high intensity', async () => {
      const eventData: TriggerEventDraft = {
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'high',
      };

      await triggerEventRepository.create(eventData);

      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as TriggerEventRecord;
      expect(addedRecord.intensity).toBe('high');
    });
  });

  describe('getById', () => {
    it('should get trigger event by ID', async () => {
      const mockEvent: TriggerEventRecord = {
        id: 'event-1',
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'medium',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockDexie.get.mockResolvedValue(mockEvent);

      const result = await triggerEventRepository.getById('event-1');

      expect(result).toEqual(mockEvent);
      expect(mockDexie.get).toHaveBeenCalledWith('event-1');
    });

    it('should return undefined when event not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      const result = await triggerEventRepository.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should get all events for a user', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await triggerEventRepository.findByUserId('user-1');

      expect(result).toEqual(mockEvents);
      expect(mockDexie.where).toHaveBeenCalledWith('userId');
      expect(mockDexie.equals).toHaveBeenCalledWith('user-1');
      expect(mockDexie.reverse).toHaveBeenCalled();
      expect(mockDexie.sortBy).toHaveBeenCalledWith('timestamp');
    });
  });

  describe('findByDateRange', () => {
    it('should get events in date range', async () => {
      const startTimestamp = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
      const endTimestamp = Date.now();
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'high',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await triggerEventRepository.findByDateRange(
        'user-1',
        startTimestamp,
        endTimestamp
      );

      expect(result).toEqual(mockEvents);
      expect(mockDexie.where).toHaveBeenCalledWith('[userId+timestamp]');
      expect(mockDexie.between).toHaveBeenCalledWith(
        ['user-1', startTimestamp],
        ['user-1', endTimestamp],
        true,
        true
      );
      expect(mockDexie.reverse).toHaveBeenCalled();
      expect(mockDexie.sortBy).toHaveBeenCalledWith('timestamp');
    });
  });

  describe('findByTriggerId', () => {
    it('should get events for a specific trigger', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await triggerEventRepository.findByTriggerId('user-1', 'trigger-1');

      expect(result).toEqual(mockEvents);
      expect(mockDexie.where).toHaveBeenCalledWith('[userId+triggerId]');
      expect(mockDexie.equals).toHaveBeenCalledWith(['user-1', 'trigger-1']);
      expect(mockDexie.reverse).toHaveBeenCalled();
      expect(mockDexie.sortBy).toHaveBeenCalledWith('timestamp');
    });
  });

  describe('update', () => {
    it('should update an existing event', async () => {
      const existingEvent: TriggerEventRecord = {
        id: 'event-1',
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'low',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockDexie.get.mockResolvedValue(existingEvent);

      await triggerEventRepository.update('event-1', {
        intensity: 'high',
        notes: 'Updated notes',
      });

      expect(mockDexie.update).toHaveBeenCalled();
      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[0]).toBe('event-1');
      expect(updateCall[1].intensity).toBe('high');
      expect(updateCall[1].notes).toBe('Updated notes');
      expect(updateCall[1].updatedAt).toBeDefined();
    });

    it('should throw error when event not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      await expect(
        triggerEventRepository.update('nonexistent', { notes: 'test' })
      ).rejects.toThrow('Trigger event not found: nonexistent');
    });

    it('should throw error for invalid intensity in update', async () => {
      const existingEvent: TriggerEventRecord = {
        id: 'event-1',
        userId: 'user-1',
        triggerId: 'trigger-1',
        timestamp: Date.now(),
        intensity: 'low',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockDexie.get.mockResolvedValue(existingEvent);

      await expect(
        triggerEventRepository.update('event-1', { intensity: 'invalid' as any })
      ).rejects.toThrow("intensity must be 'low', 'medium', or 'high'");
    });
  });

  describe('delete', () => {
    it('should delete a trigger event', async () => {
      await triggerEventRepository.delete('event-1');

      expect(mockDexie.delete).toHaveBeenCalledWith('event-1');
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create multiple events', async () => {
      const events: TriggerEventDraft[] = [
        {
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
        },
        {
          userId: 'user-1',
          triggerId: 'trigger-2',
          timestamp: Date.now(),
          intensity: 'high',
        },
      ];

      const ids = await triggerEventRepository.bulkCreate(events);

      expect(ids.length).toBe(2);
      expect(mockDexie.bulkAdd).toHaveBeenCalled();
      const addedRecords = (mockDexie.bulkAdd as jest.Mock).mock.calls[0][0] as TriggerEventRecord[];
      expect(addedRecords.length).toBe(2);
      expect(addedRecords[0].userId).toBe('user-1');
      expect(addedRecords[1].userId).toBe('user-1');
      expect(addedRecords[0].intensity).toBe('low');
      expect(addedRecords[1].intensity).toBe('high');
    });

    it('should throw error when required fields are missing', async () => {
      const events = [
        {
          userId: 'user-1',
          // missing triggerId
          timestamp: Date.now(),
          intensity: 'low',
        },
      ] as any;

      await expect(triggerEventRepository.bulkCreate(events)).rejects.toThrow(
        'Missing required fields in bulk create'
      );
    });

    it('should throw error for invalid intensity in bulk create', async () => {
      const events = [
        {
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'invalid',
        },
      ] as any;

      await expect(triggerEventRepository.bulkCreate(events)).rejects.toThrow(
        "intensity must be 'low', 'medium', or 'high'"
      );
    });
  });

  describe('getTriggerFrequency', () => {
    it('should calculate trigger frequency statistics', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'high',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          triggerId: 'trigger-2',
          timestamp: Date.now(),
          intensity: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const frequency = await triggerEventRepository.getTriggerFrequency(
        'user-1',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
      );

      expect(frequency.length).toBe(2);
      expect(frequency.find(f => f.triggerId === 'trigger-1')).toEqual({
        triggerId: 'trigger-1',
        count: 2,
        intensity: { low: 1, high: 1 },
      });
      expect(frequency.find(f => f.triggerId === 'trigger-2')).toEqual({
        triggerId: 'trigger-2',
        count: 1,
        intensity: { medium: 1 },
      });
    });
  });

  describe('getRecentNotes', () => {
    it('should return unique recent notes', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
          notes: 'At restaurant',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'medium',
          notes: 'At restaurant', // Duplicate
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'high',
          notes: 'At home',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const notes = await triggerEventRepository.getRecentNotes('user-1', 'trigger-1');

      expect(notes.length).toBe(2); // Only unique notes
      expect(notes).toContain('At restaurant');
      expect(notes).toContain('At home');
    });

    it('should filter out empty notes', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
          notes: 'Valid note',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'medium',
          notes: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'high',
          notes: '   ', // Whitespace only
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const notes = await triggerEventRepository.getRecentNotes('user-1', 'trigger-1');

      expect(notes.length).toBe(1);
      expect(notes[0]).toBe('Valid note');
    });
  });

  describe('getTodayEvents', () => {
    it('should get events for today', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await triggerEventRepository.getTodayEvents('user-1');

      expect(result).toEqual(mockEvents);
      expect(mockDexie.where).toHaveBeenCalledWith('[userId+timestamp]');
      expect(mockDexie.between).toHaveBeenCalled();
    });
  });

  describe('getMostCommonTriggers', () => {
    it('should return most common triggers sorted by count', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'high',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-4',
          userId: 'user-1',
          triggerId: 'trigger-2',
          timestamp: Date.now(),
          intensity: 'low',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const common = await triggerEventRepository.getMostCommonTriggers('user-1', 5);

      expect(common.length).toBe(2);
      expect(common[0]).toEqual({ triggerId: 'trigger-1', count: 3 });
      expect(common[1]).toEqual({ triggerId: 'trigger-2', count: 1 });
    });

    it('should limit results to specified count', async () => {
      const mockEvents: TriggerEventRecord[] = [
        { id: '1', userId: 'user-1', triggerId: 'trigger-1', timestamp: Date.now(), intensity: 'low', createdAt: Date.now(), updatedAt: Date.now() },
        { id: '2', userId: 'user-1', triggerId: 'trigger-2', timestamp: Date.now(), intensity: 'low', createdAt: Date.now(), updatedAt: Date.now() },
        { id: '3', userId: 'user-1', triggerId: 'trigger-3', timestamp: Date.now(), intensity: 'low', createdAt: Date.now(), updatedAt: Date.now() },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const common = await triggerEventRepository.getMostCommonTriggers('user-1', 2);

      expect(common.length).toBe(2);
    });
  });

  describe('getStats', () => {
    it('should calculate overall statistics', async () => {
      const mockEvents: TriggerEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'low',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          triggerId: 'trigger-1',
          timestamp: Date.now(),
          intensity: 'medium',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          triggerId: 'trigger-2',
          timestamp: Date.now(),
          intensity: 'high',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const stats = await triggerEventRepository.getStats('user-1');

      expect(stats.total).toBe(3);
      expect(stats.byIntensity).toEqual({ low: 1, medium: 1, high: 1 });
      expect(stats.uniqueTriggers).toBe(2);
    });

    it('should handle empty events', async () => {
      mockDexie.sortBy.mockResolvedValue([]);

      const stats = await triggerEventRepository.getStats('user-1');

      expect(stats.total).toBe(0);
      expect(stats.byIntensity).toEqual({ low: 0, medium: 0, high: 0 });
      expect(stats.uniqueTriggers).toBe(0);
    });
  });
});
