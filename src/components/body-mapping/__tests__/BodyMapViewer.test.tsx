import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BodyMapViewer } from '../BodyMapViewer';

// Mock dependencies
jest.mock('../BodyRegionSelector', () => ({
  BodyRegionSelector: ({ onTouchCoordinateCapture, onCoordinateCapture }: any) => (
    <div data-testid="body-region-selector">
      {onCoordinateCapture && <div data-testid="has-mouse-handler">Mouse Handler Present</div>}
      {onTouchCoordinateCapture && <div data-testid="has-touch-handler">Touch Handler Present</div>}
    </div>
  ),
}));

jest.mock('@/components/body-map/BodyMapZoom', () => ({
  BodyMapZoom: ({ children }: any) => <div data-testid="body-map-zoom">{children}</div>,
}));

jest.mock('@/components/body-map/CoordinateMarker', () => ({
  CoordinateMarker: () => <div data-testid="coordinate-marker" />,
}));

jest.mock('@/components/body-map/FlareMarkers', () => ({
  FlareMarkers: () => <div data-testid="flare-markers" />,
}));

describe('BodyMapViewer', () => {
  const mockOnRegionSelect = jest.fn();
  const mockOnCoordinateMark = jest.fn();
  const defaultProps = {
    view: 'front' as const,
    userId: 'test-user-123',
    selectedRegion: 'left-shoulder',
    onRegionSelect: mockOnRegionSelect,
    onCoordinateMark: mockOnCoordinateMark,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<BodyMapViewer {...defaultProps} />);
      expect(screen.getByTestId('body-region-selector')).toBeInTheDocument();
    });

    it('renders with BodyMapZoom wrapper', () => {
      render(<BodyMapViewer {...defaultProps} />);
      expect(screen.getByTestId('body-map-zoom')).toBeInTheDocument();
    });

    it('shows instructions text', () => {
      render(<BodyMapViewer {...defaultProps} />);
      expect(screen.getByText('Touch or click regions to select')).toBeInTheDocument();
    });
  });

  describe('Touch Coordinate Capture (Story 3.5.12)', () => {
    it('passes touch handler to BodyRegionSelector', () => {
      render(<BodyMapViewer {...defaultProps} />);

      // Verify both mouse and touch handlers are passed
      expect(screen.getByTestId('has-mouse-handler')).toBeInTheDocument();
      expect(screen.getByTestId('has-touch-handler')).toBeInTheDocument();
    });

    it('verifies handleTouchCoordinateCapture is implemented', () => {
      const { container } = render(<BodyMapViewer {...defaultProps} />);

      // The touch handler should be passed to BodyRegionSelector
      expect(screen.getByTestId('has-touch-handler')).toBeInTheDocument();
    });

    it('provides both mouse and touch coordinate capture handlers', () => {
      render(<BodyMapViewer {...defaultProps} />);

      // Both handlers should be present (for cross-device compatibility)
      const mouseHandler = screen.getByTestId('has-mouse-handler');
      const touchHandler = screen.getByTestId('has-touch-handler');

      expect(mouseHandler).toBeInTheDocument();
      expect(touchHandler).toBeInTheDocument();
    });
  });

  describe('Read-Only Mode', () => {
    it('renders in read-only mode without handlers', () => {
      render(<BodyMapViewer {...defaultProps} readOnly={true} />);

      expect(screen.getByTestId('body-region-selector')).toBeInTheDocument();
      // Read-only mode should still pass handlers but they won't execute coordinate capture
    });
  });

  describe('Multi-Select Mode', () => {
    it('renders with multi-select enabled', () => {
      render(<BodyMapViewer {...defaultProps} multiSelect={true} />);

      expect(screen.getByTestId('body-region-selector')).toBeInTheDocument();
    });
  });

  describe('Flare Severity Display', () => {
    it('renders with flare severity data', () => {
      const flareSeverityByRegion = {
        'left-shoulder': 8,
        'right-shoulder': 6,
      };

      render(
        <BodyMapViewer
          {...defaultProps}
          flareSeverityByRegion={flareSeverityByRegion}
        />
      );

      expect(screen.getByTestId('body-region-selector')).toBeInTheDocument();
    });
  });
});
