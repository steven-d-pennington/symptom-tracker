/**
 * DoseResponseChart Component Tests
 * - Tests chart rendering with various dose-response scenarios
 * - Validates accessibility and confidence messaging
 */

import { render, screen } from '@testing-library/react';
import { DoseResponseChart } from '../DoseResponseChart';
import type { DoseResponseResult } from '@/lib/services/food/DoseResponseService';
import { Chart, Filler } from 'chart.js';

Chart.register(Filler);

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Scatter: () => <div data-testid="scatter-chart">Mock Scatter Chart</div>,
}));

describe('DoseResponseChart', () => {
  const mockHighConfidenceResult: DoseResponseResult = {
    slope: 2.5,
    intercept: 1.0,
    rSquared: 0.85,
    confidence: 'high',
    sampleSize: 12,
    portionSeverityPairs: [
      { portion: 1, severity: 3 },
      { portion: 2, severity: 5 },
      { portion: 3, severity: 8 },
    ],
    message: 'High confidence (R² = 0.850): Larger portions correlate with more severe symptoms based on 12 observations.',
  };

  const mockLowConfidenceResult: DoseResponseResult = {
    slope: 0.5,
    intercept: 4.0,
    rSquared: 0.25,
    confidence: 'low',
    sampleSize: 6,
    portionSeverityPairs: [
      { portion: 1, severity: 4 },
      { portion: 2, severity: 5 },
      { portion: 3, severity: 5 },
    ],
    message: 'Low confidence (R² = 0.250): Weak dose-response relationship based on 6 observations.',
  };

  const mockInsufficientDataResult: DoseResponseResult = {
    slope: 0,
    intercept: 0,
    rSquared: 0,
    confidence: 'insufficient',
    sampleSize: 3,
    portionSeverityPairs: [],
    message: 'Insufficient data: minimum 5 events required (found 3)',
  };

  it('renders chart with high confidence data', () => {
    render(<DoseResponseChart doseResponse={mockHighConfidenceResult} />);

    // Chart renders as canvas element (Chart.js behavior)
    expect(screen.getByRole('img')).toBeInTheDocument(); // Canvas has role="img"
    expect(screen.getByText(/Goodness of Fit \(R²\):/)).toBeInTheDocument();
    expect(screen.getByText('0.850')).toBeInTheDocument();
    expect(screen.getByText('Strong linear relationship')).toBeInTheDocument();
    expect(screen.getByText('High Confidence')).toBeInTheDocument();
    expect(screen.getByText(/High confidence.*Larger portions correlate with more severe symptoms/)).toBeInTheDocument();
  });

  it('renders chart with food name in title', () => {
    render(<DoseResponseChart doseResponse={mockHighConfidenceResult} foodName="Dairy" />);

    // Chart.js title is passed via options, so we can't easily test it in JSDOM
    // But we can verify the component renders with canvas
    expect(screen.getByRole('img')).toBeInTheDocument(); // Canvas element
  });

  it('displays medium confidence badge', () => {
    const mediumConfResult: DoseResponseResult = {
      ...mockHighConfidenceResult,
      rSquared: 0.55,
      confidence: 'medium',
      message: 'Medium confidence (R² = 0.550): Moderate dose-response relationship.',
    };

    render(<DoseResponseChart doseResponse={mediumConfResult} />);

    expect(screen.getByText('Medium Confidence')).toBeInTheDocument();
    expect(screen.getByText('Moderate linear relationship')).toBeInTheDocument();
  });

  it('displays low confidence badge and weak relationship message', () => {
    render(<DoseResponseChart doseResponse={mockLowConfidenceResult} />);

    expect(screen.getByText('Low Confidence')).toBeInTheDocument();
    expect(screen.getByText('Weak linear relationship')).toBeInTheDocument();
    expect(screen.getByText(/Low confidence.*Weak dose-response relationship/)).toBeInTheDocument();
  });

  it('shows insufficient data message when sample size < 5', () => {
    render(<DoseResponseChart doseResponse={mockInsufficientDataResult} />);

    // Should NOT render chart
    expect(screen.queryByTestId('scatter-chart')).not.toBeInTheDocument();

    // Should show insufficient data message
    expect(screen.getByText('Insufficient data: minimum 5 events required (found 3)')).toBeInTheDocument();
    expect(screen.getByText(/Log more meals with portion sizes/)).toBeInTheDocument();
  });

  it('displays r-squared value with 3 decimal places', () => {
    render(<DoseResponseChart doseResponse={mockHighConfidenceResult} />);

    expect(screen.getByText('0.850')).toBeInTheDocument(); // R² formatted to 3 decimals
  });

  it('includes accessibility labels on confidence badge', () => {
    render(<DoseResponseChart doseResponse={mockHighConfidenceResult} />);

    const confidenceBadge = screen.getByRole('status', { name: 'Confidence level: high' });
    expect(confidenceBadge).toBeInTheDocument();
  });

  it('formats r-squared correctly for values < 0.4', () => {
    render(<DoseResponseChart doseResponse={mockLowConfidenceResult} />);

    expect(screen.getByText('0.250')).toBeInTheDocument();
    expect(screen.getByText('Weak linear relationship')).toBeInTheDocument();
  });

  it('displays complete dose-response message', () => {
    render(<DoseResponseChart doseResponse={mockHighConfidenceResult} />);

    expect(
      screen.getByText(/High confidence \(R² = 0.850\): Larger portions correlate with more severe symptoms based on 12 observations\./)
    ).toBeInTheDocument();
  });
});
