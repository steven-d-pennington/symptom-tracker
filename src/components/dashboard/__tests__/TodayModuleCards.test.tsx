import { render, screen } from "@testing-library/react";
import { TodayHighlightsCard } from "../TodayHighlightsCard";
import { TodayQuickActionsCard } from "../TodayQuickActionsCard";
import { TodayTimelineCard } from "../TodayTimelineCard";

describe("Today Module Cards", () => {
  describe("TodayHighlightsCard", () => {
    it("renders with proper semantic structure", () => {
      render(
        <TodayHighlightsCard>
          <div data-testid="highlights-content">Content</div>
        </TodayHighlightsCard>
      );

      const region = screen.getByRole("region", { name: /highlights/i });
      expect(region).toBeInTheDocument();

      const heading = screen.getByRole("heading", { name: /highlights/i, level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("id", "today-highlights-heading");

      expect(screen.getByTestId("highlights-content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      const { container } = render(
        <TodayHighlightsCard className="custom-class">
          <div>Content</div>
        </TodayHighlightsCard>
      );

      const section = container.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });

    it("uses proper ARIA labelling", () => {
      render(
        <TodayHighlightsCard>
          <div>Content</div>
        </TodayHighlightsCard>
      );

      const region = screen.getByRole("region");
      expect(region).toHaveAttribute("aria-labelledby", "today-highlights-heading");
    });
  });

  describe("TodayQuickActionsCard", () => {
    it("renders with proper semantic structure", () => {
      render(
        <TodayQuickActionsCard>
          <div data-testid="quick-actions-content">Content</div>
        </TodayQuickActionsCard>
      );

      const region = screen.getByRole("region", { name: /quick actions/i });
      expect(region).toBeInTheDocument();

      const heading = screen.getByRole("heading", { name: /quick actions/i, level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("id", "today-quick-actions-heading");

      expect(screen.getByTestId("quick-actions-content")).toBeInTheDocument();
    });

    it("displays helper text", () => {
      render(
        <TodayQuickActionsCard>
          <div>Content</div>
        </TodayQuickActionsCard>
      );

      expect(screen.getByText(/log events quickly to keep your health timeline up to date/i)).toBeInTheDocument();
    });

    it("wraps content in card with border and padding", () => {
      render(
        <TodayQuickActionsCard>
          <div data-testid="content">Content</div>
        </TodayQuickActionsCard>
      );

      const contentParent = screen.getByTestId("content").parentElement;
      expect(contentParent).toHaveClass("rounded-lg", "border", "border-border", "bg-card", "p-6");
    });
  });

  describe("TodayTimelineCard", () => {
    it("renders with proper semantic structure", () => {
      render(
        <TodayTimelineCard>
          <div data-testid="timeline-content">Content</div>
        </TodayTimelineCard>
      );

      const region = screen.getByRole("region", { name: /today's timeline/i });
      expect(region).toBeInTheDocument();

      const heading = screen.getByRole("heading", { name: /today's timeline/i, level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("id", "today-timeline-heading");

      expect(screen.getByTestId("timeline-content")).toBeInTheDocument();
    });

    it("maintains consistent spacing with other modules", () => {
      const { container: highlightsContainer } = render(
        <TodayHighlightsCard>Content</TodayHighlightsCard>
      );
      const { container: timelineContainer } = render(
        <TodayTimelineCard>Content</TodayTimelineCard>
      );

      const highlightsSection = highlightsContainer.querySelector("section");
      const timelineSection = timelineContainer.querySelector("section");

      expect(highlightsSection).toHaveClass("space-y-4");
      expect(timelineSection).toHaveClass("space-y-4");
    });
  });

  describe("Module ordering and responsive behavior", () => {
    it("all modules use consistent vertical spacing", () => {
      const modules = [
        <TodayHighlightsCard key="1">Content 1</TodayHighlightsCard>,
        <TodayQuickActionsCard key="2">Content 2</TodayQuickActionsCard>,
        <TodayTimelineCard key="3">Content 3</TodayTimelineCard>,
      ];

      const { container } = render(<>{modules}</>);
      const sections = container.querySelectorAll("section");

      sections.forEach((section) => {
        expect(section).toHaveClass("space-y-4");
      });
    });

    it("all modules use H2 headings for proper hierarchy", () => {
      render(
        <>
          <TodayHighlightsCard>Content 1</TodayHighlightsCard>
          <TodayQuickActionsCard>Content 2</TodayQuickActionsCard>
          <TodayTimelineCard>Content 3</TodayTimelineCard>
        </>
      );

      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings).toHaveLength(3);
      expect(headings[0]).toHaveTextContent("Highlights");
      expect(headings[1]).toHaveTextContent("Quick Actions");
      expect(headings[2]).toHaveTextContent("Today's Timeline");
    });

    it("all modules have region landmarks for accessibility", () => {
      render(
        <>
          <TodayHighlightsCard>Content 1</TodayHighlightsCard>
          <TodayQuickActionsCard>Content 2</TodayQuickActionsCard>
          <TodayTimelineCard>Content 3</TodayTimelineCard>
        </>
      );

      const regions = screen.getAllByRole("region");
      expect(regions).toHaveLength(3);
    });
  });
});
