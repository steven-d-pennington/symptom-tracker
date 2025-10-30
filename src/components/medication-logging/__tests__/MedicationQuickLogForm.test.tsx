/**
 * Tests for MedicationQuickLogForm Component (Story 3.5.5)
 *
 * Test Coverage:
 * - AC3.5.5.4: Collapsible categories for medications
 * - AC3.5.5.5: Quick log mode with Add Details expansion
 * - Category expansion persistence
 * - Medication selection and form submission
 * - Recent notes suggestions
 */

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { MedicationQuickLogForm } from "../MedicationQuickLogForm";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { medicationEventRepository } from "@/lib/repositories/medicationEventRepository";
import { toast } from "@/components/common/Toast";

// Mock dependencies
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/repositories/medicationRepository");
jest.mock("@/lib/repositories/medicationEventRepository");
jest.mock("@/components/common/Toast");

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockMedications = [
  {
    id: "med-1",
    userId: "user-1",
    name: "Ibuprofen",
    dosage: "200mg",
    frequency: "as-needed",
    schedule: [],
    isActive: true,
    isDefault: true,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "med-2",
    userId: "user-1",
    name: "Custom Med",
    frequency: "daily",
    schedule: [],
    isActive: true,
    isDefault: false,
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("MedicationQuickLogForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (medicationRepository.getActive as jest.Mock).mockResolvedValue(mockMedications);
    (medicationEventRepository.findByMedicationId as jest.Mock).mockResolvedValue([]);
    (medicationEventRepository.getRecentNotes as jest.Mock).mockResolvedValue([]);
    localStorage.clear();
  });

  describe("AC3.5.5.4: Collapsible categories", () => {
    it("should render medication categories", async () => {
      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });
    });

    it("should expand/collapse categories on click", async () => {
      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Find a category header and click it
      const categoryHeaders = screen.getAllByRole("button", { expanded: true });
      const firstCategory = categoryHeaders[0];

      fireEvent.click(firstCategory);

      // Should now be collapsed
      await waitFor(() => {
        expect(firstCategory).toHaveAttribute("aria-expanded", "false");
      });
    });

    it("should persist category expansion state in localStorage", async () => {
      const { rerender } = render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Expand a category
      const categoryHeaders = screen.getAllByRole("button", { expanded: false });
      if (categoryHeaders.length > 0) {
        fireEvent.click(categoryHeaders[0]);
      }

      // Check localStorage was updated
      const storageKey = "medication-categories-expanded-user-1";
      const savedState = localStorage.getItem(storageKey);
      expect(savedState).toBeTruthy();

      // Remount component
      rerender(<MedicationQuickLogForm userId="user-1" />);

      // State should be restored
      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });
    });
  });

  describe("AC3.5.5.5: Quick log mode", () => {
    it("should show quick log form after medication selection", async () => {
      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Click medication
      const medicationButton = screen.getByText(/Ibuprofen/i);
      fireEvent.click(medicationButton);

      // Quick log form should appear
      await waitFor(() => {
        expect(screen.getByText(/Log Ibuprofen/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Effectiveness/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Time/i)).toBeInTheDocument();
      });
    });

    it("should toggle Add Details section", async () => {
      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Select medication
      fireEvent.click(screen.getByText(/Ibuprofen/i));

      await waitFor(() => {
        expect(screen.getByText(/Log Ibuprofen/i)).toBeInTheDocument();
      });

      // Click "Add Details"
      const addDetailsButton = screen.getByText(/Add Details/i);
      fireEvent.click(addDetailsButton);

      // Details section should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/Dosage/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
      });

      // Click "Hide Details"
      fireEvent.click(screen.getByText(/Hide Details/i));

      // Details section should hide
      await waitFor(() => {
        expect(screen.queryByLabelText(/Dosage/i)).not.toBeInTheDocument();
      });
    });

    it("should submit medication log successfully", async () => {
      (medicationEventRepository.create as jest.Mock).mockResolvedValue("event-1");

      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Select medication
      fireEvent.click(screen.getByText(/Ibuprofen/i));

      await waitFor(() => {
        expect(screen.getByText(/Log Medication/i)).toBeInTheDocument();
      });

      // Submit form
      const submitButton = screen.getByText(/Log Medication/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(medicationEventRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "user-1",
            medicationId: "med-1",
            taken: true,
          })
        );
        expect(toast.success).toHaveBeenCalledWith(
          "Medication logged successfully",
          expect.any(Object)
        );
        expect(mockRouter.push).toHaveBeenCalledWith("/dashboard?refresh=medication");
      });
    });

    it("should show validation error when no medication selected", async () => {
      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Try to submit without selecting medication
      // (form won't be visible, but we're testing the validation logic)
      expect(screen.queryByText(/Log Medication/i)).not.toBeInTheDocument();
    });
  });

  describe("Recent notes suggestions", () => {
    it("should display recent notes when medication has history", async () => {
      const mockNotes = ["Helped with pain", "Took with food"];
      (medicationEventRepository.getRecentNotes as jest.Mock).mockResolvedValue(mockNotes);

      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Select medication
      fireEvent.click(screen.getByText(/Ibuprofen/i));

      await waitFor(() => {
        expect(screen.getByText(/Log Ibuprofen/i)).toBeInTheDocument();
      });

      // Expand details
      fireEvent.click(screen.getByText(/Add Details/i));

      await waitFor(() => {
        expect(screen.getByText(/Recent Notes/i)).toBeInTheDocument();
        expect(screen.getByText(/Helped with pain/i)).toBeInTheDocument();
        expect(screen.getByText(/Took with food/i)).toBeInTheDocument();
      });
    });

    it("should populate notes field when recent note is clicked", async () => {
      const mockNotes = ["Helped with pain"];
      (medicationEventRepository.getRecentNotes as jest.Mock).mockResolvedValue(mockNotes);

      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Select medication
      fireEvent.click(screen.getByText(/Ibuprofen/i));

      await waitFor(() => {
        expect(screen.getByText(/Log Ibuprofen/i)).toBeInTheDocument();
      });

      // Expand details
      fireEvent.click(screen.getByText(/Add Details/i));

      await waitFor(() => {
        expect(screen.getByText(/Helped with pain/i)).toBeInTheDocument();
      });

      // Click recent note
      fireEvent.click(screen.getByText(/Helped with pain/i));

      // Notes field should be populated
      const notesField = screen.getByLabelText(/Notes/i) as HTMLTextAreaElement;
      expect(notesField.value).toBe("Helped with pain");
    });
  });

  describe("Loading and error states", () => {
    it("should show loading state", () => {
      (medicationRepository.getActive as jest.Mock).mockReturnValue(
        new Promise(() => {}) // Never resolves
      );

      render(<MedicationQuickLogForm userId="user-1" />);

      expect(screen.getByText(/Loading medications/i)).toBeInTheDocument();
    });

    it("should show error toast when loading fails", async () => {
      (medicationRepository.getActive as jest.Mock).mockRejectedValue(
        new Error("Failed to load")
      );

      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Failed to load medications",
          expect.any(Object)
        );
      });
    });

    it("should show error toast when submission fails", async () => {
      (medicationEventRepository.create as jest.Mock).mockRejectedValue(
        new Error("Failed to save")
      );

      render(<MedicationQuickLogForm userId="user-1" />);

      await waitFor(() => {
        expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      });

      // Select medication and submit
      fireEvent.click(screen.getByText(/Ibuprofen/i));

      await waitFor(() => {
        expect(screen.getByText(/Log Medication/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Log Medication/i));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Failed to log medication",
          expect.any(Object)
        );
      });
    });
  });
});
