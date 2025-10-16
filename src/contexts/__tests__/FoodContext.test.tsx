import type { ReactNode } from "react";
import { renderHook, act } from "@testing-library/react";
import { FoodProvider, useFoodContext } from "../FoodContext";

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
});
