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

  // System Prompt instructing Gemini 2.5 Flash / 1.5 Flash to act as a strict nutrition & fitness JSON parser
  const systemPrompt = `You are FitLog AI's Senior Nutrition & Fitness Parser (supporting English and Indian foods like Roti, Dal, Paneer, Idli, Dosa, Chicken, Oats, Eggs, Biryani, Chole, etc.).

Analyze this natural language input: "${text}"

RULES:
1. Return ONLY raw valid JSON matching the exact schema below. Never output Markdown blocks, explanations, or prose text.
2. If confidence < 0.75 or intent is ambiguous, set "intent": "ambiguous" and provide ONE clear clarification question in "clarificationQuestion". Do NOT guess arbitrarily.
3. Correctly detect: Meal, Workout, Weight, Water, or Sleep.

JSON SCHEMA:
{
  "intent": "meal" | "workout" | "weight" | "water" | "sleep" | "ambiguous",
  "confidence": number (0.0 to 1.0),
  "summaryText": "Human readable log summary",
  "clarificationQuestion": string | null,
  "mealData": { "mealType": "breakfast"|"lunch"|"dinner"|"snack", "title": string, "totalCalories": number, "totalProteinG": number, "totalCarbsG": number, "totalFatG": number, "totalFiberG": number },
  "workoutData": { "title": string, "category": "strength"|"cardio"|"hiit"|"yoga", "durationMinutes": number, "caloriesBurned": number },
  "weightData": { "weightKg": number },
  "waterData": { "amountMl": number },
  "sleepData": { "durationHours": number, "qualityScore": number }
}`;

  if (apiKey && apiKey !== 'placeholder') {
    try {
      // Endpoint targeting Gemini 2.5 Flash / 1.5 Flash
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
              temperature: 0.1
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
      console.warn('Gemini 2.5 Flash request failed, falling back:', error);
    }
  }

  // Local Regex / NLP Fallback Parser
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
        caloriesBurned: durationMinutes * 8,
        loggedAt: new Date().toISOString(),
        exercises: []
      }
    };
  }

  // Meal (Default fallback with Indian & Global food estimation)
  let cals = 450;
  let p = 30;
  let c = 45;
  let f = 14;

  if (lower.includes('egg')) { cals += 150; p += 14; }
  if (lower.includes('oat')) { cals += 180; c += 35; }
  if (lower.includes('paneer')) { cals += 250; p += 18; f += 16; }
  if (lower.includes('roti') || lower.includes('chapati')) { cals += 120; c += 24; }
  if (lower.includes('dal')) { cals += 160; p += 9; c += 22; }
  if (lower.includes('chicken')) { cals += 220; p += 35; }

  return {
    intent: 'meal',
    confidence: 0.88,
    summaryText: `Logged Meal: "${text}" (~${cals} kcal, ${p}g P, ${c}g C, ${f}g F)`,
    mealData: {
      mealType: 'lunch',
      title: text.charAt(0).toUpperCase() + text.slice(1),
      totalCalories: cals,
      totalProteinG: p,
      totalCarbsG: c,
      totalFatG: f,
      totalFiberG: 6,
      loggedAt: new Date().toISOString(),
      items: []
    }
  };
}
