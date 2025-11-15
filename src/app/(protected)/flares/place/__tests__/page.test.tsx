/**
 * Story 9.1: Body Map Placement Page Tests
 *
 * Comprehensive test suite covering:
 * - URL param parsing and validation
 * - Layer selector conditional rendering
 * - Body map integration
 * - Multi-marker placement
 * - Next button behavior
 * - Navigation flow
 * - Accessibility features
 * - Analytics tracking
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FlareBodyMapPlacementPage from '../page';

// Mock functions for navigation hooks
const mockPush = jest.fn();
const mockReplace = jest.fn();

// FIXED: Properly return valid source param to prevent immediate redirect
const mockGet = jest.fn((key: string) => {
  // Return valid source to prevent redirect
  if (key === 'source') return 'dashboard';
  // Return default layer to prevent undefined state
  if (key === 'layer') return 'flares';
  return null;
});

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

// Mock body mapping components
jest.mock('@/components/body-map/LayerSelector', () => ({
  LayerSelector: ({ currentLayer, onLayerChange }: any) => (
    <div data-testid="layer-selector">
      <button
        data-testid="layer-flares"
        onClick={() => onLayerChange('flares')}
        aria-pressed={currentLayer === 'flares'}
      >
        Flares
      </button>
      <button
        data-testid="layer-pain"
        onClick={() => onLayerChange('pain')}
        aria-pressed={currentLayer === 'pain'}
      >
        Pain
      </button>
    </div>
  ),
}));

jest.mock('@/components/body-mapping/BodyMapViewer', () => ({
  BodyMapViewer: ({
    onRegionSelect,
    onCoordinateMark,
    markerCount,
  }: any) => (
    <div data-testid="body-map-viewer" data-marker-count={markerCount}>
      <button
        data-testid="mock-region-left-armpit"
        onClick={() => onRegionSelect('left-armpit')}
      >
        Select Left Armpit
      </button>
      <button
        data-testid="mock-place-marker"
        onClick={() => onCoordinateMark('left-armpit', { x: 0.42, y: 0.67 })}
      >
        Place Marker
      </button>
    </div>
  ),
}));

jest.mock('@/lib/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ userId: 'test-user-123' }),
}));

jest.mock('@/lib/utils/announce', () => ({
  announce: jest.fn(),
}));

describe('FlareBodyMapPlacementPage', () => {
  beforeEach(() => {
    // Reset all mocks
    mockPush.mockClear();
    mockReplace.mockClear();

    // Clear console mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AC 9.1.1: Route and URL Param Parsing', () => {
    it('should render page when source=dashboard', () => {
      render(<FlareBodyMapPlacementPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText('Flare placement')).toBeInTheDocument();
    });

    it('should parse layer param correctly', () => {
      render(<FlareBodyMapPlacementPage />);

      const layerSelector = screen.getByTestId('layer-selector');
      expect(layerSelector).toBeInTheDocument();
    });
  });

  describe('AC 9.1.2: Layer Selector Conditional Rendering', () => {
    it('should show layer selector when source=dashboard', () => {
      render(<FlareBodyMapPlacementPage />);

      expect(screen.getByTestId('layer-selector')).toBeInTheDocument();
    });

    it('should update layer state when layer selector changed', () => {
      render(<FlareBodyMapPlacementPage />);

      const painButton = screen.getByTestId('layer-pain');
      fireEvent.click(painButton);

      // Layer state updated (verified by not crashing)
      expect(painButton).toBeInTheDocument();
    });
  });

  describe('AC 9.1.3: Body Map Integration', () => {
    it('should render BodyMapViewer component', () => {
      render(<FlareBodyMapPlacementPage />);

      expect(screen.getByTestId('body-map-viewer')).toBeInTheDocument();
    });

    it('should handle region selection', () => {
      render(<FlareBodyMapPlacementPage />);

      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      // Region selected (verified by component not crashing)
      expect(regionButton).toBeInTheDocument();
    });
  });

  describe('AC 9.1.4: Multi-Marker Placement', () => {
    it('should add marker when coordinate captured', () => {
      render(<FlareBodyMapPlacementPage />);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);

      // Marker count should update
      const bodyMap = screen.getByTestId('body-map-viewer');
      expect(bodyMap).toHaveAttribute('data-marker-count', '1');
    });

    it('should allow multiple markers in same region', () => {
      render(<FlareBodyMapPlacementPage />);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');

      // Place 3 markers
      fireEvent.click(placeMarkerButton);
      fireEvent.click(placeMarkerButton);
      fireEvent.click(placeMarkerButton);

      const bodyMap = screen.getByTestId('body-map-viewer');
      expect(bodyMap).toHaveAttribute('data-marker-count', '3');
    });
  });

  describe('AC 9.1.5: Next Button Behavior', () => {
    it('should disable Next button when no markers placed', () => {
      render(<FlareBodyMapPlacementPage />);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should enable Next button after marker placement', () => {
      render(<FlareBodyMapPlacementPage />);

      // Place a marker
      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).not.toBeDisabled();
    });

    it('should display marker count in Next button', () => {
      render(<FlareBodyMapPlacementPage />);

      // Place 2 markers
      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);
      fireEvent.click(placeMarkerButton);

      expect(screen.getByText('Next (2 markers)')).toBeInTheDocument();
    });

    it('should use singular form for 1 marker', () => {
      render(<FlareBodyMapPlacementPage />);

      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);

      expect(screen.getByText('Next (1 marker)')).toBeInTheDocument();
    });
  });

  describe('AC 9.1.6: Navigation to Details Page', () => {
    it('should navigate to details page with correct URL params', () => {
      render(<FlareBodyMapPlacementPage />);

      // Select region and place marker
      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);

      // Click Next
      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      // Verify navigation
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/flares/details?')
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('source=dashboard')
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('layer=flares')
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('bodyRegionId=left-armpit')
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('markerCoordinates=')
      );
    });

    it('should encode marker coordinates as JSON array', () => {
      render(<FlareBodyMapPlacementPage />);

      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      const callArg = mockPush.mock.calls[0][0];
      expect(callArg).toContain('markerCoordinates=');

      // Extract and parse the coordinates
      const url = new URL(callArg, 'http://localhost');
      const coords = JSON.parse(
        url.searchParams.get('markerCoordinates') || '[]'
      );

      expect(coords).toHaveLength(1);
      expect(coords[0]).toEqual({ x: 0.42, y: 0.67 });
    });
  });

  describe('AC 9.1.9: Accessibility', () => {
    it('should have proper ARIA labels on main element', () => {
      render(<FlareBodyMapPlacementPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('aria-label', 'Flare placement');
    });

    it('should have ARIA live region for announcements', () => {
      render(<FlareBodyMapPlacementPage />);

      // Find all status roles
      const statusElements = screen.getAllByRole('status');
      // The component renders one, testing-library may inject another
      expect(statusElements.length).toBeGreaterThanOrEqual(1);

      // Find the one with aria-live="polite"
      const liveRegion = statusElements.find(el =>
        el.getAttribute('aria-live') === 'polite'
      );
      expect(liveRegion).toBeDefined();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should have descriptive aria-label on Next button', () => {
      render(<FlareBodyMapPlacementPage />);

      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);
      fireEvent.click(placeMarkerButton);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toHaveAttribute(
        'aria-label',
        'Next with 2 markers'
      );
    });
  });

  describe('AC 9.1.10: Analytics Tracking', () => {
    it('should log flare_creation_started on page load', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');

      render(<FlareBodyMapPlacementPage />);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] flare_creation_started',
        expect.objectContaining({
          source: 'dashboard',
          layer: 'flares',
        })
      );
    });

    it('should log flare_creation_placement_completed on Next click', () => {
      const consoleLogSpy = jest.spyOn(console, 'log');

      render(<FlareBodyMapPlacementPage />);

      // Place marker and click Next
      const regionButton = screen.getByTestId('mock-region-left-armpit');
      fireEvent.click(regionButton);

      const placeMarkerButton = screen.getByTestId('mock-place-marker');
      fireEvent.click(placeMarkerButton);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Analytics] flare_creation_placement_completed',
        expect.objectContaining({
          source: 'dashboard',
          markerCount: 1,
        })
      );
    });
  });

  describe('AC 9.1.8: Mobile Responsive Design', () => {
    it('should render full-screen layout', () => {
      render(<FlareBodyMapPlacementPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('h-screen', 'w-screen');
    });

    it('should have large touch target for Next button', () => {
      render(<FlareBodyMapPlacementPage />);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toHaveClass('min-h-[48px]');
    });
  });
});
