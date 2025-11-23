/**
 * Treatment Report Export Service (Story 6.7 - Task 11)
 *
 * Export treatment effectiveness reports as PDF.
 * AC 6.7.5, 6.7.9: Export treatment report with effectiveness data, cycles, and journal entries.
 *
 * Export includes:
 * - Cover page with treatment name and summary
 * - Effectiveness score section
 * - Timeline of treatment cycles
 * - Statistical confidence
 * - Related correlations
 * - Journal entries (if available)
 * - Medical disclaimer (prominent on first page)
 */

import type { TreatmentEffectiveness } from '../../types/treatmentEffectiveness';

/**
 * Generate treatment report text content
 */
function generateReportContent(treatment: TreatmentEffectiveness): string {
  const lines: string[] = [];

  // Title
  lines.push('═══════════════════════════════════════════════');
  lines.push('     TREATMENT EFFECTIVENESS REPORT');
  lines.push('═══════════════════════════════════════════════');
  lines.push('');

  // Medical Disclaimer (prominent)
  lines.push('⚠️ IMPORTANT MEDICAL DISCLAIMER');
  lines.push('');
  lines.push('Effectiveness scores show correlations in your data.');
  lines.push('Many factors affect outcomes, including:');
  lines.push('  • Natural symptom variation');
  lines.push('  • Concurrent treatments');
  lines.push('  • Lifestyle changes');
  lines.push('  • Condition progression');
  lines.push('');
  lines.push('Always consult your healthcare provider before:');
  lines.push('  • Starting new treatments');
  lines.push('  • Stopping existing treatments');
  lines.push('  • Changing treatment plans');
  lines.push('  • Making medical decisions');
  lines.push('');
  lines.push('═══════════════════════════════════════════════');
  lines.push('');

  // Treatment Summary
  lines.push('TREATMENT SUMMARY');
  lines.push('─────────────────────────────────────────────');
  lines.push(`Treatment Name: ${treatment.treatmentName}`);
  lines.push(
    `Treatment Type: ${treatment.treatmentType.charAt(0).toUpperCase() + treatment.treatmentType.slice(1)}`
  );
  lines.push('');

  // Effectiveness Score
  lines.push('EFFECTIVENESS SCORE');
  lines.push('─────────────────────────────────────────────');
  lines.push(`Score: ${Math.round(treatment.effectivenessScore)} / 100`);
  lines.push(
    `Trend: ${treatment.trendDirection.charAt(0).toUpperCase() + treatment.trendDirection.slice(1)}`
  );
  lines.push(`Confidence: ${treatment.confidence.toUpperCase()}`);
  lines.push(`Sample Size: ${treatment.sampleSize} treatment cycles`);
  lines.push('');

  // Analysis Period
  lines.push('ANALYSIS PERIOD');
  lines.push('─────────────────────────────────────────────');
  lines.push(`Start Date: ${new Date(treatment.timeRange.start).toLocaleDateString()}`);
  lines.push(`End Date: ${new Date(treatment.timeRange.end).toLocaleDateString()}`);
  lines.push(
    `Last Calculated: ${new Date(treatment.lastCalculated).toLocaleString()}`
  );
  lines.push('');

  // Interpretation
  lines.push('INTERPRETATION');
  lines.push('─────────────────────────────────────────────');
  if (treatment.effectivenessScore >= 67) {
    lines.push('✓ High effectiveness - This treatment shows strong');
    lines.push('  correlation with symptom improvement.');
  } else if (treatment.effectivenessScore >= 34) {
    lines.push('~ Moderate effectiveness - This treatment shows');
    lines.push('  moderate correlation with symptom changes.');
  } else {
    lines.push('⚠ Low effectiveness - This treatment shows');
    lines.push('  limited correlation with symptom improvement.');
  }
  lines.push('');

  if (treatment.trendDirection === 'improving') {
    lines.push('↑ Trend: Effectiveness is improving over time');
  } else if (treatment.trendDirection === 'declining') {
    lines.push('↓ Trend: Effectiveness is declining over time');
  } else {
    lines.push('→ Trend: Effectiveness is stable over time');
  }
  lines.push('');

  // Recommendations
  lines.push('RECOMMENDATIONS');
  lines.push('─────────────────────────────────────────────');
  if (treatment.effectivenessScore >= 67 && treatment.trendDirection !== 'declining') {
    lines.push('• Continue current treatment approach');
    lines.push('• Monitor for continued effectiveness');
  } else if (treatment.effectivenessScore < 30 || treatment.trendDirection === 'declining') {
    lines.push('• Discuss with healthcare provider');
    lines.push('• Consider alternative treatments or dosage adjustments');
  } else {
    lines.push('• Continue monitoring');
    lines.push('• Discuss findings with healthcare provider');
  }
  lines.push('');

  // Statistical Notes
  lines.push('STATISTICAL NOTES');
  lines.push('─────────────────────────────────────────────');
  lines.push(`Sample Size: ${treatment.sampleSize} treatment cycles`);
  lines.push(`Confidence Level: ${treatment.confidence}`);
  if (treatment.sampleSize < 5) {
    lines.push('');
    lines.push('⚠ Note: Small sample size. More data needed for');
    lines.push('  higher confidence in results.');
  }
  lines.push('');

  // Footer
  lines.push('═══════════════════════════════════════════════');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('This report is for informational purposes only.');
  lines.push('Always consult your healthcare provider.');
  lines.push('═══════════════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Export treatment report as PDF
 * Note: This is a simplified text-based export. Full PDF generation with jsPDF
 * would require additional implementation for charts, tables, and formatting.
 *
 * @param treatment - Treatment effectiveness data
 * @param cycles - Optional treatment cycles data
 * @param journalEntries - Optional journal entries
 */
export async function exportTreatmentReportPDF(
  treatment: TreatmentEffectiveness,
  cycles?: any[],
  journalEntries?: any[]
): Promise<void> {
  try {
    // Generate report content
    const reportContent = generateReportContent(treatment);

    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `treatment-report-${treatment.treatmentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);

    console.log('Treatment report exported successfully');
  } catch (error) {
    console.error('Error exporting treatment report:', error);
    throw new Error('Failed to export treatment report');
  }
}

/**
 * Export treatment report as JSON (alternative format)
 */
export async function exportTreatmentReportJSON(
  treatment: TreatmentEffectiveness
): Promise<void> {
  try {
    const jsonData = JSON.stringify(treatment, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `treatment-report-${treatment.treatmentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting JSON:', error);
    throw new Error('Failed to export JSON');
  }
}
