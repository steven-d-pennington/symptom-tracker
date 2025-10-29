/**
 * TrendAnalysisSection Component Tests (Story 3.4 - Task 8.7)
 *
 * Test suite for TrendAnalysisSection component.
 * Tests section rendering, trend indicator, export button, and chart integration.
 */

import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { TrendAnalysis } from '@/types/analytics';

// Mock react-chartjs-2
jest.unstable_mockModule('react-chartjs-2', () => ({
  Line: () => <canvas role="img" aria-label="chart" />,
}));

// Mock chartjs-plugin-annotation
jest.unstable_mockModule('chartjs-plugin-annotation', () => ({
  default: {},
}));

// Mock chart export utility
const mockExportChartAsImage = jest.fn(() => Promise.resolve());
jest.unstable_mockModule('@/lib/utils/chartExport', () => ({
  exportChartAsImage: mockExportChartAsImage,
}));

describe('TrendAnalysisSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock trend analysis data
  const createMockTrendAnalysis = (
    trendDirection: 'improving' | 'stable' | 'declining' | 'insufficient-data' = 'stable'
  ): TrendAnalysis => ({
    dataPoints: [
      { month: '2024-01', monthTimestamp: 1704067200000, flareCount: 3, averageSeverity: 5.5 },
      { month: '2024-02', monthTimestamp: 1706745600000, flareCount: 2, averageSeverity: 4.2 },
      { month: '2024-03', monthTimestamp: 1709251200000, flareCount: 2, averageSeverity: 3.8 },
    ],
    trendLine: { slope: -0.5, intercept: 3 },
    trendDirection,
  });

  // Task 8.8: Test section rendering
  it('should render section header and description', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.getByText('Flare Trends')).toBeInTheDocument();
    expect(screen.getByText(/Track your flare patterns over time/)).toBeInTheDocument();
  });

  // Task 8.8: Test trend indicator - improving
  it('should display improving trend indicator badge', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('improving');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.getByText('Improving')).toBeInTheDocument();
  });

  // Task 8.8: Test trend indicator - stable
  it('should display stable trend indicator badge', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  // Task 8.8: Test trend indicator - declining
  it('should display declining trend indicator badge', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('declining');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.getByText('Declining')).toBeInTheDocument();
  });

  // Task 8.8: Test trend indicator - hidden when loading
  it('should hide trend indicator when loading', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={true}
        timeRange="last90d"
      />
    );

    expect(screen.queryByText('Stable')).not.toBeInTheDocument();
  });

  // Task 8.8: Test trend indicator - hidden when null data
  it('should hide trend indicator when trendAnalysis is null', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');

    render(
      <TrendAnalysisSection
        trendAnalysis={null}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.queryByText('Stable')).not.toBeInTheDocument();
    expect(screen.queryByText('Improving')).not.toBeInTheDocument();
  });

  // Task 8.8: Test export button rendering
  it('should render export button when data is available', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.getByRole('button', { name: /export chart/i })).toBeInTheDocument();
  });

  // Task 8.8: Test export button hidden when loading
  it('should hide export button when loading', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={true}
        timeRange="last90d"
      />
    );

    expect(screen.queryByRole('button', { name: /export chart/i })).not.toBeInTheDocument();
  });

  // Task 8.8: Test export button hidden for insufficient data
  it('should hide export button when trendDirection is insufficient-data', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('insufficient-data');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    expect(screen.queryByRole('button', { name: /export chart/i })).not.toBeInTheDocument();
  });

  // Task 8.9: Test export functionality - button click
  it('should call exportChartAsImage when export button clicked', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    const exportButton = screen.getByRole('button', { name: /export chart/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExportChartAsImage).toHaveBeenCalled();
    });
  });

  // Task 8.9: Test export functionality - filename generation
  it('should generate filename with current date', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    const exportButton = screen.getByRole('button', { name: /export chart/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockExportChartAsImage).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringMatching(/^flare-trends-\d{4}-\d{2}-\d{2}\.png$/)
      );
    });
  });

  // Task 8.9: Test export loading state
  it('should show loading state during export', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    // Mock slow export
    mockExportChartAsImage.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    const exportButton = screen.getByRole('button', { name: /export chart/i });
    fireEvent.click(exportButton);

    // Should show "Exporting..." text
    await waitFor(() => {
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });

  // Task 8.8: Test chart integration
  it('should render FlareTrendChart component', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    const chart = screen.getByRole('img', { name: /chart/i });
    expect(chart).toBeInTheDocument();
  });

  // Task 8.8: Test responsive container styling
  it('should have proper container styling', async () => {
    const { TrendAnalysisSection } = await import('../TrendAnalysisSection');
    const trendAnalysis = createMockTrendAnalysis('stable');

    const { container } = render(
      <TrendAnalysisSection
        trendAnalysis={trendAnalysis}
        isLoading={false}
        timeRange="last90d"
      />
    );

    const mainContainer = container.querySelector('.space-y-4');
    expect(mainContainer).toBeInTheDocument();
  });
});
