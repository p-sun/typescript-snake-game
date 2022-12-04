import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import Canvas from './src/Canvas';
import Vec2 from './src/GenericModels/Vec2';
import SnakeGame from './src/SnakeGame/SnakeGame';

const appRoot = document.getElementById('root');
if (appRoot) {
  const canvas = Canvas.createInRootElement(appRoot);
  const gridSize = { rowCount: 30, columnCount: 30 };
  const cellSize = new Vec2(30, 30);
  const snakeGame = new SnakeGame(canvas, gridSize, cellSize);
  snakeGame.run(12);

  // const bombGame = new BombBroomerGame(canvas);
  // bombGame.run(60);
}
