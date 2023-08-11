import Game from '../GenericGame/Game';
import { CanvasKeyEvent, CanvasMouseEvent, ICanvas } from '../GenericGame/ICanvas';
import Color from '../GenericModels/Color';
import Vec2 from '../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';

const triangleColors = ([] as Color[])
  .concat(Array.from({ length: 5 }, () => Color.fromHex(0xf2798f))) // pink
  .concat(Array.from({ length: 5 }, () => Color.fromHex(0xbb66ed))) // purple
  .concat(Array.from({ length: 5 }, () => Color.fromHex(0x00c1ed))) // blue
  .concat(Array.from({ length: 5 }, () => Color.fromHex(0xa7f205))); // green

export default class TrianglesGame extends Game {
  #renderer: TrianglesGameRenderer;
  #logic: TrianglesGameLogic;

  constructor(config: { canvas: ICanvas; cellSize: Vec2 }) {
    const { canvas, cellSize } = config;
    super(canvas);

    this.#logic = new TrianglesGameLogic({
      maxTriangles: triangleColors.length,
      gridSize: 10,
    });

    const gridSize = this.#logic.gridSize;
    this.#renderer = new TrianglesGameRenderer(
      canvas,
      { rowCount: gridSize, columnCount: gridSize },
      cellSize,
      triangleColors
    );

    this.#renderer.render(canvas, this.#logic);
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {}

  onKeyDown(event: CanvasKeyEvent) {
    if (event.key === 'space') {
      this.#logic.generatePattern();
      this.#renderer.render(this.canvas, this.#logic);
    }
  }

  onMouseEvent(event: CanvasMouseEvent) {}
}
