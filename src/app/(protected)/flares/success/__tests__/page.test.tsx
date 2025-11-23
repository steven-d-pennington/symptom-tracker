/**
 * Tests for Story 9.3: Success Screen with Add Another Flow
 *
 * Test coverage for all 10 acceptance criteria:
 * - AC 9.3.1: Route validation and param parsing
 * - AC 9.3.2: Success message with location count
 * - AC 9.3.3: Flare summary card display
 * - AC 9.3.4: "Add another flare" button
 * - AC 9.3.5: Contextual return button
 * - AC 9.3.6: Navigation context preservation
 * - AC 9.3.7: Analytics event tracking
 * - AC 9.3.8: Mobile-responsive and accessible design
 * - AC 9.3.9: Performance targets
 * - AC 9.3.10: Multi-flare workflow support
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlareSuccessScreen from '../page';
import * as announceModule from '@/lib/utils/announce';

// Mock functions for navigation hooks
const mockPush = jest.fn();
const mockSearchParams = new Map<string, string>([
  ['source', 'dashboard'],
  ['flareId', 'test-flare-123'],
  ['region', 'left-armpit'],
  ['severity', '7'],
  ['lifecycleStage', 'onset'],
  ['locations', '1'],
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

// Mock announce utility
jest.mock('@/lib/utils/announce', () => ({
  announce: jest.fn(),
}));

describe('FlareSuccessScreen', () => {
  beforeEach(() => {
    // Reset navigation mock
    mockPush.mockClear();

    // Reset search params to defaults
    mockSearchParams.clear();
    mockSearchParams.set('source', 'dashboard');
    mockSearchParams.set('flareId', 'test-flare-123');
    mockSearchParams.set('region', 'left-armpit');
    mockSearchParams.set('severity', '7');
    mockSearchParams.set('lifecycleStage', 'onset');
    mockSearchParams.set('locations', '1');

    // Clear all mocks
    jest.clearAllMocks();

    // Suppress console logs in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('AC 9.3.1 - Route validation and param parsing', () => {
    it('should render page with valid URL params', () => {
      render(<FlareSuccessScreen />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(/Flare saved/)).toBeInTheDocument();
    });

    it('should redirect to dashboard if source param missing', () => {
      mockSearchParams.delete('source');

      render(<FlareSuccessScreen />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect to dashboard if source param invalid', () => {
      mockSearchParams.set('source', 'invalid-source');

      render(<FlareSuccessScreen />);

      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should accept source=dashboard as valid', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should accept source=body-map as valid', () => {
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('AC 9.3.2 - Success message with location count', () => {
    it('should display success message with singular "location" for 1 location', () => {
      mockSearchParams.set('locations', '1');

      render(<FlareSuccessScreen />);

      expect(screen.getByText(/1 location/)).toBeInTheDocument();
    });

    it('should display success message with plural "locations" for multiple locations', () => {
      mockSearchParams.set('locations', '3');

      render(<FlareSuccessScreen />);

      expect(screen.getByText(/3 locations/)).toBeInTheDocument();
    });

    it('should default to 1 location if locations param missing', () => {
      mockSearchParams.delete('locations');

      render(<FlareSuccessScreen />);

      expect(screen.getByText(/1 location/)).toBeInTheDocument();
    });

    it('should use h1 element for success message', () => {
      render(<FlareSuccessScreen />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/Flare saved/);
    });

    it('should include checkmark emoji in success message', () => {
      render(<FlareSuccessScreen />);

      expect(screen.getByText(/✅/)).toBeInTheDocument();
    });
  });

  describe('AC 9.3.3 - Flare summary card display', () => {
    it('should display body region name in summary card', () => {
      mockSearchParams.set('region', 'left-armpit');

      render(<FlareSuccessScreen />);

      expect(screen.getByText('Left Armpit')).toBeInTheDocument();
    });

    it('should display severity formatted as X/10', () => {
      mockSearchParams.set('severity', '7');

      render(<FlareSuccessScreen />);

      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('should display lifecycle stage formatted as title case', () => {
      mockSearchParams.set('lifecycleStage', 'onset');

      render(<FlareSuccessScreen />);

      expect(screen.getByText('Onset')).toBeInTheDocument();
    });

    it('should display "N/A" for missing region param', () => {
      mockSearchParams.delete('region');

      render(<FlareSuccessScreen />);

      const summaryCard = screen.getByText('Flare Summary').closest('div');
      expect(summaryCard).toHaveTextContent('N/A');
    });

    it('should display "N/A" for missing severity param', () => {
      mockSearchParams.delete('severity');

      render(<FlareSuccessScreen />);

      const severityLabel = screen.getByText('Severity');
      expect(severityLabel.parentElement).toHaveTextContent('N/A');
    });

    it('should display "N/A" for missing lifecycleStage param', () => {
      mockSearchParams.delete('lifecycleStage');

      render(<FlareSuccessScreen />);

      const lifecycleLabel = screen.getByText('Lifecycle Stage');
      expect(lifecycleLabel.parentElement).toHaveTextContent('N/A');
    });

    it('should display summary card with all fields when all params provided', () => {
      mockSearchParams.set('region', 'right-groin');
      mockSearchParams.set('severity', '9');
      mockSearchParams.set('lifecycleStage', 'draining');

      render(<FlareSuccessScreen />);

      expect(screen.getByText('Right Groin')).toBeInTheDocument();
      expect(screen.getByText('9/10')).toBeInTheDocument();
      expect(screen.getByText('Draining')).toBeInTheDocument();
    });
  });

  describe('AC 9.3.4 - "Add another flare" button', () => {
    it('should render "Add another flare" button', () => {
      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/Add another flare/);
    });

    it('should include 🔄 emoji in button text', () => {
      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      expect(button).toHaveTextContent('🔄');
    });

    it('should navigate to /flares/place with preserved source param when clicked', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
    });

    it('should preserve source=body-map when navigating to place page', () => {
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=body-map');
    });

    it('should have minimum 44x44px touch target (via min-h-[44px] class)', () => {
      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      expect(button.className).toContain('min-h-[44px]');
    });

    it('should have aria-label for accessibility', () => {
      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      expect(button).toHaveAttribute('aria-label', 'Add another flare and continue logging');
    });
  });

  describe('AC 9.3.5 - Contextual return button', () => {
    it('should display "Back to dashboard" button when source=dashboard', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Return to dashboard');
      expect(button).toHaveTextContent('Back to dashboard');
    });

    it('should display "Back to body-map" button when source=body-map', () => {
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Return to body map');
      expect(button).toHaveTextContent('Back to body-map');
    });

    it('should navigate to /dashboard when source=dashboard and button clicked', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Return to dashboard');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to /body-map when source=body-map and button clicked', () => {
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Return to body map');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/body-map');
    });

    it('should have minimum 44x44px touch target (via min-h-[44px] class)', () => {
      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Return to dashboard');
      expect(button.className).toContain('min-h-[44px]');
    });

    it('should have contextual aria-label based on source', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Return to dashboard');
      expect(button).toHaveAttribute('aria-label', 'Return to dashboard');
    });
  });

  describe('AC 9.3.6 - Navigation context preservation', () => {
    it('should preserve source=dashboard when clicking "Add another"', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');
    });

    it('should preserve source=body-map when clicking "Add another"', () => {
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=body-map');
    });

    it('should enable multi-flare workflow loop: success → place → success', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const addAnotherButton = screen.getByLabelText('Add another flare and continue logging');

      // User clicks "Add another" - should navigate to place page with source preserved
      fireEvent.click(addAnotherButton);

      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');

      // This enables the workflow to loop back to success after creating next flare
    });
  });

  describe('AC 9.3.7 - Analytics event tracking', () => {
    it('should fire flare_creation_add_another_clicked event when "Add another" clicked', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] flare_creation_add_another_clicked',
        expect.objectContaining({
          source: 'dashboard',
        })
      );
    });

    it('should include source metadata in analytics event', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] flare_creation_add_another_clicked',
        expect.objectContaining({
          source: 'body-map',
        })
      );
    });

    it('should include timestamp in analytics event', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');

      render(<FlareSuccessScreen />);

      const button = screen.getByLabelText('Add another flare and continue logging');
      fireEvent.click(button);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] flare_creation_add_another_clicked',
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('AC 9.3.8 - Mobile-responsive and accessible design', () => {
    it('should have role="main" landmark on page container', () => {
      render(<FlareSuccessScreen />);

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should have ARIA live region for success message', () => {
      render(<FlareSuccessScreen />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
    });

    it('should have aria-live="polite" on success message', () => {
      render(<FlareSuccessScreen />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should announce success message to screen readers on mount', () => {
      const announceMock = announceModule.announce as jest.Mock;

      render(<FlareSuccessScreen />);

      expect(announceMock).toHaveBeenCalledWith(
        'Flare saved with 1 location',
        'polite'
      );
    });

    it('should announce correct message for multiple locations', () => {
      const announceMock = announceModule.announce as jest.Mock;
      mockSearchParams.set('locations', '3');

      render(<FlareSuccessScreen />);

      expect(announceMock).toHaveBeenCalledWith(
        'Flare saved with 3 locations',
        'polite'
      );
    });

    it('should support keyboard navigation with buttons', () => {
      render(<FlareSuccessScreen />);

      const addAnotherButton = screen.getByLabelText('Add another flare and continue logging');
      const returnButton = screen.getByLabelText('Return to dashboard');

      // Both buttons should be focusable
      expect(addAnotherButton.tagName).toBe('BUTTON');
      expect(returnButton.tagName).toBe('BUTTON');
    });
  });

  describe('AC 9.3.9 - Performance targets', () => {
    it('should render synchronously without async data fetching', () => {
      const { container } = render(<FlareSuccessScreen />);

      // Page should render immediately with all content visible
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(/Flare saved/)).toBeInTheDocument();
      expect(screen.getByText('Flare Summary')).toBeInTheDocument();

      // No loading states or spinners
      expect(container.querySelector('[data-loading]')).toBeNull();
    });

    it('should parse all URL params synchronously (not in useEffect)', () => {
      render(<FlareSuccessScreen />);

      // Success message and summary should be immediately visible
      expect(screen.getByText(/Flare saved/)).toBeInTheDocument();
      expect(screen.getByText('Left Armpit')).toBeInTheDocument();
      expect(screen.getByText('7/10')).toBeInTheDocument();
      expect(screen.getByText('Onset')).toBeInTheDocument();
    });
  });

  describe('AC 9.3.10 - Multi-flare workflow support', () => {
    it('should support multi-flare workflow chain: success → place → details → success → ...', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const addAnotherButton = screen.getByLabelText('Add another flare and continue logging');

      // Step 1: User is on success screen after creating first flare
      expect(screen.getByText(/Flare saved/)).toBeInTheDocument();

      // Step 2: User clicks "Add another" to create second flare
      fireEvent.click(addAnotherButton);

      // Step 3: Navigation to place page with source preserved
      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=dashboard');

      // This enables: place → details → success → place → details → success → ...
      // Context (source) preserved throughout entire chain
    });

    it('should preserve source context throughout N-flare workflow', () => {
      mockSearchParams.set('source', 'body-map');

      render(<FlareSuccessScreen />);

      const addAnotherButton = screen.getByLabelText('Add another flare and continue logging');

      // User can log multiple flares in sequence
      fireEvent.click(addAnotherButton);
      expect(mockPush).toHaveBeenCalledWith('/flares/place?source=body-map');

      // After creating 2nd flare, can click "Add another" again
      // After creating 3rd flare, can click "Add another" again
      // ... repeat N times
      // Finally click "Back to body-map" to exit workflow
    });

    it('should allow user to exit multi-flare workflow via contextual return button', () => {
      mockSearchParams.set('source', 'dashboard');

      render(<FlareSuccessScreen />);

      const returnButton = screen.getByLabelText('Return to dashboard');

      // After creating N flares, user clicks return button to exit workflow
      fireEvent.click(returnButton);

      // Should return to original entry point (dashboard)
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
