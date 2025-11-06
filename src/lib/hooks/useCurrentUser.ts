import { useState, useEffect } from 'react';
import { db } from '../db/client';
import type { UserRecord } from '../db/schema';

const CURRENT_USER_ID_KEY = "pocket:currentUserId";

// Hook for current user functionality
// Reads the user ID from localStorage that was set during onboarding
// Also fetches the full user record including name
export const useCurrentUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const storedUserId = window.localStorage.getItem(CURRENT_USER_ID_KEY);
        const finalUserId = storedUserId || 'default-user-id';

        setUserId(finalUserId);

        // Fetch the user record to get the name
        try {
          const user: UserRecord | undefined = await db.users.get(finalUserId);
          if (user?.name) {
            setUserName(user.name);
          }
        } catch (dbError) {
          console.error('[useCurrentUser] Failed to fetch user from database', dbError);
          // Don't fail the hook if DB fetch fails, just proceed without name
        }
      } catch (error) {
        console.error('[useCurrentUser] Failed to read user ID from localStorage', error);
        setUserId('default-user-id'); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    userId: userId || 'default-user-id',
    userName,
    isLoading,
    error: null,
  };
};
