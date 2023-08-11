import { Direction } from '../../GenericModels/Direction';
import { GridPosition, GridPositionAdd } from '../../GenericModels/Grid';

type GridLayer = (Cell | null)[][];
type Cell = {
  triangle1: Triangle;
  triangle2?: Triangle;
};
export type TriangleRotation = 1 | 2 | 3 | 4; // topRight, bottomRight, bottomLeft, topLeft
export type Triangle = {
  rotation: TriangleRotation;
  rotateClockwise: boolean;
  drawStyle: 'first' | 'middle' | 'last';
};

type Joint = {
  layer: number;
  pos: GridPosition;
};

type Fold = -1 | 0 | 1;

export class TrianglesGameLogic {
  #maxCount: number;
  #gridSize: number;

  #layers: GridLayer[] = [];

  // For Folding
  #joint: Joint;
  #folds: Fold[] = []; // 5 triangles, 3 folds

  #count = 1;

  constructor(config: { maxTriangles: number }) {
    const { maxTriangles } = config;
    this.#maxCount = maxTriangles;
    this.#gridSize = Math.ceil(this.#maxCount / 2) * 2 + 1;

    this.#layers = [this.createEmptyLayer(this.#gridSize)];

    // First Triangle
    const mid = Math.floor(this.#gridSize / 2);
    const rotateClockwise = false; //Math.random() < 0.5,
    const startPos = { row: mid, column: mid };
    this.#layers[0][startPos.row][startPos.column] = {
      triangle1: { rotation: 1, rotateClockwise, drawStyle: 'first' },
    };
    this.#joint = { layer: 0, pos: startPos };

    this.applyFold(0);
    this.applyFold(0);
    this.applyFold(0);
    this.applyFold(0);

    // this.#layers.push(this.createEmptyLayer(this.#gridSize));
    // this.#layers[1][m][m] = { triangle1: 2 };
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

  createEmptyLayer(gridSize: number) {
    return Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => null)
    );
  }

  addTriangleToCell(layer: number, gridPos: GridPosition, triangle: Triangle) {
    const curr = this.#layers[layer][gridPos.row][gridPos.column];
    if (curr) {
      curr.triangle2 = triangle;
    } else {
      this.#layers[layer][gridPos.row][gridPos.column] = {
        triangle1: triangle,
      };
    }
  }

  private applyFold(fold: Fold): boolean {
    if (this.#count === this.#maxCount) {
      return false;
    }

    const drawStyle = this.#count < this.#maxCount ? 'last' : 'middle';
    let result = this.foldNextTriangle(this.#joint, fold, drawStyle);
    if (result) {
      this.#joint = result.newJoint;
      this.#folds.push(fold);
      this.addTriangleToCell(
        this.#joint.layer,
        this.#joint.pos,
        result.newTriangle
      );
      this.#count += 1;
      return true;
    }
    return false;
  }

  private foldNextTriangle(
    joint: Joint,
    fold: Fold,
    drawStyle: Triangle['drawStyle']
  ): { newJoint: Joint; newTriangle: Triangle } | undefined {
    const cell = this.getCell(joint.layer, joint.pos)!;
    const currTriangle = cell.triangle2 ?? cell.triangle1;
    const { rotation, rotateClockwise } = currTriangle;
    const { layer, pos } = joint;
    if (fold === 0) {
      const newDirection = this.directionForFold0(rotation, rotateClockwise);

      return {
        newJoint: {
          layer,
          pos: GridPositionAdd(pos, this.toGridPos(newDirection)),
        },
        newTriangle: {
          rotation: this.oppositeRotation(rotation),
          rotateClockwise: !rotateClockwise,
          drawStyle: drawStyle,
        },
      };
    }
  }

  private oppositeRotation(rot: TriangleRotation) {
    return ((rot + 2) % 4) as TriangleRotation;
  }

  private adjacentRotation(rot: TriangleRotation, rotateClockwise: boolean) {
    const offset = rotateClockwise ? 1 : 3;
    return ((rot + offset) % 4) as TriangleRotation;
  }

  private directionForFold0(
    rot: TriangleRotation,
    rotateClockwise: boolean
  ): Direction {
    if (rot === 1) {
      return rotateClockwise ? 'right' : 'up';
    } else if (rot === 2) {
      return rotateClockwise ? 'down' : 'right';
    } else if (rot === 3) {
      return rotateClockwise ? 'left' : 'down';
    } else if (rot === 4) {
      return rotateClockwise ? 'up' : 'left';
    }
    throw new Error(`noFoldDirection: Invalid triangle rotation ${rot}`);
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
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
