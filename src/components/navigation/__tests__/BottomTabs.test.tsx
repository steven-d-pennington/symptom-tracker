/**
 * Component tests for BottomTabs
 *
 * Tests that BottomTabs correctly:
 * - Renders only mobile-valid destinations from shared config
 * - Preserves pillar order
 * - Has proper aria-labels for accessibility
 * - Does not include /more link
 *
 * @see src/components/navigation/BottomTabs.tsx
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { BottomTabs } from "../BottomTabs";
import { getNavDestinations } from "@/config/navigation";

// Mock the hooks
jest.mock("@/components/navigation/hooks/useActiveRoute", () => ({
  useActiveRoute: () => ({
    pathname: "/log",
    isActive: (path: string) => path === "/log",
    isExactMatch: (path: string) => path === "/log",
  }),
}));

describe("BottomTabs", () => {
  it("should render navigation with aria-label", () => {
    render(<BottomTabs />);
    const nav = screen.getByRole("navigation", { name: /main navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("should render only mobile-valid destinations", () => {
    render(<BottomTabs />);

    const mobileDestinations = getNavDestinations("mobile");
    const allLinks = screen.getAllByRole("link");

    expect(allLinks.length).toBe(mobileDestinations.length);

    mobileDestinations.forEach((destination) => {
      const link = screen.getByRole("link", {
        name: new RegExp(destination.label, "i"),
      });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", destination.href);
    });
  });

  it("should use aria-labels from shared config", () => {
    render(<BottomTabs />);

    const mobileDestinations = getNavDestinations("mobile");

    mobileDestinations.forEach((destination) => {
      const link = screen.getByRole("link", {
        name: new RegExp(destination.ariaLabel || destination.label, "i"),
      });
      expect(link).toBeInTheDocument();
    });
  });

  it("should mark active tab with aria-current", () => {
    render(<BottomTabs />);

    const logLink = screen.getByRole("link", { name: /log/i });
    expect(logLink).toHaveAttribute("aria-current", "page");

    const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
    expect(dashboardLink).not.toHaveAttribute("aria-current");
  });

  it("should not render /more tab (AC0.2)", () => {
    render(<BottomTabs />);

    const allLinks = screen.getAllByRole("link");
    const moreLink = allLinks.find((link) => link.getAttribute("href") === "/more");

    expect(moreLink).toBeUndefined();
  });

  it("should render Dashboard and Log tabs", () => {
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log/i })).toBeInTheDocument();
  });

  it("should render Analytics tab", () => {
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /analytics/i })).toBeInTheDocument();
  });

  it("should render Settings tab", () => {
    render(<BottomTabs />);

    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("should preserve pillar order in tabs", () => {
    render(<BottomTabs />);

    const mobileDestinations = getNavDestinations("mobile");
    const allLinks = screen.getAllByRole("link");

    // Verify that tabs appear in same order as config
    allLinks.forEach((link, index) => {
      const href = link.getAttribute("href");
      expect(href).toBe(mobileDestinations[index].href);
    });
  });

  it("should render icons for all tabs", () => {
    render(<BottomTabs />);

    const allLinks = screen.getAllByRole("link");

    allLinks.forEach((link) => {
      // Each tab should have an icon (svg element)
      const svg = link.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  it("should render labels for all tabs", () => {
    render(<BottomTabs />);

    const mobileDestinations = getNavDestinations("mobile");
    const allLinks = screen.getAllByRole("link");

    allLinks.forEach((link, index) => {
      expect(link.textContent).toContain(mobileDestinations[index].label);
    });
  });

  it("should use consistent labels with shared config", () => {
    render(<BottomTabs />);

    const mobileDestinations = getNavDestinations("mobile");

    mobileDestinations.forEach((destination) => {
      const link = screen.getByRole("link", {
        name: new RegExp(destination.label, "i"),
      });
      // The link text should match the label from config
      expect(link.textContent).toContain(destination.label);
    });
  });

  it("should have proper keyboard navigation structure", () => {
    render(<BottomTabs />);

    const allLinks = screen.getAllByRole("link");

    // All links should be keyboard accessible
    allLinks.forEach((link) => {
      const tabIndex = link.getAttribute("tabindex");
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("should not include desktop-only destinations", () => {
    render(<BottomTabs />);

    const allLinks = screen.getAllByRole("link");
    const hrefs = allLinks.map((link) => link.getAttribute("href"));

    // These should not be in mobile tabs (desktop-only per config)
    expect(hrefs).not.toContain("/flares");
    expect(hrefs).not.toContain("/photos");
    expect(hrefs).not.toContain("/calendar");
    expect(hrefs).not.toContain("/manage");
    expect(hrefs).not.toContain("/export");
    expect(hrefs).not.toContain("/privacy");
    expect(hrefs).not.toContain("/about");
  });
});
