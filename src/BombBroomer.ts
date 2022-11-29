import Canvas, { CanvasMouseEvent } from './Canvas';
import Color from './Color';
import Game from './Game';
import Grid, { GridPosition } from './Grid';
import { randomIntInRange } from './Utils';
import Vec2 from './Vec2';

type CellData =
  | { kind: 'flag'; count: number }
  | { kind: 'covered' | 'cleared' };

export default class BombBroomer extends Game {
  #grid: Grid;

  #hasBombs: boolean[][];

  #cellData: CellData[][];

  constructor(rootElement: HTMLElement) {
    super(rootElement);

    this.#grid = new Grid();
    this.#grid.columnCount = 20;
    this.#grid.rowCount = 20;
    this.#grid.cellSize = new Vec2(16, 16);

    this.#hasBombs = [];
    this.#cellData = [];

    for (let row = 0; row < this.#grid.rowCount; row++) {
      this.#hasBombs.push(Array(this.#grid.columnCount).fill(false));

      this.#cellData.push(
        Array(this.#grid.columnCount).fill({
          kind: 'covered',
        })
      );
    }

    this.#generateBombLocations();

    this.#grid.border = {
      lineColor: Color.grey(0.5),
      lineWidth: 2,
    };

    this.#grid.background = {
      mode: 'custom',
      colorer: ({ row, column }) => {
        if (this.#hasBombs[row][column]) {
          return Color.blue;
        } else if (this.#cellData[row][column].kind === 'cleared') {
          return Color.white;
        }
        return Color.grey(0.7);
      },
    };

    this.canvas.size = this.#grid.totalSize;
  }

  #generateBombLocations() {
    const totalBombs = 80;

    for (let i = 0; i < totalBombs; i++) {
      let column = randomIntInRange(0, this.#grid.columnCount);
      let row = randomIntInRange(0, this.#grid.rowCount);

      while (this.#hasBombs[row][column]) {
        column = randomIntInRange(0, this.#grid.columnCount);
        row = randomIntInRange(0, this.#grid.rowCount);
      }

      this.#hasBombs[row][column] = true;
    }
  }

  #numberOfBombsNeighboringCell(pos: GridPosition): number {
    let count = 0;

    for (let column = pos.column - 1; column <= pos.column + 1; column++) {
      for (let row = pos.row - 1; row <= pos.row + 1; row++) {
        if (
          !(row === pos.row && column === pos.column) &&
          row >= 0 &&
          row < this.#grid.rowCount &&
          column >= 0 &&
          column < this.#grid.columnCount &&
          this.#hasBombs[row][column]
        ) {
          count++;
        }
      }
    }
    return count;
  }

  update(canvas: Canvas) {
    this.#grid.draw(canvas);

    for (let row = 0; row < this.#grid.rowCount; row++) {
      for (let column = 0; column < this.#grid.columnCount; column++) {
        const rect = this.#grid.cellContentRectAtPosition({ row, column });

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

  onKeyDown(event: KeyboardEvent) {}

  onMouseEvent(event: CanvasMouseEvent, pos: Vec2) {
    if (event.mode === 'button' && event.state === 'down') {
      const cellPos = this.#grid.cellAtPosition(pos);

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
          row < this.#grid.rowCount &&
          column < this.#grid.columnCount
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
