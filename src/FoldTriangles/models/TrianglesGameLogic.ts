import { Direction } from '../../GenericModels/Direction';
import { GridPosition, GridPositionAdd } from '../../GenericModels/Grid';
import { patternDescription } from '../utils/patternDescription';
import { PatternData } from './PatternData';

export type Triangle = {
  rotation: TriangleRotation;
  clockwise: boolean; // Whether next rotation is clockwise, if fold is -1 or 1.
  index: number;
};
export type TriangleRotation = 1 | 2 | 3 | 4; // topRight, bottomRight, bottomLeft, topLeft

export type FoldDirection = -1 | 0 | 1;

export type FoldResult = { joint: Joint; triangle: Triangle };
type Joint = {
  layer: number;
  pos: GridPosition;
};

export class TrianglesGameLogic {
  #maxCount: number;
  #gridSize: number;

  #patternData: PatternData;

  // To Build FoldData
  #joint: Joint = { layer: -1, pos: { row: -1, column: -1 } };
  #folds: FoldDirection[] = []; // 5 triangles, 3 folds
  #startClockwise: boolean = false;
  #count = 1; // Total number of triangles

  constructor(config: { maxTriangles: number; gridSize: number }) {
    const { maxTriangles, gridSize } = config;
    this.#maxCount = maxTriangles;
    this.#gridSize = gridSize <= 0 ? Math.ceil(this.#maxCount / 2) * 2 + 1 : gridSize;
    this.#patternData = new PatternData(this.#gridSize);

    this.generatePattern();
  }

  get maxCount() {
    return this.#maxCount;
  }

  get gridSize() {
    return this.#gridSize;
  }

  get layersCount() {
    return this.#patternData.layersCount;
  }

  getCell(layer: number, gridPos: GridPosition) {
    return this.#patternData.getCell(layer, gridPos);
  }

  /* -------------------------------------------------------------------------- */
  /*                              Generate Pattern                              */
  /* -------------------------------------------------------------------------- */

  generatePattern() {
    do {
      this.startNewPattern();
      this.foldPatternUntilDone();
    } while (this.#count !== this.#maxCount);
  }

  private startNewPattern() {
    this.#count = 1; // Total number of triangles
    this.#folds = [];

    const mid = Math.floor(this.#gridSize / 2);
    this.#joint = { layer: 0, pos: { row: mid, column: mid } };

    this.#startClockwise = Math.random() < 0.5;
    this.#patternData.reset();
    this.#patternData.addFoldResult({
      joint: this.#joint,
      triangle: { rotation: 1, clockwise: this.#startClockwise, index: 0 },
    });
  }

  private foldPatternUntilDone() {
    const allFolds: FoldDirection[] = [-1, 0, 1];
    while (this.#count < this.#maxCount) {
      const i = Math.floor(Math.random() * 3);
      if (
        !this.tryApplyFold(allFolds[i]) &&
        !this.tryApplyFold(allFolds[(i + 1) % 3]) &&
        !this.tryApplyFold(allFolds[(i + 2) % 3])
      ) {
        // console.error('No more folds possible. Count so far:', this.#count);
        break;
      }
    }
    if (this.#count === this.#maxCount) {
      console.log(patternDescription(this.#count, this.#folds, this.#startClockwise));
    }
  }

  private tryApplyFold(fold: FoldDirection): boolean {
    if (this.#count === this.#maxCount) {
      return false;
    }

    let result = this.nextFoldResult(this.#joint, fold);
    if (result && this.#patternData.canAddFoldResult(result)) {
      this.#patternData.addFoldResult(result);
      this.#joint = result.joint;
      this.#folds.push(fold);
      this.#count += 1;
      return true;
    }
    return false;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Folding                                  */
  /* -------------------------------------------------------------------------- */

  private nextFoldResult(joint: Joint, fold: FoldDirection): FoldResult | undefined {
    const cell = this.getCell(joint.layer, joint.pos)!;
    const currTriangle = cell.triangle2 ?? cell.triangle1;
    const { rotation, clockwise } = currTriangle;
    const { layer, pos } = joint;
    const index = this.#count;
    if (fold === 0) {
      const newPos = GridPositionAdd(pos, this.directionForFold0(currTriangle));
      return {
        joint: { layer, pos: newPos },
        triangle: {
          rotation: oppositeRotation(rotation),
          clockwise: !clockwise,
          index,
        },
      };
    } else {
      return {
        joint: { layer: layer + fold, pos },
        triangle: {
          rotation: adjacentRotation(currTriangle),
          clockwise: clockwise,
          index,
        },
      };
    }
  }

  private directionForFold0(triangle: Triangle): GridPosition {
    const { rotation, clockwise: clockwise } = triangle;

    const up = { row: -1, column: 0 };
    const down = { row: 1, column: 0 };
    const left = { row: 0, column: -1 };
    const right = { row: 0, column: 1 };

    switch (rotation) {
      case 1:
        return clockwise ? right : up;
      case 2:
        return clockwise ? down : right;
      case 3:
        return clockwise ? left : down;
      case 4:
        return clockwise ? up : left;
    }
  }
}

export function oppositeRotation(rot: TriangleRotation) {
  // 1<-->3  2<-->4
  const val = (rot + 2) % 4;
  return val === 0 ? 4 : (val as TriangleRotation);
}

function adjacentRotation(triangle: Triangle) {
  const { rotation, clockwise: clockwise } = triangle;
  const val = (rotation + (clockwise ? 1 : 3)) % 4;
  return val === 0 ? 4 : (val as TriangleRotation);
}
