import { jest } from '@jest/globals';
import { foodRepository } from '../foodRepository';
import { db } from '../../db/client';
import type { FoodRecord } from '../../db/schema';

const mockDexie: any = {
  where: jest.fn(),
  equals: jest.fn(),
  get: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  bulkAdd: jest.fn(),
  toArray: jest.fn(),
  filter: jest.fn(),
};

describe('FoodRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).foods = mockDexie;

    // Setup default mock chain
    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.toArray.mockResolvedValue([]);
    mockDexie.filter.mockReturnValue(mockDexie);
    mockDexie.get.mockResolvedValue(undefined);
    mockDexie.add.mockResolvedValue(undefined);
    mockDexie.update.mockResolvedValue(undefined);
    mockDexie.delete.mockResolvedValue(undefined);
    mockDexie.bulkAdd.mockResolvedValue(undefined);
  });

  describe('getAll', () => {
    it('should return all foods for a user', async () => {
      const mockFoods: FoodRecord[] = [
        {
          id: 'food-1',
          userId: 'user-1',
          name: 'Chicken Breast',
          category: 'Proteins',
          allergenTags: JSON.stringify([]),
          isDefault: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockFoods);

      const result = await foodRepository.getAll('user-1');

      expect(mockDexie.where).toHaveBeenCalledWith('userId');
      expect(mockDexie.equals).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockFoods);
    });
  });

  describe('search', () => {
    const mockFoods: FoodRecord[] = [
      {
        id: 'food-1',
        userId: 'user-1',
        name: 'Chicken Breast',
        category: 'Proteins',
        allergenTags: JSON.stringify([]),
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'food-2',
        userId: 'user-1',
        name: 'Milk',
        category: 'Dairy',
        allergenTags: JSON.stringify(['dairy']),
        isDefault: true,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'food-3',
        userId: 'user-1',
        name: 'Bread',
        category: 'Grains',
        allergenTags: JSON.stringify(['gluten']),
        isDefault: true,
        isActive: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    beforeEach(() => {
      mockDexie.filter.mockImplementation((fn: any) => ({
        ...mockDexie,
        toArray: () => Promise.resolve(mockFoods.filter(fn)),
      }));
    });

    it('should search foods by name', async () => {
      const result = await foodRepository.search('user-1', 'chicken');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Chicken Breast');
    });

    it('should filter by category', async () => {
      const result = await foodRepository.search('user-1', '', { category: 'Dairy' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('Dairy');
    });

    it('should filter by allergens', async () => {
      const result = await foodRepository.search('user-1', '', { allergens: ['dairy'] });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Milk');
    });

    it('should only return active foods', async () => {
      const result = await foodRepository.search('user-1', '');

      expect(result.every((f) => f.isActive)).toBe(true);
      expect(result.find((f) => f.name === 'Bread')).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a food with valid data', async () => {
      const foodData = {
        userId: 'user-1',
        name: 'Custom Salad',
        category: 'Vegetables',
        allergenTags: JSON.stringify(['nuts']),
        isDefault: false,
        isActive: true,
      };

      const id = await foodRepository.create(foodData);

      expect(id).toBeDefined();
      expect(mockDexie.add).toHaveBeenCalled();
      const addedFood = (mockDexie.add as jest.Mock).mock.calls[0][0] as FoodRecord;
      expect(addedFood.name).toBe('Custom Salad');
      expect(addedFood.category).toBe('Vegetables');
      expect(addedFood.createdAt).toBeDefined();
      expect(addedFood.updatedAt).toBeDefined();
    });

    it('should throw error for invalid allergen tags', async () => {
      const foodData = {
        userId: 'user-1',
        name: 'Test Food',
        category: 'Test',
        allergenTags: JSON.stringify(['invalid-allergen']),
        isDefault: false,
        isActive: true,
      };

      await expect(foodRepository.create(foodData)).rejects.toThrow('Invalid allergen tag');
    });

    it('should allow empty allergen tags', async () => {
      const foodData = {
        userId: 'user-1',
        name: 'Plain Rice',
        category: 'Grains',
        allergenTags: JSON.stringify([]),
        isDefault: false,
        isActive: true,
      };

      await foodRepository.create(foodData);

      expect(mockDexie.add).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a food', async () => {
      await foodRepository.update('food-1', { name: 'Updated Name' });

      expect(mockDexie.update).toHaveBeenCalledWith('food-1', {
        name: 'Updated Name',
        updatedAt: expect.any(Number),
      });
    });

    it('should validate allergen tags on update', async () => {
      await expect(
        foodRepository.update('food-1', { allergenTags: JSON.stringify(['invalid']) })
      ).rejects.toThrow('Invalid allergen tag');
    });
  });

  describe('archive', () => {
    it('should soft delete a food', async () => {
      await foodRepository.archive('food-1');

      expect(mockDexie.update).toHaveBeenCalledWith('food-1', {
        isActive: false,
        updatedAt: expect.any(Number),
      });
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple foods', async () => {
      const foods = [
        {
          userId: 'user-1',
          name: 'Food 1',
          category: 'Test',
          allergenTags: JSON.stringify([]),
          isDefault: false,
          isActive: true,
        },
        {
          userId: 'user-1',
          name: 'Food 2',
          category: 'Test',
          allergenTags: JSON.stringify(['dairy']),
          isDefault: false,
          isActive: true,
        },
      ];

      const ids = await foodRepository.bulkCreate(foods);

      expect(ids).toHaveLength(2);
      expect(mockDexie.bulkAdd).toHaveBeenCalled();
    });

    it('should throw error if any food has invalid allergen', async () => {
      const foods = [
        {
          userId: 'user-1',
          name: 'Food 1',
          category: 'Test',
          allergenTags: JSON.stringify([]),
          isDefault: false,
          isActive: true,
        },
        {
          userId: 'user-1',
          name: 'Food 2',
          category: 'Test',
          allergenTags: JSON.stringify(['invalid']),
          isDefault: false,
          isActive: true,
        },
      ];

      await expect(foodRepository.bulkCreate(foods)).rejects.toThrow('Invalid allergen tag');
    });
  });

  describe('getStats', () => {
    it('should return statistics about foods', async () => {
      const mockFoods: FoodRecord[] = [
        {
          id: 'food-1',
          userId: 'user-1',
          name: 'Chicken',
          category: 'Proteins',
          allergenTags: JSON.stringify([]),
          isDefault: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'food-2',
          userId: 'user-1',
          name: 'Beef',
          category: 'Proteins',
          allergenTags: JSON.stringify([]),
          isDefault: true,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'food-3',
          userId: 'user-1',
          name: 'Archived Food',
          category: 'Test',
          allergenTags: JSON.stringify([]),
          isDefault: false,
          isActive: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockDexie.toArray.mockResolvedValue(mockFoods);
      mockDexie.filter.mockImplementation((fn: any) => ({
        ...mockDexie,
        toArray: () => Promise.resolve(mockFoods.filter(fn)),
      }));

      const stats = await foodRepository.getStats('user-1');

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.inactive).toBe(1);
      expect(stats.default).toBe(2);
      expect(stats.custom).toBe(1);
    });
  });
});
