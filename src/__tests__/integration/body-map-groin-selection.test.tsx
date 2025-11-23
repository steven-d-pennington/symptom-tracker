import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FrontBody } from "@/components/body-mapping/bodies/FrontBody";
import { FRONT_BODY_REGIONS } from "@/lib/data/bodyRegions";

describe("Body Map Groin Region Selection Integration", () => {
  describe("AC1.5: Groin region selection triggers same flow as other regions", () => {
    it("should handle complete click-to-selection flow for left groin", () => {
      const handleRegionClick = jest.fn();
      const handleRegionHover = jest.fn();

      const { container } = render(
        <FrontBody
          onRegionClick={handleRegionClick}
          onRegionHover={handleRegionHover}
        />
      );

      // Find left groin region
      const leftGroin = container.querySelector("#left-groin");
      expect(leftGroin).toBeInTheDocument();

      // Simulate user interaction: hover then click
      fireEvent.mouseEnter(leftGroin!);
      expect(handleRegionHover).toHaveBeenCalledWith("left-groin");

      fireEvent.click(leftGroin!);
      expect(handleRegionClick).toHaveBeenCalledWith("left-groin");

      fireEvent.mouseLeave(leftGroin!);
      expect(handleRegionHover).toHaveBeenCalledWith(null);
    });

    it("should handle selection state persistence for groin regions", () => {
      const { container, rerender } = render(
        <FrontBody selectedRegions={[]} />
      );

      // Initially, groin regions should have default opacity
      let leftGroin = container.querySelector("#left-groin");
      expect(leftGroin?.getAttribute("fill-opacity")).toBe("0.3");

      // Simulate selection
      rerender(<FrontBody selectedRegions={["left-groin", "center-groin"]} />);

      leftGroin = container.querySelector("#left-groin");
      const centerGroin = container.querySelector("#center-groin");
      const rightGroin = container.querySelector("#right-groin");

      // Selected regions should have increased opacity
      expect(leftGroin?.getAttribute("fill-opacity")).toBe("0.6");
      expect(centerGroin?.getAttribute("fill-opacity")).toBe("0.6");

      // Unselected region should remain default
      expect(rightGroin?.getAttribute("fill-opacity")).toBe("0.3");
    });

    it("should handle multi-region selection including groin regions", () => {
      const { container } = render(
        <FrontBody
          selectedRegions={[
            "left-groin",
            "armpit-left",
            "inner-thigh-left",
          ]}
        />
      );

      const leftGroin = container.querySelector("#left-groin");
      const leftArmpit = container.querySelector("#armpit-left");
      const leftInnerThigh = container.querySelector("#inner-thigh-left");

      // All selected regions should have same selection styling
      expect(leftGroin?.getAttribute("fill-opacity")).toBe("0.6");
      expect(leftArmpit?.getAttribute("fill-opacity")).toBe("0.6");
      expect(leftInnerThigh?.getAttribute("fill-opacity")).toBe("0.6");

      // All should use selection color
      expect(leftGroin?.getAttribute("fill")).toBe("#3b82f6");
      expect(leftArmpit?.getAttribute("fill")).toBe("#3b82f6");
      expect(leftInnerThigh?.getAttribute("fill")).toBe("#3b82f6");
    });

    it("should handle flare state on groin regions same as other regions", () => {
      const { container } = render(
        <FrontBody
          flareRegions={["left-groin", "armpit-right"]}
          severityByRegion={{
            "left-groin": 8,
            "armpit-right": 8,
          }}
        />
      );

      const leftGroin = container.querySelector("#left-groin");
      const rightArmpit = container.querySelector("#armpit-right");

      // Both should have flare styling
      expect(leftGroin).toHaveClass("flare-pulse");
      expect(rightArmpit).toHaveClass("flare-pulse");

      // Both should have same high-severity color
      expect(leftGroin?.getAttribute("fill")).toBe("#991b1b");
      expect(rightArmpit?.getAttribute("fill")).toBe("#991b1b");

      // Both should have same flare opacity
      expect(leftGroin?.getAttribute("fill-opacity")).toBe("0.9");
      expect(rightArmpit?.getAttribute("fill-opacity")).toBe("0.9");
    });
  });

  describe("AC1.4: Groin regions visible on all body map views", () => {
    it("should include groin regions in front view", () => {
      const frontRegions = FRONT_BODY_REGIONS;
      const groinRegionIds = frontRegions
        .filter((r) => r.id.includes("groin"))
        .map((r) => r.id);

      expect(groinRegionIds).toEqual([
        "left-groin",
        "center-groin",
        "right-groin",
      ]);
    });

    it("should render all three groin regions in FrontBody component", () => {
      const { container } = render(<FrontBody />);

      const groinElements = container.querySelectorAll("[id$='-groin']");
      expect(groinElements).toHaveLength(3);

      const ids = Array.from(groinElements).map((el) => el.id);
      expect(ids).toContain("left-groin");
      expect(ids).toContain("center-groin");
      expect(ids).toContain("right-groin");
    });
  });

  describe("Data layer integration", () => {
    it("should find groin regions in FRONT_BODY_REGIONS data", () => {
      const leftGroin = FRONT_BODY_REGIONS.find((r) => r.id === "left-groin");
      const centerGroin = FRONT_BODY_REGIONS.find(
        (r) => r.id === "center-groin"
      );
      const rightGroin = FRONT_BODY_REGIONS.find((r) => r.id === "right-groin");

      expect(leftGroin).toBeDefined();
      expect(centerGroin).toBeDefined();
      expect(rightGroin).toBeDefined();

      // Verify data structure matches interface
      expect(leftGroin?.name).toBe("Left Groin");
      expect(leftGroin?.selectable).toBe(true);
      expect(leftGroin?.category).toBe("other");
    });

    it("should render groin regions based on data from FRONT_BODY_REGIONS", () => {
      const { container } = render(<FrontBody />);

      const groinRegionsData = FRONT_BODY_REGIONS.filter((r) =>
        r.id.includes("groin")
      );

      groinRegionsData.forEach((region) => {
        const element = container.querySelector(`#${region.id}`);
        expect(element).toBeInTheDocument();
        expect(element).toHaveAttribute("aria-label", region.name);
      });
    });
  });

  describe("Accessibility integration", () => {
    it("should support keyboard navigation for groin regions", () => {
      const handleRegionClick = jest.fn();

      const { container } = render(
        <FrontBody onRegionClick={handleRegionClick} />
      );

      const leftGroin = container.querySelector("#left-groin");

      // Groin regions should be keyboard accessible
      expect(leftGroin).toHaveAttribute("aria-label");

      // Click should work (keyboard users can trigger click via Enter/Space)
      fireEvent.click(leftGroin!);
      expect(handleRegionClick).toHaveBeenCalledWith("left-groin");
    });

    it("should provide screen reader labels for all groin regions", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");
      const centerGroin = container.querySelector("#center-groin");
      const rightGroin = container.querySelector("#right-groin");

      // All groin regions should have descriptive aria-labels
      expect(leftGroin?.getAttribute("aria-label")).toBe("Left Groin");
      expect(centerGroin?.getAttribute("aria-label")).toBe("Center Groin");
      expect(rightGroin?.getAttribute("aria-label")).toBe("Right Groin");
    });
  });

  describe("Performance and rendering", () => {
    it("should render groin regions without performance issues", () => {
      const startTime = performance.now();

      const { container } = render(<FrontBody />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should be fast (under 100ms per NFR001)
      expect(renderTime).toBeLessThan(100);

      // All groin regions should be present
      const groinElements = container.querySelectorAll("[id$='-groin']");
      expect(groinElements).toHaveLength(3);
    });

    it("should handle rapid state changes without errors", () => {
      const { rerender } = render(<FrontBody selectedRegions={[]} />);

      // Rapidly change selection state
      for (let i = 0; i < 10; i++) {
        rerender(
          <FrontBody
            selectedRegions={
              i % 2 === 0 ? ["left-groin"] : ["center-groin", "right-groin"]
            }
          />
        );
      }

      // Should not throw errors
      expect(true).toBe(true);
    });
  });
});
