/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ExportDialog } from "../ExportDialog";
import { exportService } from "@/lib/services";
import { userRepository } from "@/lib/repositories";
import { photoRepository } from "@/lib/repositories/photoRepository";

// Mock the services and repositories
jest.mock("@/lib/services");
jest.mock("@/lib/repositories");
jest.mock("@/lib/repositories/photoRepository");

describe("ExportDialog", () => {
  const mockUser = {
    id: "test-user-123",
    name: "Test User",
  };

  const mockPhotoStats = {
    count: 5,
    totalSize: 1024 * 1024 * 2.5, // 2.5 MB
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mocks
    (userRepository.getCurrentUser as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
    (photoRepository.getStorageStats as jest.Mock) = jest.fn().mockResolvedValue(mockPhotoStats);
    (exportService.downloadExport as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    
    // Mock window.alert
    global.alert = jest.fn();
  });

  describe("Initial Rendering", () => {
    it("should render export button when dialog is closed", () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      expect(button).toBeInTheDocument();
    });

    it("should open dialog when export button is clicked", async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should load photo stats when dialog opens", async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(photoRepository.getStorageStats).toHaveBeenCalledWith(mockUser.id);
      });
    });
  });

  describe("Toggle Interactions", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should toggle food journal checkbox", () => {
      const checkbox = screen.getByRole("checkbox", { name: /food journal/i });
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("should toggle correlations checkbox", () => {
      const checkbox = screen.getByRole("checkbox", { name: /correlations/i });
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should toggle photos checkbox", () => {
      const checkbox = screen.getByRole("checkbox", { name: /photos/i });
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("should show decrypt photos option when photos are included", async () => {
      const photosCheckbox = screen.getByRole("checkbox", { name: /photos/i });
      fireEvent.click(photosCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/decrypt photos for portability/i)).toBeInTheDocument();
      });
    });

    it("should hide decrypt photos option when photos are excluded", async () => {
      const photosCheckbox = screen.getByRole("checkbox", { name: /photos/i });
      
      // Enable photos first
      fireEvent.click(photosCheckbox);
      await waitFor(() => {
        expect(screen.getByText(/decrypt photos for portability/i)).toBeInTheDocument();
      });

      // Disable photos
      fireEvent.click(photosCheckbox);
      await waitFor(() => {
        expect(screen.queryByText(/decrypt photos for portability/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Format Selection", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should default to JSON format", () => {
      const jsonRadio = screen.getByRole("radio", { name: /json/i });
      expect(jsonRadio).toBeChecked();
    });

    it("should switch to CSV format", () => {
      const csvRadio = screen.getByRole("radio", { name: /csv/i });
      fireEvent.click(csvRadio);
      expect(csvRadio).toBeChecked();
    });
  });

  describe("Date Range Validation", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should show date range inputs when enabled", () => {
      const dateRangeCheckbox = screen.getByRole("checkbox", { name: /limit to date range/i });
      fireEvent.click(dateRangeCheckbox);

      const dateInputs = screen.getAllByPlaceholderText(/date/i);
      expect(dateInputs).toHaveLength(2);
    });

    it("should hide date range inputs when disabled", () => {
      const dateRangeCheckbox = screen.getByRole("checkbox", { name: /limit to date range/i });
      
      // Enable first
      fireEvent.click(dateRangeCheckbox);
      expect(screen.getAllByPlaceholderText(/date/i)).toHaveLength(2);

      // Disable
      fireEvent.click(dateRangeCheckbox);
      expect(screen.queryAllByPlaceholderText(/date/i)).toHaveLength(0);
    });

    it("should update date range values", () => {
      const dateRangeCheckbox = screen.getByRole("checkbox", { name: /limit to date range/i });
      fireEvent.click(dateRangeCheckbox);

      const [startInput, endInput] = screen.getAllByPlaceholderText(/date/i);
      
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-12-31" } });

      expect(startInput).toHaveValue("2025-01-01");
      expect(endInput).toHaveValue("2025-12-31");
    });
  });

  describe("Export Functionality", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should call exportService with correct options", async () => {
      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportService.downloadExport).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            format: "json",
            includeSymptoms: true,
            includeMedications: true,
            includeTriggers: true,
            includeDailyEntries: true,
            includeUserData: true,
            includePhotos: false,
            includeFoodJournal: true,
            includeCorrelations: true,
            decryptPhotos: false,
            onlySignificant: true,
          })
        );
      });
    });

    it("should include date range when enabled", async () => {
      const dateRangeCheckbox = screen.getByRole("checkbox", { name: /limit to date range/i });
      fireEvent.click(dateRangeCheckbox);

      const [startInput, endInput] = screen.getAllByPlaceholderText(/date/i);
      fireEvent.change(startInput, { target: { value: "2025-01-01" } });
      fireEvent.change(endInput, { target: { value: "2025-12-31" } });

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportService.downloadExport).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            dateRange: {
              start: "2025-01-01",
              end: "2025-12-31",
            },
          })
        );
      });
    });

    it("should disable export button during export", async () => {
      // Make downloadExport take some time
      (exportService.downloadExport as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      // Button should be disabled
      await waitFor(() => {
        expect(exportButton).toBeDisabled();
        expect(exportButton).toHaveTextContent(/exporting/i);
      });
    });

    it("should close dialog after successful export", async () => {
      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.queryByText(/export your data/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Progress Bar", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should display progress bar during export with progress callback", async () => {
      let progressCallback: ((progress: any) => void) | undefined;

      (exportService.downloadExport as jest.Mock).mockImplementation(
        (userId: string, options: any) => {
          progressCallback = options.onProgress;
          return new Promise((resolve) => {
            setTimeout(() => {
              if (progressCallback) {
                progressCallback({
                  phase: "collecting-data",
                  current: 5,
                  total: 10,
                  message: "Collecting data...",
                });
              }
              setTimeout(resolve, 50);
            }, 50);
          });
        }
      );

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/collecting data/i)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(/5 \/ 10/)).toBeInTheDocument();
      });
    });

    it("should show progress percentage", async () => {
      let progressCallback: ((progress: any) => void) | undefined;

      (exportService.downloadExport as jest.Mock).mockImplementation(
        (userId: string, options: any) => {
          progressCallback = options.onProgress;
          return new Promise((resolve) => {
            setTimeout(() => {
              if (progressCallback) {
                progressCallback({
                  phase: "exporting-photos",
                  current: 7,
                  total: 10,
                  message: "Exporting photos...",
                });
              }
              setTimeout(resolve, 50);
            }, 50);
          });
        }
      );

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/70%/)).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should show alert when export fails", async () => {
      (exportService.downloadExport as jest.Mock).mockRejectedValue(
        new Error("Export failed")
      );

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith("Export failed. Please try again.");
      });
    });

    it("should show alert when no user found", async () => {
      (userRepository.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "No user found. Please complete onboarding first."
        );
      });
    });

    it("should re-enable export button after error", async () => {
      (exportService.downloadExport as jest.Mock).mockRejectedValue(
        new Error("Export failed")
      );

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(exportButton).not.toBeDisabled();
      });
    });
  });

  describe("Accessibility", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should have accessible labels for all checkboxes", () => {
      expect(screen.getByRole("checkbox", { name: /symptoms/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /medications/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /triggers/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /daily entries/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /user data/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /photos/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /food journal/i })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: /correlations/i })).toBeInTheDocument();
    });

    it("should have accessible labels for radio buttons", () => {
      expect(screen.getByRole("radio", { name: /json/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /csv/i })).toBeInTheDocument();
    });

    it("should have accessible button labels", async () => {
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /^export$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it("should disable cancel button during export", async () => {
      (exportService.downloadExport as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(cancelButton).toBeDisabled();
      });
    });
  });

  describe("Photo Stats Display", () => {
    it("should display photo count and size when stats are loaded", async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/5 photos, 2.5 MB/i)).toBeInTheDocument();
      });
    });

    it("should handle missing photo stats gracefully", async () => {
      (photoRepository.getStorageStats as jest.Mock).mockResolvedValue(null);

      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);

      await waitFor(() => {
        // Should still render Photos checkbox without stats
        expect(screen.getByRole("checkbox", { name: /^photos$/i })).toBeInTheDocument();
      });
    });
  });

  describe("Decrypt Photos Warning", () => {
    beforeEach(async () => {
      render(<ExportDialog />);
      const button = screen.getByRole("button", { name: /export data/i });
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: /export your data/i })).toBeInTheDocument();
      });
    });

    it("should show warning when decrypt photos is enabled", async () => {
      const photosCheckbox = screen.getByRole("checkbox", { name: /photos/i });
      fireEvent.click(photosCheckbox);

      await waitFor(() => {
        const decryptCheckbox = screen.getByRole("checkbox", { name: /decrypt photos for portability/i });
        fireEvent.click(decryptCheckbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/⚠️ warning: decrypted photos will not be encrypted/i)).toBeInTheDocument();
      });
    });

    it("should pass decrypt photos option to export service", async () => {
      const photosCheckbox = screen.getByRole("checkbox", { name: /photos/i });
      fireEvent.click(photosCheckbox);

      await waitFor(() => {
        const decryptCheckbox = screen.getByRole("checkbox", { name: /decrypt photos for portability/i });
        fireEvent.click(decryptCheckbox);
      });

      const exportButton = screen.getByRole("button", { name: /^export$/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportService.downloadExport).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            includePhotos: true,
            decryptPhotos: true,
          })
        );
      });
    });
  });
});
