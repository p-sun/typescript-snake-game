import GridRenderer, { GridRenderConfig } from '../../GenericGame/GridRenderer';
import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import { GridSize } from '../../GenericModels/Grid';
import Rect from '../../GenericModels/Rect';
import Vec2 from '../../GenericModels/Vec2';
import { Triangle, TrianglesGameLogic } from '../models/TrianglesGameLogic';
import { getTriangleVerts } from './TriangleRenderHelpers';

export default class TrianglesGameRenderer {
  #gridRenderer: GridRenderer;
  #colors: Color[];

  constructor(canvas: ICanvas, gridSize: GridSize, cellSize: Vec2, colors: Color[]) {
    this.#colors = colors;

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
        const cell = logic.getCell({ layer, ...cellPos });
        if (cell) {
          const color1 = this.color(cell.triangle1.index, layer, logic.layersCount);
          this.drawTriangle(canvas, rect, cell.triangle1, logic.maxCount, color1);
          if (cell.triangle2) {
            const color2 = this.color(cell.triangle2.index, layer, logic.layersCount);
            this.drawTriangle(canvas, rect, cell.triangle2, logic.maxCount, color2);
          }
        }
      }
    });
  }

  private color(i: number, layer: number, layersCount: number) {
    // layer === layersCount - 1 --> multiply by 1
    // layer < layersCount --> mulitply by 0.3...1
    return this.#colors[i % this.#colors.length].mul(0.3 + (0.7 * layer) / (layersCount - 1));
  }

  private drawTriangle(canvas: ICanvas, rect: Rect, triangle: Triangle, trianglesCount: number, triangleColor: Color) {
    const verts = getTriangleVerts(triangle.rotation, rect);
    canvas.drawPolygon({
      points: verts,
      stroke: {
        color: Color.black,
        thickness: 4,
      },
      fillColor: triangleColor,
    });

    const { clockwise: clockwise, index } = triangle;
    if ((!clockwise && index !== 0) || (clockwise && index !== trianglesCount - 1)) {
      this.drawJoint(canvas, verts[0], verts[1]);
    }
    if ((!clockwise && index !== trianglesCount - 1) || (clockwise && index !== 0)) {
      this.drawJoint(canvas, verts[1], verts[2]);
    }
  }

  private drawJoint(canvas: ICanvas, from: Vec2, to: Vec2) {
    const dir = new Vec2(to.x - from.x, to.y - from.y).mul(0.28);
    const center = from.add(to).mul(0.5);
    canvas.drawLine({
      start: center.sub(dir),
      end: center.add(dir),
      color: Color.black,
      thickness: 8,
    });
  }
}
