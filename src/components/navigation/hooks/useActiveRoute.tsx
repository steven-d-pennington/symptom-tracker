"use client";

import { usePathname } from "next/navigation";

/**
 * Hook to detect and manage active routes
 * Handles nested routes and root route correctly
 */
export function useActiveRoute() {
  const pathname = usePathname();

  /**
   * Check if a given path is the current active route
   * Special handling for root route to avoid false positives
   */
  const isActive = (path: string): boolean => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  /**
   * Check if a path is exactly the current route (no nested matches)
   */
  const isExactMatch = (path: string): boolean => {
    return pathname === path;
  };

  return {
    pathname,
    isActive,
    isExactMatch,
  };
}
