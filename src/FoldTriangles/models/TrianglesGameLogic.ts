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
  #count = 1; // Total number of triangles

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

    // this.applyFold(0);
    this.applyFold(1);
    this.applyFold(-1);
    this.applyFold(1);
    this.applyFold(-1);

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

  canAddTriangleToCell(joint: Joint, triangle: Triangle) {
    const { layer, pos } = joint;
    if (layer >= 0 && layer < this.#layers.length) {
      const cell = this.#layers[layer][pos.row][pos.column];
      if (!cell) {
        return true;
      } else if (!cell.triangle2) {
        return (
          triangle.rotation === this.oppositeRotation(cell.triangle1.rotation)
        );
      }
      return false;
    }
    return true;
  }

  addTriangleToCell(joint: Joint, triangle: Triangle) {
    let { layer, pos } = joint;
    if (layer === this.#layers.length) {
      this.#layers.push(this.createEmptyLayer(this.#gridSize));
    } else if (layer === -1) {
      this.#layers.unshift(this.createEmptyLayer(this.#gridSize));
      layer = 0;
    }

    const cell = this.#layers[layer][pos.row][pos.column];
    if (!cell) {
      this.#layers[layer][pos.row][pos.column] = {
        triangle1: triangle,
      };
    } else if (!cell.triangle2) {
      cell.triangle2 = triangle;
    }
  }

  private applyFold(fold: Fold): boolean {
    if (this.#count === this.#maxCount) {
      return false;
    }

    const drawStyle = this.#count < this.#maxCount ? 'middle' : 'last';
    let result = this.nextFoldResult(this.#joint, fold, drawStyle);
    if (
      result &&
      this.canAddTriangleToCell(result.newJoint, result.newTriangle)
    ) {
      this.addTriangleToCell(result.newJoint, result.newTriangle);
      this.#joint = result.newJoint;
      this.#folds.push(fold);
      this.#count += 1;
      return true;
    }
    console.log(`Can't apply Fold`, fold);
    return false;
  }

  private nextFoldResult(
    joint: Joint,
    fold: Fold,
    drawStyle: Triangle['drawStyle']
  ): { newJoint: Joint; newTriangle: Triangle } | undefined {
    const cell = this.getCell(joint.layer, joint.pos)!;
    const currTriangle = cell.triangle2 ?? cell.triangle1;
    const { rotation, rotateClockwise } = currTriangle;
    const { layer, pos } = joint;
    if (fold === 0) {
      const newDirection = this.directionForFold0(currTriangle);
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
    } else if (fold === 1 || fold === -1) {
      return {
        newJoint: { layer: layer + fold, pos },
        newTriangle: {
          rotation: this.adjacentRotation(currTriangle),
          rotateClockwise,
          drawStyle,
        },
      };
    }
  }

  private oppositeRotation(rot: TriangleRotation) {
    return ((rot + 2) % 4) as TriangleRotation;
  }

  private adjacentRotation(triangle: Triangle) {
    const { rotation, rotateClockwise } = triangle;
    const nextCWRot: TriangleRotation[] = [2, 3, 4, 1];
    const nextCCWRot: TriangleRotation[] = [4, 1, 2, 3];
    return rotateClockwise ? nextCWRot[rotation - 1] : nextCCWRot[rotation - 1];
  }

  private directionForFold0(triangle: Triangle): Direction {
    const { rotation, rotateClockwise } = triangle;
    switch (rotation) {
      case 1:
        return rotateClockwise ? 'right' : 'up';
      case 2:
        return rotateClockwise ? 'down' : 'right';
      case 3:
        return rotateClockwise ? 'left' : 'down';
      case 4:
        return rotateClockwise ? 'up' : 'left';
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
}
