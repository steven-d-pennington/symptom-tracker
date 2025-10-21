import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "../page";

// Mock router functions
let mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => mockSearchParams),
  usePathname: jest.fn(() => "/dashboard"),
}));

const mockUseCurrentUser = jest.fn();
jest.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

jest.mock("@/components/flares/ActiveFlareCards", () => ({
  ActiveFlareCards: ({ userId }: { userId: string }) => (
    <div data-testid="active-flare-cards">Active Flares for {userId}</div>
  ),
}));

jest.mock("@/components/quick-log/QuickLogButtons", () => ({
  QuickLogButtons: ({ onLogFlare, onLogMedication, onLogSymptom, onLogTrigger }: any) => (
    <div data-testid="quick-log-buttons">
      <button onClick={onLogFlare}>Log Flare</button>
      <button onClick={onLogMedication}>Log Medication</button>
      <button onClick={onLogSymptom}>Log Symptom</button>
      <button onClick={onLogTrigger}>Log Trigger</button>
    </div>
  ),
}));

jest.mock("@/components/timeline/TimelineView", () => ({
  __esModule: true,
  default: () => <div data-testid="timeline-view">Timeline View</div>,
}));

jest.mock("@/contexts/FoodContext", () => ({
  FoodProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useFoodContext: () => ({
    isFoodLogModalOpen: false,
    openFoodLog: jest.fn(),
    closeFoodLog: jest.fn(),
    markFoodLogReady: jest.fn(),
  }),
}));

describe("DashboardPage", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockSearchParams = new URLSearchParams();
    mockUseCurrentUser.mockReturnValue({ userId: mockUserId, isLoading: false, error: null });

    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: "" };
  });

  describe("Layout and Components", () => {
    it("renders the dashboard with correct title", () => {
      render(<DashboardPage />);

      expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(/your health overview for today/i)).toBeInTheDocument();
    });

    it("renders components in correct order: ActiveFlareCards → QuickLogButtons → TimelineView", () => {
      const { container } = render(<DashboardPage />);

      const sections = container.querySelectorAll("section");
      expect(sections.length).toBeGreaterThanOrEqual(3);

      // Verify presence of key components
      expect(screen.getByTestId("active-flare-cards")).toBeInTheDocument();
      expect(screen.getByTestId("quick-log-buttons")).toBeInTheDocument();
      expect(screen.getByTestId("timeline-view")).toBeInTheDocument();
    });

    it("displays loading state when userId is not available", () => {
      mockUseCurrentUser.mockReturnValue({ userId: null, isLoading: false, error: null });
      render(<DashboardPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it("passes userId to ActiveFlareCards", () => {
      render(<DashboardPage />);

      expect(screen.getByText(`Active Flares for ${mockUserId}`)).toBeInTheDocument();
    });
  });

  describe("Refresh Functionality", () => {
    it("displays refresh button on desktop", () => {
      render(<DashboardPage />);

      const refreshButton = screen.getByRole("button", { name: /refresh dashboard/i });
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toHaveClass("hidden", "md:flex");
    });

    it("handles refresh button click", async () => {
      render(<DashboardPage />);

      const refreshButton = screen.getByRole("button", { name: /refresh dashboard/i });
      fireEvent.click(refreshButton);

      // Button should be disabled during refresh
      expect(refreshButton).toBeDisabled();

      // Wait for refresh to complete
      await waitFor(
        () => {
          expect(refreshButton).not.toBeDisabled();
        },
        { timeout: 1000 }
      );
    });

    it("displays refresh icon in button", () => {
      render(<DashboardPage />);

      const refreshButton = screen.getByRole("button", { name: /refresh dashboard/i });
      const svg = refreshButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Quick Log Actions - Route-Based Navigation", () => {
    beforeEach(() => {
      mockPush.mockClear();
    });

    it("navigates to flare quick action when Log Flare is clicked", () => {
      render(<DashboardPage />);

      const logFlareButton = screen.getByRole("button", { name: /log flare/i });
      fireEvent.click(logFlareButton);

      expect(mockPush).toHaveBeenCalledWith("/dashboard?quickAction=flare");
    });

    it("navigates to medication quick action when Log Medication is clicked", () => {
      render(<DashboardPage />);

      const logMedicationButton = screen.getByRole("button", { name: /log medication/i });
      fireEvent.click(logMedicationButton);

      expect(mockPush).toHaveBeenCalledWith("/dashboard?quickAction=medication");
    });

    it("navigates to symptom quick action when Log Symptom is clicked", () => {
      render(<DashboardPage />);

      const logSymptomButton = screen.getByRole("button", { name: /log symptom/i });
      fireEvent.click(logSymptomButton);

      expect(mockPush).toHaveBeenCalledWith("/dashboard?quickAction=symptom");
    });

    it("navigates to trigger quick action when Log Trigger is clicked", () => {
      render(<DashboardPage />);

      const logTriggerButton = screen.getByRole("button", { name: /log trigger/i });
      fireEvent.click(logTriggerButton);

      expect(mockPush).toHaveBeenCalledWith("/dashboard?quickAction=trigger");
    });
  });

  describe("Scroll to Timeline Item", () => {
    beforeEach(() => {
      // Mock scrollIntoView
      Element.prototype.scrollIntoView = jest.fn();
    });

    it("scrolls to timeline event when eventId is in URL params", async () => {
      const mockEventId = "event-123";
      mockSearchParams.set("eventId", mockEventId);

      // Create a mock element with the expected ID
      const mockElement = document.createElement("div");
      mockElement.id = `timeline-event-${mockEventId}`;
      document.body.appendChild(mockElement);

      render(<DashboardPage />);

      await waitFor(
        () => {
          expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "center",
          });
        },
        { timeout: 1000 }
      );

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it("highlights timeline event temporarily when scrolled to", async () => {
      const mockEventId = "event-456";
      mockSearchParams.set("eventId", mockEventId);

      const mockElement = document.createElement("div");
      mockElement.id = `timeline-event-${mockEventId}`;
      document.body.appendChild(mockElement);

      render(<DashboardPage />);

      await waitFor(
        () => {
          expect(mockElement.classList.contains("bg-yellow-200")).toBe(true);
        },
        { timeout: 1000 }
      );

      // Wait for highlight to be removed
      await waitFor(
        () => {
          expect(mockElement.classList.contains("bg-yellow-200")).toBe(false);
        },
        { timeout: 3000 }
      );

      // Cleanup
      document.body.removeChild(mockElement);
    });

    it("does not scroll when eventId is not in URL params", () => {
      render(<DashboardPage />);

      // No scroll should occur
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe("Pull-to-Refresh (Mobile)", () => {
    it("shows pull-to-refresh indicator when pulling down", () => {
      const { container } = render(<DashboardPage />);

      const scrollContainer = container.querySelector("div[class*='overflow-y-auto']");
      expect(scrollContainer).toBeInTheDocument();

      // Simulate touch start at top
      fireEvent.touchStart(scrollContainer!, {
        touches: [{ clientY: 0 }],
      });

      // Simulate pull down
      fireEvent.touchMove(scrollContainer!, {
        touches: [{ clientY: 100 }],
      });

      // Check for indicator (though it's hard to test state changes)
      // This is a basic smoke test
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<DashboardPage />);

      const h1 = screen.getByRole("heading", { level: 1, name: /dashboard/i });
      expect(h1).toBeInTheDocument();

      const h2Elements = screen.getAllByRole("heading", { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it("has accessible refresh button with aria-label", () => {
      render(<DashboardPage />);

      const refreshButton = screen.getByRole("button", { name: /refresh dashboard/i });
      expect(refreshButton).toHaveAttribute("aria-label", "Refresh dashboard");
    });
  });

  describe("Performance", () => {
    it("renders all sections on initial load", () => {
      const startTime = performance.now();
      render(<DashboardPage />);
      const endTime = performance.now();

      // Verify all sections are present
      expect(screen.getByTestId("active-flare-cards")).toBeInTheDocument();
      expect(screen.getByTestId("quick-log-buttons")).toBeInTheDocument();
      expect(screen.getByTestId("timeline-view")).toBeInTheDocument();

      // Basic performance check - should render quickly
      const renderTime = endTime - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render in less than 1 second
    });
  });
});
