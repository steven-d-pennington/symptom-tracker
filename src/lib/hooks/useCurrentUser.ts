"use client";

import { useEffect, useState } from "react";
import { userRepository } from "@/lib/repositories/userRepository";
import { UserRecord } from "@/lib/db/schema";

const CURRENT_USER_ID_KEY = "pocket:currentUserId";

/**
 * Hook to get the current user from IndexedDB
 * Returns the userId and user record, or null if not logged in/onboarded
 *
 * Storage pattern:
 * - localStorage: stores only userId (string) for quick access
 * - IndexedDB: stores full UserRecord (name, email, preferences, etc.)
 */
export const useCurrentUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Get userId from localStorage (set during onboarding)
        const storedUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
        if (!storedUserId) {
          setIsLoading(false);
          return;
        }

        setUserId(storedUserId);

        // Load full user record from IndexedDB (single source of truth)
        const userRecord = await userRepository.getById(storedUserId);
        setUser(userRecord);

        if (!userRecord) {
          console.warn("[useCurrentUser] User ID found in localStorage but not in IndexedDB:", storedUserId);
        }
      } catch (error) {
        console.error("[useCurrentUser] Failed to load user", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    userId,
    user,
    isLoading,
    isAuthenticated: !!userId && !!user,
  };
};
