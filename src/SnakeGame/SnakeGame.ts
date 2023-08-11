import Game from '../GenericGame/Game';
import { CanvasKeyEvent, CanvasMouseEvent, ICanvas } from '../GenericGame/ICanvas';
import { GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import SnakeGameLogic from './Models/SnakeGameLogic';
import SnakeGameRenderer from './Renderers/SnakeGameRenderer';

export type SnakePlayStatus = 'waiting' | 'playing' | 'lost';

export default class SnakeGame extends Game {
  #gameLogic: SnakeGameLogic;
  #renderer: SnakeGameRenderer;

  constructor(
    canvas: ICanvas,
    gridSize: GridSize,
    cellSize: Vec2,
    gameLogic?: SnakeGameLogic,
    renderer?: SnakeGameRenderer
  ) {
    super(canvas);

    this.#gameLogic = gameLogic ?? new SnakeGameLogic(gridSize);
    this.#renderer = renderer ?? new SnakeGameRenderer(canvas, gridSize, cellSize);
  }

  onUpdate() {
    this.#gameLogic?.tick();
  }

  onRender(canvas: ICanvas) {
    this.#renderer.render(canvas, this.#gameLogic);
  }

  onKeyDown(event: CanvasKeyEvent) {
    const { key } = event;
    if (key === 'arrow') {
      this.#gameLogic?.onArrowKeyPressed(event.direction);
    } else if (key === 'space') {
      this.#gameLogic?.onSpaceKeyPressed();
    }
  }

  onMouseEvent(event: CanvasMouseEvent) {}
}
