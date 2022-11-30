import Canvas from './Canvas';
import Color from './GenericModels/Color';
import { GridPosition, GridSize } from './GenericModels/Grid';
import Rect from './GenericModels/Rect';
import Vec2 from './GenericModels/Vec2';
import { clamp } from './Utils';

export type GridRenderConfig = {
  origin: Vec2;
  cellSize: Vec2;
  background: GridBackground;
  border: GridBorder;
};

const defaultConfig: GridRenderConfig = {
  origin: Vec2.zero,
  cellSize: new Vec2(20, 20),
  background: {
    mode: 'checker',
    aColor: Color.white,
    bColor: Color.black,
  },
  border: {
    lineColor: Color.grey(),
    lineWidth: 0,
    style: 'solid',
  },
};

export type GridBackground =
  | { mode: 'fill'; color: Color }
  | { mode: 'checker'; aColor: Color; bColor: Color }
  | { mode: 'custom'; colorer: (pos: GridPosition) => Color };

export type GridBorder = {
  lineColor: Color;
  lineWidth: number;
  style?: 'solid' | 'dashed';
};

export default class GridRenderer {
  #gridSize: GridSize;
  #config: GridRenderConfig;

  constructor(
    gridSize: GridSize,
    cavas: Canvas,
    config: Partial<GridRenderConfig>
  ) {
    this.#config = { ...defaultConfig, ...config };
    this.#gridSize = gridSize;
    cavas.size = this.totalSize();
  }

  get rowCount(): number {
    return this.#gridSize.rowCount;
  }

  get columnCount(): number {
    return this.#gridSize.columnCount;
  }

  totalSize(): Vec2 {
    const {
      cellSize,
      border: { lineWidth },
    } = this.#config;

    const width =
      cellSize.x * this.columnCount + lineWidth * (this.columnCount + 1);
    const height = cellSize.y * this.rowCount + lineWidth * (this.rowCount + 1);

    return new Vec2(width, height);
  }

  draw(canvas: Canvas) {
    const { background, border, origin } = this.#config;
    const totalSize = this.totalSize();

    if (background) {
      if (background.mode === 'fill') {
        canvas.drawShape({
          mode: 'rect',
          options: { origin, size: totalSize, color: background.color },
        });
      } else {
        this.forEachCell((cellPos, rect) => {
          const color =
            background.mode === 'checker'
              ? (cellPos.row + cellPos.column) % 2
                ? background.aColor
                : background.bColor
              : background.colorer(cellPos);
          canvas.drawShape({
            mode: 'rect',
            options: { origin: rect.origin, size: rect.size, color },
          });
        });
      }
    }

    if (border && border.lineWidth > 0) {
      const { lineWidth, lineColor } = border;
      const shift = new Vec2(-lineWidth / 2, -lineWidth / 2);

      const lineDash = border.style === 'dashed' ? [lineWidth * 2] : [];

      for (let column = 0; column <= this.columnCount; column++) {
        const p = this.cellContentRectAtPosition({ row: 0, column }).origin.add(
          shift
        );

        canvas.drawShape({
          mode: 'line',
          options: {
            start: p,
            end: p.mapY((y) => y + totalSize.y),
            color: lineColor,
            thickness: lineWidth,
            lineDash,
          },
        });
      }

      for (let row = 0; row <= this.rowCount; row++) {
        const p = this.cellContentRectAtPosition({ row, column: 0 }).origin.add(
          shift
        );

        canvas.drawShape({
          mode: 'line',
          options: {
            start: p,
            end: p.mapX((x) => x + totalSize.x),
            color: lineColor,
            thickness: lineWidth,
            lineDash,
          },
        });
      }
    }
  }

  get cellContentOrigin(): Vec2 {
    const { border, origin } = this.#config;

    const d = border.lineWidth;
    return origin.add(new Vec2(d, d));
  }

  forEachCell(fn: (cellPos: GridPosition, rect: Rect) => void) {
    for (let column = 0; column < this.columnCount; column++) {
      for (let row = 0; row < this.rowCount; row++) {
        const cellPos = { row, column };
        fn(cellPos, this.cellContentRectAtPosition(cellPos));
      }
    }
  }

  cellContentRectAtPosition(cellPos: GridPosition): Rect {
    const {
      cellSize,
      border: { lineWidth },
    } = this.#config;

    const { row, column } = cellPos;

    const offset = new Vec2(
      (cellSize.x + lineWidth) * column,
      (cellSize.y + lineWidth) * row
    );

    return new Rect(this.cellContentOrigin.add(offset), cellSize);
  }

  cellAtPosition(pos: Vec2): GridPosition {
    const {
      origin,
      cellSize,
      border: { lineWidth },
    } = this.#config;
    const { x, y } = pos.sub(origin);

    const c = x / (cellSize.x + lineWidth);
    const r = y / (cellSize.y + lineWidth);

    const column = clamp(Math.floor(c), {
      min: 0,
      max: this.columnCount - 1,
    });
    const row = clamp(Math.floor(r), { min: 0, max: this.rowCount - 1 });

    return { column, row };
  }

  fillCell(canvas: Canvas, cellPos: GridPosition, color: Color) {
    const rect = this.cellContentRectAtPosition(cellPos);
    canvas.drawShape({
      mode: 'rect',
      options: { origin: rect.origin, size: rect.size, color },
    });
  }

  drawLine(
    canvas: Canvas,
    start: { cellPos: GridPosition; normalizedOffset: Vec2 },
    end: { cellPos: GridPosition; normalizedOffset: Vec2 },
    color: Color,
    thickness: number = 1
  ) {
    canvas.drawShape({
      mode: 'line',
      options: {
        start: this.#convertNormalizedPositionInCell(start),
        end: this.#convertNormalizedPositionInCell(end),
        color,
        thickness,
      },
    });
  }

  #convertNormalizedPositionInCell(coord: {
    cellPos: GridPosition;
    normalizedOffset: Vec2;
  }): Vec2 {
    const rect = this.cellContentRectAtPosition(coord.cellPos);
    const { size } = rect;
    const { normalizedOffset } = coord;

    return rect.midpoint.add(
      new Vec2(
        (normalizedOffset.x * size.x) / 2,
        (normalizedOffset.y * size.y) / 2
      )
    );
  }

  drawEllipseInCell(
    canvas: Canvas,
    cellPos: GridPosition,
    color: Color,
    options?: {
      fillPercent?: Vec2;
      normalizedOffset?: Vec2;
      rotationAngle?: number;
    }
  ) {
    const rect = this.cellContentRectAtPosition(cellPos);
    const { size } = rect;

    const rx = (size.x / 2) * (options?.fillPercent?.x ?? 1);
    const ry = (size.y / 2) * (options?.fillPercent?.y ?? 1);

    const normalizedOffset = options?.normalizedOffset ?? Vec2.zero;

    const origin = this.#convertNormalizedPositionInCell({
      cellPos,
      normalizedOffset,
    });
    const rotationAngle = options?.rotationAngle;
    canvas.drawShape({
      mode: 'ellipse',
      options: { origin, rx, ry, color, rotationAngle },
    });
  }
}
