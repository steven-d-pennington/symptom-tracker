'use client';

import { TrendWidget } from './TrendWidget';
import { DashboardProvider } from './DashboardContext';
import { TrendAnalysisService } from '../../lib/services/TrendAnalysisService';
import { dailyEntryRepository } from '../../lib/repositories/dailyEntryRepository';
import { symptomRepository } from '../../lib/repositories/symptomRepository';
import { medicationRepository } from '../../lib/repositories/medicationRepository';
import { analysisRepository } from '../../lib/repositories/analysisRepository';

const trendAnalysisService = new TrendAnalysisService(
    dailyEntryRepository,
    symptomRepository,
    medicationRepository,
    analysisRepository
);

export const AnalyticsDashboard = () => {
    return (
        <DashboardProvider service={trendAnalysisService}>
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
                <TrendWidget />
            </div>
        </DashboardProvider>
    );
};
