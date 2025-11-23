import { render, screen } from "@testing-library/react";
import {
  HighlightsEmptyState,
  QuickActionsEmptyState,
  TimelineEmptyState,
  ErrorState,
  OfflineState,
} from "../TodayEmptyStates";

describe("Today Empty States", () => {
  describe("HighlightsEmptyState", () => {
    it("renders with appropriate messaging", () => {
      render(<HighlightsEmptyState />);

      expect(screen.getByText("No active flares yet")).toBeInTheDocument();
      expect(
        screen.getByText(/great news! you're currently flare-free/i)
      ).toBeInTheDocument();
    });

    it("has accessible status role", () => {
      render(<HighlightsEmptyState />);

      const status = screen.getByRole("status", { name: /no active flares/i });
      expect(status).toBeInTheDocument();
    });

    it("includes visual icon", () => {
      const { container } = render(<HighlightsEmptyState />);

      // Check for flame icon container
      const iconContainer = container.querySelector(".bg-green-100");
      expect(iconContainer).toBeInTheDocument();
    });

    it("provides guidance on next action", () => {
      render(<HighlightsEmptyState />);

      expect(
        screen.getByText(/use quick actions below to log a new flare/i)
      ).toBeInTheDocument();
    });
  });

  describe("QuickActionsEmptyState", () => {
    it("renders with guidance text", () => {
      render(<QuickActionsEmptyState />);

      expect(screen.getByText("Start tracking your health")).toBeInTheDocument();
      expect(
        screen.getByText(/use the buttons above to quickly log/i)
      ).toBeInTheDocument();
    });

    it("has accessible status role", () => {
      render(<QuickActionsEmptyState />);

      const status = screen.getByRole("status", { name: /quick actions help/i });
      expect(status).toBeInTheDocument();
    });

    it("uses dashed border styling", () => {
      const { container } = render(<QuickActionsEmptyState />);

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("border-dashed", "border-muted");
    });
  });

  describe("TimelineEmptyState", () => {
    it("renders with appropriate messaging", () => {
      render(<TimelineEmptyState />);

      expect(screen.getByText("No events logged today")).toBeInTheDocument();
      expect(
        screen.getByText(/start your day by logging your first event/i)
      ).toBeInTheDocument();
    });

    it("has accessible status role", () => {
      render(<TimelineEmptyState />);

      const status = screen.getByRole("status", { name: /no events logged today/i });
      expect(status).toBeInTheDocument();
    });

    it("encourages user action", () => {
      render(<TimelineEmptyState />);

      expect(
        screen.getByText(/using quick actions above/i)
      ).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("renders with default error message", () => {
      render(<ErrorState />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText(/unable to load data. please try refreshing/i)
      ).toBeInTheDocument();
    });

    it("renders with custom error message", () => {
      render(<ErrorState message="Custom error message" />);

      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    it("has accessible alert role", () => {
      render(<ErrorState />);

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("aria-live", "polite");
    });

    it("uses error styling", () => {
      const { container } = render(<ErrorState />);

      const alert = container.firstChild as HTMLElement;
      expect(alert).toHaveClass("border-red-200", "bg-red-50");
    });
  });

  describe("OfflineState", () => {
    it("renders with offline messaging", () => {
      render(<OfflineState />);

      expect(screen.getByText("You're offline")).toBeInTheDocument();
      expect(
        screen.getByText(/your data is stored locally and will sync/i)
      ).toBeInTheDocument();
    });

    it("has accessible status role", () => {
      render(<OfflineState />);

      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute("aria-live", "polite");
    });

    it("uses warning styling", () => {
      const { container } = render(<OfflineState />);

      const status = container.firstChild as HTMLElement;
      expect(status).toHaveClass("border-yellow-200", "bg-yellow-50");
    });

    it("reassures user about data persistence", () => {
      render(<OfflineState />);

      expect(
        screen.getByText(/stored locally and will sync when you're back online/i)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("all empty states are announced to screen readers", () => {
      const { rerender } = render(<HighlightsEmptyState />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<QuickActionsEmptyState />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<TimelineEmptyState />);
      expect(screen.getByRole("status")).toBeInTheDocument();

      rerender(<OfflineState />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("error state uses alert role for immediate announcement", () => {
      render(<ErrorState />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("all icons have aria-hidden attribute", () => {
      const { container: container1 } = render(<HighlightsEmptyState />);
      const { container: container2 } = render(<QuickActionsEmptyState />);
      const { container: container3 } = render(<TimelineEmptyState />);

      // Icons should be decorative
      const icons1 = container1.querySelectorAll("[aria-hidden='true']");
      const icons2 = container2.querySelectorAll("[aria-hidden='true']");
      const icons3 = container3.querySelectorAll("[aria-hidden='true']");

      expect(icons1.length).toBeGreaterThan(0);
      expect(icons2.length).toBeGreaterThan(0);
      expect(icons3.length).toBeGreaterThan(0);
    });
  });
});
