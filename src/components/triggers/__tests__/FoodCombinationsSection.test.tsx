/**
 * Tests for FoodCombinationsSection component
 * Tests rendering, filtering, sorting, and empty states
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import userEvent from "@testing-library/user-event";
import FoodCombinationsSection from "../FoodCombinationsSection";
import type { FoodCombination } from "@/lib/services/food/CombinationAnalysisService";

const createCombination = (overrides: Partial<FoodCombination>): FoodCombination => ({
  foodIds: ["food-1", "food-2"],
  foodNames: ["Food A", "Food B"],
  symptomId: "symptom-1",
  symptomName: "Headache",
  combinationCorrelation: 0.75,
  individualMax: 0.50,
  synergistic: true,
  pValue: 0.01,
  confidence: "high",
  sampleSize: 10,
  computedAt: Date.now(),
  ...overrides,
});

describe("FoodCombinationsSection", () => {
  describe("Rendering", () => {
    it("renders section header with combination count", () => {
      const combinations = [
        createCombination({ synergistic: true }),
        createCombination({ synergistic: true, foodNames: ["Food C", "Food D"] }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      expect(screen.getByText("Food Combinations")).toBeInTheDocument();
      expect(screen.getByText("2 synergistic combinations detected")).toBeInTheDocument();
    });

    it("renders singular form when one synergistic combination", () => {
      const combinations = [createCombination({ synergistic: true })];

      render(<FoodCombinationsSection combinations={combinations} />);

      expect(screen.getByText("1 synergistic combination detected")).toBeInTheDocument();
    });

    it("displays combination cards for synergistic combinations", () => {
      const combinations = [
        createCombination({ foodNames: ["Cheese", "Wine"], synergistic: true }),
        createCombination({ foodNames: ["Bread", "Butter"], synergistic: true }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      expect(screen.getByText("Cheese + Wine")).toBeInTheDocument();
      expect(screen.getByText("Bread + Butter")).toBeInTheDocument();
    });

    it("displays loading state when isLoading is true", () => {
      render(<FoodCombinationsSection combinations={[]} isLoading={true} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText("Analyzing food combinations...")).toBeInTheDocument();
    });
  });

  describe("Filtering", () => {
    it("shows only synergistic combinations by default", () => {
      const combinations = [
        createCombination({ foodNames: ["Cheese", "Wine"], synergistic: true }),
        createCombination({
          foodNames: ["Apple", "Banana"],
          synergistic: false,
          combinationCorrelation: 0.55,
        }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      expect(screen.getByText("Cheese + Wine")).toBeInTheDocument();
      expect(screen.queryByText("Apple + Banana")).not.toBeInTheDocument();
    });

    it("shows all combinations when filter is toggled off", async () => {
      const user = userEvent.setup();
      const combinations = [
        createCombination({ foodNames: ["Cheese", "Wine"], synergistic: true }),
        createCombination({
          foodNames: ["Apple", "Banana"],
          synergistic: false,
          combinationCorrelation: 0.55,
        }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      expect(screen.getByText("Cheese + Wine")).toBeInTheDocument();
      expect(screen.getByText("Apple + Banana")).toBeInTheDocument();
    });

    it("updates toggle aria-checked attribute", async () => {
      const user = userEvent.setup();
      const combinations = [createCombination({})];

      render(<FoodCombinationsSection combinations={combinations} />);

      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAttribute("aria-checked", "true");

      await user.click(toggle);
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });

    it("updates screen reader text when toggled", async () => {
      const user = userEvent.setup();
      const combinations = [createCombination({})];

      render(<FoodCombinationsSection combinations={combinations} />);

      const toggle = screen.getByRole("switch");
      const srText = screen.getByText("Showing only synergistic combinations");
      expect(srText).toBeInTheDocument();

      await user.click(toggle);
      expect(screen.getByText("Showing all combinations")).toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    it("sorts combinations by synergy strength descending", () => {
      const combinations = [
        createCombination({
          foodNames: ["Weak", "Combo"],
          combinationCorrelation: 0.60,
          individualMax: 0.50, // Delta: 0.10
        }),
        createCombination({
          foodNames: ["Strong", "Combo"],
          combinationCorrelation: 0.80,
          individualMax: 0.50, // Delta: 0.30
        }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      const cards = screen.getAllByRole("listitem");
      expect(cards[0]).toHaveTextContent("Strong + Combo");
      expect(cards[1]).toHaveTextContent("Weak + Combo");
    });

    it("limits display to top 5 combinations", () => {
      const combinations = Array.from({ length: 10 }, (_, i) =>
        createCombination({
          foodNames: [`Food ${i}A`, `Food ${i}B`],
          combinationCorrelation: 0.70 - i * 0.05,
        })
      );

      render(<FoodCombinationsSection combinations={combinations} />);

      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(5);
      expect(screen.getByText("Showing top 5 of 10 combinations")).toBeInTheDocument();
    });
  });

  describe("Empty States", () => {
    it("shows empty state when no combinations exist", () => {
      render(<FoodCombinationsSection combinations={[]} />);

      expect(screen.getByText("No synergistic combinations found")).toBeInTheDocument();
      expect(
        screen.getByText(/Try toggling the filter to see all combinations/)
      ).toBeInTheDocument();
    });

    it("shows different empty state when filter is off", async () => {
      const user = userEvent.setup();
      render(<FoodCombinationsSection combinations={[]} />);

      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      expect(screen.getByText("No combinations detected")).toBeInTheDocument();
      expect(
        screen.getByText(/Log meals with multiple foods to detect combination effects/)
      ).toBeInTheDocument();
    });

    it("shows synergy-specific empty state when only non-synergistic combinations exist", () => {
      const combinations = [
        createCombination({
          synergistic: false,
          combinationCorrelation: 0.55,
        }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      // With synergistic filter on, should show empty state
      expect(screen.getByText("No synergistic combinations found")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("calls onSelectCombination when card is clicked", async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn<(combination: FoodCombination) => void>();
      const combination = createCombination({ foodNames: ["Cheese", "Wine"] });

      render(
        <FoodCombinationsSection
          combinations={[combination]}
          onSelectCombination={onSelect}
        />
      );

      const card = screen.getByRole("button", { name: /Cheese \+ Wine/ });
      await user.click(card);

      expect(onSelect).toHaveBeenCalledWith(combination);
    });

    it("does not require onSelectCombination callback", () => {
      const combination = createCombination({});

      render(<FoodCombinationsSection combinations={[combination]} />);

      // Should render without callback
      expect(screen.getByText("Food A + Food B")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for loading state", () => {
      render(<FoodCombinationsSection combinations={[]} isLoading={true} />);

      const loadingElement = screen.getByRole("status");
      expect(loadingElement).toHaveAttribute("aria-live", "polite");
      expect(loadingElement).toHaveAttribute("aria-label", "Loading food combinations");
    });

    it("has proper role for combinations list", () => {
      const combinations = [createCombination({})];

      render(<FoodCombinationsSection combinations={combinations} />);

      expect(screen.getByRole("list", { name: "Food combinations" })).toBeInTheDocument();
    });

    it("marks each combination as a list item", () => {
      const combinations = [
        createCombination({ foodNames: ["A", "B"] }),
        createCombination({ foodNames: ["C", "D"] }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(2);
    });

    it("provides accessible label for filter toggle", () => {
      render(<FoodCombinationsSection combinations={[]} />);

      const label = screen.getByText("Show only synergistic:");
      expect(label).toHaveAttribute("for", "synergy-filter");

      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAttribute("id", "synergy-filter");
    });
  });

  describe("Count display", () => {
    it("shows correct count when showing all combinations", async () => {
      const user = userEvent.setup();
      const combinations = [
        createCombination({ synergistic: true }),
        createCombination({ synergistic: true }),
        createCombination({ synergistic: false }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      // Should show all 3 combinations
      const cards = screen.getAllByRole("listitem");
      expect(cards).toHaveLength(3);
    });

    it("does not show 'top 5' message when fewer than 6 combinations", () => {
      const combinations = [
        createCombination({}),
        createCombination({ foodNames: ["C", "D"] }),
      ];

      render(<FoodCombinationsSection combinations={combinations} />);

      expect(screen.queryByText(/Showing top 5/)).not.toBeInTheDocument();
    });
  });
});
