import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import Game from './src/GenericGame/Game';
import HTMLCanvas from './src/GenericGame/HTMLCanvas';
import { ICanvas } from './src/GenericGame/ICanvas';
import Color from './src/GenericModels/Color';
import Vec2 from './src/GenericModels/Vec2';
import EasingRenderer from './src/Playgrounds/EasingRenderer';
import SnakeGame from './src/SnakeGame/SnakeGame';
import SudokuGame from './src/Sudoku/SudokuGame';
import TrianglesGame from './src/TrianglesGame/TrianglesGame';

const Games: { [k: string]: (canvas: ICanvas) => Game } = {
  Snake: (canvas) => {
    const gridSize = { rowCount: 18, columnCount: 18 };
    const cellSize = new Vec2(22, 22);
    return new SnakeGame(canvas, gridSize, cellSize);
  },
  BombBroomer: (canvas) => new BombBroomerGame(canvas),
  Sudoku: (canvas) => new SudokuGame(canvas),
  Triangles: (canvas) => {
    const cellSize = new Vec2(80, 80);
    const triangleColors = ([] as Color[])
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xf2798f))) // pink
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0x00c1ed))) // blue
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xbb66ed))) // purple
      .concat(Array.from({ length: 5 }, () => Color.fromHex(0xa7f205))); // green

    return new TrianglesGame({ canvas, cellSize, gridSize: 8, triangleColors });
  },
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

const appRoot = document.getElementById('root');
if (appRoot) {
  const canvas = HTMLCanvas.createInRootElement(appRoot!);

  // const game = Games.Triangles(canvas);
  const game = Games.Snake(canvas);
  // const game = Games.BombBroomer(canvas);
  // const game = Games.Sudoku(canvas);
  game.run(12);

  // const playground = Playgrounds.Easing(canvas);
  // playground.run(canvas);
}
