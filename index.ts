import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import HTMLCanvas from './src/GenericGame/HTMLCanvas';
import Vec2 from './src/GenericModels/Vec2';
import SnakeGame from './src/SnakeGame/SnakeGame';

const appRoot = document.getElementById('root');
if (appRoot) {
  const canvas = HTMLCanvas.createInRootElement(appRoot);
  const gridSize = { rowCount: 24, columnCount: 24 };
  const cellSize = new Vec2(30, 30);
  const snakeGame = new SnakeGame(canvas, gridSize, cellSize);
  snakeGame.run(12);

  // const bombGame = new BombBroomerGame(canvas);
  // bombGame.run(60);
}
