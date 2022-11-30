import Canvas, { CanvasKeyEvent, CanvasMouseEvent } from '../Canvas';
import Game from '../Game';
import Color from '../GenericModels/Color';
import { Direction } from '../GenericModels/Direction';
import { GridPositionEqual, GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import GridRenderer from '../GridRenderer';
import Fruit from './Fruit';
import FruitRenderer from './FruitRenderer';
import Snake from './Snake';
import SnakeRenderer from './SnakeRenderer';

export default class SnakeGame extends Game {
  // Game Logic
  #playState: 'waiting' | 'playing' | 'lost' = 'waiting';
  #gridSize: GridSize;
  #snake: Snake;
  #fruit: Fruit;

  // Rendering Logic
  #gridRenderer: GridRenderer;
  #snakeRenderer: SnakeRenderer;
  #fruitRenderer: FruitRenderer;

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    // Game Logic

    this.#gridSize = { rowCount: 34, columnCount: 34 };

    this.#snake = Snake.createRandom(this.#gridSize);

    this.#fruit = new Fruit();
    this.#fruit.generateNewPosition(this.#gridSize, this.#snake);

    // Rendering Logic

    this.#gridRenderer = new GridRenderer({
      cellSize: new Vec2(20, 20),
      background: {
        mode: 'fill',
        color: Color.grey(0.8),
      },
      border: {
        lineColor: Color.grey(0.78),
        lineWidth: 1,
      },
    });
    this.#snakeRenderer = new SnakeRenderer({
      color: Color.cyan,
      eyeColor: Color.blue,
    });
    this.#fruitRenderer = new FruitRenderer({
      color: Color.magenta,
    });

    this.canvas.size = this.#gridRenderer.totalSize(this.#gridSize);
  }

  update(canvas: Canvas) {
    if (this.#playState === 'playing') {
      const newSnake = this.#snake.tick();
      const hasCollision = newSnake.hasCollision(this.#gridSize);

      if (hasCollision) {
        this.#playState = 'lost';
      } else {
        this.#snake = newSnake;
      }

      if (GridPositionEqual(this.#snake.headPosition, this.#fruit.position)) {
        this.#snake = this.#snake.extend();
        this.#fruit.generateNewPosition(this.#gridSize, this.#snake);
      }
    }

    this.#gridRenderer.draw(canvas, this.#gridSize);
    this.#snakeRenderer.draw(canvas, this.#gridRenderer, this.#snake);
    this.#fruitRenderer.draw(canvas, this.#gridRenderer, this.#fruit);

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

  onKeyDown(event: CanvasKeyEvent) {
    const { key } = event;
    if (key === 'arrow') {
      this.#snake = this.#snake.changeDirection(event.direction);
    } else if (key === 'space') {
      this.#playState = 'playing';
    }
  }

  onMouseEvent(event: CanvasMouseEvent) {}
}
