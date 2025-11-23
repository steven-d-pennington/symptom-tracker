/**
 * FoodCombinationCard Component
 * Displays a detected food combination with synergy analysis
 * Shows combination correlation vs individual food correlations
 * Story 2.4: Now uses ConfidenceBadge component with consistency metrics
 */

import type { FoodCombination } from "@/lib/services/food/CombinationAnalysisService";
import { ConfidenceBadge } from "@/components/correlation/ConfidenceBadge";

export interface FoodCombinationCardProps {
  combination: FoodCombination;
  onSelect?: (combination: FoodCombination) => void;
}

function FoodCombinationCard({ combination, onSelect }: FoodCombinationCardProps) {
  const {
    foodNames,
    symptomName,
    combinationCorrelation,
    individualMax,
    synergistic,
    confidence,
    consistency,
    sampleSize,
    pValue,
  } = combination;

  // Calculate synergy delta percentage
  const synergyDelta = ((combinationCorrelation - individualMax) * 100).toFixed(1);
  const synergyDeltaNumber = parseFloat(synergyDelta);

  // Format correlation percentages
  const combinationPct = (combinationCorrelation * 100).toFixed(1);
  const individualMaxPct = (individualMax * 100).toFixed(1);

  return (
    <div
      className={`border rounded-lg p-4 transition-shadow hover:shadow-md ${
        onSelect ? "cursor-pointer" : ""
      } ${synergistic ? "border-l-4 border-l-red-500" : ""}`}
      onClick={() => onSelect?.(combination)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(combination);
        }
      }}
      aria-label={`Food combination: ${foodNames.join(" + ")} with ${symptomName}, ${combinationPct}% correlation`}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold">{foodNames.join(" + ")}</h3>
          {synergistic && (
            <span
              className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 whitespace-nowrap"
              aria-label="Synergistic effect detected"
            >
              ⚡ Synergistic
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Associated with: <span className="font-medium">{symptomName}</span>
        </p>
      </div>

      <div className="space-y-4">
        {/* Correlation comparison */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              Combination correlation:
            </span>
            <span className="text-2xl font-bold">{combinationPct}%</span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">
              Best individual food:
            </span>
            <span className="text-lg font-semibold text-muted-foreground">
              {individualMaxPct}%
            </span>
          </div>

          {/* Synergy visualization */}
          {synergistic && (
            <div
              className="mt-2 rounded-md bg-red-50 p-3 border border-red-200"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-red-800">
                ⬆️ {synergyDelta}% stronger together
              </p>
              <p className="text-xs text-red-600 mt-1">
                This combination triggers symptoms more than individual foods
                (threshold: 15%)
              </p>
            </div>
          )}

          {!synergistic && synergyDeltaNumber > 0 && (
            <div className="mt-2 rounded-md bg-gray-50 p-2 border border-gray-200">
              <p className="text-xs text-gray-600">
                +{synergyDelta}% effect (below 15% synergy threshold)
              </p>
            </div>
          )}
        </div>

        {/* Statistical details */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
          <span
            aria-label={`Confidence level: ${confidence}`}
            className={
              confidence === "high"
                ? "bg-green-100 text-green-800"
                : confidence === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-orange-100 text-orange-800"
            }
          >
            <span className="sr-only">
              {`${confidence.charAt(0).toUpperCase()}${confidence.slice(1)} confidence`}
            </span>
            <ConfidenceBadge
              confidence={confidence}
              sampleSize={sampleSize}
              consistency={consistency}
              pValue={pValue}
            />
          </span>

          <span
            className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
            aria-label={`Sample size: ${sampleSize} instances`}
          >
            n={sampleSize}
          </span>

          {pValue < 0.05 && (
            <span
              className="px-2 py-1 text-xs font-medium rounded border bg-blue-50 text-blue-800 border-blue-300"
              aria-label={`Statistically significant, p-value: ${pValue.toFixed(3)}`}
            >
              p={pValue.toFixed(3)} *
            </span>
          )}

          {pValue >= 0.05 && (
            <span
              className="text-xs text-gray-500"
              aria-label={`p-value: ${pValue.toFixed(2)}`}
            >
              p={pValue.toFixed(2)}
            </span>
          )}
        </div>

        {/* Accessibility note for screen readers */}
        <div className="sr-only">
          This food combination shows a {combinationPct}% correlation with {symptomName},
          compared to {individualMaxPct}% for the strongest individual food.
          {synergistic && ` The combination is ${synergyDelta}% more likely to trigger symptoms than individual foods, indicating a synergistic effect.`}
          Sample size: {sampleSize} instances. Confidence level: {confidence}.
          {pValue < 0.05 && " Statistically significant result."}
        </div>
      </div>
    </div>
  );
}

export default FoodCombinationCard;
