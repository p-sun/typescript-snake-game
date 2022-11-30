import GridRenderer, { GridPosition } from '../GridRenderer';
import { randomIntInRange } from '../Utils';
import Snake from './Snake';

export default class Fruit {
  #position: GridPosition = { row: 0, column: 0 };

  get position(): GridPosition {
    return this.#position;
  }

  generateNewPosition(grid: GridRenderer, snake: Snake) {
    let pos = {
      row: randomIntInRange(0, grid.size().rowCount),
      column: randomIntInRange(0, grid.size().columnCount),
    };

    // TODO - if you win and fill the WHOLE GRID this hangs
    while (snake.containsPosition(pos)) {
      pos = {
        row: randomIntInRange(0, grid.size().rowCount),
        column: randomIntInRange(0, grid.size().columnCount),
      };
    }

    this.#position = pos;
  }
}
