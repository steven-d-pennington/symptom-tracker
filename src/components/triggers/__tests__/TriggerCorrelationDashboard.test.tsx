import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mocks
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockTriggerFind = jest.fn();
jest.mock("@/lib/repositories/triggerEventRepository", () => ({
  triggerEventRepository: {
    findByDateRange: (...args: any[]) => mockTriggerFind(...args),
  },
}));

const mockSymptomGetByDateRange = jest.fn();
jest.mock("@/lib/repositories/symptomInstanceRepository", () => ({
  symptomInstanceRepository: {
    getByDateRange: (...args: any[]) => mockSymptomGetByDateRange(...args),
  },
}));

const mockTriggerGetAll = jest.fn();
jest.mock("@/lib/repositories/triggerRepository", () => ({
  triggerRepository: {
    getAll: (...args: any[]) => mockTriggerGetAll(...args),
  },
}));

const mockFoodFind = jest.fn();
jest.mock("@/lib/repositories/foodEventRepository", () => ({
  foodEventRepository: {
    findByDateRange: (...args: any[]) => mockFoodFind(...args),
  },
}));

const mockFoodGetAll = jest.fn();
jest.mock("@/lib/repositories/foodRepository", () => ({
  foodRepository: {
    getAll: (...args: any[]) => mockFoodGetAll(...args),
  },
}));

import { TriggerCorrelationDashboard } from "../TriggerCorrelationDashboard";

describe("TriggerCorrelationDashboard", () => {
  const userId = "test-user";
  const now = Date.now();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environmental trigger events (one event 6h ago)
    mockTriggerFind.mockResolvedValueOnce([
      {
        id: "tr-1",
        userId,
        triggerId: "tr-stress",
        timestamp: now - 6 * 60 * 60 * 1000,
        intensity: "medium",
        createdAt: now - 6 * 60 * 60 * 1000,
        updatedAt: now - 6 * 60 * 60 * 1000,
      },
    ]);

    // Mock symptoms (two events 2h ago so within 24h after trigger/food)
    mockSymptomGetByDateRange.mockResolvedValueOnce([
      {
        id: "sym-1",
        userId,
        name: "Headache",
        category: "Neurological",
        severity: 7,
        severityScale: { type: "numeric", min: 1, max: 10 },
        timestamp: new Date(now - 2 * 60 * 60 * 1000),
        updatedAt: new Date(now - 2 * 60 * 60 * 1000),
      },
    ]);

    // Mock trigger definitions
    mockTriggerGetAll.mockResolvedValueOnce([
      { id: "tr-stress", name: "Stress", userId, createdAt: now, updatedAt: now },
    ]);

    // Mock food events (1 event 6h ago, with Dairy)
    mockFoodFind.mockResolvedValueOnce([
      {
        id: "fe-1",
        userId,
        foodIds: JSON.stringify(["food-dairy"]),
        timestamp: now - 6 * 60 * 60 * 1000,
        mealId: "meal-1",
        mealType: "dinner",
        portionMap: JSON.stringify({ "food-dairy": "medium" }),
        createdAt: now - 6 * 60 * 60 * 1000,
        updatedAt: now - 6 * 60 * 60 * 1000,
      },
    ]);

    // Mock food definitions
    mockFoodGetAll.mockResolvedValueOnce([
      {
        id: "food-dairy",
        userId,
        name: "Dairy",
        category: "Dairy",
        allergenTags: JSON.stringify(["dairy"]),
        isDefault: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  });

  it("shows both food and environmental triggers and filters correctly", async () => {
    render(<TriggerCorrelationDashboard userId={userId} />);

    // Wait for items
    await screen.findByText("Dairy");
    expect(screen.getByText("Stress")).toBeInTheDocument();

    // Filter: Food
    const foodFilter = screen.getByRole("button", { name: /food/i });
    fireEvent.click(foodFilter);
    expect(screen.getByText("Dairy")).toBeInTheDocument();
    expect(screen.queryByText("Stress")).not.toBeInTheDocument();

    // Filter: Environmental
    const envFilter = screen.getByRole("button", { name: /environment/i });
    fireEvent.click(envFilter);
    expect(screen.getByText("Stress")).toBeInTheDocument();
    expect(screen.queryByText("Dairy")).not.toBeInTheDocument();
  });

  it("navigates to food correlation detail on food row click", async () => {
    render(<TriggerCorrelationDashboard userId={userId} />);

    const row = await screen.findByRole("button", {
      name: /View details for Dairy/i,
    });
    fireEvent.click(row);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
      const [url] = mockPush.mock.calls[0];
      expect(url).toMatch(/\/foods\/food-dairy\/correlation\?symptom=Headache/);
    });
  });
});

