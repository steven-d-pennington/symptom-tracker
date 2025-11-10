/**
 * Tests for InsightCard Component (Story 6.4 - Task 14)
 *
 * Tests rendering, headline formatting, strength badge color coding, and interactions.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InsightCard } from '../InsightCard';
import { CorrelationResult } from '@/types/correlation';

const createMockCorrelation = (
  overrides: Partial<CorrelationResult> = {}
): CorrelationResult => ({
  id: 'test-id',
  userId: 'test-user',
  type: 'food-symptom',
  item1: 'dairy',
  item2: 'headache',
  coefficient: 0.72,
  strength: 'strong',
  significance: 0.01,
  sampleSize: 15,
  lagHours: 12,
  confidence: 'high',
  timeRange: '30d',
  calculatedAt: Date.now(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

describe('InsightCard', () => {
  it('renders with correlation data', () => {
    const correlation = createMockCorrelation();
    const mockOnViewDetails = jest.fn();

    render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    // Check headline is displayed
    expect(screen.getByText(/High Dairy.*Increased Headache/i)).toBeInTheDocument();

    // Check strength badge
    expect(screen.getByText(/Strong/i)).toBeInTheDocument();
    expect(screen.getByText(/ρ = 0.72/i)).toBeInTheDocument();

    // Check confidence and sample size
    expect(screen.getByText(/High confidence \(15 data points\)/i)).toBeInTheDocument();

    // Check timeframe
    expect(screen.getByText(/Timeframe: Last 30 days/i)).toBeInTheDocument();

    // Check lag hours
    expect(screen.getByText(/Lag: 12 hours/i)).toBeInTheDocument();

    // Check "View Details" button
    expect(screen.getByText(/View Details/i)).toBeInTheDocument();
  });

  it('formats headline correctly for positive correlation', () => {
    const correlation = createMockCorrelation({ item1: 'gluten', item2: 'fatigue', coefficient: 0.65 });
    const mockOnViewDetails = jest.fn();

    render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText(/High Gluten.*Increased Fatigue/i)).toBeInTheDocument();
  });

  it('formats headline correctly for negative correlation', () => {
    const correlation = createMockCorrelation({ item1: 'exercise', item2: 'pain', coefficient: -0.55 });
    const mockOnViewDetails = jest.fn();

    render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    expect(screen.getByText(/High Exercise.*Decreased Pain/i)).toBeInTheDocument();
  });

  it('shows correct strength badge color for strong correlation', () => {
    const correlation = createMockCorrelation({ coefficient: 0.75, strength: 'strong' });
    const mockOnViewDetails = jest.fn();

    const { container } = render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    // Strong correlations should have red badge
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('shows correct strength badge color for moderate correlation', () => {
    const correlation = createMockCorrelation({ coefficient: 0.5, strength: 'moderate' });
    const mockOnViewDetails = jest.fn();

    const { container } = render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    // Moderate correlations should have yellow badge
    const badge = container.querySelector('.bg-yellow-100');
    expect(badge).toBeInTheDocument();
  });

  it('calls onViewDetails when "View Details" clicked', () => {
    const correlation = createMockCorrelation();
    const mockOnViewDetails = jest.fn();

    render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    const button = screen.getByText(/View Details/i);
    fireEvent.click(button);

    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    expect(mockOnViewDetails).toHaveBeenCalledWith(correlation);
  });

  it('does not show lag hours when lagHours is 0', () => {
    const correlation = createMockCorrelation({ lagHours: 0 });
    const mockOnViewDetails = jest.fn();

    render(<InsightCard correlation={correlation} onViewDetails={mockOnViewDetails} />);

    expect(screen.queryByText(/Lag:/i)).not.toBeInTheDocument();
  });
});
