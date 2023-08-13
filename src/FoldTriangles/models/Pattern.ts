import { GridPosition } from '../../GenericModels/Grid';
import { patternDescription } from '../utils/patternDescription';
import { FoldDirection, FoldResult, Triangle, oppositeRotation } from './TrianglesGameLogic';
import { assert } from 'console';

export type PatternPos = {
  layer: number;
} & GridPosition;

type GridLayer = (Cell | null)[][];

type Cell = {
  triangle1: Triangle;
  triangle2?: Triangle;
};

export class Pattern {
  readonly gridSize: number;

  #layers: GridLayer[] = [];
  #folds: FoldDirection[] = []; // 5 triangles has 4 folds
  #startClockwise: boolean | null = null; // whether the first triangle is clockwise or not
  #prevResult?: FoldResult;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
    this.reset();
    this.#layers = [this.createEmptyLayer(this.gridSize)];
  }

  get length() {
    return this.#folds.length;
  }

  get layersCount() {
    return this.#layers.length;
  }

  get prevResult() {
    assert(this.#prevResult);
    return this.#prevResult!;
  }

  getCell(pos: PatternPos) {
    return this.#layers[pos.layer][pos.row][pos.column];
  }

  reset() {
    this.#layers = [this.createEmptyLayer(this.gridSize)];
    this.#folds = [];
    this.#startClockwise = null;
    this.#prevResult = undefined;
  }

  canAddFoldResult(foldResult: FoldResult) {
    const { pos, triangle: triangleToAdd, fold } = foldResult;
    const { layer, row, column } = pos;
    if (layer < 0 || layer >= this.#layers.length) {
      return true; // layer does not exist yet
    }
    if (row < 0 || row >= this.gridSize || column < 0 || column >= this.gridSize) {
      return false; // row or column is out of bounds
    }

    // For every layer from current layer to the end in fold direction
    for (let l = layer; l >= 0 && l < this.#layers.length; fold === 0 ? (l = -99) : (l += fold)) {
      const cell = this.#layers[l][row][column];

      if (!cell) {
        continue; // cell is empty -> continue to test next layer
      }
      if (cell.triangle2) {
        return false; // cell is full
      }
      if (triangleToAdd.rotation !== oppositeRotation(cell.triangle1.rotation)) {
        return false;
      }
    }
    return true;
  }

  addFoldResult(foldResult: FoldResult) {
    const { pos, triangle, fold } = foldResult;
    const { row, column } = pos;
    let l = pos.layer;

    if (l === this.#layers.length) {
      this.#layers.push(this.createEmptyLayer(this.gridSize));
    } else if (l === -1) {
      this.#layers.unshift(this.createEmptyLayer(this.gridSize));
      pos.layer = 0;
      l = 0;
    }

    const cell = this.#layers[l][row][column];
    if (!cell) {
      this.#layers[l][row][column] = {
        triangle1: triangle,
      };
    } else if (!cell.triangle2) {
      cell.triangle2 = triangle;
    }

    this.#folds.push(fold);
    if (this.#startClockwise === null) this.#startClockwise = triangle.clockwise;
    this.#prevResult = foldResult;
  }

  // each triangle is supported when it has one of the following:
  // * triangle is layer 0 (supported by the table)
  // * said triangle is reseting on a triangle in the layer directly below.
  //   i.e. In the cell below, we don't have just a single triangle exactly in the opposite rotation
  isValid(): boolean {
    for (let l = 1; l < this.#layers.length; l++) {
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          const cell = this.#layers[l][r][c];
          if (cell) {
            const { triangle1, triangle2 } = cell;
            const pos = { layer: l, row: r, column: c };
            const isSupported =
              this.isTriangleSupported(triangle1, pos) && (!triangle2 || this.isTriangleSupported(triangle2, pos));
            if (!isSupported) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  private isTriangleSupported(triangle: Triangle, pos: PatternPos): boolean {
    const { layer, row, column } = pos;
    assert(layer > 0);

    const cellBelow = this.#layers[layer - 1][row][column];
    if (cellBelow) {
      const nonSupport = oppositeRotation(triangle.rotation);
      if (cellBelow.triangle1.rotation !== nonSupport) return true;
      if (cellBelow.triangle2) return cellBelow.triangle2.rotation !== nonSupport;
    }
    return false;
  }

  debugDescription() {
    return patternDescription(this.#folds, this.#startClockwise!);
  }

  private createEmptyLayer(gridSize: number) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null));
  }
}
