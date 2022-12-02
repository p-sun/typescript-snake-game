import { Direction } from '../../GenericModels/Direction';
import { GridPosition, GridSize } from '../../GenericModels/Grid';
import Snake from '../Snake';

const headPos: GridPosition = { row: 1, column: 2 };
function createSnake(options?: {
  segmentsToAdd?: number;
  direction?: Direction;
}): Snake {
  /**
   *    h = head
   * c  0 1 2 3 4
   * 0  x x x x x
   * 1  x x h o x
   * 2  x x x o x
   * 3  x x x x x
   */
  const gridPositions: GridPosition[] = [];
  gridPositions.push({ row: headPos.row, column: headPos.column });
  gridPositions.push({ row: 1, column: 3 });
  gridPositions.push({ row: 2, column: 3 });

  const segmentsToAdd = options?.segmentsToAdd ?? 0;
  return new Snake(gridPositions, options?.direction ?? 'right', segmentsToAdd);
}

describe('test snake length() and headPosition()', () => {
  describe('when initialized with 3 GridPositions', () => {
    it('should have length of 3, and be readonly', () => {
      const snake = createSnake();
      expect(snake.length).toBe(3);
      snake.positions.push({ row: 3, column: 6 });
      expect(snake.length).toBe(3);
    });

    it('should have correct headPositions, and be readonly', () => {
      const snake = createSnake();
      expect(snake.headPosition).toMatchObject(headPos);
      snake.headPosition.row = 7;
      snake.headPosition.row = 8;
      expect(snake.headPosition).toMatchObject(headPos);
    });
  });

  describe('when initialized with 3 GridPositions, and 4 segmentsToAdd', () => {
    it('should have a length of 7', () => {
      const segmentsToAdd = 4;
      const snake = createSnake({ segmentsToAdd });
      expect(snake.length).toBe(7);
    });
  });
});

describe('test positions() and containsPosition()', () => {
  describe('when tick() is called after initialization', () => {
    it('should move down', () => {
      let snake = createSnake({ direction: 'down' });
      snake = snake.tick();
      /**
       *    h = head
       * c  0 1 2 3 4
       *
       * 0  x x x x x
       * 1  x x o o x
       * 2  x x h x x
       * 3  x x x x x
       */

      expect(snake.positions[0]).toMatchObject({ row: 2, column: 2 });
      expect(snake.positions[1]).toMatchObject({ row: 1, column: 2 });
      expect(snake.positions[2]).toMatchObject({ row: 1, column: 3 });
      expect(snake.positions[3]).toBeUndefined();

      expect(
        snake.containsPosition({ row: 2, column: 2 }, { skipHead: true })
      ).toBe(false);

      expect(snake.containsPosition({ row: 2, column: 2 })).toBe(true);
      expect(snake.containsPosition({ row: 1, column: 2 })).toBe(true);
      expect(snake.containsPosition({ row: 1, column: 3 })).toBe(true);
      expect(snake.containsPosition({ row: 2, column: 1 })).toBe(false);
    });
  });

  describe('when changing the direction to the left, and multiple tick() happen', () => {
    it('should move left', () => {
      const snake = createSnake({ direction: 'down' })
        .tick()
        .changeDirection('left')
        .tick();
      /**
       *    h = head
       * c  0 1 2 3 4
       *
       * 0  x x x x x
       * 1  x x o x x
       * 2  x h o x x
       * 3  x x x x x
       */

      expect(snake.positions[0]).toMatchObject({ row: 2, column: 1 });
      expect(snake.positions[1]).toMatchObject({ row: 2, column: 2 });
      expect(snake.positions[2]).toMatchObject({ row: 1, column: 2 });
      expect(snake.positions[3]).toBeUndefined();
    });
  });

  describe('when snake is extended and ticked', () => {
    it('should grow in length by only 1', () => {
      let snake = createSnake({ direction: 'up', segmentsToAdd: 0 })
        .extend()
        .tick();
      /**
       *    h = head
       * c  0 1 2 3 4
       * 0  x x h x x
       * 1  x x o o x
       * 2  x x x o x
       * 3  x x x x x
       */

      expect(snake.positions[0]).toMatchObject({ row: 0, column: 2 });
      expect(snake.positions[1]).toMatchObject({ row: 1, column: 2 });
      expect(snake.positions[2]).toMatchObject({ row: 1, column: 3 });
      expect(snake.positions[3]).toMatchObject({ row: 2, column: 3 });
      expect(snake.length).toBe(4);

      snake = snake.tick();
      expect(snake.length).toBe(4);
    });
  });

  describe('when segmentsToAdd is 2', () => {
    it('should take two ticks to add both segments', () => {
      let snake = createSnake({ direction: 'down', segmentsToAdd: 2 });
      /**
       *    h = head
       * c  0 1 2 3 4
       * 0  x x x x x
       * 1  x x h o x
       * 2  x x x o x
       * 3  x x x x x
       */

      snake = snake.tick();
      /**
       *    h = head
       * c  0 1 2 3 4
       * 0  x x x x x
       * 1  x x o o x
       * 2  x x h o x
       * 3  x x x x x
       */

      snake = snake.tick();
      /**
       *    h = head
       * c  0 1 2 3 4
       * 0  x x x x x
       * 1  x x o o x
       * 2  x x o o x
       * 3  x x h x x
       */

      snake = snake.changeDirection('left');
      snake = snake.tick();
      /**
       *    h = head
       * c  0 1 2 3 4
       * 0  x x x x x
       * 1  x x o o x
       * 2  x x o x x
       * 3  x h o x x
       */

      expect(snake.positions[0]).toMatchObject({ row: 3, column: 1 });
      expect(snake.positions[1]).toMatchObject({ row: 3, column: 2 });
      expect(snake.positions[2]).toMatchObject({ row: 2, column: 2 });
      expect(snake.positions[3]).toMatchObject({ row: 1, column: 2 });
      expect(snake.positions[4]).toMatchObject({ row: 1, column: 3 });
      expect(snake.positions[5]).toBeUndefined();
    });
  });
});

describe('when snake moves up out of bounds', () => {
  it('should have *    h = head indicies on the headPosition', () => {
    const snake = createSnake({ direction: 'up' })
      .tick()
      .tick()
      .changeDirection('left')
      .tick()
      .tick()
      .tick();
    /**
     *    h = head
     * c  0 1 2 3 4
     *  h o o
     * 0  x x x x x
     * 1  x x x x x
     * 2  x x x x x
     * 3  x x x x x
     */

    expect(snake.positions[0]).toMatchObject({ row: -1, column: -1 });
    expect(snake.positions[1]).toMatchObject({ row: -1, column: 0 });
    expect(snake.positions[2]).toMatchObject({ row: -1, column: 1 });
    expect(snake.positions[3]).toBeUndefined();
  });

  it('should collide with the bottom wall', () => {
    const gridSize: GridSize = { rowCount: 4, columnCount: 5 };
    let snake = createSnake({ direction: 'down' });

    snake = snake.tick().tick();
    expect(snake.hasWallCollision(gridSize)).toBe(false);

    snake = snake.tick();
    expect(snake.hasWallCollision(gridSize)).toBe(true);
  });

  it('should collide with the left wall', () => {
    const gridSize: GridSize = { rowCount: 4, columnCount: 5 };
    let snake = createSnake({ direction: 'left' });
    snake = snake.tick().tick();
    expect(snake.hasWallCollision(gridSize)).toBe(false);

    snake = snake.tick();
    expect(snake.hasWallCollision(gridSize)).toBe(true);
  });
});
