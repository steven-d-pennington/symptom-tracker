import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlareMarkers } from '../FlareMarkers';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const mockPush = jest.fn();

// Mock dependencies
jest.mock('@/lib/hooks/useFlares', () => ({
  __esModule: true,
  useFlares: jest.fn(),
}));
const { useFlares: mockedUseFlares } = jest.requireMock('@/lib/hooks/useFlares') as {
  useFlares: jest.Mock;
};

const routerContext = {
  push: mockPush,
  replace: jest.fn(),
  refresh: jest.fn(),
  forward: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
};

const renderWithRouter = (ui: React.ReactElement) =>
  render(<AppRouterContext.Provider value={routerContext}>{ui}</AppRouterContext.Provider>);

describe.skip('FlareMarkers', () => {
  const defaultProps = {
    viewType: 'front' as const,
    zoomLevel: 1,
    userId: 'test-user-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockReset();
    routerContext.replace.mockReset();
    routerContext.refresh.mockReset();
    routerContext.forward.mockReset();
    routerContext.back.mockReset();
    routerContext.prefetch.mockReset();
  });

  describe('AC1.1: Active flares display as colored markers', () => {
    it('renders correct number of markers for active flares', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-1',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Test Symptom 1',
            startDate: new Date(),
            severity: 7,
            bodyRegions: ['left-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
          {
            id: 'flare-2',
            userId: 'test-user-123',
            symptomId: 'symptom-2',
            symptomName: 'Test Symptom 2',
            startDate: new Date(),
            severity: 5,
            bodyRegions: ['center-groin'],
            status: 'improving',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'improving',
          },
          {
            id: 'flare-3',
            userId: 'test-user-123',
            symptomId: 'symptom-3',
            symptomName: 'Test Symptom 3',
            startDate: new Date(),
            severity: 8,
            bodyRegions: ['right-groin'],
            status: 'worsening',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'worsening',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      });

      renderWithRouter(<FlareMarkers {...defaultProps} />);

      const markers = screen.getAllByRole('button');
      expect(markers).toHaveLength(3);
    });
  });

  describe('AC1.2: Marker color indicates flare status', () => {
    it('displays correct colors based on status', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-active',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Active Flare',
            startDate: new Date(),
            severity: 7,
            bodyRegions: ['left-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
          {
            id: 'flare-improving',
            userId: 'test-user-123',
            symptomId: 'symptom-2',
            symptomName: 'Improving Flare',
            startDate: new Date(),
            severity: 4,
            bodyRegions: ['center-groin'],
            status: 'improving',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'improving',
          },
          {
            id: 'flare-worsening',
            userId: 'test-user-123',
            symptomId: 'symptom-3',
            symptomName: 'Worsening Flare',
            startDate: new Date(),
            severity: 9,
            bodyRegions: ['right-groin'],
            status: 'worsening',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'worsening',
          },
          {
            id: 'flare-resolved',
            userId: 'test-user-123',
            symptomId: 'symptom-4',
            symptomName: 'Resolved Flare',
            startDate: new Date(),
            endDate: new Date(),
            severity: 2,
            bodyRegions: ['armpit-left'],
            status: 'resolved',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'improving',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      });

      const { container } = renderWithRouter(<FlareMarkers {...defaultProps} />);

      const activeMarker = container.querySelector('[data-testid="flare-marker-flare-active"]');
      const improvingMarker = container.querySelector('[data-testid="flare-marker-flare-improving"]');
      const worseningMarker = container.querySelector('[data-testid="flare-marker-flare-worsening"]');
      const resolvedMarker = container.querySelector('[data-testid="flare-marker-flare-resolved"]');

      expect(activeMarker).toHaveClass('fill-red-500');
      expect(improvingMarker).toHaveClass('fill-yellow-400');
      expect(worseningMarker).toHaveClass('fill-orange-500');
      expect(resolvedMarker).toHaveClass('fill-gray-400');
    });
  });

  describe('AC1.3: Multiple flares in same region display without overlap', () => {
    it('offsets markers when multiple flares in same region', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-1',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Flare 1',
            startDate: new Date(),
            severity: 7,
            bodyRegions: ['left-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
          {
            id: 'flare-2',
            userId: 'test-user-123',
            symptomId: 'symptom-2',
            symptomName: 'Flare 2',
            startDate: new Date(),
            severity: 6,
            bodyRegions: ['left-groin'],
            status: 'improving',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'improving',
          },
          {
            id: 'flare-3',
            userId: 'test-user-123',
            symptomId: 'symptom-3',
            symptomName: 'Flare 3',
            startDate: new Date(),
            severity: 8,
            bodyRegions: ['left-groin'],
            status: 'worsening',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'worsening',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      });

      const { container } = render(<FlareMarkers {...defaultProps} />);

      const marker1 = container.querySelector('[data-testid="flare-marker-flare-1"]');
      const marker2 = container.querySelector('[data-testid="flare-marker-flare-2"]');
      const marker3 = container.querySelector('[data-testid="flare-marker-flare-3"]');

      // Get cx/cy coordinates
      const cx1 = marker1?.getAttribute('cx');
      const cy1 = marker1?.getAttribute('cy');
      const cx2 = marker2?.getAttribute('cx');
      const cy2 = marker2?.getAttribute('cy');
      const cx3 = marker3?.getAttribute('cx');
      const cy3 = marker3?.getAttribute('cy');

      // Verify coordinates are different (markers are offset)
      expect(cx1).not.toBe(cx2);
      expect(cy1).not.toBe(cy2);
      expect(cx2).not.toBe(cx3);
      expect(cy2).not.toBe(cy3);
    });
  });

  describe('AC1.5: Tapping marker opens flare detail view', () => {
    it('navigates to flare detail page on click', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-123',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Test Flare',
            startDate: new Date(),
            severity: 7,
            bodyRegions: ['left-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      });

      renderWithRouter(<FlareMarkers {...defaultProps} />);

      const marker = screen.getByRole('button', { name: /Test Flare flare - active/i });
      fireEvent.click(marker);

      expect(mockPush).toHaveBeenCalledWith('/flares/flare-123');
    });

    it('has proper ARIA label and role', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-123',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Test Symptom',
            startDate: new Date(),
            severity: 7,
            bodyRegions: ['left-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<FlareMarkers {...defaultProps} />);

      const marker = screen.getByRole('button');
      expect(marker).toHaveAttribute('aria-label', 'Test Symptom flare - active');
      expect(marker).toHaveAttribute('role', 'button');
      expect(marker).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('AC1.7: Markers scale with zoom level', () => {
    it('scales marker size inversely with zoom', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-1',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Test Flare',
            startDate: new Date(),
            severity: 7,
            bodyRegions: ['left-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
        ],
        isLoading: false,
        isError: false,
        error: null,
      });

      // Test at zoom level 1
      const { container: container1, rerender } = renderWithRouter(<FlareMarkers {...defaultProps} zoomLevel={1} />);
      const marker1 = container1.querySelector('circle');
      const radius1 = parseFloat(marker1?.getAttribute('r') || '0');
      expect(radius1).toBeCloseTo(8, 1); // 8 / sqrt(1) = 8

      // Test at zoom level 2
      rerender(
        <AppRouterContext.Provider value={routerContext}>
          <FlareMarkers {...defaultProps} zoomLevel={2} />
        </AppRouterContext.Provider>
      );
      const marker2 = container1.querySelector('circle');
      const radius2 = parseFloat(marker2?.getAttribute('r') || '0');
      expect(radius2).toBeCloseTo(5.66, 1); // 8 / sqrt(2) ≈ 5.66

      // Test at zoom level 3
      rerender(
        <AppRouterContext.Provider value={routerContext}>
          <FlareMarkers {...defaultProps} zoomLevel={3} />
        </AppRouterContext.Provider>
      );
      const marker3 = container1.querySelector('circle');
      const radius3 = parseFloat(marker3?.getAttribute('r') || '0');
      expect(radius3).toBeCloseTo(4.62, 1); // 8 / sqrt(3) ≈ 4.62
    });
  });

  describe('Loading and error states', () => {
    it('renders nothing when loading', () => {
      mockedUseFlares.mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = renderWithRouter(<FlareMarkers {...defaultProps} />);
      expect(container.querySelector('g')).not.toBeInTheDocument();
    });

    it('renders nothing when no flares', () => {
      mockedUseFlares.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      });

      const { container } = renderWithRouter(<FlareMarkers {...defaultProps} />);
      expect(container.querySelector('g')).not.toBeInTheDocument();
    });
  });
});
