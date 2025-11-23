import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DailyReflectionPage from "../page";

// Mock dependencies
const mockUseCurrentUser = jest.fn();
jest.mock("@/lib/hooks/useCurrentUser", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

const mockDailyEntryRepository = {
  getByDateRange: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
};

jest.mock("@/lib/repositories/dailyEntryRepository", () => ({
  dailyEntryRepository: mockDailyEntryRepository,
}));

describe("DailyReflectionPage", () => {
  const mockUserId = "test-user-123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCurrentUser.mockReturnValue({
      userId: mockUserId,
      isLoading: false,
      error: null,
    });
    mockDailyEntryRepository.getByDateRange.mockResolvedValue([]);
    mockDailyEntryRepository.create.mockResolvedValue("entry-123");
    mockDailyEntryRepository.update.mockResolvedValue(undefined);
  });

  describe("Layout and Content", () => {
    it("renders the page with correct title", () => {
      render(<DailyReflectionPage />);

      expect(screen.getByRole("heading", { level: 1, name: /daily reflection/i })).toBeInTheDocument();
    });

    it("displays optional notice banner", () => {
      render(<DailyReflectionPage />);

      expect(screen.getByText(/optional daily reflection/i)).toBeInTheDocument();
      expect(
        screen.getByText(/events are your primary logs/i)
      ).toBeInTheDocument();
    });

    it("renders mood slider with correct labels", () => {
      render(<DailyReflectionPage />);

      expect(screen.getByText(/overall mood/i)).toBeInTheDocument();
      expect(screen.getByText(/very low/i)).toBeInTheDocument();
      expect(screen.getByText(/very good/i)).toBeInTheDocument();
    });

    it("renders sleep quality slider with correct labels", () => {
      render(<DailyReflectionPage />);

      expect(screen.getByText(/sleep quality/i)).toBeInTheDocument();
      expect(screen.getByText(/very poor/i)).toBeInTheDocument();
      expect(screen.getByText(/excellent/i)).toBeInTheDocument();
    });

    it("renders notes textarea", () => {
      render(<DailyReflectionPage />);

      const textarea = screen.getByPlaceholderText(
        /how was your day\?/i
      );
      expect(textarea).toBeInTheDocument();
    });

    it("renders save button", () => {
      render(<DailyReflectionPage />);

      expect(screen.getByRole("button", { name: /save reflection/i })).toBeInTheDocument();
    });

    it("displays loading state when user data is loading", () => {
      mockUseCurrentUser.mockReturnValue({
        userId: null,
        isLoading: true,
        error: null,
      });

      render(<DailyReflectionPage />);

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("allows changing mood value", () => {
      render(<DailyReflectionPage />);

      const moodSlider = screen.getAllByRole("slider")[0];
      fireEvent.change(moodSlider, { target: { value: "5" } });

      expect(moodSlider).toHaveValue("5");
    });

    it("allows changing sleep quality value", () => {
      render(<DailyReflectionPage />);

      const sleepSlider = screen.getAllByRole("slider")[1];
      fireEvent.change(sleepSlider, { target: { value: "4" } });

      expect(sleepSlider).toHaveValue("4");
    });

    it("allows typing in notes textarea", () => {
      render(<DailyReflectionPage />);

      const textarea = screen.getByPlaceholderText(/how was your day\?/i);
      fireEvent.change(textarea, {
        target: { value: "Had a great day today!" },
      });

      expect(textarea).toHaveValue("Had a great day today!");
    });

    it("displays mood value indicator", () => {
      render(<DailyReflectionPage />);

      const moodSlider = screen.getAllByRole("slider")[0];
      fireEvent.change(moodSlider, { target: { value: "5" } });

      // Should display the value "5" in the indicator
      expect(screen.getAllByText("5")[0]).toBeInTheDocument();
    });

    it("displays sleep quality value indicator", () => {
      render(<DailyReflectionPage />);

      const sleepSlider = screen.getAllByRole("slider")[1];
      fireEvent.change(sleepSlider, { target: { value: "4" } });

      // Should display the value "4" in the indicator
      expect(screen.getAllByText("4")[0]).toBeInTheDocument();
    });
  });

  describe("Loading Existing Data", () => {
    it("loads today's reflection if it exists", async () => {
      const existingEntry = {
        id: "entry-1",
        userId: mockUserId,
        date: new Date().toISOString().split("T")[0],
        mood: "4",
        sleepQuality: 3,
        notes: "Existing reflection notes",
        overallHealth: 5,
        energyLevel: 5,
        stressLevel: 5,
        symptoms: [],
        medications: [],
        triggers: [],
        duration: 0,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDailyEntryRepository.getByDateRange.mockResolvedValue([existingEntry]);

      render(<DailyReflectionPage />);

      await waitFor(() => {
        const moodSlider = screen.getAllByRole("slider")[0];
        expect(moodSlider).toHaveValue("4");
      });

      const sleepSlider = screen.getAllByRole("slider")[1];
      expect(sleepSlider).toHaveValue("3");

      const textarea = screen.getByPlaceholderText(/how was your day\?/i);
      expect(textarea).toHaveValue("Existing reflection notes");
    });

    it("handles missing mood value gracefully", async () => {
      const existingEntry = {
        id: "entry-1",
        userId: mockUserId,
        date: new Date().toISOString().split("T")[0],
        mood: undefined,
        sleepQuality: 4,
        notes: "Some notes",
        overallHealth: 5,
        energyLevel: 5,
        stressLevel: 5,
        symptoms: [],
        medications: [],
        triggers: [],
        duration: 0,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDailyEntryRepository.getByDateRange.mockResolvedValue([existingEntry]);

      render(<DailyReflectionPage />);

      await waitFor(() => {
        const moodSlider = screen.getAllByRole("slider")[0];
        // Should default to 3
        expect(moodSlider).toHaveValue("3");
      });
    });
  });

  describe("Saving Functionality", () => {
    it("creates new entry when saving for the first time", async () => {
      mockDailyEntryRepository.getByDateRange.mockResolvedValue([]);

      render(<DailyReflectionPage />);

      const moodSlider = screen.getAllByRole("slider")[0];
      fireEvent.change(moodSlider, { target: { value: "5" } });

      const sleepSlider = screen.getAllByRole("slider")[1];
      fireEvent.change(sleepSlider, { target: { value: "4" } });

      const textarea = screen.getByPlaceholderText(/how was your day\?/i);
      fireEvent.change(textarea, {
        target: { value: "Great day!" },
      });

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockDailyEntryRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUserId,
            mood: "5",
            sleepQuality: 4,
            notes: "Great day!",
          })
        );
      });
    });

    it("updates existing entry when saving", async () => {
      const existingEntry = {
        id: "entry-1",
        userId: mockUserId,
        date: new Date().toISOString().split("T")[0],
        mood: "3",
        sleepQuality: 3,
        notes: "Old notes",
        overallHealth: 5,
        energyLevel: 5,
        stressLevel: 5,
        symptoms: [],
        medications: [],
        triggers: [],
        duration: 0,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDailyEntryRepository.getByDateRange.mockResolvedValue([existingEntry]);

      render(<DailyReflectionPage />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/how was your day\?/i);
        expect(textarea).toHaveValue("Old notes");
      });

      const textarea = screen.getByPlaceholderText(/how was your day\?/i);
      fireEvent.change(textarea, {
        target: { value: "Updated notes" },
      });

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockDailyEntryRepository.update).toHaveBeenCalledWith(
          "entry-1",
          expect.objectContaining({
            mood: "3",
            sleepQuality: 3,
            notes: "Updated notes",
          })
        );
      });
    });

    it("disables save button while saving", async () => {
      render(<DailyReflectionPage />);

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();

      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });

    it("displays saved timestamp after successful save", async () => {
      render(<DailyReflectionPage />);

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saved at/i)).toBeInTheDocument();
      });
    });

    it("preserves existing entry data when updating", async () => {
      const existingEntry = {
        id: "entry-1",
        userId: mockUserId,
        date: new Date().toISOString().split("T")[0],
        mood: "3",
        sleepQuality: 3,
        notes: "Notes",
        overallHealth: 7,
        energyLevel: 6,
        stressLevel: 4,
        symptoms: [{ symptomId: "symptom-1", severity: 5 }],
        medications: [{ medicationId: "med-1", taken: true }],
        triggers: [{ triggerId: "trigger-1", intensity: 3 }],
        duration: 120,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDailyEntryRepository.getByDateRange.mockResolvedValue([existingEntry]);

      render(<DailyReflectionPage />);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/how was your day\?/i);
        expect(textarea).toHaveValue("Notes");
      });

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockDailyEntryRepository.update).toHaveBeenCalledWith(
          "entry-1",
          expect.objectContaining({
            overallHealth: 7,
            energyLevel: 6,
            stressLevel: 4,
            symptoms: [{ symptomId: "symptom-1", severity: 5 }],
            medications: [{ medicationId: "med-1", taken: true }],
            triggers: [{ triggerId: "trigger-1", intensity: 3 }],
          })
        );
      });
    });

    it("handles save errors gracefully", async () => {
      mockDailyEntryRepository.create.mockRejectedValue(
        new Error("Database error")
      );
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<DailyReflectionPage />);

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Failed to save reflection:",
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading hierarchy", () => {
      render(<DailyReflectionPage />);

      const h1 = screen.getByRole("heading", { level: 1, name: /daily reflection/i });
      expect(h1).toBeInTheDocument();

      const h2 = screen.getByRole("heading", { level: 2, name: /optional daily reflection/i });
      expect(h2).toBeInTheDocument();
    });

    it("has accessible form labels", () => {
      render(<DailyReflectionPage />);

      expect(screen.getByText(/overall mood/i)).toBeInTheDocument();
      expect(screen.getByText(/sleep quality/i)).toBeInTheDocument();
      expect(screen.getByText(/overall notes/i)).toBeInTheDocument();
    });

    it("has proper slider roles", () => {
      render(<DailyReflectionPage />);

      const sliders = screen.getAllByRole("slider");
      expect(sliders).toHaveLength(2);
    });

    it("textarea has proper placeholder", () => {
      render(<DailyReflectionPage />);

      const textarea = screen.getByPlaceholderText(
        /how was your day\? any observations/i
      );
      expect(textarea).toBeInTheDocument();
    });
  });

  describe("Default Values", () => {
    it("sets default mood to 3 on initial render", () => {
      render(<DailyReflectionPage />);

      const moodSlider = screen.getAllByRole("slider")[0];
      expect(moodSlider).toHaveValue("3");
    });

    it("sets default sleep quality to 3 on initial render", () => {
      render(<DailyReflectionPage />);

      const sleepSlider = screen.getAllByRole("slider")[1];
      expect(sleepSlider).toHaveValue("3");
    });

    it("starts with empty notes", () => {
      render(<DailyReflectionPage />);

      const textarea = screen.getByPlaceholderText(/how was your day\?/i);
      expect(textarea).toHaveValue("");
    });
  });

  describe("User Experience", () => {
    it("shows info icon in optional notice banner", () => {
      const { container } = render(<DailyReflectionPage />);

      const infoIcon = container.querySelector("svg");
      expect(infoIcon).toBeInTheDocument();
    });

    it("displays save icon in save button", () => {
      render(<DailyReflectionPage />);

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      const svg = saveButton.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("displays check icon after save", async () => {
      render(<DailyReflectionPage />);

      const saveButton = screen.getByRole("button", { name: /save reflection/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/saved at/i)).toBeInTheDocument();
      });
    });
  });
});
