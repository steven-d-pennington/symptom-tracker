"use client";

import Link from "next/link";
import { useActiveRoute } from "./hooks/useActiveRoute";
import { getNavDestinations } from "@/config/navigation";

/**
 * BottomTabs component - Mobile navigation tabs
 *
 * Consumes shared navigation configuration via getNavDestinations("mobile") to display
 * navigation tabs filtered for mobile surface.
 *
 * @see src/config/navigation.ts - Single source of truth for navigation destinations
 */
export function BottomTabs() {
  const { isActive } = useActiveRoute();
  // Consume shared navigation config - automatically filtered for mobile surface
  const tabs = getNavDestinations("mobile");

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-card border-t border-border md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Main navigation"
    >
      <div className="flex h-full items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-lg
                min-w-[64px] transition-all duration-150
                ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
              aria-label={tab.ariaLabel || tab.label}
              aria-current={active ? "page" : undefined}
            >
              {Icon && (
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    active ? "scale-110" : ""
                  }`}
                />
              )}
              <span
                className={`text-xs ${
                  active ? "font-semibold" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
