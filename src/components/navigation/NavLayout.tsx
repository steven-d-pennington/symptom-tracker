"use client";

import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TopBar } from "./TopBar";
import { BottomTabs } from "./BottomTabs";
import { Sidebar } from "./Sidebar";

interface NavLayoutProps {
  children: React.ReactNode;
}

// Routes that should NOT show navigation (landing page, onboarding, etc.)
const NO_NAV_ROUTES = ["/", "/onboarding"];

// Get page title based on pathname
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    "/log": "Daily Log",
    "/dashboard": "Dashboard",
    "/analytics": "Analytics",
    "/photos": "Photo Gallery",
    "/body-map": "Body Map",
    "/flares": "Active Flares",
    "/triggers": "Trigger Analysis",
    "/more": "More",
    "/settings": "Settings",
    "/export": "Export Data",
    "/privacy": "Privacy",
    "/about": "About",
  };

  return titles[pathname] || "Symptom Tracker";
}

export function NavLayout({ children }: NavLayoutProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Check if current route should show navigation
  const showNav =
    !NO_NAV_ROUTES.includes(pathname) && !pathname.startsWith("/onboarding");

  const pageTitle = getPageTitle(pathname);

  if (!showNav) {
    // No navigation for landing page or onboarding
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Top Bar */}
      <TopBar title={pageTitle} showMenu={isMobile} />

      {/* Main Content Area */}
      <main
        className={`
          min-h-screen
          pt-14
          ${isMobile ? "pb-16" : "md:ml-64"}
        `}
      >
        {children}
      </main>

      {/* Mobile Bottom Tabs */}
      {isMobile && <BottomTabs />}
    </>
  );
}
