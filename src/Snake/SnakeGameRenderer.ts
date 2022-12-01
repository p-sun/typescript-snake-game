import Canvas from '../Canvas';
import Color from '../GenericModels/Color';
import { GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import GridRenderer from '../GridRenderer';
import FruitRenderer from './FruitRenderer';
import SnakeGameLogic from './SnakeGameLogic';
import SnakeOverlayRenderer from './SnakeOverlayRenderer';
import SnakeRenderer from './SnakeRenderer';

export default class SnakeGameRenderer {
  #gridSize: GridSize;

  #gridRenderer: GridRenderer;
  #snakeRenderer: SnakeRenderer;
  #fruitRenderer: FruitRenderer;

  constructor(canvas: Canvas, gridSize: GridSize) {
    this.#gridSize = gridSize;

    this.#gridRenderer = new GridRenderer(this.#gridSize, canvas, {
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

  render(canvas: Canvas, gameLogic: SnakeGameLogic) {
    this.#gridRenderer.render(canvas);
    this.#snakeRenderer.render(canvas, this.#gridRenderer, gameLogic.snake);
    this.#fruitRenderer.render(canvas, this.#gridRenderer, gameLogic.fruit);

    SnakeOverlayRenderer.render(
      canvas,
      gameLogic.playStatus,
      gameLogic.snake.length
    );
  }
}
