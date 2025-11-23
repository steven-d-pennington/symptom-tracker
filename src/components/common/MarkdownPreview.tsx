"use client";

import React from 'react';
import { markdownToHTML } from '@/lib/utils/simpleMarkdown';

interface MarkdownPreviewProps {
  text: string;
  className?: string;
}

/**
 * Simple Markdown Preview Component
 * Renders markdown with basic formatting (bold, lists)
 * Sanitizes output to prevent XSS attacks
 */
export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ text, className = '' }) => {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const html = markdownToHTML(text);

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownPreview;
