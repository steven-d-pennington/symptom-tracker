import { dailyEntryRepository, DailyEntryRepository } from '../repositories/dailyEntryRepository';
import { SymptomInstanceRepository, symptomInstanceRepository } from '../repositories/symptomInstanceRepository';
import { medicationRepository, MedicationRepository } from '../repositories/medicationRepository';
import { medicationEventRepository, MedicationEventRepository } from '../repositories/medicationEventRepository';
import { flareRepository as flareRepositorySingleton } from '../repositories/flareRepository';
import { analysisRepository, AnalysisRepository } from '../repositories/analysisRepository';
import { computeLinearRegression, Point, RegressionResult } from '../utils/statistics/linearRegression';
import { DailyEntryRecord, MedicationRecord } from '../db/schema';

type MetricGranularity = 'daily' | 'weekly' | 'monthly';

interface MetricSummary {
    [key: string]: unknown;
}

export interface MetricMetadata {
    label: string;
    unit?: string;
    granularity?: MetricGranularity;
    summary?: MetricSummary;
}

export interface MetricSeries<T = unknown> {
    raw: T[];
    points: Point[];
    metadata?: MetricMetadata;
}

interface FlareSeverityHistoryPoint {
    timestamp: number;
    severity: number;
    status?: 'active' | 'improving' | 'worsening';
}

interface FlareEntity {
    id: string;
    severityHistory?: FlareSeverityHistoryPoint[];
}

type FlareRepositoryLike = {
    getByUserId(userId: string): Promise<FlareEntity[]>;
};

const DIRECT_METRICS = ['overallHealth', 'energyLevel', 'sleepQuality', 'stressLevel'];

const METRIC_LABELS: Record<string, string> = {
    overallHealth: 'Overall Health',
    energyLevel: 'Energy Level',
    sleepQuality: 'Sleep Quality',
    stressLevel: 'Stress Level',
    'symptom-frequency': 'Symptom Frequency',
    'flare-severity': 'Flare Severity',
    'medication-adherence': 'Medication Adherence',
};

const startOfDay = (date: Date): Date => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
};

const endOfDay = (date: Date): Date => {
    const day = new Date(date);
    day.setHours(23, 59, 59, 999);
    return day;
};

const startOfWeek = (date: Date): Date => {
    const week = startOfDay(date);
    const day = week.getDay();
    week.setDate(week.getDate() - day);
    return week;
};

const startOfMonth = (date: Date): Date => {
    const month = startOfDay(date);
    month.setDate(1);
    return month;
};

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0];

const parseTimeRange = (timeRange: string): { start: Date; end: Date } => {
    const end = new Date();
    const start = new Date(end);

    if (timeRange.endsWith('d')) {
        const days = parseInt(timeRange.slice(0, -1), 10);
        start.setDate(end.getDate() - days);
    } else if (timeRange.endsWith('y')) {
        const years = parseInt(timeRange.slice(0, -1), 10);
        start.setFullYear(end.getFullYear() - years);
    } else if (timeRange === 'all') {
        start.setFullYear(end.getFullYear() - 5);
    }

    return { start: startOfDay(start), end: endOfDay(end) };
};

interface SymptomFrequencyBucket {
    timestamp: number;
    count: number;
}

interface FlareSeverityPoint {
    flareId: string;
    timestamp: number;
    severity: number;
    status?: 'active' | 'improving' | 'worsening';
}

interface AdherenceDailySummary {
    timestamp: number;
    scheduled: number;
    taken: number;
    skipped: number;
    adherence: number;
}

interface AdherenceMedicationSummary {
    medicationId: string;
    medicationName: string;
    scheduled: number;
    taken: number;
    adherenceRate: number;
}

export class TrendAnalysisService {
    constructor(
        private dailyEntryRepo: DailyEntryRepository,
        private symptomInstanceRepo: SymptomInstanceRepository,
        private medicationRepo: MedicationRepository,
        private medicationEventRepo: MedicationEventRepository,
        private flareRepo: FlareRepositoryLike,
        private analysisRepo: AnalysisRepository
    ) {}

    public async fetchMetricSeries(userId: string, metric: string, timeRange: string): Promise<MetricSeries> {
        const { start, end } = parseTimeRange(timeRange);
        const normalizedMetric = metric.toLowerCase();

        if (DIRECT_METRICS.includes(normalizedMetric)) {
            return this.fetchDirectMetricSeries(userId, normalizedMetric, start, end);
        }

        if (normalizedMetric.startsWith('symptom-frequency')) {
            const granularity = this.parseGranularity(normalizedMetric);
            return this.fetchSymptomFrequencySeries(userId, start, end, granularity);
        }

        if (normalizedMetric.startsWith('symptom:')) {
            const symptomKey = normalizedMetric.split(':')[1] || 'all';
            return this.fetchSymptomSeveritySeries(userId, symptomKey, start, end);
        }

        if (normalizedMetric.startsWith('flare-severity')) {
            return this.fetchFlareSeveritySeries(userId, start, end);
        }

        if (normalizedMetric.startsWith('medication-adherence')) {
            return this.fetchMedicationAdherenceSeries(userId, start, end);
        }

        console.warn(`[TrendAnalysisService] Unsupported metric "${metric}"`);
        return { raw: [], points: [], metadata: { label: 'Unknown Metric' } };
    }

    public async computeTrend(
        userId: string,
        metric: string,
        timeRange: string,
        series?: MetricSeries
    ): Promise<RegressionResult | null> {
        const cachedResult = await this.analysisRepo.getResult(userId, metric, timeRange);
        if (cachedResult) {
            return cachedResult.result;
        }

        const workingSeries = series ?? (await this.fetchMetricSeries(userId, metric, timeRange));
        if (!workingSeries.points || workingSeries.points.length < 2) {
            return null;
        }

        const result = computeLinearRegression(workingSeries.points);
        if (result) {
            await this.analysisRepo.saveResult({ userId, metric, timeRange, result, createdAt: new Date() });
        }

        return result;
    }

    public generateInterpretation(result: RegressionResult, sampleSize: number): { direction: string; confidence: string } {
        if (sampleSize < 14) {
            return { direction: 'Insufficient data', confidence: 'N/A' };
        }

        const { slope, rSquared } = result;
        let direction = 'stable';
        if (Math.abs(slope) > 0.1) {
            direction = slope > 0 ? 'worsening' : 'improving';
        }

        let confidence = 'low';
        const confidenceValue = rSquared * 100;
        if (confidenceValue >= 90) {
            confidence = 'very-high';
        } else if (confidenceValue >= 70) {
            confidence = 'high';
        } else if (confidenceValue >= 50) {
            confidence = 'moderate';
        }

        return { direction, confidence };
    }

    private parseGranularity(metric: string): MetricGranularity {
        if (metric.includes('monthly')) {
            return 'monthly';
        }
        if (metric.includes('weekly')) {
            return 'weekly';
        }
        return 'daily';
    }

    private async fetchDirectMetricSeries(
        userId: string,
        metric: string,
        start: Date,
        end: Date
    ): Promise<MetricSeries<DailyEntryRecord>> {
        const entries = await this.dailyEntryRepo.getByDateRange(userId, toIsoDate(start), toIsoDate(end));
        const points = entries
            .map((entry) => ({ x: new Date(entry.date).getTime(), y: entry[metric as keyof DailyEntryRecord] as number }))
            .sort((a, b) => a.x - b.x);

        return {
            raw: entries,
            points,
            metadata: {
                label: METRIC_LABELS[metric] ?? metric,
                unit: 'score',
            },
        };
    }

    private async fetchSymptomSeveritySeries(
        userId: string,
        symptomKey: string,
        start: Date,
        end: Date
    ): Promise<MetricSeries> {
        const symptoms = await this.symptomInstanceRepo.getByDateRange(userId, start, end);

        const filtered = symptomKey === 'all'
            ? symptoms
            : symptoms.filter((symptom) => symptom.name.toLowerCase() === symptomKey);

        const points = filtered
            .map((symptom) => ({ x: new Date(symptom.timestamp).getTime(), y: symptom.severity }))
            .sort((a, b) => a.x - b.x);

        return {
            raw: filtered,
            points,
            metadata: {
                label: symptomKey === 'all' ? 'Symptom Severity (All)' : `Symptom Severity (${symptomKey})`,
                unit: 'severity',
            },
        };
    }

    private async fetchSymptomFrequencySeries(
        userId: string,
        start: Date,
        end: Date,
        granularity: MetricGranularity
    ): Promise<MetricSeries<SymptomFrequencyBucket>> {
        const symptoms = await this.symptomInstanceRepo.getByDateRange(userId, start, end);
        const buckets = new Map<number, SymptomFrequencyBucket>();

        const getBucketTimestamp = (timestamp: Date): number => {
            if (granularity === 'weekly') {
                return startOfWeek(timestamp).getTime();
            }
            if (granularity === 'monthly') {
                return startOfMonth(timestamp).getTime();
            }
            return startOfDay(timestamp).getTime();
        };

        symptoms.forEach((symptom) => {
            const bucketTimestamp = getBucketTimestamp(symptom.timestamp);
            const existing = buckets.get(bucketTimestamp);
            if (existing) {
                existing.count += 1;
            } else {
                buckets.set(bucketTimestamp, { timestamp: bucketTimestamp, count: 1 });
            }
        });

        const sortedBuckets = Array.from(buckets.values()).sort((a, b) => a.timestamp - b.timestamp);
        const points = sortedBuckets.map((bucket) => ({ x: bucket.timestamp, y: bucket.count }));

        return {
            raw: sortedBuckets,
            points,
            metadata: {
                label: `${METRIC_LABELS['symptom-frequency']} (${granularity})`,
                unit: 'occurrences',
                granularity,
                summary: {
                    totalOccurrences: symptoms.length,
                    buckets: sortedBuckets.length,
                },
            },
        };
    }

    private async fetchFlareSeveritySeries(userId: string, start: Date, end: Date): Promise<MetricSeries<FlareSeverityPoint>> {
        // Note: This fetches flares which are now stored as bodyMarkers with type='flare'
        // The flareRepo is already adapted to use bodyMarkers table
        const flares = await this.flareRepo.getByUserId(userId);
        const windowStart = start.getTime();
        const windowEnd = end.getTime();

        const records: FlareSeverityPoint[] = [];

        flares.forEach((flare) => {
            const severityHistory = Array.isArray(flare.severityHistory) ? flare.severityHistory : [];
            severityHistory.forEach((entry) => {
                if (typeof entry?.timestamp !== 'number' || typeof entry?.severity !== 'number') {
                    return;
                }
                if (entry.timestamp < windowStart || entry.timestamp > windowEnd) {
                    return;
                }
                records.push({
                    flareId: flare.id,
                    timestamp: entry.timestamp,
                    severity: entry.severity,
                    status: entry.status,
                });
            });
        });

        const points = records
            .map((record) => ({ x: record.timestamp, y: record.severity }))
            .sort((a, b) => a.x - b.x);

        const averageSeverity = records.length
            ? records.reduce((sum, record) => sum + record.severity, 0) / records.length
            : 0;

        return {
            raw: records,
            points,
            metadata: {
                label: METRIC_LABELS['flare-severity'],
                unit: 'severity',
                summary: {
                    flareCount: flares.length,
                    samples: records.length,
                    averageSeverity: Number(averageSeverity.toFixed(2)),
                },
            },
        };
    }

    private async fetchMedicationAdherenceSeries(
        userId: string,
        start: Date,
        end: Date
    ): Promise<MetricSeries<AdherenceDailySummary>> {
        const medications = await this.medicationRepo.getActive(userId);
        const events = await this.medicationEventRepo.findByDateRange(userId, start.getTime(), end.getTime());

        const scheduleMap = this.buildMedicationScheduleMap(medications, start, end);
        const eventMap = this.groupMedicationEventsByDay(events);

        const days: AdherenceDailySummary[] = [];
        const iterator = new Date(start);
        while (iterator.getTime() <= end.getTime()) {
            const dayKey = startOfDay(iterator).getTime();
            const scheduled = this.countScheduledForDay(scheduleMap, dayKey);
            const dayEvents = eventMap.get(dayKey) ?? [];
            const taken = dayEvents.filter((event) => event.taken).length;
            const skipped = dayEvents.filter((event) => !event.taken).length;
            const adherence = scheduled > 0 ? (taken / scheduled) * 100 : 0;

            if (scheduled > 0 || dayEvents.length > 0) {
                days.push({
                    timestamp: dayKey,
                    scheduled,
                    taken,
                    skipped,
                    adherence: Number(adherence.toFixed(2)),
                });
            }

            iterator.setDate(iterator.getDate() + 1);
        }

        const points = days.map((day) => ({ x: day.timestamp, y: day.adherence }));

        const perMedicationSummary: AdherenceMedicationSummary[] = medications.map((medication) => {
            const scheduled = scheduleMap.get(medication.id)?.total ?? 0;
            const medicationEvents = events.filter((event) => event.medicationId === medication.id);
            const taken = medicationEvents.filter((event) => event.taken).length;
            const adherenceRate = scheduled > 0 ? (taken / scheduled) * 100 : 0;
            return {
                medicationId: medication.id,
                medicationName: medication.name,
                scheduled,
                taken,
                adherenceRate: Number(adherenceRate.toFixed(2)),
            };
        });

        const totalScheduled = perMedicationSummary.reduce((sum, entry) => sum + entry.scheduled, 0);
        const totalTaken = perMedicationSummary.reduce((sum, entry) => sum + entry.taken, 0);
        const overallAdherence = totalScheduled > 0 ? (totalTaken / totalScheduled) * 100 : 0;

        return {
            raw: days,
            points,
            metadata: {
                label: METRIC_LABELS['medication-adherence'],
                unit: 'percentage',
                summary: {
                    overallAdherence: Number(overallAdherence.toFixed(2)),
                    perMedication: perMedicationSummary,
                    totalScheduled,
                    totalTaken,
                },
            },
        };
    }

    private buildMedicationScheduleMap(
        medications: MedicationRecord[],
        start: Date,
        end: Date
    ): Map<string, { total: number; daily: Map<number, number>; medication: MedicationRecord }> {
        const scheduleMap = new Map<string, { total: number; daily: Map<number, number>; medication: MedicationRecord }>();

        medications.forEach((medication) => {
            scheduleMap.set(medication.id, { total: 0, daily: new Map<number, number>(), medication });
        });

        const iterator = new Date(start);
        while (iterator.getTime() <= end.getTime()) {
            const dayKey = startOfDay(iterator).getTime();
            const dayOfWeek = iterator.getDay();

            medications.forEach((medication) => {
                const occurrences = medication.schedule.filter((s) => s.daysOfWeek.includes(dayOfWeek)).length;
                if (occurrences > 0) {
                    const entry = scheduleMap.get(medication.id)!;
                    entry.total += occurrences;
                    entry.daily.set(dayKey, (entry.daily.get(dayKey) ?? 0) + occurrences);
                }
            });

            iterator.setDate(iterator.getDate() + 1);
        }

        return scheduleMap;
    }

    private countScheduledForDay(
        scheduleMap: Map<string, { total: number; daily: Map<number, number> }> ,
        dayKey: number
    ): number {
        let scheduled = 0;
        scheduleMap.forEach((entry) => {
            scheduled += entry.daily.get(dayKey) ?? 0;
        });
        return scheduled;
    }

    private groupMedicationEventsByDay(events: Awaited<ReturnType<MedicationEventRepository['findByDateRange']>>): Map<number, typeof events> {
        const map = new Map<number, typeof events>();
        events.forEach((event) => {
            const dayKey = startOfDay(new Date(event.timestamp)).getTime();
            const list = map.get(dayKey) ?? [];
            list.push(event);
            map.set(dayKey, list);
        });
        return map;
    }
}

export const trendAnalysisService = new TrendAnalysisService(
    dailyEntryRepository,
    symptomInstanceRepository,
    medicationRepository,
    medicationEventRepository,
    flareRepositorySingleton,
    analysisRepository
);
