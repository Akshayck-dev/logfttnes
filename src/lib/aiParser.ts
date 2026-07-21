import { AiDetectedEntity } from '../types';

export function parseNaturalLanguageInput(input: string): AiDetectedEntity {
  const text = input.trim().toLowerCase();
  
  // 1. Detect Water Intent
  const waterMatch = text.match(/(\d+)\s*(ml|l|liter|liters|ounces|oz)/i);
  if (waterMatch || text.includes('water') || text.includes('drank') || text.includes('hydrated')) {
    let amountMl = 250;
    if (waterMatch) {
      let num = parseFloat(waterMatch[1]);
      const unit = waterMatch[2].toLowerCase();
      if (unit.startsWith('l')) num = num * 1000;
      else if (unit.includes('oz')) num = Math.round(num * 29.57);
      amountMl = Math.round(num);
    } else {
      const plainNum = text.match(/(\d+)/);
      if (plainNum) amountMl = parseInt(plainNum[1], 10);
    }

    return {
      intent: 'water',
      confidence: 0.95,
      summaryText: `Logged ${amountMl}ml of water intake`,
      waterData: {
        amountMl,
        loggedAt: new Date().toISOString()
      }
    };
  }

  // 2. Detect Weight Intent
  const weightMatch = text.match(/(\d+(\.\d+)?)\s*(kg|kgs|kilo|kilos|lbs|pound|pounds)/i) || text.match(/(weight|weigh|weighed)\s*(is|was)?\s*(\d+(\.\d+)?)/i);
  if (weightMatch || text.includes('weighed') || text.includes('scale')) {
    let weightKg = 75;
    if (weightMatch) {
      const numStr = weightMatch[1] && !isNaN(parseFloat(weightMatch[1])) ? weightMatch[1] : weightMatch[3];
      let val = parseFloat(numStr || '75');
      if (text.includes('lb') || text.includes('pound')) {
        val = val * 0.453592;
      }
      weightKg = Math.round(val * 10) / 10;
    }

    return {
      intent: 'weight',
      confidence: 0.92,
      summaryText: `Recorded current weight: ${weightKg} kg`,
      weightData: {
        weightKg,
        loggedAt: new Date().toISOString()
      }
    };
  }

  // 3. Detect Sleep Intent
  const sleepMatch = text.match(/(\d+(\.\d+)?)\s*(hrs|hr|hours|hour)/i) || text.includes('slept') || text.includes('sleep');
  if (sleepMatch) {
    let durationHours = 8.0;
    if (sleepMatch) {
      const numMatch = text.match(/(\d+(\.\d+)?)/);
      if (numMatch) durationHours = parseFloat(numMatch[1]);
    }

    let qualityScore = 4;
    if (text.includes('great') || text.includes('deep') || text.includes('amazing')) qualityScore = 5;
    if (text.includes('bad') || text.includes('poor') || text.includes('tired')) qualityScore = 2;

    return {
      intent: 'sleep',
      confidence: 0.9,
      summaryText: `Logged ${durationHours} hrs sleep (Quality: ${qualityScore}/5)`,
      sleepData: {
        durationHours,
        qualityScore,
        sleepTime: new Date(Date.now() - durationHours * 3600 * 1000).toISOString(),
        wakeTime: new Date().toISOString(),
        loggedAt: new Date().toISOString().split('T')[0]
      }
    };
  }

  // 4. Detect Workout Intent
  if (text.includes('workout') || text.includes('gym') || text.includes('ran') || text.includes('cardio') || text.includes('squat') || text.includes('bench') || text.includes('completed') || text.includes('sets') || text.includes('exercise')) {
    let category: any = 'strength';
    let durationMinutes = 45;
    let caloriesBurned = 320;
    let title = 'Workout Session';

    if (text.includes('chest')) title = 'Chest & Triceps Workout';
    else if (text.includes('back')) title = 'Back & Biceps Hypertrophy';
    else if (text.includes('leg') || text.includes('squat')) title = 'Leg Day Workout';
    else if (text.includes('shoulder')) title = 'Shoulders & Arms Focus';
    else if (text.includes('cardio') || text.includes('run')) {
      title = 'Cardio Session';
      category = 'cardio';
      caloriesBurned = 400;
    } else if (text.includes('yoga') || text.includes('stretch')) {
      title = 'Yoga & Flexibility';
      category = 'yoga';
      caloriesBurned = 180;
    }

    const durMatch = text.match(/(\d+)\s*(min|mins|minutes)/i);
    if (durMatch) {
      durationMinutes = parseInt(durMatch[1], 10);
      caloriesBurned = Math.round(durationMinutes * 7.5);
    }

    return {
      intent: 'workout',
      confidence: 0.94,
      summaryText: `Logged ${title} (${durationMinutes} mins, ~${caloriesBurned} kcal burned)`,
      workoutData: {
        title,
        category,
        durationMinutes,
        caloriesBurned,
        loggedAt: new Date().toISOString(),
        exercises: [
          {
            id: 'ex-1',
            exerciseName: title.split(' ')[0] + ' Main Movement',
            setsCount: 4,
            repsCount: 10,
            weightKg: 60
          }
        ]
      }
    };
  }

  // 5. Default: Treat as Meal Intent
  let mealType: any = 'lunch';
  const hour = new Date().getHours();
  if (hour < 11) mealType = 'breakfast';
  else if (hour < 16) mealType = 'lunch';
  else if (hour < 21) mealType = 'dinner';
  else mealType = 'snack';

  if (text.includes('breakfast')) mealType = 'breakfast';
  if (text.includes('lunch')) mealType = 'lunch';
  if (text.includes('dinner')) mealType = 'dinner';
  if (text.includes('snack')) mealType = 'snack';

  // Estimate macros based on common keywords
  let cals = 450;
  let protein = 32;
  let carbs = 45;
  let fat = 14;

  if (text.includes('egg')) { cals += 150; protein += 14; fat += 10; }
  if (text.includes('chicken') || text.includes('meat') || text.includes('steak')) { cals += 220; protein += 35; fat += 8; }
  if (text.includes('oat') || text.includes('rice') || text.includes('bread')) { cals += 200; carbs += 40; }
  if (text.includes('shake') || text.includes('protein')) { cals += 180; protein += 28; }
  if (text.includes('salad') || text.includes('fruit')) { cals += 120; carbs += 20; }

  const cleanTitle = input.charAt(0).toUpperCase() + input.slice(1);

  return {
    intent: 'meal',
    confidence: 0.88,
    summaryText: `Logged ${mealType.toUpperCase()}: "${cleanTitle}" (~${cals} kcal, ${protein}g P, ${carbs}g C, ${fat}g F)`,
    mealData: {
      mealType,
      title: cleanTitle,
      totalCalories: cals,
      totalProteinG: protein,
      totalCarbsG: carbs,
      totalFatG: fat,
      totalFiberG: 6,
      loggedAt: new Date().toISOString(),
      items: [
        {
          id: 'item-1',
          name: cleanTitle,
          quantity: 1,
          unit: 'serving',
          calories: cals,
          proteinG: protein,
          carbsG: carbs,
          fatG: fat,
          fiberG: 6
        }
      ]
    }
  };
}
