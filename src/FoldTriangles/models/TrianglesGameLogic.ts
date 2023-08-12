import { PatternPos, Pattern } from './Pattern';

export type Triangle = {
  rotation: TriangleRotation;
  clockwise: boolean; // Whether next rotation is clockwise, if fold is -1 or 1.
  index: number;
};
export type TriangleRotation = 1 | 2 | 3 | 4; // topRight, bottomRight, bottomLeft, topLeft

export type FoldDirection = -1 | 0 | 1;

export type FoldResult = { pos: PatternPos; triangle: Triangle };

export class TrianglesGameLogic {
  readonly maxCount: number;
  #pattern: Pattern;

  constructor(config: { maxTriangles: number; gridSize: number }) {
    const { maxTriangles, gridSize } = config;
    this.maxCount = maxTriangles;

    const newGridSize = gridSize <= 0 ? Math.ceil(this.maxCount / 2) * 2 + 1 : gridSize;
    this.#pattern = new Pattern(newGridSize);

    this.generatePattern();
  }

  get gridSize() {
    return this.#pattern.gridSize;
  }

  get layersCount() {
    return this.#pattern.layersCount;
  }

  getCell(pos: PatternPos) {
    return this.#pattern.getCell(pos);
  }

  /* -------------------------------------------------------------------------- */
  /*                              Generate Pattern                              */
  /* -------------------------------------------------------------------------- */

  generatePattern() {
    do {
      this.startNewPattern();
      this.foldPatternUntilDone();
    } while (this.#pattern.length !== this.maxCount);
  }

  private startNewPattern() {
    const mid = Math.floor(this.gridSize / 2);

    this.#pattern.reset();
    this.#pattern.addFoldResult(
      {
        pos: { layer: 0, row: mid, column: mid },
        triangle: { rotation: 1, clockwise: Math.random() < 0.5, index: 0 },
      },
      0
    );
  }

  private foldPatternUntilDone() {
    const allFolds: FoldDirection[] = [-1, 0, 1];
    while (this.#pattern.length < this.maxCount) {
      const i = Math.floor(Math.random() * 3);
      if (
        !this.tryApplyFold(allFolds[i]) &&
        !this.tryApplyFold(allFolds[(i + 1) % 3]) &&
        !this.tryApplyFold(allFolds[(i + 2) % 3])
      ) {
        break;
      }
    }
    if (this.#pattern.length === this.maxCount) {
      console.log(this.#pattern.debugDescription());
    }
  }

  private tryApplyFold(fold: FoldDirection): boolean {
    if (this.#pattern.length === this.maxCount) {
      return false;
    }

    let prevResult = this.#pattern.prevResult;
    let result = nextFoldResult(prevResult, fold, this.#pattern.length);
    if (this.#pattern.canAddFoldResult(result)) {
      this.#pattern.addFoldResult(result, fold);
      return true;
    }
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*                            Triangle Folding Math                           */
/* -------------------------------------------------------------------------- */

function nextFoldResult(prevResult: FoldResult, fold: FoldDirection, index: number): FoldResult {
  const {
    pos: { layer, row, column },
    triangle,
  } = prevResult;
  const { rotation, clockwise } = triangle;

  if (fold === 0) {
    const toAdd = gridDirectionWithNoFold(triangle);
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
        rotation: adjacentRotation(triangle),
        clockwise: clockwise,
        index,
      },
    };
  }
}

function gridDirectionWithNoFold(triangle: Triangle) {
  const { rotation, clockwise } = triangle;

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
