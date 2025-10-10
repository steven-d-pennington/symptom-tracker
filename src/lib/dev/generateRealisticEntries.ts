import { DailyEntryRecord, DailyMedicationRecord, DailySymptomRecord, DailyTriggerRecord, MedicationRecord, SymptomRecord, TriggerRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const random = (min: number, max: number) =>
  Math.random() * (max - min) + min;

interface FlarePattern {
  startDay: number;
  duration: number; // days
  intensity: number; // 0-1
}

/**
 * Generate realistic flare patterns over the year
 * HS typically has 3-5 major flares per year with varying severity
 */
function generateFlarePatterns(totalDays: number): FlarePattern[] {
  const flares: FlarePattern[] = [];
  const numFlares = Math.floor(random(3, 6)); // 3-5 major flares

  for (let i = 0; i < numFlares; i++) {
    // Spread flares throughout the year
    const startDay = Math.floor((totalDays / numFlares) * i + random(0, totalDays / numFlares));
    const duration = Math.floor(random(7, 21)); // 1-3 week flares
    const intensity = random(0.6, 1.0); // Moderate to severe

    flares.push({ startDay, duration, intensity });
  }

  return flares;
}

/**
 * Check if a day is within a flare period
 */
function getFlareIntensity(dayIndex: number, flares: FlarePattern[]): number {
  for (const flare of flares) {
    if (dayIndex >= flare.startDay && dayIndex < flare.startDay + flare.duration) {
      // Intensity peaks in the middle of the flare
      const dayInFlare = dayIndex - flare.startDay;
      const midPoint = flare.duration / 2;
      const distanceFromPeak = Math.abs(dayInFlare - midPoint);
      const peakFactor = 1 - (distanceFromPeak / midPoint) * 0.3; // 70-100% of peak
      return flare.intensity * peakFactor;
    }
  }
  return 0; // No flare
}

interface BuildEntriesArgs {
  startDate: Date;
  endDate: Date;
  userId: string;
  symptoms: SymptomRecord[];
  medications: MedicationRecord[];
  triggers: TriggerRecord[];
}

export function buildDailyEntries({
  startDate,
  endDate,
  userId,
  symptoms,
  medications,
  triggers,
}: BuildEntriesArgs): DailyEntryRecord[] {
  const entries: DailyEntryRecord[] = [];
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Generate realistic flare patterns
  const flares = generateFlarePatterns(totalDays);
  console.log(`[Demo Data] Generated ${flares.length} flare patterns over ${totalDays} days`);

  for (let dayOffset = 0; dayOffset <= totalDays; dayOffset++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + dayOffset);
    if (current > endDate) break;

    const flareIntensity = getFlareIntensity(dayOffset, flares);
    const isFlaring = flareIntensity > 0.3;

    // Seasonal variation (worse in summer due to heat/humidity)
    const dayOfYear = dayOffset % 365;
    const seasonalFactor = Math.sin((2 * Math.PI * dayOfYear) / 365) * 0.3; // ±0.3

    // Menstrual cycle (28-day cycle for hormonal triggers)
    const cycleFactor = Math.sin((2 * Math.PI * dayOffset) / 28) * 0.2;

    // Overall health inversely correlated with flare intensity
    const overallHealth = clamp(
      7 - flareIntensity * 5 + seasonalFactor + random(-0.8, 0.8),
      1,
      10
    );

    // Energy level decreases during flares
    const energyLevel = clamp(
      6.5 - flareIntensity * 4 - seasonalFactor * 0.5 + random(-1, 1),
      1,
      10
    );

    // Sleep quality affected by pain during flares
    const sleepQuality = clamp(
      7 - flareIntensity * 3.5 + random(-1.5, 1.5),
      1,
      10
    );

    // Stress level increases with flares and contributes to them
    const stressLevel = clamp(
      4 + flareIntensity * 2.5 + cycleFactor * 2 + random(-1, 1),
      1,
      10
    );

    const symptomReadings = buildSymptomReadings({
      symptoms,
      flareIntensity,
      seasonalFactor,
      stressLevel,
    });

    const medicationLogs = buildMedicationLogs({
      medications,
      isFlaring,
    });

    const triggerLogs = buildTriggerLogs({
      triggers,
      flareIntensity,
      seasonalFactor,
      stressLevel,
      cycleFactor,
      dayOfWeek: current.getDay(),
    });

    const entryDate = current.toISOString().split("T")[0];
    const completionDate = new Date(current);
    completionDate.setHours(21, 0, 0, 0);

    const entry: DailyEntryRecord = {
      id: generateId(),
      userId,
      date: entryDate,
      overallHealth: Math.round(overallHealth),
      energyLevel: Math.round(energyLevel),
      sleepQuality: Math.round(sleepQuality),
      stressLevel: Math.round(stressLevel),
      symptoms: symptomReadings,
      medications: medicationLogs,
      triggers: triggerLogs,
      notes: isFlaring
        ? `Experiencing a flare. Severity: ${Math.round(flareIntensity * 10)}/10`
        : "Feeling relatively stable today",
      mood: overallHealth >= 7 ? "great" : overallHealth >= 5 ? "ok" : "low",
      duration: Math.round(clamp(isFlaring ? 45 + random(-15, 15) : 25 + random(-10, 10), 10, 120)),
      completedAt: completionDate,
      createdAt: completionDate,
      updatedAt: completionDate,
    };

    entries.push(entry);
  }

  return entries;
}

function buildSymptomReadings({
  symptoms,
  flareIntensity,
  seasonalFactor,
  stressLevel,
}: {
  symptoms: SymptomRecord[];
  flareIntensity: number;
  seasonalFactor: number;
  stressLevel: number;
}): DailySymptomRecord[] {
  return symptoms.map((symptom) => {
    let severity = 0;

    // Different symptoms have different patterns
    if (symptom.name === "Painful Nodules") {
      // Most directly correlated with flares
      severity = flareIntensity * 8 + random(0, 2);
    } else if (symptom.name === "Draining Lesions") {
      // Appears during peak flares
      severity = flareIntensity > 0.5 ? flareIntensity * 7 + random(0, 2) : random(0, 1);
    } else if (symptom.name === "Inflammation") {
      // Correlated with flares and seasonal factors
      severity = flareIntensity * 7 + seasonalFactor * 2 + random(0, 2);
    } else if (symptom.name === "Skin Tenderness") {
      // Present before and during flares
      severity = flareIntensity * 6 + random(0, 2);
    } else if (symptom.name === "Itching") {
      // Often precedes flares
      severity = flareIntensity * 5 + seasonalFactor * 1.5 + random(0, 2);
    } else if (symptom.name === "Fatigue") {
      // General symptom affected by flares and sleep
      severity = flareIntensity * 4 + (10 - stressLevel) * 0.3 + random(0, 2);
    } else if (symptom.name === "Joint Pain") {
      // Sometimes accompanies HS flares
      severity = flareIntensity > 0.4 ? flareIntensity * 5 + random(0, 2) : random(0, 2);
    } else if (symptom.name === "Anxiety") {
      // Increases with stress and flares
      severity = stressLevel * 0.6 + flareIntensity * 2 + random(0, 2);
    } else if (symptom.name === "Sleep Disturbance") {
      // Caused by pain during flares
      severity = flareIntensity * 4 + random(0, 2);
    }

    severity = Math.round(clamp(severity, 0, 10));

    // Only include symptoms with severity > 0
    if (severity === 0 && Math.random() > 0.3) {
      severity = 0; // 70% chance to exclude zero-severity symptoms
    }

    return {
      symptomId: symptom.id,
      severity,
      notes:
        severity >= 8
          ? "Severe - significantly impacting daily life"
          : severity >= 5
          ? "Moderate - manageable but noticeable"
          : severity >= 2
          ? "Mild - present but not bothersome"
          : "",
    };
  }).filter(s => s.severity > 0 || Math.random() > 0.7); // Keep some zero-severity for realism
}

function buildMedicationLogs({
  medications,
  isFlaring,
}: {
  medications: MedicationRecord[];
  isFlaring: boolean;
}): DailyMedicationRecord[] {
  return medications.map((medication) => {
    let taken = true;
    let notes: string | undefined;

    // Adherence patterns
    if (medication.name.includes("Humira")) {
      // Biologics - high adherence
      taken = Math.random() > 0.05; // 95% adherence
    } else if (medication.name.includes("Doxycycline")) {
      // Antibiotics - good adherence
      taken = Math.random() > 0.15; // 85% adherence
    } else if (medication.name.includes("Ibuprofen")) {
      // PRN medication - only when needed
      taken = isFlaring && Math.random() > 0.3; // 70% of flare days
      notes = taken ? "Taken for pain relief" : undefined;
    } else if (medication.name.includes("Zinc")) {
      // Supplements - moderate adherence
      taken = Math.random() > 0.25; // 75% adherence
    } else if (medication.name.includes("Clindamycin")) {
      // Topical - good adherence
      taken = Math.random() > 0.10; // 90% adherence
    }

    if (!taken && Math.random() > 0.7) {
      notes = "Forgot to take";
    }

    return {
      medicationId: medication.id,
      taken,
      dosage: medication.dosage,
      notes,
    };
  });
}

function buildTriggerLogs({
  triggers,
  flareIntensity,
  seasonalFactor,
  stressLevel,
  cycleFactor,
  dayOfWeek,
}: {
  triggers: TriggerRecord[];
  flareIntensity: number;
  seasonalFactor: number;
  stressLevel: number;
  cycleFactor: number;
  dayOfWeek: number;
}): DailyTriggerRecord[] {
  const logs: DailyTriggerRecord[] = [];

  for (const trigger of triggers) {
    let intensity = 0;
    let notes = "";
    let include = false;

    if (trigger.name === "Stress") {
      intensity = stressLevel;
      include = stressLevel > 4;
      notes = intensity > 7 ? "High work pressure" : "Moderate stress";
    } else if (trigger.name === "Heat/Humidity") {
      // Worse in summer
      intensity = Math.max(0, seasonalFactor * 8 + 3);
      include = seasonalFactor > -0.1 && Math.random() > 0.3;
      notes = "Hot weather causing sweating";
    } else if (trigger.name === "Tight Clothing") {
      // Random occurrence
      include = Math.random() > 0.7;
      intensity = include ? random(4, 8) : 0;
      notes = "Friction from clothing";
    } else if (trigger.name === "Certain Foods") {
      // Occasional dietary triggers
      include = Math.random() > 0.85;
      intensity = include ? random(5, 8) : 0;
      notes = "Possible dietary trigger";
    } else if (trigger.name === "Smoking") {
      // If applicable, fairly consistent
      include = Math.random() > 0.4;
      intensity = include ? random(5, 7) : 0;
    } else if (trigger.name === "Poor Sleep") {
      // Correlated with flares and stress
      include = (flareIntensity > 0.5 || stressLevel > 6) && Math.random() > 0.4;
      intensity = include ? random(5, 9) : 0;
      notes = "Less than 6 hours of sleep";
    } else if (trigger.name === "Menstrual Cycle") {
      // Follows 28-day cycle
      include = cycleFactor > 0.5 && Math.random() > 0.3;
      intensity = include ? random(5, 8) : 0;
      notes = "Hormonal fluctuation";
    }

    if (include && intensity > 0) {
      logs.push({
        triggerId: trigger.id,
        intensity: Math.round(clamp(intensity, 0, 10)),
        notes,
      });
    }
  }

  return logs;
}
