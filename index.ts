import SnakeGame from './src/SnakeGame';
import BombBroomer from './src/BombBroomer';

const appRoot = document.getElementById('root');
if (appRoot) {
    const snakeGame = new SnakeGame(appRoot);
    snakeGame.run(12);

    // const bombGame = new BombBroomer(appRoot);
    // bombGame.run(60);
}
