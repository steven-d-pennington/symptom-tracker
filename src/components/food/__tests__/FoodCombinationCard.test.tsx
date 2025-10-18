/**
 * Tests for FoodCombinationCard component
 * Tests rendering, accessibility, synergy indicators, confidence levels, and interactions
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, jest } from "@jest/globals";
import userEvent from "@testing-library/user-event";
import FoodCombinationCard from "../FoodCombinationCard";
import type { FoodCombination } from "@/lib/services/food/CombinationAnalysisService";

const baseCombination: FoodCombination = {
  foodIds: ["food-cheese", "food-wine"],
  foodNames: ["Cheese", "Wine"],
  symptomId: "symptom-headache",
  symptomName: "Headache",
  combinationCorrelation: 0.75,
  individualMax: 0.50,
  synergistic: true,
  pValue: 0.01,
  confidence: "high",
  sampleSize: 10,
  computedAt: Date.now(),
};

describe("FoodCombinationCard", () => {
  describe("Rendering", () => {
    it("renders food combination names correctly", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.getByText("Cheese + Wine")).toBeInTheDocument();
    });

    it("renders associated symptom name", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.getByText("Headache")).toBeInTheDocument();
      expect(screen.getByText(/Associated with:/)).toBeInTheDocument();
    });

    it("displays combination correlation percentage", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.getByText("75.0%")).toBeInTheDocument();
      expect(screen.getByText(/Combination correlation:/)).toBeInTheDocument();
    });

    it("displays best individual food correlation", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.getByText("50.0%")).toBeInTheDocument();
      expect(screen.getByText(/Best individual food:/)).toBeInTheDocument();
    });

    it("renders with three foods in combination", () => {
      const threeFood: FoodCombination = {
        ...baseCombination,
        foodIds: ["food-a", "food-b", "food-c"],
        foodNames: ["Apple", "Banana", "Carrot"],
      };

      render(<FoodCombinationCard combination={threeFood} />);

      expect(screen.getByText("Apple + Banana + Carrot")).toBeInTheDocument();
    });
  });

  describe("Synergy indicators", () => {
    it("displays synergistic badge when synergistic flag is true", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const badge = screen.getByLabelText("Synergistic effect detected");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("⚡ Synergistic");
    });

    it("does not display synergistic badge when synergistic flag is false", () => {
      const nonSynergistic: FoodCombination = {
        ...baseCombination,
        synergistic: false,
        combinationCorrelation: 0.55, // Only 5% above individual
      };

      render(<FoodCombinationCard combination={nonSynergistic} />);

      expect(screen.queryByLabelText("Synergistic effect detected")).not.toBeInTheDocument();
    });

    it("shows synergy delta percentage for synergistic combinations", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      // 75% - 50% = 25% stronger
      expect(screen.getByText(/25.0% stronger together/)).toBeInTheDocument();
    });

    it("displays synergy explanation text", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(
        screen.getByText(/This combination triggers symptoms more than individual foods/)
      ).toBeInTheDocument();
      expect(screen.getByText(/threshold: 15%/)).toBeInTheDocument();
    });

    it("shows positive delta below synergy threshold", () => {
      const belowThreshold: FoodCombination = {
        ...baseCombination,
        synergistic: false,
        combinationCorrelation: 0.60, // 10% above individual (below 15% threshold)
        individualMax: 0.50,
      };

      render(<FoodCombinationCard combination={belowThreshold} />);

      expect(screen.getByText(/\+10.0% effect/)).toBeInTheDocument();
      expect(screen.getByText(/below 15% synergy threshold/)).toBeInTheDocument();
    });

    it("does not show delta message when combination equals individual", () => {
      const equalCorrelation: FoodCombination = {
        ...baseCombination,
        synergistic: false,
        combinationCorrelation: 0.50,
        individualMax: 0.50,
      };

      render(<FoodCombinationCard combination={equalCorrelation} />);

      expect(screen.queryByText(/% effect/)).not.toBeInTheDocument();
    });
  });

  describe("Confidence levels", () => {
    it("displays high confidence badge with correct styling", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const badge = screen.getByLabelText(/Confidence level: high/);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("High confidence");
      expect(badge).toHaveClass("bg-green-100");
    });

    it("displays medium confidence badge with correct styling", () => {
      const mediumConfidence: FoodCombination = {
        ...baseCombination,
        confidence: "medium",
        sampleSize: 5,
        pValue: 0.03,
      };

      render(<FoodCombinationCard combination={mediumConfidence} />);

      const badge = screen.getByLabelText(/Confidence level: medium/);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Medium confidence");
      expect(badge).toHaveClass("bg-yellow-100");
    });

    it("displays low confidence badge with correct styling", () => {
      const lowConfidence: FoodCombination = {
        ...baseCombination,
        confidence: "low",
        sampleSize: 3,
        pValue: 0.08,
      };

      render(<FoodCombinationCard combination={lowConfidence} />);

      const badge = screen.getByLabelText(/Confidence level: low/);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("Low confidence");
      expect(badge).toHaveClass("bg-orange-100");
    });
  });

  describe("Statistical details", () => {
    it("displays sample size badge", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const badge = screen.getByLabelText(/Sample size: 10 instances/);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("n=10");
    });

    it("shows statistically significant p-value badge when p < 0.05", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const badge = screen.getByLabelText(/Statistically significant.*p-value: 0.010/);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("p=0.010 *");
    });

    it("shows p-value as text when p >= 0.05", () => {
      const notSignificant: FoodCombination = {
        ...baseCombination,
        pValue: 0.12,
      };

      render(<FoodCombinationCard combination={notSignificant} />);

      expect(screen.getByLabelText(/p-value: 0.12/)).toBeInTheDocument();
      expect(screen.getByText("p=0.12")).toBeInTheDocument();
    });

    it("formats p-values correctly with 3 decimals when significant", () => {
      const smallPValue: FoodCombination = {
        ...baseCombination,
        pValue: 0.001,
      };

      render(<FoodCombinationCard combination={smallPValue} />);

      expect(screen.getByText("p=0.001 *")).toBeInTheDocument();
    });

    it("formats p-values correctly with 2 decimals when not significant", () => {
      const largePValue: FoodCombination = {
        ...baseCombination,
        pValue: 0.156,
      };

      render(<FoodCombinationCard combination={largePValue} />);

      expect(screen.getByText("p=0.16")).toBeInTheDocument();
    });
  });

  describe("Interactivity", () => {
    it("calls onSelect handler when clicked", async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn<(combination: FoodCombination) => void>();

      render(<FoodCombinationCard combination={baseCombination} onSelect={onSelect} />);

      const card = screen.getByRole("button", { name: /Food combination: Cheese \+ Wine/ });
      await user.click(card);

      expect(onSelect).toHaveBeenCalledWith(baseCombination);
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("calls onSelect handler when Enter key is pressed", async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn<(combination: FoodCombination) => void>();

      render(<FoodCombinationCard combination={baseCombination} onSelect={onSelect} />);

      const card = screen.getByRole("button", { name: /Food combination: Cheese \+ Wine/ });
      card.focus();
      await user.keyboard("{Enter}");

      expect(onSelect).toHaveBeenCalledWith(baseCombination);
    });

    it("calls onSelect handler when Space key is pressed", async () => {
      const user = userEvent.setup();
      const onSelect = jest.fn<(combination: FoodCombination) => void>();

      render(<FoodCombinationCard combination={baseCombination} onSelect={onSelect} />);

      const card = screen.getByRole("button", { name: /Food combination: Cheese \+ Wine/ });
      card.focus();
      await user.keyboard(" ");

      expect(onSelect).toHaveBeenCalledWith(baseCombination);
    });

    it("does not have button role when onSelect is not provided", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("is not keyboard focusable when onSelect is not provided", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const card = screen.getByLabelText(/Food combination: Cheese \+ Wine/);
      expect(card).not.toHaveAttribute("tabIndex");
    });
  });

  describe("Accessibility", () => {
    it("has accessible label with combination details", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const card = screen.getByLabelText(
        /Food combination: Cheese \+ Wine with Headache, 75.0% correlation/
      );
      expect(card).toBeInTheDocument();
    });

    it("provides screen reader description of synergy effect", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(
        screen.getByText(
          /The combination is 25.0% more likely to trigger symptoms than individual foods/
        )
      ).toBeInTheDocument();
    });

    it("marks synergy section with aria-live for screen readers", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const synergySection = screen.getByRole("status");
      expect(synergySection).toHaveAttribute("aria-live", "polite");
    });

    it("has properly labeled confidence badge", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.getByLabelText("Confidence level: high")).toBeInTheDocument();
    });

    it("has properly labeled sample size badge", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      expect(screen.getByLabelText("Sample size: 10 instances")).toBeInTheDocument();
    });

    it("provides detailed screen reader summary", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const summary = screen.getByText(
        /This food combination shows a 75.0% correlation with Headache/
      );
      expect(summary).toHaveClass("sr-only");
      expect(summary).toHaveTextContent(/compared to 50.0% for the strongest individual food/);
      expect(summary).toHaveTextContent(/Statistically significant result/);
    });
  });

  describe("Visual styling", () => {
    it("applies red border for synergistic combinations", () => {
      render(<FoodCombinationCard combination={baseCombination} />);

      const card = screen.getByLabelText(/Food combination: Cheese \+ Wine/);
      expect(card).toHaveClass("border-l-4");
      expect(card).toHaveClass("border-l-red-500");
    });

    it("does not apply red border for non-synergistic combinations", () => {
      const nonSynergistic: FoodCombination = {
        ...baseCombination,
        synergistic: false,
      };

      render(<FoodCombinationCard combination={nonSynergistic} />);

      const card = screen.getByLabelText(/Food combination: Cheese \+ Wine/);
      expect(card).not.toHaveClass("border-l-red-500");
    });

    it("applies hover effect when clickable", () => {
      const onSelect = jest.fn<(combination: FoodCombination) => void>();

      render(<FoodCombinationCard combination={baseCombination} onSelect={onSelect} />);

      const card = screen.getByRole("button");
      expect(card).toHaveClass("cursor-pointer");
      expect(card).toHaveClass("hover:shadow-md");
    });
  });
});
