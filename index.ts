import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import Canvas from './src/Canvas';
import SnakeGame from './src/SnakeGame/SnakeGame';

const appRoot = document.getElementById('root');
if (appRoot) {
  const gridSize = { rowCount: 30, columnCount: 30 };
  const canvas = Canvas.createInRootElement(appRoot);
  const snakeGame = new SnakeGame(canvas, gridSize);
  snakeGame.run(12);

  // const bombGame = new BombBroomerGame(canvas);
  // bombGame.run(60);
}
