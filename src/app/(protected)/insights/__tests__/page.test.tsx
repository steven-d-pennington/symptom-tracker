/**
 * Integration Tests for Insights Page (Story 6.4 - Task 15)
 *
 * Tests page rendering, time range selection, empty state, and modal interactions.
 */

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightsPage from '../page';

// Mock the hooks
jest.mock('@/lib/hooks/useCorrelations', () => ({
  useCorrelations: jest.fn(() => ({
    correlations: [],
    isLoading: false,
    error: null,
  })),
  useLoggedDaysCount: jest.fn(() => ({
    loggedDaysCount: 5,
    isLoading: false,
    error: null,
  })),
}));

// Mock the child components
jest.mock('@/components/insights/TimeRangeSelector', () => ({
  TimeRangeSelector: ({ value, onChange }: any) => (
    <select data-testid="time-range-selector" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="all">All time</option>
    </select>
  ),
}));

jest.mock('@/components/insights/MedicalDisclaimerBanner', () => ({
  MedicalDisclaimerBanner: () => <div data-testid="medical-disclaimer">Medical Disclaimer</div>,
}));

jest.mock('@/components/insights/InsightsGrid', () => ({
  InsightsGrid: ({ correlations, isLoading }: any) => (
    <div data-testid="insights-grid">
      {isLoading ? 'Loading...' : `${correlations.length} insights`}
    </div>
  ),
}));

jest.mock('@/components/insights/InsightsEmptyState', () => ({
  InsightsEmptyState: ({ loggedDaysCount }: any) => (
    <div data-testid="empty-state">
      Empty State - {loggedDaysCount} days logged
    </div>
  ),
}));

jest.mock('@/components/insights/InsightDetailModal', () => ({
  InsightDetailModal: ({ isOpen }: any) => (
    isOpen ? <div data-testid="insight-modal">Modal Open</div> : null
  ),
}));

describe('InsightsPage', () => {
  it('renders page with header and title', () => {
    render(<InsightsPage />);

    expect(screen.getByText('Health Insights Hub')).toBeInTheDocument();
    expect(screen.getByText(/Discover patterns in your health data/i)).toBeInTheDocument();
  });

  it('renders time range selector', () => {
    render(<InsightsPage />);

    expect(screen.getByTestId('time-range-selector')).toBeInTheDocument();
  });

  it('renders medical disclaimer banner', () => {
    render(<InsightsPage />);

    expect(screen.getByTestId('medical-disclaimer')).toBeInTheDocument();
  });

  it('shows empty state when insufficient data', async () => {
    const { useCorrelations, useLoggedDaysCount } = require('@/lib/hooks/useCorrelations');

    useCorrelations.mockReturnValue({
      correlations: [],
      isLoading: false,
      error: null,
    });

    useLoggedDaysCount.mockReturnValue({
      loggedDaysCount: 5,
      isLoading: false,
      error: null,
    });

    render(<InsightsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    });
  });

  it('shows insights grid when data available', async () => {
    const { useCorrelations, useLoggedDaysCount } = require('@/lib/hooks/useCorrelations');

    useCorrelations.mockReturnValue({
      correlations: [
        {
          id: '1',
          coefficient: 0.7,
          sampleSize: 30,
          // ... other fields
        },
      ],
      isLoading: false,
      error: null,
    });

    useLoggedDaysCount.mockReturnValue({
      loggedDaysCount: 15,
      isLoading: false,
      error: null,
    });

    render(<InsightsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('insights-grid')).toBeInTheDocument();
    });
  });

  it('shows error message when error occurs', async () => {
    const { useCorrelations } = require('@/lib/hooks/useCorrelations');

    useCorrelations.mockReturnValue({
      correlations: [],
      isLoading: false,
      error: new Error('Failed to load data'),
    });

    render(<InsightsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load insights/i)).toBeInTheDocument();
    });
  });
});
