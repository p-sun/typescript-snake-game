import GridRenderer, { GridRenderConfig } from '../../GenericGame/GridRenderer';
import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import { GridSize } from '../../GenericModels/Grid';
import Rect from '../../GenericModels/Rect';
import Vec2 from '../../GenericModels/Vec2';
import { Triangle, TrianglesGameLogic } from '../models/TrianglesGameLogic';
import { getTriangleVerts } from './TriangleRenderHelpers';

export default class TrianglesGameRenderer {
  #showInstructions = true;
  darkenLowerLayers = false;

  #gridRenderer: GridRenderer;
  #colors: Color[];

  private readonly bgColor = Color.fromHex(0x1f2129);
  private readonly lineColor = Color.fromHex(0x9ac1af);

  constructor(canvas: ICanvas, gridSize: GridSize, cellSize: Vec2, colors: Color[]) {
    this.#colors = colors;

    const gridConfig: GridRenderConfig = {
      origin: Vec2.zero,
      cellSize: cellSize,
      background: {
        mode: 'fill',
        color: this.bgColor,
      },
      border: {
        lineColor: this.lineColor,
        lineWidth: 3,
      },
    };
    this.#gridRenderer = new GridRenderer(gridSize, canvas, gridConfig);

    this.toggleInstructions();
  }

  toggleInstructions() {
    this.#showInstructions = !this.#showInstructions;
    this.#gridRenderer.config.border.lineColor = this.#showInstructions ? this.bgColor : this.lineColor;
  }

  render(canvas: ICanvas, logic: TrianglesGameLogic) {
    this.#gridRenderer.render(canvas);

    if (!this.#showInstructions) {
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
    }

    this.drawInstructions(canvas);
  }

  private color(i: number, layer: number, layersCount: number) {
    // Multiplier is a value between 0.3 and 1. Top layer is the brightest.
    // layersCount =  1   2   3
    //    layer 0     1   .3  .3
    //    layer 1         1
    //    layer 2             1
    const min = 0.3;
    let multipler = 1;
    if (this.darkenLowerLayers && layersCount !== 1) {
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

  private drawTexts(canvas: ICanvas, texts: string[], start: number, lineHeight: number) {
    for (const [i, text] of texts.entries()) {
      this.drawText(canvas, text, new Vec2(0.3, start + lineHeight * i));
    }
  }

  private drawText(canvas: ICanvas, text: string, pos: Vec2) {
    canvas.drawText({
      text,
      position: pos.componentMul(this.#gridRenderer.cellSize),
      background: { color: this.bgColor },
      attributes: {
        color: Color.white,
        fontSize: 19,
      },
    });
  }

  private drawInstructions(canvas: ICanvas) {
    const start = 0.5;
    const lineHeight = 0.34;

    let texts = [`* Press 'i' to toggle instructions.`, `* Press 'SPACE' to generate new pattern.`];
    if (this.#showInstructions) {
      texts.push(
        `* Press 'h' to make triangles in lower layers darker colors.`,
        ``,
        `--- The Puzzle Game ---`,
        `The U-Fidget toy is a chain of foldable triangles.`,
        `This app turns that toy into a puzzle -- can you recreate the generated pattern?`,
        '',
        `--- The Puzzle Solution ---`,
        `Open the browser console to see the folds to re-create the pattern in real life.`,
        `(On Chrome: Right click -> Inspect -> Console).`,
        `Patterns begin with a triangle pointing to the top-right. First triangle starts: `,
        `                                                    Clockwise                         CounterCW`,
        `First triangle starts Clockwise:`,
        `     Start -> Up     Start -> Down    Start -> Flat`,
        ``,
        ``,
        ``,
        ` First triangle starts Counterclockwise:`,
        `     Start -> Up     Start -> Down                     Start -> Flat`
      );
    }
    this.drawTexts(canvas, texts, start, lineHeight);
    if (this.#showInstructions) {
      this.drawTrianglesForInstructions(canvas);
    }
  }

  private drawTrianglesForInstructions(canvas: ICanvas) {
    if (this.#showInstructions) {
      // Clockwise vs CounterClockwise
      const rectcw0 = this.#gridRenderer.cellContentRectAtPosition({ row: 4.2, column: 4.2 });
      this.drawTriangle(canvas, rectcw0, { rotation: 1, clockwise: true, index: 0 }, 3, this.#colors[0]);
      const rectccw0 = this.#gridRenderer.cellContentRectAtPosition({ row: 4.2, column: 6.8 });
      this.drawTriangle(canvas, rectccw0, { rotation: 1, clockwise: false, index: 0 }, 3, this.#colors[0]);

      const cwRow = 5.1;
      const indent = 0.6;
      const spacing = 1.3;
      const green = Color.fromHex(0xa7f205);
      // Start clockwise -> fold Up
      const rectcw1 = this.#gridRenderer.cellContentRectAtPosition({ row: cwRow, column: indent });
      this.drawTriangle(canvas, rectcw1, { rotation: 1, clockwise: true, index: 0 }, 3, this.#colors[0]);
      this.drawTriangle(canvas, rectcw1, { rotation: 2, clockwise: false, index: 1 }, 3, green);
      // Start clockwise -> fold Down
      const rectcw2 = this.#gridRenderer.cellContentRectAtPosition({ row: cwRow, column: indent + spacing });
      this.drawTriangle(canvas, rectcw2, { rotation: 2, clockwise: false, index: 1 }, 3, green);
      this.drawTriangle(canvas, rectcw2, { rotation: 1, clockwise: true, index: 0 }, 3, this.#colors[0]);
      // Start clockwise -> fold Flat
      const rectcw3 = this.#gridRenderer.cellContentRectAtPosition({ row: cwRow, column: indent + spacing * 2 });
      this.drawTriangle(canvas, rectcw3, { rotation: 1, clockwise: true, index: 0 }, 3, this.#colors[0]);
      const rectcw3_fold0 = this.#gridRenderer.cellContentRectAtPosition({
        row: cwRow,
        column: indent + spacing * 2 + 1,
      });
      this.drawTriangle(canvas, rectcw3_fold0, { rotation: 3, clockwise: true, index: 1 }, 3, green);

      const ccwRow = 6.8;
      // Start ccw -> fold Up
      const rectccw1 = this.#gridRenderer.cellContentRectAtPosition({ row: ccwRow, column: indent });
      this.drawTriangle(canvas, rectccw1, { rotation: 1, clockwise: false, index: 0 }, 3, this.#colors[0]);
      this.drawTriangle(canvas, rectccw1, { rotation: 4, clockwise: true, index: 1 }, 3, green);
      // Start ccw -> fold Down
      const rectccw2 = this.#gridRenderer.cellContentRectAtPosition({ row: ccwRow, column: indent + spacing });
      this.drawTriangle(canvas, rectccw2, { rotation: 4, clockwise: true, index: 1 }, 3, green);
      this.drawTriangle(canvas, rectccw2, { rotation: 1, clockwise: false, index: 0 }, 3, this.#colors[0]);
      // Start ccw -> fold Flat
      const rectccw3 = this.#gridRenderer.cellContentRectAtPosition({ row: ccwRow, column: 5.6 });
      this.drawTriangle(canvas, rectccw3, { rotation: 1, clockwise: false, index: 0 }, 3, this.#colors[0]);
      const rectccw3_fold0 = this.#gridRenderer.cellContentRectAtPosition({
        row: ccwRow - 1,
        column: 5.6,
      });
      this.drawTriangle(canvas, rectccw3_fold0, { rotation: 3, clockwise: false, index: 1 }, 3, green);
    }
  }
}
