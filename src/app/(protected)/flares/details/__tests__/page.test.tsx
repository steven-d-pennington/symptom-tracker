/**
 * Tests for Story 9.2: Flare Details Page
 *
 * Test coverage for all 12 acceptance criteria:
 * - AC 9.2.1: Route validation and param parsing
 * - AC 9.2.2: Region name, marker count, layer badge display
 * - AC 9.2.3: Severity slider with visual feedback
 * - AC 9.2.4: LifecycleStageSelector integration
 * - AC 9.2.5: Notes textarea with character limit
 * - AC 9.2.6: Save button validation and state
 * - AC 9.2.7: Flare creation with multi-location save
 * - AC 9.2.8: Success navigation with summary
 * - AC 9.2.9: Error handling and state preservation
 * - AC 9.2.10: Mobile-responsive and accessible design
 * - AC 9.2.11: Analytics event tracking
 * - AC 9.2.12: Performance targets
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlareDetailsPage from '../page';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import * as announceModule from '@/lib/utils/announce';

// Mock functions for navigation hooks
const mockPush = jest.fn();
const mockSearchParams = new Map<string, string>([
  ['source', 'dashboard'],
  ['layer', 'flares'],
  ['bodyRegionId', 'left-armpit'],
  ['markerCoordinates', JSON.stringify([{ x: 0.5, y: 0.3 }])],
]);

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) || null,
  }),
}));

// Mock child components
jest.mock('@/components/LifecycleStageSelector', () => ({
  LifecycleStageSelector: ({
    currentStage,
    onStageChange,
  }: {
    currentStage?: string;
    onStageChange: (stage: string) => void;
  }) => (
    <div data-testid="lifecycle-stage-selector">
      <select
        data-testid="lifecycle-stage-select"
        value={currentStage || 'onset'}
        onChange={(e) => onStageChange(e.target.value as any)}
      >
        <option value="onset">Onset</option>
        <option value="growth">Growth</option>
        <option value="rupture">Rupture</option>
        <option value="draining">Draining</option>
        <option value="healing">Healing</option>
        <option value="resolved">Resolved</option>
      </select>
    </div>
  ),
}));

jest.mock('@/components/symptoms/SeverityScale', () => ({
  SeverityScale: ({
    value,
    onChange,
    ariaLabel,
  }: {
    value: number;
    onChange: (value: number) => void;
    ariaLabel: string;
  }) => (
    <input
      type="range"
      data-testid="severity-slider"
      min={1}
      max={10}
      step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={ariaLabel}
    />
  ),
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="layer-badge">{children}</span>
  ),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    'aria-label': ariaLabel,
  }: any) => (
    <button
      data-testid="save-button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

// Mock repository
jest.mock('@/lib/repositories/bodyMarkerRepository', () => ({
  bodyMarkerRepository: {
    createMarker: jest.fn(),
  },
}));

// Mock announce utility
jest.mock('@/lib/utils/announce', () => ({
  announce: jest.fn(),
}));

// Mock useCurrentUser hook
jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ userId: 'test-user-123' }),
}));

// Mock cn utility
jest.mock('@/lib/utils/cn', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('FlareDetailsPage', () => {
  beforeEach(() => {
    // Reset navigation mock
    mockPush.mockClear();

    // Reset search params to defaults
    mockSearchParams.clear();
    mockSearchParams.set('source', 'dashboard');
    mockSearchParams.set('layer', 'flares');
    mockSearchParams.set('bodyRegionId', 'left-armpit');
    mockSearchParams.set('markerCoordinates', JSON.stringify([{ x: 0.5, y: 0.3 }]));

    // Clear repository mock
    jest.clearAllMocks();

    // Suppress console logs in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('AC 9.2.1 - Route validation and param parsing', () => {
    it('should render page with valid URL params', () => {
      render(<FlareDetailsPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText('Left Armpit')).toBeInTheDocument();
    });

    it('should redirect to placement page if source param missing', () => {
      mockSearchParams.delete('source');

      render(<FlareDetailsPage />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if layer param missing', () => {
      mockSearchParams.delete('layer');

      render(<FlareDetailsPage />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if bodyRegionId param missing', () => {
      mockSearchParams.delete('bodyRegionId');

      render(<FlareDetailsPage />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if markerCoordinates param missing', () => {
      mockSearchParams.delete('markerCoordinates');

      render(<FlareDetailsPage />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if markerCoordinates is invalid JSON', () => {
      mockSearchParams.set('markerCoordinates', 'invalid-json');

      render(<FlareDetailsPage />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if markerCoordinates is empty array', () => {
      mockSearchParams.set('markerCoordinates', JSON.stringify([]));

      render(<FlareDetailsPage />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });
  });

  describe('AC 9.2.2 - Display region name, marker count, and layer badge', () => {
    it('should display body region name prominently in h1', () => {
      render(<FlareDetailsPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Left Armpit');
    });

    it('should convert kebab-case bodyRegionId to display name', () => {
      mockSearchParams.set('bodyRegionId', 'right-shoulder');

      render(<FlareDetailsPage />);

      expect(screen.getByText('Right Shoulder')).toBeInTheDocument();
    });

    it('should display marker count when multiple markers placed', () => {
      mockSearchParams.set(
        'markerCoordinates',
        JSON.stringify([
          { x: 0.3, y: 0.4 },
          { x: 0.5, y: 0.6 },
          { x: 0.7, y: 0.8 },
        ])
      );

      render(<FlareDetailsPage />);

      expect(screen.getByText(/3 markers placed in Left Armpit/i)).toBeInTheDocument();
    });

    it('should NOT display marker count when single marker', () => {
      mockSearchParams.set('markerCoordinates', JSON.stringify([{ x: 0.5, y: 0.3 }]));

      render(<FlareDetailsPage />);

      expect(screen.queryByText(/markers placed/i)).not.toBeInTheDocument();
    });

    it('should display layer badge showing "Flares"', () => {
      render(<FlareDetailsPage />);

      const badge = screen.getByTestId('layer-badge');
      expect(badge).toHaveTextContent('Flares');
    });

    it('should display layer badge showing "Pain" when layer=pain', () => {
      mockSearchParams.set('layer', 'pain');

      render(<FlareDetailsPage />);

      const badge = screen.getByTestId('layer-badge');
      expect(badge).toHaveTextContent('Pain');
    });
  });

  describe('AC 9.2.3 - Severity slider with visual feedback', () => {
    it('should render severity slider with range 1-10', () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      expect(slider).toHaveAttribute('min', '1');
      expect(slider).toHaveAttribute('max', '10');
      expect(slider).toHaveAttribute('step', '1');
    });

    it('should update severity state when slider value changes', () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '7' } });

      expect(slider.value).toBe('7');
    });

    it('should have proper ARIA label for accessibility', () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      expect(slider).toHaveAttribute('aria-label', 'Flare severity from 1 to 10');
    });

    it('should show severity as required field with asterisk', () => {
      render(<FlareDetailsPage />);

      expect(screen.getByText(/Severity/)).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('AC 9.2.4 - LifecycleStageSelector integration', () => {
    it('should render LifecycleStageSelector component', () => {
      render(<FlareDetailsPage />);

      expect(screen.getByTestId('lifecycle-stage-selector')).toBeInTheDocument();
    });

    it('should pre-select "onset" stage by default', () => {
      render(<FlareDetailsPage />);

      const select = screen.getByTestId('lifecycle-stage-select') as HTMLSelectElement;
      expect(select.value).toBe('onset');
    });

    it('should allow user to change lifecycle stage', () => {
      render(<FlareDetailsPage />);

      const select = screen.getByTestId('lifecycle-stage-select');
      fireEvent.change(select, { target: { value: 'growth' } });

      expect((select as HTMLSelectElement).value).toBe('growth');
    });
  });

  describe('AC 9.2.5 - Notes textarea with character limit', () => {
    it('should render notes textarea with optional label', () => {
      render(<FlareDetailsPage />);

      const textarea = screen.getByLabelText(/Notes \(optional\)/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should display character counter showing remaining characters', () => {
      render(<FlareDetailsPage />);

      expect(screen.getByText('0/500')).toBeInTheDocument();
    });

    it('should update character counter as user types', async () => {
      const user = userEvent.setup();
      render(<FlareDetailsPage />);

      const textarea = screen.getByLabelText(/Notes \(optional\)/i);
      await user.type(textarea, 'Test notes');

      expect(screen.getByText('10/500')).toBeInTheDocument();
    });

    it('should enforce 500-character limit', async () => {
      const user = userEvent.setup();
      render(<FlareDetailsPage />);

      const textarea = screen.getByLabelText(/Notes \(optional\)/i) as HTMLTextAreaElement;
      const longText = 'a'.repeat(501);

      await user.type(textarea, longText);

      // Should only accept 500 characters
      expect(textarea.value.length).toBe(500);
      expect(screen.getByText('500/500')).toBeInTheDocument();
    });

    it('should have placeholder text', () => {
      render(<FlareDetailsPage />);

      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      expect(textarea).toBeInTheDocument();
    });

    it('should have maxLength attribute set to 500', () => {
      render(<FlareDetailsPage />);

      const textarea = screen.getByLabelText(/Notes \(optional\)/i);
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('AC 9.2.6 - Save button validation and state', () => {
    it('should disable save button when severity is not selected', () => {
      render(<FlareDetailsPage />);

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when severity is selected', () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).not.toBeDisabled();
    });

    it('should show loading state when saving', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'flare-123' }), 100))
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });
    });

    it('should have proper ARIA label when disabled', () => {
      render(<FlareDetailsPage />);

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toHaveAttribute('aria-label', 'Save - disabled, severity required');
    });
  });

  describe('AC 9.2.7 - Create flare with multi-location save', () => {
    it('should call bodyMarkerRepository.createMarker with correct data', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      mockSearchParams.set(
        'markerCoordinates',
        JSON.stringify([
          { x: 0.3, y: 0.4 },
          { x: 0.6, y: 0.7 },
        ])
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '8' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(bodyMarkerRepository.createMarker).toHaveBeenCalledWith('test-user-123', {
          type: 'flare',
          bodyRegionId: 'left-armpit',
          initialSeverity: 8,
          currentSeverity: 8,
          status: 'active',
          currentLifecycleStage: 'onset',
          initialEventNotes: undefined,
          bodyLocations: [
            { bodyRegionId: 'left-armpit', coordinates: { x: 0.3, y: 0.4 } },
            { bodyRegionId: 'left-armpit', coordinates: { x: 0.6, y: 0.7 } },
          ],
        });
      });
    });

    it('should include notes in flare creation if provided', async () => {
      const user = userEvent.setup();
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '6' } });

      const textarea = screen.getByLabelText(/Notes \(optional\)/i);
      await user.type(textarea, 'Painful and swollen');

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(bodyMarkerRepository.createMarker).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            initialEventNotes: 'Painful and swollen',
          })
        );
      });
    });

    it('should set flare status to "active"', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(bodyMarkerRepository.createMarker).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            status: 'active',
          })
        );
      });
    });
  });

  describe('AC 9.2.8 - Success navigation with summary', () => {
    it('should navigate to success page with correct URL params', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-abc-123',
      });

      mockSearchParams.set(
        'markerCoordinates',
        JSON.stringify([
          { x: 0.3, y: 0.4 },
          { x: 0.5, y: 0.6 },
          { x: 0.7, y: 0.8 },
        ])
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      const lifecycleSelect = screen.getByTestId('lifecycle-stage-select');
      fireEvent.change(lifecycleSelect, { target: { value: 'growth' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/flares/success?')
        );

        const callArg = mockPush.mock.calls[0][0];
        expect(callArg).toContain('source=dashboard');
        expect(callArg).toContain('flareId=flare-abc-123');
        expect(callArg).toContain('region=Left+Armpit');
        expect(callArg).toContain('severity=7');
        expect(callArg).toContain('lifecycleStage=growth');
        expect(callArg).toContain('locations=3');
      });
    });

    it('should URL-encode region name with spaces', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      mockSearchParams.set('bodyRegionId', 'right-shoulder');

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        const callArg = mockPush.mock.calls[0][0];
        expect(callArg).toContain('region=Right+Shoulder');
      });
    });
  });

  describe('AC 9.2.9 - Error handling and state preservation', () => {
    it('should display error message when save fails', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '6' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });
    });

    it('should preserve severity state after error', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '8' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });

      // Verify severity still set to 8
      expect(slider.value).toBe('8');
    });

    it('should preserve notes state after error', async () => {
      const user = userEvent.setup();
      (bodyMarkerRepository.createMarker as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const textarea = screen.getByLabelText(/Notes \(optional\)/i) as HTMLTextAreaElement;
      await user.type(textarea, 'Test notes');

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });

      // Verify notes still present
      expect(textarea.value).toBe('Test notes');
    });

    it('should keep save button enabled after error for retry', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });

      // Save button should be enabled for retry
      expect(saveButton).not.toBeDisabled();
    });

    it('should announce error to screen readers', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(announceModule.announce).toHaveBeenCalledWith(
          'Error: Failed to save flare',
          'assertive'
        );
      });
    });

    it('should display error in ARIA live region', () => {
      render(<FlareDetailsPage />);

      const liveRegion = screen.getByRole('alert', { hidden: true });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('AC 9.2.10 - Mobile-responsive and accessible design', () => {
    it('should have proper ARIA label on main element', () => {
      render(<FlareDetailsPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Flare details');
    });

    it('should have ARIA label on severity slider', () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      expect(slider).toHaveAttribute('aria-label', 'Flare severity from 1 to 10');
    });

    it('should have ARIA label on notes textarea', () => {
      render(<FlareDetailsPage />);

      const textarea = screen.getByLabelText(/Notes \(optional\)/i);
      expect(textarea).toHaveAttribute('aria-label', 'Flare notes');
    });

    it('should have ARIA describedby linking notes to character counter', () => {
      render(<FlareDetailsPage />);

      const textarea = screen.getByLabelText(/Notes \(optional\)/i);
      expect(textarea).toHaveAttribute('aria-describedby', 'notes-counter');

      const counter = screen.getByText('0/500');
      expect(counter).toHaveAttribute('id', 'notes-counter');
    });

    it('should navigate back to placement page on Escape key', () => {
      render(<FlareDetailsPage />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard&layer=flares');
    });

    it('should submit form on Enter key when severity selected', async () => {
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(bodyMarkerRepository.createMarker).toHaveBeenCalled();
      });
    });

    it('should NOT submit on Enter when severity not selected', () => {
      render(<FlareDetailsPage />);

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(bodyMarkerRepository.createMarker).not.toHaveBeenCalled();
    });
  });

  describe('AC 9.2.11 - Analytics event tracking', () => {
    it('should fire flare_creation_details_completed when Save clicked', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[Analytics] flare_creation_details_completed',
          expect.objectContaining({
            severity: 7,
            lifecycleStage: 'onset',
          })
        );
      });
    });

    it('should fire flare_creation_saved on successful save', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-abc-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[Analytics] flare_creation_saved',
          expect.objectContaining({
            flareId: 'flare-abc-123',
          })
        );
      });
    });

    it('should fire flare_creation_abandoned on unmount without save', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      const { unmount } = render(<FlareDetailsPage />);

      unmount();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] flare_creation_abandoned',
        expect.objectContaining({
          source: 'dashboard',
          layer: 'flares',
          bodyRegionId: 'left-armpit',
          markerCount: 1,
        })
      );
    });

    it('should NOT fire abandoned event after successful save', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      (bodyMarkerRepository.createMarker as jest.Mock).mockResolvedValue({
        id: 'flare-123',
      });

      const { unmount } = render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      // Clear previous calls
      consoleSpy.mockClear();

      unmount();

      // Should NOT have abandoned event
      expect(consoleSpy).not.toHaveBeenCalledWith(
        '[Analytics] flare_creation_abandoned',
        expect.anything()
      );
    });
  });

  describe('AC 9.2.12 - Performance targets', () => {
    it('should render page quickly without heavy computations', () => {
      const startTime = performance.now();

      render(<FlareDetailsPage />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 200ms (generous for test environment)
      expect(renderTime).toBeLessThan(200);
    });

    it('should update severity slider instantly', () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider') as HTMLInputElement;

      const startTime = performance.now();
      fireEvent.change(slider, { target: { value: '7' } });
      const endTime = performance.now();

      const updateTime = endTime - startTime;

      // Should update in under 50ms
      expect(updateTime).toBeLessThan(50);
      expect(slider.value).toBe('7');
    });

    it('should update lifecycle stage instantly', () => {
      render(<FlareDetailsPage />);

      const select = screen.getByTestId('lifecycle-stage-select');

      const startTime = performance.now();
      fireEvent.change(select, { target: { value: 'growth' } });
      const endTime = performance.now();

      const updateTime = endTime - startTime;

      // Should update in under 50ms
      expect(updateTime).toBeLessThan(50);
    });
  });
});
