/**
 * Story 0.3 Task 5.3: Tests for FlaresMapIntro
 * Covers keyboard/focus integration and progressive guidance
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlaresMapIntro } from "../FlaresMapIntro";

describe("FlaresMapIntro", () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and visibility", () => {
    it("should not render when isOpen is false", () => {
      render(<FlaresMapIntro isOpen={false} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(screen.queryByRole("region", { name: /body map guidance/i })).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(screen.getByRole("region", { name: /body map guidance/i })).toBeInTheDocument();
    });

    it("should display correct title for map view mode", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(screen.getByText(/using the body map/i)).toBeInTheDocument();
    });

    it("should display correct title for split view mode", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="both" />);

      expect(screen.getByText(/using split view/i)).toBeInTheDocument();
    });

    it("should display additional guidance for split view", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="both" />);

      expect(
        screen.getByText(/the cards on the left update automatically/i)
      ).toBeInTheDocument();
    });

    it("should not display split-specific guidance for map view", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(
        screen.queryByText(/the cards on the left update automatically/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Dismissal behavior", () => {
    it("should call onDismiss when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      const closeButton = screen.getByRole("button", { name: /dismiss body map guidance/i });
      await user.click(closeButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it("should call onDismiss when Escape key is pressed", async () => {
      const user = userEvent.setup();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      await user.keyboard("{Escape}");

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it("should not call onDismiss when other keys are pressed", async () => {
      const user = userEvent.setup();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      await user.keyboard("{Enter}");
      await user.keyboard("{Tab}");
      await user.keyboard("a");

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe("Focus management", () => {
    it("should focus close button when opened", async () => {
      const { rerender } = render(
        <FlaresMapIntro isOpen={false} onDismiss={mockOnDismiss} viewMode="map" />
      );

      rerender(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: /dismiss body map guidance/i });
        expect(closeButton).toHaveFocus();
      });
    });

    it("should maintain focus within guidance when tabbing", async () => {
      const user = userEvent.setup();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      await waitFor(() => {
        const closeButton = screen.getByRole("button", { name: /dismiss body map guidance/i });
        expect(closeButton).toHaveFocus();
      });

      await user.keyboard("{Tab}");

      const skipLink = screen.getByRole("link", { name: /skip to flare cards/i });
      expect(skipLink).toHaveFocus();
    });
  });

  describe("Accessibility", () => {
    it("should have region landmark with descriptive label", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(
        screen.getByRole("region", { name: /body map guidance/i })
      ).toBeInTheDocument();
    });

    it("should have accessible close button label", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(
        screen.getByRole("button", { name: /dismiss body map guidance/i })
      ).toBeInTheDocument();
    });

    it("should include skip link for screen reader users", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      const skipLink = screen.getByRole("link", { name: /skip to flare cards/i });
      expect(skipLink).toHaveAttribute("href", "#flare-cards");
    });

    it("should have proper semantic markup for guidance content", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      // Check for heading
      expect(screen.getByRole("heading", { name: /using the body map/i })).toBeInTheDocument();

      // Check for descriptive text
      expect(screen.getByText(/click on body regions/i)).toBeInTheDocument();
      expect(screen.getByText(/zoom and pan/i)).toBeInTheDocument();
    });
  });

  describe("Content guidance", () => {
    it("should provide guidance on body region selection", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(
        screen.getByText(/click on body regions.*to filter flares by location/i)
      ).toBeInTheDocument();
    });

    it("should provide guidance on zoom and pan controls", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(
        screen.getByText(/zoom and pan.*use mouse wheel or pinch gestures/i)
      ).toBeInTheDocument();
    });

    it("should explain severity visualization", () => {
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      expect(
        screen.getByText(/color intensity shows severity.*darker regions indicate more severe/i)
      ).toBeInTheDocument();
    });
  });

  describe("Keyboard shortcuts documentation", () => {
    it("should inform users about Escape key to dismiss", async () => {
      const user = userEvent.setup();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      // Verify Escape key works
      await user.keyboard("{Escape}");
      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it("should support Enter/Space on close button", async () => {
      const user = userEvent.setup();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);

      const closeButton = screen.getByRole("button", { name: /dismiss body map guidance/i });
      closeButton.focus();

      await user.keyboard("{Enter}");
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);

      // Reset and test Space
      mockOnDismiss.mockClear();
      render(<FlaresMapIntro isOpen={true} onDismiss={mockOnDismiss} viewMode="map" />);
      const closeButton2 = screen.getByRole("button", { name: /dismiss body map guidance/i });
      closeButton2.focus();

      await user.keyboard(" ");
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
