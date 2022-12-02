import Canvas from '../Canvas';
import Color from '../GenericModels/Color';
import { GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import GridRenderer, { GridRenderConfig } from '../GridRenderer';
import FruitRenderer from './FruitRenderer';
import { SnakeColors } from './SnakeColors';
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

    const gridConfig: GridRenderConfig = {
      origin: Vec2.zero,
      cellSize: new Vec2(30, 30),
      background: {
        mode: 'fill',
        color: Color.fromHex(0x81b29a),
      },
      border: {
        lineColor: Color.fromHex(0x9ac1af),
        lineWidth: 3,
      },
    };
    this.#gridRenderer = new GridRenderer(this.#gridSize, canvas, gridConfig);

    this.#snakeRenderer = new SnakeRenderer({
      color: Color.fromHex(0xa3daff),
      eyeColor: Color.fromHex(0x3d405b),
    });

    this.#fruitRenderer = new FruitRenderer({
      color: Color.fromHex(0xe88273),
    });
  }

  render(canvas: Canvas, gameLogic: SnakeGameLogic) {
    this.#gridRenderer.render(canvas);
    this.#fruitRenderer.render(canvas, this.#gridRenderer, gameLogic.fruit);
    this.#snakeRenderer.render(canvas, this.#gridRenderer, gameLogic.snake);

    SnakeOverlayRenderer.render(
      canvas,
      gameLogic.playStatus,
      gameLogic.snake.length
    );
  }
}
