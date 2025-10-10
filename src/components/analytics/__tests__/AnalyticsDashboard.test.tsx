import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all repositories BEFORE importing the component
jest.mock('@/lib/repositories/dailyEntryRepository', () => ({
  dailyEntryRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
    getByDateRange: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@/lib/repositories/symptomRepository', () => ({
  symptomRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@/lib/repositories/medicationRepository', () => ({
  medicationRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('@/lib/repositories/analysisRepository', () => ({
  analysisRepository: {
    getAll: jest.fn(() => Promise.resolve([])),
    save: jest.fn(() => Promise.resolve()),
  },
}));

// Mock the services and hooks BEFORE importing the component
jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: jest.fn(() => ({ userId: 'test-user-id' })),
}));

jest.mock('@/lib/services/TrendAnalysisService', () => ({
  TrendAnalysisService: jest.fn().mockImplementation(() => ({
    analyzeTrend: jest.fn(() => Promise.resolve({
      slope: 0.5,
      intercept: 10,
      rSquared: 0.8,
    })),
    fetchMetricData: jest.fn(() => Promise.resolve([])),
    extractTimeSeriesPoints: jest.fn(() => []),
  })),
}));

// Mock the TrendWidget component
jest.mock('../TrendWidget', () => ({
    TrendWidget: () => <div data-testid="mock-widget">Mock Widget</div>,
}));

import { AnalyticsDashboard } from '../AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
    it('should render the dashboard with the trend widget', () => {
        render(<AnalyticsDashboard />);
        expect(screen.getByTestId('mock-widget')).toBeInTheDocument();
    });
});
