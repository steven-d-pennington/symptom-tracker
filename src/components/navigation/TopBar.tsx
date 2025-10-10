"use client";

import { ArrowLeft, Menu, Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { UserProfileIndicator } from "./UserProfileIndicator";

interface TopBarProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
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

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-card border-b border-border md:left-64">
      <div className="flex h-full items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showMenu && (
            <button
              onClick={onMenuClick}
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

          {/* Custom Actions */}
          {actions}
        </div>
      </div>
    </header>
  );
}
