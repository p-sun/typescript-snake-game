import Game from '../GenericGame/Game';
import {
  CanvasKeyEvent,
  CanvasMouseEvent,
  ICanvas,
} from '../GenericGame/ICanvas';
import { GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';

export default class TrianglesGame extends Game {
  #renderer: TrianglesGameRenderer;

  #trianglesCount: number;

  constructor(config: {
    canvas: ICanvas;
    cellSize: Vec2;
    trianglesCount: number;
  }) {
    const { canvas, cellSize, trianglesCount } = config;
    super(canvas);
    this.#trianglesCount = trianglesCount;

    let gridSize = Math.ceil(trianglesCount / 2) * 2 + 1;
    this.#renderer = new TrianglesGameRenderer(
      canvas,
      { rowCount: gridSize, columnCount: gridSize },
      cellSize
    );
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {
    this.#renderer.render(canvas);
  }

  onKeyDown(event: CanvasKeyEvent) {}

  onMouseEvent(event: CanvasMouseEvent) {}
}
