import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MarkerDetailsModal, MarkerDetails } from "../MarkerDetailsModal";

describe("MarkerDetailsModal", () => {
  const mockMarker: MarkerDetails = {
    id: "test-marker-1",
    severity: 7,
    notes: "Test note with some details",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    bodyRegionId: "left-shoulder",
    layer: "flares",
    coordinates: { x: 0.5, y: 0.3 },
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC 3.7.5.8: Tapping historical marker shows details", () => {
    it("renders modal when isOpen is true with marker data", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Check modal is visible
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Historical Marker Details")).toBeInTheDocument();

      // Check severity is displayed
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("/ 10")).toBeInTheDocument();

      // Check notes are displayed
      expect(screen.getByText("Test note with some details")).toBeInTheDocument();

      // Check location is displayed
      expect(screen.getByText("left shoulder")).toBeInTheDocument();

      // Check layer is displayed
      expect(screen.getByText("flares")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("does not render when marker is null", () => {
      render(
        <MarkerDetailsModal
          marker={null}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Read-only modal behavior", () => {
    it("displays read-only indicator in footer", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Read-only view/i)).toBeInTheDocument();
      expect(screen.getByText(/Editing not available/i)).toBeInTheDocument();
    });

    it("does not show any edit buttons or form inputs", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // No input fields should be present
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();

      // Only close button should be present, no save/edit buttons
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(2); // Close button (2 instances: X and Close)
      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });

  describe("Close functionality", () => {
    it("calls onClose when clicking close button", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButton = screen.getByText("Close");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking X button", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const xButton = screen.getByLabelText("Close modal");
      fireEvent.click(xButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when clicking backdrop", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const backdrop = screen.getByRole("dialog").previousElementSibling;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it("calls onClose when pressing Escape key", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      fireEvent.keyDown(window, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Marker details display", () => {
    it("displays severity with visual bar", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Severity")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    it("displays formatted date and time", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Date")).toBeInTheDocument();
      // Date section should exist
      const dateSection = screen.getByText("Date").closest("div");
      expect(dateSection).toBeInTheDocument();
    });

    it("displays coordinates when provided", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/x: 0.500, y: 0.300/i)).toBeInTheDocument();
    });

    it("handles marker without notes gracefully", () => {
      const markerWithoutNotes = { ...mockMarker, notes: undefined };

      render(
        <MarkerDetailsModal
          marker={markerWithoutNotes}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(
        screen.getByText("No notes recorded for this marker.")
      ).toBeInTheDocument();
    });

    it("handles marker without coordinates gracefully", () => {
      const markerWithoutCoords = { ...mockMarker, coordinates: undefined };

      render(
        <MarkerDetailsModal
          marker={markerWithoutCoords}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should still render without coordinates
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.queryByText(/x:/)).not.toBeInTheDocument();
    });

    it("handles marker without layer gracefully", () => {
      const markerWithoutLayer = { ...mockMarker, layer: undefined };

      render(
        <MarkerDetailsModal
          marker={markerWithoutLayer}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Should still render without layer info
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.queryByText("Layer")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "marker-details-title");
    });

    it("has accessible close button", () => {
      render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const xButton = screen.getByLabelText("Close modal");
      expect(xButton).toBeInTheDocument();
    });
  });

  describe("Body scroll behavior", () => {
    it("prevents body scroll when modal is open", () => {
      const { rerender } = render(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(document.body.style.overflow).toBe("hidden");

      rerender(
        <MarkerDetailsModal
          marker={mockMarker}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(document.body.style.overflow).toBe("");
    });
  });
});
