/**
 * Utility for normalizing video game titles and calculating fuzzy similarity
 * to match game titles across different storefronts (Steam, eShop, PS Store, Xbox, etc.).
 */

export function cleanTitle(rawTitle: string): string {
  if (!rawTitle) return '';

  return rawTitle
    .toLowerCase()
    // Replace special symbols and punctuation with spaces
    .replace(/[(TM)(R)(C):,\-----_.'!&]/g, ' ')
    // Remove common edition noise terms to match base titles
    .replace(/\b(standard|deluxe|ultimate|gold|goty|game of the year|definitive|remastered|enhanced|digital|edition|bundle|pack)\b/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates string similarity using Sorensen-Dice coefficient (bigram matching).
 * Returns a value between 0.0 (completely different) and 1.0 (exact match).
 */
export function stringSimilarity(str1: string, str2: string): number {
  const s1 = cleanTitle(str1);
  const s2 = cleanTitle(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  if (s1.length < 2 || s2.length < 2) return s1 === s2 ? 1.0 : 0.0;

  const getBigrams = (text: string): Map<string, number> => {
    const bigrams = new Map<string, number>();
    for (let i = 0; i < text.length - 1; i++) {
      const bigram = text.slice(i, i + 2);
      const count = bigrams.get(bigram) || 0;
      bigrams.set(bigram, count + 1);
    }
    return bigrams;
  };

  const map1 = getBigrams(s1);
  const map2 = getBigrams(s2);

  let intersection = 0;
  map1.forEach((count1, bigram) => {
    const count2 = map2.get(bigram);
    if (count2) {
      intersection += Math.min(count1, count2);
    }
  });

  const totalBigrams = (s1.length - 1) + (s2.length - 1);
  return (2.0 * intersection) / totalBigrams;
}

/**
 * Checks if two title strings match with a given similarity threshold (default 0.75).
 */
export function isTitleMatch(titleA: string, titleB: string, threshold = 0.75): boolean {
  if (cleanTitle(titleA) === cleanTitle(titleB)) return true;
  return stringSimilarity(titleA, titleB) >= threshold;
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
