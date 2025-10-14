import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlareCreationModal } from "../FlareCreationModal";

// Mock child components to isolate modal logic
jest.mock("@/components/body-mapping/BodyMapViewer", () => ({
  BodyMapViewer: ({ onRegionSelect }: any) => (
    <div data-testid="body-map-viewer">
      <button onClick={() => onRegionSelect("right-armpit")} data-testid="select-region-btn">
        Select Right Armpit
      </button>
    </div>
  ),
}));

describe("FlareCreationModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    userId: "user-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC-Creation-1: Body Map Integration", () => {
    it("should render BodyMapViewer when modal is open", () => {
      render(<FlareCreationModal {...defaultProps} />);
      expect(screen.getByTestId("body-map-viewer")).toBeInTheDocument();
    });

    it("should allow region selection via BodyMapViewer", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const selectButton = screen.getByTestId("select-region-btn");
      fireEvent.click(selectButton);
      expect(screen.getByText(/Selected: right-armpit/i)).toBeInTheDocument();
    });
  });

  describe("AC-Creation-2: Severity Slider", () => {
    it("should render severity slider with range 1-10", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const slider = screen.getByLabelText("Flare severity");
      expect(slider).toHaveAttribute("min", "1");
      expect(slider).toHaveAttribute("max", "10");
      expect(slider).toHaveAttribute("step", "1");
    });

    it("should display current severity value", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const display = screen.getByText("5/10");
      expect(display).toBeInTheDocument();
    });

    it("should update display when slider changes", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const slider = screen.getByLabelText("Flare severity");
      fireEvent.change(slider, { target: { value: "8" } });
      expect(screen.getByText("8/10")).toBeInTheDocument();
    });

    it("should show severity labels", () => {
      render(<FlareCreationModal {...defaultProps} />);
      expect(screen.getByText("1 = Minimal")).toBeInTheDocument();
      expect(screen.getByText("10 = Excruciating")).toBeInTheDocument();
    });
  });

  describe("AC-Creation-3: Optional Notes Field", () => {
    it("should render notes field with placeholder", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const notesField = screen.getByPlaceholderText("Any details? (optional)");
      expect(notesField).toBeInTheDocument();
    });

    it("should capture typed notes", async () => {
      const user = userEvent.setup();
      render(<FlareCreationModal {...defaultProps} />);
      const notesField = screen.getByPlaceholderText("Any details? (optional)");
      await user.type(notesField, "Started after exercise");
      expect(notesField).toHaveValue("Started after exercise");
    });
  });

  describe("AC-Creation-4: Save Buttons", () => {
    it("should render both Save and Add Details buttons", () => {
      render(<FlareCreationModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Save flare" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Save and add more details" })).toBeInTheDocument();
    });

    it("should call onSave with correct data when Save is clicked", async () => {
      render(<FlareCreationModal {...defaultProps} />);

      // Select region
      fireEvent.click(screen.getByTestId("select-region-btn"));

      // Change severity
      const slider = screen.getByLabelText("Flare severity");
      fireEvent.change(slider, { target: { value: "7" } });

      // Add notes
      const notesField = screen.getByPlaceholderText("Any details? (optional)");
      fireEvent.change(notesField, { target: { value: "Sharp pain" } });

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          bodyRegionId: "right-armpit",
          severity: 7,
          notes: "Sharp pain",
        });
      });
    });
  });

  describe("AC-Creation-7: Modal Close After Save", () => {
    it("should close modal after successful save", async () => {
      mockOnSave.mockResolvedValue(undefined);
      render(<FlareCreationModal {...defaultProps} />);

      // Select region (required)
      fireEvent.click(screen.getByTestId("select-region-btn"));

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe("AC-Creation-8: Form Validation", () => {
    it("should require body location", async () => {
      render(<FlareCreationModal {...defaultProps} />);

      // Try to save without selecting location
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Please select a body location")).toBeInTheDocument();
      });

      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it("should allow save after location is selected", async () => {
      render(<FlareCreationModal {...defaultProps} />);

      // Select region
      fireEvent.click(screen.getByTestId("select-region-btn"));

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it("should not require notes (optional field)", async () => {
      render(<FlareCreationModal {...defaultProps} />);

      // Select region only
      fireEvent.click(screen.getByTestId("select-region-btn"));

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          bodyRegionId: "right-armpit",
          severity: 5, // default
          notes: undefined,
        });
      });
    });
  });

  describe("AC-Creation-9: Responsive Design", () => {
    it("should render dialog with correct classes", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("max-w-2xl");
    });
  });

  describe("Modal Behavior", () => {
    it("should not render when isOpen is false", () => {
      render(<FlareCreationModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should close on X button click", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close on Escape key", () => {
      render(<FlareCreationModal {...defaultProps} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should show loading state during save", async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<FlareCreationModal {...defaultProps} />);

      // Select region
      fireEvent.click(screen.getByTestId("select-region-btn"));

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Saving...")).toBeInTheDocument();
      });
    });

    it("should show error message on save failure", async () => {
      mockOnSave.mockRejectedValue(new Error("Save failed"));
      render(<FlareCreationModal {...defaultProps} />);

      // Select region
      fireEvent.click(screen.getByTestId("select-region-btn"));

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save flare" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Failed to save flare. Please try again.")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<FlareCreationModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "flare-creation-title");
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby", "flare-creation-description");
    });

    it("should support keyboard navigation", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const slider = screen.getByLabelText("Flare severity");
      expect(slider).toHaveAttribute("aria-valuemin", "1");
      expect(slider).toHaveAttribute("aria-valuemax", "10");
      expect(slider).toHaveAttribute("aria-valuenow", "5");
    });
  });

  describe("View Picker", () => {
    it("should render view picker buttons", () => {
      render(<FlareCreationModal {...defaultProps} />);
      expect(screen.getByText("front")).toBeInTheDocument();
      expect(screen.getByText("back")).toBeInTheDocument();
      expect(screen.getByText("left")).toBeInTheDocument();
      expect(screen.getByText("right")).toBeInTheDocument();
    });

    it("should highlight selected view", () => {
      render(<FlareCreationModal {...defaultProps} />);
      const frontButton = screen.getByText("front");
      expect(frontButton).toHaveClass("bg-primary");
    });
  });
});
