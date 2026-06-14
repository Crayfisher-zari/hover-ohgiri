export const GRID_SIZE = 10;
export const HOVER_RADIUS = 3;

export type GridCoord = {
  row: number;
  col: number;
};

export type AffectedCell = {
  index: number;
  coord: GridCoord;
  /** ホバー中心からのユークリッド距離 */
  distance: number;
  /** 同心円のリング番号（0 = 中心） */
  ring: number;
};

/** 1次元インデックス → グリッド座標 */
export function indexToCoord(index: number): GridCoord {
  return {
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE,
  };
}

/** グリッド座標 → 1次元インデックス */
export function coordToIndex(coord: GridCoord): number {
  return coord.row * GRID_SIZE + coord.col;
}

/** 2点間のユークリッド距離（同心円の判定に使う） */
export function getGridDistance(a: GridCoord, b: GridCoord): number {
  const dr = a.row - b.row;
  const dc = a.col - b.col;
  return Math.hypot(dr, dc);
}

/**
 * ホバーした要素を中心に、影響範囲内の要素を算出する。
 * maxRadius 以内のセルを距離の近い順で返す。
 */
export function getAffectedCells(
  hoveredIndex: number,
  maxRadius = HOVER_RADIUS,
): AffectedCell[] {
  const center = indexToCoord(hoveredIndex);
  const result: AffectedCell[] = [];

  const minRow = Math.max(0, center.row - maxRadius);
  const maxRow = Math.min(GRID_SIZE - 1, center.row + maxRadius);
  const minCol = Math.max(0, center.col - maxRadius);
  const maxCol = Math.min(GRID_SIZE - 1, center.col + maxRadius);

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const coord = { row, col };
      const distance = getGridDistance(center, coord);

      if (distance <= maxRadius) {
        result.push({
          index: coordToIndex(coord),
          coord,
          distance,
          ring: Math.round(distance),
        });
      }
    }
  }

  return result.sort((a, b) => a.distance - b.distance);
}

/** 距離に応じた scale 値（中心ほど大きく、外側ほど 1 に近づく） */
export function getScaleForDistance(
  distance: number,
  maxRadius = HOVER_RADIUS,
  maxScale = 6,
): number {
  if (distance > maxRadius) return 1;
  const falloff = 1 - distance / maxRadius;
  return 1 + (maxScale - 1) * falloff;
}
