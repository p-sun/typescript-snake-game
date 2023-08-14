import Game from '../GenericGame/Game';
import { CanvasKeyEvent, CanvasMouseEvent, ICanvas } from '../GenericGame/ICanvas';
import Color from '../GenericModels/Color';
import Vec2 from '../GenericModels/Vec2';
import { TrianglesGameLogic } from './models/TrianglesGameLogic';
import TrianglesGameRenderer from './renderers/TrianglesGameRenderer';
import { printPatternDescription } from './utils/patternDescription';

export default class TrianglesGame extends Game {
  #triangleColors: Color[];
  #renderer: TrianglesGameRenderer;
  #logic: TrianglesGameLogic;

  constructor(config: { canvas: ICanvas; cellSize: Vec2; gridSize: number; triangleColors: Color[] }) {
    const { canvas, cellSize, gridSize, triangleColors } = config;
    super(canvas);

    this.#triangleColors = triangleColors;
    this.#logic = new TrianglesGameLogic({
      maxTriangles: triangleColors.length,
      gridSize,
    });

    this.#renderer = new TrianglesGameRenderer(
      canvas,
      { rowCount: gridSize, columnCount: gridSize },
      cellSize,
      triangleColors
    );

    this.generatePattern();
  }

  onUpdate() {}

  onRender(canvas: ICanvas) {}

  onKeyDown(event: CanvasKeyEvent) {
    if (event.key === 'space') {
      this.generatePattern();
    } else if (event.key === 'letter' && event.letter === 'H') {
      this.#renderer.shouldDarkenLowerLayers = !this.#renderer.shouldDarkenLowerLayers;
      this.#renderer.render(this.canvas, this.#logic);
    } else if (event.key === 'letter' && event.letter === 'I') {
      this.#renderer.shouldDisplayInstructions = !this.#renderer.shouldDisplayInstructions;
      this.#renderer.render(this.canvas, this.#logic);
    }
  }

  onMouseEvent(event: CanvasMouseEvent) {}

  private generatePattern() {
    this.#logic.generatePattern();
    this.#renderer.render(this.canvas, this.#logic);

    const { folds, startClockwise, layersCount } = this.#logic.pattern;
    printPatternDescription(folds, startClockwise, layersCount, this.#triangleColors);
  }
}
