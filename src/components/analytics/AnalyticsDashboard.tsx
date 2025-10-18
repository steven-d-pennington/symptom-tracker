'use client';

import { TrendWidget } from './TrendWidget';
import { DashboardProvider } from './DashboardContext';
import { trendAnalysisService } from '../../lib/services/TrendAnalysisService';

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
