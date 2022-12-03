import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import Canvas from './src/Canvas';
import SnakeGame from './src/Snake/SnakeGame';

const appRoot = document.getElementById('root');
if (appRoot) {
  const gridSize = { rowCount: 32, columnCount: 32 };
  const canvas = Canvas.createInRootElement(appRoot);
  const snakeGame = new SnakeGame(canvas, gridSize);
  snakeGame.run(12);

  // const bombGame = new BombBroomerGame(canvas);
  // bombGame.run(60);
}
