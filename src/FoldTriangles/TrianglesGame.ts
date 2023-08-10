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
    trianglesCount: number;
  }) {
    const { canvas, cellSize, trianglesCount } = config;
    super(canvas);

    let gridSize = Math.ceil(trianglesCount / 2) * 2 + 1;
    this.#renderer = new TrianglesGameRenderer(
      canvas,
      { rowCount: gridSize, columnCount: gridSize },
      cellSize
    );

    this.#logic = new TrianglesGameLogic({ trianglesCount });
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {
    this.#renderer.render(canvas, this.#logic);
  }

  onKeyDown(event: CanvasKeyEvent) {}

  onMouseEvent(event: CanvasMouseEvent) {}
}
