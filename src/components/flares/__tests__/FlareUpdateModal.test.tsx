import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlareUpdateModal } from "../FlareUpdateModal";
import { ActiveFlare } from "@/lib/types/flare";

describe("FlareUpdateModal", () => {
  const mockFlare: ActiveFlare = {
    id: "flare-1",
    userId: "user-1",
    symptomId: "symptom-1",
    symptomName: "Joint Pain",
    bodyRegionId: "right-armpit",
    bodyRegions: ["right-armpit"],
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    severity: 7,
    status: "active",
    interventions: [],
    notes: "",
    photoIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    flare: mockFlare,
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC-Update-10: Flare Context Display", () => {
    it("should show flare location and day count", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      expect(screen.getByText(/right-armpit - Day 3/i)).toBeInTheDocument();
    });
  });

  describe("AC-Update-11: Previous Severity Display", () => {
    it("should show previous severity", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      expect(screen.getByText("Severity was: 7/10")).toBeInTheDocument();
    });
  });

  describe("AC-Update-12: Severity Slider", () => {
    it("should render severity slider initialized with current severity", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const slider = screen.getByLabelText("Current flare severity");
      expect(slider).toHaveValue("7");
    });

    it("should update display when slider changes", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "9" } });
      expect(screen.getByText("9/10")).toBeInTheDocument();
    });
  });

  describe("AC-Update-13: Status Auto-Detection", () => {
    it("should suggest 'worsening' when severity increases by 2+", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "9" } }); // 7 -> 9 = +2
      expect(screen.getByText(/Getting Worse/i)).toBeInTheDocument();
      expect(screen.getByText("(suggested)")).toBeInTheDocument();
    });

    it("should suggest 'improving' when severity decreases by 2+", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "5" } }); // 7 -> 5 = -2
      expect(screen.getByText(/Improving/i)).toBeInTheDocument();
    });

    it("should suggest 'active' (Same) for small changes", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "8" } }); // 7 -> 8 = +1
      expect(screen.getByText(/Same/i)).toBeInTheDocument();
    });

    it("should allow manual override of suggested status", () => {
      render(<FlareUpdateModal {...defaultProps} />);

      // Auto-suggests "worsening"
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "9" } });

      // Override by clicking "Same"
      const sameButton = screen.getByRole("button", { name: "Mark as Same" });
      fireEvent.click(sameButton);

      expect(sameButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("AC-Update-14: Intervention Buttons", () => {
    it("should render all intervention buttons", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      expect(screen.getByRole("button", { name: "Select Ice intervention" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Select Meds intervention" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Select Rest intervention" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Select Other intervention" })).toBeInTheDocument();
    });

    it("should toggle intervention selection", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const iceButton = screen.getByRole("button", { name: "Select Ice intervention" });

      // Select
      fireEvent.click(iceButton);
      expect(iceButton).toHaveAttribute("aria-pressed", "true");

      // Deselect
      fireEvent.click(iceButton);
      expect(iceButton).toHaveAttribute("aria-pressed", "false");
    });

    it("should only allow one intervention at a time", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const iceButton = screen.getByRole("button", { name: "Select Ice intervention" });
      const medsButton = screen.getByRole("button", { name: "Select Meds intervention" });

      // Select ice
      fireEvent.click(iceButton);
      expect(iceButton).toHaveAttribute("aria-pressed", "true");

      // Select meds (should deselect ice)
      fireEvent.click(medsButton);
      expect(medsButton).toHaveAttribute("aria-pressed", "true");
      expect(iceButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("AC-Update-15: Optional Notes", () => {
    it("should render notes field", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const notesField = screen.getByPlaceholderText("Any additional notes...");
      expect(notesField).toBeInTheDocument();
    });

    it("should capture typed notes", async () => {
      const user = userEvent.setup();
      render(<FlareUpdateModal {...defaultProps} />);
      const notesField = screen.getByPlaceholderText("Any additional notes...");
      await user.type(notesField, "Applied ice for 20 min");
      expect(notesField).toHaveValue("Applied ice for 20 min");
    });
  });

  describe("AC-Update-16: Update Severity", () => {
    it("should call onSave with new severity and auto-detected status", async () => {
      mockOnSave.mockResolvedValue(undefined);
      render(<FlareUpdateModal {...defaultProps} />);

      // Change severity
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "9" } }); // +2 = worsening

      // Save
      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          severity: 9,
          status: "worsening",
          intervention: undefined,
          notes: undefined,
        });
      });
    });

    it("should call onSave with manually selected status", async () => {
      mockOnSave.mockResolvedValue(undefined);
      render(<FlareUpdateModal {...defaultProps} />);

      // Change severity
      const slider = screen.getByLabelText("Current flare severity");
      fireEvent.change(slider, { target: { value: "9" } });

      // Override status
      const sameButton = screen.getByRole("button", { name: "Mark as Same" });
      fireEvent.click(sameButton);

      // Save
      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          severity: 9,
          status: "active",
          intervention: undefined,
          notes: undefined,
        });
      });
    });
  });

  describe("AC-Update-17: Add Intervention", () => {
    it("should include intervention when selected", async () => {
      mockOnSave.mockResolvedValue(undefined);
      render(<FlareUpdateModal {...defaultProps} />);

      // Select intervention
      const iceButton = screen.getByRole("button", { name: "Select Ice intervention" });
      fireEvent.click(iceButton);

      // Save
      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          severity: 7,
          status: "active",
          intervention: "ice",
          notes: undefined,
        });
      });
    });

    it("should not include intervention when none selected", async () => {
      mockOnSave.mockResolvedValue(undefined);
      render(<FlareUpdateModal {...defaultProps} />);

      // Save without selecting intervention
      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          severity: 7,
          status: "active",
          intervention: undefined,
          notes: undefined,
        });
      });
    });
  });

  describe("Modal Behavior", () => {
    it("should not render when isOpen is false", () => {
      render(<FlareUpdateModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should close modal after successful save", async () => {
      mockOnSave.mockResolvedValue(undefined);
      render(<FlareUpdateModal {...defaultProps} />);

      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("should close on backdrop click", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const backdrop = document.querySelector(".fixed.inset-0.bg-black\\/50");
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close on X button click", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const closeButton = screen.getByLabelText("Close modal");
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should close on Escape key", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      fireEvent.keyDown(window, { key: "Escape" });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should show loading state during save", async () => {
      mockOnSave.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
      render(<FlareUpdateModal {...defaultProps} />);

      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText("Saving...")).toBeInTheDocument();
      });
    });

    it("should handle save errors gracefully", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
      mockOnSave.mockRejectedValue(new Error("Save failed"));
      render(<FlareUpdateModal {...defaultProps} />);

      const updateButton = screen.getByRole("button", { name: /Update/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Failed to update flare. Please try again.");
      });

      alertSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "flare-update-title");
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-describedby", "flare-update-description");
    });

    it("should support keyboard navigation", () => {
      render(<FlareUpdateModal {...defaultProps} />);
      const slider = screen.getByLabelText("Current flare severity");
      expect(slider).toHaveAttribute("aria-valuemin", "1");
      expect(slider).toHaveAttribute("aria-valuemax", "10");
      expect(slider).toHaveAttribute("aria-valuenow", "7");
    });
  });

  describe("Flare Day Calculation", () => {
    it("should calculate day count correctly", () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const flare = { ...mockFlare, startDate: twoDaysAgo };
      render(<FlareUpdateModal {...defaultProps} flare={flare} />);
      expect(screen.getByText(/Day 3/i)).toBeInTheDocument();
    });

    it("should show Day 1 for today's flare", () => {
      const today = new Date();
      const flare = { ...mockFlare, startDate: today };
      render(<FlareUpdateModal {...defaultProps} flare={flare} />);
      expect(screen.getByText(/Day 1/i)).toBeInTheDocument();
    });
  });
});
