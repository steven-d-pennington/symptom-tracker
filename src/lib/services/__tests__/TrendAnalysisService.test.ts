import { jest } from '@jest/globals';
import { TrendAnalysisService } from '../TrendAnalysisService';
import { DailyEntryRepository } from '../../repositories/dailyEntryRepository';
import { SymptomInstanceRepository } from '../../repositories/symptomInstanceRepository';
import { MedicationRepository } from '../../repositories/medicationRepository';
import { MedicationEventRepository } from '../../repositories/medicationEventRepository';
import { AnalysisRepository } from '../../repositories/analysisRepository';
import { Symptom } from '../../types/symptoms';
import { MedicationRecord, MedicationEventRecord, AnalysisResultRecord } from '../../db/schema';

describe('TrendAnalysisService', () => {
    let service: TrendAnalysisService;
    let mockDailyEntryRepo: jest.Mocked<DailyEntryRepository>;
    let mockSymptomInstanceRepo: jest.Mocked<SymptomInstanceRepository>;
    let mockMedicationRepo: jest.Mocked<MedicationRepository>;
    let mockMedicationEventRepo: jest.Mocked<MedicationEventRepository>;
    let mockFlareRepo: { getByUserId: jest.Mock };
    let mockAnalysisRepo: jest.Mocked<AnalysisRepository>;

    const createSymptom = (overrides: Partial<Symptom>): Symptom => ({
        id: overrides.id ?? 'symptom-instance-1',
        userId: 'user-123',
        name: overrides.name ?? 'Fatigue',
        category: overrides.category ?? 'general',
        severity: overrides.severity ?? 5,
        severityScale: overrides.severityScale ?? { type: 'numeric', min: 1, max: 10 },
        location: overrides.location,
        duration: overrides.duration,
        triggers: overrides.triggers,
        notes: overrides.notes,
        photos: overrides.photos,
        timestamp: overrides.timestamp ?? new Date('2025-01-01T10:00:00Z'),
        updatedAt: overrides.updatedAt ?? new Date('2025-01-01T11:00:00Z'),
    });

    const createMedication = (overrides: Partial<MedicationRecord>): MedicationRecord => ({
        id: overrides.id ?? 'med-1',
        userId: 'user-123',
        name: overrides.name ?? 'Humira',
        dosage: overrides.dosage,
        frequency: overrides.frequency ?? 'daily',
        schedule: overrides.schedule ?? [{ time: '08:00', daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }],
        sideEffects: overrides.sideEffects,
        isActive: overrides.isActive ?? true,
        createdAt: overrides.createdAt ?? new Date('2025-01-01T00:00:00Z'),
        updatedAt: overrides.updatedAt ?? new Date('2025-01-01T00:00:00Z'),
    });

    beforeEach(() => {
        mockDailyEntryRepo = {
            getByDateRange: jest.fn(),
        } as unknown as jest.Mocked<DailyEntryRepository>;

            mockSymptomInstanceRepo = {
                getByDateRange: jest.fn(),
            } as unknown as jest.Mocked<SymptomInstanceRepository>;

            mockMedicationRepo = {
                getActive: jest.fn(),
            } as unknown as jest.Mocked<MedicationRepository>;

            mockMedicationEventRepo = {
                findByDateRange: jest.fn(),
            } as unknown as jest.Mocked<MedicationEventRepository>;

            mockFlareRepo = {
                getByUserId: jest.fn(),
            };

            mockAnalysisRepo = {
                getResult: jest.fn(),
                saveResult: jest.fn(),
                invalidateCache: jest.fn(),
                cleanupExpired: jest.fn(),
            } as unknown as jest.Mocked<AnalysisRepository>;

        service = new TrendAnalysisService(
            mockDailyEntryRepo,
            mockSymptomInstanceRepo,
            mockMedicationRepo,
            mockMedicationEventRepo,
            mockFlareRepo,
            mockAnalysisRepo
        );
    });

    it('returns symptom frequency buckets for daily metric', async () => {
        mockSymptomInstanceRepo.getByDateRange.mockResolvedValue([
            createSymptom({ id: 's1', timestamp: new Date('2025-01-01T12:00:00Z') }),
            createSymptom({ id: 's2', timestamp: new Date('2025-01-01T18:00:00Z') }),
            createSymptom({ id: 's3', timestamp: new Date('2025-01-02T12:00:00Z') }),
        ]);

        const series = await service.fetchMetricSeries('user-123', 'symptom-frequency:all:daily', '7d');

        expect(series.points).toHaveLength(2);
        expect(series.points[0].y).toBe(2);
        expect(series.points[1].y).toBe(1);
        expect(series.metadata?.summary).toMatchObject({ totalOccurrences: 3, buckets: 2 });
    });

    it('computes medication adherence summary', async () => {
        const medication = createMedication({ id: 'med-1', name: 'Humira' });
        mockMedicationRepo.getActive.mockResolvedValue([medication]);

        const now = Date.now();
        const adherenceEvents: MedicationEventRecord[] = [
            {
                id: 'evt-1',
                userId: 'user-123',
                medicationId: 'med-1',
                timestamp: new Date('2025-01-01T08:05:00Z').getTime(),
                taken: true,
                dosage: undefined,
                notes: undefined,
                timingWarning: null,
                createdAt: now,
                updatedAt: now,
            },
            {
                id: 'evt-2',
                userId: 'user-123',
                medicationId: 'med-1',
                timestamp: new Date('2025-01-02T08:05:00Z').getTime(),
                taken: false,
                dosage: undefined,
                notes: undefined,
                timingWarning: null,
                createdAt: now,
                updatedAt: now,
            },
        ];
        mockMedicationEventRepo.findByDateRange.mockResolvedValue(adherenceEvents);

        const series = await service.fetchMetricSeries('user-123', 'medication-adherence:overall', '7d');

        expect(series.metadata?.label).toContain('Medication Adherence');

        type AdherenceSummary = {
            overallAdherence: number;
            perMedication: Array<{ medicationId: string; medicationName: string; scheduled: number; taken: number; adherenceRate: number }>;
            totalScheduled: number;
            totalTaken: number;
        };

        const summary = series.metadata?.summary as AdherenceSummary | undefined;
        expect(summary).toBeDefined();
        expect(summary?.totalTaken).toBe(1);
        expect(summary?.totalScheduled).toBe(8);
        expect(summary?.perMedication[0]).toMatchObject({ medicationName: 'Humira' });
    });

    it('returns cached trend result when available', async () => {
        const cachedResult = { slope: 0.5, intercept: 2, rSquared: 0.8 };
        const cachedRecord: AnalysisResultRecord = {
            id: 'cache-1',
            userId: 'user-123',
            metric: 'symptom-frequency:all:daily',
            timeRange: '7d',
            result: cachedResult,
            createdAt: new Date(),
        };
                    mockAnalysisRepo.getResult.mockResolvedValue(cachedRecord);

        const result = await service.computeTrend('user-123', 'symptom-frequency:all:daily', '7d');

        expect(result).toEqual(cachedResult);
        expect(mockAnalysisRepo.saveResult).not.toHaveBeenCalled();
    });

    it('computes and saves trend result when not cached', async () => {
        mockAnalysisRepo.getResult.mockResolvedValue(undefined);
        mockSymptomInstanceRepo.getByDateRange.mockResolvedValue([
            createSymptom({ id: 's1', severity: 4, timestamp: new Date('2025-01-01T00:00:00Z') }),
            createSymptom({ id: 's2', severity: 6, timestamp: new Date('2025-01-02T00:00:00Z') }),
            createSymptom({ id: 's3', severity: 7, timestamp: new Date('2025-01-03T00:00:00Z') }),
        ]);

        const series = await service.fetchMetricSeries('user-123', 'symptom:all', '7d');
        const result = await service.computeTrend('user-123', 'symptom:all', '7d', series);

        expect(result).not.toBeNull();
        expect(mockAnalysisRepo.saveResult).toHaveBeenCalled();
    });

    describe('generateInterpretation', () => {
        it('returns "Insufficient data" for small sample size', () => {
            const interpretation = service.generateInterpretation({ slope: 1, intercept: 0, rSquared: 0.9 }, 5);
            expect(interpretation.direction).toBe('Insufficient data');
        });

        it('identifies improving trend', () => {
            const interpretation = service.generateInterpretation({ slope: -0.5, intercept: 0, rSquared: 0.8 }, 20);
            expect(interpretation.direction).toBe('improving');
        });

        it('identifies worsening trend', () => {
            const interpretation = service.generateInterpretation({ slope: 0.6, intercept: 0, rSquared: 0.8 }, 20);
            expect(interpretation.direction).toBe('worsening');
        });
    });
});
