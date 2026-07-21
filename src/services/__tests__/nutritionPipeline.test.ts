import { parseWithGeminiFlash } from '../geminiService';
import { normalizeFoodName } from '../foodNormalizer';
import { detectAndMergeDuplicates } from '../duplicateDetector';
import { lookupNutrition } from '../nutritionService';

async function runPipelineTests() {
  console.log('🧪 Starting FitLog AI Nutrition & AI Pipeline Test Suite...\n');

  const testCases = [
    { input: '3 eggs and oats', expectedIntent: 'meal', checkFood: 'egg' },
    { input: '2 chapati chicken curry', expectedIntent: 'meal', checkFood: 'chapati' },
    { input: 'half plate biryani', expectedIntent: 'meal', checkFood: 'biryani' },
    { input: '1 scoop whey', expectedIntent: 'meal', checkFood: 'whey' },
    { input: '25g almonds', expectedIntent: 'meal', checkFood: 'almond' },
    { input: '1 litre water', expectedIntent: 'water' },
    { input: '79.4 kg', expectedIntent: 'weight' },
    { input: '45 min treadmill', expectedIntent: 'workout' },
    { input: '7 hours sleep', expectedIntent: 'sleep' },
    { input: 'രാവിലെ 3 മുട്ടയും ഒരു കപ്പ് ഓട്സും', expectedIntent: 'meal', checkFood: 'egg' }
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const result = await parseWithGeminiFlash(tc.input);
      if (result.intent === tc.expectedIntent) {
        console.log(`✅ Test ${i + 1} PASSED: "${tc.input}" -> Intent: ${result.intent}`);
        passed++;
      } else {
        console.error(`❌ Test ${i + 1} FAILED: "${tc.input}" -> Expected: ${tc.expectedIntent}, Got: ${result.intent}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ Test ${i + 1} EXCEPTION: "${tc.input}"`, err);
      failed++;
    }
  }

  console.log(`\n📊 Test Summary: ${passed} PASSED, ${failed} FAILED out of ${testCases.length} tests.\n`);
  return failed === 0;
}

runPipelineTests();
