import Canvas from './Canvas';
import Vec2 from './Vec2';
import Color from './Color';
import Rect from './Rect';
import { clamp } from './Utils';

export type GridPosition = {
  row: number;
  column: number;
};

export function GridPositionEqual(a: GridPosition, b: GridPosition) {
  return a.row === b.row && a.column === b.column;
}

export type GridBackground =
  | { mode: 'fill'; color: Color }
  | { mode: 'checker'; aColor: Color; bColor: Color }
  | { mode: 'custom'; colorer: (pos: GridPosition) => Color };

export type GridBorder = {
  lineColor: Color;
  lineWidth: number;
  style?: 'solid' | 'dashed';
};

export default class Grid {
  public origin: Vec2 = Vec2.zero;

  public cellSize: Vec2 = new Vec2(20, 20);
  public rowCount: number = 5;
  public columnCount: number = 5;

  public background: GridBackground = {
    mode: 'checker',
    aColor: Color.white,
    bColor: Color.black,
  };
  public border: GridBorder = {
    lineColor: Color.grey(),
    lineWidth: 0,
    style: 'solid',
  };

  constructor() { }

  get totalSize(): Vec2 {
    const { lineWidth } = this.border;
    const { rowCount, columnCount, cellSize } = this;

    const width = cellSize.x * columnCount + lineWidth * (columnCount + 1);
    const height = cellSize.y * rowCount + lineWidth * (rowCount + 1);

    return new Vec2(width, height);
  }

  draw(canvas: Canvas) {
    const { background, border } = this;
    const { totalSize } = this;

    if (background) {
      if (background.mode === 'fill') {
        canvas.drawRect(this.origin, totalSize, background.color);
      } else {
        this.forEachCell((cellPos, rect) => {
          const color =
            background.mode === 'checker'
              ? (cellPos.row + cellPos.column) % 2
                ? background.aColor
                : background.bColor
              : background.colorer(cellPos);

          canvas.drawRect(rect.origin, rect.size, color);
        });
      }
    }

    if (border && border.lineWidth > 0) {
      const { lineWidth, lineColor } = border;
      const shift = new Vec2(-lineWidth / 2, -lineWidth / 2);

      const dashes = border.style === 'dashed' ? [lineWidth * 2] : [];

      for (let column = 0; column <= this.columnCount; column++) {
        const p = this.cellContentRectAtPosition({ row: 0, column }).origin.add(
          shift
        );

        canvas.drawLine(
          p,
          p.mapY((y) => y + totalSize.y),
          lineColor,
          lineWidth,
          dashes
        );
      }

      for (let row = 0; row <= this.rowCount; row++) {
        const p = this.cellContentRectAtPosition({ row, column: 0 }).origin.add(
          shift
        );

        canvas.drawLine(
          p,
          p.mapX((x) => x + totalSize.x),
          lineColor,
          lineWidth,
          dashes
        );
      }
    }
  }

  get cellContentOrigin(): Vec2 {
    const d = this.border.lineWidth;
    return this.origin.add(new Vec2(d, d));
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
    } = this;

    const { row, column } = cellPos;

    const offset = new Vec2(
      (cellSize.x + lineWidth) * column,
      (cellSize.y + lineWidth) * row
    );

    return new Rect(this.cellContentOrigin.add(offset), cellSize);
  }

  cellAtPosition(pos: Vec2): GridPosition {
    const { x, y } = pos.sub(this.origin);

    const c = x / (this.cellSize.x + this.border.lineWidth);
    const r = y / (this.cellSize.y + this.border.lineWidth);

    const column = clamp(Math.floor(c), {
      min: 0,
      max: this.columnCount - 1,
    });
    const row = clamp(Math.floor(r), { min: 0, max: this.rowCount - 1 });

    return { column, row };
  }

  fillCell(canvas: Canvas, cellPos: GridPosition, color: Color) {
    const rect = this.cellContentRectAtPosition(cellPos);
    canvas.drawRect(rect.origin, rect.size, color);
  }

  drawLine(
    canvas: Canvas,
    start: { cellPos: GridPosition; normalizedOffset: Vec2 },
    end: { cellPos: GridPosition; normalizedOffset: Vec2 },
    color: Color,
    thickness: number = 1
  ) {
    canvas.drawLine(
      this.convertNormalizedPositionInCell(start),
      this.convertNormalizedPositionInCell(end),
      color,
      thickness
    );
  }

  convertNormalizedPositionInCell(coord: {
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

    const p = this.convertNormalizedPositionInCell({
      cellPos,
      normalizedOffset,
    });

    canvas.drawEllipse(p, rx, ry, color, options?.rotationAngle);
  }
}
