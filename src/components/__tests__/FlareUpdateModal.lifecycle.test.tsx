/**
 * Integration tests for FlareUpdateModal lifecycle stage functionality (Story 8.2)
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BodyMarkerRecord } from '@/lib/db/schema';

// Mock the repository
const mockUpdateLifecycleStage = jest.fn();
const mockAddMarkerEvent = jest.fn();
const mockUpdateMarker = jest.fn();

jest.mock('@/lib/repositories/bodyMarkerRepository', () => ({
  bodyMarkerRepository: {
    updateLifecycleStage: (...args: unknown[]) => mockUpdateLifecycleStage(...args),
    addMarkerEvent: (...args: unknown[]) => mockAddMarkerEvent(...args),
    updateMarker: (...args: unknown[]) => mockUpdateMarker(...args),
  },
}));

const mockLifecycleSelector = jest.fn(
  ({
    currentStage,
    onStageChange,
  }: {
    currentStage?: string;
    onStageChange: (stage: any, notes?: string) => void;
  }) => (
    <div data-testid="lifecycle-selector-mock">
      <div>Mock Stage: {currentStage ?? 'none'}</div>
      <button type="button" onClick={() => onStageChange('growth')}>
        Mock Select Growth
      </button>
      <button type="button" onClick={() => onStageChange('resolved')}>
        Mock Select Resolved
      </button>
    </div>
  )
);

jest.mock('@/components/LifecycleStageSelector', () => ({
  LifecycleStageSelector: (props: any) => mockLifecycleSelector(props),
}));

import { FlareUpdateModal } from '../flares/FlareUpdateModal';

// Mock lifecycle utilities
jest.mock('@/lib/utils/lifecycleUtils', () => ({
  getNextLifecycleStage: jest.fn((stage: string) => {
    const next: Record<string, string | null> = {
      onset: 'growth',
      growth: 'rupture',
      rupture: 'draining',
      draining: 'healing',
      healing: 'resolved',
      resolved: null,
    };
    return next[stage] ?? null;
  }),
  isValidStageTransition: jest.fn((from: string, to: string) => {
    if (from === 'resolved') return false;
    if (to === 'resolved') return true;
    const valid: Record<string, string[]> = {
      onset: ['growth'],
      growth: ['rupture'],
      rupture: ['draining'],
      draining: ['healing'],
      healing: ['resolved'],
    };
    return valid[from]?.includes(to) ?? false;
  }),
  formatLifecycleStage: jest.fn((stage: string) => stage.charAt(0).toUpperCase() + stage.slice(1)),
  getLifecycleStageDescription: jest.fn((stage: string) => `Description for ${stage}`),
  getLifecycleStageIcon: jest.fn(() => '🔴'),
}));

const mockUserId = 'user-123';

const createMockFlare = (overrides?: Partial<BodyMarkerRecord>): BodyMarkerRecord => ({
  id: 'flare-1',
  userId: mockUserId,
  type: 'flare',
  layer: 'flares',
  status: 'active',
  bodyRegionId: 'left-elbow',
  currentSeverity: 5,
  startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
  currentLifecycleStage: 'onset',
  ...overrides,
});

describe('FlareUpdateModal Lifecycle Integration', () => {
  const mockOnClose = jest.fn();
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateLifecycleStage.mockResolvedValue(undefined);
    mockAddMarkerEvent.mockResolvedValue(undefined);
    mockUpdateMarker.mockResolvedValue(undefined);
    mockLifecycleSelector.mockClear();
  });

  describe('AC8.2.1: Lifecycle selector in Additional Details section', () => {
    it('renders lifecycle selector in expandable Additional Details section', async () => {
      const flare = createMockFlare({ currentLifecycleStage: 'onset' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      // Find and expand Additional Details section
      const additionalDetailsButton = screen.getByText('Additional Details');
      expect(additionalDetailsButton).toBeInTheDocument();

      await userEvent.click(additionalDetailsButton);

      // Lifecycle selector should be visible
      await waitFor(() => {
        expect(screen.getByTestId('lifecycle-selector-mock')).toBeInTheDocument();
      });
    });

    it('displays current stage badge when Additional Details section is expanded', async () => {
      const flare = createMockFlare({ currentLifecycleStage: 'growth' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      const additionalDetailsButton = screen.getByText('Additional Details');
      await userEvent.click(additionalDetailsButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Growth/i).length).toBeGreaterThan(0);
      });
    });

    it('only shows lifecycle selector for flare-type markers', async () => {
      const flare = createMockFlare({ type: 'pain', currentLifecycleStage: undefined });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      const additionalDetailsButton = screen.getByText('Additional Details');
      await userEvent.click(additionalDetailsButton);

      // Lifecycle selector should not be present for non-flare markers
      await waitFor(() => {
        expect(screen.queryByTestId('lifecycle-selector-mock')).not.toBeInTheDocument();
      });
    });
  });

  describe('AC8.2.7: Stage updates are optional', () => {
    it('allows saving severity update without changing lifecycle stage', async () => {
      const flare = createMockFlare({ currentSeverity: 5, currentLifecycleStage: 'onset' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      // Change severity only
      const severitySlider = screen.getByLabelText(/Severity slider/i);
      fireEvent.change(severitySlider, { target: { value: '7' } });

      // Save without changing lifecycle stage
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        // Should update severity but not lifecycle stage
        expect(mockUpdateMarker).toHaveBeenCalled();
        expect(mockUpdateLifecycleStage).not.toHaveBeenCalled();
      });
    });
  });

  describe('AC8.2.8: Stage changes create lifecycle_stage_change events', () => {
    it('calls updateLifecycleStage when stage is changed', async () => {
      const flare = createMockFlare({ currentLifecycleStage: 'onset' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      // Expand Additional Details
      const additionalDetailsButton = screen.getByText('Additional Details');
      await userEvent.click(additionalDetailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('lifecycle-selector-mock')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Mock Select Growth'));

      // Save
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateLifecycleStage).toHaveBeenCalledWith(
          mockUserId,
          flare.id,
          'growth',
          undefined
        );
      });
    });

    it('includes notes when stage is changed with notes', async () => {
      const flare = createMockFlare({ currentLifecycleStage: 'onset' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      // Expand Additional Details
      const additionalDetailsButton = screen.getByText('Additional Details');
      await userEvent.click(additionalDetailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('lifecycle-selector-mock')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Mock Select Growth'));

      // Enter notes
      const notesInput = screen.getByLabelText('Stage change notes');
      await userEvent.type(notesInput, 'Stage progression notes');

      // Save
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdateLifecycleStage).toHaveBeenCalledWith(
          mockUserId,
          flare.id,
          'growth',
          'Stage progression notes'
        );
      });
    });
  });

  describe('AC8.2.9: Validation prevents invalid stage transitions', () => {
    it('shows error message when invalid transition is attempted', async () => {
      const flare = createMockFlare({ currentLifecycleStage: 'draining' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      // Expand Additional Details
      const additionalDetailsButton = screen.getByText('Additional Details');
      await userEvent.click(additionalDetailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('lifecycle-selector-mock')).toBeInTheDocument();
      });

      mockUpdateLifecycleStage.mockRejectedValueOnce(
        new Error('Invalid stage transition')
      );

      await userEvent.click(screen.getByText('Mock Select Growth'));

      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid stage transition/i)).toBeInTheDocument();
      });
    });
  });

  describe('AC8.2.12: Setting stage to resolved updates marker status', () => {
    it('updates marker status when stage is set to resolved', async () => {
      const flare = createMockFlare({ currentLifecycleStage: 'healing', status: 'active' });
      render(
        <FlareUpdateModal
          isOpen={true}
          onClose={mockOnClose}
          flare={flare}
          userId={mockUserId}
          onUpdate={mockOnUpdate}
        />
      );

      // Expand Additional Details
      const additionalDetailsButton = screen.getByText('Additional Details');
      await userEvent.click(additionalDetailsButton);

      await waitFor(() => {
        expect(screen.getByTestId('lifecycle-selector-mock')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Mock Select Resolved'));

      // Save
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);

      await waitFor(() => {
        // updateLifecycleStage should be called, which handles status update internally
        expect(mockUpdateLifecycleStage).toHaveBeenCalledWith(
          mockUserId,
          flare.id,
          'resolved',
          undefined
        );
      });
    });
  });
});

