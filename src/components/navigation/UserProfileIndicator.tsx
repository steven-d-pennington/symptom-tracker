"use client";

import { User, Copy, Check } from "lucide-react";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useEffect, useState } from "react";
import { userRepository } from "@/lib/repositories/userRepository";
import type { UserRecord } from "@/lib/db/schema";

export function UserProfileIndicator() {
  const { userId, isLoading } = useCurrentUser();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId || isLoading) return;

    const loadUser = async () => {
      try {
        const userData = await userRepository.getById(userId);
        setUser(userData || null);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };

    loadUser();
  }, [userId, isLoading]);

  const handleCopyUserId = async () => {
    if (!userId) return;
    
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy user ID:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded-md animate-pulse">
        <div className="w-4 h-4 bg-muted-foreground/20 rounded-full" />
        <div className="hidden sm:block w-20 h-3 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  const displayName = user?.name || "User";
  const shortUserId = userId.substring(0, 8);

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="flex items-center gap-2 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors text-sm"
        title={`Current user: ${displayName}`}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">{displayName}</span>
        <span className="hidden md:inline text-xs text-primary/70 font-mono">
          ({shortUserId}...)
        </span>
      </button>

      {/* Tooltip/Popover */}
      {showTooltip && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTooltip(false)}
          />
          
          {/* Popover */}
          <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-card border border-border rounded-lg shadow-lg p-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Current Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your data is stored locally in this browser profile
                </p>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm font-medium text-foreground">
                    {user?.name || "Not set"}
                  </p>
                </div>

                {user?.email && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm text-foreground">{user.email}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    User ID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs font-mono bg-muted px-2 py-1 rounded border border-border overflow-hidden text-ellipsis">
                      {userId}
                    </code>
                    <button
                      onClick={handleCopyUserId}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                      title="Copy user ID"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Tip:</strong> To transfer your data to another browser or profile, use the Export feature in Settings.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
