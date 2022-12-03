import { ICanvas, CanvasKeyEvent, CanvasMouseEvent } from '../Canvas';
import Game from '../Game';
import { GridSize } from '../GenericModels/Grid';
import SnakeGameLogic from './SnakeGameLogic';
import SnakeGameRenderer from './SnakeGameRenderer';

export type SnakePlayStatus = 'waiting' | 'playing' | 'lost';

export default class SnakeGame extends Game {
  #gameLogic: SnakeGameLogic;
  #renderer: SnakeGameRenderer;

  constructor(
    canvas: ICanvas,
    gridSize: GridSize,
    gameLogic?: SnakeGameLogic,
    renderer?: SnakeGameRenderer
  ) {
    super(canvas);

    this.#gameLogic = gameLogic ?? new SnakeGameLogic(gridSize);
    this.#renderer = renderer ?? new SnakeGameRenderer(this.canvas, gridSize);
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
