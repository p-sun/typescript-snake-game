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
  #config: GridRenderConfig;

  constructor(config: Partial<GridRenderConfig>) {
    this.#config = { ...defaultConfig, ...config };
  }

  totalSize(gridSize: GridSize): Vec2 {
    const {
      cellSize,
      border: { lineWidth },
    } = this.#config;
    const { rowCount, columnCount } = gridSize;

    const width = cellSize.x * columnCount + lineWidth * (columnCount + 1);
    const height = cellSize.y * rowCount + lineWidth * (rowCount + 1);

    return new Vec2(width, height);
  }

  draw(canvas: Canvas, gridSize: GridSize) {
    const { background, border, origin } = this.#config;
    const totalSize = this.totalSize(gridSize);
    const { rowCount, columnCount } = gridSize;

    if (background) {
      if (background.mode === 'fill') {
        canvas.drawRect(origin, totalSize, background.color);
      } else {
        this.forEachCell(gridSize, (cellPos, rect) => {
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

      for (let column = 0; column <= columnCount; column++) {
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

      for (let row = 0; row <= rowCount; row++) {
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
    const { border, origin } = this.#config;

    const d = border.lineWidth;
    return origin.add(new Vec2(d, d));
  }

  forEachCell(
    gridSize: GridSize,
    fn: (cellPos: GridPosition, rect: Rect) => void
  ) {
    const { rowCount, columnCount } = gridSize;

    for (let column = 0; column < columnCount; column++) {
      for (let row = 0; row < rowCount; row++) {
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

  cellAtPosition(gridSize: GridSize, pos: Vec2): GridPosition {
    const {
      origin,
      cellSize,
      border: { lineWidth },
    } = this.#config;
    const { rowCount, columnCount } = gridSize;

    const { x, y } = pos.sub(origin);

    const c = x / (cellSize.x + lineWidth);
    const r = y / (cellSize.y + lineWidth);

    const column = clamp(Math.floor(c), {
      min: 0,
      max: columnCount - 1,
    });
    const row = clamp(Math.floor(r), { min: 0, max: rowCount - 1 });

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
      this.#convertNormalizedPositionInCell(start),
      this.#convertNormalizedPositionInCell(end),
      color,
      thickness
    );
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

    const p = this.#convertNormalizedPositionInCell({
      cellPos,
      normalizedOffset,
    });

    canvas.drawEllipse(p, rx, ry, color, options?.rotationAngle);
  }
}
