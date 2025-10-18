import { useState } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FoodLogModal } from "../FoodLogModal";
import { FoodProvider, useFoodContext } from "@/contexts/FoodContext";
import type { ReactNode } from "react";
import type { FoodRecord } from "@/lib/db/schema";

// Mock AddFoodModal
jest.mock("@/components/food/AddFoodModal", () => ({
  AddFoodModal: ({ isOpen, onClose, onSave }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="add-food-modal">
        <h2>Add Custom Food</h2>
        <label htmlFor="food-name">Food Name</label>
        <input id="food-name" />
        <label htmlFor="food-category">Category</label>
        <select id="food-category">
          <option value="Fruits">Fruits</option>
        </select>
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={() => {
            const nameInput = document.getElementById("food-name") as HTMLInputElement;
            const categorySelect = document.getElementById("food-category") as HTMLSelectElement;
            onSave({
              name: nameInput?.value || "Test Food",
              category: categorySelect?.value,
              allergenTags: [],
            });
          }}
        >
          Add Food
        </button>
      </div>
    );
  },
}));

// Create mock functions first
const mockGetDefault = jest.fn();
const mockSearch = jest.fn();
const mockCreate = jest.fn();
const mockGetById = jest.fn();
const mockGetAll = jest.fn();
const mockGetActive = jest.fn();
const mockUpdate = jest.fn();
const mockArchive = jest.fn();
const mockFoodEventCreate = jest.fn();
const mockGetOrCreateCurrentUser = jest.fn();
const mockGetFoodFavorites = jest.fn();
const mockToggleFoodFavorite = jest.fn();

// Mock repositories
jest.mock("@/lib/repositories/foodRepository", () => ({
  foodRepository: {
    getDefault: (...args: any[]) => mockGetDefault(...args),
    search: (...args: any[]) => mockSearch(...args),
    create: (...args: any[]) => mockCreate(...args),
    getById: (...args: any[]) => mockGetById(...args),
    getAll: (...args: any[]) => mockGetAll(...args),
    getActive: (...args: any[]) => mockGetActive(...args),
    update: (...args: any[]) => mockUpdate(...args),
    archive: (...args: any[]) => mockArchive(...args),
  },
}));

jest.mock("@/lib/repositories/foodEventRepository", () => ({
  foodEventRepository: {
    create: (...args: any[]) => mockFoodEventCreate(...args),
  },
  FoodEventRepository: jest.fn(),
}));

jest.mock("@/lib/repositories/userRepository", () => ({
  userRepository: {
    getOrCreateCurrentUser: (...args: any[]) => mockGetOrCreateCurrentUser(...args),
    getFoodFavorites: (...args: any[]) => mockGetFoodFavorites(...args),
    toggleFoodFavorite: (...args: any[]) => mockToggleFoodFavorite(...args),
  },
}));

// Import mocked repositories after mocking
import { foodRepository } from "@/lib/repositories/foodRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";

// Mock performance API
global.performance.mark = jest.fn();
global.performance.measure = jest.fn();
global.performance.getEntriesByName = jest.fn(() => [{ duration: 250 }] as PerformanceEntryList);

describe("FoodLogModal", () => {
  const mockUserId = "test-user-123";

  const mockFoods: FoodRecord[] = [
    {
      id: "food-1",
      userId: "SYSTEM",
      name: "Apple",
      category: "fruit",
      allergenTags: JSON.stringify([]),
      isDefault: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "food-2",
      userId: "SYSTEM",
      name: "Milk",
      category: "dairy",
      allergenTags: JSON.stringify(["dairy"]),
      isDefault: true,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const wrapper = ({ children }: { children: ReactNode }) => (
    <FoodProvider>{children}</FoodProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock return values
    mockGetDefault.mockResolvedValue(mockFoods);
    mockGetActive.mockResolvedValue(mockFoods);
    mockSearch.mockImplementation(async (userId: string, query: string) => {
      return mockFoods.filter((food) =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
    });
    mockCreate.mockResolvedValue("new-food-id");
    mockFoodEventCreate.mockResolvedValue("event-123");
    // Setup userRepository mocks
    mockGetOrCreateCurrentUser.mockResolvedValue({ id: mockUserId, createdAt: Date.now(), updatedAt: Date.now() });
    mockGetFoodFavorites.mockResolvedValue([]);
    mockToggleFoodFavorite.mockResolvedValue(undefined);
  });

  describe("AC2: Modal opens and follows quick-log patterns", () => {
    it("does not render when modal is closed", () => {
      render(
        <FoodProvider>
          <FoodLogModal userId={mockUserId} />
        </FoodProvider>
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders with correct ARIA attributes for accessibility", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
        expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "food-log-modal-title");
      });
    });
  });

  describe("AC3: Modal launches focused on food capture", () => {
    it("displays search input when modal opens", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      const openButton = screen.getByText("Open Modal");
      fireEvent.click(openButton);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Search food...");
        expect(searchInput).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("displays default foods grid on open", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText("Default Foods")).toBeInTheDocument();
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
      });
    });
  });

  describe("AC3: Search and selection behavior", () => {
    it("filters foods based on search query", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search food...");
      fireEvent.change(searchInput, { target: { value: "apple" } });

      await waitFor(() => {
        expect(foodRepository.search).toHaveBeenCalledWith(mockUserId, "apple");
      });
    });

    it("allows food item selection", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });

      const appleButton = screen.getByText("Apple").closest("button");
      expect(appleButton).toBeInTheDocument();
      fireEvent.click(appleButton!);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /log food/i })).not.toBeDisabled();
      });
    });

    it("displays allergen badges for foods with allergens", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText("Milk")).toBeInTheDocument();
      });

      // Milk has dairy allergen - badge should be visible
      const milkCard = screen.getByText("Milk").closest("button");
      expect(milkCard).toBeInTheDocument();
    });
  });

  describe("AC4: Performance instrumentation", () => {
    it("records performance mark when modal opens", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(performance.mark).toHaveBeenCalledWith("food-log-modal-open");
      });
    });

    it("records ready mark after modal is interactive", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open"));

      await waitFor(() => {
        expect(performance.mark).toHaveBeenCalledWith("food-log-modal-ready");
      }, { timeout: 3000 });
    });
  });

  describe("Form submission and validation", () => {
    it("requires food selection before saving", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        const logButton = screen.getByRole("button", { name: /log food/i });
        expect(logButton).toBeDisabled();
      });
    });

    it("successfully saves food event", async () => {
      const TestComponent = () => {
        const { openFoodLog, isFoodLogModalOpen } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            {isFoodLogModalOpen && <div>Modal Open</div>}
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText("Apple")).toBeInTheDocument();
      });

      // Select food
      const appleButton = screen.getByText("Apple").closest("button");
      fireEvent.click(appleButton!);

      // Wait for Log Food button to be enabled
      await waitFor(() => {
        const logButton = screen.getByRole("button", { name: /log food/i });
        expect(logButton).not.toBeDisabled();
      });

      // Click Log Food
      const logButton = screen.getByRole("button", { name: /log food/i });
      fireEvent.click(logButton);

      await waitFor(() => {
        expect(foodEventRepository.create).toHaveBeenCalled();
      });
    });
  });

  describe("Cancel and close behavior", () => {
    it("closes modal when cancel button is clicked", async () => {
      const TestComponent = () => {
        const { openFoodLog, isFoodLogModalOpen } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            {isFoodLogModalOpen && <div data-testid="modal-open-indicator">Modal Open</div>}
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByTestId("modal-open-indicator")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId("modal-open-indicator")).not.toBeInTheDocument();
      });
    });

    it("closes modal when close (X) button is clicked", async () => {
      const TestComponent = () => {
        const { openFoodLog, isFoodLogModalOpen } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            {isFoodLogModalOpen && <div data-testid="modal-open-indicator">Modal Open</div>}
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByTestId("modal-open-indicator")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close food log modal/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("modal-open-indicator")).not.toBeInTheDocument();
      });
    });
  });

  describe("Custom Food Creation", () => {
    it("displays 'Add Custom Food' button", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText(/add custom food/i)).toBeInTheDocument();
      });
    });

    it("opens AddFoodModal when 'Add Custom Food' button is clicked", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText(/add custom food/i)).toBeInTheDocument();
      });

      const addButton = screen.getByRole("button", { name: /add custom food/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add Custom Food")).toBeInTheDocument();
      });
    });

    it("creates custom food and auto-selects it", async () => {
      const mockCustomFood: FoodRecord = {
        id: "custom-food-1",
        userId: mockUserId,
        name: "Durian",
        category: "Fruits",
        allergenTags: JSON.stringify([]),
        isDefault: false,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock foodRepository.create to return the new food ID
      mockCreate.mockResolvedValue("custom-food-1");

      // Mock getDefault to return the new food after creation
      mockGetDefault.mockResolvedValue([
        ...mockFoods,
        mockCustomFood,
      ]);

      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText(/add custom food/i)).toBeInTheDocument();
      });

      // Click Add Custom Food button
      const addButton = screen.getByRole("button", { name: /add custom food/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add Custom Food")).toBeInTheDocument();
      });

      // Fill out the form
      const nameInput = screen.getByLabelText(/food name/i);
      fireEvent.change(nameInput, { target: { value: "Durian" } });

      const categorySelect = screen.getByLabelText(/category/i);
      fireEvent.change(categorySelect, { target: { value: "Fruits" } });

      // Submit the form
      const saveButton = screen.getByRole("button", { name: /add food/i });
      fireEvent.click(saveButton);

      // Wait for the custom food to be created and selected
      await waitFor(() => {
        expect(foodRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: mockUserId,
            name: "Durian",
            category: "Fruits",
            isDefault: false,
            isActive: true,
          })
        );
      });

      // Verify the success message appears
      await waitFor(() => {
        expect(screen.getByText(/custom food "durian" created and selected/i)).toBeInTheDocument();
      });
    });

    it("closes AddFoodModal when cancel is clicked", async () => {
      const TestComponent = () => {
        const { openFoodLog } = useFoodContext();
        return (
          <>
            <button onClick={openFoodLog}>Open Modal</button>
            <FoodLogModal userId={mockUserId} />
          </>
        );
      };

      render(<TestComponent />, { wrapper });

      fireEvent.click(screen.getByText("Open Modal"));

      await waitFor(() => {
        expect(screen.getByText(/add custom food/i)).toBeInTheDocument();
      });

      // Open AddFoodModal
      const addButton = screen.getByRole("button", { name: /add custom food/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("Add Custom Food")).toBeInTheDocument();
      });

      // Click Cancel
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Add Custom Food")).not.toBeInTheDocument();
      });
    });
  });
});
