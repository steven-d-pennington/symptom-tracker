"use client";

import Link from "next/link";
import { FileText, X } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useActiveRoute } from "./hooks/useActiveRoute";
import { getNavPillars } from "@/config/navigation";
import { useUxInstrumentation } from "@/lib/hooks/useUxInstrumentation";

/**
 * Sidebar component - Desktop and mobile navigation drawer
 *
 * Consumes shared navigation configuration via getNavPillars("desktop") to display
 * the Track/Analyze/Manage/Support pillar structure with filtered destinations.
 *
 * @see src/config/navigation.ts - Single source of truth for navigation pillars
 */
interface SidebarProps {
  /** Whether rendering in mobile mode (as drawer) */
  isMobile?: boolean;
  /** Whether mobile drawer is open */
  isOpen?: boolean;
  /** Callback to close mobile drawer */
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const { isActive } = useActiveRoute();
  // Consume shared navigation config - automatically filtered for desktop surface
  const navPillars = getNavPillars("desktop");
  const { recordUxEvent } = useUxInstrumentation();

  // Close mobile menu on escape key
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobile, isOpen, onClose]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  const createNavigationHandler = useCallback(
    (href: string, label: string, pillarId: string) => () => {
      void recordUxEvent("navigation.destination.select", {
        metadata: {
          surface: isMobile ? "sidebar.mobile" : "sidebar.desktop",
          href,
          label,
          pillar: pillarId,
        },
      });

      if (isMobile && onClose) {
        onClose();
      }
    },
    [isMobile, onClose, recordUxEvent],
  );

  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Mobile Sidebar Drawer */}
        <aside
          className={`
            fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border flex flex-col
            transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          aria-label="Main navigation"
          aria-hidden={!isOpen}
        >
          {/* Logo/Brand with Close Button */}
          <div className="h-14 flex items-center justify-between px-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2" onClick={handleLinkClick}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Symptom Tracker</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
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
                          onClick={createNavigationHandler(destination.href, destination.label, pillar.id)}
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
              <div>Version 0.3.0</div>
              <div className="mt-1">Phase 1 & 2 Complete</div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar
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
                      onClick={createNavigationHandler(destination.href, destination.label, pillar.id)}
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
          <div>Version 0.3.0</div>
          <div className="mt-1">Phase 1 & 2 Complete</div>
        </div>
      </div>
    </aside>
  );
}
