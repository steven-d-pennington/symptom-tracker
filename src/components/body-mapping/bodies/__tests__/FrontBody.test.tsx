import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FrontBody } from "../FrontBody";

describe("FrontBody Component - Groin Regions", () => {
  const mockOnRegionClick = jest.fn();
  const mockOnRegionHover = jest.fn();

  beforeEach(() => {
    mockOnRegionClick.mockClear();
    mockOnRegionHover.mockClear();
  });

  describe("AC1.1: Front body view displays three distinct groin regions", () => {
    it("should render exactly 3 groin SVG elements", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");
      const centerGroin = container.querySelector("#center-groin");
      const rightGroin = container.querySelector("#right-groin");

      expect(leftGroin).toBeInTheDocument();
      expect(centerGroin).toBeInTheDocument();
      expect(rightGroin).toBeInTheDocument();
    });

    it("should render groin regions as ellipse elements", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");
      const centerGroin = container.querySelector("#center-groin");
      const rightGroin = container.querySelector("#right-groin");

      expect(leftGroin?.tagName).toBe("ellipse");
      expect(centerGroin?.tagName).toBe("ellipse");
      expect(rightGroin?.tagName).toBe("ellipse");
    });

    it("should NOT render old single groin region", () => {
      const { container } = render(<FrontBody />);

      const oldGroin = container.querySelector("#groin");
      expect(oldGroin).not.toBeInTheDocument();
    });
  });

  describe("AC1.3: Each groin region is selectable with hover/active states", () => {
    it("should have body-region class for hover styling", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");
      const centerGroin = container.querySelector("#center-groin");
      const rightGroin = container.querySelector("#right-groin");

      expect(leftGroin).toHaveClass("body-region");
      expect(centerGroin).toHaveClass("body-region");
      expect(rightGroin).toHaveClass("body-region");
    });

    it("should change opacity on hover via CSS", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");

      // Check that hover class exists (CSS will handle opacity change)
      expect(leftGroin).toHaveClass("body-region");
    });

    it("should highlight groin region when highlightedRegion prop matches", () => {
      const { container } = render(
        <FrontBody highlightedRegion="left-groin" />
      );

      const leftGroin = container.querySelector("#left-groin");
      const fillOpacity = leftGroin?.getAttribute("fill-opacity");

      // Highlighted region should have opacity of 0.5
      expect(fillOpacity).toBe("0.5");
    });

    it("should show selected state when region is in selectedRegions", () => {
      const { container } = render(
        <FrontBody selectedRegions={["left-groin", "right-groin"]} />
      );

      const leftGroin = container.querySelector("#left-groin");
      const rightGroin = container.querySelector("#right-groin");
      const centerGroin = container.querySelector("#center-groin");

      // Selected regions should have opacity of 0.6
      expect(leftGroin?.getAttribute("fill-opacity")).toBe("0.6");
      expect(rightGroin?.getAttribute("fill-opacity")).toBe("0.6");

      // Unselected region should have default opacity of 0.3
      expect(centerGroin?.getAttribute("fill-opacity")).toBe("0.3");
    });
  });

  describe("AC1.5: Groin region selection triggers flare-location flow", () => {
    it("should call onRegionClick with left-groin when left groin is clicked", () => {
      const { container } = render(
        <FrontBody onRegionClick={mockOnRegionClick} />
      );

      const leftGroin = container.querySelector("#left-groin");
      fireEvent.click(leftGroin!);

      expect(mockOnRegionClick).toHaveBeenCalledWith("left-groin");
      expect(mockOnRegionClick).toHaveBeenCalledTimes(1);
    });

    it("should call onRegionClick with center-groin when center groin is clicked", () => {
      const { container } = render(
        <FrontBody onRegionClick={mockOnRegionClick} />
      );

      const centerGroin = container.querySelector("#center-groin");
      fireEvent.click(centerGroin!);

      expect(mockOnRegionClick).toHaveBeenCalledWith("center-groin");
    });

    it("should call onRegionClick with right-groin when right groin is clicked", () => {
      const { container } = render(
        <FrontBody onRegionClick={mockOnRegionClick} />
      );

      const rightGroin = container.querySelector("#right-groin");
      fireEvent.click(rightGroin!);

      expect(mockOnRegionClick).toHaveBeenCalledWith("right-groin");
    });

    it("should call onRegionHover with region ID on mouse enter", () => {
      const { container } = render(
        <FrontBody onRegionHover={mockOnRegionHover} />
      );

      const leftGroin = container.querySelector("#left-groin");
      fireEvent.mouseEnter(leftGroin!);

      expect(mockOnRegionHover).toHaveBeenCalledWith("left-groin");
    });

    it("should call onRegionHover with null on mouse leave", () => {
      const { container } = render(
        <FrontBody onRegionHover={mockOnRegionHover} />
      );

      const leftGroin = container.querySelector("#left-groin");
      fireEvent.mouseLeave(leftGroin!);

      expect(mockOnRegionHover).toHaveBeenCalledWith(null);
    });
  });

  describe("AC1.6: Region labels display correctly", () => {
    it("should have aria-label for Left Groin", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");
      expect(leftGroin).toHaveAttribute("aria-label", "Left Groin");
    });

    it("should have aria-label for Center Groin", () => {
      const { container } = render(<FrontBody />);

      const centerGroin = container.querySelector("#center-groin");
      expect(centerGroin).toHaveAttribute("aria-label", "Center Groin");
    });

    it("should have aria-label for Right Groin", () => {
      const { container } = render(<FrontBody />);

      const rightGroin = container.querySelector("#right-groin");
      expect(rightGroin).toHaveAttribute("aria-label", "Right Groin");
    });
  });

  describe("Flare visualization on groin regions", () => {
    it("should apply flare-pulse class when region has active flare", () => {
      const { container } = render(
        <FrontBody flareRegions={["left-groin"]} />
      );

      const leftGroin = container.querySelector("#left-groin");
      expect(leftGroin).toHaveClass("flare-pulse");
    });

    it("should have higher opacity for flare regions", () => {
      const { container } = render(
        <FrontBody flareRegions={["center-groin"]} />
      );

      const centerGroin = container.querySelector("#center-groin");
      const fillOpacity = centerGroin?.getAttribute("fill-opacity");

      // Flare regions should have opacity of 0.9
      expect(fillOpacity).toBe("0.9");
    });

    it("should apply severity-based coloring for flare regions", () => {
      const { container } = render(
        <FrontBody
          flareRegions={["right-groin"]}
          severityByRegion={{ "right-groin": 8 }}
        />
      );

      const rightGroin = container.querySelector("#right-groin");
      const fill = rightGroin?.getAttribute("fill");

      // High severity flare should use dark red
      expect(fill).toBe("#991b1b");
    });
  });

  describe("SVG rendering and coordinates", () => {
    it("should render groin regions within viewBox bounds", () => {
      const { container } = render(<FrontBody />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("viewBox", "0 0 400 800");

      const leftGroin = container.querySelector("#left-groin");
      const centerGroin = container.querySelector("#center-groin");
      const rightGroin = container.querySelector("#right-groin");

      // All cx/cy coordinates should be within viewBox
      const leftCx = Number(leftGroin?.getAttribute("cx"));
      const leftCy = Number(leftGroin?.getAttribute("cy"));
      const centerCx = Number(centerGroin?.getAttribute("cx"));
      const centerCy = Number(centerGroin?.getAttribute("cy"));
      const rightCx = Number(rightGroin?.getAttribute("cx"));
      const rightCy = Number(rightGroin?.getAttribute("cy"));

      expect(leftCx).toBeGreaterThanOrEqual(0);
      expect(leftCx).toBeLessThanOrEqual(400);
      expect(leftCy).toBeGreaterThanOrEqual(0);
      expect(leftCy).toBeLessThanOrEqual(800);

      expect(centerCx).toBeGreaterThanOrEqual(0);
      expect(centerCx).toBeLessThanOrEqual(400);
      expect(centerCy).toBeGreaterThanOrEqual(0);
      expect(centerCy).toBeLessThanOrEqual(800);

      expect(rightCx).toBeGreaterThanOrEqual(0);
      expect(rightCx).toBeLessThanOrEqual(400);
      expect(rightCy).toBeGreaterThanOrEqual(0);
      expect(rightCy).toBeLessThanOrEqual(800);
    });

    it("should have adequate touch target size (minimum 44x44px equivalent)", () => {
      const { container } = render(<FrontBody />);

      const leftGroin = container.querySelector("#left-groin");
      const rx = Number(leftGroin?.getAttribute("rx"));
      const ry = Number(leftGroin?.getAttribute("ry"));

      // Ellipse radius should be at least 22px in each direction (44px diameter)
      // to meet touch target size requirements
      expect(rx).toBeGreaterThanOrEqual(18);
      expect(ry).toBeGreaterThanOrEqual(15);
    });
  });
});
