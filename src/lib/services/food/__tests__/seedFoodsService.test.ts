import { jest } from '@jest/globals';
import { SeedFoodsService } from '../seedFoodsService';
import { db } from '../../../db/client';

const mockDexie: any = {
  where: jest.fn(),
  equals: jest.fn(),
  get: jest.fn(),
  bulkAdd: jest.fn(),
  toArray: jest.fn(),
};

describe('SeedFoodsService', () => {
  let seedService: SeedFoodsService;

  beforeEach(() => {
    jest.clearAllMocks();
    (db as any).foods = mockDexie;
    seedService = new SeedFoodsService();

    // Setup default mock chain
    mockDexie.where.mockReturnValue(mockDexie);
    mockDexie.equals.mockReturnValue(mockDexie);
    mockDexie.toArray.mockResolvedValue([]);
    mockDexie.get.mockResolvedValue(undefined);
    mockDexie.bulkAdd.mockResolvedValue(undefined);
  });

  describe('getSeedCount', () => {
    it('should return 210 as the seed count', () => {
      expect(seedService.getSeedCount()).toBe(210);
    });
  });

  describe('isSeedingComplete', () => {
    it('should return false when sentinel record does not exist', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      const result = await seedService.isSeedingComplete('SYSTEM', db as any);

      expect(result).toBe(false);
      expect(mockDexie.where).toHaveBeenCalled();
    });

    it('should return true when sentinel record exists', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(1),
      });

      const result = await seedService.isSeedingComplete('SYSTEM', db as any);

      expect(result).toBe(true);
    });
  });

  describe('seedDefaultFoods', () => {
    it('should not seed if already complete', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(1),
      });

      await seedService.seedDefaultFoods('SYSTEM', db as any);

      expect(mockDexie.bulkAdd).not.toHaveBeenCalled();
    });

    it('should seed foods in batches when not complete', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      await seedService.seedDefaultFoods('SYSTEM', db as any);

      // Should call bulkAdd multiple times (batches of 50)
      // 210 foods + 1 sentinel = 211 records
      // 211 / 50 = 5 batches (50, 50, 50, 50, 11)
      expect(mockDexie.bulkAdd).toHaveBeenCalledTimes(5);

      // Verify batch sizes
      const calls = (mockDexie.bulkAdd as jest.Mock).mock.calls;
      expect(calls[0][0]).toHaveLength(50); // First batch
      expect(calls[1][0]).toHaveLength(50); // Second batch
      expect(calls[2][0]).toHaveLength(50); // Third batch
      expect(calls[3][0]).toHaveLength(50); // Fourth batch
      expect(calls[4][0]).toHaveLength(11); // Last batch (10 foods + 1 sentinel)
    });

    it('should create foods with correct structure', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      await seedService.seedDefaultFoods('SYSTEM', db as any);

      const firstBatch = (mockDexie.bulkAdd as jest.Mock).mock.calls[0][0];
      const firstFood = firstBatch[0];

      expect(firstFood).toHaveProperty('id');
      expect(firstFood).toHaveProperty('userId', 'SYSTEM');
      expect(firstFood).toHaveProperty('name');
      expect(firstFood).toHaveProperty('category');
      expect(firstFood).toHaveProperty('allergenTags');
      expect(firstFood).toHaveProperty('isDefault', true);
      expect(firstFood).toHaveProperty('isActive', true);
      expect(firstFood).toHaveProperty('createdAt');
      expect(firstFood).toHaveProperty('updatedAt');
    });

    it('should add sentinel record in the final batch', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      await seedService.seedDefaultFoods('SYSTEM', db as any);

      const lastBatch = (mockDexie.bulkAdd as jest.Mock).mock.calls[4][0];
      const sentinel = lastBatch[lastBatch.length - 1];

      expect(sentinel.name).toBe('__SEED_COMPLETE_V1__');
      expect(sentinel.userId).toBe('SYSTEM');
      expect(sentinel.isDefault).toBe(true);
      expect(sentinel.isActive).toBe(false);
    });

    it('should have foods with valid allergen tags', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      await seedService.seedDefaultFoods('SYSTEM', db as any);

      const allCalls = (mockDexie.bulkAdd as jest.Mock).mock.calls;
      const allFoods = allCalls.flatMap((call) => call[0]);

      const validAllergens = [
        'dairy',
        'gluten',
        'nuts',
        'shellfish',
        'nightshades',
        'soy',
        'eggs',
        'fish',
      ];

      allFoods.forEach((food: any) => {
        if (food.name === '__SEED_COMPLETE_V1__') return; // Skip sentinel

        const allergens = JSON.parse(food.allergenTags);
        expect(Array.isArray(allergens)).toBe(true);

        allergens.forEach((allergen: string) => {
          expect(validAllergens).toContain(allergen);
        });
      });
    });

    it('should have foods organized into categories', async () => {
      mockDexie.where.mockReturnValue({
        count: jest.fn().mockResolvedValue(0),
      });

      await seedService.seedDefaultFoods('SYSTEM', db as any);

      const allCalls = (mockDexie.bulkAdd as jest.Mock).mock.calls;
      const allFoods = allCalls
        .flatMap((call) => call[0])
        .filter((food: any) => food.name !== '__SEED_COMPLETE_V1__');

      const categories = new Set(allFoods.map((food: any) => food.category));

      expect(categories.has('Breakfast')).toBe(true);
      expect(categories.has('Proteins')).toBe(true);
      expect(categories.has('Vegetables')).toBe(true);
      expect(categories.has('Fruits')).toBe(true);
      expect(categories.has('Grains')).toBe(true);
      expect(categories.has('Dairy')).toBe(true);
      expect(categories.has('Snacks')).toBe(true);
      expect(categories.has('Beverages')).toBe(true);
    });
  });
});
