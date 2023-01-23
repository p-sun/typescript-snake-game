import Game from '../GenericGame/Game';
import GridRenderer from '../GenericGame/GridRenderer';
import {
  CanvasKeyEvent,
  CanvasMouseEvent,
  ICanvas,
} from '../GenericGame/ICanvas';
import Color from '../GenericModels/Color';
import Vec2 from '../GenericModels/Vec2';
import SudokuBoard, { CellBrush } from './Board';

const cellDim = 34;

export default class SudokuGame extends Game {
  #grid: GridRenderer;
  #numberPicker: GridRenderer;

  #board: SudokuBoard;

  #brush: CellBrush = { kind: 'solution', digit: 1 };

  static #glyphs = true ? '123456789' : [...'🍓🍇🍎🍉🍊🍋🍍🥝🫐'];

  constructor(canvas: ICanvas) {
    super(canvas);

    this.#board = SudokuBoard.generateRandom(0.33);

    const gridSize = {
      rowCount: this.#board.rowCount,
      columnCount: this.#board.columnCount,
    };

    this.#grid = new GridRenderer(gridSize, this.canvas, {
      cellSize: new Vec2(cellDim, cellDim),
      border: {
        lineColor: Color.black,
        lineWidth: 1,
      },
      background: undefined,
    });

    const blockSize = {
      rowCount: this.#board.blockSize,
      columnCount: this.#board.blockSize,
    };
    this.#numberPicker = new GridRenderer(blockSize, this.canvas, {
      cellSize: new Vec2(cellDim, cellDim),
      border: {
        lineColor: Color.black,
        lineWidth: 1,
      },
      background: undefined,
    });

    this.#numberPicker.midpoint = this.#grid.rect
      .convertNormalizedPosition(new Vec2(1, 0.5))
      .add(new Vec2(this.#numberPicker.totalSize().x / 2.0 + cellDim, 0));

    this.canvas.size = Vec2.max(
      this.#grid.rect.convertNormalizedPosition(new Vec2(1, 1)),
      this.#numberPicker.rect.convertNormalizedPosition(new Vec2(1, 1))
    );
  }

  onUpdate(): void {}

  onRender(canvas: ICanvas): void {
    canvas.clear(Color.white);
    this.#renderBoard(canvas);
    this.#renderBoardCells(canvas);

    this.#renderNumberPicker(canvas);

    if (this.#board.isSolved()) {
      this.#renderPlayAgainOverlay(canvas);
    }
  }

  onKeyDown(event: CanvasKeyEvent): void {
    if (this.#board.isSolved()) {
      if (event.key === 'letter') {
        if (event.letter === 'E') {
          this.#board = SudokuBoard.generateRandom(0.33);
        } else if (event.letter === 'M') {
          this.#board = SudokuBoard.generateRandom(0.67);
        }
        if (event.letter === 'H') {
          this.#board = SudokuBoard.generateRandom(1.0);
        }
      }
    } else if (event.key === 'digit') {
      if (event.digit !== 0) {
        this.#brush.digit = event.digit - 1;
      }
    } else if (event.key === 'backspace') {
      this.#brush.digit = undefined;
    }
  }

  onMouseEvent(event: CanvasMouseEvent, pos: Vec2) {
    if (this.#board.isSolved()) {
      return;
    }

    if (
      event.mode === 'button' &&
      event.state === 'down' &&
      event.button === 'primary'
    ) {
      if (this.#grid.rect.contains(pos)) {
        const gridPos = this.#grid.cellAtPosition(pos);
        this.#board = this.#board.withBrushAppliedToCell(gridPos, this.#brush);
      } else if (this.#numberPicker.rect.contains(pos)) {
        const gridPos = this.#numberPicker.cellAtPosition(pos);
        const index =
          gridPos.row * this.#numberPicker.columnCount + gridPos.column;
        const digit = this.#board.digitSet[index];

        this.#brush.digit = digit;
      }
    }
  }

  #renderNumberPicker(canvas: ICanvas) {
    this.#numberPicker.render(canvas);

    const digits = this.#board.digitSet;

    this.#numberPicker.forEachCell((pos, rect, idx) => {
      const digit = digits[idx];
      if (this.#brush.digit === digit) {
        this.#numberPicker.fillCell(canvas, pos, Color.grey(0.3));
      } else {
        this.#numberPicker.fillCell(canvas, pos, Color.white);
      }

      canvas.drawText({
        text: SudokuGame.#glyphs[digit],
        position: rect.midpoint,
        attributes: {
          color: this.#brush.digit === digit ? Color.white : Color.grey(),
          fontSize: 24,
        },
        normalizedAnchorOffset: {
          offsetX: 0,
          offsetY: 0,
        },
      });
    });

    this.canvas.drawText({
      text: 'Delete',
      position: this.#numberPicker.rect
        .convertNormalizedPosition(new Vec2(0.5, 1))
        .mapY((y) => y + 0.5 * cellDim),
      attributes: {
        color:
          this.#brush.digit === undefined
            ? new Color(1, 0.7, 0.7)
            : Color.grey(0.3),
        fontSize: 24,
      },
      normalizedAnchorOffset: {
        offsetX: 0,
        offsetY: 0,
      },
      background:
        this.#brush.digit === undefined
          ? {
              color: Color.grey(),
              padding: 4,
            }
          : undefined,
    });
  }

  #renderBoard(canvas: ICanvas) {
    this.#grid.render(canvas);

    for (let ctr = 1; ctr < this.#board.blockCount; ctr++) {
      this.#grid.drawLine(
        canvas,
        {
          cellPos: { row: this.#board.blockSize * ctr, column: 0 },
          normalizedOffset: new Vec2(-1, -1),
        },
        {
          cellPos: {
            row: this.#board.blockSize * ctr,
            column: this.#board.columnCount - 1,
          },
          normalizedOffset: new Vec2(1, -1),
        },
        Color.black,
        3
      );

      this.#grid.drawLine(
        canvas,
        {
          cellPos: { row: 0, column: this.#board.blockSize * ctr },
          normalizedOffset: new Vec2(-1, -1),
        },
        {
          cellPos: {
            row: this.#board.rowCount,
            column: this.#board.blockSize * ctr,
          },
          normalizedOffset: new Vec2(-1, -1),
        },
        Color.black,
        3
      );
    }
  }

  #renderBoardCells(canvas: ICanvas) {
    for (const { position, data } of this.#board.cells()) {
      const valid = this.#board.isCellValid(position);
      if (!valid) {
        this.#grid.fillCell(canvas, position, new Color(1, 0.7, 0.7));
      }

      if (data.value !== undefined) {
        const pos = this.#grid
          .cellContentRectAtPosition(position)
          .midpoint.roundToIntegers();
        this.canvas.drawTextAtPosition(SudokuGame.#glyphs[data.value], pos, {
          fontSize: 24,
          color: data.locked ? Color.blue : Color.black,
        });
      }
    }
  }

  #renderPlayAgainOverlay(canvas: ICanvas) {
    canvas.clear(Color.grey());

    canvas.drawTextAtPosition('Great job! Play again?', canvas.midpoint, {
      fontSize: 24,
      color: Color.white,
    });

    canvas.drawTextAtPosition(
      '[E]asy, [M]edium, [Hard]',
      canvas.midpoint.mapY((y) => y + 28),
      {
        fontSize: 20,
        color: Color.white,
      }
    );
  }
}
