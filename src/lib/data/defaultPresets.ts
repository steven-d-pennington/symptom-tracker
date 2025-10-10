export interface DefaultSymptom {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface DefaultTrigger {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export const DEFAULT_SYMPTOMS: DefaultSymptom[] = [
  // Pain
  { id: "joint-pain", name: "Joint Pain", category: "pain", description: "Pain in joints" },
  { id: "muscle-pain", name: "Muscle Pain", category: "pain", description: "Muscle aches and soreness" },
  { id: "headache", name: "Headache", category: "pain", description: "Head pain or pressure" },
  { id: "back-pain", name: "Back Pain", category: "pain", description: "Lower or upper back pain" },
  { id: "neck-pain", name: "Neck Pain", category: "pain", description: "Neck stiffness or pain" },

  // Inflammation
  { id: "swelling", name: "Swelling", category: "inflammation", description: "Joint or tissue swelling" },
  { id: "redness", name: "Redness", category: "inflammation", description: "Skin redness or warmth" },
  { id: "stiffness", name: "Stiffness", category: "inflammation", description: "Joint or muscle stiffness" },

  // Fatigue
  { id: "fatigue", name: "Fatigue", category: "fatigue", description: "Excessive tiredness" },
  { id: "weakness", name: "Weakness", category: "fatigue", description: "Muscle weakness" },
  { id: "brain-fog", name: "Brain Fog", category: "fatigue", description: "Mental cloudiness or confusion" },

  // Digestive
  { id: "nausea", name: "Nausea", category: "digestive", description: "Feeling sick to stomach" },
  { id: "stomach-pain", name: "Stomach Pain", category: "digestive", description: "Abdominal pain or cramping" },
  { id: "diarrhea", name: "Diarrhea", category: "digestive", description: "Loose or watery stools" },
  { id: "constipation", name: "Constipation", category: "digestive", description: "Difficulty passing stools" },

  // Skin
  { id: "rash", name: "Rash", category: "skin", description: "Skin irritation or breakout" },
  { id: "itching", name: "Itching", category: "skin", description: "Skin itchiness" },
  { id: "hives", name: "Hives", category: "skin", description: "Raised, itchy welts" },

  // Other
  { id: "fever", name: "Fever", category: "other", description: "Elevated body temperature" },
  { id: "chills", name: "Chills", category: "other", description: "Feeling cold or shivering" },
  { id: "dizziness", name: "Dizziness", category: "other", description: "Feeling lightheaded" },
];

export const DEFAULT_TRIGGERS: DefaultTrigger[] = [
  // Food
  { id: "dairy", name: "Dairy", category: "food", description: "Milk, cheese, yogurt" },
  { id: "gluten", name: "Gluten", category: "food", description: "Wheat, bread, pasta" },
  { id: "sugar", name: "Sugar", category: "food", description: "Added sugars and sweets" },
  { id: "alcohol", name: "Alcohol", category: "food", description: "Alcoholic beverages" },
  { id: "caffeine", name: "Caffeine", category: "food", description: "Coffee, tea, energy drinks" },
  { id: "processed-food", name: "Processed Food", category: "food", description: "Packaged or fast food" },

  // Weather
  { id: "cold-weather", name: "Cold Weather", category: "weather", description: "Low temperatures" },
  { id: "hot-weather", name: "Hot Weather", category: "weather", description: "High temperatures" },
  { id: "humidity", name: "Humidity", category: "weather", description: "High moisture in air" },
  { id: "barometric-pressure", name: "Barometric Pressure", category: "weather", description: "Changes in air pressure" },

  // Stress
  { id: "work-stress", name: "Work Stress", category: "stress", description: "Job-related stress" },
  { id: "emotional-stress", name: "Emotional Stress", category: "stress", description: "Personal or relationship stress" },
  { id: "anxiety", name: "Anxiety", category: "stress", description: "Feelings of worry or nervousness" },

  // Physical Activity
  { id: "overexertion", name: "Overexertion", category: "activity", description: "Too much physical activity" },
  { id: "lack-of-exercise", name: "Lack of Exercise", category: "activity", description: "Not enough movement" },

  // Sleep
  { id: "poor-sleep", name: "Poor Sleep", category: "sleep", description: "Insufficient or poor quality sleep" },
  { id: "oversleeping", name: "Oversleeping", category: "sleep", description: "Too much sleep" },

  // Other
  { id: "hormones", name: "Hormonal Changes", category: "other", description: "Menstrual cycle or hormonal fluctuations" },
  { id: "allergies", name: "Allergies", category: "other", description: "Environmental allergens" },
  { id: "dehydration", name: "Dehydration", category: "other", description: "Not enough water intake" },
];
