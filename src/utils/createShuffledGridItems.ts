import { GRID_SIZE } from "./gridHover";

/** Fisher-Yates シャッフル */
function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * A を (GRID_SIZE * GRID_SIZE - 1) 個、B を 1 個含む配列をランダムに並び替えて返す。
 */
export function createShuffledGridItems(a: string, b: string): string[] {
  const items = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, () => a);
  items.push(b);
  return shuffle(items);
}
