/**
 * Timeline Export Service
 * Story 6.5: Task 8 - Export timeline with pattern annotations
 *
 * Provides functionality to export timeline view as image and generate pattern summary PDF.
 */

// Note: These dependencies need to be installed:
// npm install html2canvas jspdf
// @types/html2canvas and @types/jspdf may also be needed for TypeScript

import type { DetectedPattern } from './patternDetectionService';
import type { TimelineEvent } from '@/components/timeline/TimelineView';

/**
 * Export timeline as image
 * 
 * @param timelineElementId - ID of the timeline container element to capture
 * @param includeLegend - Whether to include pattern legend in export
 * @returns Promise resolving to image blob
 */
export async function exportTimelineAsImage(
  timelineElementId: string = 'timeline-container',
  includeLegend: boolean = true
): Promise<Blob> {
  // Dynamic import to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;
  
  const timelineElement = document.getElementById(timelineElementId);
  if (!timelineElement) {
    throw new Error(`Timeline element with id "${timelineElementId}" not found`);
  }

  // Capture the timeline element
  const canvas = await html2canvas(timelineElement, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher quality
    logging: false,
    useCORS: true,
  });

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Download timeline image
 * 
 * @param timelineElementId - ID of the timeline container element
 * @param filename - Optional filename (default: timeline-export-YYYY-MM-DD.png)
 */
export async function downloadTimelineImage(
  timelineElementId: string = 'timeline-container',
  filename?: string
): Promise<void> {
  try {
    const blob = await exportTimelineAsImage(timelineElementId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `timeline-export-${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export timeline image:', error);
    throw error;
  }
}

/**
 * Export pattern summary as PDF
 * 
 * @param patterns - Array of detected patterns to include in PDF
 * @param filename - Optional filename (default: pattern-summary-YYYY-MM-DD.pdf)
 */
export async function exportPatternSummaryPDF(
  patterns: DetectedPattern[],
  filename?: string
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Cover page
  doc.setFontSize(20);
  doc.text('Pattern Summary Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary statistics
  doc.setFontSize(14);
  doc.text('Summary Statistics', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  const totalPatterns = patterns.length;
  const byType = patterns.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  doc.text(`Total Patterns Detected: ${totalPatterns}`, margin, yPosition);
  yPosition += 7;

  Object.entries(byType).forEach(([type, count]) => {
    doc.text(`  ${type}: ${count}`, margin + 5, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Medical disclaimer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('⚠️ Patterns show correlations, not causation.', margin, yPosition);
  yPosition += 6;
  doc.text('This report is for informational purposes only and should not replace medical advice.', margin, yPosition);
  yPosition += 15;
  doc.setTextColor(0, 0, 0);

  // Pattern details (one per page)
  patterns.forEach((pattern, index) => {
    if (index > 0) {
      doc.addPage();
      yPosition = margin;
    }

    checkPageBreak(80);

    // Pattern header
    doc.setFontSize(16);
    doc.text(`Pattern ${index + 1}: ${pattern.type}`, margin, yPosition);
    yPosition += 10;

    // Pattern description
    doc.setFontSize(12);
    doc.text(pattern.description, margin, yPosition);
    yPosition += 10;

    // Statistics
    doc.setFontSize(10);
    doc.text(`Occurrence Frequency: ${pattern.frequency} instance${pattern.frequency > 1 ? 's' : ''}`, margin, yPosition);
    yPosition += 7;

    doc.text(`Correlation Coefficient (ρ): ${pattern.coefficient.toFixed(3)}`, margin, yPosition);
    yPosition += 7;

    doc.text(`Confidence: ${pattern.confidence}`, margin, yPosition);
    yPosition += 7;

    doc.text(`Lag Hours: ${pattern.lagHours}h`, margin, yPosition);
    yPosition += 10;

    // Occurrences list
    doc.setFontSize(11);
    doc.text('Occurrences:', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    pattern.occurrences.slice(0, 10).forEach((occurrence, occIndex) => {
      checkPageBreak(7);
      const event1Date = new Date(occurrence.event1.timestamp).toLocaleString();
      const event2Date = new Date(occurrence.event2.timestamp).toLocaleString();
      doc.text(`${occIndex + 1}. ${event1Date} → ${event2Date}`, margin + 5, yPosition);
      yPosition += 6;
    });

    if (pattern.occurrences.length > 10) {
      doc.text(`... and ${pattern.occurrences.length - 10} more occurrences`, margin + 5, yPosition);
      yPosition += 6;
    }

    yPosition += 10;

    // Medical disclaimer on each page
    checkPageBreak(10);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('⚠️ Patterns show correlations, not causation.', margin, yPosition);
    doc.setTextColor(0, 0, 0);
  });

  // Save PDF
  doc.save(filename || `pattern-summary-${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Export timeline with pattern annotations
 * Combines image export and PDF export
 * 
 * @param timelineElementId - ID of the timeline container element
 * @param patterns - Array of detected patterns
 */
export async function exportTimelineWithPatterns(
  timelineElementId: string = 'timeline-container',
  patterns: DetectedPattern[]
): Promise<void> {
  try {
    // Export image
    await downloadTimelineImage(timelineElementId);
    
    // Export PDF
    await exportPatternSummaryPDF(patterns);
  } catch (error) {
    console.error('Failed to export timeline with patterns:', error);
    throw error;
  }
}

