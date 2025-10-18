import type { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickLogButtons } from "../QuickLogButtons";

describe("QuickLogButtons", () => {
  const createMockHandlers = () => {
    return {
      onLogFlare: jest.fn(),
      onLogMedication: jest.fn(),
      onLogSymptom: jest.fn(),
      onLogTrigger: jest.fn(),
      onLogFood: jest.fn(),
    } satisfies Pick<
      ComponentProps<typeof QuickLogButtons>,
      "onLogFlare" | "onLogMedication" | "onLogSymptom" | "onLogTrigger" | "onLogFood"
    >;
  };

  let mockHandlers: ReturnType<typeof createMockHandlers> = createMockHandlers();

  const actionConfig = [
    { aria: "Log new flare", label: "New Flare", color: "bg-red-500", handler: "onLogFlare" },
    { aria: "Log medication", label: "Medication", color: "bg-blue-500", handler: "onLogMedication" },
    { aria: "Log symptom", label: "Symptom", color: "bg-yellow-500", handler: "onLogSymptom" },
    { aria: "Log food", label: "Food", color: "bg-emerald-500", handler: "onLogFood" },
    { aria: "Log trigger", label: "Trigger", color: "bg-orange-500", handler: "onLogTrigger" },
  ] as const;

  const renderComponent = (props: Partial<ComponentProps<typeof QuickLogButtons>> = {}) =>
    render(<QuickLogButtons {...mockHandlers} {...props} />);

  beforeEach(() => {
  mockHandlers = createMockHandlers();
  });

  it("renders all quick-log buttons with correct labels", () => {
    renderComponent();

    actionConfig.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("arranges buttons in responsive grid", () => {
    const { container } = renderComponent();
    const grid = container.querySelector(".grid");

    expect(grid).toBeInTheDocument();
  expect(grid).toHaveClass("grid-cols-2");
  expect(grid).toHaveClass("sm:grid-cols-5");
  });

  it("renders emoji-based buttons as decorative and food button with Lucide icon", () => {
    const { container } = renderComponent();

    const emojis = container.querySelectorAll('[role="img"][aria-hidden="true"]');
    expect(emojis).toHaveLength(4);

    const foodButton = screen.getByLabelText("Log food");
    expect(foodButton.querySelector("svg")).toBeInTheDocument();
  });

  it("applies expected color classes to each button", () => {
    renderComponent();

    actionConfig.forEach(({ aria, color }) => {
      expect(screen.getByLabelText(aria)).toHaveClass(color);
    });
  });

  it("enforces minimum tap target size", () => {
    renderComponent();

    actionConfig.forEach(({ aria }) => {
      const button = screen.getByLabelText(aria);
      expect(button).toHaveClass("min-h-[44px]");
      expect(button).toHaveClass("min-w-[44px]");
    });
  });

  it("disables buttons when disabled prop is true", () => {
    renderComponent({ disabled: true });

    actionConfig.forEach(({ aria }) => {
      expect(screen.getByLabelText(aria)).toBeDisabled();
    });
  });

  it("invokes the correct handler when a button is clicked", () => {
    renderComponent();

    actionConfig.forEach(({ aria, handler }) => {
      fireEvent.click(screen.getByLabelText(aria));
      expect(mockHandlers[handler as keyof typeof mockHandlers]).toHaveBeenCalledTimes(1);
      jest.clearAllMocks();
    });
  });

  it("shows loading state for all buttons", () => {
    renderComponent({ loading: true });

    actionConfig.forEach(({ aria }) => {
      const button = screen.getByLabelText(aria);
      expect(button).toBeDisabled();
      expect(button).toHaveClass("animate-pulse");
    });

    expect(screen.getAllByText("Loading...")).toHaveLength(actionConfig.length);
  });

  it("exposes accessible region and labels", () => {
    renderComponent();

    expect(screen.getByRole("region", { name: "Quick log event buttons" })).toBeInTheDocument();

    actionConfig.forEach(({ aria }) => {
      expect(screen.getByLabelText(aria)).toBeInTheDocument();
    });
  });

  it("supports rapid successive clicks without throttling", () => {
    renderComponent();

    const flareButton = screen.getByLabelText("Log new flare");
    fireEvent.click(flareButton);
    fireEvent.click(flareButton);
    fireEvent.click(flareButton);

    expect(mockHandlers.onLogFlare).toHaveBeenCalledTimes(3);
  });

  it("recovers from loading to enabled state", () => {
    const { rerender } = renderComponent({ loading: true });
    expect(screen.getAllByText("Loading...")).toHaveLength(actionConfig.length);

    rerender(<QuickLogButtons {...mockHandlers} loading={false} />);
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });
});
