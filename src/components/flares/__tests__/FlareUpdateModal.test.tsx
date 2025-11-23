import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlareUpdateModal } from "../FlareUpdateModal";
import { FlareRecord } from "@/lib/db/schema";

jest.mock("@/lib/repositories/flareRepository", () => ({
  flareRepository: {
    addFlareEvent: jest.fn(),
    updateFlare: jest.fn(),
  },
}));

const mockFlare: FlareRecord = {
  id: "flare-1",
  userId: "user-123",
  startDate: Date.now(),
  status: "active",
  bodyRegionId: "test",
  initialSeverity: 5,
  currentSeverity: 7,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("FlareUpdateModal", () => {
  it("renders correctly", () => {
    render(
      <FlareUpdateModal
        flare={mockFlare}
        isOpen={true}
        onClose={() => {}}
        userId="user-123"
        onUpdate={() => {}}
      />
    );
    expect(screen.getByText("Update Flare Status")).toBeInTheDocument();
  });
});
