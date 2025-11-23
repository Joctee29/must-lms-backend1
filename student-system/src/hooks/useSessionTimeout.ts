import { useEffect, useRef, useCallback } from 'react';

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  onTimeout: () => void;
}

/**
 * Custom hook for session timeout with page visibility detection
 * Logs out user after specified inactivity when:
 * 1. Page is hidden (tab switched, minimized, etc.)
 * 2. Window loses focus (user looking at another app)
 * 
 * DOES NOT timeout while user is actively using the app
 */
export const useSessionTimeout = ({ timeoutMinutes = 10, onTimeout }: UseSessionTimeoutProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPageVisibleRef = useRef(true);
  const isWindowFocusedRef = useRef(true);
  const inactivityStartTimeRef = useRef<number | null>(null);

  const resetTimeout = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set timeout if page is hidden OR window is not focused
    if (!isPageVisibleRef.current || !isWindowFocusedRef.current) {
      inactivityStartTimeRef.current = Date.now();
      
      // Set timeout for specified minutes
      timeoutRef.current = setTimeout(() => {
        console.log(`Session timeout: User inactive for ${timeoutMinutes} minutes outside app`);
        onTimeout();
      }, timeoutMinutes * 60 * 1000);
    } else {
      // User is in active app - clear the inactivity timer
      inactivityStartTimeRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [timeoutMinutes, onTimeout]);

  useEffect(() => {
    // Track page visibility (tab switched, minimized, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📄 Page is hidden - starting inactivity timer');
        isPageVisibleRef.current = false;
        resetTimeout();
      } else {
        console.log('📄 Page is visible - clearing inactivity timer');
        isPageVisibleRef.current = true;
        resetTimeout();
      }
    };

    // Track window focus (user switched to another app)
    const handleWindowBlur = () => {
      console.log('❌ Window lost focus - starting inactivity timer');
      isWindowFocusedRef.current = false;
      resetTimeout();
    };

    const handleWindowFocus = () => {
      console.log('✅ Window regained focus - clearing inactivity timer');
      isWindowFocusedRef.current = true;
      resetTimeout();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimeout]);

  return {
    isInactive: () => {
      return !isPageVisibleRef.current || !isWindowFocusedRef.current;
    },
    getInactivityTime: () => {
      return inactivityStartTimeRef.current ? Date.now() - inactivityStartTimeRef.current : 0;
    }
  };
};
