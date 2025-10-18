import { jest } from '@jest/globals';
import { analysisRepository } from '../analysisRepository';
import { db } from '../../db/client';

const mockDexie: any = {
    where: jest.fn(),
    equals: jest.fn(),
    first: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    filter: jest.fn(),
};

describe('AnalysisRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (db as any).analysisResults = mockDexie;
        mockDexie.where.mockReturnValue(mockDexie);
        mockDexie.equals.mockReturnValue(mockDexie);
        mockDexie.filter.mockReturnValue(mockDexie);
        mockDexie.delete.mockResolvedValue(undefined);
        mockDexie.put.mockResolvedValue(undefined);
        mockDexie.first.mockResolvedValue(undefined);
    });

    it('should get a valid result from cache', async () => {
        const mockRecord = { createdAt: new Date() };
        mockDexie.first.mockResolvedValue(mockRecord);
        const result = await analysisRepository.getResult('user1', 'metric1', '30d');
        expect(result).toEqual(mockRecord);
        expect(mockDexie.where).toHaveBeenCalledWith('[userId+metric+timeRange]');
        expect(mockDexie.equals).toHaveBeenCalledWith(['user1', 'metric1', '30d']);
    });

    it('should return undefined for expired result', async () => {
        const expiredDate = new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);
        const mockRecord = { createdAt: expiredDate };
        mockDexie.first.mockResolvedValue(mockRecord);
        const result = await analysisRepository.getResult('user1', 'metric1', '30d');
        expect(result).toBeUndefined();
    });

    it('should save a result', async () => {
        const record = { userId: 'user1', metric: 'metric1', timeRange: '30d', result: {} as any, createdAt: new Date() };
        await analysisRepository.saveResult(record);
        expect(mockDexie.put).toHaveBeenCalledWith(record);
    });

    it('should cleanup expired records', async () => {
        await analysisRepository.cleanupExpired();
        expect(mockDexie.filter).toHaveBeenCalled();
        expect(mockDexie.delete).toHaveBeenCalled();
    });
});