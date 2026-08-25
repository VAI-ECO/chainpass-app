import { bandFromSimilarity, type Band } from "./band-compare.ts";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`vector length mismatch (${a.length} vs ${b.length})`);
  }
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  if (denom === 0) return 0;
  const similarity = dot / denom;
  if (similarity > 1) return 1;
  if (similarity < -1) return -1;
  return similarity;
}

/**
 * Frame two against frame one. Uses settings band floors — no invented merge.
 */
export function compareFrameTwoAgainstFrameOne(
  frameOne: number[],
  frameTwo: number[],
  greenMin: number,
  yellowMin: number
): { band: Band; frames_compared: true } {
  if (frameOne.length !== 512 || frameTwo.length !== 512) {
    throw new Error(
      `expected 512-float embeddings, got ${frameOne.length} and ${frameTwo.length}`
    );
  }
  if (yellowMin > greenMin) {
    throw new Error("settings.band_yellow_min must be <= settings.band_green_min");
  }
  const similarity = cosineSimilarity(frameOne, frameTwo);
  return {
    band: bandFromSimilarity(similarity, greenMin, yellowMin),
    frames_compared: true,
  };
}
