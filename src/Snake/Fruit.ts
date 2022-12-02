import { GridPosition, GridSize } from '../GenericModels/Grid';
import { randomIntInRange } from '../Utils';
import Snake from './Snake';

export default class Fruit {
  #position: GridPosition;

  constructor(position?: GridPosition) {
    this.#position = position ?? { row: 0, column: 0 };
  }

  get position(): GridPosition {
    return this.#position;
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
    }
  }
}
