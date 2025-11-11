/**
 * Unit tests for shared navigation configuration
 *
 * Tests the navigation configuration helpers to ensure:
 * - Correct pillar ordering (Track → Insights → Manage → Support)
 * - Surface filtering works correctly (desktop vs mobile)
 * - Helper functions return expected values
 * - Labels are consistent across all surfaces
 *
 * @see src/config/navigation.ts
 */

import {
  NAV_PILLARS,
  getNavDestinations,
  getNavPillars,
  getPageTitle,
  getDestinationByHref,
  NO_NAV_ROUTES,
  shouldShowNavigation,
} from "../navigation";

describe("Navigation Configuration", () => {
  describe("NAV_PILLARS", () => {
    it("should have exactly 4 pillars in correct order", () => {
      expect(NAV_PILLARS).toHaveLength(4);
      expect(NAV_PILLARS[0].id).toBe("track");
      expect(NAV_PILLARS[1].id).toBe("insights");
      expect(NAV_PILLARS[2].id).toBe("manage");
      expect(NAV_PILLARS[3].id).toBe("support");
    });

    it("should have correct pillar labels", () => {
      expect(NAV_PILLARS[0].label).toBe("Track");
      expect(NAV_PILLARS[1].label).toBe("Insights");
      expect(NAV_PILLARS[2].label).toBe("Manage");
      expect(NAV_PILLARS[3].label).toBe("Support");
    });

    it("should have correct order values", () => {
      expect(NAV_PILLARS[0].order).toBe(1);
      expect(NAV_PILLARS[1].order).toBe(2);
      expect(NAV_PILLARS[2].order).toBe(3);
      expect(NAV_PILLARS[3].order).toBe(4);
    });

    it("should have destinations for each pillar", () => {
      NAV_PILLARS.forEach((pillar) => {
        expect(pillar.destinations).toBeDefined();
        expect(Array.isArray(pillar.destinations)).toBe(true);
        expect(pillar.destinations.length).toBeGreaterThan(0);
      });
    });

    it("should have required properties for each destination", () => {
      NAV_PILLARS.forEach((pillar) => {
        pillar.destinations.forEach((destination) => {
          expect(destination.href).toBeDefined();
          expect(destination.label).toBeDefined();
          expect(destination.surface).toBeDefined();
          expect(["desktop", "mobile", "all"]).toContain(destination.surface);
        });
      });
    });

    it("should have aria-labels for all destinations", () => {
      NAV_PILLARS.forEach((pillar) => {
        pillar.destinations.forEach((destination) => {
          expect(destination.ariaLabel).toBeDefined();
          expect(destination.ariaLabel!.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have icons for all destinations", () => {
      NAV_PILLARS.forEach((pillar) => {
        pillar.destinations.forEach((destination) => {
          expect(destination.icon).toBeDefined();
        });
      });
    });
  });

  describe("getNavDestinations", () => {
    it("should return desktop destinations including 'all' surface", () => {
      const destinations = getNavDestinations("desktop");
      expect(destinations.length).toBeGreaterThan(0);

      destinations.forEach((destination) => {
        expect(["desktop", "all"]).toContain(destination.surface);
      });
    });

    it("should return mobile destinations including 'all' surface", () => {
      const destinations = getNavDestinations("mobile");
      expect(destinations.length).toBeGreaterThan(0);

      destinations.forEach((destination) => {
        expect(["mobile", "all"]).toContain(destination.surface);
      });
    });

    it("should not include /more in navigation for any surface", () => {
      const desktopDestinations = getNavDestinations("desktop");
      const mobileDestinations = getNavDestinations("mobile");

      expect(
        desktopDestinations.find((dest) => dest.href === "/more")
      ).toBeUndefined();
      expect(
        mobileDestinations.find((dest) => dest.href === "/more")
      ).toBeUndefined();
    });

    it("should maintain pillar order in flattened destinations", () => {
      const destinations = getNavDestinations("desktop");
      const trackDestinations = destinations.filter((dest) =>
        ["/dashboard", "/daily-log", "/body-map", "/photos"].includes(dest.href)
      );
      const insightsDestinations = destinations.filter((dest) =>
        ["/insights", "/timeline"].includes(dest.href)
      );

      const firstTrackIndex = destinations.indexOf(trackDestinations[0]);
      const firstInsightsIndex = destinations.indexOf(insightsDestinations[0]);

      expect(firstInsightsIndex).toBeGreaterThan(firstTrackIndex);
    });

    it("should include Dashboard and Log for mobile", () => {
      const destinations = getNavDestinations("mobile");
      const hrefs = destinations.map((d) => d.href);

      expect(hrefs).toContain("/dashboard");
      expect(hrefs).toContain("/daily-log");
    });

    it("should include Health Insights for both desktop and mobile", () => {
      const desktopDestinations = getNavDestinations("desktop");
      const mobileDestinations = getNavDestinations("mobile");

      expect(desktopDestinations.some((d) => d.href === "/insights")).toBe(
        true
      );
      expect(mobileDestinations.some((d) => d.href === "/insights")).toBe(
        true
      );
    });
  });

  describe("getNavPillars", () => {
    it("should return pillars with destinations filtered by surface", () => {
      const desktopPillars = getNavPillars("desktop");
      const mobilePillars = getNavPillars("mobile");

      desktopPillars.forEach((pillar) => {
        pillar.destinations.forEach((destination) => {
          expect(["desktop", "all"]).toContain(destination.surface);
        });
      });

      mobilePillars.forEach((pillar) => {
        pillar.destinations.forEach((destination) => {
          expect(["mobile", "all"]).toContain(destination.surface);
        });
      });
    });

    it("should maintain pillar order", () => {
      const pillars = getNavPillars("desktop");
      expect(pillars[0].id).toBe("track");
      expect(pillars[1].id).toBe("insights");
      expect(pillars[2].id).toBe("manage");
    });

    it("should only include pillars with destinations for the surface", () => {
      const pillars = getNavPillars("desktop");
      pillars.forEach((pillar) => {
        expect(pillar.destinations.length).toBeGreaterThan(0);
      });
    });
  });

  describe("getPageTitle", () => {
    it("should return correct title for known routes", () => {
      expect(getPageTitle("/dashboard")).toBe("Dashboard");
      expect(getPageTitle("/daily-log")).toBe("Daily Log");
      expect(getPageTitle("/insights")).toBe("Health Insights");
      expect(getPageTitle("/my-data")).toBe("My Data");
      expect(getPageTitle("/about")).toBe("About");
    });

    it("should return correct titles for Epic 6 renamed routes", () => {
      expect(getPageTitle("/body-map")).toBe("Body Map");
      expect(getPageTitle("/timeline")).toBe("Timeline");
    });

    it("should return fallback for unknown routes", () => {
      expect(getPageTitle("/unknown-route")).toBe("Symptom Tracker");
      expect(getPageTitle("/random")).toBe("Symptom Tracker");
    });

    it("should return consistent titles with destination labels", () => {
      const allDestinations = [
        ...getNavDestinations("desktop"),
        ...getNavDestinations("mobile"),
      ];

      // Deduplicate by href
      const uniqueDestinations = Array.from(
        new Map(allDestinations.map((d) => [d.href, d])).values()
      );

      uniqueDestinations.forEach((destination) => {
        const title = getPageTitle(destination.href);
        expect(title).toBe(destination.label);
      });
    });
  });

  describe("getDestinationByHref", () => {
    it("should return destination for valid href", () => {
      const destination = getDestinationByHref("/dashboard");
      expect(destination).toBeDefined();
      expect(destination!.href).toBe("/dashboard");
      expect(destination!.label).toBe("Dashboard");
    });

    it("should return undefined for invalid href", () => {
      const destination = getDestinationByHref("/nonexistent");
      expect(destination).toBeUndefined();
    });

    it("should return destination with complete properties", () => {
      const destination = getDestinationByHref("/daily-log");
      expect(destination).toBeDefined();
      expect(destination!.href).toBe("/daily-log");
      expect(destination!.label).toBeDefined();
      expect(destination!.ariaLabel).toBeDefined();
      expect(destination!.icon).toBeDefined();
      expect(destination!.surface).toBeDefined();
    });

    it("should not return /more destination", () => {
      const destination = getDestinationByHref("/more");
      expect(destination).toBeUndefined();
    });

    it("should return destinations for Epic 6 renamed routes", () => {
      const bodyMap = getDestinationByHref("/body-map");
      expect(bodyMap).toBeDefined();
      expect(bodyMap!.label).toBe("Body Map");

      const insights = getDestinationByHref("/insights");
      expect(insights).toBeDefined();
      expect(insights!.label).toBe("Health Insights");

      const timeline = getDestinationByHref("/timeline");
      expect(timeline).toBeDefined();
      expect(timeline!.label).toBe("Timeline");

      const myData = getDestinationByHref("/my-data");
      expect(myData).toBeDefined();
      expect(myData!.label).toBe("My Data");
    });

    it("should not return old route paths that were renamed", () => {
      expect(getDestinationByHref("/flares")).toBeUndefined();
      expect(getDestinationByHref("/analytics")).toBeUndefined();
      expect(getDestinationByHref("/calendar")).toBeUndefined();
      expect(getDestinationByHref("/manage")).toBeUndefined();
      expect(getDestinationByHref("/mood")).toBeUndefined();
      expect(getDestinationByHref("/sleep")).toBeUndefined();
    });
  });

  describe("Accessibility", () => {
    it("should have unique aria-labels for all destinations", () => {
      const allDestinations = NAV_PILLARS.flatMap((p) => p.destinations);
      const ariaLabels = allDestinations.map((d) => d.ariaLabel);
      const uniqueAriaLabels = new Set(ariaLabels);

      expect(ariaLabels.length).toBe(uniqueAriaLabels.size);
    });

    it("should have descriptive aria-labels (not just repeating label)", () => {
      const allDestinations = NAV_PILLARS.flatMap((p) => p.destinations);

      allDestinations.forEach((destination) => {
        // Aria label should contain the label text but provide more context
        expect(destination.ariaLabel!.toLowerCase()).toContain(
          destination.label.toLowerCase()
        );
      });
    });
  });

  describe("Regression: AC0.2 - /more hub retired", () => {
    it("should not have /more in NAV_PILLARS", () => {
      const allHrefs = NAV_PILLARS.flatMap((pillar) =>
        pillar.destinations.map((d) => d.href)
      );
      expect(allHrefs).not.toContain("/more");
    });

    it("should not return /more from getNavDestinations", () => {
      const desktopDests = getNavDestinations("desktop");
      const mobileDests = getNavDestinations("mobile");

      expect(desktopDests.find((d) => d.href === "/more")).toBeUndefined();
      expect(mobileDests.find((d) => d.href === "/more")).toBeUndefined();
    });

    it("should not return /more from getDestinationByHref", () => {
      expect(getDestinationByHref("/more")).toBeUndefined();
    });
  });

  describe("Navigation Visibility Logic (AC3)", () => {
    describe("NO_NAV_ROUTES", () => {
      it("should include landing page and onboarding routes", () => {
        expect(NO_NAV_ROUTES).toContain("/");
        expect(NO_NAV_ROUTES).toContain("/onboarding");
      });

      it("should be a centralized configuration", () => {
        expect(Array.isArray(NO_NAV_ROUTES)).toBe(true);
        expect(NO_NAV_ROUTES.length).toBeGreaterThan(0);
      });
    });

    describe("shouldShowNavigation", () => {
      it("should return false for landing page", () => {
        expect(shouldShowNavigation("/")).toBe(false);
      });

      it("should return false for onboarding base route", () => {
        expect(shouldShowNavigation("/onboarding")).toBe(false);
      });

      it("should return false for onboarding sub-routes", () => {
        expect(shouldShowNavigation("/onboarding/step1")).toBe(false);
        expect(shouldShowNavigation("/onboarding/step2")).toBe(false);
        expect(shouldShowNavigation("/onboarding/complete")).toBe(false);
      });

      it("should return true for standard navigation routes", () => {
        expect(shouldShowNavigation("/dashboard")).toBe(true);
        expect(shouldShowNavigation("/daily-log")).toBe(true);
        expect(shouldShowNavigation("/insights")).toBe(true);
        expect(shouldShowNavigation("/body-map")).toBe(true);
        expect(shouldShowNavigation("/settings")).toBe(true);
      });

      it("should return true for unknown routes", () => {
        expect(shouldShowNavigation("/unknown-route")).toBe(true);
        expect(shouldShowNavigation("/random")).toBe(true);
      });

      it("should handle edge cases", () => {
        // Route that starts with "/" but is not the landing page
        expect(shouldShowNavigation("/about")).toBe(true);

        // Nested routes
        expect(shouldShowNavigation("/dashboard/details")).toBe(true);
      });
    });
  });

  describe("Title Rendering Integration (AC4)", () => {
    it("should provide consistent title for Log route", () => {
      const title = getPageTitle("/daily-log");
      expect(title).toBe("Daily Log");

      // Verify it matches the destination label
      const destination = getDestinationByHref("/daily-log");
      expect(destination).toBeDefined();
      expect(destination!.label).toBe(title);
    });

    it("should provide consistent title for Dashboard route", () => {
      const title = getPageTitle("/dashboard");
      expect(title).toBe("Dashboard");

      // Verify it matches the destination label
      const destination = getDestinationByHref("/dashboard");
      expect(destination).toBeDefined();
      expect(destination!.label).toBe(title);
    });

    it("should provide consistent titles across all routes", () => {
      const allHrefs = NAV_PILLARS.flatMap((pillar) =>
        pillar.destinations.map((d) => d.href)
      );

      allHrefs.forEach((href) => {
        const title = getPageTitle(href);
        const destination = getDestinationByHref(href);

        expect(destination).toBeDefined();
        expect(title).toBe(destination!.label);
      });
    });

    it("should have Daily Log available on both mobile and desktop", () => {
      const desktopDests = getNavDestinations("desktop");
      const mobileDests = getNavDestinations("mobile");

      const logDesktop = desktopDests.find((d) => d.href === "/daily-log");
      const logMobile = mobileDests.find((d) => d.href === "/daily-log");

      expect(logDesktop).toBeDefined();
      expect(logMobile).toBeDefined();
      expect(logDesktop!.label).toBe("Daily Log");
      expect(logMobile!.label).toBe("Daily Log");
    });

    it("should have Dashboard available on both mobile and desktop", () => {
      const desktopDests = getNavDestinations("desktop");
      const mobileDests = getNavDestinations("mobile");

      const dashboardDesktop = desktopDests.find((d) => d.href === "/dashboard");
      const dashboardMobile = mobileDests.find((d) => d.href === "/dashboard");

      expect(dashboardDesktop).toBeDefined();
      expect(dashboardMobile).toBeDefined();
      expect(dashboardDesktop!.label).toBe("Dashboard");
      expect(dashboardMobile!.label).toBe("Dashboard");
    });
  });

  describe("Configuration Completeness (AC1)", () => {
    it("should have complete route metadata for all destinations", () => {
      NAV_PILLARS.forEach((pillar) => {
        pillar.destinations.forEach((destination) => {
          // Title (via label)
          expect(destination.label).toBeDefined();
          expect(destination.label.length).toBeGreaterThan(0);

          // Pillar association (implicit via parent)
          expect(pillar.id).toBeDefined();
          expect(["track", "insights", "manage", "support"]).toContain(
            pillar.id
          );

          // Surface visibility
          expect(destination.surface).toBeDefined();
          expect(["desktop", "mobile", "all"]).toContain(destination.surface);

          // Additional metadata
          expect(destination.href).toBeDefined();
          expect(destination.ariaLabel).toBeDefined();
          expect(destination.icon).toBeDefined();
        });
      });
    });

    it("should maintain pillar ordering as specified", () => {
      expect(NAV_PILLARS[0].id).toBe("track");
      expect(NAV_PILLARS[0].order).toBe(1);
      expect(NAV_PILLARS[1].id).toBe("insights");
      expect(NAV_PILLARS[1].order).toBe(2);
      expect(NAV_PILLARS[2].id).toBe("manage");
      expect(NAV_PILLARS[2].order).toBe(3);
      expect(NAV_PILLARS[3].id).toBe("support");
      expect(NAV_PILLARS[3].order).toBe(4);
    });

    it("should be consumed by all navigation components", () => {
      // Verify helper functions exist and work
      expect(typeof getNavPillars).toBe("function");
      expect(typeof getNavDestinations).toBe("function");
      expect(typeof getPageTitle).toBe("function");
      expect(typeof shouldShowNavigation).toBe("function");

      // Verify they return expected data types
      expect(Array.isArray(getNavPillars("desktop"))).toBe(true);
      expect(Array.isArray(getNavDestinations("mobile"))).toBe(true);
      expect(typeof getPageTitle("/dashboard")).toBe("string");
      expect(typeof shouldShowNavigation("/dashboard")).toBe("boolean");
    });
  });
});
