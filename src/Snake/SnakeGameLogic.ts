import { Direction } from '../GenericModels/Direction';
import { GridPositionEqual, GridSize } from '../GenericModels/Grid';
import Fruit from './Fruit';
import Snake from './Snake';
import { SnakePlayStatus } from './SnakeGame';

export default class SnakeGameLogic {
  snake: Snake;
  fruit: Fruit;
  #gridSize: GridSize;
  #playStatus: SnakePlayStatus = 'waiting';

  get playStatus() {
    return this.#playStatus;
  }

  constructor(gridSize: GridSize) {
    this.#gridSize = gridSize;
    this.snake = Snake.createRandom(gridSize);
    this.fruit = new Fruit();
    this.#restartGame();
  }

  #restartGame() {
    this.snake = Snake.createRandom(this.#gridSize);
    this.fruit = new Fruit();
    this.fruit.generateNewPosition(this.#gridSize, this.snake);
  }

  tick() {
    if (this.#playStatus === 'playing') {
      const newSnake = this.snake.tick();

      if (newSnake.hasCollision(this.#gridSize)) {
        this.#playStatus = 'lost';
      } else {
        const headPos = newSnake.headPosition;
        const collidesFruit = GridPositionEqual(headPos, this.fruit.position);
        if (collidesFruit) {
          this.snake = newSnake.extend();
          this.fruit.generateNewPosition(this.#gridSize, this.snake);
        } else {
          this.snake = newSnake;
        }
      }
    }
  }

  onArrowKeyPressed(direction: Direction) {
    this.snake = this.snake.changeDirection(direction);
  }

  onSpaceKeyPressed() {
    if (this.#playStatus === 'lost') {
      this.#restartGame();
      this.#playStatus = 'playing';
    } else if (this.playStatus === 'waiting') {
      this.#playStatus = 'playing';
    }
  }
}
