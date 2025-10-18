import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FoodCorrelationDelayChart } from "@/components/charts/FoodCorrelationDelayChart";

describe("FoodCorrelationDelayChart", () => {
  it("renders chart and table with buckets", () => {
    const buckets = [
      { label: "15m", score: 1.2, sampleSize: 3 },
      { label: "2-4h", score: 2.5, sampleSize: 5 },
      { label: "24h", score: 0.5, sampleSize: 2 },
    ];
    render(<FoodCorrelationDelayChart buckets={buckets} bestLabel="2-4h" />);

    expect(screen.getByRole("img", { name: /delay pattern bar chart/i })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /delay buckets table/i });
    expect(table).toBeInTheDocument();
    expect(screen.getByText("2-4h")).toBeInTheDocument();
  });
});

