/**
 * Intervention Effectiveness Components Tests (Story 3.5 - Task 9)
 *
 * Test suite for intervention effectiveness components.
 * Tests section rendering, cards, modal, and empty states.
 */

import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import type { InterventionEffectiveness } from '@/types/analytics';

// Mock react-chartjs-2 for InterventionDetailModal
jest.unstable_mockModule('react-chartjs-2', () => ({
  Bar: () => <canvas role="img" aria-label="chart" />,
}));

// Mock Next.js Link
jest.unstable_mockModule('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Intervention Effectiveness Components', () => {
  // Helper to create mock intervention data
  const createMockIntervention = (
    type: 'Ice' | 'Heat' | 'Medication' | 'Rest' | 'Drainage' | 'Other',
    usageCount: number,
    successRate: number | null = 75
  ): InterventionEffectiveness => ({
    interventionType: type,
    usageCount,
    averageSeverityChange: successRate !== null ? 2.5 : null,
    successRate,
    hasSufficientData: usageCount >= 5,
    instances: []
  });

  describe('InterventionEffectivenessSection', () => {
    it('should render loading state with skeletons', async () => {
      const { InterventionEffectivenessSection } = await import('../InterventionEffectivenessSection');

      render(
        <InterventionEffectivenessSection
          interventionEffectiveness={null}
          isLoading={true}
        />
      );

      expect(screen.getByText('Intervention Effectiveness')).toBeInTheDocument();
    });

    it('should render empty state when no interventions', async () => {
      const { InterventionEffectivenessSection } = await import('../InterventionEffectivenessSection');

      render(
        <InterventionEffectivenessSection
          interventionEffectiveness={[]}
          isLoading={false}
        />
      );

      expect(screen.getByText(/No interventions logged/)).toBeInTheDocument();
    });

    it('should render medical disclaimer banner', async () => {
      const { InterventionEffectivenessSection } = await import('../InterventionEffectivenessSection');
      const interventions = [createMockIntervention('Ice', 5)];

      render(
        <InterventionEffectivenessSection
          interventionEffectiveness={interventions}
          isLoading={false}
        />
      );

      expect(screen.getByText(/Correlation vs. Causation/)).toBeInTheDocument();
      expect(screen.getByText(/correlation, not causation/)).toBeInTheDocument();
    });

    it('should render sufficient data interventions in ranked section', async () => {
      const { InterventionEffectivenessSection } = await import('../InterventionEffectivenessSection');
      const interventions = [
        createMockIntervention('Ice', 5, 80),
        createMockIntervention('Heat', 6, 60)
      ];

      render(
        <InterventionEffectivenessSection
          interventionEffectiveness={interventions}
          isLoading={false}
        />
      );

      expect(screen.getByText('Ranked by Effectiveness')).toBeInTheDocument();
      expect(screen.getByText('Ice')).toBeInTheDocument();
      expect(screen.getByText('Heat')).toBeInTheDocument();
    });

    it('should render insufficient data section separately', async () => {
      const { InterventionEffectivenessSection } = await import('../InterventionEffectivenessSection');
      const interventions = [
        createMockIntervention('Ice', 5, 80),
        createMockIntervention('Medication', 3, 50)
      ];

      render(
        <InterventionEffectivenessSection
          interventionEffectiveness={interventions}
          isLoading={false}
        />
      );

      expect(screen.getByText('Insufficient Data')).toBeInTheDocument();
      expect(screen.getByText(/need 2 more for analysis/)).toBeInTheDocument();
    });
  });

  describe('InterventionEffectivenessCard', () => {
    it('should render intervention type and metrics', async () => {
      const { InterventionEffectivenessCard } = await import('../InterventionEffectivenessCard');
      const intervention = createMockIntervention('Ice', 5, 75);

      render(
        <InterventionEffectivenessCard
          intervention={intervention}
          rank={1}
          onViewDetails={() => {}}
        />
      );

      expect(screen.getByText('Ice')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Usage count
      expect(screen.getByText('75%')).toBeInTheDocument(); // Success rate
      expect(screen.getByText('1st')).toBeInTheDocument(); // Rank badge
    });

    it('should call onViewDetails when View Details button clicked', async () => {
      const { InterventionEffectivenessCard } = await import('../InterventionEffectivenessCard');
      const intervention = createMockIntervention('Ice', 5, 75);
      const mockOnViewDetails = jest.fn();

      render(
        <InterventionEffectivenessCard
          intervention={intervention}
          rank={1}
          onViewDetails={mockOnViewDetails}
        />
      );

      const viewButton = screen.getByText('View Details');
      fireEvent.click(viewButton);

      expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    });

    it('should color code success rate correctly', async () => {
      const { InterventionEffectivenessCard } = await import('../InterventionEffectivenessCard');

      const highSuccess = createMockIntervention('Ice', 5, 75); // > 60% = green
      const mediumSuccess = createMockIntervention('Heat', 5, 50); // 40-60% = yellow
      const lowSuccess = createMockIntervention('Medication', 5, 30); // < 40% = red

      const { rerender } = render(
        <InterventionEffectivenessCard
          intervention={highSuccess}
          rank={null}
          onViewDetails={() => {}}
        />
      );
      expect(screen.getByText('75%')).toHaveClass('text-green-600');

      rerender(
        <InterventionEffectivenessCard
          intervention={mediumSuccess}
          rank={null}
          onViewDetails={() => {}}
        />
      );
      expect(screen.getByText('50%')).toHaveClass('text-yellow-600');

      rerender(
        <InterventionEffectivenessCard
          intervention={lowSuccess}
          rank={null}
          onViewDetails={() => {}}
        />
      );
      expect(screen.getByText('30%')).toHaveClass('text-red-600');
    });
  });

  describe('MedicalDisclaimerBanner', () => {
    it('should render disclaimer text', async () => {
      const { MedicalDisclaimerBanner } = await import('../MedicalDisclaimerBanner');

      render(<MedicalDisclaimerBanner />);

      expect(screen.getByText(/Correlation vs. Causation/)).toBeInTheDocument();
      expect(screen.getByText(/correlation, not causation/)).toBeInTheDocument();
      expect(screen.getByText(/healthcare provider/)).toBeInTheDocument();
    });

    it('should have alert role for screen readers', async () => {
      const { MedicalDisclaimerBanner } = await import('../MedicalDisclaimerBanner');

      const { container } = render(<MedicalDisclaimerBanner />);
      const banner = container.querySelector('[role="alert"]');

      expect(banner).toBeInTheDocument();
    });
  });

  describe('InsufficientDataCard', () => {
    it('should display current usage and required count', async () => {
      const { InsufficientDataCard } = await import('../InsufficientDataCard');
      const intervention = createMockIntervention('Heat', 3);

      render(<InsufficientDataCard intervention={intervention} />);

      expect(screen.getByText('Heat')).toBeInTheDocument();
      expect(screen.getByText(/3 uses - need 2 more for analysis/)).toBeInTheDocument();
    });
  });
});
