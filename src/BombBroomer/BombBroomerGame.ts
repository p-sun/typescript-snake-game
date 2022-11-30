import Canvas, { CanvasKeyEvent, CanvasMouseEvent } from '../Canvas';
import Game from '../Game';
import Color from '../GenericModels/Color';
import { GridPosition, GridSize } from '../GenericModels/Grid';
import Vec2 from '../GenericModels/Vec2';
import GridRenderer from '../GridRenderer';
import { randomIntInRange } from '../Utils';

type CellData =
  | { kind: 'flag'; count: number }
  | { kind: 'covered' | 'cleared' };

export default class BombBroomerGame extends Game {
  // Game Logic
  #gridSize: GridSize;
  #hasBombs: boolean[][];
  #cellData: CellData[][];

  // Rendering Logic
  #gridRenderer: GridRenderer;

  private get rowCount() {
    return this.#gridSize.rowCount;
  }

  private get columnCount() {
    return this.#gridSize.columnCount;
  }

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    // Game Logic

    this.#gridSize = { rowCount: 20, columnCount: 20 };
    this.#hasBombs = [];
    this.#cellData = [];
    this.#generateBombLocations();

    // Rendering Logic

    this.#gridRenderer = new GridRenderer({
      cellSize: new Vec2(16, 16),
      border: {
        lineColor: Color.grey(0.5),
        lineWidth: 2,
      },
      background: {
        mode: 'custom',
        colorer: ({ row, column }) => {
          if (this.#hasBombs[row][column]) {
            return Color.blue;
          } else if (this.#cellData[row][column].kind === 'cleared') {
            return Color.white;
          }
          return Color.grey(0.7);
        },
      },
    });

    this.canvas.size = this.#gridRenderer.totalSize(this.#gridSize);
  }

  #generateBombLocations() {
    this.#createEmptyBombGrid();
    const totalBombs = 80;
    for (let i = 0; i < totalBombs; i++) {
      let column = randomIntInRange(0, this.columnCount);
      let row = randomIntInRange(0, this.rowCount);

      while (this.#hasBombs[row][column]) {
        column = randomIntInRange(0, this.columnCount);
        row = randomIntInRange(0, this.rowCount);
      }

      this.#hasBombs[row][column] = true;
    }
  }

  #createEmptyBombGrid() {
    for (let row = 0; row < this.rowCount; row++) {
      this.#hasBombs.push(Array(this.columnCount).fill(false));

      this.#cellData.push(
        Array(this.columnCount).fill({
          kind: 'covered',
        })
      );
    }
  }

  #numberOfBombsNeighboringCell(pos: GridPosition): number {
    let count = 0;

    for (let column = pos.column - 1; column <= pos.column + 1; column++) {
      for (let row = pos.row - 1; row <= pos.row + 1; row++) {
        if (
          !(row === pos.row && column === pos.column) &&
          row >= 0 &&
          row < this.rowCount &&
          column >= 0 &&
          column < this.columnCount &&
          this.#hasBombs[row][column]
        ) {
          count++;
        }
      }
    }
    return count;
  }

  update(canvas: Canvas) {
    this.#gridRenderer.draw(canvas, this.#gridSize);

    for (let row = 0; row < this.rowCount; row++) {
      for (let column = 0; column < this.columnCount; column++) {
        const rect = this.#gridRenderer.cellContentRectAtPosition({
          row,
          column,
        });

        const numberOfBombs = this.#numberOfBombsNeighboringCell({
          row,
          column,
        });

        if (!this.#hasBombs[row][column] && numberOfBombs !== 0) {
          canvas.drawTextAtPosition(
            numberOfBombs.toString(),
            rect.midpoint,
            {
              color: [
                Color.blue,
                Color.green,
                Color.red,
                Color.magenta,
                Color.orange,
                Color.yellow,
                Color.white,
              ][numberOfBombs - 1],
              fontSize: 13,
            },
            {
              normalizedOffsetX: 0,
              normalizedOffsetY: 0,
            }
          );
        }
      }
    }
  }

  onKeyDown(event: CanvasKeyEvent) {}

  onMouseEvent(event: CanvasMouseEvent, pos: Vec2) {
    if (event.mode === 'button' && event.state === 'down') {
      const cellPos = this.#gridRenderer.cellAtPosition(this.#gridSize, pos);

      if (event.button === 'primary') {
        this.#clearCell(cellPos);
      }
    }
  }

  #clearCell(cellPos: GridPosition) {
    let visitedLocations = new Map<number, Set<number>>();

    let stack: GridPosition[] = [cellPos];
    visitedLocations.set(cellPos.row, new Set([cellPos.column]));

    const offsets = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (stack.length > 0) {
      const pos = stack.pop();

      this.#cellData[pos.row][pos.column] = { kind: 'cleared' };

      offsets.forEach(([dr, dc]) => {
        const row = pos.row + dr;
        const column = pos.column + dc;

        if (
          row >= 0 &&
          column >= 0 &&
          row < this.rowCount &&
          column < this.columnCount
        ) {
          if (
            !this.#numberOfBombsNeighboringCell({ row, column }) &&
            !visitedLocations.get(row)?.has(column)
          ) {
            let s = visitedLocations.get(row);
            if (!s) {
              s = new Set<number>();
              visitedLocations.set(row, s);
            }

            s.add(column);

            stack.push({ row, column });
          }
        }
      });
    }
  }
}
