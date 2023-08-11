import { GridPosition } from '../../GenericModels/Grid';
import { FoldResult, Triangle, oppositeRotation } from './TrianglesGameLogic';

export type PatternPos = {
  layer: number;
} & GridPosition;

type GridLayer = (Cell | null)[][];
type Cell = {
  triangle1: Triangle;
  triangle2?: Triangle;
};

export class PatternData {
  #layers: GridLayer[] = [];
  #gridSize: number;

  constructor(gridSize: number) {
    this.#gridSize = gridSize;
    this.#layers = [this.createEmptyLayer(this.#gridSize)];
  }

  get layersCount() {
    return this.#layers.length;
  }

  getCell(pos: PatternPos) {
    return this.#layers[pos.layer][pos.row][pos.column];
  }

  reset() {
    this.#layers = [this.createEmptyLayer(this.#gridSize)];
  }

  canAddFoldResult(foldResult: FoldResult) {
    const { pos, triangle } = foldResult;
    const { layer, row, column } = pos;
    if (layer >= 0 && layer < this.#layers.length) {
      if (row < 0 || row >= this.#gridSize || column < 0 || column >= this.#gridSize) {
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

  addFoldResult(foldResult: FoldResult) {
    const { pos, triangle } = foldResult;
    const { row, column } = pos;
    let l = pos.layer;

    if (l === this.#layers.length) {
      this.#layers.push(this.createEmptyLayer(this.#gridSize));
    } else if (l === -1) {
      this.#layers.unshift(this.createEmptyLayer(this.#gridSize));
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
  }

  private createEmptyLayer(gridSize: number) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null));
  }
}
