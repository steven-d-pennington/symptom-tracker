/**
 * Default Data Definitions for Story 3.5.1
 * Pre-populated symptoms, foods, triggers, and medications for new users
 *
 * Medical terminology validated against HS (Hidradenitis Suppurativa) community resources
 * and patient-friendly language guidelines
 */

export interface DefaultSymptom {
  name: string;
  category: string;
  description?: string;
  severityScale: {
    min: number;
    max: number;
    labels: Record<number, string>;
  };
}

export interface DefaultFood {
  name: string;
  category: string;
  allergenTags?: string[];
}

export interface DefaultTrigger {
  name: string;
  category: string;
  description?: string;
}

export interface DefaultMedication {
  name: string;
  type: string;
  dosage?: string;
  frequency: string;
}

/**
 * Default Symptoms - Common HS symptoms (10 items)
 * AC3.5.1.1: minimum 8-10 default symptoms with medically relevant terminology
 */
export const DEFAULT_SYMPTOMS: DefaultSymptom[] = [
  {
    name: 'Pain',
    category: 'Physical',
    description: 'General pain or discomfort in affected areas',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Swelling',
    category: 'Physical',
    description: 'Inflammation or swelling in affected areas',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Drainage',
    category: 'Physical',
    description: 'Fluid or discharge from affected areas',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Redness',
    category: 'Physical',
    description: 'Redness or inflammation of skin',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Itching',
    category: 'Physical',
    description: 'Itching or irritation in affected areas',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Tenderness',
    category: 'Physical',
    description: 'Tenderness or sensitivity to touch',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Heat',
    category: 'Physical',
    description: 'Warmth or heat sensation in affected areas',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Hardness',
    category: 'Physical',
    description: 'Hardness or firmness of nodules',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Sensitivity',
    category: 'Physical',
    description: 'General sensitivity or discomfort',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  },
  {
    name: 'Discomfort',
    category: 'Physical',
    description: 'General discomfort or unease',
    severityScale: {
      min: 0,
      max: 10,
      labels: {
        0: 'None',
        1: 'Minimal',
        3: 'Mild',
        5: 'Moderate',
        7: 'Severe',
        10: 'Extreme'
      }
    }
  }
];

/**
 * Default Foods - Common trigger foods organized by category (20 items across 6 categories)
 * AC3.5.1.2: minimum 15-20 default food items across 5-6 categories
 */
export const DEFAULT_FOODS: DefaultFood[] = [
  // Dairy category (3 items)
  { name: 'Milk', category: 'Dairy', allergenTags: ['dairy'] },
  { name: 'Cheese', category: 'Dairy', allergenTags: ['dairy'] },
  { name: 'Yogurt', category: 'Dairy', allergenTags: ['dairy'] },

  // Grains category (4 items)
  { name: 'Wheat', category: 'Grains', allergenTags: ['gluten'] },
  { name: 'Bread', category: 'Grains', allergenTags: ['gluten'] },
  { name: 'Pasta', category: 'Grains', allergenTags: ['gluten'] },
  { name: 'Rice', category: 'Grains', allergenTags: [] },

  // Nightshades category (3 items)
  { name: 'Tomatoes', category: 'Nightshades', allergenTags: ['nightshades'] },
  { name: 'Peppers', category: 'Nightshades', allergenTags: ['nightshades'] },
  { name: 'Potatoes', category: 'Nightshades', allergenTags: ['nightshades'] },

  // Processed Foods category (2 items)
  { name: 'Processed Foods', category: 'Processed', allergenTags: [] },
  { name: 'Fast Food', category: 'Processed', allergenTags: [] },

  // Sugar category (3 items)
  { name: 'Sugar', category: 'Sugar', allergenTags: [] },
  { name: 'Sweets', category: 'Sugar', allergenTags: [] },
  { name: 'Soda', category: 'Sugar', allergenTags: [] },

  // Proteins category (7 items)
  { name: 'Red Meat', category: 'Proteins', allergenTags: [] },
  { name: 'Chicken', category: 'Proteins', allergenTags: [] },
  { name: 'Fish', category: 'Proteins', allergenTags: ['fish'] },
  { name: 'Shellfish', category: 'Proteins', allergenTags: ['shellfish'] },
  { name: 'Eggs', category: 'Proteins', allergenTags: ['eggs'] },
  { name: 'Soy', category: 'Proteins', allergenTags: ['soy'] },
  { name: 'Nuts', category: 'Proteins', allergenTags: ['nuts'] }
];

/**
 * Default Triggers - Common HS triggers (10 items)
 * AC3.5.1.3: minimum 8-10 default triggers
 */
export const DEFAULT_TRIGGERS: DefaultTrigger[] = [
  {
    name: 'Stress',
    category: 'Psychological',
    description: 'Mental or emotional stress'
  },
  {
    name: 'Heat/Humidity',
    category: 'Environmental',
    description: 'Hot or humid weather conditions'
  },
  {
    name: 'Friction',
    category: 'Physical',
    description: 'Rubbing or chafing of skin'
  },
  {
    name: 'Hormonal Changes',
    category: 'Biological',
    description: 'Hormonal fluctuations or changes'
  },
  {
    name: 'Lack of Sleep',
    category: 'Lifestyle',
    description: 'Insufficient or poor quality sleep'
  },
  {
    name: 'Exercise',
    category: 'Physical',
    description: 'Physical activity or exercise'
  },
  {
    name: 'Tight Clothing',
    category: 'Physical',
    description: 'Tight or restrictive clothing'
  },
  {
    name: 'Sweat',
    category: 'Physical',
    description: 'Excessive sweating or perspiration'
  },
  {
    name: 'Weather Changes',
    category: 'Environmental',
    description: 'Sudden changes in weather conditions'
  },
  {
    name: 'Diet',
    category: 'Lifestyle',
    description: 'Dietary choices or changes'
  }
];

/**
 * Default Medications - Common HS treatments and self-care options (10 items)
 * AC3.5.1.4: minimum 8-10 default treatment options
 */
export const DEFAULT_MEDICATIONS: DefaultMedication[] = [
  {
    name: 'Ibuprofen',
    type: 'Pain Relief',
    dosage: '200mg',
    frequency: 'as-needed'
  },
  {
    name: 'Acetaminophen',
    type: 'Pain Relief',
    dosage: '500mg',
    frequency: 'as-needed'
  },
  {
    name: 'Antibiotic (prescribed)',
    type: 'Medication',
    frequency: 'daily'
  },
  {
    name: 'Topical Antibiotic',
    type: 'Medication',
    frequency: 'daily'
  },
  {
    name: 'Biologic Injection',
    type: 'Medication',
    frequency: 'weekly'
  },
  {
    name: 'Anti-inflammatory',
    type: 'Medication',
    frequency: 'daily'
  },
  {
    name: 'Antihistamine',
    type: 'Medication',
    frequency: 'as-needed'
  },
  {
    name: 'Zinc Supplement',
    type: 'Supplement',
    frequency: 'daily'
  },
  {
    name: 'Turmeric/Curcumin',
    type: 'Supplement',
    frequency: 'daily'
  },
  {
    name: 'Vitamin D',
    type: 'Supplement',
    frequency: 'daily'
  }
];

// Export counts for validation
export const DEFAULT_COUNTS = {
  symptoms: DEFAULT_SYMPTOMS.length,  // Should be >= 8 per AC3.5.1.1
  foods: DEFAULT_FOODS.length,         // Should be >= 15 per AC3.5.1.2
  triggers: DEFAULT_TRIGGERS.length,   // Should be >= 8 per AC3.5.1.3
  medications: DEFAULT_MEDICATIONS.length // Should be >= 8 per AC3.5.1.4
} as const;

// Validate counts match acceptance criteria
if (DEFAULT_COUNTS.symptoms < 8) {
  console.warn(`DEFAULT_SYMPTOMS count (${DEFAULT_COUNTS.symptoms}) is below minimum 8`);
}
if (DEFAULT_COUNTS.foods < 15) {
  console.warn(`DEFAULT_FOODS count (${DEFAULT_COUNTS.foods}) is below minimum 15`);
}
if (DEFAULT_COUNTS.triggers < 8) {
  console.warn(`DEFAULT_TRIGGERS count (${DEFAULT_COUNTS.triggers}) is below minimum 8`);
}
if (DEFAULT_COUNTS.medications < 8) {
  console.warn(`DEFAULT_MEDICATIONS count (${DEFAULT_COUNTS.medications}) is below minimum 8`);
}
