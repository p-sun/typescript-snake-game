import Grid, { GridPosition } from './Grid';
import Snake from './Snake';
import { randomIntInRange } from './Utils';
import Vec2 from './Vec2';

export default class Fruit {
  #position: GridPosition = { row: 0, column: 0 };

  get position(): GridPosition {
    return this.#position;
  }

  generateNewPosition(grid: Grid, snake: Snake) {
    let pos = {
      row: randomIntInRange(0, grid.rowCount),
      column: randomIntInRange(0, grid.columnCount),
    };

    // TODO - if you win and fill the WHOLE GRID this hangs
    while (snake.containsPosition(pos)) {
      pos = {
        row: randomIntInRange(0, grid.rowCount),
        column: randomIntInRange(0, grid.columnCount),
      };
    }

    this.#position = pos;
  }
}
