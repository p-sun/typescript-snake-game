import Game from '../GenericGame/Game';
import {
  CanvasKeyEvent,
  CanvasMouseEvent,
  ICanvas,
} from '../GenericGame/ICanvas';
import Vec2 from '../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';

export default class TrianglesGame extends Game {
  #renderer: TrianglesGameRenderer;
  #logic: TrianglesGameLogic;

  constructor(config: {
    canvas: ICanvas;
    cellSize: Vec2;
    maxTriangles: number;
  }) {
    const { canvas, cellSize, maxTriangles } = config;
    super(canvas);

    this.#logic = new TrianglesGameLogic({ maxTriangles });

    const gridSize = this.#logic.gridSize;
    this.#renderer = new TrianglesGameRenderer(
      canvas,
      { rowCount: gridSize, columnCount: gridSize },
      cellSize
    );

    this.#renderer.render(canvas, this.#logic);
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {}

  onKeyDown(event: CanvasKeyEvent) {}

  onMouseEvent(event: CanvasMouseEvent) {}
}
