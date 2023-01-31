import BombBroomerGame from "./src/BombBroomer/BombBroomerGame";
import EasingRenderer from "./src/Playgrounds/EasingRenderer";
import HTMLCanvas from "./src/GenericGame/HTMLCanvas";
import { ICanvas } from "./src/GenericGame/ICanvas";
import SnakeGame from "./src/SnakeGame/SnakeGame";
import SudokuGame from "./src/Sudoku/SudokuGame";
import Vec2 from "./src/GenericModels/Vec2";
import Game from "./src/GenericGame/Game";

const Games: { [k: string]: (canvas: ICanvas) => Game } = {
  Snake: (canvas) => {
    const gridSize = { rowCount: 18, columnCount: 18 };
    const cellSize = new Vec2(22, 22);
    return new SnakeGame(canvas, gridSize, cellSize);
  },
  BombBroomer: (canvas) => new BombBroomerGame(canvas),
  Sudoku: (canvas) => new SudokuGame(canvas),
};

const Playgrounds = {
  Easing: (canvas) => {
    const size = new Vec2(1000, 230);
    canvas.size = size;
    return new EasingRenderer({
      size,
    });
  },
};

const appRoot = document.getElementById("root");
if (appRoot) {
  const canvas = HTMLCanvas.createInRootElement(appRoot!);

  const game = Games.Snake(canvas);
  // const game = Games.BombBroomer(canvas);
  // const game = Games.Sudoku(canvas);
  game.run(12);

  // const playground = Playgrounds.Easing(canvas);
  // playground.run(canvas);
}
