"use client";

import React from "react";

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  /**
   * If true, the content will be visible when focused (useful for skip links)
   */
  focusable?: boolean;
  /**
   * Element tag to render (default: span)
   */
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Screen reader only component
 * Content is hidden visually but announced to screen readers
 *
 * @example
 * ```tsx
 * <ScreenReaderOnly>This text is only for screen readers</ScreenReaderOnly>
 * <ScreenReaderOnly focusable>Skip to main content</ScreenReaderOnly>
 * ```
 */
export function ScreenReaderOnly({
  children,
  focusable = false,
  as: Component = "span",
}: ScreenReaderOnlyProps) {
  const className = focusable ? "sr-only focus:not-sr-only" : "sr-only";

  return <Component className={className}>{children}</Component>;
}
