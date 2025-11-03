import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RegionDetailView } from './RegionDetailView';
import { BodyMapLocation } from '@/lib/types/body-mapping';

describe('RegionDetailView', () => {
  const mockOnBack = jest.fn();
  const mockOnMarkerPlace = jest.fn();
  const mockOnMarkerClick = jest.fn();

  const defaultProps = {
    regionId: 'left-groin',
    viewType: 'front' as const,
    userId: 'test-user',
    onBack: mockOnBack,
    onMarkerPlace: mockOnMarkerPlace,
    onMarkerClick: mockOnMarkerClick,
  };

  const mockMarkers: BodyMapLocation[] = [
    {
      id: 'marker-1',
      userId: 'test-user',
      symptomId: 'symptom-1',
      bodyRegionId: 'left-groin',
      coordinates: { x: 0.5, y: 0.5 },
      severity: 5,
      notes: 'Test marker',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<RegionDetailView {...defaultProps} />);
    expect(screen.getByLabelText(/region detail view/i)).toBeInTheDocument();
  });

  it('displays the region name', () => {
    render(<RegionDetailView {...defaultProps} />);
    expect(screen.getByText(/left groin - Detail View/i)).toBeInTheDocument();
  });

  it('renders Back to Body Map button', () => {
    render(<RegionDetailView {...defaultProps} />);
    const backButton = screen.getByRole('button', { name: /Back to Body Map/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when Back button is clicked', () => {
    render(<RegionDetailView {...defaultProps} />);
    const backButton = screen.getByRole('button', { name: /Back to Body Map/i });
    fireEvent.click(backButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('handles ESC key press to return to body map', () => {
    render(<RegionDetailView {...defaultProps} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders historical markers toggle button', () => {
    render(<RegionDetailView {...defaultProps} />);
    const toggleButton = screen.getByRole('button', { name: /History/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles historical markers visibility', () => {
    render(<RegionDetailView {...defaultProps} markers={mockMarkers} />);
    const toggleButton = screen.getByRole('button', { name: /History/i });

    // Initially should be pressed (showing markers)
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

    // Toggle to hide
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

    // Toggle to show again
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters and displays markers for the current region', () => {
    const mixedMarkers: BodyMapLocation[] = [
      ...mockMarkers,
      {
        id: 'marker-2',
        userId: 'test-user',
        symptomId: 'symptom-2',
        bodyRegionId: 'right-groin', // Different region
        coordinates: { x: 0.3, y: 0.3 },
        severity: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const { container } = render(
      <RegionDetailView {...defaultProps} markers={mixedMarkers} />
    );

    // Should only render one marker (for left-groin)
    const markers = container.querySelectorAll('.historical-marker');
    expect(markers).toHaveLength(1);
  });

  it('handles marker placement in interactive mode', () => {
    const { container } = render(
      <RegionDetailView {...defaultProps} readOnly={false} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('cursor-crosshair');

    // Simulate click on SVG to place marker
    fireEvent.click(svg!);

    // Check that session marker is added
    const sessionMarkers = container.querySelectorAll('.session-marker');
    expect(sessionMarkers).toHaveLength(1);
  });

  it('does not allow marker placement in read-only mode', () => {
    const { container } = render(
      <RegionDetailView {...defaultProps} readOnly={true} />
    );

    const svg = container.querySelector('svg');
    expect(svg).not.toHaveClass('cursor-crosshair');

    // Simulate click on SVG
    fireEvent.click(svg!);

    // No marker should be placed
    const sessionMarkers = container.querySelectorAll('.session-marker');
    expect(sessionMarkers).toHaveLength(0);
    expect(mockOnMarkerPlace).not.toHaveBeenCalled();
  });

  it('displays marker coordinates when placing', () => {
    const { container } = render(
      <RegionDetailView {...defaultProps} readOnly={false} />
    );

    const svg = container.querySelector('svg');
    fireEvent.click(svg!);

    // Should show coordinates
    expect(screen.getByText(/x: \d+\.\d+ y: \d+\.\d+/)).toBeInTheDocument();
  });

  it('renders with correct viewBox for region isolation', () => {
    const { container } = render(<RegionDetailView {...defaultProps} />);
    const svg = container.querySelector('svg');

    // Should have a viewBox attribute (not the default 0 0 100 100)
    expect(svg).toHaveAttribute('viewBox');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
  });

  it('handles marker click events', () => {
    render(<RegionDetailView {...defaultProps} markers={mockMarkers} />);

    // Find and click the marker
    const marker = document.querySelector('.historical-marker circle');
    fireEvent.click(marker!);

    expect(mockOnMarkerClick).toHaveBeenCalledWith('marker-1');
  });

  it('shows severity indicator on historical markers', () => {
    render(<RegionDetailView {...defaultProps} markers={mockMarkers} />);

    // Check for severity text
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('accumulates multiple session markers', () => {
    const { container } = render(
      <RegionDetailView {...defaultProps} readOnly={false} />
    );

    const svg = container.querySelector('svg');

    // Place multiple markers
    fireEvent.click(svg!, { clientX: 100, clientY: 100 });
    fireEvent.click(svg!, { clientX: 200, clientY: 200 });
    fireEvent.click(svg!, { clientX: 300, clientY: 300 });

    const sessionMarkers = container.querySelectorAll('.session-marker');
    expect(sessionMarkers).toHaveLength(3);
    expect(mockOnMarkerPlace).toHaveBeenCalledTimes(3);
  });
});