import { patternDescription } from '../utils/patternDescription';
import { PatternPos, PatternData } from './PatternData';

export type Triangle = {
  rotation: TriangleRotation;
  clockwise: boolean; // Whether next rotation is clockwise, if fold is -1 or 1.
  index: number;
};
export type TriangleRotation = 1 | 2 | 3 | 4; // topRight, bottomRight, bottomLeft, topLeft

export type FoldDirection = -1 | 0 | 1;

export type FoldResult = { pos: PatternPos; triangle: Triangle };

export class TrianglesGameLogic {
  #maxCount: number;
  #gridSize: number;

  #patternData: PatternData;

  // To Build FoldData
  #pos: PatternPos = { layer: -1, row: -1, column: -1 };
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

  getCell(pos: PatternPos) {
    return this.#patternData.getCell(pos);
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
    this.#pos = { layer: 0, row: mid, column: mid };

    this.#startClockwise = Math.random() < 0.5;
    this.#patternData.reset();
    this.#patternData.addFoldResult({
      pos: this.#pos,
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

    let result = this.nextFoldResult(this.#pos, fold);
    if (result && this.#patternData.canAddFoldResult(result)) {
      this.#patternData.addFoldResult(result);
      this.#pos = result.pos;
      this.#folds.push(fold);
      this.#count += 1;
      return true;
    }
    return false;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Folding                                  */
  /* -------------------------------------------------------------------------- */

  private nextFoldResult(pos: PatternPos, fold: FoldDirection): FoldResult | undefined {
    const cell = this.getCell(pos)!;
    const currTriangle = cell.triangle2 ?? cell.triangle1;
    const { rotation, clockwise } = currTriangle;
    const { layer, row, column } = pos;
    const index = this.#count;
    if (fold === 0) {
      const toAdd = this.directionForFold0(currTriangle);
      return {
        pos: { layer, row: row + toAdd[0], column: column + toAdd[1] },
        triangle: {
          rotation: oppositeRotation(rotation),
          clockwise: !clockwise,
          index,
        },
      };
    } else {
      return {
        pos: { layer: layer + fold, row, column },
        triangle: {
          rotation: adjacentRotation(currTriangle),
          clockwise: clockwise,
          index,
        },
      };
    }
  }

  private directionForFold0(triangle: Triangle) {
    const { rotation, clockwise: clockwise } = triangle;

    const up = [-1, 0] as [number, number];
    const down = [1, 0] as [number, number];
    const left = [0, -1] as [number, number];
    const right = [0, 1] as [number, number];

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
