import { AiDetectedEntity, MealCategory } from '../types';
import { normalizeFoodName } from './foodNormalizer';
import { detectAndMergeDuplicates } from './duplicateDetector';
import { lookupNutrition } from './nutritionService';

const getApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  }
  const globalEnv = (globalThis as any).process?.env;
  return globalEnv?.VITE_GEMINI_API_KEY || globalEnv?.GEMINI_API_KEY || '';
};

export async function parseWithGeminiFlash(transcript: string): Promise<AiDetectedEntity> {
  const apiKey = getApiKey();
  const rawText = (transcript || '').trim();
  const lowerText = rawText.toLowerCase();

  if (!rawText) {
    return {
      intent: 'unknown',
      confidence: 0,
      summaryText: 'No text input provided.'
    };
  }

  // 1. Detect Incomplete Fragments
  if (/\b(one|a|1|2|3)\s+(cup|glass|plate|bowl|scoop)\s+(of)?$/i.test(rawText) || lowerText.endsWith('of')) {
    const qtyMatch = rawText.match(/\b(one|a|1|2|3)\s+(cup|glass|plate|bowl|scoop)/i);
    const container = qtyMatch ? qtyMatch[2] : 'quantity';
    return {
      intent: 'ambiguous',
      confidence: 0.5,
      summaryText: `Incomplete entry: "${rawText}"`,
      clarificationQuestion: `What food was one ${container}?`
    };
  }

  // 2. Strict Time-of-Day Meal Type Determination
  let mealType: MealCategory = 'lunch';
  if (
    lowerText.includes('morning') ||
    lowerText.includes('mronig') ||
    lowerText.includes('mrng') ||
    lowerText.includes('mornin') ||
    lowerText.includes('breakfast') ||
    lowerText.includes('രാവിലെ')
  ) {
    mealType = 'breakfast';
  } else if (lowerText.includes('lunch') || lowerText.includes('noon') || lowerText.includes('afternoon') || lowerText.includes('ഉച്ചയ്ക്ക്')) {
    mealType = 'lunch';
  } else if (lowerText.includes('evening') || lowerText.includes('snack')) {
    mealType = 'snack';
  } else if (lowerText.includes('dinner') || lowerText.includes('night') || lowerText.includes('രാത്രി')) {
    mealType = 'dinner';
  } else {
    const hour = new Date().getHours();
    mealType = hour < 11 ? 'breakfast' : hour < 16 ? 'lunch' : hour < 21 ? 'dinner' : 'snack';
  }

  // System Prompt for Gemini 2.5 Flash / 1.5 Flash
  const systemPrompt = `You are FitLog AI's Precision Food & Fitness Entity Extractor.

Analyze this natural language input: "${rawText}"

STRICT RULES:
1. Extract ALL food items separately (e.g. if input is "Morning I ate one cup oats and three boiled eggs", extract BOTH oats AND eggs!).
2. DO NOT invent calories or macros.
3. mealType MUST be "${mealType}".
4. Return ONLY valid raw JSON.

JSON SCHEMA:
{
  "intent": "meal" | "workout" | "weight" | "water" | "sleep" | "ambiguous",
  "confidence": number,
  "summaryText": string,
  "clarificationQuestion": string | null,
  "mealType": "${mealType}",
  "foods": [
    {
      "name": string,
      "quantity": number,
      "unit": string,
      "confidence": number
    }
  ],
  "workoutData": { "title": string, "category": "strength"|"cardio"|"hiit"|"yoga", "durationMinutes": number },
  "weightData": { "weightKg": number },
  "waterData": { "amountMl": number },
  "sleepData": { "durationHours": number }
}`;

  let extractedResult: any = null;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: systemPrompt }]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.0
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          extractedResult = JSON.parse(text);
        }
      }
    } catch (err) {
      console.warn('Gemini API request failed, running local fallback:', err);
    }
  }

  // Fallback to local parsing if Gemini is unconfigured or failed
  if (!extractedResult) {
    extractedResult = parseLocalExtraction(rawText, mealType);
  }

  // Non-Meal Intents (Water, Weight, Sleep, Workout)
  if (extractedResult.intent === 'water' && extractedResult.waterData) {
    return {
      intent: 'water',
      confidence: extractedResult.confidence ?? 0.95,
      summaryText: `Logged ${extractedResult.waterData.amountMl}ml water`,
      waterData: { amountMl: extractedResult.waterData.amountMl, loggedAt: new Date().toISOString() }
    };
  }

  if (extractedResult.intent === 'weight' && extractedResult.weightData) {
    return {
      intent: 'weight',
      confidence: extractedResult.confidence ?? 0.95,
      summaryText: `Recorded weight: ${extractedResult.weightData.weightKg} kg`,
      weightData: { weightKg: extractedResult.weightData.weightKg, loggedAt: new Date().toISOString() }
    };
  }

  if (extractedResult.intent === 'sleep' && extractedResult.sleepData) {
    return {
      intent: 'sleep',
      confidence: extractedResult.confidence ?? 0.9,
      summaryText: `Logged ${extractedResult.sleepData.durationHours} hrs sleep`,
      sleepData: {
        durationHours: extractedResult.sleepData.durationHours,
        qualityScore: 4,
        sleepTime: '',
        wakeTime: '',
        loggedAt: new Date().toISOString().split('T')[0]
      }
    };
  }

  if (extractedResult.intent === 'workout' && extractedResult.workoutData) {
    return {
      intent: 'workout',
      confidence: extractedResult.confidence ?? 0.92,
      summaryText: `Logged ${extractedResult.workoutData.title} (${extractedResult.workoutData.durationMinutes || 45} mins)`,
      workoutData: {
        title: extractedResult.workoutData.title || 'Workout Session',
        category: extractedResult.workoutData.category || 'strength',
        durationMinutes: extractedResult.workoutData.durationMinutes || 45,
        caloriesBurned: Math.round((extractedResult.workoutData.durationMinutes || 45) * 8),
        exercises: [],
        loggedAt: new Date().toISOString()
      }
    };
  }

  // Process Meal Extraction & All Foods
  const rawFoods: any[] = extractedResult.foods || [];
  const normalizedItems = rawFoods.map((f: any) => {
    const normName = normalizeFoodName(f.name || 'food item');
    const qty = f.quantity || 1;
    const unit = f.unit || 'piece';
    const conf = f.confidence ?? 0.9;

    const nutrition = lookupNutrition(normName, qty, unit);

    return {
      name: normName,
      quantity: qty,
      unit,
      confidence: conf,
      calories: nutrition.calories,
      proteinG: nutrition.proteinG,
      carbsG: nutrition.carbsG,
      fatG: nutrition.fatG,
      fiberG: nutrition.fiberG
    };
  });

  // Duplicate Consolidation
  const { items: consolidatedItems } = detectAndMergeDuplicates(normalizedItems as any);

  // Sum Up Total Nutrition Across ALL Foods
  let totalCals: number | null = 0;
  let totalP: number | null = 0;
  let totalC: number | null = 0;
  let totalF: number | null = 0;

  for (const item of consolidatedItems) {
    const cals = item.calories ?? null;
    const prot = item.proteinG ?? null;
    const carbs = item.carbsG ?? null;
    const fat = item.fatG ?? null;

    if (cals === null) totalCals = null;
    else if (totalCals !== null) totalCals += cals;

    if (prot === null) totalP = null;
    else if (totalP !== null) totalP += prot;

    if (carbs === null) totalC = null;
    else if (totalC !== null) totalC += carbs;

    if (fat === null) totalF = null;
    else if (totalF !== null) totalF += fat;
  }

  const overallConfidence = extractedResult.confidence ?? 0.9;
  let finalIntent: any = 'meal';
  let clarificationQuestion: string | null = extractedResult.clarificationQuestion || null;

  if (overallConfidence < 0.6) {
    finalIntent = 'ambiguous';
    clarificationQuestion = 'Could you specify the exact food item?';
  }

  const detectedMealType: MealCategory = extractedResult.mealType || mealType;

  return {
    intent: finalIntent,
    confidence: overallConfidence,
    clarificationQuestion,
    summaryText: `Logged ${detectedMealType.toUpperCase()}: ${consolidatedItems.map((i) => `${i.name} ×${i.quantity} ${i.unit}`).join(', ')}`,
    mealData: {
      mealType: detectedMealType,
      title: consolidatedItems.map((i) => `${i.name} ×${i.quantity} ${i.unit}`).join(', '),
      totalCalories: totalCals,
      totalProteinG: totalP,
      totalCarbsG: totalC,
      totalFatG: totalF,
      totalFiberG: 5,
      items: consolidatedItems,
      loggedAt: new Date().toISOString()
    }
  };
}

function parseLocalExtraction(text: string, defaultMealType: MealCategory): any {
  const lower = text.toLowerCase();

  // Water
  if (lower.includes('water') || lower.includes('litre') || lower.includes('liter') || lower.includes('ml')) {
    let amountMl = 500;
    const match = lower.match(/(\d+(\.\d+)?)\s*(l|litre|liter|ml)/i);
    if (match) {
      let val = parseFloat(match[1]);
      if (match[3].startsWith('l')) val = val * 1000;
      amountMl = Math.round(val);
    }
    return { intent: 'water', confidence: 0.95, waterData: { amountMl } };
  }

  // Weight
  if (lower.includes('weight') || lower.includes('kg') || lower.includes('weigh')) {
    let weightKg = 75;
    const match = lower.match(/(\d+(\.\d+)?)/);
    if (match) weightKg = parseFloat(match[1]);
    return { intent: 'weight', confidence: 0.92, weightData: { weightKg } };
  }

  // Sleep
  if (lower.includes('slept') || lower.includes('sleep')) {
    let durationHours = 7;
    const match = lower.match(/(\d+(\.\d+)?)/);
    if (match) durationHours = parseFloat(match[1]);
    return { intent: 'sleep', confidence: 0.9, sleepData: { durationHours } };
  }

  // Workout
  if (lower.includes('workout') || lower.includes('treadmill') || lower.includes('chest') || lower.includes('run')) {
    let durationMinutes = 45;
    const match = lower.match(/(\d+)\s*(min|mins|minutes)/i);
    if (match) durationMinutes = parseInt(match[1], 10);
    return {
      intent: 'workout',
      confidence: 0.94,
      workoutData: { title: lower.includes('treadmill') ? 'Treadmill Run' : 'Workout Session', category: 'strength', durationMinutes }
    };
  }

  // Extract ALL foods from text without dropping any
  const foods: any[] = [];

  if (lower.includes('oat') || lower.includes('ഓട്സ്')) {
    const match = lower.match(/(one|a|two|three|1|2|3)\s*(cup|cups|g|gram|grams)?\s*(oat|oats|ഓട്സ്)/i);
    let qty = 1;
    if (match) {
      if (match[1] === 'one' || match[1] === 'a') qty = 1;
      else if (match[1] === 'two') qty = 2;
      else if (match[1] === 'three') qty = 3;
      else qty = parseInt(match[1], 10) || 1;
    }
    const unit = match && match[2] ? match[2] : 'cup';
    foods.push({ name: 'oats', quantity: qty, unit, confidence: 0.96 });
  }

  if (lower.includes('egg') || lower.includes('മുട്ട')) {
    const match = lower.match(/(one|a|two|three|four|1|2|3|4)\s*(boiled\s+)?(egg|eggs|മുട്ട)/i);
    let qty = 3;
    if (match) {
      if (match[1] === 'one' || match[1] === 'a') qty = 1;
      else if (match[1] === 'two') qty = 2;
      else if (match[1] === 'three') qty = 3;
      else if (match[1] === 'four') qty = 4;
      else qty = parseInt(match[1], 10) || 3;
    }
    foods.push({ name: 'boiled egg', quantity: qty, unit: 'piece', confidence: 0.98 });
  }

  if (lower.includes('chapati') || lower.includes('ചപ്പാത്തി')) {
    const match = lower.match(/(\d+)\s*(chapati|chapatis|ചപ്പാത്തി)/i);
    foods.push({ name: 'chapati', quantity: match ? parseInt(match[1], 10) : 2, unit: 'piece', confidence: 0.95 });
  }

  if (lower.includes('chicken') || lower.includes('ചിക്കൻ')) {
    foods.push({ name: 'chicken', quantity: 150, unit: 'g', confidence: 0.92 });
  }

  if (lower.includes('biryani')) {
    foods.push({ name: 'biryani', quantity: 1, unit: 'serving', confidence: 0.88 });
  }

  if (lower.includes('whey')) {
    const match = lower.match(/(\d+)\s*(scoop|scoops)?\s*whey/i);
    foods.push({ name: 'whey', quantity: match ? parseInt(match[1], 10) : 1, unit: 'scoop', confidence: 0.98 });
  }

  if (lower.includes('almond') || lower.includes('almonds')) {
    const match = lower.match(/(\d+)\s*(g|gram|grams)?\s*almond/i);
    foods.push({ name: 'almond', quantity: match ? parseInt(match[1], 10) : 25, unit: 'g', confidence: 0.95 });
  }

  if (foods.length === 0) {
    foods.push({ name: text, quantity: 1, unit: 'serving', confidence: 0.85 });
  }

  return { intent: 'meal', confidence: 0.9, mealType: defaultMealType, foods };
}
