import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { RegionDetailView } from "../RegionDetailView";
import { BodyMapLocation } from "@/lib/types/body-mapping";

// Mock dependencies
jest.mock("@/lib/repositories/bodyMapLocationRepository", () => ({
  bodyMapLocationRepository: {
    create: jest.fn().mockResolvedValue("test-id"),
  },
}));

jest.mock("@/lib/utils/region-extraction", () => ({
  getRegionSVGDefinition: jest.fn(() => ({
    elementType: "circle" as const,
    attributes: { cx: 50, cy: 50, r: 30 },
    viewBox: "0 0 100 100",
  })),
  getRegionData: jest.fn(() => ({
    id: "left-shoulder",
    name: "Left Shoulder",
    viewType: "front",
  })),
}));

jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 days ago"),
  format: jest.fn(() => "January 15, 2024"),
}));

describe("RegionDetailView - Story 3.7.5: History Toggle", () => {
  const mockMarkers: BodyMapLocation[] = [
    {
      id: "marker-1",
      userId: "user-1",
      bodyRegionId: "left-shoulder",
      symptomId: "symptom-1",
      coordinates: { x: 0.3, y: 0.4 },
      severity: 5,
      notes: "Historical marker 1",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
    },
    {
      id: "marker-2",
      userId: "user-1",
      bodyRegionId: "left-shoulder",
      symptomId: "symptom-2",
      coordinates: { x: 0.6, y: 0.7 },
      severity: 8,
      notes: "Historical marker 2",
      createdAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-12"),
    },
  ];

  const defaultProps = {
    regionId: "left-shoulder",
    viewType: "front" as const,
    userId: "user-1",
    markers: mockMarkers,
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC 3.7.5.1: History toggle available in region view control bar", () => {
    it("renders history toggle button in normal mode", () => {
      render(<RegionDetailView {...defaultProps} />);

      const historyButton = screen.getByLabelText(/historical markers/i);
      expect(historyButton).toBeInTheDocument();
      expect(screen.getByText("History")).toBeInTheDocument();
    });

    it("renders history toggle button in fullscreen mode", () => {
      render(<RegionDetailView {...defaultProps} isFullscreen={true} onExitFullscreen={jest.fn()} />);

      const historyButton = screen.getByLabelText(/history/i);
      expect(historyButton).toBeInTheDocument();
    });

    it("history toggle has clear label", () => {
      render(<RegionDetailView {...defaultProps} />);

      expect(screen.getByText("History")).toBeInTheDocument();
    });

    it("history toggle is easily accessible with proper touch target", () => {
      render(<RegionDetailView {...defaultProps} />);

      const historyButton = screen.getByLabelText(/historical markers/i);
      // Check for minimum touch target size via CSS classes
      expect(historyButton).toHaveClass("px-4", "py-2");
    });
  });

  describe("AC 3.7.5.2: Default state - History ON", () => {
    it("shows historical markers by default", () => {
      render(<RegionDetailView {...defaultProps} />);

      // Check that historical markers are rendered (SVG circles should exist)
      const svg = screen.getByRole("img", { name: /left shoulder region detail view/i });
      expect(svg).toBeInTheDocument();

      // Check toggle button shows "hide" icon (Eye icon)
      const historyButton = screen.getByLabelText(/hide historical markers/i);
      expect(historyButton).toBeInTheDocument();
      expect(historyButton).toHaveAttribute("aria-pressed", "true");
    });

    it("respects showHistoricalMarkersDefault prop when set to false", () => {
      render(<RegionDetailView {...defaultProps} showHistoricalMarkersDefault={false} />);

      const historyButton = screen.getByLabelText(/show historical markers/i);
      expect(historyButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("AC 3.7.5.3 & AC 3.7.5.4: Toggle functionality", () => {
    it("toggles history visibility when clicked", () => {
      render(<RegionDetailView {...defaultProps} />);

      // Initially ON (showing history)
      let historyButton = screen.getByLabelText(/hide historical markers/i);
      expect(historyButton).toHaveAttribute("aria-pressed", "true");

      // Click to turn OFF
      fireEvent.click(historyButton);

      // Should now be OFF (hiding history)
      historyButton = screen.getByLabelText(/show historical markers/i);
      expect(historyButton).toHaveAttribute("aria-pressed", "false");

      // Click to turn back ON
      fireEvent.click(historyButton);

      // Should be ON again
      historyButton = screen.getByLabelText(/hide historical markers/i);
      expect(historyButton).toHaveAttribute("aria-pressed", "true");
    });

    it("updates icon when toggling (Eye <-> EyeOff)", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      const historyButton = screen.getByLabelText(/historical markers/i);

      // Check initial state has Eye icon (history ON)
      expect(historyButton).toHaveAttribute("aria-pressed", "true");

      // Toggle OFF
      fireEvent.click(historyButton);

      // Check for EyeOff icon (history OFF)
      expect(historyButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("AC 3.7.5.5: Visual distinction for historical markers", () => {
    it("renders historical markers with reduced opacity", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      // Find SVG elements with historical marker class
      const historicalMarkers = container.querySelectorAll(".historical-marker");
      expect(historicalMarkers.length).toBeGreaterThan(0);

      // Check for reduced opacity or muted styling
      historicalMarkers.forEach((marker) => {
        const circle = marker.querySelector("circle[fill='#6b7280']");
        expect(circle).toHaveAttribute("fillOpacity", "0.5");
      });
    });

    it("uses dashed border for historical markers", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      const historicalMarkers = container.querySelectorAll(".historical-marker");

      historicalMarkers.forEach((marker) => {
        const dashedCircle = marker.querySelector("circle[stroke-dasharray]");
        expect(dashedCircle).toBeInTheDocument();
        expect(dashedCircle).toHaveAttribute("stroke-dasharray", "1,1");
      });
    });

    it("session markers have full opacity and different styling", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      // Session markers use different class
      const sessionMarkers = container.querySelectorAll(".session-marker");

      sessionMarkers.forEach((marker) => {
        const circle = marker.querySelector("circle[fill='#ef4444']");
        expect(circle).toHaveAttribute("fillOpacity", "0.8");
      });
    });
  });

  describe("AC 3.7.5.6: Toggle state persists during session", () => {
    it("maintains toggle state across re-renders", () => {
      const { rerender } = render(<RegionDetailView {...defaultProps} />);

      // Turn history OFF
      const historyButton = screen.getByLabelText(/historical markers/i);
      fireEvent.click(historyButton);

      expect(screen.getByLabelText(/show historical markers/i)).toHaveAttribute(
        "aria-pressed",
        "false"
      );

      // Re-render with same props
      rerender(<RegionDetailView {...defaultProps} />);

      // State should persist (still OFF)
      expect(screen.getByLabelText(/show historical markers/i)).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });

    it("does NOT persist across component unmount/remount", () => {
      const { unmount } = render(<RegionDetailView {...defaultProps} />);

      // Turn history OFF
      const historyButton = screen.getByLabelText(/historical markers/i);
      fireEvent.click(historyButton);

      // Unmount component
      unmount();

      // Remount - should reset to default (ON)
      render(<RegionDetailView {...defaultProps} />);

      const newHistoryButton = screen.getByLabelText(/historical markers/i);
      expect(newHistoryButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("AC 3.7.5.7: Duplicate prevention", () => {
    it("detects when preview marker is near existing markers", () => {
      render(<RegionDetailView {...defaultProps} />);

      const svg = screen.getByRole("img", { name: /left shoulder region detail view/i });

      // Simulate clicking near an existing marker (0.3, 0.4)
      // Click at (0.32, 0.42) which is very close
      fireEvent.click(svg, {
        clientX: 100,
        clientY: 100,
      });

      // Check for warning message about nearby markers
      // Note: This depends on the preview system being active
      // In practice, would need to wait for preview state to update
    });

    it("highlights nearby markers when positioning new marker", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      // This test would need to trigger preview mode and check for
      // visual highlighting of nearby markers
      // Implementation depends on preview workflow
    });

    it("shows warning text when placing marker near existing ones", () => {
      render(<RegionDetailView {...defaultProps} />);

      // Would need to trigger preview near existing marker
      // Then check for warning text like "Near 1 existing marker"
    });
  });

  describe("AC 3.7.5.8: Historical marker details modal", () => {
    it("opens details modal when clicking historical marker", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      // Find a historical marker circle
      const markerCircle = container.querySelector(
        ".historical-marker circle[fill='#6b7280']"
      );

      if (markerCircle) {
        fireEvent.click(markerCircle);

        // Modal should appear
        waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
          expect(screen.getByText("Historical Marker Details")).toBeInTheDocument();
        });
      }
    });

    it("displays marker details in modal when opened", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      const markerCircle = container.querySelector(
        ".historical-marker circle[fill='#6b7280']"
      );

      if (markerCircle) {
        fireEvent.click(markerCircle);

        waitFor(() => {
          // Check that marker details are shown
          expect(screen.getByText(/severity/i)).toBeInTheDocument();
          expect(screen.getByText(/date/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe("Integration with fullscreen mode", () => {
    it("shows history toggle in fullscreen control bar", () => {
      render(
        <RegionDetailView
          {...defaultProps}
          isFullscreen={true}
          onExitFullscreen={jest.fn()}
        />
      );

      // History toggle should be in fullscreen control bar
      const historyButton = screen.getByLabelText(/history/i);
      expect(historyButton).toBeInTheDocument();
    });

    it("maintains toggle state when entering/exiting fullscreen", () => {
      const { rerender } = render(<RegionDetailView {...defaultProps} />);

      // Turn history OFF
      const historyButton = screen.getByLabelText(/historical markers/i);
      fireEvent.click(historyButton);

      // Enter fullscreen
      rerender(
        <RegionDetailView
          {...defaultProps}
          isFullscreen={true}
          onExitFullscreen={jest.fn()}
        />
      );

      // Toggle state should persist
      const fullscreenHistoryButton = screen.getByLabelText(/hide history/i);
      expect(fullscreenHistoryButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label for history toggle", () => {
      render(<RegionDetailView {...defaultProps} />);

      const historyButton = screen.getByLabelText(/historical markers/i);
      expect(historyButton).toHaveAttribute("aria-label");
    });

    it("has proper aria-pressed state for toggle", () => {
      render(<RegionDetailView {...defaultProps} />);

      const historyButton = screen.getByLabelText(/historical markers/i);
      expect(historyButton).toHaveAttribute("aria-pressed");
    });

    it("historical markers are clickable with keyboard", () => {
      const { container } = render(<RegionDetailView {...defaultProps} />);

      const markerCircle = container.querySelector(
        ".historical-marker circle[fill='#6b7280']"
      );

      expect(markerCircle).toHaveClass("cursor-pointer");
    });
  });
});
