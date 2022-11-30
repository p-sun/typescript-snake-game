import Canvas, { CanvasMouseEvent } from '../Canvas';
import Game from '../Game';
import Color from '../GenericModels/Color';
import { Direction } from '../GenericModels/Direction';
import Vec2 from '../GenericModels/Vec2';
import GridRenderer, { GridPosition, GridPositionEqual } from '../GridRenderer';
import Fruit from './Fruit';
import FruitRenderer from './FruitRenderer';
import Snake from './Snake';
import SnakeRenderer from './SnakeRenderer';

export default class SnakeGame extends Game {
  #snake: Snake;
  #snakeRenderer: SnakeRenderer;
  #playState: 'waiting' | 'playing' | 'lost' = 'waiting';
  #grid: GridRenderer;
  #fruit: Fruit;
  #fruitRenderer: FruitRenderer;

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    this.#grid = new GridRenderer({
      size: { rowCount: 34, columnCount: 34 },
      cellSize: new Vec2(9, 9),
      background: {
        mode: 'fill',
        color: Color.grey(0.8),
      },
      border: {
        lineColor: Color.grey(0.78),
        lineWidth: 1,
      },
    });

    this.canvas.size = this.#grid.totalSize();

    this.#snake = Snake.createRandom(this.#grid);

    this.#fruit = new Fruit();
    this.#fruit.generateNewPosition(this.#grid, this.#snake);

    this.#snakeRenderer = new SnakeRenderer({
      color: Color.cyan,
      eyeColor: Color.blue,
    });
    this.#fruitRenderer = new FruitRenderer({
      color: Color.magenta,
    });
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

      if (GridPositionEqual(this.#snake.headPosition, this.#fruit.position)) {
        this.#snake = this.#snake.extend();
        this.#fruit.generateNewPosition(this.#grid, this.#snake);
      }
    }

    this.#grid.draw(canvas);
    this.#snakeRenderer.draw(canvas, this.#grid, this.#snake);
    this.#fruitRenderer.draw(canvas, this.#grid, this.#fruit);

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
