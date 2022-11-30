import Canvas from './Canvas';
import Color from './Color';
import { Direction, OppositeDirection, Vec2ForDirection } from './Direction';
import Grid, { GridPosition, GridPositionEqual } from './Grid';
import { randomIntInRange } from './Utils';
import Vec2 from './Vec2';

export type SnakeRenderConfig = {
  color: Color;
  eyeColor: Color;
};

export default class Snake {
  private constructor(
    public readonly renderConfig: SnakeRenderConfig,
    public readonly positions: GridPosition[],
    public readonly moveDirection: Direction,
    public readonly segmentsToAdd: number
  ) {}

  static createRandom(grid: Grid, renderConfig: SnakeRenderConfig): Snake {
    const { columnCount, rowCount } = grid;

    // Choose a random location in the grid
    const column = randomIntInRange(2, columnCount - 2);
    const row = randomIntInRange(2, rowCount - 2);

    // Figure out which edges we closest to
    const dColumn =
      column > (columnCount - 1) / 2 ? column - columnCount : column + 1;
    const dRow = row > (rowCount - 1) / 2 ? row - rowCount : row + 1;

    // Create the move direction that moves away from the closest edge
    const moveDirection =
      Math.abs(dColumn) < Math.abs(dRow)
        ? dColumn > 0
          ? Direction.Right
          : Direction.Left
        : dRow > 0
        ? Direction.Down
        : Direction.Up;

    const p = { row, column };

    return new Snake(
      renderConfig,
      [p, Snake.#moveGridPosition(p, OppositeDirection(moveDirection))],
      moveDirection,
      0
    );
  }

  static #moveGridPosition(
    gridPos: GridPosition,
    direction: Direction
  ): GridPosition {
    const d = Vec2ForDirection(direction);
    return { row: gridPos.row + d.y, column: gridPos.column + d.x };
  }

  get headPosition(): GridPosition {
    return this.positions[0];
  }

  draw(canvas: Canvas, grid: Grid) {
    this.positions.forEach((pos, index) => {
      const percent =
        this.positions.length > 1 ? index / (this.positions.length - 1) : 1;
      grid.fillCell(
        canvas,
        pos,
        this.renderConfig.color.lerp(Color.black, percent)
      );
    });

    const { headPosition } = this;

    grid.drawEllipseInCell(canvas, headPosition, this.renderConfig.eyeColor, {
      fillPercent: new Vec2(0.3, 0.3),
      normalizedOffset: this.#eyeNormalizedOffset,
    });
  }

  get #moveDirRotationAngleRad(): number {
    const d = Vec2ForDirection(this.moveDirection);
    return d.signedAngleRadTo(Vec2.right);
  }

  get #eyeNormalizedOffset(): Vec2 {
    const ang = this.#moveDirRotationAngleRad;
    return new Vec2(0.4, -0.25).rotate(ang);
  }

  tick(): Snake {
    const newPositions = this.positions.slice();
    newPositions.unshift(
      Snake.#moveGridPosition(this.headPosition, this.moveDirection)
    );
    if (this.segmentsToAdd === 0) {
      newPositions.pop();
    }

    return new Snake(
      this.renderConfig,
      newPositions,
      this.moveDirection,
      Math.max(0, this.segmentsToAdd - 1)
    );
  }

  changeDirection(direction: Direction): Snake {
    if (direction === OppositeDirection(direction)) {
      // Ignore an immediate death
      return this;
    }

    return new Snake(
      this.renderConfig,
      this.positions,
      direction,
      this.segmentsToAdd
    );
  }

  get length(): number {
    return this.positions.length;
  }

  extend(): Snake {
    return new Snake(
      this.renderConfig,
      this.positions,
      this.moveDirection,
      this.segmentsToAdd + 1
    );
  }

  hasCollision(grid: Grid): boolean {
    const { headPosition } = this;

    // Check if the head went off the grid
    if (
      headPosition.column < 0 ||
      headPosition.row < 0 ||
      headPosition.column >= grid.columnCount ||
      headPosition.row >= grid.rowCount
    ) {
      return true;
    }

    return this.containsPosition(headPosition, { skipHead: true });
  }

  containsPosition(
    pos: GridPosition,
    options?: { skipHead: boolean }
  ): boolean {
    const positionsToCheck = options?.skipHead
      ? this.positions.slice(1)
      : this.positions;

    return positionsToCheck.some((p) => GridPositionEqual(p, pos));
  }
}
