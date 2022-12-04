import GridRenderer from '../../GenericGame/GridRenderer';
import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import { Direction, Vec2ForDirection } from '../../GenericModels/Direction';
import Vec2 from '../../GenericModels/Vec2';
import Snake from '../Models/Snake';

export type SnakeRenderConfig = {
  color: Color;
  eyeColor: Color;
};

export default class SnakeRenderer {
  constructor(public readonly config: SnakeRenderConfig) {}

  render(canvas: ICanvas, grid: GridRenderer, snake: Snake) {
    const positions = snake.positions;
    const cellPos = snake.headPosition;

    positions.forEach((pos, index) => {
      const percent = positions.length > 1 ? index / (positions.length - 1) : 1;
      grid.fillCell(
        canvas,
        pos,
        this.config.color.lerp(Color.black, percent * 0.5)
      );
    });

    grid.drawEllipseInCell(
      canvas,
      {
        cellPos,
        normalizedOffset: this.#eyeNormalizedOffset(snake.moveDirection),
      },
      this.config.eyeColor,
      new Vec2(0.3, 0.3)
    );
  }

  #eyeNormalizedOffset(direction: Direction): Vec2 {
    const d = Vec2ForDirection(direction);
    const moveDirRotationAngleRad = d.signedAngleRadTo(Vec2.right);
    return new Vec2(0.4, -0.25).rotate(moveDirRotationAngleRad);
  }
}
