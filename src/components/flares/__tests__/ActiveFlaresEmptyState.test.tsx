import { render, screen } from "@testing-library/react";
import { ActiveFlaresEmptyState } from "../ActiveFlaresEmptyState";

describe("ActiveFlaresEmptyState", () => {
  describe("AC2.3.5 - Empty state guides user to body map", () => {
    it("displays heading 'No active flares'", () => {
      render(<ActiveFlaresEmptyState />);
      expect(
        screen.getByRole("heading", { name: /no active flares/i })
      ).toBeInTheDocument();
    });

    it("displays message 'Tap body map to track a new flare.'", () => {
      render(<ActiveFlaresEmptyState />);
      expect(
        screen.getByText(/tap body map to track a new flare/i)
      ).toBeInTheDocument();
    });

    it("displays 'Go to Body Map' button", () => {
      render(<ActiveFlaresEmptyState />);
      const button = screen.getByRole("link", { name: /go to body map/i });
      expect(button).toBeInTheDocument();
    });

    it("'Go to Body Map' button links to /body-map", () => {
      render(<ActiveFlaresEmptyState />);
      const button = screen.getByRole("link", { name: /go to body map/i });
      expect(button).toHaveAttribute("href", "/body-map");
    });

    it("follows Story 0.2 empty state patterns - centered card", () => {
      render(<ActiveFlaresEmptyState />);
      const container = screen.getByRole("region", {
        name: /no active flares/i,
      });
      expect(container).toHaveClass("flex", "flex-col", "items-center");
    });

    it("has appropriate ARIA role", () => {
      render(<ActiveFlaresEmptyState />);
      expect(
        screen.getByRole("region", { name: /no active flares/i })
      ).toBeInTheDocument();
    });

    it("displays map icon", () => {
      render(<ActiveFlaresEmptyState />);
      // Icon is decorative, so it should have aria-hidden
      const container = screen.getByRole("region");
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });
  });
});