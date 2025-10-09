import { jest } from '@jest/globals';
import { TrendAnalysisService } from '../TrendAnalysisService';
import { DailyEntryRepository } from '../../repositories/dailyEntryRepository';
import { SymptomRepository } from '../../repositories/symptomRepository';
import { MedicationRepository } from '../../repositories/medicationRepository';
import { AnalysisRepository } from '../../repositories/analysisRepository';
import { DailyEntryRecord } from '../../db/schema';
import { WorkerPool } from '../../workers/WorkerPool';

type MockDailyEntryRepository = {
    getByDateRange: jest.MockedFunction<DailyEntryRepository['getByDateRange']>;
};

type MockAnalysisRepository = {
    getResult: jest.Mock<ReturnType<AnalysisRepository['getResult']>, Parameters<AnalysisRepository['getResult']>>;
    saveResult: jest.Mock<ReturnType<AnalysisRepository['saveResult']>, Parameters<AnalysisRepository['saveResult']>>;
    invalidateCache: jest.Mock<ReturnType<AnalysisRepository['invalidateCache']>, Parameters<AnalysisRepository['invalidateCache']>>;
    cleanupExpired: jest.Mock<ReturnType<AnalysisRepository['cleanupExpired']>, Parameters<AnalysisRepository['cleanupExpired']>>;
};

type MockWorkerPool = {
    runTask: jest.Mock;
    terminate: jest.Mock;
};

const generateMockEntries = (count: number): DailyEntryRecord[] => {
    return Array.from({ length: count }, (_, i) => ({ date: new Date(2025, 0, i + 1).toISOString(), overallHealth: i % 10 } as DailyEntryRecord));
};

describe('TrendAnalysisService', () => {
    let service: TrendAnalysisService;
    let mockWorkerPool: MockWorkerPool;
    let mockDailyEntryRepo: MockDailyEntryRepository;
    let mockAnalysisRepo: MockAnalysisRepository;
    let mockSymptomRepo: SymptomRepository;
    let mockMedicationRepo: MedicationRepository;

    beforeEach(() => {
        mockDailyEntryRepo = {
            getByDateRange: jest.fn() as jest.MockedFunction<DailyEntryRepository['getByDateRange']>
        };

        mockAnalysisRepo = {
            getResult: jest.fn() as jest.Mock<ReturnType<AnalysisRepository['getResult']>, Parameters<AnalysisRepository['getResult']>>,
            saveResult: jest.fn() as jest.Mock<ReturnType<AnalysisRepository['saveResult']>, Parameters<AnalysisRepository['saveResult']>>,
            invalidateCache: jest.fn() as jest.Mock<ReturnType<AnalysisRepository['invalidateCache']>, Parameters<AnalysisRepository['invalidateCache']>>,
            cleanupExpired: jest.fn() as jest.Mock<ReturnType<AnalysisRepository['cleanupExpired']>, Parameters<AnalysisRepository['cleanupExpired']>>
        };

        mockSymptomRepo = {} as SymptomRepository;
        mockMedicationRepo = {} as MedicationRepository;

        mockWorkerPool = { runTask: jest.fn(), terminate: jest.fn() };
        service = new TrendAnalysisService(
            mockDailyEntryRepo as unknown as DailyEntryRepository,
            mockSymptomRepo,
            mockMedicationRepo,
            mockAnalysisRepo as unknown as AnalysisRepository,
            mockWorkerPool as unknown as WorkerPool
        );
    });

    it('should return cached result if available', async () => {
        const cached = { result: { slope: 1, intercept: 1, rSquared: 1 } };
        mockAnalysisRepo.getResult.mockResolvedValue(cached as any);
        const result = await service.analyzeTrend('user1', 'metric1', '30d');
        expect(result).toEqual(cached.result);
        expect(mockDailyEntryRepo.getByDateRange).not.toHaveBeenCalled();
    });

    it('should compute, save and return result if not in cache', async () => {
        mockAnalysisRepo.getResult.mockResolvedValue(undefined);
        mockDailyEntryRepo.getByDateRange.mockResolvedValue(generateMockEntries(30));
        const result = await service.analyzeTrend('user1', 'overallHealth', '30d');
        expect(mockAnalysisRepo.saveResult).toHaveBeenCalled();
        expect(result).not.toBeNull();
        expect(result?.slope).toBeDefined();
    });

    it('should use worker for large datasets', async () => {
        mockAnalysisRepo.getResult.mockResolvedValue(undefined);
        mockDailyEntryRepo.getByDateRange.mockResolvedValue(generateMockEntries(150));
        const mockRegressionResult = { slope: 0.1, intercept: 0, rSquared: 1 };
        mockWorkerPool.runTask.mockResolvedValue(mockRegressionResult);
        const result = await service.analyzeTrend('user1', 'overallHealth', '1y');
        expect(mockWorkerPool.runTask).toHaveBeenCalled();
        expect(mockAnalysisRepo.saveResult).toHaveBeenCalled();
        expect(result).toEqual(mockRegressionResult);
    });

    describe('generateInterpretation', () => {
        it('should return "Insufficient data" for small sample sizes', () => {
            const result = service.generateInterpretation({ slope: 1, intercept: 1, rSquared: 1 }, 10);
            expect(result.direction).toBe('Insufficient data');
        });

        it('should identify an improving trend', () => {
            const result = service.generateInterpretation({ slope: -0.5, intercept: 1, rSquared: 0.8 }, 30);
            expect(result.direction).toBe('improving');
        });

        it('should identify a worsening trend', () => {
            const result = service.generateInterpretation({ slope: 0.5, intercept: 1, rSquared: 0.8 }, 30);
            expect(result.direction).toBe('worsening');
        });

        it('should identify a stable trend', () => {
            const result = service.generateInterpretation({ slope: 0.05, intercept: 1, rSquared: 0.2 }, 30);
            expect(result.direction).toBe('stable');
        });

        it('should correctly map confidence levels', () => {
            const highConfidence = service.generateInterpretation({ slope: 1, intercept: 1, rSquared: 0.95 }, 30);
            expect(highConfidence.confidence).toBe('very-high');

            const mediumConfidence = service.generateInterpretation({ slope: 1, intercept: 1, rSquared: 0.75 }, 30);
            expect(mediumConfidence.confidence).toBe('high');

            const lowConfidence = service.generateInterpretation({ slope: 1, intercept: 1, rSquared: 0.3 }, 30);
            expect(lowConfidence.confidence).toBe('low');
        });
    });
});
