import { GridPosition, GridSize } from '../../GenericModels/Grid';
import Fruit from '../Fruit';
import Snake from '../Snake';
import SnakeGameLogic from '../SnakeGameLogic';

describe('test intial game state', () => {
  it('should wait for spacebar keypress before starting the game', () => {
    const gridSize: GridSize = { rowCount: 4, columnCount: 5 };
    const gameLogic = new SnakeGameLogic(gridSize);
    expect(gameLogic.playStatus).toBe('waiting');

    gameLogic.tick();
    gameLogic.onArrowKeyPressed('right');
    gameLogic.tick();
    expect(gameLogic.playStatus).toBe('waiting');

    gameLogic.onSpaceKeyPressed();
    expect(gameLogic.playStatus).toBe('playing');
  });
});

describe('test full game', () => {
  const snakePositions: GridPosition[] = [
    { row: 0, column: 2 },
    { row: 0, column: 3 },
    { row: 1, column: 3 },
    { row: 2, column: 3 },
    { row: 3, column: 3 },
    { row: 3, column: 4 },
  ];
  const gridSize = { rowCount: 4, columnCount: 5 };
  const gameLogic = new SnakeGameLogic(
    gridSize,
    new Snake(snakePositions, 'down', 0),
    new Fruit({ row: 1, column: 2 })
  );

  it('should initialize with test values', () => {
    /**
     *    h = head, F = fruit
     * c  0 1 2 3 4
     * 0  x x h O x
     * 1  x x F O x
     * 2  x x x O x
     * 3  x x x O O
     */
    expect(gameLogic.snake.positions).toMatchObject(snakePositions);
    expect(gameLogic.snake.length).toBe(6);
  });

  it('should eat fruit and then grow in length', () => {
    gameLogic.onSpaceKeyPressed();
    expect(gameLogic.playStatus).toBe('playing');

    gameLogic.tick();
    /**
     *    h = head, F = fruit
     * c  0 1 2 3 4
     * 0  x x O O x
     * 1  x x h O x <--- ate the fruit on (1, 2)
     * 2  x x x O x
     * 3  x x x O x
     */
    expect(gameLogic.snake.length).toBe(7);
    expect(gameLogic.snake.positions).toMatchObject([
      { row: 1, column: 2 },
      { row: 0, column: 2 },
      { row: 0, column: 3 },
      { row: 1, column: 3 },
      { row: 2, column: 3 },
      { row: 3, column: 3 },
    ]);

    gameLogic.tick();
    /**
     *    h = head, F = fruit
     * c  0 1 2 3 4
     * 0  x x O O x
     * 1  x x O O x
     * 2  x x h O x <----- expand snake size by 1 b/c of Fruit
     * 3  x x x O x
     */
    expect(gameLogic.snake.positions).toMatchObject([
      { row: 2, column: 2 },
      { row: 1, column: 2 },
      { row: 0, column: 2 },
      { row: 0, column: 3 },
      { row: 1, column: 3 },
      { row: 2, column: 3 },
      { row: 3, column: 3 },
    ]);
  });

  it('should lose the game when snake collides with its tail', () => {
    gameLogic.onArrowKeyPressed('right');
    expect(gameLogic.playStatus).toBe('playing');

    gameLogic.tick();
    expect(gameLogic.playStatus).toBe('lost');
    gameLogic.tick();
    expect(gameLogic.playStatus).toBe('lost');
  });

  it('should restart the game upon space bar press', () => {
    gameLogic.onSpaceKeyPressed();
    expect(gameLogic.playStatus).toBe('playing');
    expect(gameLogic.snake.length).toBe(2);
  });
});
