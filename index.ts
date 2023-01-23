import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import Game from './src/GenericGame/Game';
import HTMLCanvas from './src/GenericGame/HTMLCanvas';
import { ICanvas } from './src/GenericGame/ICanvas';
import Vec2 from './src/GenericModels/Vec2';
import SnakeGame from './src/SnakeGame/SnakeGame';
import SudokuGame from './src/Sudoku/SudokuGame';

const Games: { [k: string]: (canvas: ICanvas) => Game } = {
  Snake: (canvas) => {
    const gridSize = { rowCount: 18, columnCount: 18 };
    const cellSize = new Vec2(22, 22);
    return new SnakeGame(canvas, gridSize, cellSize);
  },
  BombBroomer: (canvas) => new BombBroomerGame(canvas),
  Sudoku: (canvas) => new SudokuGame(canvas),
};

const appRoot = document.getElementById('root');
if (appRoot) {
  const canvas = HTMLCanvas.createInRootElement(appRoot!);

  const game = Games.Snake(canvas);
  game.run(12);
}
