import { Direction } from '../GenericModels/Direction';
import { GridSize, GridPositionEqual } from '../GenericModels/Grid';
import Fruit from './Fruit';
import Snake from './Snake';
import { SnakePlayStatus } from './SnakeGame';

export default class SnakeGameLogic {
  #gridSize: GridSize;
  #playStatus: SnakePlayStatus = 'waiting';
  snake: Snake;
  fruit: Fruit;

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

      if (GridPositionEqual(this.snake.headPosition, this.fruit.position)) {
        this.snake = this.snake.extend();
        this.fruit.generateNewPosition(this.#gridSize, this.snake);
      }

      const hasCollision = newSnake.hasCollision(this.#gridSize);
      if (hasCollision) {
        this.#playStatus = 'lost';
      } else {
        this.snake = newSnake;
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
