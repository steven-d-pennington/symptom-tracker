import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LayerType } from '@/lib/db/schema';

// Mock useBodyMapMarkers hook
const mockUseBodyMapMarkers = jest.fn();
jest.mock('@/lib/hooks/useBodyMapMarkers', () => ({
  useBodyMapMarkers: mockUseBodyMapMarkers,
}));

// Import component AFTER mocks
import { LayerAwareBodyMap } from '../LayerAwareBodyMap';

describe('LayerAwareBodyMap', () => {
  const defaultProps = {
    userId: 'test-user-123',
    initialLayer: 'flares' as LayerType,
  };

  const mockMarkers = [
    {
      id: 'marker-1',
      userId: 'test-user-123',
      bodyRegionId: 'chest',
      layer: 'flares' as LayerType,
      severity: 7,
      coordinates: { x: 0.5, y: 0.3 },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: 'marker-2',
      userId: 'test-user-123',
      bodyRegionId: 'chest',
      layer: 'flares' as LayerType,
      severity: 5,
      coordinates: { x: 0.5, y: 0.3 },
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC5.4.5: Layer-filtered marker queries', () => {
    it('uses useBodyMapMarkers hook with correct layer', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<LayerAwareBodyMap {...defaultProps} />);

      expect(mockUseBodyMapMarkers).toHaveBeenCalledWith(
        'test-user-123',
        'flares'
      );
    });

    it('renders markers returned from hook', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<LayerAwareBodyMap {...defaultProps} />);

      const markers = container.querySelectorAll('[data-testid^="body-map-marker-"]');
      expect(markers).toHaveLength(2);
    });

    it('displays marker count', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<LayerAwareBodyMap {...defaultProps} />);

      expect(screen.getByText('2 markers found')).toBeInTheDocument();
    });
  });

  describe('AC5.4.9: Real-time marker updates', () => {
    it('refetches markers when layer changes', async () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { rerender } = render(<LayerAwareBodyMap {...defaultProps} />);

      // Initial call with 'flares'
      expect(mockUseBodyMapMarkers).toHaveBeenCalledWith('test-user-123', 'flares');

      // Clear mock to track new calls
      mockUseBodyMapMarkers.mockClear();

      // Update mock for pain layer
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      // Change layer by clicking LayerSelector
      const painButton = screen.getByRole('radio', { name: /pain layer/i });
      fireEvent.click(painButton);

      await waitFor(() => {
        expect(mockUseBodyMapMarkers).toHaveBeenCalledWith('test-user-123', 'pain');
      });
    });

    it('shows updated marker count after layer change', async () => {
      // Start with flares (2 markers)
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { rerender } = render(<LayerAwareBodyMap {...defaultProps} />);

      expect(screen.getByText('2 markers found')).toBeInTheDocument();

      // Switch to pain (0 markers)
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const painButton = screen.getByRole('radio', { name: /pain layer/i });
      fireEvent.click(painButton);

      await waitFor(() => {
        expect(screen.getByText('0 markers found')).toBeInTheDocument();
      });
    });
  });

  describe('AC5.4.4: Smart overlap prevention', () => {
    it('applies circular offsets to overlapping markers', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers, // Both markers in same region
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<LayerAwareBodyMap {...defaultProps} />);

      const marker1 = container.querySelector('[data-testid="body-map-marker-marker-1"]');
      const marker2 = container.querySelector('[data-testid="body-map-marker-marker-2"]');

      // Get transform attributes (contains offset coordinates)
      const transform1 = marker1?.getAttribute('transform');
      const transform2 = marker2?.getAttribute('transform');

      // Markers should have different transforms (offsets applied)
      expect(transform1).toBeTruthy();
      expect(transform2).toBeTruthy();
      expect(transform1).not.toBe(transform2);
    });
  });

  describe('Integration: LayerSelector + useBodyMapMarkers + BodyMapMarker', () => {
    it('renders complete integration pipeline', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: mockMarkers,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<LayerAwareBodyMap {...defaultProps} />);

      // Verify LayerSelector is rendered
      expect(screen.getByRole('radiogroup', { name: /layer selector/i })).toBeInTheDocument();

      // Verify BodyMapMarkers are rendered
      const markers = container.querySelectorAll('[data-testid^="body-map-marker-"]');
      expect(markers).toHaveLength(2);

      // Verify SVG body map is rendered
      expect(screen.getByTestId('layer-aware-body-map')).toBeInTheDocument();
    });
  });

  describe('Loading and error states', () => {
    it('shows loading state', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [],
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<LayerAwareBodyMap {...defaultProps} />);

      expect(screen.getByText('Loading markers...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [],
        isLoading: false,
        error: new Error('Network error'),
        refetch: jest.fn(),
      });

      render(<LayerAwareBodyMap {...defaultProps} />);

      expect(screen.getByText(/Error loading markers: Network error/)).toBeInTheDocument();
    });

    it('shows empty state when no markers', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<LayerAwareBodyMap {...defaultProps} />);

      expect(screen.getByText('No flares markers found')).toBeInTheDocument();
    });
  });

  describe('BodyMapMarker rendering', () => {
    it('renders BodyMapMarker with correct props', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [mockMarkers[0]],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<LayerAwareBodyMap {...defaultProps} />);

      const marker = container.querySelector('[data-testid="body-map-marker-marker-1"]');

      // Verify BodyMapMarker attributes
      expect(marker).toHaveAttribute('role', 'button');
      expect(marker).toHaveAttribute('aria-label', 'Flares marker, severity 7');
      expect(marker).toHaveAttribute('tabIndex', '0');
    });

    it('renders markers with layer-specific icons and colors', () => {
      mockUseBodyMapMarkers.mockReturnValue({
        markers: [mockMarkers[0]],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(<LayerAwareBodyMap {...defaultProps} />);

      // Verify flare icon is rendered
      const icon = container.querySelector('text');
      expect(icon?.textContent).toBe('🔥'); // Flare icon from LAYER_CONFIG

      // Verify layer color is applied
      const circle = container.querySelector('circle[class*="fill-red-500"]');
      expect(circle).toBeInTheDocument();
    });
  });
});
