export interface NutritionInfo {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
}

interface StandardMacroPerUnit {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  standardUnit: string;
  unitAmount: number; // e.g. 100 for 100g, or 1 for 1 piece
}

// Certified Nutrition Database Lookup Table
const nutritionDatabase: Record<string, StandardMacroPerUnit> = {
  'egg': { calories: 74, proteinG: 6.3, carbsG: 0.4, fatG: 5.0, fiberG: 0, standardUnit: 'piece', unitAmount: 1 },
  'boiled egg': { calories: 74, proteinG: 6.3, carbsG: 0.4, fatG: 5.0, fiberG: 0, standardUnit: 'piece', unitAmount: 1 },
  'oats': { calories: 389, proteinG: 16.9, carbsG: 66.3, fatG: 6.9, fiberG: 10.6, standardUnit: 'g', unitAmount: 100 },
  'chapati': { calories: 104, proteinG: 3.1, carbsG: 18.0, fatG: 3.0, fiberG: 2.5, standardUnit: 'piece', unitAmount: 1 },
  'roti': { calories: 104, proteinG: 3.1, carbsG: 18.0, fatG: 3.0, fiberG: 2.5, standardUnit: 'piece', unitAmount: 1 },
  'dosa': { calories: 168, proteinG: 3.9, carbsG: 29.0, fatG: 3.7, fiberG: 1.5, standardUnit: 'piece', unitAmount: 1 },
  'idli': { calories: 58, proteinG: 1.6, carbsG: 12.0, fatG: 0.4, fiberG: 0.8, standardUnit: 'piece', unitAmount: 1 },
  'rice': { calories: 130, proteinG: 2.7, carbsG: 28.0, fatG: 0.3, fiberG: 0.4, standardUnit: 'g', unitAmount: 100 },
  'chicken': { calories: 165, proteinG: 31.0, carbsG: 0.0, fatG: 3.6, fiberG: 0, standardUnit: 'g', unitAmount: 100 },
  'chicken breast': { calories: 165, proteinG: 31.0, carbsG: 0.0, fatG: 3.6, fiberG: 0, standardUnit: 'g', unitAmount: 100 },
  'paneer': { calories: 265, proteinG: 18.3, carbsG: 1.2, fatG: 20.8, fiberG: 0, standardUnit: 'g', unitAmount: 100 },
  'dal': { calories: 116, proteinG: 9.0, carbsG: 20.0, fatG: 0.8, fiberG: 8.0, standardUnit: 'g', unitAmount: 100 },
  'whey': { calories: 120, proteinG: 24.0, carbsG: 2.0, fatG: 1.5, fiberG: 0, standardUnit: 'scoop', unitAmount: 1 },
  'protein shake': { calories: 140, proteinG: 25.0, carbsG: 3.0, fatG: 2.0, fiberG: 1, standardUnit: 'scoop', unitAmount: 1 },
  'almond': { calories: 579, proteinG: 21.2, carbsG: 21.7, fatG: 49.9, fiberG: 12.5, standardUnit: 'g', unitAmount: 100 },
  'banana': { calories: 89, proteinG: 1.1, carbsG: 22.8, fatG: 0.3, fiberG: 2.6, standardUnit: 'piece', unitAmount: 1 },
  'apple': { calories: 52, proteinG: 0.3, carbsG: 13.8, fatG: 0.2, fiberG: 2.4, standardUnit: 'piece', unitAmount: 1 },
  'biryani': { calories: 290, proteinG: 12.0, carbsG: 35.0, fatG: 11.0, fiberG: 2.0, standardUnit: 'g', unitAmount: 100 }
};

// In-memory lookup cache to prevent redundant recalculations
const cache = new Map<string, NutritionInfo>();

export function lookupNutrition(foodName: string, quantity: number, unit: string): NutritionInfo {
  const nameKey = (foodName || '').toLowerCase().trim();
  const cacheKey = `${nameKey}:${quantity}:${unit}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const dbItem = nutritionDatabase[nameKey];
  if (!dbItem) {
    // If not found in database, return null - NEVER guess fake values!
    const emptyResult: NutritionInfo = {
      calories: null,
      proteinG: null,
      carbsG: null,
      fatG: null,
      fiberG: null
    };
    cache.set(cacheKey, emptyResult);
    return emptyResult;
  }

  let multiplier = quantity / dbItem.unitAmount;
  if (unit === 'g' && dbItem.standardUnit === 'g') {
    multiplier = quantity / 100;
  } else if ((unit === 'cup' || unit === 'cups') && dbItem.standardUnit === 'g') {
    multiplier = (quantity * 80) / 100; // 1 cup ~ 80g
  }

  const result: NutritionInfo = {
    calories: Math.round(dbItem.calories * multiplier),
    proteinG: Math.round(dbItem.proteinG * multiplier * 10) / 10,
    carbsG: Math.round(dbItem.carbsG * multiplier * 10) / 10,
    fatG: Math.round(dbItem.fatG * multiplier * 10) / 10,
    fiberG: Math.round(dbItem.fiberG * multiplier * 10) / 10
  };

  cache.set(cacheKey, result);
  return result;
}
