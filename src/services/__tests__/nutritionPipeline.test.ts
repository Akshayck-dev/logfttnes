import { parseWithGeminiFlash } from '../geminiService';

async function runPipelineTests() {
  console.log('🧪 Running FitLog AI Meal Parser Bug Fix Validation Suite...\n');

  // Test 1: Morning Oats & Eggs (Must be BREAKFAST and extract BOTH oats & eggs)
  const test1 = await parseWithGeminiFlash('Morning I ate one cup oats and three boiled eggs');
  console.log('Test 1 Result:', JSON.stringify(test1, null, 2));

  const t1Passed =
    test1.intent === 'meal' &&
    test1.mealData?.mealType === 'breakfast' &&
    test1.mealData?.items?.length === 2;

  if (t1Passed) {
    console.log('✅ Test 1 PASSED: "Morning I ate one cup oats and three boiled eggs" -> BREAKFAST with 2 food items!');
  } else {
    console.error('❌ Test 1 FAILED: Expected Breakfast with 2 items.');
  }

  // Test 2: Incomplete fragment "one cup of"
  const test2 = await parseWithGeminiFlash('one cup of');
  const t2Passed = test2.intent === 'ambiguous' && test2.clarificationQuestion?.includes('What food was one');

  if (t2Passed) {
    console.log('✅ Test 2 PASSED: "one cup of" -> Ambiguous with clarification question!');
  } else {
    console.error('❌ Test 2 FAILED: Expected clarification question for incomplete input.');
  }

  console.log(`\n📊 Test Result: ${t1Passed && t2Passed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}\n`);
}

runPipelineTests();
