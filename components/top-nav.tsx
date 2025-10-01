"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/medications", label: "Medications" },
  { href: "/journal", label: "Journal" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-3 py-2 shadow-sm backdrop-blur">
      {routes.map((route) => {
        const isActive = pathname.startsWith(route.href);

        return (
          <Link
            key={route.href}
            href={route.href}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}