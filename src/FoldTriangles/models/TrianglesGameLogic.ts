import { Direction } from '../../GenericModels/Direction';
import { GridPosition, GridPositionAdd } from '../../GenericModels/Grid';

type GridLayer = (Cell | null)[][];
type Cell = {
  triangle1: Triangle;
  triangle2?: Triangle;
};

type FoldDirection = -1 | 0 | 1;

type FoldResult = { joint: Joint; triangle: Triangle };
type Joint = {
  layer: number;
  pos: GridPosition;
};

export type Triangle = {
  rotation: TriangleRotation;
  clockwise: boolean; // Whether next rotation is clockwise, if fold is -1 or 1.
  drawStyle: 'first' | 'middle' | 'last';
};
export type TriangleRotation = 1 | 2 | 3 | 4; // topRight, bottomRight, bottomLeft, topLeft

export class TrianglesGameLogic {
  #maxCount: number;
  #gridSize: number;

  #layers: GridLayer[] = [];

  // For Folding
  #joint: Joint;
  #folds: FoldDirection[] = []; // 5 triangles, 3 folds
  #count = 1; // Total number of triangles

  constructor(config: { maxTriangles: number; gridSize: number }) {
    const { maxTriangles, gridSize } = config;
    this.#maxCount = maxTriangles;
    this.#gridSize = gridSize <= 0 ? Math.ceil(this.#maxCount / 2) * 2 + 1 : gridSize;

    this.#layers = [this.createEmptyLayer(this.#gridSize)];

    // First Triangle
    const mid = Math.floor(this.#gridSize / 2);
    const clockwise = Math.random() < 0.5;
    const startPos = { row: mid, column: mid };
    this.#layers[0][startPos.row][startPos.column] = {
      triangle1: { rotation: 1, clockwise: clockwise, drawStyle: 'first' },
    };
    this.#joint = { layer: 0, pos: startPos };

    const allFolds: FoldDirection[] = [-1, 0, 1];
    while (this.#count < this.#maxCount) {
      const i = Math.floor(Math.random() * 3);
      if (
        !this.tryApplyFold(allFolds[i]) &&
        !this.tryApplyFold(allFolds[(i + 1) % 3]) &&
        !this.tryApplyFold(allFolds[(i + 2) % 3])
      ) {
        console.error('No more folds possible. Count so far:', this.#count);
        break;
      }
    }

    // Debug
    // this.#layers.push(this.createEmptyLayer(this.#gridSize));
    // this.#layers[1][m][m] = { triangle1: 2 };
    // this.tryApplyFold(0);

    console.log(this.patternDescription(this.#count, this.#folds, clockwise));
  }

  get gridSize() {
    return this.#gridSize;
  }

  get layersCount() {
    return this.#layers.length;
  }

  getCell(layer: number, gridPos: GridPosition) {
    return this.#layers[layer][gridPos.row][gridPos.column];
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Layer                                   */
  /* -------------------------------------------------------------------------- */

  createEmptyLayer(gridSize: number) {
    return Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => null));
  }

  canAddFoldToLayers(foldResult: FoldResult) {
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
        return triangle.rotation === this.oppositeRotation(cell.triangle1.rotation);
      }
      return false;
    }
    return true;
  }

  addFoldToLayers(foldResult: FoldResult) {
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

  /* -------------------------------------------------------------------------- */
  /*                                   Folding                                  */
  /* -------------------------------------------------------------------------- */

  private tryApplyFold(fold: FoldDirection): boolean {
    if (this.#count === this.#maxCount) {
      return false;
    }

    const drawStyle = this.#count < this.#maxCount - 1 ? 'middle' : 'last';
    let result = this.nextFoldResult(this.#joint, fold, drawStyle);
    if (result && this.canAddFoldToLayers(result)) {
      this.addFoldToLayers(result);
      this.#joint = result.joint;
      this.#folds.push(fold);
      this.#count += 1;
      return true;
    }
    return false;
  }

  private nextFoldResult(joint: Joint, fold: FoldDirection, drawStyle: Triangle['drawStyle']): FoldResult | undefined {
    const cell = this.getCell(joint.layer, joint.pos)!;
    const currTriangle = cell.triangle2 ?? cell.triangle1;
    const { rotation, clockwise: clockwise } = currTriangle;
    const { layer, pos } = joint;
    if (fold === 0) {
      const newDirection = this.directionForFold0(currTriangle);
      return {
        joint: {
          layer,
          pos: GridPositionAdd(pos, this.toGridPos(newDirection)),
        },
        triangle: {
          rotation: this.oppositeRotation(rotation),
          clockwise: !clockwise,
          drawStyle: drawStyle,
        },
      };
    } else {
      return {
        joint: { layer: layer + fold, pos },
        triangle: {
          rotation: this.adjacentRotation(currTriangle),
          clockwise: clockwise,
          drawStyle,
        },
      };
    }
  }

  private oppositeRotation(rot: TriangleRotation) {
    // 1<-->3  2<-->4
    const val = (rot + 2) % 4;
    return val === 0 ? 4 : (val as TriangleRotation);
  }

  private adjacentRotation(triangle: Triangle) {
    const { rotation, clockwise: clockwise } = triangle;
    // const nextCWRot: TriangleRotation[] = [2, 3, 4, 1];
    // const nextCCWRot: TriangleRotation[] = [4, 1, 2, 3];
    // return clockwise ? nextCWRot[rotation - 1] : nextCCWRot[rotation - 1];
    const val = (rotation + (clockwise ? 1 : 3)) % 4;
    return val === 0 ? 4 : (val as TriangleRotation);
  }

  private directionForFold0(triangle: Triangle): Direction {
    const { rotation, clockwise: clockwise } = triangle;
    switch (rotation) {
      case 1:
        return clockwise ? 'right' : 'up';
      case 2:
        return clockwise ? 'down' : 'right';
      case 3:
        return clockwise ? 'left' : 'down';
      case 4:
        return clockwise ? 'up' : 'left';
    }
  }

  private toGridPos(dir: Direction): GridPosition {
    switch (dir) {
      case 'up':
        return { row: -1, column: 0 };
      case 'down':
        return { row: 1, column: 0 };
      case 'left':
        return { row: 0, column: -1 };
      case 'right':
        return { row: 0, column: 1 };
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Debug                                   */
  /* -------------------------------------------------------------------------- */

  private patternDescription(count: number, folds: FoldDirection[], startClockwise: boolean) {
    return (
      `Generated a pattern!\nCount: ${count} \nStart clockwise: ${startClockwise}\n\n` + this.foldsDescription(folds)
    );
  }

  private foldsDescription(folds: FoldDirection[]) {
    const groupedFolds = this.#folds
      .map((f) => (f === 1 ? 'Up   ' : f === -1 ? 'Down ' : '0    '))
      .reduce(
        (acc, f) => {
          const last = acc[acc.length - 1];
          if (last.length === 5) {
            return acc.concat([[f]]);
          }
          last.push(f);
          return acc;
        },
        [['Start']]
      );
    return 'Folds:\n' + groupedFolds.map((folds) => folds.join(' -> ').concat(' -> ')).join('\n');
  }
}
