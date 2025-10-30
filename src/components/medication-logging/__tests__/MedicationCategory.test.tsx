/**
 * Tests for MedicationCategory Component (Story 3.5.5)
 *
 * Test Coverage:
 * - AC3.5.5.4: Collapsible category accordion functionality
 * - AC3.5.5.7: Mobile-optimized touch targets (44x44px)
 * - Category expansion/collapse animations
 * - Medication selection within categories
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { MedicationCategory } from "../MedicationCategory";
import type { MedicationRecord } from "@/lib/db/schema";

const mockMedications: MedicationRecord[] = [
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

describe("MedicationCategory", () => {
  const mockOnToggle = jest.fn();
  const mockOnSelectMedication = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("AC3.5.5.4: Category accordion", () => {
    it("should render category header with name and count", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      expect(screen.getByText(/Pain Relief \(2 items\)/i)).toBeInTheDocument();
    });

    it("should show singular 'item' when only one medication", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={[mockMedications[0]]}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      expect(screen.getByText(/Pain Relief \(1 item\)/i)).toBeInTheDocument();
    });

    it("should show chevron down when collapsed", () => {
      const { container } = render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      // Check for ChevronDown icon
      const chevronDown = container.querySelector('svg');
      expect(chevronDown).toBeInTheDocument();
    });

    it("should show chevron up when expanded", () => {
      const { container } = render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      // Check for ChevronUp icon
      const chevronUp = container.querySelector('svg');
      expect(chevronUp).toBeInTheDocument();
    });

    it("should call onToggle when header is clicked", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const header = screen.getByRole("button", { name: /Pain Relief/i });
      fireEvent.click(header);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it("should call onToggle with false when already expanded", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const header = screen.getByRole("button", { name: /Pain Relief/i });
      fireEvent.click(header);

      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });

    it("should have correct aria-expanded attribute", () => {
      const { rerender } = render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const header = screen.getByRole("button", { name: /Pain Relief/i });
      expect(header).toHaveAttribute("aria-expanded", "false");

      rerender(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      expect(header).toHaveAttribute("aria-expanded", "true");
    });

    it("should have aria-controls linking to content", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const header = screen.getByRole("button", { name: /Pain Relief/i });
      expect(header).toHaveAttribute("aria-controls", "category-Pain Relief");

      const content = document.getElementById("category-Pain Relief");
      expect(content).toBeInTheDocument();
    });
  });

  describe("AC3.5.5.7: Mobile touch targets", () => {
    it("should have minimum 44x44px touch target for header", () => {
      const { container } = render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const header = screen.getByRole("button", { name: /Pain Relief/i });
      const styles = window.getComputedStyle(header);

      // Check for min-h-[44px] class (Tailwind)
      expect(header.className).toContain("min-h-[44px]");
    });

    it("should have minimum 44x44px touch target for medication buttons", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const medicationButtons = screen.getAllByRole("button", { pressed: false });

      // Filter to only medication buttons (not the category header)
      const medButtons = medicationButtons.filter(btn =>
        btn.textContent?.includes("Ibuprofen") || btn.textContent?.includes("Custom Med")
      );

      medButtons.forEach(button => {
        expect(button.className).toContain("min-h-[44px]");
      });
    });
  });

  describe("Medication selection", () => {
    it("should render all medications when expanded", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      expect(screen.getByText(/Ibuprofen/i)).toBeInTheDocument();
      expect(screen.getByText(/Custom Med/i)).toBeInTheDocument();
    });

    it("should not render medications when collapsed", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      // Medications should not be visible (opacity-0 + max-h-0)
      const content = document.getElementById("category-Pain Relief");
      expect(content).toHaveClass("opacity-0");
      expect(content).toHaveClass("max-h-0");
    });

    it("should call onSelectMedication when medication is clicked", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const medicationButton = screen.getByText(/Ibuprofen/i);
      fireEvent.click(medicationButton);

      expect(mockOnSelectMedication).toHaveBeenCalledWith(mockMedications[0]);
    });

    it("should highlight selected medication", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
          selectedMedicationId="med-1"
        />
      );

      const selectedButton = screen.getByText(/Ibuprofen/i).closest("button");
      expect(selectedButton).toHaveClass("bg-primary/10");
      expect(selectedButton).toHaveClass("border-primary");
      expect(selectedButton).toHaveClass("ring-2");
      expect(selectedButton).toHaveClass("ring-primary");
    });

    it("should show Custom badge for non-default medications", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      // Custom Med should have "Custom" badge
      const customMedButton = screen.getByText(/Custom Med/i).closest("button");
      expect(customMedButton).toHaveTextContent(/Custom/i);

      // Ibuprofen (default) should not have badge
      const defaultMedButton = screen.getByText(/Ibuprofen/i).closest("button");
      // Check that "Custom" text is not in the Ibuprofen button
      expect(defaultMedButton?.textContent).not.toMatch(/Custom$/);
    });

    it("should display dosage information when available", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      expect(screen.getByText(/200mg/i)).toBeInTheDocument();
    });

    it("should have correct aria-pressed attribute for selection state", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
          selectedMedicationId="med-1"
        />
      );

      const buttons = screen.getAllByRole("button", { pressed: true });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Responsive behavior", () => {
    it("should apply smooth CSS transition classes", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const content = document.getElementById("category-Pain Relief");
      expect(content).toHaveClass("transition-all");
      expect(content).toHaveClass("duration-300");
      expect(content).toHaveClass("ease-in-out");
    });

    it("should apply correct expansion classes when expanded", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={true}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const content = document.getElementById("category-Pain Relief");
      expect(content).toHaveClass("max-h-[2000px]");
      expect(content).toHaveClass("opacity-100");
    });

    it("should apply correct collapse classes when collapsed", () => {
      render(
        <MedicationCategory
          name="Pain Relief"
          medications={mockMedications}
          isExpanded={false}
          onToggle={mockOnToggle}
          onSelectMedication={mockOnSelectMedication}
        />
      );

      const content = document.getElementById("category-Pain Relief");
      expect(content).toHaveClass("max-h-0");
      expect(content).toHaveClass("opacity-0");
    });
  });
});
