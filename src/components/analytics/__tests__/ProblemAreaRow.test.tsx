/**
 * ProblemAreaRow Component Tests (Story 3.1 - Task 10)
 *
 * Test suite for ProblemAreaRow component.
 * Tests rendering, bar chart, click handlers, keyboard navigation, and accessibility.
 */

import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProblemAreaRow } from '../ProblemAreaRow';
import { ProblemArea } from '@/types/analytics';

// Mock getBodyRegionById
jest.mock('@/lib/data/bodyRegions', () => ({
  getBodyRegionById: jest.fn((id: string) => {
    const regions: Record<string, { id: string; name: string }> = {
      'left-shoulder': { id: 'left-shoulder', name: 'Left Shoulder' },
      'right-knee': { id: 'right-knee', name: 'Right Knee' },
      'lower-back': { id: 'lower-back', name: 'Lower Back' },
    };
    return regions[id] || null;
  }),
}));

describe('ProblemAreaRow', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  const createMockProblemArea = (bodyRegionId: string, flareCount: number): ProblemArea => ({
    bodyRegionId,
    flareCount,
    percentage: (flareCount / 10) * 100, // Assuming total of 10 flares
  });

  it('should render region name, count, and percentage (AC3.1.2)', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Left Shoulder')).toBeInTheDocument();
    expect(screen.getByText(/5 flares/)).toBeInTheDocument();
    expect(screen.getByText(/50.0%/)).toBeInTheDocument();
  });

  it('should handle singular flare count', () => {
    const problemArea = createMockProblemArea('right-knee', 1);

    render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText(/1 flare\b/)).toBeInTheDocument(); // Singular, not "flares"
  });

  it('should calculate bar width correctly (AC3.1.7)', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    // Find the bar chart element
    const bar = container.querySelector('[style*="width"]');
    expect(bar).toHaveStyle({ width: '50%' }); // 5/10 * 100 = 50%
  });

  it('should apply red color for highest frequency region (>= 100% of max)', () => {
    const problemArea = createMockProblemArea('left-shoulder', 10);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const bar = container.querySelector('.bg-red-500');
    expect(bar).toBeInTheDocument();
  });

  it('should apply orange color for >= 50% of max', () => {
    const problemArea = createMockProblemArea('left-shoulder', 6);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const bar = container.querySelector('.bg-orange-500');
    expect(bar).toBeInTheDocument();
  });

  it('should apply yellow color for >= 25% of max', () => {
    const problemArea = createMockProblemArea('left-shoulder', 3);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const bar = container.querySelector('.bg-yellow-500');
    expect(bar).toBeInTheDocument();
  });

  it('should apply green color for < 25% of max', () => {
    const problemArea = createMockProblemArea('left-shoulder', 2);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const bar = container.querySelector('.bg-green-500');
    expect(bar).toBeInTheDocument();
  });

  it('should call onClick handler when row is clicked (AC3.1.5)', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    fireEvent.click(row!);

    expect(mockOnClick).toHaveBeenCalledWith('left-shoulder');
  });

  it('should call onClick when Enter key is pressed (AC3.1.5)', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    fireEvent.keyDown(row!, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith('left-shoulder');
  });

  it('should call onClick when Space key is pressed', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    fireEvent.keyDown(row!, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledWith('left-shoulder');
  });

  it('should not call onClick for other keys', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    fireEvent.keyDown(row!, { key: 'a' });

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should have proper ARIA label (AC3.1.5)', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    const ariaLabel = row?.getAttribute('aria-label');

    expect(ariaLabel).toContain('Left Shoulder');
    expect(ariaLabel).toContain('5 flares');
    expect(ariaLabel).toContain('50.0%');
    expect(ariaLabel).toContain('View detailed history');
  });

  it('should have minimum 44px height for touch targets', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    expect(row).toHaveClass('min-h-[44px]');
  });

  it('should be keyboard accessible with tabIndex', () => {
    const problemArea = createMockProblemArea('left-shoulder', 5);

    const { container } = render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    const row = container.querySelector('[role="button"]');
    expect(row).toHaveAttribute('tabIndex', '0');
  });

  it('should fallback to bodyRegionId if region name not found', () => {
    const problemArea = createMockProblemArea('unknown-region', 5);

    render(
      <ProblemAreaRow
        problemArea={problemArea}
        maxCount={10}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('unknown-region')).toBeInTheDocument();
  });
});
