import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveFlareCard } from "../ActiveFlareCard";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("ActiveFlareCard", () => {
  const mockFlare = {
    id: "flare-123",
    bodyRegionId: "left-groin",
    currentSeverity: 8,
    startDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    updatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    trend: "worsening" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC2.3.2 - Display comprehensive flare information", () => {
    it("displays body region name from bodyRegions lookup", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      expect(screen.getByText("Left Groin")).toBeInTheDocument();
    });

    it("displays severity with color coding - red for 9-10", () => {
      const highSeverityFlare = { ...mockFlare, currentSeverity: 9 };
      render(<ActiveFlareCard flare={highSeverityFlare} />);
      const severityBadge = screen.getByText("9");
      expect(severityBadge).toHaveClass("bg-red-500");
    });

    it("displays severity with color coding - orange for 7-8", () => {
      const medHighSeverityFlare = { ...mockFlare, currentSeverity: 7 };
      render(<ActiveFlareCard flare={medHighSeverityFlare} />);
      const severityBadge = screen.getByText("7");
      expect(severityBadge).toHaveClass("bg-orange-500");
    });

    it("displays severity with color coding - yellow for 4-6", () => {
      const medSeverityFlare = { ...mockFlare, currentSeverity: 5 };
      render(<ActiveFlareCard flare={medSeverityFlare} />);
      const severityBadge = screen.getByText("5");
      expect(severityBadge).toHaveClass("bg-yellow-500");
    });

    it("displays severity with color coding - green for 1-3", () => {
      const lowSeverityFlare = { ...mockFlare, currentSeverity: 2 };
      render(<ActiveFlareCard flare={lowSeverityFlare} />);
      const severityBadge = screen.getByText("2");
      expect(severityBadge).toHaveClass("bg-green-500");
    });

    it("displays trend arrow for worsening", () => {
      render(<ActiveFlareCard flare={{ ...mockFlare, trend: "worsening" }} />);
      expect(screen.getByLabelText("Worsening")).toBeInTheDocument();
    });

    it("displays trend arrow for stable", () => {
      render(<ActiveFlareCard flare={{ ...mockFlare, trend: "stable" }} />);
      expect(screen.getByLabelText("Stable")).toBeInTheDocument();
    });

    it("displays trend arrow for improving", () => {
      render(<ActiveFlareCard flare={{ ...mockFlare, trend: "improving" }} />);
      expect(screen.getByLabelText("Improving")).toBeInTheDocument();
    });

    it('displays "--" when no trend available', () => {
      render(<ActiveFlareCard flare={{ ...mockFlare, trend: undefined }} />);
      expect(screen.getByText("--")).toBeInTheDocument();
    });

    it("calculates and displays days active correctly", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      // Days calculation: Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1
      // 5 days ago + 1 = 6 days
      expect(screen.getByText(/6 days active/i)).toBeInTheDocument();
    });

    it("displays singular 'day' for 1 day active", () => {
      const oneDayFlare = {
        ...mockFlare,
        startDate: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
      };
      render(<ActiveFlareCard flare={oneDayFlare} />);
      expect(screen.getByText(/1 day active/i)).toBeInTheDocument();
    });

    it("displays last updated timestamp in relative format", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      expect(screen.getByText(/Updated.*ago/i)).toBeInTheDocument();
    });
  });

  describe("AC2.3.4 - Navigation to detail page", () => {
    it("navigates to detail page on click", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      fireEvent.click(card);
      expect(mockPush).toHaveBeenCalledWith("/flares/flare-123");
    });

    it("navigates to detail page on Enter key", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/flares/flare-123");
    });

    it("navigates to detail page on Space key", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      fireEvent.keyDown(card, { key: " " });
      expect(mockPush).toHaveBeenCalledWith("/flares/flare-123");
    });

    it("has hover state styling", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      expect(card).toHaveClass("hover:bg-gray-50");
    });

    it("has focus state styling", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      expect(card).toHaveClass("focus:ring-2", "focus:ring-blue-500");
    });

    it("has appropriate ARIA attributes", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("Left Groin")
      );
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("severity 8")
      );
      expect(card).toHaveAttribute(
        "aria-label",
        expect.stringContaining("6 days active")
      );
    });

    it("is keyboard accessible with tabIndex", () => {
      render(<ActiveFlareCard flare={mockFlare} />);
      const card = screen.getByRole("button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Edge cases", () => {
    it("handles flare with bodyRegions array instead of bodyRegionId", () => {
      const flareWithRegions = {
        ...mockFlare,
        bodyRegionId: undefined,
        bodyRegions: ["shoulder-right"], // Use correct ID from bodyRegions data
      };
      render(<ActiveFlareCard flare={flareWithRegions} />);
      expect(screen.getByText("Right Shoulder")).toBeInTheDocument();
    });

    it("handles flare with severity field instead of currentSeverity", () => {
      const flareWithSeverity = {
        ...mockFlare,
        currentSeverity: undefined,
        severity: 6,
      };
      render(<ActiveFlareCard flare={flareWithSeverity} />);
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    it("handles flare with Date object for startDate", () => {
      const flareWithDateObject = {
        ...mockFlare,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      };
      render(<ActiveFlareCard flare={flareWithDateObject} />);
      // 3 days ago + 1 = 4 days
      expect(screen.getByText(/4 days active/i)).toBeInTheDocument();
    });

    it("calls optional onClick callback when provided", () => {
      const mockOnClick = jest.fn();
      render(<ActiveFlareCard flare={mockFlare} onClick={mockOnClick} />);
      const card = screen.getByRole("button");
      fireEvent.click(card);
      expect(mockOnClick).toHaveBeenCalled();
      // Router push is called after onClick
      expect(mockPush).toHaveBeenCalledWith("/flares/flare-123");
    });
  });
});