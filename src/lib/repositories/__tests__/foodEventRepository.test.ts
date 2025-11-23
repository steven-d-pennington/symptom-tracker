import { jest } from '@jest/globals';
import { foodEventRepository } from '../foodEventRepository';
import { db } from '../../db/client';
import type { FoodEventRecord } from '../../db/schema';

const mockDexie: any = {
  where: jest.fn(),
  equals: jest.fn(),
  get: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  toArray: jest.fn(),
  filter: jest.fn(),
  reverse: jest.fn(),
  limit: jest.fn(),
};

describe('FoodEventRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).foodEvents = mockDexie;

    // Setup default mock chain
    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.toArray.mockResolvedValue([]);
    mockDexie.filter.mockReturnValue(mockDexie);
    mockDexie.reverse.mockReturnValue(mockDexie);
    mockDexie.limit.mockReturnValue(mockDexie);
    mockDexie.get.mockResolvedValue(undefined);
    mockDexie.add.mockResolvedValue(undefined);
    mockDexie.update.mockResolvedValue(undefined);
    mockDexie.delete.mockResolvedValue(undefined);
  });

  describe('create', () => {
    it('should create a food event with valid data', async () => {
      const eventData = {
        userId: 'user-1',
        mealId: 'meal-123',
        foodIds: JSON.stringify(['food-1', 'food-2']),
        timestamp: Date.now(),
        mealType: 'lunch' as const,
        portionMap: JSON.stringify({ 'food-1': 'medium', 'food-2': 'small' }),
        notes: 'Delicious meal',
      };

      const id = await foodEventRepository.create(eventData);

      expect(id).toBeDefined();
      expect(mockDexie.add).toHaveBeenCalled();
      const addedEvent = (mockDexie.add as jest.Mock).mock.calls[0][0] as FoodEventRecord;
      expect(addedEvent.mealType).toBe('lunch');
      expect(addedEvent.timestamp).toBe(eventData.timestamp);
      expect(addedEvent.createdAt).toBeDefined();
      expect(addedEvent.updatedAt).toBeDefined();
    });

    it('should throw error if timestamp is missing', async () => {
      const eventData = {
        userId: 'user-1',
        mealId: 'meal-123',
        foodIds: JSON.stringify(['food-1']),
        mealType: 'breakfast' as const,
      } as any;

      await expect(foodEventRepository.create(eventData)).rejects.toThrow('Timestamp is required');
    });

    it('should throw error if foodIds is empty', async () => {
      const eventData = {
        userId: 'user-1',
        mealId: 'meal-123',
        foodIds: JSON.stringify([]),
        timestamp: Date.now(),
        mealType: 'breakfast' as const,
      };

      await expect(foodEventRepository.create(eventData)).rejects.toThrow('At least one food');
    });

    it('should throw error for invalid mealType', async () => {
      const eventData = {
        userId: 'user-1',
        mealId: 'meal-123',
        foodIds: JSON.stringify(['food-1']),
        timestamp: Date.now(),
        mealType: 'invalid' as any,
      };

      await expect(foodEventRepository.create(eventData)).rejects.toThrow('Invalid meal type');
    });

    it('should accept all valid mealTypes', async () => {
      const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

      for (const mealType of validTypes) {
        const eventData = {
          userId: 'user-1',
          mealId: `meal-${mealType}`,
          foodIds: JSON.stringify(['food-1']),
          timestamp: Date.now(),
          mealType,
          portionMap: JSON.stringify({ 'food-1': 'medium' }),
        };

        await foodEventRepository.create(eventData);
      }

      expect(mockDexie.add).toHaveBeenCalledTimes(4);
    });
  });

  describe('update', () => {
    it('should update a food event', async () => {
      await foodEventRepository.update('event-1', { notes: 'Updated notes' });

      expect(mockDexie.update).toHaveBeenCalledWith('event-1', {
        notes: 'Updated notes',
        updatedAt: expect.any(Number),
      });
    });

    it('should validate foodIds on update', async () => {
      await expect(
        foodEventRepository.update('event-1', { foodIds: JSON.stringify([]) })
      ).rejects.toThrow('At least one food');
    });

    it('should validate mealType on update', async () => {
      await expect(
        foodEventRepository.update('event-1', { mealType: 'invalid' as any })
      ).rejects.toThrow('Invalid meal type');
    });
  });

  describe('findByDateRange', () => {
    it('should find events within date range', async () => {
      const startDate = new Date('2024-01-01').getTime();
      const endDate = new Date('2024-01-31').getTime();

      const mockEvents: FoodEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          mealId: 'meal-1',
          foodIds: JSON.stringify(['food-1']),
          timestamp: new Date('2024-01-15').getTime(),
          mealType: 'lunch',
          portionMap: JSON.stringify({ 'food-1': 'medium' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.filter.mockImplementation((fn: any) => ({
        ...mockDexie,
        toArray: () => Promise.resolve(mockEvents.filter(fn)),
      }));

      const result = await foodEventRepository.findByDateRange('user-1', startDate, endDate);

      expect(mockDexie.where).toHaveBeenCalledWith('userId');
      expect(result).toHaveLength(1);
    });
  });

  describe('findByMealType', () => {
    it('should find events by meal type', async () => {
      const mockEvents: FoodEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          mealId: 'meal-1',
          foodIds: JSON.stringify(['food-1']),
          timestamp: Date.now(),
          mealType: 'breakfast',
          portionMap: JSON.stringify({ 'food-1': 'medium' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const result = await foodEventRepository.findByMealType('user-1', 'breakfast');

      expect(mockDexie.where).toHaveBeenCalledWith('[userId+mealType]');
      expect(result).toHaveLength(1);
      expect(result[0].mealType).toBe('breakfast');
    });
  });

  describe('getRecent', () => {
    it('should return recent events in reverse chronological order', async () => {
      const mockEvents: FoodEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          mealId: 'meal-1',
          foodIds: JSON.stringify(['food-1']),
          timestamp: Date.now() - 1000,
          mealType: 'lunch',
          portionMap: JSON.stringify({ 'food-1': 'medium' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          mealId: 'meal-2',
          foodIds: JSON.stringify(['food-2']),
          timestamp: Date.now(),
          mealType: 'dinner',
          portionMap: JSON.stringify({ 'food-2': 'large' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const result = await foodEventRepository.getRecent('user-1', 10);

      expect(mockDexie.where).toHaveBeenCalledWith('userId');
      expect(result.length).toBeLessThanOrEqual(10);
      // Verify sorted in descending order
      if (result.length > 1) {
        expect(result[0].timestamp).toBeGreaterThanOrEqual(result[1].timestamp);
      }
    });
  });

  describe('getStats', () => {
    it('should return statistics about food events', async () => {
      const mockEvents: FoodEventRecord[] = [
        {
          id: 'event-1',
          userId: 'user-1',
          mealId: 'meal-1',
          foodIds: JSON.stringify(['food-1']),
          timestamp: Date.now(),
          mealType: 'breakfast',
          portionMap: JSON.stringify({ 'food-1': 'medium' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-2',
          userId: 'user-1',
          mealId: 'meal-2',
          foodIds: JSON.stringify(['food-2', 'food-3']),
          timestamp: Date.now(),
          mealType: 'breakfast',
          portionMap: JSON.stringify({ 'food-2': 'small', 'food-3': 'medium' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'event-3',
          userId: 'user-1',
          mealId: 'meal-3',
          foodIds: JSON.stringify(['food-4']),
          timestamp: Date.now(),
          mealType: 'lunch',
          portionMap: JSON.stringify({ 'food-4': 'large' }),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockEvents);

      const stats = await foodEventRepository.getStats('user-1');

      expect(stats.total).toBe(3);
      expect(stats.byMealType.breakfast).toBe(2);
      expect(stats.byMealType.lunch).toBe(1);
    });
  });
});
