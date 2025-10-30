/**
 * Integration Tests for Medication Logging Page (Story 3.5.5)
 *
 * Test Coverage:
 * - AC3.5.5.2: Dedicated page route at /log/medication
 * - AC3.5.5.7: Mobile-responsive design with proper layout
 * - Page navigation and user authentication
 * - Full-page natural scrolling
 */

import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import LogMedicationPage from "../page";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/hooks/useCurrentUser");

jest.mock("@/components/medication-logging/MedicationQuickLogForm", () => ({
  MedicationQuickLogForm: ({ userId }: { userId: string }) => (
    <div data-testid="medication-quick-log-form">
      Medication Form for {userId}
    </div>
  ),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

describe("LogMedicationPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe("AC3.5.5.2: Page route and structure", () => {
    it("should render the medication logging page", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Log Medication/i)).toBeInTheDocument();
      });
    });

    it("should render header with back button", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      await waitFor(() => {
        const backButton = screen.getByRole("button", { name: /Go back to previous page/i });
        expect(backButton).toBeInTheDocument();
      });
    });

    it("should render breadcrumb navigation", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        expect(screen.getByText(/Log Medication/i)).toBeInTheDocument();
      });
    });

    it("should render MedicationQuickLogForm when user is loaded", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      await waitFor(() => {
        expect(screen.getByTestId("medication-quick-log-form")).toBeInTheDocument();
        expect(screen.getByText(/Medication Form for user-1/i)).toBeInTheDocument();
      });
    });
  });

  describe("Authentication and loading states", () => {
    it("should show loading state while user data is loading", () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: null,
        isLoading: true,
      });

      render(<LogMedicationPage />);

      expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
    });

    it("should show login prompt when user is not authenticated", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: null,
        isLoading: false,
      });

      render(<LogMedicationPage />);

      await waitFor(() => {
        expect(screen.getByText(/Please log in to continue/i)).toBeInTheDocument();
      });
    });
  });

  describe("AC3.5.5.7: Responsive layout", () => {
    it("should have full-page layout with background", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      const { container } = render(<LogMedicationPage />);

      const main = container.querySelector("main");
      expect(main).toHaveClass("min-h-screen");
      expect(main).toHaveClass("bg-background");
    });

    it("should have sticky header", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      const { container } = render(<LogMedicationPage />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("sticky");
      expect(header).toHaveClass("top-0");
      expect(header).toHaveClass("z-10");
    });

    it("should have centered container with max width", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      const { container } = render(<LogMedicationPage />);

      const contentContainer = container.querySelector(".container");
      expect(contentContainer).toHaveClass("mx-auto");
      expect(contentContainer).toHaveClass("max-w-2xl");
    });

    it("should have mobile-friendly padding", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      const { container } = render(<LogMedicationPage />);

      const contentContainer = container.querySelector(".container");
      expect(contentContainer).toHaveClass("px-4");
    });

    it("should use theme-aware colors", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      const { container } = render(<LogMedicationPage />);

      const main = container.querySelector("main");
      expect(main).toHaveClass("bg-background");

      const header = container.querySelector("header");
      expect(header).toHaveClass("bg-card");
      expect(header).toHaveClass("border-b");
      expect(header).toHaveClass("border-border");
    });
  });

  describe("Navigation", () => {
    it("should navigate back when back button is clicked", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      const backButton = await screen.findByRole("button", {
        name: /Go back to previous page/i,
      });

      backButton.click();

      expect(mockRouter.back).toHaveBeenCalled();
    });

    it("should navigate to dashboard when Home breadcrumb is clicked", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      const homeLink = await screen.findByText(/Home/i);
      homeLink.click();

      expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for navigation", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      await waitFor(() => {
        const breadcrumb = screen.getByRole("navigation", { name: /Breadcrumb/i });
        expect(breadcrumb).toBeInTheDocument();
      });
    });

    it("should have semantic HTML structure", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      const { container } = render(<LogMedicationPage />);

      const main = container.querySelector("main");
      expect(main).toBeInTheDocument();

      const header = container.querySelector("header");
      expect(header).toBeInTheDocument();

      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("should have touch-friendly button size", async () => {
      (useCurrentUser as jest.Mock).mockReturnValue({
        userId: "user-1",
        isLoading: false,
      });

      render(<LogMedicationPage />);

      const backButton = await screen.findByRole("button", {
        name: /Go back to previous page/i,
      });

      expect(backButton).toHaveClass("min-h-[44px]");
      expect(backButton).toHaveClass("min-w-[44px]");
    });
  });
});
