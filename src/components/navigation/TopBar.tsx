"use client";

import { ArrowLeft, Menu, Wifi, WifiOff, Download, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { UserProfileIndicator } from "./UserProfileIndicator";
import { useUxInstrumentation } from "@/lib/hooks/useUxInstrumentation";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";
import { useTheme } from "@/components/providers/ThemeProvider";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}

function InstallButton() {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <button
      onClick={promptInstall}
      className="flex items-center gap-1.5 px-2 py-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
      title="Install App"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline text-xs font-medium">Install</span>
    </button>
  );
}

/**
 * TopBar component - Displays page title and navigation controls
 *
 * Receives page title from NavLayout component, which derives it from shared
 * navigation configuration via getPageTitle() function.
 *
 * @see src/config/navigation.ts - Single source of truth for page titles
 * @see src/components/navigation/NavLayout.tsx - Parent component that passes title
 */
interface TopBarProps {
  /** Page title from shared navigation config via NavLayout */
  title: string;
  /** Whether to show back button */
  showBack?: boolean;
  /** Whether to show mobile menu button */
  showMenu?: boolean;
  /** Callback for menu button click */
  onMenuClick?: () => void;
  /** Additional action buttons */
  actions?: React.ReactNode;
}

export function TopBar({
  title,
  showBack = false,
  showMenu = false,
  onMenuClick,
  actions,
}: TopBarProps) {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const { recordUxEvent } = useUxInstrumentation();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleBack = useCallback(() => {
    void recordUxEvent("navigation.back", {
      metadata: { surface: "topBar" },
    });
    router.back();
  }, [recordUxEvent, router]);

  const handleMenuClick = useCallback(() => {
    void recordUxEvent("navigation.menu.toggle", {
      metadata: { surface: "topBar" },
    });
    onMenuClick?.();
  }, [onMenuClick, recordUxEvent]);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border md:left-64">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showMenu && (
            <button
              onClick={handleMenuClick}
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* User Profile Indicator */}
          <UserProfileIndicator />

          {/* Offline Indicator */}
          {!isOnline && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 bg-orange-500/10 text-orange-700 rounded-md text-xs font-medium"
              role="status"
              aria-live="polite"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
            </div>
          )}

          {/* Sync Status - Online */}
          {isOnline && (
            <div className="flex items-center gap-1.5 text-green-600" title="Online">
              <Wifi className="w-4 h-4" />
            </div>
          )}

          {/* Install App Button */}
          <InstallButton />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Custom Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
