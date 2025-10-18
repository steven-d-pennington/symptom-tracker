import { render, screen, fireEvent } from "@testing-library/react";
import { CorrelationMatrix } from "../CorrelationMatrix";
import type { TriggerCorrelation } from "@/lib/types/trigger-correlation";

describe("CorrelationMatrix", () => {
  const foodItem: TriggerCorrelation = {
    triggerId: "food-dairy",
    triggerName: "Dairy",
    symptomId: "Headache",
    symptomName: "Headache",
    correlationScore: 0.8,
    occurrences: 10,
    avgSeverityIncrease: 6.5,
    confidence: "high",
    timeLag: "2-4h",
    type: "food",
  };

  const envItem: TriggerCorrelation = {
    triggerId: "tr-stress",
    triggerName: "Stress",
    symptomId: "Headache",
    symptomName: "Headache",
    correlationScore: 0.6,
    occurrences: 7,
    avgSeverityIncrease: 5.0,
    confidence: "medium",
    timeLag: "6-12h",
    type: "environment",
  };

  it("renders food icon for food-type items", () => {
    render(<CorrelationMatrix correlations={[foodItem, envItem]} />);

    // Food icon present
    expect(screen.getByLabelText("Food trigger")).toBeInTheDocument();

    // Check labels present
    expect(screen.getByText("Dairy")).toBeInTheDocument();
    expect(screen.getAllByText(/Headache/).length).toBeGreaterThan(0);
  });

  it("calls onItemClick when row is clicked", () => {
    const onItemClick = jest.fn();
    render(<CorrelationMatrix correlations={[foodItem]} onItemClick={onItemClick} />);

    const row = screen.getByRole("button", {
      name: /View details for Dairy/i,
    });
    fireEvent.click(row);

    expect(onItemClick).toHaveBeenCalledWith(foodItem);
  });
});
