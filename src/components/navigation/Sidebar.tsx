"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useActiveRoute } from "./hooks/useActiveRoute";
import { getNavPillars } from "@/config/navigation";

export function Sidebar() {
  const { isActive } = useActiveRoute();
  const navPillars = getNavPillars("desktop");

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border hidden md:flex md:flex-col"
      aria-label="Main navigation"
    >
      {/* Logo/Brand */}
      <div className="h-14 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Symptom Tracker</span>
        </Link>
      </div>

      {/* Navigation Pillars */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Primary navigation pillars">
        {navPillars.map((pillar, pillarIndex) => (
          <div key={pillar.id} className="mb-6">
            <h3 className="px-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {pillar.label}
            </h3>
            <ul className="space-y-1 px-3">
              {pillar.destinations.map((destination) => {
                const Icon = destination.icon;
                const active = isActive(destination.href);

                return (
                  <li key={destination.href}>
                    <Link
                      href={destination.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-all duration-150
                        ${
                          active
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                      aria-label={destination.ariaLabel || destination.label}
                      aria-current={active ? "page" : undefined}
                    >
                      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                      <span className="truncate">{destination.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {pillarIndex < navPillars.length - 1 && (
              <div className="h-px bg-border mx-6 mt-4" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <div>Version 0.2.0</div>
          <div className="mt-1">Phase 1 & 2 Complete</div>
        </div>
      </div>
    </aside>
  );
}
