import { parseWithGeminiFlash } from '../services/geminiService';
import { AiDetectedEntity } from '../types';

export { parseWithGeminiFlash };

export async function parseNaturalLanguageWithGemini(input: string): Promise<AiDetectedEntity> {
  return parseWithGeminiFlash(input);
}

export function parseNaturalLanguageInput(input: string): AiDetectedEntity {
  return {
    intent: 'meal',
    confidence: 0.85,
    summaryText: `Parsed: ${input}`
  };
}

export function parseTranscriptToJSON(transcript: string) {
  return parseWithGeminiFlash(transcript);
}
