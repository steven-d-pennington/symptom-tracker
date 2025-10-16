/**
 * Accessibility Utilities
 *
 * Utilities for screen reader announcements, keyboard navigation,
 * and other accessibility features.
 */

/**
 * Announce a message to screen readers using aria-live regions
 * Creates a temporary element that screen readers will announce
 *
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive'
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  // Create a live region element
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only'; // Visually hidden but accessible to screen readers
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';

  // Add to document
  document.body.appendChild(liveRegion);

  // Set message (triggers announcement)
  // Small delay ensures screen readers detect the change
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 100);

  // Remove after announcement (3 seconds)
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 3000);
}

/**
 * React hook for screen reader announcements
 * Returns a function that can be called to announce messages
 */
export function useScreenReaderAnnouncement() {
  return (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority);
  };
}

/**
 * Handle keyboard navigation for modal dialogs
 * Traps focus within the modal and handles Escape key
 *
 * @param event - The keyboard event
 * @param onEscape - Callback when Escape is pressed
 * @param containerRef - Ref to the modal container
 */
export function handleModalKeyboard(
  event: React.KeyboardEvent,
  onEscape: () => void,
  containerRef?: React.RefObject<HTMLElement | null>
): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    onEscape();
    return;
  }

  // Tab trap logic
  if (event.key === 'Tab' && containerRef?.current) {
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // If shift+tab on first element, focus last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    }
    // If tab on last element, focus first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

/**
 * Get ARIA attributes for a range slider
 *
 * @param value - Current value
 * @param min - Minimum value
 * @param max - Maximum value
 * @param label - Descriptive label
 */
export function getSliderAriaAttributes(
  value: number,
  min: number,
  max: number,
  label: string
) {
  return {
    'aria-label': label,
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuetext': `${value} out of ${max}`,
    'role': 'slider',
  };
}

/**
 * Focus the first focusable element in a container
 * Useful for focus management when modals open
 *
 * @param containerRef - Ref to the container element
 */
export function focusFirstElement(containerRef: React.RefObject<HTMLElement | null>): void {
  if (!containerRef.current) return;

  const focusableElements = containerRef.current.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;

  // Small delay to ensure modal is fully rendered
  setTimeout(() => {
    firstElement?.focus();
  }, 100);
}

/**
 * Check if color contrast meets WCAG AA standards
 *
 * @param foreground - Foreground color (hex or rgb)
 * @param background - Background color (hex or rgb)
 * @returns Whether contrast ratio meets WCAG AA (4.5:1 for text, 3:1 for UI)
 */
export function meetsContrastRequirements(
  foreground: string,
  background: string,
  isText: boolean = true
): { passes: boolean; ratio: number } {
  // This is a simplified version
  // In production, use a library like 'color-contrast-checker'
  const requiredRatio = isText ? 4.5 : 3.0;

  // Placeholder implementation
  // TODO: Implement actual color contrast calculation
  return {
    passes: true,
    ratio: requiredRatio,
  };
}
