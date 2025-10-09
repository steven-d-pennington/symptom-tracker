import { db } from '../db/client';
import { AnalysisResultRecord } from '../db/schema';

const TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class AnalysisRepository {
    public async getResult(userId: string, metric: string, timeRange: string): Promise<AnalysisResultRecord | undefined> {
        const record = await db.analysisResults
            .where('[userId+metric+timeRange]')
            .equals([userId, metric, timeRange])
            .first();

        if (record && (new Date().getTime() - record.createdAt.getTime()) < TTL) {
            return record;
        }

        return undefined;
    }

    public async saveResult(record: AnalysisResultRecord): Promise<void> {
        await db.analysisResults.put(record);
    }

    public async invalidateCache(userId: string, metric?: string): Promise<void> {
        if (metric) {
            await db.analysisResults.where({ userId, metric }).delete();
        } else {
            await db.analysisResults.where({ userId }).delete();
        }
    }

    public async cleanupExpired(): Promise<void> {
        const now = new Date().getTime();
        await db.analysisResults.filter(record => now - record.createdAt.getTime() > TTL).delete();
    }
}

export const analysisRepository = new AnalysisRepository();