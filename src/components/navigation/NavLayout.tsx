"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TopBar } from "./TopBar";
import { BottomTabs } from "./BottomTabs";
import { Sidebar } from "./Sidebar";
import { getPageTitle, shouldShowNavigation } from "@/config/navigation";

interface NavLayoutProps {
  children: React.ReactNode;
}

/**
 * Main navigation layout component
 *
 * Orchestrates navigation display across all surfaces (desktop sidebar, mobile menu, top bar, bottom tabs).
 * Uses shared navigation configuration from @/config/navigation for:
 * - Page title resolution via getPageTitle()
 * - Navigation visibility logic via shouldShowNavigation()
 * - Pillar structure consumed by Sidebar and BottomTabs
 *
 * @see src/config/navigation.ts - Single source of truth for navigation
 */
export function NavLayout({ children }: NavLayoutProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use centralized navigation visibility logic from shared config
  const showNav = shouldShowNavigation(pathname);

  const pageTitle = getPageTitle(pathname);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  if (!showNav) {
    // No navigation for landing page or onboarding
    return <>{children}</>;
  }

  return (
    <>
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar */}
      {isMobile && <Sidebar isMobile isOpen={mobileMenuOpen} onClose={handleMenuClose} />}

      {/* Top Bar */}
      <TopBar title={pageTitle} showMenu={isMobile} onMenuClick={handleMenuToggle} />

      {/* Main Content Area */}
      <main
        id="main-content"
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
