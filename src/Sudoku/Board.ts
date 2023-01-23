import { randomOrderArray } from '../GenericGame/Utils';
import {
  GridPosition,
  GridPositionEqual,
  GridPositionGenerateRandom,
} from '../GenericModels/Grid';

type CellData =
  | { locked: true; value: number }
  | { locked?: false; value?: number };

export type CellBrush = { kind: 'solution'; digit?: number };

export default class SudokuBoard {
  public readonly blockSize = 3;
  public readonly blockCount = 3;
  public readonly digitSet: number[] = [
    ...Array(this.blockSize * this.blockCount).keys(),
  ];

  public readonly rowCount = this.blockSize * this.blockCount;
  public readonly columnCount = this.blockSize * this.blockCount;

  public readonly cellData: CellData[];

  /*
   * Creating Boards
   */

  constructor(cellData?: CellData[]) {
    this.cellData =
      cellData ??
      Array.from({ length: this.rowCount * this.columnCount }, () => ({}));
  }

  static withExampleData(data: (number | undefined)[]) {
    return new SudokuBoard(
      data.map((value) => {
        return value === undefined
          ? {}
          : {
              value,
              locked: true,
            };
      })
    );
  }

  withBrushAppliedToCell(position: GridPosition, brush: CellBrush) {
    let data = this.at(position);
    if (data.locked) {
      return this;
    }

    if (brush.kind === 'solution') {
      data.value = brush.digit;
    }

    return this.withCellDataAtPosition(position, data);
  }

  /*
   * Querying Data
   */

  withCellDataAtPosition(position: GridPosition, data: CellData) {
    const cellData = this.cellData.slice();
    cellData[this.#gridPositionToLinearIndex(position)] = data;
    return new SudokuBoard(cellData);
  }

  at(position: GridPosition): CellData {
    return this.cellData[this.#gridPositionToLinearIndex(position)];
  }

  #gridPositionToLinearIndex(g: GridPosition) {
    return this.columnCount * g.row + g.column;
  }

  #linearIndexToGridPosition(idx: number) {
    return {
      row: Math.floor(idx / this.columnCount),
      column: idx % this.columnCount,
    };
  }

  *rowIndices() {
    for (let row = 0; row < this.rowCount; row++) {
      yield row;
    }
  }

  *columnIndices() {
    for (let column = 0; column < this.columnCount; column++) {
      yield column;
    }
  }

  *cells() {
    for (const row of this.rowIndices()) {
      yield* this.cellsInRow(row);
    }
  }

  *cellsInRow(row: number) {
    for (const column of this.columnIndices()) {
      const p = { row, column };
      yield { position: p, data: this.at(p) };
    }
  }

  *cellsInColumn(column: number) {
    for (const row of this.rowIndices()) {
      const p = { row, column };
      yield { position: p, data: this.at(p) };
    }
  }

  *cellsInBlock(position: { blockRow: number; blockColumn: number }) {
    const { blockRow, blockColumn } = position;
    const { blockSize } = this;

    for (
      let row = blockRow * blockSize;
      row < (blockRow + 1) * blockSize;
      row++
    ) {
      for (
        let column = blockColumn * blockSize;
        column < (blockColumn + 1) * blockSize;
        column++
      ) {
        const p = { row, column };
        yield { position: p, data: this.at(p) };
      }
    }
  }

  #cellBlockForPosition(position: GridPosition): {
    blockRow: number;
    blockColumn: number;
  } {
    return {
      blockRow: Math.floor(position.row / this.blockSize),
      blockColumn: Math.floor(position.column / this.blockSize),
    };
  }

  /*
   * Checking Sudoku Rules
   */

  isCellValid(pos: GridPosition): boolean {
    const { value, locked } = this.at(pos);
    if (value === undefined || locked) {
      return true;
    }

    for (const { data, position } of this.cellsInRow(pos.row)) {
      if (!GridPositionEqual(position, pos) && data.value === value) {
        return false;
      }
    }

    for (const { data, position } of this.cellsInColumn(pos.column)) {
      if (!GridPositionEqual(position, pos) && data.value === value) {
        return false;
      }
    }

    for (const { data, position } of this.cellsInBlock(
      this.#cellBlockForPosition(pos)
    )) {
      if (!GridPositionEqual(position, pos) && data.value === value) {
        return false;
      }
    }

    return true;
  }

  #cellsAreValid(
    iterator: Iterable<{ position: GridPosition; data: CellData }>
  ) {
    let indices = new Set<number>();
    for (const { data } of iterator) {
      if (data.value !== undefined) {
        if (indices.has(data.value)) {
          return false;
        } else {
          indices.add(data.value);
        }
      }
    }
    return true;
  }

  validateBoard() {
    for (const row of this.rowIndices()) {
      if (!this.#cellsAreValid(this.cellsInRow(row))) {
        return false;
      }
    }

    for (const column of this.columnIndices()) {
      if (!this.#cellsAreValid(this.cellsInColumn(column))) {
        return false;
      }
    }

    for (let blockRow = 0; blockRow < this.blockCount; blockRow++) {
      for (let blockColumn = 0; blockColumn < this.blockCount; blockColumn++) {
        if (
          !this.#cellsAreValid(this.cellsInBlock({ blockRow, blockColumn }))
        ) {
          return false;
        }
      }
    }

    return true;
  }

  isSolved() {
    return this.boardFilledIn() && this.validateBoard();
  }

  #fillCount() {
    return this.cellData.reduce(
      (accum, data) => accum + (data.value === undefined ? 0 : 1),
      0
    );
  }

  boardFilledIn() {
    return this.#fillCount() === this.rowCount * this.columnCount;
  }

  solutionStatus(): 'unique' | 'multiple' | 'none' {
    let count = 0;

    for (const _ of this.solutions()) {
      count++;

      if (count > 1) {
        return 'multiple';
      }
    }

    return count === 1 ? 'unique' : 'none';
  }

  /*
   * Enumerating Valid / Solved boards
   */

  *#validBoardsFillingInNextEmptySpot(
    lockCell?: boolean
  ): Generator<SudokuBoard> {
    const emptySpot = this.#nextEmptyPosition();

    if (!emptySpot) {
      return;
    }

    const iter = this.#validEntriesForOpenPositionInRandomOrder(emptySpot);

    for (const value of iter) {
      const board = this.withCellDataAtPosition(emptySpot, {
        value,
        locked: lockCell,
      });

      if (board.validateBoard()) {
        yield board;
      }
    }
  }

  *#validBoardsRecursive(): Generator<SudokuBoard> {
    yield this;

    for (const board of this.#validBoardsFillingInNextEmptySpot()) {
      yield* board.#validBoardsRecursive();
    }
  }

  *solutions() {
    for (const board of this.#validBoardsRecursive()) {
      if (board.boardFilledIn()) {
        yield board;
      }
    }
  }

  #nextEmptyPosition(): GridPosition | undefined {
    if (this.boardFilledIn()) {
      return undefined;
    }

    return this.#linearIndexToGridPosition(
      this.cellData.findIndex((d) => d.value === undefined)
    );
  }

  #validEntriesForOpenPosition(position: GridPosition): Set<number> {
    const possibilites = new Set<number>(this.digitSet);

    const remove = (data: CellData) => {
      if (data.value !== undefined) {
        possibilites.delete(data.value);
      }
    };

    for (const { data } of this.cellsInRow(position.row)) {
      remove(data);
    }

    for (const { data } of this.cellsInColumn(position.column)) {
      remove(data);
    }

    for (const { data } of this.cellsInBlock(
      this.#cellBlockForPosition(position)
    )) {
      remove(data);
    }

    return possibilites;
  }

  #validEntriesForOpenPositionInRandomOrder(position: GridPosition): number[] {
    return randomOrderArray(this.#validEntriesForOpenPosition(position));
  }

  static #generateSolvedBoard(): SudokuBoard {
    for (const b of new SudokuBoard().solutions()) {
      return b;
    }

    return undefined as any;
  }

  #lockFilledCells() {
    return new SudokuBoard(
      this.cellData.map((data) => {
        return data.value === undefined
          ? {}
          : { value: data.value, locked: true };
      })
    );
  }

  static generateRandom(difficultyLevel: number = 0.25): SudokuBoard {
    let board = this.#generateSolvedBoard();

    for (let i = 0; i < 100 * difficultyLevel; i++) {
      const pos = GridPositionGenerateRandom(board.rowCount, board.columnCount);
      const data = board.at(pos);
      if (data.value !== undefined) {
        const newBoard = board.withCellDataAtPosition(pos, {});
        if (newBoard.solutionStatus() === 'unique') {
          board = newBoard;
        }
      }
    }

    return board.#lockFilledCells();
  }
}
