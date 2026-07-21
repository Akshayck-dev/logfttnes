import { MealItem } from '../types';

export interface MergedFoodResult {
  items: MealItem[];
  hasDuplicatesMerged: boolean;
  duplicateNotice?: string;
}

export function detectAndMergeDuplicates(items: MealItem[]): MergedFoodResult {
  const foodMap = new Map<string, MealItem>();
  let hasDuplicatesMerged = false;

  for (const item of items) {
    const key = (item.name || '').toLowerCase().trim();
    if (foodMap.has(key)) {
      const existing = foodMap.get(key)!;
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      hasDuplicatesMerged = true;
    } else {
      foodMap.set(key, { ...item });
    }
  }

  const mergedList = Array.from(foodMap.values());
  return {
    items: mergedList,
    hasDuplicatesMerged,
    duplicateNotice: hasDuplicatesMerged
      ? 'Repeated items were automatically merged into combined quantities.'
      : undefined
  };
}
