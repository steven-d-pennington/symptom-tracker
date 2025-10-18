import { useState, useEffect } from 'react';

const CURRENT_USER_ID_KEY = "pocket:currentUserId";

// Hook for current user functionality
// Reads the user ID from localStorage that was set during onboarding
export const useCurrentUser = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    try {
      const storedUserId = window.localStorage.getItem(CURRENT_USER_ID_KEY);
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // Fallback to default-user-id for development/testing
        // This allows the app to work even without going through onboarding
        setUserId('default-user-id');
      }
    } catch (error) {
      console.error('[useCurrentUser] Failed to read user ID from localStorage', error);
      setUserId('default-user-id'); // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    userId: userId || 'default-user-id',
    isLoading,
    error: null,
  };
};
