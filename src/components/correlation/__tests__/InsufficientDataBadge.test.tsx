import React from 'react';
import { render, screen } from '@testing-library/react';
import { InsufficientDataBadge } from '../InsufficientDataBadge';

describe('InsufficientDataBadge', () => {
  describe('Rendering', () => {
    it('should render with gray styling', () => {
      render(<InsufficientDataBadge currentSampleSize={2} requiredSampleSize={3} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-700', 'border-gray-300');
    });

    it('should display "Insufficient Data" label', () => {
      render(<InsufficientDataBadge currentSampleSize={1} requiredSampleSize={3} />);
      
      expect(screen.getByText('Insufficient Data')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label with full explanation', () => {
      render(<InsufficientDataBadge currentSampleSize={2} requiredSampleSize={3} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveAttribute(
        'aria-label',
        'Insufficient data: 2 of 3 minimum occurrences required for confidence calculation'
      );
    });

    it('should have title attribute for tooltip', () => {
      render(<InsufficientDataBadge currentSampleSize={1} requiredSampleSize={5} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveAttribute('title', 'Need 4 more occurrence(s) for statistical confidence');
    });

    it('should calculate remaining occurrences correctly', () => {
      render(<InsufficientDataBadge currentSampleSize={7} requiredSampleSize={10} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveAttribute('title', 'Need 3 more occurrence(s) for statistical confidence');
    });
  });

  describe('Edge Cases', () => {
    it('should handle 1 occurrence away from threshold', () => {
      render(<InsufficientDataBadge currentSampleSize={2} requiredSampleSize={3} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveAttribute('title', 'Need 1 more occurrence(s) for statistical confidence');
      expect(badge).toHaveAttribute(
        'aria-label',
        'Insufficient data: 2 of 3 minimum occurrences required for confidence calculation'
      );
    });

    it('should handle zero current sample size', () => {
      render(<InsufficientDataBadge currentSampleSize={0} requiredSampleSize={3} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveAttribute('title', 'Need 3 more occurrence(s) for statistical confidence');
      expect(badge).toHaveAttribute(
        'aria-label',
        'Insufficient data: 0 of 3 minimum occurrences required for confidence calculation'
      );
    });

    it('should handle large sample size differences', () => {
      render(<InsufficientDataBadge currentSampleSize={5} requiredSampleSize={100} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveAttribute('title', 'Need 95 more occurrence(s) for statistical confidence');
    });
  });

  describe('Sample Size Display', () => {
    it('should show current vs required in aria-label', () => {
      render(<InsufficientDataBadge currentSampleSize={4} requiredSampleSize={5} />);
      
      const badge = screen.getByText('Insufficient Data');
      const ariaLabel = badge.getAttribute('aria-label');
      expect(ariaLabel).toContain('4 of 5');
    });

    it('should accurately reflect different thresholds', () => {
      const { rerender } = render(
        <InsufficientDataBadge currentSampleSize={2} requiredSampleSize={3} />
      );
      
      let badge = screen.getByText('Insufficient Data');
      expect(badge.getAttribute('aria-label')).toContain('2 of 3');

      rerender(<InsufficientDataBadge currentSampleSize={4} requiredSampleSize={10} />);
      
      badge = screen.getByText('Insufficient Data');
      expect(badge.getAttribute('aria-label')).toContain('4 of 10');
    });
  });

  describe('Visual Styling', () => {
    it('should use consistent badge styling classes', () => {
      render(<InsufficientDataBadge currentSampleSize={1} requiredSampleSize={3} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveClass('inline-flex', 'items-center', 'px-2', 'py-1', 'rounded', 'text-xs', 'font-medium');
    });

    it('should have border for visual definition', () => {
      render(<InsufficientDataBadge currentSampleSize={2} requiredSampleSize={5} />);
      
      const badge = screen.getByText('Insufficient Data');
      expect(badge).toHaveClass('border', 'border-gray-300');
    });
  });
});
