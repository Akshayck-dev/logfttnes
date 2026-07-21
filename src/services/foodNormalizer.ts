import { translateMalayalamToEnglish } from './malayalamDictionary';

export function normalizeFoodName(foodName: string): string {
  let clean = (foodName || '').trim().toLowerCase();
  
  // Translate Malayalam terms if present
  clean = translateMalayalamToEnglish(clean);

  // Plural to Singular Normalization
  if (clean.endsWith('eggs')) clean = 'egg';
  else if (clean === 'eggs') clean = 'egg';
  else if (clean.endsWith('chapatis') || clean.endsWith('chapattis')) clean = 'chapati';
  else if (clean.endsWith('rotis')) clean = 'roti';
  else if (clean.endsWith('dosas')) clean = 'dosa';
  else if (clean.endsWith('idlis')) clean = 'idli';
  else if (clean.endsWith('bananas')) clean = 'banana';
  else if (clean.endsWith('apples')) clean = 'apple';
  else if (clean.endsWith('almonds')) clean = 'almond';

  return clean;
}
