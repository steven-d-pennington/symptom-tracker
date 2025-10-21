/**
 * Component tests for Sidebar
 *
 * Tests that Sidebar correctly:
 * - Renders Track → Analyze → Manage → Support pillars in order
 * - Uses shared navigation configuration
 * - Has proper aria-labels for accessibility
 * - Does not include /more link
 *
 * @see src/components/navigation/Sidebar.tsx
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "../Sidebar";
import { getNavPillars } from "@/config/navigation";

// Mock the hooks
jest.mock("@/components/navigation/hooks/useActiveRoute", () => ({
  useActiveRoute: () => ({
    pathname: "/dashboard",
    isActive: (path: string) => path === "/dashboard",
    isExactMatch: (path: string) => path === "/dashboard",
  }),
}));

describe("Sidebar", () => {
  it("should render navigation with aria-label", () => {
    render(<Sidebar />);
    const nav = screen.getByRole("navigation", { name: /primary navigation/i });
    expect(nav).toBeInTheDocument();
  });

  it("should render all four pillars in correct order", () => {
    render(<Sidebar />);

    const pillars = getNavPillars("desktop");
    expect(pillars).toHaveLength(4);

    // Check for pillar headings in correct order
    const headings = screen.getAllByRole("heading", { level: 3 });
    const pillarLabels = headings.map((h) => h.textContent);

    expect(pillarLabels).toContain("Track");
    expect(pillarLabels).toContain("Analyze");
    expect(pillarLabels).toContain("Manage");
    expect(pillarLabels).toContain("Support");

    // Verify order
    const trackIndex = pillarLabels.indexOf("Track");
    const analyzeIndex = pillarLabels.indexOf("Analyze");
    const manageIndex = pillarLabels.indexOf("Manage");
    const supportIndex = pillarLabels.indexOf("Support");

    expect(trackIndex).toBeLessThan(analyzeIndex);
    expect(analyzeIndex).toBeLessThan(manageIndex);
    expect(manageIndex).toBeLessThan(supportIndex);
  });

  it("should render navigation links with aria-labels from config", () => {
    render(<Sidebar />);

    const dashboardLink = screen.getByRole("link", {
      name: /dashboard.*view today's summary/i,
    });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard");

    const logLink = screen.getByRole("link", {
      name: /log.*record daily reflection/i,
    });
    expect(logLink).toBeInTheDocument();
    expect(logLink).toHaveAttribute("href", "/log");
  });

  it("should mark active link with aria-current", () => {
    render(<Sidebar />);

    const dashboardLink = screen.getByRole("link", {
      name: /dashboard/i,
    });
    expect(dashboardLink).toHaveAttribute("aria-current", "page");

    const logLink = screen.getByRole("link", {
      name: /log/i,
    });
    expect(logLink).not.toHaveAttribute("aria-current");
  });

  it("should not render /more link (AC0.2)", () => {
    render(<Sidebar />);

    const allLinks = screen.getAllByRole("link");
    const moreLink = allLinks.find((link) => link.getAttribute("href") === "/more");

    expect(moreLink).toBeUndefined();
  });

  it("should render Track pillar destinations", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /log/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /flares/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /photos/i })).toBeInTheDocument();
  });

  it("should render Analyze pillar destinations", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /calendar/i })).toBeInTheDocument();
  });

  it("should render Manage pillar destinations", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /manage data/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /export data/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy/i })).toBeInTheDocument();
  });

  it("should render Support pillar destinations", () => {
    render(<Sidebar />);

    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("should use consistent labels from shared config", () => {
    render(<Sidebar />);

    const pillars = getNavPillars("desktop");
    pillars.forEach((pillar) => {
      pillar.destinations.forEach((destination) => {
        const link = screen.getByRole("link", { name: new RegExp(destination.label, "i") });
        expect(link).toBeInTheDocument();
        expect(link.textContent).toBe(destination.label);
      });
    });
  });

  it("should render icons for all destinations", () => {
    render(<Sidebar />);

    const allLinks = screen.getAllByRole("link");
    // Filter out the logo link
    const navLinks = allLinks.filter(
      (link) => link.getAttribute("href") !== "/"
    );

    navLinks.forEach((link) => {
      // Each nav link should have an icon (svg element)
      const svg = link.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  it("should have proper keyboard navigation structure", () => {
    render(<Sidebar />);

    const allLinks = screen.getAllByRole("link");
    const navLinks = allLinks.filter(
      (link) => link.getAttribute("href") !== "/"
    );

    // All links should be keyboard accessible (no negative tabindex)
    navLinks.forEach((link) => {
      const tabIndex = link.getAttribute("tabindex");
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
