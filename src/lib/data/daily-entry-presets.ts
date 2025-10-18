export interface SymptomOption {
  id: string;
  label: string;
  category: string;
}

export interface MedicationOption {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
}

export interface TriggerOption {
  id: string;
  label: string;
  description: string;
}

export interface MoodOption {
  id: string;
  label: string;
  tone: "positive" | "neutral" | "challenging";
}

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: "headache", label: "Headache", category: "Pain" },
  { id: "fatigue", label: "Fatigue", category: "Energy" },
  { id: "nausea", label: "Nausea", category: "Digestive" },
  { id: "brain-fog", label: "Brain fog", category: "Cognitive" },
  { id: "joint-pain", label: "Joint pain", category: "Pain" },
  { id: "anxiety", label: "Anxiety", category: "Emotional" },
  { id: "dizziness", label: "Dizziness", category: "Balance" },
  { id: "shortness-of-breath", label: "Shortness of breath", category: "Respiratory" },
];

export const MEDICATION_OPTIONS: MedicationOption[] = [
  {
    id: "med-1",
    name: "Anti-inflammatory",
    dosage: "200mg",
    schedule: "Morning",
  },
  {
    id: "med-2",
    name: "Daily vitamin",
    dosage: "1 tablet",
    schedule: "Morning",
  },
  {
    id: "med-3",
    name: "Sleep support",
    dosage: "5mg",
    schedule: "Evening",
  },
];

export const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    id: "weather-shift",
    label: "Weather change",
    description: "Rapid shifts in temperature or humidity",
  },
  {
    id: "stress",
    label: "Stress",
    description: "Emotional or work-related stress",
  },
  {
    id: "diet",
    label: "Diet",
    description: "Foods or drinks that commonly cause flares",
  },
  {
    id: "sleep-loss",
    label: "Poor sleep",
    description: "Less than 6 hours of rest",
  },
  {
    id: "activity",
    label: "Intense activity",
    description: "Workouts or physically demanding tasks",
  },
];

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "optimistic", label: "Optimistic", tone: "positive" },
  { id: "steady", label: "Steady", tone: "neutral" },
  { id: "overwhelmed", label: "Overwhelmed", tone: "challenging" },
  { id: "encouraged", label: "Encouraged", tone: "positive" },
  { id: "reflective", label: "Reflective", tone: "neutral" },
  { id: "drained", label: "Drained", tone: "challenging" },
];
