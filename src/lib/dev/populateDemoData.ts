import { db } from "../db/client";
import {
  MedicationRecord,
  SymptomRecord,
  TriggerRecord,
} from "../db/schema";
import { generateId } from "../utils/idGenerator";
import { buildDailyEntries } from "./generateRealisticEntries";

interface PopulateDevDataOptions {
  months?: number;
  userId: string; // Make userId required
}

export interface PopulateDevDataResult {
  entriesCreated: number;
  symptomsCreated: number;
  medicationsCreated: number;
  triggersCreated: number;
  startDate: string;
  endDate: string;
  userId: string;
}

export async function populateDevDemoData(
  options: PopulateDevDataOptions
): Promise<PopulateDevDataResult> {
  if (typeof window === "undefined") {
    throw new Error("populateDevDemoData can only run in the browser");
  }

  const months = 48;
  const userId = options.userId;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);
  startDate.setHours(0, 0, 0, 0);

  const symptoms: SymptomRecord[] = createSymptoms(userId);
  const medications: MedicationRecord[] = createMedications(userId);
  const triggers: TriggerRecord[] = createTriggers(userId);

  const entries = buildDailyEntries({
    startDate,
    endDate: now,
    userId,
    symptoms,
    medications,
    triggers,
  });

  // Clear existing data
  await db.analysisResults.where({ userId }).delete();
  await db.dailyEntries.where({ userId }).delete();
  await db.symptoms.where({ userId }).delete();
  await db.medications.where({ userId }).delete();
  await db.triggers.where({ userId }).delete();

  // Add new data
  await db.symptoms.bulkAdd(symptoms);
  await db.medications.bulkAdd(medications);
  await db.triggers.bulkAdd(triggers);
  await db.dailyEntries.bulkAdd(entries);

  console.log("[Demo Data] Created:", {
    entries: entries.length,
    symptoms: symptoms.length,
    medications: medications.length,
    triggers: triggers.length,
  });

  return {
    entriesCreated: entries.length,
    symptomsCreated: symptoms.length,
    medicationsCreated: medications.length,
    triggersCreated: triggers.length,
    startDate: entries[0]?.date ?? "",
    endDate: entries[entries.length - 1]?.date ?? "",
    userId,
  };
}

function createSymptoms(userId: string): SymptomRecord[] {
  const now = new Date();
  const severityScale = {
    min: 0,
    max: 10,
    labels: {
      0: "None",
      5: "Moderate",
      10: "Severe",
    },
  };

  return [
    // HS-specific symptoms
    {
      id: generateId(),
      userId,
      name: "Painful Nodules",
      category: "skin",
      description: "Deep, painful lumps under the skin",
      commonTriggers: ["Stress", "Friction", "Heat"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Draining Lesions",
      category: "skin",
      description: "Open wounds that leak fluid",
      commonTriggers: ["Infection", "Friction"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Inflammation",
      category: "skin",
      description: "Red, swollen areas",
      commonTriggers: ["Stress", "Certain foods"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Skin Tenderness",
      category: "skin",
      description: "Sensitive, painful skin in affected areas",
      commonTriggers: ["Touch", "Tight clothing"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Itching",
      category: "skin",
      description: "Intense itching before flares",
      commonTriggers: ["Stress", "Sweating"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    // General symptoms
    {
      id: generateId(),
      userId,
      name: "Fatigue",
      category: "fatigue",
      description: "Persistent tiredness and low energy",
      commonTriggers: ["Poor sleep", "Flares", "Medication"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Joint Pain",
      category: "pain",
      description: "Aching in joints, often accompanies HS",
      commonTriggers: ["Weather", "Activity", "Inflammation"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Anxiety",
      category: "uncategorized",
      description: "Worry and stress about condition",
      commonTriggers: ["Flares", "Social situations"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Sleep Disturbance",
      category: "uncategorized",
      description: "Difficulty sleeping due to pain or discomfort",
      commonTriggers: ["Pain", "Anxiety", "Discomfort"],
      severityScale,
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createMedications(userId: string): MedicationRecord[] {
  const now = new Date();
  return [
    {
      id: generateId(),
      userId,
      name: "Humira (Adalimumab)",
      dosage: "40mg",
      frequency: "Bi-weekly injection",
      schedule: [
        { time: "18:00", daysOfWeek: [0, 3] }, // Sunday and Wednesday
      ],
      sideEffects: ["Injection site reactions", "Headache"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Doxycycline",
      dosage: "100mg",
      frequency: "Twice daily",
      schedule: [
        { time: "08:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
        { time: "20:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      ],
      sideEffects: ["Nausea", "Sun sensitivity"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "As needed",
      schedule: [
        { time: "12:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      ],
      sideEffects: ["Stomach upset"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Zinc Supplement",
      dosage: "50mg",
      frequency: "Daily",
      schedule: [
        { time: "09:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Clindamycin Topical",
      dosage: "1% gel",
      frequency: "Twice daily",
      schedule: [
        { time: "07:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
        { time: "19:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function createTriggers(userId: string): TriggerRecord[] {
  const now = new Date();
  return [
    {
      id: generateId(),
      userId,
      name: "Stress",
      category: "Lifestyle",
      description: "High workload or emotional stress",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Heat/Humidity",
      category: "Environmental",
      description: "Hot, humid weather causing sweating",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Tight Clothing",
      category: "Lifestyle",
      description: "Friction from tight clothes in affected areas",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Certain Foods",
      category: "Dietary",
      description: "Dairy, nightshades, or high-sugar foods",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Smoking",
      category: "Lifestyle",
      description: "Cigarette or vaping usage",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Poor Sleep",
      category: "Lifestyle",
      description: "Less than 6 hours or disrupted sleep",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      userId,
      name: "Menstrual Cycle",
      category: "Hormonal",
      description: "Hormonal fluctuations during cycle",
      isActive: true,
      isDefault: false,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}
