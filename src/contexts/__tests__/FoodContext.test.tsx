import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { FoodProvider, useFoodContext } from "../FoodContext";
import { foodRepository } from "@/lib/repositories/foodRepository";

describe("FoodContext", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <FoodProvider>{children}</FoodProvider>
  );

  it("provides open and close handlers for the food log modal", () => {
    const { result } = renderHook(() => useFoodContext(), { wrapper });

    act(() => {
      result.current.openFoodLog();
    });

    expect(result.current.isFoodLogModalOpen).toBe(true);
    expect(result.current.isLaunchingFoodLog).toBe(true);

    act(() => {
      result.current.markFoodLogReady();
    });

    expect(result.current.isLaunchingFoodLog).toBe(false);

    act(() => {
      result.current.closeFoodLog();
    });

    expect(result.current.isFoodLogModalOpen).toBe(false);
    expect(result.current.isLaunchingFoodLog).toBe(false);
  });

  it("throws when useFoodContext is used outside of a provider", () => {
    expect(() => renderHook(() => useFoodContext())).toThrow(
      /useFoodContext must be used within a FoodProvider/,
    );
  });

  describe("Custom Food Management", () => {
    it("should add a custom food via addCustomFood", async () => {
      const mockFoodId = "food-123";
      const createSpy = jest.spyOn(foodRepository, "create").mockResolvedValue(mockFoodId);

      const { result } = renderHook(() => useFoodContext(), { wrapper });

      let foodId: string = "";
      await act(async () => {
        foodId = await result.current.addCustomFood("user-1", {
          name: "Custom Salad",
          category: "Vegetables",
          allergenTags: ["nuts"],
          preparationMethod: "raw",
        });
      });

      expect(foodRepository.create).toHaveBeenCalledWith({
        userId: "user-1",
        name: "Custom Salad",
        category: "Vegetables",
        allergenTags: JSON.stringify(["nuts"]),
        preparationMethod: "raw",
        isDefault: false,
        isActive: true,
      });
      expect(foodId).toBe(mockFoodId);
      createSpy.mockRestore();
    });

    it("should default category to Snacks when not provided", async () => {
      const mockFoodId = "food-456";
      const createSpy = jest.spyOn(foodRepository, "create").mockResolvedValue(mockFoodId);

      const { result } = renderHook(() => useFoodContext(), { wrapper });

      await act(async () => {
        await result.current.addCustomFood("user-1", {
          name: "Custom Food",
          allergenTags: [],
        });
      });

      expect(foodRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "Snacks",
        })
      );
      createSpy.mockRestore();
    });

    it("should update a custom food via updateCustomFood", async () => {
      const updateSpy = jest.spyOn(foodRepository, "update").mockResolvedValue(undefined);

      const { result } = renderHook(() => useFoodContext(), { wrapper });

      await act(async () => {
        await result.current.updateCustomFood("food-123", {
          name: "Updated Salad",
          category: "Proteins",
          allergenTags: ["dairy"],
        });
      });

      expect(foodRepository.update).toHaveBeenCalledWith("food-123", {
        name: "Updated Salad",
        category: "Proteins",
        allergenTags: JSON.stringify(["dairy"]),
      });
      updateSpy.mockRestore();
    });

    it("should only update provided fields", async () => {
      const updateSpy = jest.spyOn(foodRepository, "update").mockResolvedValue(undefined);

      const { result } = renderHook(() => useFoodContext(), { wrapper });

      await act(async () => {
        await result.current.updateCustomFood("food-123", {
          name: "New Name",
        });
      });

      expect(foodRepository.update).toHaveBeenCalledWith("food-123", {
        name: "New Name",
      });
      updateSpy.mockRestore();
    });

    it("should delete a custom food via deleteCustomFood", async () => {
      const archiveSpy = jest.spyOn(foodRepository, "archive").mockResolvedValue(undefined);

      const { result } = renderHook(() => useFoodContext(), { wrapper });

      await act(async () => {
        await result.current.deleteCustomFood("food-789");
      });

      expect(foodRepository.archive).toHaveBeenCalledWith("food-789");
      archiveSpy.mockRestore();
    });

    it("should handle errors from repository methods", async () => {
      const mockError = new Error("Repository error");
      const createSpy = jest.spyOn(foodRepository, "create").mockRejectedValue(mockError);

      const { result } = renderHook(() => useFoodContext(), { wrapper });

      await expect(async () => {
        await act(async () => {
          await result.current.addCustomFood("user-1", {
            name: "Test Food",
            allergenTags: [],
          });
        });
      }).rejects.toThrow("Repository error");
      createSpy.mockRestore();
    });
  });
});
