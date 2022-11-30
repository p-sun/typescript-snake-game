import Canvas, { CanvasMouseEvent } from './Canvas';
import Color from './Color';
import { Direction } from './Direction';
import Game from './Game';
import Grid, { GridPosition, GridPositionEqual } from './Grid';
import { randomIntInRange } from './Utils';
import Vec2 from './Vec2';

export default class SnakeGame extends Game {
  #snake: Snake;
  #playState: 'waiting' | 'playing' | 'lost' = 'waiting';
  #grid: Grid;
  #fruitLocation: GridPosition;
  #fruitColor: Color = Color.magenta;

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    const grid = new Grid();
    grid.rowCount = 34;
    grid.columnCount = 34;
    grid.cellSize = new Vec2(9, 9);
    grid.background = {
      mode: 'fill',
      color: Color.grey(0.8),
    };
    grid.border = {
      lineColor: Color.grey(0.78),
      lineWidth: 1,
    };

    this.#grid = grid;

    this.canvas.size = grid.totalSize;

    this.#snake = Snake.createRandom(this.#grid, {
      color: Color.cyan,
      eyeColor: Color.blue,
    });

    this.#fruitLocation = this.#generateFruitLocation();
  }

  update(canvas: Canvas) {
    if (this.#playState === 'playing') {
      const newSnake = this.#snake.tick();
      const hasCollision = newSnake.hasCollision(this.#grid);

      if (hasCollision) {
        this.#playState = 'lost';
      } else {
        this.#snake = newSnake;
      }

      if (GridPositionEqual(this.#snake.headPosition, this.#fruitLocation)) {
        this.#snake = this.#snake.extend();
        this.#fruitLocation = this.#generateFruitLocation();
      }
    }

    this.#grid.draw(canvas);
    this.#snake.draw(canvas, this.#grid);
    this.#grid.fillCell(canvas, this.#fruitLocation, this.#fruitColor);

    if (this.#playState !== 'playing') {
      canvas.drawRect(Vec2.zero, canvas.size, Color.black, 0.5);

      canvas.drawTextAtPosition(
        `Press [space] to ${this.#playState === 'lost' ? 're' : ''}start!`,
        canvas.midpoint,
        {
          color: Color.white,
          fontSize: 30,
        },
        {
          normalizedOffsetX: 0,
          normalizedOffsetY: 0,
        }
      );

      if (this.#playState === 'lost') {
        canvas.drawTextAtPosition(
          `Snake length: ${this.#snake.length}`,
          canvas.midpoint.mapY((y) => y - 32),
          {
            color: new Color(1, 0.3, 0.2),
            fontSize: 36,
          }
        );
        canvas.drawTextAtPosition(
          '☠️😭☠️',
          canvas.midpoint.mapY((y) => y - 70),
          {
            color: Color.black,
            fontSize: 40,
          }
        );
      }
    }
  }

  #generateFruitLocation(): GridPosition {
    let pos = {
      row: randomIntInRange(0, this.#grid.rowCount),
      column: randomIntInRange(0, this.#grid.columnCount),
    };

    // TODO - if you win and fill the WHOLE GRID this hangs
    while (this.#snake.containsPosition(pos)) {
      pos = {
        row: randomIntInRange(0, this.#grid.rowCount),
        column: randomIntInRange(0, this.#grid.columnCount),
      };
    }

    return pos;
  }

  onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    if (key === 'ArrowUp') {
      this.#snake = this.#snake.changeDirection(Direction.Up);
    } else if (key === 'ArrowDown') {
      this.#snake = this.#snake.changeDirection(Direction.Down);
    } else if (key === 'ArrowLeft') {
      this.#snake = this.#snake.changeDirection(Direction.Left);
    } else if (key === 'ArrowRight') {
      this.#snake = this.#snake.changeDirection(Direction.Right);
    } else if (key === ' ') {
      this.#playState = 'playing';
    }
  }

  onMouseEvent(event: CanvasMouseEvent) {}
}
