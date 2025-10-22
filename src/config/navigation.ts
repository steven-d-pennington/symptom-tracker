/**
 * Shared Navigation Configuration
 *
 * Single source of truth for navigation across all surfaces (desktop sidebar, mobile bottom tabs, top bar titles).
 * Implements the Track / Analyze / Manage / Support pillar structure per UI/UX blueprint.
 *
 * @see docs/ui/ui-ux-revamp-blueprint.md#3-Proposed-Information-Architecture
 */

import {
  LayoutDashboard,
  FileText,
  Flame,
  Camera,
  TrendingUp,
  Calendar,
  Sliders,
  Download,
  Settings,
  Lock,
  Info,
  LucideIcon,
} from "lucide-react";

export interface NavDestination {
  href: string;
  label: string;
  ariaLabel?: string;
  icon?: LucideIcon;
  surface: "desktop" | "mobile" | "all";
}

export interface NavPillar {
  id: "track" | "analyze" | "manage" | "support";
  label: string;
  order: number;
  destinations: NavDestination[];
}

/**
 * Primary navigation pillars in Track → Analyze → Manage → Support order
 */
export const NAV_PILLARS: NavPillar[] = [
  {
    id: "track",
    label: "Track",
    order: 1,
    destinations: [
      {
        href: "/dashboard",
        label: "Dashboard",
        ariaLabel: "Dashboard - View today's summary",
        icon: LayoutDashboard,
        surface: "all",
      },
      {
        href: "/log",
        label: "Log",
        ariaLabel: "Log - Record daily reflection",
        icon: FileText,
        surface: "all",
      },
      {
        href: "/flares",
        label: "Flares",
        ariaLabel: "Flares - Track active flare-ups",
        icon: Flame,
        surface: "desktop",
      },
      {
        href: "/photos",
        label: "Photos",
        ariaLabel: "Photos - View photo gallery",
        icon: Camera,
        surface: "desktop",
      },
    ],
  },
  {
    id: "analyze",
    label: "Analyze",
    order: 2,
    destinations: [
      {
        href: "/analytics",
        label: "Analytics",
        ariaLabel: "Analytics - Review trends and insights",
        icon: TrendingUp,
        surface: "all",
      },
      {
        href: "/calendar",
        label: "Calendar",
        ariaLabel: "Calendar - View timeline history",
        icon: Calendar,
        surface: "desktop",
      },
    ],
  },
  {
    id: "manage",
    label: "Manage",
    order: 3,
    destinations: [
      {
        href: "/manage",
        label: "Manage Data",
        ariaLabel: "Manage Data - Customize medications, symptoms, and triggers",
        icon: Sliders,
        surface: "desktop",
      },
      {
        href: "/export",
        label: "Export Data",
        ariaLabel: "Export Data - Download your health data",
        icon: Download,
        surface: "desktop",
      },
      {
        href: "/settings",
        label: "Settings",
        ariaLabel: "Settings - Customize your experience",
        icon: Settings,
        surface: "all",
      },
      {
        href: "/privacy",
        label: "Privacy",
        ariaLabel: "Privacy - How we protect your data",
        icon: Lock,
        surface: "desktop",
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    order: 4,
    destinations: [
      {
        href: "/about",
        label: "About",
        ariaLabel: "About - App version and information",
        icon: Info,
        surface: "desktop",
      },
    ],
  },
];

/**
 * Get navigation destinations filtered by surface (desktop or mobile)
 * @param surface - "desktop" or "mobile"
 * @returns Array of destinations available on the specified surface
 */
export function getNavDestinations(
  surface: "desktop" | "mobile"
): NavDestination[] {
  return NAV_PILLARS.flatMap((pillar) =>
    pillar.destinations.filter(
      (destination) =>
        destination.surface === surface || destination.surface === "all"
    )
  );
}

/**
 * Get navigation pillars with destinations filtered by surface
 * @param surface - "desktop" or "mobile"
 * @returns Array of pillars with only destinations available on the specified surface
 */
export function getNavPillars(surface: "desktop" | "mobile"): NavPillar[] {
  return NAV_PILLARS.map((pillar) => ({
    ...pillar,
    destinations: pillar.destinations.filter(
      (destination) =>
        destination.surface === surface || destination.surface === "all"
    ),
  })).filter((pillar) => pillar.destinations.length > 0);
}

/**
 * Get page title for a given pathname
 * @param pathname - Current route pathname
 * @returns Page title or "Symptom Tracker" as fallback
 */
export function getPageTitle(pathname: string): string {
  for (const pillar of NAV_PILLARS) {
    const destination = pillar.destinations.find(
      (dest) => dest.href === pathname
    );
    if (destination) {
      return destination.label;
    }
  }
  return "Symptom Tracker";
}

/**
 * Get destination by href
 * @param href - Route href
 * @returns NavDestination or undefined if not found
 */
export function getDestinationByHref(
  href: string
): NavDestination | undefined {
  for (const pillar of NAV_PILLARS) {
    const destination = pillar.destinations.find((dest) => dest.href === href);
    if (destination) {
      return destination;
    }
  }
  return undefined;
}

/**
 * Routes that should NOT show navigation (landing page, onboarding, etc.)
 * Centralized configuration for navigation visibility logic.
 */
export const NO_NAV_ROUTES = ["/", "/onboarding"];

/**
 * Check if a route should display navigation
 * @param pathname - Current route pathname
 * @returns true if navigation should be shown, false otherwise
 */
export function shouldShowNavigation(pathname: string): boolean {
  // Exact match for no-nav routes
  if (NO_NAV_ROUTES.includes(pathname)) {
    return false;
  }

  // Check if route starts with any no-nav prefix (e.g., /onboarding/step1)
  for (const route of NO_NAV_ROUTES) {
    if (route !== "/" && pathname.startsWith(route)) {
      return false;
    }
  }

  return true;
}
