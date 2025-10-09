import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

jest.mock('../TrendWidget', () => ({
    TrendWidget: () => <div data-testid="mock-widget" />,
}));

// Mock the service and its dependencies
jest.mock('../../../lib/services/TrendAnalysisService');
jest.mock('../../../lib/repositories/dailyEntryRepository');
jest.mock('../../../lib/repositories/symptomRepository');
jest.mock('../../../lib/repositories/medicationRepository');
jest.mock('../../../lib/repositories/analysisRepository');

describe('AnalyticsDashboard', () => {
    it('should render the dashboard with the trend widget', () => {
        render(<AnalyticsDashboard />);
        
        expect(screen.getByTestId('mock-widget')).toBeInTheDocument();
    });
});
