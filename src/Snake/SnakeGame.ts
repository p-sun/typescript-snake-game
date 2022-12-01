import Canvas, { CanvasKeyEvent, CanvasMouseEvent } from '../Canvas';
import Game from '../Game';
import { GridSize } from '../GenericModels/Grid';
import SnakeGameLogic from './SnakeGameLogic';
import SnakeGameRenderer from './SnakeGameRenderer';

export type SnakePlayStatus = 'waiting' | 'playing' | 'lost';

export default class SnakeGame extends Game {
  private readonly gridSize: GridSize = { rowCount: 34, columnCount: 34 };

  #gameLogic: SnakeGameLogic;
  #renderer: SnakeGameRenderer;

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    this.#gameLogic = new SnakeGameLogic(this.gridSize);
    this.#renderer = new SnakeGameRenderer(this.canvas, this.gridSize);
  }

  onUpdate() {
    this.#gameLogic?.tick();
  }

  onRender(canvas: Canvas) {
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
