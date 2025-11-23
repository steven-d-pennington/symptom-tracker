"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

export type PassphraseStrength = "weak" | "medium" | "strong";

export interface PassphraseStrengthResult {
  strength: PassphraseStrength;
  score: number; // 0-100
  feedback: string;
}

/**
 * Calculate passphrase strength based on length and character diversity
 *
 * Scoring criteria:
 * - Length: Base score (12-15 = weak, 16-19 = medium, 20+ = strong)
 * - Character diversity: Bonus points for uppercase, lowercase, numbers, symbols
 * - Penalty for common patterns (repeated chars, sequential chars)
 *
 * @param passphrase User's passphrase
 * @returns Strength result with score and feedback
 */
export function calculatePassphraseStrength(passphrase: string): PassphraseStrengthResult {
  if (!passphrase || passphrase.length === 0) {
    return {
      strength: "weak",
      score: 0,
      feedback: "Enter a passphrase to see strength",
    };
  }

  if (passphrase.length < 12) {
    return {
      strength: "weak",
      score: 0,
      feedback: "Passphrase must be at least 12 characters",
    };
  }

  let score = 0;
  const length = passphrase.length;

  // Base score from length (0-50 points)
  if (length >= 20) {
    score += 50; // Strong base
  } else if (length >= 16) {
    score += 35; // Medium base
  } else {
    score += 20; // Weak base
  }

  // Character diversity (up to 50 points)
  const hasLowercase = /[a-z]/.test(passphrase);
  const hasUppercase = /[A-Z]/.test(passphrase);
  const hasNumbers = /\d/.test(passphrase);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passphrase);

  const diversityCount = [hasLowercase, hasUppercase, hasNumbers, hasSymbols].filter(Boolean).length;
  score += diversityCount * 12.5; // 12.5 points per type (max 50)

  // Penalties for common patterns
  // Repeated characters (e.g., "aaa", "111")
  if (/(.)\1{2,}/.test(passphrase)) {
    score -= 10;
  }

  // Sequential characters (e.g., "abc", "123")
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(passphrase)) {
    score -= 10;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine strength category
  let strength: PassphraseStrength;
  let feedback: string;

  if (score >= 70) {
    strength = "strong";
    feedback = "Strong passphrase!";
  } else if (score >= 40) {
    strength = "medium";
    feedback = "Consider adding more characters for maximum security";
  } else {
    strength = "weak";
    feedback = "Add numbers, symbols, and uppercase letters for a stronger passphrase";
  }

  return { strength, score, feedback };
}

export interface PassphraseStrengthIndicatorProps {
  passphrase: string;
  className?: string;
}

/**
 * Visual indicator component for passphrase strength
 *
 * Displays:
 * - Colored progress bar (red/yellow/green)
 * - Text label (Weak/Medium/Strong)
 * - Feedback message with recommendations
 *
 * Updates in real-time as user types (debounced for performance)
 */
export function PassphraseStrengthIndicator({
  passphrase,
  className,
}: PassphraseStrengthIndicatorProps) {
  const result = useMemo(() => calculatePassphraseStrength(passphrase), [passphrase]);

  if (passphrase.length === 0) {
    return null;
  }

  const colors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  const textColors = {
    weak: "text-red-600",
    medium: "text-yellow-600",
    strong: "text-green-600",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            colors[result.strength]
          )}
          style={{ width: `${result.score}%` }}
          role="progressbar"
          aria-valuenow={result.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Passphrase strength"
        />
      </div>

      {/* Label and Feedback */}
      <div className="flex items-center justify-between text-sm">
        <span className={cn("font-semibold capitalize", textColors[result.strength])}>
          {result.strength}
        </span>
        <span className="text-muted-foreground">{result.feedback}</span>
      </div>
    </div>
  );
}
