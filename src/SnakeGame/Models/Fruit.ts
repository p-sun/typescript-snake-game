import { randomIntInRange } from '../../GenericGame/Utils';
import { GridPosition, GridSize } from '../../GenericModels/Grid';
import Snake from './Snake';

export default class Fruit {
  #position: GridPosition;
  #fruitText: string;

  constructor(position?: GridPosition) {
    this.#position = position ?? { row: 0, column: 0 };
    this.#fruitText = this.#randomFruitText();
  }

  get position(): GridPosition {
    return this.#position;
  }

  get fruitText(): string {
    return this.#fruitText;
  }

  generateNewPosition(gridSize: GridSize, snake: Snake) {
    const { rowCount, columnCount } = gridSize;
    let pos = {
      row: randomIntInRange(0, rowCount),
      column: randomIntInRange(0, columnCount),
    };

    if (snake.length < rowCount * columnCount) {
      while (snake.containsPosition(pos)) {
        pos = {
          row: randomIntInRange(0, rowCount),
          column: randomIntInRange(0, columnCount),
        };
      }

      this.#position = pos;
      this.#fruitText = this.#randomFruitText();
    }
  }

  #randomFruitText(): string {
    const fruits = ['🍓', '🍎', '🥝', '🍊', '🍉', '🍏', '🥭', '🍌'];
    return fruits[Math.floor(Math.random() * fruits.length)];
  }
}
