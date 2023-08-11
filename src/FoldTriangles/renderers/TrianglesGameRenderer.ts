import GridRenderer, { GridRenderConfig } from '../../GenericGame/GridRenderer';
import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import { GridSize } from '../../GenericModels/Grid';
import Rect from '../../GenericModels/Rect';
import Vec2 from '../../GenericModels/Vec2';
import {
  TriangleRotation,
  TrianglesGameLogic,
} from '../models/TrianglesGameLogic';
import { getTriangleVerts } from './TriangleRenderHelpers';

export default class TrianglesGameRenderer {
  #gridRenderer: GridRenderer;

  constructor(canvas: ICanvas, gridSize: GridSize, cellSize: Vec2) {
    const gridConfig: GridRenderConfig = {
      origin: Vec2.zero,
      cellSize: cellSize,
      background: {
        mode: 'fill',
        color: Color.fromHex(0x81b29a),
      },
      border: {
        lineColor: Color.fromHex(0x9ac1af),
        lineWidth: 3,
      },
    };
    this.#gridRenderer = new GridRenderer(gridSize, canvas, gridConfig);
  }

  render(canvas: ICanvas, logic: TrianglesGameLogic) {
    this.#gridRenderer.render(canvas);

    this.#gridRenderer.forEachCell((cellPos, rect) => {
      for (let layer = 0; layer < logic.layersCount; layer++) {
        const cell = logic.getCell(layer, cellPos);
        if (cell) {
          this.drawTriangle(canvas, rect, cell.triangle1);
          if (cell.triangle2) {
            this.drawTriangle(canvas, rect, cell.triangle2);
          }
        }
      }
    });
  }

  private drawTriangle(
    canvas: ICanvas,
    rect: Rect,
    triangle: TriangleRotation
  ) {
    canvas.drawPolygon({
      points: getTriangleVerts(triangle, rect),
      stroke: {
        color: Color.black,
        thickness: 2,
      },
      fillColor: Color.green,
    });
  }
}
