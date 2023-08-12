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
  #startClockwise?: boolean;
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
    this.#startClockwise = undefined;
    this.#prevResult = undefined;
  }

  canAddFoldResult(foldResult: FoldResult) {
    const { pos, triangle } = foldResult;
    const { layer, row, column } = pos;
    if (layer >= 0 && layer < this.#layers.length) {
      if (row < 0 || row >= this.gridSize || column < 0 || column >= this.gridSize) {
        return false;
      }
      const cell = this.#layers[layer][row][column];
      if (!cell) {
        return true;
      } else if (!cell.triangle2) {
        return triangle.rotation === oppositeRotation(cell.triangle1.rotation);
      }
      return false;
    }
    return true;
  }

  addFoldResult(foldResult: FoldResult, fold: FoldDirection) {
    const { pos, triangle } = foldResult;
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
    if (!this.#startClockwise) this.#startClockwise = triangle.clockwise;
    this.#prevResult = foldResult;
  }

  debugDescription() {
    return patternDescription(this.#folds, this.#startClockwise!);
  }

  private createEmptyLayer(gridSize: number) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null));
  }
}
