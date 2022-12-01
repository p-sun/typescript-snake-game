import Canvas, { CanvasKeyEvent, CanvasMouseEvent } from '../Canvas';
import Game from '../Game';
import Color from '../GenericModels/Color';
import { GridPositionEqual, GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import GridRenderer from '../GridRenderer';
import Fruit from './Fruit';
import FruitRenderer from './FruitRenderer';
import Snake from './Snake';
import SnakeOverlayRenderer from './SnakeOverlayRenderer';
import SnakeRenderer from './SnakeRenderer';

export type SnakePlayStatus = 'waiting' | 'playing' | 'lost';

export default class SnakeGame extends Game {
  // Game Logic
  #playStatus: SnakePlayStatus = 'waiting';
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
    this.restartGame();

    // Rendering Logic

    this.#gridRenderer = new GridRenderer(this.#gridSize, this.canvas, {
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
  }

  restartGame() {
    this.#snake = Snake.createRandom(this.#gridSize);

    this.#fruit = new Fruit();
    this.#fruit.generateNewPosition(this.#gridSize, this.#snake);
  }

  onUpdate(canvas: Canvas) {
    if (this.#playStatus === 'playing') {
      const newSnake = this.#snake.tick();

      if (GridPositionEqual(this.#snake.headPosition, this.#fruit.position)) {
        this.#snake = this.#snake.extend();
        this.#fruit.generateNewPosition(this.#gridSize, this.#snake);
      }

      const hasCollision = newSnake.hasCollision(this.#gridSize);
      if (hasCollision) {
        this.#playStatus = 'lost';
      } else {
        this.#snake = newSnake;
      }
    }

    this.#renderSnake(canvas);
    this.#renderOverlay(canvas);
  }

  #renderSnake(canvas: Canvas) {
    this.#gridRenderer.render(canvas);
    this.#snakeRenderer.render(canvas, this.#gridRenderer, this.#snake);
    this.#fruitRenderer.render(canvas, this.#gridRenderer, this.#fruit);
  }

  #renderOverlay(canvas: Canvas) {
    SnakeOverlayRenderer.render(canvas, this.#playStatus, this.#snake.length);
  }

  onKeyDown(event: CanvasKeyEvent) {
    const { key } = event;
    if (key === 'arrow') {
      this.#snake = this.#snake.changeDirection(event.direction);
    } else if (key === 'space') {
      if (this.#playStatus === 'lost') {
        this.restartGame();
      }

      this.#playStatus = 'playing';
    }
  }

  onMouseEvent(event: CanvasMouseEvent) {}
}
