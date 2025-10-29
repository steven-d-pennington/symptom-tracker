/**
 * Chart Export Utility (Story 3.4 - Task 5)
 *
 * Provides utility functions for exporting Chart.js charts as images.
 * Used for downloading analytics charts for medical consultations.
 *
 * @see docs/stories/3-4-flare-trend-analysis-visualization.md#AC3.4.7
 */

import { RefObject } from 'react';

/**
 * Exports a Chart.js chart as a PNG image.
 * Downloads the image with the specified filename.
 *
 * Story 3.4 - Task 5: AC3.4.7
 * - Gets chart instance from ref.current
 * - Uses chart.toBase64Image() for PNG generation at high resolution
 * - Creates temporary anchor element to trigger download
 * - Handles errors gracefully with console.error
 *
 * @param chartRef - React ref pointing to Chart.js chart instance
 * @param filename - Filename for downloaded image (e.g., "flare-trends-2024-10-29.png")
 * @returns Promise that resolves when download initiated
 * @throws Error if chart ref is not available or export fails
 *
 * @example
 * const chartRef = useRef<any>(null);
 * // ... render chart with ref={chartRef}
 * await exportChartAsImage(chartRef, `flare-trends-${new Date().toISOString().split('T')[0]}.png`);
 */
export async function exportChartAsImage(
  chartRef: RefObject<any>,
  filename: string
): Promise<void> {
  try {
    // Task 5.3: Get chart instance from ref.current
    if (!chartRef.current) {
      throw new Error('Chart reference is not available');
    }

    // Task 5.4: Use chart.toBase64Image() method to generate PNG data URL at high resolution
    // Chart.js toBase64Image() returns a base64-encoded PNG image
    const base64Image = chartRef.current.toBase64Image('image/png', 1.0);

    // Task 5.5-5.6: Create temporary anchor element with download attribute
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = filename;

    // Task 5.7: Trigger click to initiate download
    document.body.appendChild(link);
    link.click();

    // Task 5.8: Clean up temporary element
    document.body.removeChild(link);
  } catch (err) {
    // Task 5.9: Handle errors gracefully with console.error
    console.error('Failed to export chart as image:', err);
    throw err;
  }
}
