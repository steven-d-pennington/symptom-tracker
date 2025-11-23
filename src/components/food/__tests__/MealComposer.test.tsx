import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MealComposer } from "../MealComposer";
import type { SelectedFoodItem } from "../MealComposer";
import type { FoodRecord, PortionSize } from "@/lib/db/schema";

// Mock data
const mockFoods: FoodRecord[] = [
  {
    id: "food-1",
    userId: "user-123",
    name: "Oatmeal",
    category: "Grains",
    allergenTags: JSON.stringify(["gluten"]),
    isDefault: true,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "food-2",
    userId: "user-123",
    name: "Milk",
    category: "Dairy",
    allergenTags: JSON.stringify(["dairy"]),
    isDefault: true,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "food-3",
    userId: "user-123",
    name: "Coffee",
    category: "Beverages",
    allergenTags: JSON.stringify([]),
    isDefault: true,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

describe("MealComposer", () => {
  const mockOnRemoveFood = jest.fn();
  const mockOnPortionChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render nothing when no foods selected", () => {
      const { container } = render(
        <MealComposer
          selectedFoods={[]}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render selected foods with correct count", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
        { food: mockFoods[1], portion: "small" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText("2 foods selected")).toBeInTheDocument();
      expect(screen.getByText("Oatmeal")).toBeInTheDocument();
      expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    it("should render singular form for single food", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText("1 food selected")).toBeInTheDocument();
    });

    it("should display food categories", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
        { food: mockFoods[1], portion: "small" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText("Grains")).toBeInTheDocument();
      // Use getAllByText since "Dairy" appears as both category and allergen
      const dairyElements = screen.getAllByText("Dairy");
      expect(dairyElements.length).toBeGreaterThan(0);
    });

    it("should display allergen badges when allergens exist", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText("Gluten")).toBeInTheDocument();
    });

    it("should not display allergen badges when none exist", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[2], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      // Should not have allergen list for coffee (no allergens)
      const allergenElements = screen.queryByText("Dairy");
      expect(allergenElements).not.toBeInTheDocument();
    });
  });

  describe("Portion Size Selection", () => {
    it("should display correct default portion size", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const portionSelect = screen.getByLabelText(`Portion size for ${mockFoods[0].name}`);
      expect(portionSelect).toHaveValue("medium");
    });

    it("should call onPortionChange when portion is changed", async () => {
      const user = userEvent.setup();
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const portionSelect = screen.getByLabelText(`Portion size for ${mockFoods[0].name}`);
      await user.selectOptions(portionSelect, "large");

      expect(mockOnPortionChange).toHaveBeenCalledWith("food-1", "large");
      expect(mockOnPortionChange).toHaveBeenCalledTimes(1);
    });

    it("should have all portion size options available", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const portionSelect = screen.getByLabelText(`Portion size for ${mockFoods[0].name}`);
      const options = Array.from(portionSelect.querySelectorAll("option")).map((opt) => opt.value);

      expect(options).toEqual(["small", "medium", "large"]);
    });

    it("should maintain different portion sizes for different foods", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "small" },
        { food: mockFoods[1], portion: "large" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const oatmealPortion = screen.getByLabelText(`Portion size for ${mockFoods[0].name}`);
      const milkPortion = screen.getByLabelText(`Portion size for ${mockFoods[1].name}`);

      expect(oatmealPortion).toHaveValue("small");
      expect(milkPortion).toHaveValue("large");
    });
  });

  describe("Food Removal", () => {
    it("should call onRemoveFood when remove button is clicked", async () => {
      const user = userEvent.setup();
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const removeButton = screen.getByLabelText(`Remove ${mockFoods[0].name} from meal`);
      await user.click(removeButton);

      expect(mockOnRemoveFood).toHaveBeenCalledWith("food-1");
      expect(mockOnRemoveFood).toHaveBeenCalledTimes(1);
    });

    it("should have remove buttons for all selected foods", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
        { food: mockFoods[1], portion: "small" },
        { food: mockFoods[2], portion: "large" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByLabelText(`Remove ${mockFoods[0].name} from meal`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Remove ${mockFoods[1].name} from meal`)).toBeInTheDocument();
      expect(screen.getByLabelText(`Remove ${mockFoods[2].name} from meal`)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible labels for portion size selectors", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const portionSelect = screen.getByLabelText(`Portion size for ${mockFoods[0].name}`);
      expect(portionSelect).toBeInTheDocument();
    });

    it("should have accessible labels for remove buttons", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const removeButton = screen.getByLabelText(`Remove ${mockFoods[0].name} from meal`);
      expect(removeButton).toBeInTheDocument();
    });

    it("should have proper heading structure", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText("Selected Foods")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle foods with empty allergen arrays", () => {
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[2], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText("Coffee")).toBeInTheDocument();
      expect(screen.queryByText("Dairy")).not.toBeInTheDocument();
    });

    it("should handle rapid portion changes", async () => {
      const user = userEvent.setup();
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const portionSelect = screen.getByLabelText(`Portion size for ${mockFoods[0].name}`);
      
      await user.selectOptions(portionSelect, "small");
      await user.selectOptions(portionSelect, "large");
      await user.selectOptions(portionSelect, "medium");

      expect(mockOnPortionChange).toHaveBeenCalledTimes(3);
      expect(mockOnPortionChange).toHaveBeenNthCalledWith(1, "food-1", "small");
      expect(mockOnPortionChange).toHaveBeenNthCalledWith(2, "food-1", "large");
      expect(mockOnPortionChange).toHaveBeenNthCalledWith(3, "food-1", "medium");
    });

    it("should handle multiple food removals", async () => {
      const user = userEvent.setup();
      const selectedFoods: SelectedFoodItem[] = [
        { food: mockFoods[0], portion: "medium" },
        { food: mockFoods[1], portion: "small" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      const oatmealRemove = screen.getByLabelText(`Remove ${mockFoods[0].name} from meal`);
      const milkRemove = screen.getByLabelText(`Remove ${mockFoods[1].name} from meal`);

      await user.click(oatmealRemove);
      await user.click(milkRemove);

      expect(mockOnRemoveFood).toHaveBeenCalledTimes(2);
      expect(mockOnRemoveFood).toHaveBeenNthCalledWith(1, "food-1");
      expect(mockOnRemoveFood).toHaveBeenNthCalledWith(2, "food-2");
    });

    it("should handle long food names gracefully", () => {
      const longNameFood: FoodRecord = {
        ...mockFoods[0],
        name: "Very Long Food Name That Should Be Handled Properly Without Breaking Layout",
      };

      const selectedFoods: SelectedFoodItem[] = [
        { food: longNameFood, portion: "medium" },
      ];

      render(
        <MealComposer
          selectedFoods={selectedFoods}
          onRemoveFood={mockOnRemoveFood}
          onPortionChange={mockOnPortionChange}
        />
      );

      expect(screen.getByText(longNameFood.name)).toBeInTheDocument();
    });
  });
});
