import { ICanvas } from '../../GenericGame/ICanvas';
import { Direction } from '../../GenericModels/Direction';
import { GridPosition } from '../../GenericModels/Grid';
import Vec2 from '../../GenericModels/Vec2';
import Fruit from '../Models/Fruit';
import Snake from '../Models/Snake';
import SnakeGameLogic from '../Models/SnakeGameLogic';
import SnakeGame from '../SnakeGame';

export function createSnakeGame(canvas: ICanvas) {
  const gridSize = { rowCount: 4, columnCount: 5 };
  const snakePositions: GridPosition[] = [
    { row: 0, column: 2 },
    { row: 0, column: 3 },
    { row: 1, column: 3 },
    { row: 2, column: 3 },
    { row: 3, column: 3 },
    { row: 3, column: 4 },
  ];
  const gameLogic = new SnakeGameLogic(
    gridSize,
    new Snake(snakePositions, 'down', 0),
    new Fruit({ row: 1, column: 2 })
  );

  return new SnakeGame(canvas, gridSize, Vec2.zero, gameLogic);
}

export function createSnake(options?: {
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

  const headPos: GridPosition = { row: 1, column: 2 };
  const gridPositions: GridPosition[] = [];
  gridPositions.push(headPos);
  gridPositions.push({ row: 1, column: 3 });
  gridPositions.push({ row: 2, column: 3 });

  const segmentsToAdd = options?.segmentsToAdd ?? 0;
  return new Snake(gridPositions, options?.direction ?? 'down', segmentsToAdd);
}
