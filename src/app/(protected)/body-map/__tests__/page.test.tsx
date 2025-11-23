/**
 * Story 0.3 Task 5: Regression coverage for flares page
 * Tests view toggles, default cards-only state, and persisted preferences
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FlaresPage from "../page";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

// Mock dependencies
jest.mock("@/lib/repositories/flareRepository", () => ({
  flareRepository: {
    getActiveFlaresWithTrend: jest.fn(),
  },
}));
jest.mock("@/lib/repositories/userRepository", () => ({
  userRepository: {
    getById: jest.fn(),
    updatePreferences: jest.fn(),
  },
}));
jest.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: jest.fn(() => ({
    userId: "test-user-123",
  })),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => "/flares"),
}));
jest.mock("@/components/body-mapping/BodyMapViewer", () => ({
  BodyMapViewer: () => <div data-testid="body-map-viewer">Body Map Viewer</div>,
}));
jest.mock("@/components/body-mapping/BodyViewSwitcher", () => ({
  BodyViewSwitcher: () => <div data-testid="body-view-switcher">Body View Switcher</div>,
}));
jest.mock("@/components/body-mapping/BodyMapLegend", () => ({
  BodyMapLegend: () => <div data-testid="body-map-legend">Body Map Legend</div>,
}));
// Story 9.4: FlareCreationModal removed - flare creation now uses full-page flow
jest.mock("@/components/flares/ActiveFlareCards", () => ({
  ActiveFlareCards: () => <div data-testid="active-flare-cards">Active Flare Cards</div>,
}));




describe("FlaresPage - Story 0.3", () => {
  const mockUserId = "test-user-123";
  const mockUser = {
    id: mockUserId,
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: "system" as const,
      notifications: { remindersEnabled: false },
      privacy: {
        dataStorage: "encrypted-local" as const,
        analyticsOptIn: false,
        crashReportsOptIn: false,
      },
      exportFormat: "json" as const,
      symptomFilterPresets: [],
      foodFavorites: [],
      flareViewMode: "cards" as const,
    },
  };

  const mockFlares = [
    {
      id: "flare-1",
      userId: mockUserId,
      symptomId: "symptom-1",
      symptomName: "Test Flare 1",
      bodyRegions: ["left-knee"],
      severity: 7,
      status: "active" as const,
      startDate: new Date(),
      notes: "",
      photoIds: [],
      interventions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      trend: "worsening" as const,
    },
    {
      id: "flare-2",
      userId: mockUserId,
      symptomId: "symptom-2",
      symptomName: "Test Flare 2",
      bodyRegions: ["right-shoulder"],
      severity: 5,
      status: "improving" as const,
      startDate: new Date(),
      notes: "",
      photoIds: [],
      interventions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      trend: "improving" as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (userRepository.getById as jest.Mock).mockResolvedValue(mockUser);
    (flareRepository.getActiveFlaresWithTrend as jest.Mock).mockResolvedValue(mockFlares);
    (userRepository.updatePreferences as jest.Mock).mockResolvedValue();
  });

  describe("AC0.3.1 - Cards-first entry with saved preference", () => {
    it("should default to cards-only view", async () => {
      render(<FlaresPage />);

      await waitFor(() => {
        const cardsButton = screen.getByRole("button", { name: /cards only view/i });
        expect(cardsButton).toHaveAttribute("aria-pressed", "true");
      });
    });

    it("should hydrate view mode from user preferences", async () => {
      const userWithMapMode = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          flareViewMode: "map" as const,
        },
      };
      (userRepository.getById as jest.Mock).mockResolvedValue(userWithMapMode);

      render(<FlaresPage />);

      await waitFor(() => {
        const mapButton = screen.getByRole("button", { name: /map only view/i });
        expect(mapButton).toHaveAttribute("aria-pressed", "true");
      });
    });

    it("should persist view mode changes to user preferences", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /map only view/i })).toBeInTheDocument();
      });

      const mapButton = screen.getByRole("button", { name: /map only view/i });
      await user.click(mapButton);

      await waitFor(() => {
        expect(userRepository.updatePreferences).toHaveBeenCalledWith(mockUserId, {
          flareViewMode: "map",
        });
      });
    });

    it("should show CTA buttons when in cards-only mode", async () => {
      render(<FlaresPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/want to visualize where your flares are located/i)
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /explore map view/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /show split layout/i })).toBeInTheDocument();
      });
    });

    it("should hide CTA buttons when not in cards-only mode", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /explore map view/i })).toBeInTheDocument();
      });

      const mapButton = screen.getByRole("button", { name: /map only view/i });
      await user.click(mapButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/want to visualize where your flares are located/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("AC0.3.2 - Progressive body map guidance", () => {
    it("should show map intro when switching from cards to map view", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /explore map view/i })).toBeInTheDocument();
      });

      const exploreMapButton = screen.getByRole("button", { name: /explore map view/i });
      await user.click(exploreMapButton);

      await waitFor(() => {
        expect(screen.getByRole("region", { name: /body map guidance/i })).toBeInTheDocument();
        expect(screen.getByText(/using the body map/i)).toBeInTheDocument();
      });
    });

    it("should allow dismissing map intro", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /explore map view/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /explore map view/i }));

      await waitFor(() => {
        expect(screen.getByRole("region", { name: /body map guidance/i })).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole("button", { name: /dismiss body map guidance/i });
      await user.click(dismissButton);

      await waitFor(() => {
        expect(
          screen.queryByRole("region", { name: /body map guidance/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("AC0.3.3 - Collapsible summary panel", () => {
    it("should render summary panel in collapsed state by default", async () => {
      render(<FlaresPage />);

      await waitFor(() => {
        const expandButton = screen.getByRole("button", { name: /expand summary panel/i });
        expect(expandButton).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("should display correct stats in summary panel", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /expand summary panel/i })).toBeInTheDocument();
      });

      const expandButton = screen.getByRole("button", { name: /expand summary panel/i });
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/1/)).toBeInTheDocument(); // worsening
        expect(screen.getByText(/1/)).toBeInTheDocument(); // improving
      });
    });

    it("should toggle summary panel state", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /expand summary panel/i })).toBeInTheDocument();
      });

      const toggleButton = screen.getByRole("button", { name: /expand summary panel/i });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
        expect(toggleButton).toHaveAccessibleName(/collapse summary panel/i);
      });

      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");
        expect(toggleButton).toHaveAccessibleName(/expand summary panel/i);
      });
    });
  });

  describe("AC0.3.4 - Accessible controls and navigation", () => {
    it("should have proper aria-pressed on view mode toggles", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cards only view/i })).toBeInTheDocument();
      });

      const cardsButton = screen.getByRole("button", { name: /cards only view/i });
      const mapButton = screen.getByRole("button", { name: /map only view/i });
      const splitButton = screen.getByRole("button", { name: /split view/i });

      expect(cardsButton).toHaveAttribute("aria-pressed", "true");
      expect(mapButton).toHaveAttribute("aria-pressed", "false");
      expect(splitButton).toHaveAttribute("aria-pressed", "false");

      await user.click(mapButton);

      await waitFor(() => {
        expect(cardsButton).toHaveAttribute("aria-pressed", "false");
        expect(mapButton).toHaveAttribute("aria-pressed", "true");
        expect(splitButton).toHaveAttribute("aria-pressed", "false");
      });
    });

    it("should have descriptive aria-labels on all CTA buttons", async () => {
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /create new flare/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /switch to map view/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /switch to split view/i })).toBeInTheDocument();
      });
    });

    it("should support keyboard navigation through view toggles", async () => {
      const user = userEvent.setup();
      render(<FlaresPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cards only view/i })).toBeInTheDocument();
      });

      const cardsButton = screen.getByRole("button", { name: /cards only view/i });
      cardsButton.focus();

      expect(cardsButton).toHaveFocus();

      await user.keyboard("{Tab}");
      expect(screen.getByRole("button", { name: /map only view/i })).toHaveFocus();

      await user.keyboard("{Tab}");
      expect(screen.getByRole("button", { name: /split view/i })).toHaveFocus();
    });
  });
});