/**
 * ARIA Live Region Announcement Utility (Story 3.7.6)
 *
 * Provides centralized screen reader announcements for state changes.
 * AC 3.7.6.8: Screen reader announcements for significant state changes
 */

export type AnnouncementPriority = 'polite' | 'assertive';

let liveRegionElement: HTMLElement | null = null;

/**
 * Initialize the ARIA live region element
 * Should be called once during app initialization
 */
export function initializeAriaLiveRegion(): void {
  if (typeof window === 'undefined') {
    return; // SSR safety
  }

  // Check if already exists
  if (document.getElementById('aria-live-region')) {
    liveRegionElement = document.getElementById('aria-live-region');
    return;
  }

  // Create the live region element
  const liveRegion = document.createElement('div');
  liveRegion.id = 'aria-live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.setAttribute('role', 'status');
  liveRegion.className = 'sr-only'; // Screen reader only (visually hidden)
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';

  document.body.appendChild(liveRegion);
  liveRegionElement = liveRegion;
}

/**
 * Announce a message to screen readers
 *
 * @param message - The message to announce
 * @param priority - 'polite' (default) waits for user to finish, 'assertive' interrupts
 *
 * @example
 * announce('Region detail view opened');
 * announce('Marker position confirmed');
 * announce('Full-screen mode activated', 'assertive');
 */
export function announce(
  message: string,
  priority: AnnouncementPriority = 'polite'
): void {
  if (typeof window === 'undefined') {
    return; // SSR safety
  }

  // Ensure live region exists
  if (!liveRegionElement) {
    initializeAriaLiveRegion();
  }

  if (!liveRegionElement) {
    console.warn('ARIA live region not available');
    return;
  }

  // Update priority
  liveRegionElement.setAttribute('aria-live', priority);

  // Clear and set new message (ensures screen reader picks up change)
  liveRegionElement.textContent = '';

  // Use setTimeout to ensure screen reader detects the change
  setTimeout(() => {
    if (liveRegionElement) {
      liveRegionElement.textContent = message;
    }
  }, 100);
}

/**
 * Clear the current announcement
 */
export function clearAnnouncement(): void {
  if (liveRegionElement) {
    liveRegionElement.textContent = '';
  }
}

// Auto-initialize on import (browser only)
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAriaLiveRegion);
  } else {
    initializeAriaLiveRegion();
  }
}
