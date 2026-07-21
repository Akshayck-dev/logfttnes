import { parseWithGeminiFlash } from '../geminiService';

async function runPipelineTests() {
  console.log('🧪 Testing speech typos "mronig 1 cup oats"...\n');

  const result = await parseWithGeminiFlash('mronig 1 cup oats');
  console.log('Result:', JSON.stringify(result, null, 2));

  const passed =
    result.intent === 'meal' &&
    result.mealData?.mealType === 'breakfast' &&
    result.mealData?.items?.[0]?.name === 'oats';

  if (passed) {
    console.log('✅ PASSED: "mronig 1 cup oats" -> BREAKFAST with clean item name "oats"!');
  } else {
    console.error('❌ FAILED: Expected Breakfast with clean item "oats".');
  }
}

runPipelineTests();
