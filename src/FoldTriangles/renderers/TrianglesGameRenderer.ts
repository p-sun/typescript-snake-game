import GridRenderer, { GridRenderConfig } from '../../GenericGame/GridRenderer';
import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import { GridSize } from '../../GenericModels/Grid';
import Vec2 from '../../GenericModels/Vec2';
import { getTriangleVerts } from '../models/TrianglePosition';
import { TrianglesGameLogic } from '../models/TrianglesGameLogic';

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
      const cell = logic.getCell(0, cellPos.column, cellPos.row);
      if (cell) {
        // console.log(`cell ${cellPos.row}, ${cellPos.column} is filled`);
        // canvas.drawRect({
        //   origin: rect.origin,
        //   size: rect.size,
        //   color: Color.green,
        // });
        const verts = getTriangleVerts(cell.trianglePos, rect);
        canvas.drawPolygon({
          points: verts,
          stroke: {
            color: Color.black,
            thickness: 2,
          },
          fillColor: Color.green,
        });
      }
    });
  }
}
