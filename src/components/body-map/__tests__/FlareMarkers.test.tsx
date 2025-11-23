import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockBack = jest.fn();
const mockForward = jest.fn();
const mockPrefetch = jest.fn();

// Mock next/navigation - must be before component import
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
    back: mockBack,
    forward: mockForward,
    prefetch: mockPrefetch,
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock dependencies
jest.mock('@/lib/hooks/useFlares', () => ({
  __esModule: true,
  useFlares: jest.fn(),
}));

// Mock coordinates utilities
jest.mock('@/lib/utils/coordinates', () => ({
  denormalizeCoordinates: jest.fn(({ x, y }) => ({ x: x * 100, y: y * 100 })),
  getRegionBounds: jest.fn(() => ({ x: 0, y: 0, width: 100, height: 100 })),
}));

// Mock body regions data
jest.mock('@/lib/data/bodyRegions', () => ({
  getRegionsForView: jest.fn(() => [
    { id: 'left-groin', center: { x: 50, y: 50 } },
    { id: 'center-groin', center: { x: 150, y: 50 } },
    { id: 'right-groin', center: { x: 250, y: 50 } },
    { id: 'armpit-left', center: { x: 50, y: 150 } },
  ]),
}));

// Import component AFTER mocks
import { FlareMarkers } from '../FlareMarkers';

const { useFlares: mockedUseFlares } = jest.requireMock('@/lib/hooks/useFlares') as {
  useFlares: jest.Mock;
};

describe('FlareMarkers', () => {
  const defaultProps = {
    viewType: 'front' as const,
    zoomLevel: 1,
    userId: 'test-user-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockForward.mockReset();
    mockBack.mockReset();
    mockPrefetch.mockReset();
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

      // Story 5.4: FlareMarkers now uses BodyMapMarker component
      // BodyMapMarker renders as SVG <g> elements, need to wrap in SVG
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const markers = container.querySelectorAll('[data-testid^="flare-marker-"]');
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

      // Story 5.4: BodyMapMarker uses layer-based colors (all flares are red)
      // Resolved markers use gray
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const activeMarker = container.querySelector('[data-testid="flare-marker-flare-active"]');
      const improvingMarker = container.querySelector('[data-testid="flare-marker-flare-improving"]');
      const worseningMarker = container.querySelector('[data-testid="flare-marker-flare-worsening"]');
      const resolvedMarker = container.querySelector('[data-testid="flare-marker-flare-resolved"]');

      // Active flares use layer color (red for flares)
      const activeCircle = activeMarker?.querySelector('circle[class*="fill-"]');
      const improvingCircle = improvingMarker?.querySelector('circle[class*="fill-"]');
      const worseningCircle = worseningMarker?.querySelector('circle[class*="fill-"]');
      const resolvedCircle = resolvedMarker?.querySelector('circle[class*="fill-"]');

      expect(activeCircle?.className.baseVal).toContain('fill-red-500');
      expect(improvingCircle?.className.baseVal).toContain('fill-red-500');
      expect(worseningCircle?.className.baseVal).toContain('fill-red-500');
      expect(resolvedCircle?.className.baseVal).toContain('fill-gray-400');
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

      // Story 5.4: BodyMapMarker uses <g> elements with transform attribute
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const marker1 = container.querySelector('[data-testid="flare-marker-flare-1"]');
      const marker2 = container.querySelector('[data-testid="flare-marker-flare-2"]');
      const marker3 = container.querySelector('[data-testid="flare-marker-flare-3"]');

      // Get transform attributes (contains translate coordinates)
      const transform1 = marker1?.getAttribute('transform');
      const transform2 = marker2?.getAttribute('transform');
      const transform3 = marker3?.getAttribute('transform');

      // Verify transforms exist and are different (markers are offset)
      expect(transform1).toBeTruthy();
      expect(transform2).toBeTruthy();
      expect(transform3).toBeTruthy();
      expect(transform1).not.toBe(transform2);
      expect(transform2).not.toBe(transform3);
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

      // Story 5.4: BodyMapMarker uses new aria-label format
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const marker = container.querySelector('[data-testid="flare-marker-flare-123"]');
      fireEvent.click(marker!);

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

      // Story 5.4: BodyMapMarker uses layer-based aria-label
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const marker = container.querySelector('[data-testid="flare-marker-flare-123"]');
      expect(marker).toHaveAttribute('aria-label', 'Flares marker, severity 7');
      expect(marker).toHaveAttribute('role', 'button');
      expect(marker).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('AC1.7: Markers scale with severity (Story 5.4)', () => {
    it('scales marker size based on severity rating', () => {
      mockedUseFlares.mockReturnValue({
        data: [
          {
            id: 'flare-low',
            userId: 'test-user-123',
            symptomId: 'symptom-1',
            symptomName: 'Low Severity',
            startDate: new Date(),
            severity: 2, // Low severity: should be 16px
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
            id: 'flare-medium',
            userId: 'test-user-123',
            symptomId: 'symptom-2',
            symptomName: 'Medium Severity',
            startDate: new Date(),
            severity: 5, // Medium severity: should be 24px
            bodyRegions: ['center-groin'],
            status: 'active',
            interventions: [],
            notes: '',
            photoIds: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            trend: 'stable',
          },
          {
            id: 'flare-high',
            userId: 'test-user-123',
            symptomId: 'symptom-3',
            symptomName: 'High Severity',
            startDate: new Date(),
            severity: 9, // High severity: should be 32px
            bodyRegions: ['right-groin'],
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

      // Story 5.4: BodyMapMarker uses severity-based sizing (AC5.4.2)
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const lowMarker = container.querySelector('[data-testid="flare-marker-flare-low"]');
      const mediumMarker = container.querySelector('[data-testid="flare-marker-flare-medium"]');
      const highMarker = container.querySelector('[data-testid="flare-marker-flare-high"]');

      // Get visible circles (not the transparent touch target)
      const lowCircle = lowMarker?.querySelectorAll('circle')[1]; // Second circle is visible marker
      const mediumCircle = mediumMarker?.querySelectorAll('circle')[1];
      const highCircle = highMarker?.querySelectorAll('circle')[1];

      expect(lowCircle?.getAttribute('r')).toBe('8'); // 16px diameter = 8px radius
      expect(mediumCircle?.getAttribute('r')).toBe('12'); // 24px diameter = 12px radius
      expect(highCircle?.getAttribute('r')).toBe('16'); // 32px diameter = 16px radius
    });
  });

  describe('Loading and error states', () => {
    it('renders empty group when loading', () => {
      mockedUseFlares.mockReturnValue({
        data: [],
        isLoading: true,
        isError: false,
        error: null,
      });

      // Story 5.4: FlareMarkers always renders <g> to establish ref
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const group = container.querySelector('g[data-testid="flare-markers"]');
      expect(group).toBeInTheDocument();
      // But no markers inside
      expect(group?.querySelectorAll('[data-testid^="flare-marker-"]')).toHaveLength(0);
    });

    it('renders empty group when no flares', () => {
      mockedUseFlares.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      });

      // Story 5.4: FlareMarkers always renders <g> to establish ref
      const { container } = render(
        <svg>
          <FlareMarkers {...defaultProps} />
        </svg>
      );

      const group = container.querySelector('g[data-testid="flare-markers"]');
      expect(group).toBeInTheDocument();
      // But no markers inside
      expect(group?.querySelectorAll('[data-testid^="flare-marker-"]')).toHaveLength(0);
    });
  });
});
