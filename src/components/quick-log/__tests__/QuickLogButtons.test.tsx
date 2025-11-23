import type { ComponentProps } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuickLogButtons } from "../QuickLogButtons";
import { uxEventRepository } from "@/lib/repositories/uxEventRepository";
import { userRepository } from "@/lib/repositories/userRepository";

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

  afterEach(() => {
    jest.restoreAllMocks();
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

    // The new design uses card-based styling instead of specific background colors
    actionConfig.forEach(({ aria }) => {
      const button = screen.getByLabelText(aria);
      expect(button).toHaveClass("bg-card");
      expect(button).toHaveClass("border-border");
    });
  });

  it("enforces minimum tap target size", () => {
    renderComponent();

    // The new design uses larger card buttons with min-h-[140px]
    actionConfig.forEach(({ aria }) => {
      const button = screen.getByLabelText(aria);
      expect(button).toHaveClass("min-h-[140px]");
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

    // The region is now labeled "Quick log actions" instead of "Quick log event buttons"
    expect(screen.getByRole("region", { name: "Quick log actions" })).toBeInTheDocument();

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

  const createUser = (analyticsOptIn: boolean) => ({
    id: "user-123",
    email: "user@example.com",
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: "system",
      notifications: {
        remindersEnabled: false,
      },
      privacy: {
        dataStorage: "encrypted-local",
        analyticsOptIn,
        crashReportsOptIn: false,
      },
      exportFormat: "json",
    },
  });

  it("records UX event when analytics opt-in is enabled", async () => {
    jest
      .spyOn(userRepository, "getOrCreateCurrentUser")
      .mockResolvedValue(createUser(true) as any);
    const recordSpy = jest
      .spyOn(uxEventRepository, "recordEvent")
      .mockResolvedValue("event-1");

    renderComponent();

    fireEvent.click(screen.getByLabelText("Log new flare"));

    await waitFor(() => {
      expect(recordSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-123",
          eventType: "quickAction.flare",
        }),
      );
    });
  });

  it("does not record UX events when analytics opt-in is disabled", async () => {
    jest
      .spyOn(userRepository, "getOrCreateCurrentUser")
      .mockResolvedValue(createUser(false) as any);
    const recordSpy = jest
      .spyOn(uxEventRepository, "recordEvent")
      .mockResolvedValue("event-1");

    renderComponent();

    fireEvent.click(screen.getByLabelText("Log new flare"));

    await waitFor(() => {
      expect(recordSpy).not.toHaveBeenCalled();
    });
  });
});
