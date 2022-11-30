import Canvas from './Canvas';
import Color from './Color';
import { Direction, Vec2ForDirection } from './Direction';
import Grid from './Grid';
import Snake from './Snake';
import Vec2 from './Vec2';

export type SnakeRenderConfig = {
  color: Color;
  eyeColor: Color;
};

export default class SnakeRenderer {
  constructor(public readonly renderConfig: SnakeRenderConfig) {}

  draw(canvas: Canvas, grid: Grid, snake: Snake) {
    const positions = snake.positions;
    const headPosition = snake.headPosition;

    positions.forEach((pos, index) => {
      const percent = positions.length > 1 ? index / (positions.length - 1) : 1;
      grid.fillCell(
        canvas,
        pos,
        this.renderConfig.color.lerp(Color.black, percent)
      );
    });

    grid.drawEllipseInCell(canvas, headPosition, this.renderConfig.eyeColor, {
      fillPercent: new Vec2(0.3, 0.3),
      normalizedOffset: this.#eyeNormalizedOffset(snake.moveDirection),
    });
  }

  #eyeNormalizedOffset(direction: Direction): Vec2 {
    const d = Vec2ForDirection(direction);
    const moveDirRotationAngleRad = d.signedAngleRadTo(Vec2.right);
    return new Vec2(0.4, -0.25).rotate(moveDirRotationAngleRad);
  }
}
