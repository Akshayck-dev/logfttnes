import { AiDetectedEntity } from '../types';

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
};

export async function parseWithGeminiFlash(transcript: string): Promise<AiDetectedEntity> {
  const apiKey = getApiKey();
  const text = (transcript || '').trim();

  if (!text) {
    return {
      intent: 'unknown',
      confidence: 0,
      summaryText: 'No text provided.'
    };
  }

  // System Prompt with Strict Quantities, Per-Item Confidence, and NO Fake Calories
  const systemPrompt = `You are FitLog AI's Precision Food & Fitness Entity Parser.

Analyze this natural language input: "${text}"

STRICT RULES:
1. Identify exact foods and quantities mentioned (e.g., "3 eggs", "50g oats", "1 cup rice").
2. Do NOT invent calories or macros. If calories/macros are uncertain, return them as null.
3. Return confidence score (0.0 to 1.0) for each detected food item.
4. If overall confidence < 0.75 or input is ambiguous, set "intent": "ambiguous" and provide ONE clarification question in "clarificationQuestion".
5. Return ONLY raw valid JSON. Never output Markdown blocks, explanations, or prose text.

JSON SCHEMA:
{
  "intent": "meal" | "workout" | "weight" | "water" | "sleep" | "ambiguous",
  "confidence": number,
  "summaryText": "Human readable log summary",
  "clarificationQuestion": string | null,
  "mealData": {
    "mealType": "breakfast" | "lunch" | "dinner" | "snack",
    "title": string,
    "totalCalories": number | null,
    "totalProteinG": number | null,
    "totalCarbsG": number | null,
    "totalFatG": number | null,
    "totalFiberG": number | null,
    "items": [
      {
        "name": string,
        "quantity": number,
        "unit": string,
        "calories": number | null,
        "proteinG": number | null,
        "carbsG": number | null,
        "fatG": number | null,
        "confidence": number
      }
    ]
  },
  "workoutData": {
    "title": string,
    "category": "strength" | "cardio" | "hiit" | "yoga",
    "durationMinutes": number,
    "caloriesBurned": number | null
  },
  "weightData": { "weightKg": number },
  "waterData": { "amountMl": number },
  "sleepData": { "durationHours": number, "qualityScore": number }
}`;

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
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            intent: parsed.intent || 'meal',
            confidence: parsed.confidence ?? 0.9,
            summaryText: parsed.summaryText || `Logged: ${text}`,
            mealData: parsed.mealData,
            workoutData: parsed.workoutData,
            weightData: parsed.weightData,
            waterData: parsed.waterData,
            sleepData: parsed.sleepData
          };
        }
      }
    } catch (error) {
      console.warn('Gemini Flash API request failed, falling back:', error);
    }
  }

  // Local Fallback Parser
  return parseLocalFallback(text);
}

function parseLocalFallback(text: string): AiDetectedEntity {
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
    return {
      intent: 'water',
      confidence: 0.95,
      summaryText: `Logged ${amountMl}ml water`,
      waterData: { amountMl, loggedAt: new Date().toISOString() }
    };
  }

  // Weight
  if (lower.includes('weight') || lower.includes('kg') || lower.includes('weigh')) {
    let weightKg = 75;
    const match = lower.match(/(\d+(\.\d+)?)/);
    if (match) weightKg = parseFloat(match[1]);
    return {
      intent: 'weight',
      confidence: 0.92,
      summaryText: `Recorded weight: ${weightKg} kg`,
      weightData: { weightKg, loggedAt: new Date().toISOString() }
    };
  }

  // Sleep
  if (lower.includes('slept') || lower.includes('sleep')) {
    let durationHours = 7;
    const match = lower.match(/(\d+(\.\d+)?)/);
    if (match) durationHours = parseFloat(match[1]);
    return {
      intent: 'sleep',
      confidence: 0.9,
      summaryText: `Logged ${durationHours} hrs sleep`,
      sleepData: { durationHours, qualityScore: 4, sleepTime: '', wakeTime: '', loggedAt: new Date().toISOString().split('T')[0] }
    };
  }

  // Workout
  if (lower.includes('workout') || lower.includes('chest') || lower.includes('run') || lower.includes('squat')) {
    let durationMinutes = 45;
    const match = lower.match(/(\d+)\s*(min|mins|minutes)/i);
    if (match) durationMinutes = parseInt(match[1], 10);
    return {
      intent: 'workout',
      confidence: 0.94,
      summaryText: `Logged workout (${durationMinutes} mins)`,
      workoutData: {
        title: 'Workout Session',
        category: 'strength',
        durationMinutes,
        caloriesBurned: null,
        loggedAt: new Date().toISOString(),
        exercises: []
      }
    };
  }

  // Meal Fallback
  return {
    intent: 'meal',
    confidence: 0.85,
    summaryText: `Logged Meal: "${text}"`,
    mealData: {
      mealType: 'lunch',
      title: text.charAt(0).toUpperCase() + text.slice(1),
      totalCalories: null,
      totalProteinG: null,
      totalCarbsG: null,
      totalFatG: null,
      totalFiberG: null,
      loggedAt: new Date().toISOString(),
      items: [
        {
          name: text,
          quantity: 1,
          unit: 'serving',
          calories: null,
          proteinG: null,
          carbsG: null,
          fatG: null,
          confidence: 0.85
        }
      ]
    }
  };
}
