// Mock useFlares hook to avoid data fetching in tests
jest.mock("@/lib/hooks/useFlares", () => ({
  useFlares: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

// Mock FlareMarkers to avoid router dependency in tests
jest.mock("@/components/body-map/FlareMarkers", () => ({
  __esModule: true,
  FlareMarkers: () => null,
}), { virtual: true });

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlareCreationModal, FlareCreationSelection } from "../FlareCreationModal";
import { flareRepository } from "@/lib/repositories/flareRepository";
import type { FlareRecord } from "@/lib/db/schema";

const defaultSelection: FlareCreationSelection = {
  bodyRegionId: "right-shoulder",
  bodyRegionName: "Right Shoulder",
  coordinates: { x: 0.423, y: 0.678 },
};

const defaultFlare: FlareRecord = {
  id: "flare-123",
  userId: "user-1",
  startDate: Date.now(),
  status: "active",
  bodyRegionId: "right-shoulder",
  coordinates: { x: 0.423, y: 0.678 },
  initialSeverity: 6,
  currentSeverity: 6,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("FlareCreationModal", () => {
  const onClose = jest.fn();
  const onCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders body region details and coordinates", () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    expect(screen.getByText("Create New Flare")).toBeInTheDocument();
    expect(screen.getByText("Right Shoulder")).toBeInTheDocument();
    expect(screen.getByText(/42.3%/)).toBeInTheDocument();
    expect(screen.getByText(/67.8%/)).toBeInTheDocument();
  });

  it("updates severity display when slider changes", () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    const slider = screen.getByLabelText(/Initial severity/i);
    fireEvent.change(slider, { target: { value: "8" } });

    expect(screen.getByText("8/10")).toBeInTheDocument();
    expect(screen.getByText("Very Severe")).toBeInTheDocument();
  });

  it("enforces notes character limit", async () => {
    const overLimitText = "a".repeat(550);
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    const notes = screen.getByLabelText(/Notes \(optional\)/i);
    fireEvent.change(notes, { target: { value: overLimitText } });

    expect(notes).toHaveValue("a".repeat(500));
    expect(screen.getByText("500/500")).toBeInTheDocument();
  });

  it("calls flareRepository.createFlare with expected payload", async () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
        onCreated={onCreated}
      />
    );

    const user = userEvent.setup();
    const createFlareSpy = jest.spyOn(flareRepository, "createFlare").mockResolvedValue(defaultFlare);
    const eventListener = jest.fn();
    const handler = (event: Event) => {
      eventListener(event as CustomEvent);
    };
    window.addEventListener("flare:created", handler);

    fireEvent.change(screen.getByLabelText(/Initial severity/i), { target: { value: "7" } });
    fireEvent.change(screen.getByLabelText(/Timestamp/i), { target: { value: "2025-10-21T09:15" } });
    await user.type(screen.getByLabelText(/Notes \(optional\)/i), "  Initial flare after workout  ");

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    await waitFor(() => {
      expect(createFlareSpy).toHaveBeenCalledTimes(1);
    });

    const callArgs = createFlareSpy.mock.calls[0];
    expect(callArgs[0]).toBe("user-1");
    expect(callArgs[1]).toMatchObject({
      bodyRegionId: "right-shoulder",
      coordinates: { x: 0.423, y: 0.678 },
      initialSeverity: 7,
      currentSeverity: 7,
      startDate: Date.parse("2025-10-21T09:15"),
      createdAt: Date.parse("2025-10-21T09:15"),
      updatedAt: Date.parse("2025-10-21T09:15"),
      initialEventNotes: "Initial flare after workout",
    });

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith(defaultFlare);
      expect(onClose).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    const customEvent = eventListener.mock.calls[0][0] as CustomEvent;
    expect(customEvent.detail.flare).toEqual(defaultFlare);
    expect(customEvent.detail.selection).toEqual(defaultSelection);
    expect(customEvent.detail.severity).toBe(7);
    expect(customEvent.detail.timestamp).toBe(Date.parse("2025-10-21T09:15"));

    window.removeEventListener("flare:created", handler);
  });

  it("disables submit when no selection is provided", () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={null}
      />
    );

    expect(screen.getByRole("button", { name: /Save Flare/ })).toBeDisabled();
  });

  it("surfaces an error when repository write fails", async () => {
    jest.spyOn(flareRepository, "createFlare").mockRejectedValue(new Error("write failed"));

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    expect(await screen.findByText(/Saving flare failed/i)).toBeInTheDocument();
  });

  it("allows cancelling via button", () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("supports keyboard shortcuts: Escape closes modal", () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("supports keyboard shortcuts: Enter submits when valid", async () => {
    const createFlareSpy = jest.spyOn(flareRepository, "createFlare").mockResolvedValue(defaultFlare);

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
        onCreated={onCreated}
      />
    );

    // Focus a non-textarea element and press Enter
    const severitySlider = screen.getByLabelText(/Initial severity/i);
    severitySlider.focus();
    fireEvent.keyDown(severitySlider, { key: "Enter" });

    await waitFor(() => {
      expect(createFlareSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("does not submit on Enter when pressed in textarea", async () => {
    const createFlareSpy = jest.spyOn(flareRepository, "createFlare").mockResolvedValue(defaultFlare);

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    const notesTextarea = screen.getByLabelText(/Notes \(optional\)/i);
    notesTextarea.focus();
    fireEvent.keyDown(notesTextarea, { key: "Enter" });

    // Should not submit (textarea should handle Enter for new lines)
    expect(createFlareSpy).not.toHaveBeenCalled();
  });

  it("generates unique flare IDs", async () => {
    const createFlareSpy = jest.spyOn(flareRepository, "createFlare").mockResolvedValue(defaultFlare);

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    await waitFor(() => {
      expect(createFlareSpy).toHaveBeenCalledTimes(1);
    });

    const [userIdArg, createPayload] = createFlareSpy.mock.calls[0];
    expect(userIdArg).toBe("user-1");
    expect(createPayload).toHaveProperty("bodyRegionId", defaultSelection.bodyRegionId);
    expect(createPayload).toHaveProperty("coordinates", defaultSelection.coordinates);
    expect(createPayload).toHaveProperty("initialSeverity", 5);
    expect(createPayload).toHaveProperty("startDate");
    expect(createPayload).toHaveProperty("createdAt");
    expect(createPayload).toHaveProperty("updatedAt");
    // ID is generated inside the repository, not passed in payload
    expect(createPayload).not.toHaveProperty("id");
  });

  it("handles specific error types with user-friendly messages", async () => {
    // Test quota exceeded error
    jest.spyOn(flareRepository, "createFlare").mockRejectedValue(new Error("Quota exceeded"));

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    expect(await screen.findByText(/Storage full/i)).toBeInTheDocument();
  });

  it("handles constraint errors gracefully", async () => {
    jest.spyOn(flareRepository, "createFlare").mockRejectedValue(new Error("Constraint violation"));

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    expect(await screen.findByText(/Creating flare failed/i)).toBeInTheDocument();
  });

  it("shows loading state during save", async () => {
    let resolveCreateFlare: (value: FlareRecord) => void;
    const createFlarePromise = new Promise<FlareRecord>((resolve) => {
      resolveCreateFlare = resolve;
    });

    jest.spyOn(flareRepository, "createFlare").mockReturnValue(createFlarePromise);

    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    // Should show loading state
    expect(screen.getByRole("button", { name: /Saving…/ })).toBeDisabled();

    // Resolve the promise
    resolveCreateFlare!(defaultFlare);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("resets form state when reopened", () => {
    const { rerender } = render(
      <FlareCreationModal
        isOpen={false}
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    // Reopen modal
    rerender(
      <FlareCreationModal
        isOpen={true}
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    // Should reset to default values
    expect(screen.getByText("5/10")).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes \(optional\)/i)).toHaveValue("");
  });

  it("validates timestamp format", async () => {
    render(
      <FlareCreationModal
        isOpen
        onClose={onClose}
        userId="user-1"
        selection={defaultSelection}
      />
    );

    const timestampInput = screen.getByLabelText(/Timestamp/i);
    // Clear the timestamp to make it invalid
    fireEvent.change(timestampInput, { target: { value: "" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Flare/ }));

    expect(await screen.findByText(/Please provide a valid date and time/i)).toBeInTheDocument();
  });
});
