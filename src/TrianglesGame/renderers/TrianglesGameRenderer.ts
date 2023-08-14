import GridRenderer, { GridRenderConfig } from '../../GenericGame/GridRenderer';
import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import { GridSize } from '../../GenericModels/Grid';
import Rect from '../../GenericModels/Rect';
import Vec2 from '../../GenericModels/Vec2';
import { Triangle, TrianglesGameLogic } from '../models/TrianglesGameLogic';
import { getTriangleVerts } from './TriangleRenderHelpers';

export default class TrianglesGameRenderer {
  shouldDisplayInstructions = true;
  shouldDarkenLowerLayers = false;

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

    const layersCount = logic.pattern.layersCount;
    this.#gridRenderer.forEachCell((cellPos, rect) => {
      for (let layer = 0; layer < layersCount; layer++) {
        const cell = logic.getCell({ layer, ...cellPos });
        if (cell) {
          const color1 = this.color(cell.triangle1.index, layer, layersCount);
          this.drawTriangle(canvas, rect, cell.triangle1, logic.maxCount, color1);
          if (cell.triangle2) {
            const color2 = this.color(cell.triangle2.index, layer, layersCount);
            this.drawTriangle(canvas, rect, cell.triangle2, logic.maxCount, color2);
          }
        }
      }
    });

    if (this.shouldDisplayInstructions) {
      this.drawInstructions(canvas);
    }
  }

  private color(i: number, layer: number, layersCount: number) {
    // Multiplier is a value between 0.3 and 1. Top layer is the brightest.
    // layersCount =  1   2   3
    //    layer 0     1   .3  .3
    //    layer 1         1
    //    layer 2             1
    const min = 0.3;
    let multipler = 1;
    if (this.shouldDarkenLowerLayers && layersCount !== 1) {
      multipler = min + (layer * (1 - min)) / (layersCount - 1);
    }
    return this.#colors[i % this.#colors.length].mul(multipler);
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

  private drawInstructions(canvas: ICanvas) {
    this.drawText(canvas, `-- Pattern Generator for U-Fidgit --`, new Vec2(0.3, 0.5));
    this.drawText(
      canvas,
      `The U-Fidgit toy is a chain of triangles that can be folded into patterns.`,
      new Vec2(0.3, 1)
    );

    const start = 1.3;
    const height = 0.36;
    this.drawText(canvas, `Press 'SPACE' to generate new pattern.`, new Vec2(0.3, start + height * 2));
    this.drawText(
      canvas,
      `Press 'h' to toggle hints -- which makes triangles in lower layers darker colors.`,
      new Vec2(0.3, start + height * 3)
    );
    this.drawText(canvas, `Press 'i' to toggle the instructions.`, new Vec2(0.3, start + height * 1));
    this.drawText(
      canvas,
      `Open the console '⌘+Option+J' on Chrome for the folds to create the pattern.`,
      new Vec2(0.3, start + height * 5)
    );
    this.drawText(
      canvas,
      `All patterns begin with a pink triangle pointing to the top-right.`,
      new Vec2(0.3, start + height * 6)
    );
  }

  private drawText(canvas: ICanvas, text: string, pos: Vec2) {
    canvas.drawText({
      text,
      position: pos.componentMul(this.#gridRenderer.cellSize),
      attributes: {
        color: Color.white,
        fontSize: 19,
      },
    });
  }
}
