import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FoodCorrelationDetailView } from "@/components/food/FoodCorrelationDetailView";

// Basic smoke test with mocked repositories/services could be expanded.
// Here we verify structure renders without throwing when inputs are provided.

jest.mock("@/lib/repositories/foodEventRepository", () => ({
  foodEventRepository: {
    findByDateRange: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/lib/repositories/symptomInstanceRepository", () => ({
  symptomInstanceRepository: {
    getByDateRange: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/lib/services/correlation/CorrelationOrchestrationService", () => ({
  correlationOrchestrationService: {
    computeCorrelation: jest.fn().mockResolvedValue({
      foodId: "food-1",
      symptomId: "Headache",
      windowScores: [
        { window: "15m", score: 0.5, sampleSize: 2, pValue: 0.2 },
        { window: "2-4h", score: 1.2, sampleSize: 5, pValue: 0.04 },
      ],
      bestWindow: { window: "2-4h", score: 1.2, sampleSize: 5, pValue: 0.04 },
      computedAt: Date.now(),
      sampleSize: 7,
    }),
  },
}));

describe("FoodCorrelationDetailView", () => {
  it("renders summary and chart", async () => {
    render(
      <FoodCorrelationDetailView userId="user-123" foodId="food-1" symptomName="Headache" />
    );

    await waitFor(() => {
      expect(screen.getByText(/Correlation: food-1 → Headache/)).toBeInTheDocument();
    });

    // Summary sections
    expect(screen.getByText(/Correlation %/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence/i)).toBeInTheDocument();

    // Chart fallback table
    expect(screen.getByRole("table", { name: /delay buckets table/i })).toBeInTheDocument();
  });
});
