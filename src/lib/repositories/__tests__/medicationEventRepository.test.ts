import { jest } from '@jest/globals';
import { medicationEventRepository, MedicationEventDraft } from '../medicationEventRepository';
import { db } from '../../db/client';
import { MedicationEventRecord } from '../../db/schema';

// Mock the medicationRepository before importing it
const mockGetById = jest.fn();
jest.mock('../medicationRepository', () => ({
  medicationRepository: {
    getById: mockGetById,
  },
}));

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
  and: jest.fn(),
  toArray: jest.fn(),
  filter: jest.fn(),
  limit: jest.fn(),
};

describe('MedicationEventRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetById.mockClear();
    (db as any).medicationEvents = mockDexie;

    // Setup default mock chain
    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.between.mockReturnValue(mockDexie);
    mockDexie.reverse.mockReturnValue(mockDexie);
    mockDexie.sortBy.mockResolvedValue([]);
    mockDexie.and.mockReturnValue(mockDexie);
    mockDexie.toArray.mockResolvedValue([]);
    mockDexie.filter.mockReturnValue(mockDexie);
    mockDexie.limit.mockReturnValue(mockDexie);
    mockDexie.get.mockResolvedValue(undefined);
    mockDexie.add.mockResolvedValue(undefined);
    mockDexie.update.mockResolvedValue(undefined);
    mockDexie.delete.mockResolvedValue(undefined);
    mockDexie.bulkAdd.mockResolvedValue(undefined);
  });

  describe('create', () => {
    it('should create a medication event with valid data', async () => {
      const eventData: MedicationEventDraft = {
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
        notes: 'Taken with food',
      };

      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [{ time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
      });

      const id = await medicationEventRepository.create(eventData);

      expect(id).toBeDefined();
      expect(mockDexie.add).toHaveBeenCalled();
      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as MedicationEventRecord;
      expect(addedRecord.userId).toBe('user-1');
      expect(addedRecord.medicationId).toBe('med-1');
      expect(addedRecord.taken).toBe(true);
      expect(addedRecord.notes).toBe('Taken with food');
      expect(addedRecord.createdAt).toBeDefined();
      expect(addedRecord.updatedAt).toBeDefined();
    });

    it('should throw error when userId is missing', async () => {
      const eventData = {
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
      } as MedicationEventDraft;

      await expect(medicationEventRepository.create(eventData)).rejects.toThrow('userId is required');
    });

    it('should throw error when medicationId is missing', async () => {
      const eventData = {
        userId: 'user-1',
        timestamp: Date.now(),
        taken: true,
      } as MedicationEventDraft;

      await expect(medicationEventRepository.create(eventData)).rejects.toThrow('medicationId is required');
    });

    it('should throw error when timestamp is missing', async () => {
      const eventData = {
        userId: 'user-1',
        medicationId: 'med-1',
        taken: true,
      } as any;

      await expect(medicationEventRepository.create(eventData)).rejects.toThrow('timestamp is required');
    });

    it('should throw error when taken is missing', async () => {
      const eventData = {
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: Date.now(),
      } as any;

      await expect(medicationEventRepository.create(eventData)).rejects.toThrow('taken is required');
    });

    it('should calculate timing warning as "early" when taken >2h before scheduled', async () => {
      // Schedule at 8am, event at 5am (3 hours early)
      const eventTime = new Date('2025-01-15T05:00:00');
      const eventData: MedicationEventDraft = {
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: eventTime.getTime(),
        taken: true,
      };

      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [{ time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
      });

      await medicationEventRepository.create(eventData);

      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as MedicationEventRecord;
      expect(addedRecord.timingWarning).toBe('early');
    });

    it('should calculate timing warning as "late" when taken >2h after scheduled', async () => {
      // Schedule at 8am, event at 11am (3 hours late)
      const eventTime = new Date('2025-01-15T11:00:00');
      const eventData: MedicationEventDraft = {
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: eventTime.getTime(),
        taken: true,
      };

      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [{ time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
      });

      await medicationEventRepository.create(eventData);

      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as MedicationEventRecord;
      expect(addedRecord.timingWarning).toBe('late');
    });

    it('should not set timing warning when within ±2h window', async () => {
      // Schedule at 8am, event at 9am (1 hour late, within window)
      const eventTime = new Date('2025-01-15T09:00:00');
      const eventData: MedicationEventDraft = {
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: eventTime.getTime(),
        taken: true,
      };

      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [{ time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
      });

      await medicationEventRepository.create(eventData);

      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as MedicationEventRecord;
      expect(addedRecord.timingWarning).toBeNull();
    });

    it('should not set timing warning when medication has no schedule', async () => {
      const eventData: MedicationEventDraft = {
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
      };

      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [],
      });

      await medicationEventRepository.create(eventData);

      const addedRecord = (mockDexie.add as jest.Mock).mock.calls[0][0] as MedicationEventRecord;
      expect(addedRecord.timingWarning).toBeNull();
    });
  });

  describe('getById', () => {
    it('should get medication event by ID', async () => {
      const mockEvent: MedicationEventRecord = {
        id: 'event-1',
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
        timingWarning: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockDexie.get.mockResolvedValue(mockEvent);

      const result = await medicationEventRepository.getById('event-1');

      expect(result).toEqual(mockEvent);
      expect(mockDexie.get).toHaveBeenCalledWith('event-1');
    });

    it('should return undefined when event not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      const result = await medicationEventRepository.getById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('should get all events for a user', async () => {
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await medicationEventRepository.findByUserId('user-1');

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
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await medicationEventRepository.findByDateRange(
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

  describe('findByMedicationId', () => {
    it('should get events for a specific medication', async () => {
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await medicationEventRepository.findByMedicationId('user-1', 'med-1');

      expect(result).toEqual(mockEvents);
      expect(mockDexie.where).toHaveBeenCalledWith('[userId+medicationId]');
      expect(mockDexie.equals).toHaveBeenCalledWith(['user-1', 'med-1']);
      expect(mockDexie.reverse).toHaveBeenCalled();
      expect(mockDexie.sortBy).toHaveBeenCalledWith('timestamp');
    });
  });

  describe('update', () => {
    it('should update an existing event', async () => {
      const existingEvent: MedicationEventRecord = {
        id: 'event-1',
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
        timingWarning: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockDexie.get.mockResolvedValue(existingEvent);

      await medicationEventRepository.update('event-1', {
        notes: 'Updated notes',
      });

      expect(mockDexie.update).toHaveBeenCalled();
      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[0]).toBe('event-1');
      expect(updateCall[1].notes).toBe('Updated notes');
      expect(updateCall[1].updatedAt).toBeDefined();
    });

    it('should throw error when event not found', async () => {
      mockDexie.get.mockResolvedValue(undefined);

      await expect(
        medicationEventRepository.update('nonexistent', { notes: 'test' })
      ).rejects.toThrow('Medication event not found: nonexistent');
    });

    it('should recalculate timing warning when timestamp changes', async () => {
      const existingEvent: MedicationEventRecord = {
        id: 'event-1',
        userId: 'user-1',
        medicationId: 'med-1',
        timestamp: Date.now(),
        taken: true,
        timingWarning: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockDexie.get.mockResolvedValue(existingEvent);

      const newTimestamp = new Date('2025-01-15T11:00:00').getTime();
      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [{ time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
      });

      await medicationEventRepository.update('event-1', {
        timestamp: newTimestamp,
      });

      expect(mockDexie.update).toHaveBeenCalled();
      const updateCall = (mockDexie.update as jest.Mock).mock.calls[0];
      expect(updateCall[1].timingWarning).toBe('late'); // 11am is 3h late from 8am schedule
    });
  });

  describe('delete', () => {
    it('should delete a medication event', async () => {
      await medicationEventRepository.delete('event-1');

      expect(mockDexie.delete).toHaveBeenCalledWith('event-1');
    });
  });

  describe('bulkCreate', () => {
    it('should bulk create multiple events', async () => {
      const events: MedicationEventDraft[] = [
        {
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
        },
        {
          userId: 'user-1',
          medicationId: 'med-2',
          timestamp: Date.now(),
          taken: false,
        },
      ];

      mockGetById.mockResolvedValue({
        id: 'med-1',
        schedule: [],
      });

      const ids = await medicationEventRepository.bulkCreate(events);

      expect(ids.length).toBe(2);
      expect(mockDexie.bulkAdd).toHaveBeenCalled();
      const addedRecords = (mockDexie.bulkAdd as jest.Mock).mock.calls[0][0] as MedicationEventRecord[];
      expect(addedRecords.length).toBe(2);
      expect(addedRecords[0].userId).toBe('user-1');
      expect(addedRecords[1].userId).toBe('user-1');
    });

    it('should throw error when required fields are missing', async () => {
      const events = [
        {
          userId: 'user-1',
          // missing medicationId
          timestamp: Date.now(),
          taken: true,
        },
      ] as any;

      await expect(medicationEventRepository.bulkCreate(events)).rejects.toThrow(
        'Missing required fields in bulk create'
      );
    });
  });

  describe('getAdherenceStats', () => {
    it('should calculate adherence statistics', async () => {
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          timingWarning: 'late',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: false,
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const stats = await medicationEventRepository.getAdherenceStats(
        'user-1',
        'med-1',
        Date.now() - 7 * 24 * 60 * 60 * 1000,
        Date.now()
      );

      expect(stats.total).toBe(3);
      expect(stats.taken).toBe(2);
      expect(stats.skipped).toBe(1);
      expect(stats.adherenceRate).toBeCloseTo(66.67, 1);
      expect(stats.withTimingWarnings).toBe(1);
    });
  });

  describe('getRecentNotes', () => {
    it('should return unique recent notes', async () => {
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          notes: 'With food',
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          notes: 'With food', // Duplicate
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          notes: 'Before bed',
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const notes = await medicationEventRepository.getRecentNotes('user-1', 'med-1');

      expect(notes.length).toBe(2); // Only unique notes
      expect(notes).toContain('With food');
      expect(notes).toContain('Before bed');
    });

    it('should filter out empty notes', async () => {
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          notes: 'With food',
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          notes: '',
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          notes: '   ', // Whitespace only
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const notes = await medicationEventRepository.getRecentNotes('user-1', 'med-1');

      expect(notes.length).toBe(1);
      expect(notes[0]).toBe('With food');
    });
  });

  describe('getTodayEvents', () => {
    it('should get events for today', async () => {
      const mockEvents: MedicationEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          medicationId: 'med-1',
          timestamp: Date.now(),
          taken: true,
          timingWarning: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.sortBy.mockResolvedValue(mockEvents);

      const result = await medicationEventRepository.getTodayEvents('user-1');

      expect(result).toEqual(mockEvents);
      expect(mockDexie.where).toHaveBeenCalledWith('[userId+timestamp]');
      expect(mockDexie.between).toHaveBeenCalled();
    });
  });
});
