import { render, screen } from '@testing-library/react';
import { TrendInterpretation } from '../TrendInterpretation';

describe('TrendInterpretation', () => {
  describe('Worsening trend', () => {
    it('displays worsening trend with high confidence', () => {
      render(<TrendInterpretation direction="worsening" confidence="high" />);
      
      expect(screen.getByText(/Worsening with high confidence/i)).toBeInTheDocument();
      expect(screen.getByText(/70-90% confidence/i)).toBeInTheDocument();
    });

    it('uses red color scheme for worsening trends', () => {
      const { container } = render(<TrendInterpretation direction="worsening" confidence="high" />);
      
      const statusDiv = container.querySelector('[role="status"]');
      expect(statusDiv).toHaveClass('text-red-600');
    });

    it('displays upward arrow icon for worsening trends', () => {
      const { container } = render(<TrendInterpretation direction="worsening" confidence="high" />);
      
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Improving trend', () => {
    it('displays improving trend with very high confidence', () => {
      render(<TrendInterpretation direction="improving" confidence="very-high" />);
      
      expect(screen.getByText(/Improving with very high confidence/i)).toBeInTheDocument();
      expect(screen.getByText(/90%\+ confidence/i)).toBeInTheDocument();
    });

    it('uses green color scheme for improving trends', () => {
      const { container } = render(<TrendInterpretation direction="improving" confidence="high" />);
      
      const statusDiv = container.querySelector('[role="status"]');
      expect(statusDiv).toHaveClass('text-green-600');
    });

    it('displays downward arrow icon for improving trends', () => {
      const { container } = render(<TrendInterpretation direction="improving" confidence="high" />);
      
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Stable trend', () => {
    it('displays stable trend with moderate confidence', () => {
      render(<TrendInterpretation direction="stable" confidence="moderate" />);
      
      expect(screen.getByText(/Stable with moderate confidence/i)).toBeInTheDocument();
      expect(screen.getByText(/50-70% confidence/i)).toBeInTheDocument();
    });

    it('uses gray color scheme for stable trends', () => {
      const { container } = render(<TrendInterpretation direction="stable" confidence="moderate" />);
      
      const statusDiv = container.querySelector('[role="status"]');
      expect(statusDiv).toHaveClass('text-gray-600');
    });

    it('displays right arrow icon for stable trends', () => {
      const { container } = render(<TrendInterpretation direction="stable" confidence="moderate" />);
      
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Insufficient data', () => {
    it('displays insufficient data message', () => {
      render(<TrendInterpretation direction="Insufficient data" confidence="N/A" />);
      
      expect(screen.getByText(/Not enough data to determine trend/i)).toBeInTheDocument();
      expect(screen.getByText(/need at least 14 days/i)).toBeInTheDocument();
    });

    it('does not display confidence description for insufficient data', () => {
      render(<TrendInterpretation direction="Insufficient data" confidence="N/A" />);
      
      expect(screen.queryByText(/confidence - /i)).not.toBeInTheDocument();
    });
  });

  describe('Low confidence', () => {
    it('displays low confidence warning', () => {
      render(<TrendInterpretation direction="stable" confidence="low" />);
      
      expect(screen.getByText(/Stable with low confidence/i)).toBeInTheDocument();
      expect(screen.getByText(/Below 50% confidence/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA live region for screen readers', () => {
      const { container } = render(<TrendInterpretation direction="improving" confidence="high" />);
      
      const statusDiv = container.querySelector('[role="status"]');
      expect(statusDiv).toHaveAttribute('aria-live', 'polite');
    });

    it('hides decorative icons from screen readers', () => {
      const { container } = render(<TrendInterpretation direction="improving" confidence="high" />);
      
      const icon = container.querySelector('svg[aria-hidden="true"]');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('provides text-based status for all trend types', () => {
      const scenarios = [
        { direction: 'worsening', confidence: 'high', expectedText: /Worsening/ },
        { direction: 'improving', confidence: 'high', expectedText: /Improving/ },
        { direction: 'stable', confidence: 'moderate', expectedText: /Stable/ },
      ];

      scenarios.forEach(({ direction, confidence, expectedText }) => {
        const { unmount } = render(<TrendInterpretation direction={direction} confidence={confidence} />);
        expect(screen.getByText(expectedText)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
