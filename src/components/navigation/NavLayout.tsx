"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TopBar } from "./TopBar";
import { BottomTabs } from "./BottomTabs";
import { Sidebar } from "./Sidebar";
import { getPageTitle } from "@/config/navigation";

interface NavLayoutProps {
  children: React.ReactNode;
}

// Routes that should NOT show navigation (landing page, onboarding, etc.)
const NO_NAV_ROUTES = ["/", "/onboarding"];

export function NavLayout({ children }: NavLayoutProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if current route should show navigation
  const showNav =
    !NO_NAV_ROUTES.includes(pathname) && !pathname.startsWith("/onboarding");

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
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile Sidebar */}
      {isMobile && <Sidebar isMobile isOpen={mobileMenuOpen} onClose={handleMenuClose} />}

      {/* Top Bar */}
      <TopBar title={pageTitle} showMenu={isMobile} onMenuClick={handleMenuToggle} />

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
