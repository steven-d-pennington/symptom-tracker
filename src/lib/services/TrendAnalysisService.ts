import { dailyEntryRepository, DailyEntryRepository } from '../repositories/dailyEntryRepository';
import { symptomRepository, SymptomRepository } from '../repositories/symptomRepository';
import { medicationRepository, MedicationRepository } from '../repositories/medicationRepository';
import { analysisRepository, AnalysisRepository } from '../repositories/analysisRepository';
import { computeLinearRegression, Point, RegressionResult } from '../utils/statistics/linearRegression';
import { DailyEntryRecord } from '../db/schema';
import { WorkerPool } from '../workers/WorkerPool';

const parseTimeRange = (timeRange: string): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    if (timeRange.endsWith('d')) {
        const days = parseInt(timeRange.slice(0, -1), 10);
        startDate.setDate(endDate.getDate() - days);
    } else if (timeRange.endsWith('y')) {
        const years = parseInt(timeRange.slice(0, -1), 10);
        startDate.setFullYear(endDate.getFullYear() - years);
    } else if (timeRange === 'all') {
        startDate.setFullYear(endDate.getFullYear() - 100);
    }
    return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
};

export class TrendAnalysisService {
  private workerPool: WorkerPool;

  constructor(
    private dailyEntryRepo: DailyEntryRepository,
    private symptomRepo: SymptomRepository,
    private medicationRepo: MedicationRepository,
    private analysisRepo: AnalysisRepository,
    workerPool?: WorkerPool
  ) {
    if (workerPool) {
        this.workerPool = workerPool;
    }
    // Note: Workers disabled for now due to Next.js compatibility issues
    // Computations will run synchronously in the main thread
  }

  public async analyzeTrend(userId: string, metric: string, timeRange: string): Promise<RegressionResult | null> {
    const cachedResult = await this.analysisRepo.getResult(userId, metric, timeRange);
    if (cachedResult) {
        return cachedResult.result;
    }

    const data = await this.fetchMetricData(userId, metric, timeRange);
    if (!data || data.length < 14) {
      return null;
    }

    const points = this.extractTimeSeriesPoints(data, metric);
    if (points.length < 2) {
        return null;
    }

    let result: RegressionResult;
    if (points.length > 100 && this.workerPool) {
        result = await this.workerPool.runTask({ type: 'linearRegression', payload: points });
    } else {
        result = computeLinearRegression(points);
    }

    if (result) {
        await this.analysisRepo.saveResult({ userId, metric, timeRange, result, createdAt: new Date() });
    }

    return result;
  }

  public async fetchMetricData(userId: string, metric: string, timeRange: string): Promise<DailyEntryRecord[]> {
    const { startDate, endDate } = parseTimeRange(timeRange);
    const directMetrics = ['overallHealth', 'energyLevel', 'sleepQuality', 'stressLevel'];
    if (directMetrics.includes(metric)) {
        return this.dailyEntryRepo.getByDateRange(userId, startDate, endDate);
    }
    if (metric.startsWith('symptom:')) {
        const symptomId = metric.split(':')[1];
        const entries = await this.dailyEntryRepo.getByDateRange(userId, startDate, endDate);
        return entries.filter(entry => entry.symptoms.some(s => s.symptomId === symptomId));
    }
    console.warn(`Metric type for "${metric}" is not yet implemented.`);
    return [];
  }

  public extractTimeSeriesPoints(data: DailyEntryRecord[], metric: string): Point[] {
    const directMetrics = ['overallHealth', 'energyLevel', 'sleepQuality', 'stressLevel'];
    if (directMetrics.includes(metric)) {
        return data.map(entry => ({ x: new Date(entry.date).getTime(), y: entry[metric as keyof DailyEntryRecord] as number }));
    }
    if (metric.startsWith('symptom:')) {
        const symptomId = metric.split(':')[1];
        return data.map(entry => {
            const symptom = entry.symptoms.find(s => s.symptomId === symptomId);
            if (symptom) {
                return { x: new Date(entry.date).getTime(), y: symptom.severity };
            }
            return null;
        }).filter((p): p is Point => p !== null);
    }
    return [];
  }

  public generateInterpretation(result: RegressionResult, sampleSize: number): { direction: string; confidence: string } {
    if (sampleSize < 14) {
        return { direction: 'Insufficient data', confidence: 'N/A' };
    }

    const { slope, rSquared } = result;
    let direction = 'stable';
    if (Math.abs(slope) > 0.1) { // Arbitrary threshold for 'stable'
        direction = slope > 0 ? 'worsening' : 'improving'; // Assuming higher is worse
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
}
