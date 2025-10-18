import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfidenceBadge } from '../ConfidenceBadge';

describe('ConfidenceBadge', () => {
  describe('Rendering', () => {
    it('should render high confidence badge with green styling', () => {
      render(<ConfidenceBadge confidence="high" />);
      
      const badge = screen.getByText('High Confidence');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should render medium confidence badge with yellow styling', () => {
      render(<ConfidenceBadge confidence="medium" />);
      
      const badge = screen.getByText('Medium Confidence');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should render low confidence badge with orange styling', () => {
      render(<ConfidenceBadge confidence="low" />);
      
      const badge = screen.getByText('Low Confidence');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
    });
  });

  describe('Tooltip with Metadata', () => {
    it('should show tooltip on hover when metadata provided', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      
      // Tooltip should not be visible initially
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

      // Hover to show tooltip
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Sample size: 5, Consistency: 75%, p-value: 0.020');
    });

    it('should hide tooltip on mouse leave', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      
      fireEvent.mouseEnter(badge);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.mouseLeave(badge);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should not show tooltip when metadata missing', () => {
      render(<ConfidenceBadge confidence="high" />);

      const badge = screen.getByText('High Confidence');
      fireEvent.mouseEnter(badge);
      
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should format consistency as percentage in tooltip', () => {
      render(
        <ConfidenceBadge
          confidence="medium"
          sampleSize={4}
          consistency={0.625}
          pValue={0.04}
        />
      );

      const badge = screen.getByText('Medium Confidence');
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Consistency: 63%'); // Rounded 62.5%
    });

    it('should format p-value to 3 decimal places in tooltip', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={10}
          consistency={0.80}
          pValue={0.005432}
        />
      );

      const badge = screen.getByText('High Confidence');
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('p-value: 0.005');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label with full explanation when metadata provided', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      expect(badge).toHaveAttribute(
        'aria-label',
        'High Confidence: 5 occurrences, 75% consistency, statistically significant'
      );
    });

    it('should have simple aria-label when metadata missing', () => {
      render(<ConfidenceBadge confidence="medium" />);

      const badge = screen.getByText('Medium Confidence');
      expect(badge).toHaveAttribute('aria-label', 'Medium Confidence');
    });

    it('should be keyboard accessible when tooltip present', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });

    it('should not be keyboard focusable when no tooltip', () => {
      render(<ConfidenceBadge confidence="high" />);

      const badge = screen.getByText('High Confidence');
      expect(badge).not.toHaveAttribute('tabIndex');
    });

    it('should show tooltip on focus (keyboard navigation)', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      
      fireEvent.focus(badge);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });

    it('should hide tooltip on blur', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      
      fireEvent.focus(badge);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.blur(badge);
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('should dismiss tooltip on Escape key', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={0.75}
          pValue={0.02}
        />
      );

      const badge = screen.getByText('High Confidence');
      
      fireEvent.focus(badge);
      expect(screen.getByRole('tooltip')).toBeInTheDocument();

      fireEvent.keyDown(badge, { key: 'Escape' });
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  describe('Color and Text Labels (WCAG 2.1 AA)', () => {
    it('should use both color AND text for high confidence (not color-only)', () => {
      render(<ConfidenceBadge confidence="high" />);
      
      const badge = screen.getByText('High Confidence');
      // Verify text label present (not relying on color alone)
      expect(badge).toHaveTextContent('High Confidence');
      // Verify color classes also present
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should use both color AND text for medium confidence', () => {
      render(<ConfidenceBadge confidence="medium" />);
      
      const badge = screen.getByText('Medium Confidence');
      expect(badge).toHaveTextContent('Medium Confidence');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should use both color AND text for low confidence', () => {
      render(<ConfidenceBadge confidence="low" />);
      
      const badge = screen.getByText('Low Confidence');
      expect(badge).toHaveTextContent('Low Confidence');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
    });
  });

  describe('Edge Cases', () => {
    it('should handle consistency of 0% (no correlation)', () => {
      render(
        <ConfidenceBadge
          confidence="low"
          sampleSize={3}
          consistency={0}
          pValue={0.09}
        />
      );

      const badge = screen.getByText('Low Confidence');
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Consistency: 0%');
    });

    it('should handle consistency of 100% (perfect correlation)', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={5}
          consistency={1.0}
          pValue={0.001}
        />
      );

      const badge = screen.getByText('High Confidence');
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('Consistency: 100%');
    });

    it('should handle very small p-values', () => {
      render(
        <ConfidenceBadge
          confidence="high"
          sampleSize={10}
          consistency={0.85}
          pValue={0.0001}
        />
      );

      const badge = screen.getByText('High Confidence');
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('p-value: 0.000');
    });

    it('should handle boundary p-value (exactly 0.05)', () => {
      render(
        <ConfidenceBadge
          confidence="medium"
          sampleSize={4}
          consistency={0.60}
          pValue={0.05}
        />
      );

      const badge = screen.getByText('Medium Confidence');
      fireEvent.mouseEnter(badge);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('p-value: 0.050');
    });
  });
});
