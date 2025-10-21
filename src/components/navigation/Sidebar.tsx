"use client";

import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  Calendar,
  Camera,
  Flame,
  BarChart3,
  TrendingUp,
  Settings,
  Download,
  Lock,
  Info,
  Sliders,
} from "lucide-react";
import { useActiveRoute } from "./hooks/useActiveRoute";
import { LucideIcon } from "lucide-react";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Primary",
    items: [
      { icon: FileText, label: "Daily Reflection", href: "/log" },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: TrendingUp, label: "Analytics", href: "/analytics" },
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: Sliders, label: "Manage", href: "/manage" },
    ],
  },
  {
    title: "Health Tracking",
    items: [
      { icon: Camera, label: "Photo Gallery", href: "/photos" },
      { icon: Flame, label: "Active Flares", href: "/flares" },
      { icon: BarChart3, label: "Trigger Analysis", href: "/triggers" },
    ],
  },
  {
    title: "Settings",
    items: [
      { icon: Settings, label: "Settings", href: "/settings" },
      { icon: Download, label: "Export Data", href: "/export" },
      { icon: Lock, label: "Privacy", href: "/privacy" },
      { icon: Info, label: "About", href: "/about" },
    ],
  },
];

export function Sidebar() {
  const { isActive } = useActiveRoute();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border hidden md:flex md:flex-col"
      aria-label="Sidebar navigation"
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

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <ul className="space-y-1 px-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg
                        transition-all duration-150
                        ${
                          active
                            ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {sectionIndex < navSections.length - 1 && (
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
