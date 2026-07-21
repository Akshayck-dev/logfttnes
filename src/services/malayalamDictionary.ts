// Malayalam Food Name Dictionary & Translator
export const malayalamFoodMap: Record<string, string> = {
  'മുട്ട': 'egg',
  'മുട്ടയും': 'egg',
  'ഓട്സ്': 'oats',
  'ഓട്സും': 'oats',
  'ചപ്പാത്തി': 'chapati',
  'ചപ്പാത്തിയും': 'chapati',
  'ദോശ': 'dosa',
  'ഇഡലി': 'idli',
  'ചോറ്': 'rice',
  'ചോറും': 'rice',
  'ചിക്കൻ': 'chicken',
  'ചിക്കനും': 'chicken',
  'മീൻ': 'fish',
  'ബീഫ്': 'beef',
  'പുട്ട്': 'puttu',
  'കടല': 'kadala',
  'അപ്പം': 'appam',
  'പഴം': 'banana',
  'രാവിലെ': 'breakfast',
  'ഉച്ചയ്ക്ക്': 'lunch',
  'രാത്രി': 'dinner',
  'കപ്പ്': 'cup',
  'വെള്ളം': 'water'
};

export function translateMalayalamToEnglish(text: string): string {
  let translated = text;
  Object.keys(malayalamFoodMap).forEach((malWord) => {
    const regex = new RegExp(malWord, 'g');
    translated = translated.replace(regex, malayalamFoodMap[malWord]);
  });
  return translated;
}
