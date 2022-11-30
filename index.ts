import BombBroomerGame from './src/BombBroomer/BombBroomerGame';
import SnakeGame from './src/Snake/SnakeGame';

const appRoot = document.getElementById('root');
if (appRoot) {
  const snakeGame = new SnakeGame(appRoot);
  snakeGame.run(12);

  //   const bombGame = new BombBroomerGame(appRoot);
  //   bombGame.run(60);
}
