import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { TopBar } from "../TopBar";
import { uxEventRepository } from "@/lib/repositories/uxEventRepository";
import { userRepository } from "@/lib/repositories/userRepository";

const backMock = jest.fn();
const routerMock = {
  back: backMock,
  push: jest.fn(),
  replace: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  refresh: jest.fn(),
};

const renderWithRouter = (ui: React.ReactElement) =>
  render(
    <AppRouterContext.Provider value={routerMock as any}>
      {ui}
    </AppRouterContext.Provider>,
  );

describe("TopBar instrumentation", () => {
  const createUser = (analyticsOptIn: boolean) => ({
    id: "user-123",
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("records navigation.back when analytics opt-in enabled", async () => {
    jest
      .spyOn(userRepository, "getOrCreateCurrentUser")
      .mockResolvedValue(createUser(true) as any);
    const recordSpy = jest
      .spyOn(uxEventRepository, "recordEvent")
      .mockResolvedValue("event-1");

    renderWithRouter(<TopBar title="Dashboard" showBack />);

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));

    expect(backMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(recordSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "navigation.back",
          userId: "user-123",
        }),
      );
    });
  });

  it("records navigation.menu.toggle when analytics opt-in enabled", async () => {
    jest
      .spyOn(userRepository, "getOrCreateCurrentUser")
      .mockResolvedValue(createUser(true) as any);
    const recordSpy = jest
      .spyOn(uxEventRepository, "recordEvent")
      .mockResolvedValue("event-1");
    const menuMock = jest.fn();

    renderWithRouter(<TopBar title="Dashboard" showMenu onMenuClick={menuMock} />);

    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    expect(menuMock).toHaveBeenCalled();

    await waitFor(() => {
      expect(recordSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: "navigation.menu.toggle",
          userId: "user-123",
        }),
      );
    });
  });

  it("does not record navigation events when analytics opt-out", async () => {
    jest
      .spyOn(userRepository, "getOrCreateCurrentUser")
      .mockResolvedValue(createUser(false) as any);
    const recordSpy = jest
      .spyOn(uxEventRepository, "recordEvent")
      .mockResolvedValue("event-1");

    renderWithRouter(<TopBar title="Dashboard" showBack showMenu />);

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }));

    await waitFor(() => {
      expect(recordSpy).not.toHaveBeenCalled();
    });
  });
});
