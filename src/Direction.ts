import Vec2 from './Vec2';

export enum Direction {
  Left,
  Right,
  Up,
  Down,
}

export function Vec2ForDirection(direction: Direction) {
  switch (direction) {
    case Direction.Left:
      return new Vec2(-1, 0);
    case Direction.Right:
      return new Vec2(1, 0);
    case Direction.Up:
      return new Vec2(0, -1);
    default:
    case Direction.Down:
      return new Vec2(0, 1);
  }
}

export function OppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.Left:
      return Direction.Right;
    case Direction.Right:
      return Direction.Left;
    case Direction.Up:
      return Direction.Down;
    default:
    case Direction.Down:
      return Direction.Up;
  }
}
