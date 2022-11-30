export type GridPosition = {
  row: number;
  column: number;
};

export type GridSize = {
  rowCount: number;
  columnCount: number;
};

export function GridPositionEqual(a: GridPosition, b: GridPosition) {
  return a.row === b.row && a.column === b.column;
}
