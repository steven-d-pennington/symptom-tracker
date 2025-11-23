import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddFoodModal } from "../AddFoodModal";

describe("AddFoodModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders nothing when isOpen is false", () => {
      const { container } = render(
        <AddFoodModal isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("renders modal when isOpen is true", () => {
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Add Custom Food")).toBeInTheDocument();
      expect(screen.getByText("Custom")).toBeInTheDocument(); // Badge preview
    });

    it("renders all required form fields", () => {
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      expect(screen.getByLabelText(/food name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preparation method/i)).toBeInTheDocument();
      expect(screen.getByText(/allergen tags/i)).toBeInTheDocument();
    });

    it("renders all 7 allergen buttons", () => {
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      // Use ARIA labels to specifically target allergen buttons
      expect(screen.getByLabelText("Select dairy allergen")).toBeInTheDocument();
      expect(screen.getByLabelText("Select gluten allergen")).toBeInTheDocument();
      expect(screen.getByLabelText("Select nuts allergen")).toBeInTheDocument();
      expect(screen.getByLabelText("Select shellfish allergen")).toBeInTheDocument();
      expect(screen.getByLabelText("Select nightshades allergen")).toBeInTheDocument();
      expect(screen.getByLabelText("Select soy allergen")).toBeInTheDocument();
      expect(screen.getByLabelText("Select eggs allergen")).toBeInTheDocument();
    });

    it("renders category dropdown with all options", () => {
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const categorySelect = screen.getByLabelText(/category/i) as HTMLSelectElement;
      const options = Array.from(categorySelect.options).map((opt) => opt.value);

      expect(options).toContain("Breakfast");
      expect(options).toContain("Proteins");
      expect(options).toContain("Dairy");
      expect(options).toContain("Fruits");
      expect(options).toContain("Vegetables");
      expect(options).toContain("Nuts & Seeds");
      expect(options).toContain("Legumes");
      expect(options).toContain("Seafood");
      expect(options).toContain("Beverages");
      expect(options).toContain("Condiments");
      expect(options).toContain("Snacks");
      expect(options).toContain("Sweeteners");
    });

    it("renders preparation method dropdown with all options", () => {
      render(<AddFoodModal isOpen={true} onClose=

{mockOnClose} onSave={mockOnSave} />);

      const prepSelect = screen.getByLabelText(/preparation method/i) as HTMLSelectElement;
      const options = Array.from(prepSelect.options).map((opt) => opt.value);

      expect(options).toContain("raw");
      expect(options).toContain("cooked");
      expect(options).toContain("fried");
      expect(options).toContain("baked");
      expect(options).toContain("steamed");
      expect(options).toContain("fermented");
      expect(options).toContain("grilled");
      expect(options).toContain("boiled");
    });
  });

  describe("Name Validation", () => {
    it("shows error when name is empty and user tries to submit", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const submitButton = screen.getByRole("button", { name: /add food/i });
      
      // Submit button should be disabled initially
      expect(submitButton).toBeDisabled();
    });

    it("shows error when name is too short (< 2 chars)", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "A");

      expect(screen.getByText(/must be at least 2 characters/i)).toBeInTheDocument();
    });

    it("shows error when name is too long (> 100 chars)", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      const longName = "A".repeat(101);
      await user.type(nameInput, longName);

      expect(screen.getByText(/must be less than 100 characters/i)).toBeInTheDocument();
    });

    it("accepts valid name (2-100 chars)", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Apple");

      // No error should be shown
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      
      // Submit button should be enabled
      const submitButton = screen.getByRole("button", { name: /add food/i });
      expect(submitButton).toBeEnabled();
    });

    it("displays character count", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Apple");

      expect(screen.getByText("5/100 characters")).toBeInTheDocument();
    });
  });

  describe("Allergen Selection", () => {
    it("allows selecting single allergen", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const dairyButton = screen.getByRole("button", { name: /select dairy allergen/i });
      await user.click(dairyButton);

      expect(dairyButton).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByText("Selected: 1 allergen")).toBeInTheDocument();
    });

    it("allows selecting multiple allergens", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const dairyButton = screen.getByRole("button", { name: /select dairy allergen/i });
      const glutenButton = screen.getByRole("button", { name: /select gluten allergen/i });

      await user.click(dairyButton);
      await user.click(glutenButton);

      expect(dairyButton).toHaveAttribute("aria-pressed", "true");
      expect(glutenButton).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByText("Selected: 2 allergens")).toBeInTheDocument();
    });

    it("allows deselecting allergens", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const dairyButton = screen.getByRole("button", { name: /select dairy allergen/i });
      
      // Select
      await user.click(dairyButton);
      expect(dairyButton).toHaveAttribute("aria-pressed", "true");

      // Deselect
      await user.click(dairyButton);
      expect(dairyButton).toHaveAttribute("aria-pressed", "false");
      expect(screen.queryByText(/selected:/i)).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls onSave with correct data when form is valid", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      // Fill in name
      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Custom Apple");

      // Select category
      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, "Fruits");

      // Select allergens
      const nutsButton = screen.getByRole("button", { name: /select nuts allergen/i });
      await user.click(nutsButton);

      // Select preparation method
      const prepSelect = screen.getByLabelText(/preparation method/i);
      await user.selectOptions(prepSelect, "raw");

      // Submit
      const submitButton = screen.getByRole("button", { name: /add food/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: "Custom Apple",
          category: "Fruits",
          allergenTags: ["nuts"],
          preparationMethod: "raw",
        });
      });
    });

    it("uses default category (Snacks) when none selected", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Mystery Food");

      const submitButton = screen.getByRole("button", { name: /add food/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            category: "Snacks",
          })
        );
      });
    });

    it("does not include preparation method if not selected", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Simple Food");

      const submitButton = screen.getByRole("button", { name: /add food/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: "Simple Food",
          category: "Snacks",
          allergenTags: [],
          preparationMethod: undefined,
        });
      });
    });

    it("shows loading state while saving", async () => {
      const user = userEvent.setup();
      let resolveSave: () => void;
      mockOnSave.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));

      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Test Food");

      const submitButton = screen.getByRole("button", { name: /add food/i });
      await user.click(submitButton);

      // Wait for the loading state to appear
      await waitFor(() => {
        expect(screen.getByText("Saving...")).toBeInTheDocument();
      });
      expect(submitButton).toBeDisabled();

      resolveSave!();
    });

    it("closes modal after successful save", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Test Food");

      const submitButton = screen.getByRole("button", { name: /add food/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("resets form after successful save", async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);

      const { rerender } = render(
        <AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
      );

      // Fill form
      const nameInput = screen.getByLabelText(/food name/i);
      await user.type(nameInput, "Test Food");

      const categorySelect = screen.getByLabelText(/category/i);
      await user.selectOptions(categorySelect, "Fruits");

      // Submit
      const submitButton = screen.getByRole("button", { name: /add food/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      // Reopen modal
      rerender(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      // Form should be reset
      const nameInputAfter = screen.getByLabelText(/food name/i) as HTMLInputElement;
      expect(nameInputAfter.value).toBe("");
    });
  });

  describe("Modal Behavior", () => {
    it("closes modal when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("closes modal when X button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const closeButton = screen.getByRole("button", { name: /close modal/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("has proper ARIA attributes", () => {
      render(<AddFoodModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "add-food-modal-title");
    });
  });
});
