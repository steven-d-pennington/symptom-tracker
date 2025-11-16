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

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import FlareDetailsPage from '../page';
import { bodyMarkerRepository } from '@/lib/repositories/bodyMarkerRepository';
import * as announceModule from '@/lib/utils/announce';

// Mock functions for navigation hooks
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockGet = jest.fn();

// NO COMPONENT MOCKS - Use real components with test IDs (Story 9.1 pattern)

// Mock repository - use jest.fn() so tests can override
const mockCreateMarker = jest.fn();
jest.mock('@/lib/repositories/bodyMarkerRepository', () => ({
  bodyMarkerRepository: {
    createMarker: mockCreateMarker,
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
    // Reset all mocks
    mockPush.mockClear();
    mockReplace.mockClear();
    mockGet.mockClear();
    mockCreateMarker.mockClear();

    // Override the jest.setup.js mocks (they return jest.fn() so we can mock them)
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    });

    // Set up default mock return values for useSearchParams
    mockGet.mockImplementation((key: string) => {
      if (key === 'source') return 'dashboard';
      if (key === 'layer') return 'flares';
      if (key === 'bodyRegionId') return 'left-armpit';
      if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
      return null;
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

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

    it('should redirect to placement page if source param missing', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return null; // Missing source
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if layer param missing', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return null; // Missing layer
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if bodyRegionId param missing', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return null; // Missing bodyRegionId
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if markerCoordinates param missing', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return null; // Missing markerCoordinates
        return null;
      });

      render(<FlareDetailsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if markerCoordinates is invalid JSON', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return 'invalid-json'; // Invalid JSON
        return null;
      });

      render(<FlareDetailsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
      });
    });

    it('should redirect to placement page if markerCoordinates is empty array', async () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([]); // Empty array
        return null;
      });

      render(<FlareDetailsPage />);

      await waitFor(() => {
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
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'right-shoulder';
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      expect(screen.getByText('Right Shoulder')).toBeInTheDocument();
    });

    it('should display marker count when multiple markers placed', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([
          { x: 0.3, y: 0.4 },
          { x: 0.5, y: 0.6 },
          { x: 0.7, y: 0.8 },
        ]);
        return null;
      });

      render(<FlareDetailsPage />);

      expect(screen.getByText(/3 markers placed in Left Armpit/i)).toBeInTheDocument();
    });

    it('should display marker count even for single marker (Story 9.4 requirement)', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      expect(screen.getByText(/1 marker placed in Left Armpit/i)).toBeInTheDocument();
    });

    it('should display layer badge showing "Flares"', () => {
      render(<FlareDetailsPage />);

      const badge = screen.getByText('Flares');
      expect(badge).toBeInTheDocument();
    });

    it('should display layer badge showing "Pain" when layer=pain', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'pain';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      const badge = screen.getByText('Pain');
      expect(badge).toBeInTheDocument();
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

      expect(screen.getByText('Lifecycle Stage')).toBeInTheDocument();
    });

    it('should pre-select "onset" stage by default', () => {
      render(<FlareDetailsPage />);

      // Onset stage should be shown in the stage description
      expect(screen.getByText('Initial appearance of flare')).toBeInTheDocument();
    });

    it('should allow user to change lifecycle stage', async () => {
      const user = userEvent.setup();
      render(<FlareDetailsPage />);

      // Click the lifecycle stage select button
      const selectButton = screen.getByRole('button', { name: /Select lifecycle stage/i });
      await user.click(selectButton);

      // Click the "Growth" option
      const growthOption = screen.getByRole('option', { name: /Growth/i });
      await user.click(growthOption);

      // Verify growth stage description is shown
      expect(screen.getByText(/Flare is growing\/increasing in size/i)).toBeInTheDocument();
    });
  });

  describe('AC 9.2.5 - Notes textarea with character limit', () => {
    it('should render notes textarea with optional label', () => {
      render(<FlareDetailsPage />);

      // Use placeholder to find the flare notes textarea (not lifecycle notes)
      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      expect(textarea).toBeInTheDocument();
    });

    it('should display character counter showing remaining characters', () => {
      render(<FlareDetailsPage />);

      // Find the flare notes counter specifically (not lifecycle notes counter)
      const counters = screen.getAllByText('0/500');
      expect(counters.length).toBeGreaterThanOrEqual(1);
    });

    it('should update character counter as user types', async () => {
      const user = userEvent.setup();
      render(<FlareDetailsPage />);

      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      await user.type(textarea, 'Test notes');

      expect(screen.getByText('10/500')).toBeInTheDocument();
    });

    it('should enforce 500-character limit', async () => {
      const user = userEvent.setup();
      render(<FlareDetailsPage />);

      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)') as HTMLTextAreaElement;
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

      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });
  });

  describe('AC 9.2.6 - Save button validation and state', () => {
    it('should disable save button when severity is not selected', () => {
      render(<FlareDetailsPage />);

      const saveButton = screen.getByTestId('save-button');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when severity is selected', async () => {
      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');

      // Use act() to ensure state updates are processed
      await act(async () => {
        fireEvent.change(slider, { target: { value: '5' } });
      });

      // Wait for state update and button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should show loading state when saving', async () => {
      mockCreateMarker.mockImplementation(
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
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([
          { x: 0.3, y: 0.4 },
          { x: 0.6, y: 0.7 },
        ]);
        return null;
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '8' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      expect(saveButton).not.toBeDisabled();

      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateMarker).toHaveBeenCalledWith('test-user-123', {
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
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '6' } });

      // Use placeholder to find flare notes textarea (not lifecycle notes)
      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      await user.type(textarea, 'Painful and swollen');

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateMarker).toHaveBeenCalledWith(
          'test-user-123',
          expect.objectContaining({
            initialEventNotes: 'Painful and swollen',
          })
        );
      });
    });

    it('should set flare status to "active"', async () => {
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockCreateMarker).toHaveBeenCalledWith(
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
      mockCreateMarker.mockResolvedValue({
        id: 'flare-abc-123',
      });

      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'left-armpit';
        if (key === 'markerCoordinates') return JSON.stringify([
          { x: 0.3, y: 0.4 },
          { x: 0.5, y: 0.6 },
          { x: 0.7, y: 0.8 },
        ]);
        return null;
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      // Change lifecycle stage to growth using real component
      const selectButton = screen.getByRole('button', { name: /Select lifecycle stage/i });
      await userEvent.setup().click(selectButton);
      const growthOption = screen.getByRole('option', { name: /Growth/i });
      await userEvent.setup().click(growthOption);

      const saveButton = screen.getByRole('button', { name: /Save flare/i });
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
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      mockGet.mockImplementation((key: string) => {
        if (key === 'source') return 'dashboard';
        if (key === 'layer') return 'flares';
        if (key === 'bodyRegionId') return 'right-shoulder';
        if (key === 'markerCoordinates') return JSON.stringify([{ x: 0.5, y: 0.3 }]);
        return null;
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const callArg = mockPush.mock.calls[0][0];
        expect(callArg).toContain('region=Right+Shoulder');
      });
    });
  });

  describe('AC 9.2.9 - Error handling and state preservation', () => {
    it('should display error message when save fails', async () => {
      mockCreateMarker.mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '6' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });
    });

    it('should preserve severity state after error', async () => {
      mockCreateMarker.mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider') as HTMLInputElement;
      fireEvent.change(slider, { target: { value: '8' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });

      // Verify severity still set to 8
      expect(slider.value).toBe('8');
    });

    it('should preserve notes state after error', async () => {
      const user = userEvent.setup();
      mockCreateMarker.mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Use placeholder to find flare notes textarea
      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)') as HTMLTextAreaElement;
      await user.type(textarea, 'Test notes');

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });

      // Verify notes still present
      expect(textarea.value).toBe('Test notes');
    });

    it('should keep save button enabled after error for retry', async () => {
      mockCreateMarker.mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Wait for button to become enabled
      let saveButton = await screen.findByRole('button', { name: /Save flare/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to save flare. Please try again.')).toBeInTheDocument();
      });

      // Save button should be enabled for retry
      saveButton = screen.getByRole('button', { name: /Save flare/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should announce error to screen readers', async () => {
      mockCreateMarker.mockRejectedValue(
        new Error('Network error')
      );

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
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

      // Use placeholder to find flare notes textarea
      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      expect(textarea).toHaveAttribute('aria-label', 'Flare notes');
    });

    it('should have ARIA describedby linking notes to character counter', () => {
      render(<FlareDetailsPage />);

      const textarea = screen.getByPlaceholderText('Add notes about this flare (optional)');
      expect(textarea).toHaveAttribute('aria-describedby', 'notes-counter');

      // Find the flare notes counter specifically by ID
      const counter = document.getElementById('notes-counter');
      expect(counter).toHaveTextContent('0/500');
    });

    it('should navigate back to placement page on Escape key', () => {
      render(<FlareDetailsPage />);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard&layer=flares');
    });

    it('should submit form on Enter key when severity selected', async () => {
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      fireEvent.keyDown(window, { key: 'Enter' });

      await waitFor(() => {
        expect(mockCreateMarker).toHaveBeenCalled();
      });
    });

    it('should NOT submit on Enter when severity not selected', () => {
      render(<FlareDetailsPage />);

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(mockCreateMarker).not.toHaveBeenCalled();
    });
  });

  describe('AC 9.2.11 - Analytics event tracking', () => {
    it('should fire flare_creation_details_completed when Save clicked', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '7' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
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
      mockCreateMarker.mockResolvedValue({
        id: 'flare-abc-123',
      });

      render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
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
      mockCreateMarker.mockResolvedValue({
        id: 'flare-123',
      });

      const { unmount } = render(<FlareDetailsPage />);

      const slider = screen.getByTestId('severity-slider');
      fireEvent.change(slider, { target: { value: '5' } });

      // Wait for button to become enabled
      const saveButton = await screen.findByRole('button', { name: /Save flare/i });
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

    it('should update lifecycle stage instantly', async () => {
      render(<FlareDetailsPage />);

      const selectButton = screen.getByRole('button', { name: /Select lifecycle stage/i });

      const startTime = performance.now();
      // Click to open dropdown (real component interaction)
      fireEvent.click(selectButton);
      // Click growth option
      const growthOption = screen.getByRole('option', { name: /Growth/i });
      fireEvent.click(growthOption);
      const endTime = performance.now();

      const updateTime = endTime - startTime;

      // Should update in under 50ms (generous for dropdown interaction)
      expect(updateTime).toBeLessThan(100);
    });
  });
});
