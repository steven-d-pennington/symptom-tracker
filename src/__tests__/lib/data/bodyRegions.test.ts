import { FRONT_BODY_REGIONS, BACK_BODY_REGIONS, getRegionsForView } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";

describe("Body Regions Data", () => {
  describe("FRONT_BODY_REGIONS", () => {
    it("should include exactly 3 groin regions with correct IDs", () => {
      const groinRegions = FRONT_BODY_REGIONS.filter((r) =>
        r.id.includes("groin")
      );

      expect(groinRegions).toHaveLength(3);
      expect(groinRegions.map((r) => r.id)).toEqual([
        "left-groin",
        "center-groin",
        "right-groin",
      ]);
    });

    it("should have groin regions with correct names", () => {
      const groinRegions = FRONT_BODY_REGIONS.filter((r) =>
        r.id.includes("groin")
      );

      expect(groinRegions.map((r) => r.name)).toEqual([
        "Left Groin",
        "Center Groin",
        "Right Groin",
      ]);
    });

    it("should have groin regions marked as selectable", () => {
      const groinRegions = FRONT_BODY_REGIONS.filter((r) =>
        r.id.includes("groin")
      );

      groinRegions.forEach((region) => {
        expect(region.selectable).toBe(true);
      });
    });

    it("should have groin regions with correct category and side", () => {
      const leftGroin = FRONT_BODY_REGIONS.find((r) => r.id === "left-groin");
      const centerGroin = FRONT_BODY_REGIONS.find(
        (r) => r.id === "center-groin"
      );
      const rightGroin = FRONT_BODY_REGIONS.find((r) => r.id === "right-groin");

      expect(leftGroin).toBeDefined();
      expect(leftGroin?.category).toBe("other");
      expect(leftGroin?.side).toBe("left");

      expect(centerGroin).toBeDefined();
      expect(centerGroin?.category).toBe("other");
      expect(centerGroin?.side).toBe("center");

      expect(rightGroin).toBeDefined();
      expect(rightGroin?.category).toBe("other");
      expect(rightGroin?.side).toBe("right");
    });

    it("should have groin regions with HS-specific common symptoms", () => {
      const groinRegions = FRONT_BODY_REGIONS.filter((r) =>
        r.id.includes("groin")
      );

      groinRegions.forEach((region) => {
        expect(region.commonSymptoms).toBeDefined();
        expect(region.commonSymptoms).toEqual(
          expect.arrayContaining(["lesion", "abscess", "pain"])
        );
      });
    });

    it("should NOT include old single 'groin' region", () => {
      const oldGroinRegion = FRONT_BODY_REGIONS.find((r) => r.id === "groin");
      expect(oldGroinRegion).toBeUndefined();
    });
  });

  describe("BACK_BODY_REGIONS", () => {
    it("should not include groin regions (front-facing anatomy)", () => {
      const groinRegions = BACK_BODY_REGIONS.filter((r) =>
        r.id.includes("groin")
      );
      expect(groinRegions).toHaveLength(0);
    });
  });

  describe("getRegionsForView", () => {
    it("should return front body regions including groin for front view", () => {
      const regions = getRegionsForView("front");
      const groinRegions = regions.filter((r) => r.id.includes("groin"));

      expect(groinRegions).toHaveLength(3);
    });

    it("should return back body regions without groin for back view", () => {
      const regions = getRegionsForView("back");
      const groinRegions = regions.filter((r) => r.id.includes("groin"));

      expect(groinRegions).toHaveLength(0);
    });

    it("should return front regions (with groin) for side views", () => {
      const leftRegions = getRegionsForView("left");
      const rightRegions = getRegionsForView("right");

      const leftGroinRegions = leftRegions.filter((r) =>
        r.id.includes("groin")
      );
      const rightGroinRegions = rightRegions.filter((r) =>
        r.id.includes("groin")
      );

      expect(leftGroinRegions).toHaveLength(3);
      expect(rightGroinRegions).toHaveLength(3);
    });
  });
});
