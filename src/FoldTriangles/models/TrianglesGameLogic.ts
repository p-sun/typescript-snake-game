import { Direction } from '../../GenericModels/Direction';
import { GridPosition, GridPositionAdd } from '../../GenericModels/Grid';
import Vec2 from '../../GenericModels/Vec2';
import { debug } from 'console';
import { captureRejectionSymbol } from 'events';

type GridLayer = (Cell | null)[][];
type Cell = {
  triangle1: TriangleRotation;
  triangle2?: TriangleRotation;
};

export type TriangleRotation = 1 | 2 | 3 | 4;

type Joint = {
  layer: number;
  pos: GridPosition;
  rotateClockwise: boolean;
};

type Fold = -1 | 0 | 1;

export class TrianglesGameLogic {
  #trianglesCount: number;
  #gridSize: number;

  #layers: GridLayer[] = [];

  // For Folding
  #joint: Joint;
  #folds: Fold[] = []; // 5 triangles, 3 folds

  constructor(config: { trianglesCount: number }) {
    const { trianglesCount } = config;
    this.#trianglesCount = trianglesCount;
    this.#gridSize = Math.ceil(trianglesCount / 2) * 2 + 1;

    this.#layers = [
      Array.from({ length: this.#gridSize }, () =>
        Array.from({ length: this.#gridSize }, () => null)
      ),
    ];

    let m = Math.floor(this.#gridSize / 2);
    this.#layers[0][m][m] = { triangle1: 1 };

    this.#joint = {
      layer: 0,
      pos: { row: m, column: m },
      rotateClockwise: false, //Math.random() < 0.5,
    };

    this.applyFold(0);
    this.applyFold(0);
    this.applyFold(0);
  }

  get gridSize() {
    return this.#gridSize;
  }

  getCell(layer: number, gridPos: GridPosition) {
    return this.#layers[layer][gridPos.row][gridPos.column];
  }

  addTriangleToCell(
    layer: number,
    gridPos: GridPosition,
    rot: TriangleRotation
  ) {
    const curr = this.#layers[layer][gridPos.row][gridPos.column];
    if (curr) {
      curr.triangle2 = rot;
    } else {
      this.#layers[layer][gridPos.row][gridPos.column] = { triangle1: rot };
    }
  }

  private applyFold(fold: Fold): boolean {
    const currJoint = this.#joint;
    const cell = this.getCell(currJoint.layer, currJoint.pos);
    let result = this.foldNextTriangle(cell!, this.#joint, fold);
    if (result) {
      this.#joint = result.newJoint;
      this.#folds.push(fold);
      this.addTriangleToCell(
        this.#joint.layer,
        this.#joint.pos,
        result.newRotation
      );
      return true;
    }
    return false;
  }

  private foldNextTriangle(
    cell: Cell,
    currJoint: Joint,
    fold: Fold
  ): { newJoint: Joint; newRotation: TriangleRotation } | undefined {
    const currRot = cell.triangle2 ?? cell.triangle1;
    const { layer, pos, rotateClockwise } = currJoint;
    if (fold === 0) {
      const newDirection = this.directionForFold0(currRot, rotateClockwise);
      return {
        newJoint: {
          layer,
          pos: GridPositionAdd(pos, this.toGridPos(newDirection)),
          rotateClockwise: !rotateClockwise,
        },
        newRotation: this.oppositeRotation(currRot),
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
