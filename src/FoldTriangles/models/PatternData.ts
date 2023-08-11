import { GridPosition } from '../../GenericModels/Grid';
import { FoldResult, Triangle, oppositeRotation } from './TrianglesGameLogic';

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

  getCell(layer: number, gridPos: GridPosition) {
    return this.#layers[layer][gridPos.row][gridPos.column];
  }

  reset() {
    this.#layers = [this.createEmptyLayer(this.#gridSize)];
  }

  canAddFoldResult(foldResult: FoldResult) {
    const { joint, triangle } = foldResult;
    const { layer, pos } = joint;
    if (layer >= 0 && layer < this.#layers.length) {
      if (pos.row < 0 || pos.row >= this.#gridSize || pos.column < 0 || pos.column >= this.#gridSize) {
        return false;
      }
      const cell = this.#layers[layer][pos.row][pos.column];
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
    const { joint, triangle } = foldResult;
    const { pos } = joint;
    let l = joint.layer;

    if (l === this.#layers.length) {
      this.#layers.push(this.createEmptyLayer(this.#gridSize));
    } else if (l === -1) {
      this.#layers.unshift(this.createEmptyLayer(this.#gridSize));
      joint.layer = 0;
      l = 0;
    }

    const cell = this.#layers[l][pos.row][pos.column];
    if (!cell) {
      this.#layers[l][pos.row][pos.column] = {
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
