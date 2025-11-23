/**
 * Story 0.3 Task 5.2: Tests for FlaresSummaryPanel
 * Covers collapse/expand behavior, stats rendering, and accessible announcements
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlaresSummaryPanel } from "../FlaresSummaryPanel";

describe("FlaresSummaryPanel", () => {
  const mockStats = {
    total: 10,
    worsening: 3,
    improving: 4,
    stable: 3,
    avgSeverity: 6.5,
  };

  const mockOnClearFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Collapse/Expand behavior", () => {
    it("should render in collapsed state by default", () => {
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText(/trend analysis/i)).not.toBeInTheDocument();
    });

    it("should expand when toggle button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByText(/trend analysis/i)).toBeInTheDocument();
      });
    });

    it("should collapse when toggle button is clicked again", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });

      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByText(/trend analysis/i)).not.toBeInTheDocument();
      });
    });

    it("should update toggle button aria-label based on state", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      expect(toggleButton).toHaveAccessibleName(/expand summary panel/i);

      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAccessibleName(/collapse summary panel/i);
      });
    });
  });

  describe("Stats rendering", () => {
    it("should display total active flares count", () => {
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      expect(screen.getByText(/10 active/i)).toBeInTheDocument();
    });

    it("should display trend counts when expanded", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        const worseningValue = screen.getByLabelText(/3 worsening flares/i);
        expect(worseningValue).toHaveTextContent("3");

        const improvingValue = screen.getByLabelText(/4 improving flares/i);
        expect(improvingValue).toHaveTextContent("4");

        const stableValue = screen.getByLabelText(/3 stable flares/i);
        expect(stableValue).toHaveTextContent("3");
      });
    });

    it("should display average severity when expanded", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        const avgSeverity = screen.getByLabelText(/average severity 6.5 out of 10/i);
        expect(avgSeverity).toHaveTextContent("6.5/10");
      });
    });

    it("should handle zero stats gracefully", async () => {
      const user = userEvent.setup();
      const zeroStats = {
        total: 0,
        worsening: 0,
        improving: 0,
        stable: 0,
        avgSeverity: 0,
      };

      render(
        <FlaresSummaryPanel
          stats={zeroStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/0 worsening flares/i)).toHaveTextContent("0");
        expect(screen.getByLabelText(/0 improving flares/i)).toHaveTextContent("0");
        expect(screen.getByLabelText(/0 stable flares/i)).toHaveTextContent("0");
      });
    });
  });

  describe("Active filters", () => {
    it("should display selected region filter when expanded", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion="left-knee"
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        expect(screen.getByText(/active filters/i)).toBeInTheDocument();
        expect(screen.getByText(/region: left-knee/i)).toBeInTheDocument();
      });
    });

    it("should not display active filters section when no region selected", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        expect(screen.queryByText(/active filters/i)).not.toBeInTheDocument();
      });
    });

    it("should call onClearRegionFilter when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion="left-knee"
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /clear region filter/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /clear region filter/i }));

      expect(mockOnClearFilter).toHaveBeenCalledTimes(1);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      expect(toggleButton).toHaveAttribute("aria-controls", "summary-panel-content");
    });

    it("should announce state changes to screen readers", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");

      await user.click(screen.getByRole("button", { name: /expand summary panel/i }));

      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(
          /summary panel expanded.*showing flare statistics and filters/i
        );
      });
    });

    it("should have region landmark with descriptive label", () => {
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion={null}
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      expect(
        screen.getByRole("region", { name: /flare statistics and filters/i })
      ).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <FlaresSummaryPanel
          stats={mockStats}
          selectedRegion="left-knee"
          onClearRegionFilter={mockOnClearFilter}
        />
      );

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      toggleButton.focus();

      expect(toggleButton).toHaveFocus();

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });
    });
  });
});
