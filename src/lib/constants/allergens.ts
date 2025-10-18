// Allergen taxonomy for food tracking
// Medical-standard allergen categories aligned with common food sensitivities

export const ALLERGEN_TYPES = [
  'dairy',
  'gluten',
  'nuts',
  'shellfish',
  'nightshades',
  'soy',
  'eggs',
  'fish',
] as const;

export type AllergenType = typeof ALLERGEN_TYPES[number];

// Allergen color coding for consistent visual representation
export const ALLERGEN_COLORS: Record<AllergenType, string> = {
  dairy: 'bg-blue-500 text-white',
  gluten: 'bg-orange-500 text-white',
  nuts: 'bg-amber-700 text-white',
  shellfish: 'bg-pink-500 text-white',
  nightshades: 'bg-purple-500 text-white',
  soy: 'bg-yellow-600 text-white',
  eggs: 'bg-yellow-400 text-gray-900',
  fish: 'bg-cyan-500 text-white',
};

// Allergen display names
export const ALLERGEN_LABELS: Record<AllergenType, string> = {
  dairy: 'Dairy',
  gluten: 'Gluten',
  nuts: 'Nuts',
  shellfish: 'Shellfish',
  nightshades: 'Nightshades',
  soy: 'Soy',
  eggs: 'Eggs',
  fish: 'Fish',
};

// Validate allergen taxonomy
export function isValidAllergen(allergen: string): allergen is AllergenType {
  return ALLERGEN_TYPES.includes(allergen as AllergenType);
}

// Validate array of allergens
export function validateAllergens(allergens: string[]): boolean {
  return allergens.every(isValidAllergen);
}
