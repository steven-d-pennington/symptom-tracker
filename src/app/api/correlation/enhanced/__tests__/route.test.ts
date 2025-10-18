/**
 * Tests for /api/correlation/enhanced route
 * Tests POST and GET endpoints for enhanced correlation with combinations
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { jest } from "@jest/globals";

// Mock the orchestration service BEFORE importing the route
const mockComputeWithCombinations = jest.fn();
jest.mock("@/lib/services/correlation/CorrelationOrchestrationService", () => ({
  correlationOrchestrationService: {
    computeWithCombinations: mockComputeWithCombinations,
  },
}));

// Now import the route handlers AFTER the mock is set up
const { POST, GET } = await import("../route");

describe("Enhanced Correlation API Route", () => {
  const mockEnhancedResult = {
    correlations: [
      {
        foodId: "food-cheese",
        symptomId: "symptom-headache",
        windowScores: [],
        bestWindow: undefined,
        computedAt: Date.now(),
        sampleSize: 5,
      },
    ],
    combinations: [
      {
        foodIds: ["food-cheese", "food-wine"],
        foodNames: ["Cheese", "Wine"],
        symptomId: "symptom-headache",
        symptomName: "Headache",
        combinationCorrelation: 0.75,
        individualMax: 0.50,
        synergistic: true,
        pValue: 0.01,
        confidence: "high" as const,
        sampleSize: 10,
        computedAt: Date.now(),
      },
    ],
    metadata: {
      userId: "test-user",
      range: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
      computedAt: Date.now(),
      totalPairs: 1,
      combinationsDetected: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockComputeWithCombinations.mockResolvedValue(mockEnhancedResult);
  });

  describe("POST /api/correlation/enhanced", () => {
    it("returns enhanced correlation results with combinations", async () => {
      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          userId: "test-user",
          symptomId: "symptom-headache",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("correlations");
      expect(data).toHaveProperty("combinations");
      expect(data).toHaveProperty("metadata");
      expect(data.correlations).toHaveLength(1);
      expect(data.combinations).toHaveLength(1);
      expect(data.metadata.combinationsDetected).toBe(1);
    });

    it("uses default 30-day range when not provided", async () => {
      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          userId: "test-user",
          symptomId: "symptom-headache",
        }),
      });

      await POST(request);

      expect(mockComputeWithCombinations).toHaveBeenCalledWith(
        "test-user",
        "symptom-headache",
        expect.objectContaining({
          start: expect.any(Number),
          end: expect.any(Number),
        }),
        expect.any(Object)
      );

      const call = mockComputeWithCombinations.mock.calls[0];
      const range = call[2];
      const expectedDuration = 30 * 24 * 60 * 60 * 1000;
      expect(range.end - range.start).toBeCloseTo(expectedDuration, -3);
    });

    it("uses custom date range when provided", async () => {
      const startMs = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const endMs = Date.now();

      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          userId: "test-user",
          symptomId: "symptom-headache",
          startMs,
          endMs,
        }),
      });

      await POST(request);

      expect(mockComputeWithCombinations).toHaveBeenCalledWith(
        "test-user",
        "symptom-headache",
        { start: startMs, end: endMs },
        expect.any(Object)
      );
    });

    it("passes custom minSampleSize to service", async () => {
      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          userId: "test-user",
          symptomId: "symptom-headache",
          minSampleSize: 5,
        }),
      });

      await POST(request);

      expect(mockComputeWithCombinations).toHaveBeenCalledWith(
        "test-user",
        "symptom-headache",
        expect.any(Object),
        { minSampleSize: 5 }
      );
    });

    it("returns 400 when userId is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          symptomId: "symptom-headache",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Missing required fields");
    });

    it("returns 400 when symptomId is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          userId: "test-user",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Missing required fields");
    });

    it("returns 500 when service throws error", async () => {
      mockComputeWithCombinations.mockRejectedValueOnce(new Error("Service error"));

      const request = new NextRequest("http://localhost:3000/api/correlation/enhanced", {
        method: "POST",
        body: JSON.stringify({
          userId: "test-user",
          symptomId: "symptom-headache",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Failed to compute enhanced correlation");
    });
  });

  describe("GET /api/correlation/enhanced", () => {
    it("returns enhanced correlation results from query params", async () => {
      const url = new URL("http://localhost:3000/api/correlation/enhanced");
      url.searchParams.set("userId", "test-user");
      url.searchParams.set("symptomId", "symptom-headache");

      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("correlations");
      expect(data).toHaveProperty("combinations");
      expect(data).toHaveProperty("metadata");
    });

    it("parses startMs and endMs from query params", async () => {
      const startMs = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const endMs = Date.now();

      const url = new URL("http://localhost:3000/api/correlation/enhanced");
      url.searchParams.set("userId", "test-user");
      url.searchParams.set("symptomId", "symptom-headache");
      url.searchParams.set("startMs", startMs.toString());
      url.searchParams.set("endMs", endMs.toString());

      const request = new NextRequest(url);

      await GET(request);

      expect(mockComputeWithCombinations).toHaveBeenCalledWith(
        "test-user",
        "symptom-headache",
        { start: startMs, end: endMs },
        expect.any(Object)
      );
    });

    it("parses minSampleSize from query params", async () => {
      const url = new URL("http://localhost:3000/api/correlation/enhanced");
      url.searchParams.set("userId", "test-user");
      url.searchParams.set("symptomId", "symptom-headache");
      url.searchParams.set("minSampleSize", "7");

      const request = new NextRequest(url);

      await GET(request);

      expect(mockComputeWithCombinations).toHaveBeenCalledWith(
        "test-user",
        "symptom-headache",
        expect.any(Object),
        { minSampleSize: 7 }
      );
    });

    it("returns 400 when userId is missing", async () => {
      const url = new URL("http://localhost:3000/api/correlation/enhanced");
      url.searchParams.set("symptomId", "symptom-headache");

      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Missing required query params");
    });

    it("returns 400 when symptomId is missing", async () => {
      const url = new URL("http://localhost:3000/api/correlation/enhanced");
      url.searchParams.set("userId", "test-user");

      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Missing required query params");
    });

    it("returns 500 when service throws error", async () => {
      mockComputeWithCombinations.mockRejectedValueOnce(new Error("Service error"));

      const url = new URL("http://localhost:3000/api/correlation/enhanced");
      url.searchParams.set("userId", "test-user");
      url.searchParams.set("symptomId", "symptom-headache");

      const request = new NextRequest(url);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Failed to fetch enhanced correlation");
    });
  });
});
