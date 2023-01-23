import { ICanvas } from '../GenericGame/ICanvas';
import Color from '../GenericModels/Color';
import Vec2 from '../GenericModels/Vec2';

export default class EasingRenderer {
  private startMouse = 0;
  private deltaMouse = 0;

  private startX = 0;
  private currentX = 0;

  private prevDeltas = [0, 0, 0, 0, 0, 0, 0, 0];
  private prevDeltasIndex = 0;

  private velocity = 0;

  private size: Vec2;

  constructor(p: { size: Vec2 }) {
    this.size = p.size;
  }

  run(canvas: ICanvas) {
    const deltaTimeMs = 16;
    window.onmousemove = (e) => {
      if (e.buttons === 1) {
        this.onMouseMoveWhileDown(new Vec2(e.clientX, e.clientY));
      }
    };
    window.onmouseup = () => {
      this.onMouseUp();
    };
    setInterval(() => this.draw(canvas, deltaTimeMs), deltaTimeMs / 1000);
  }

  onMouseMoveWhileDown(position: Vec2) {
    if (this.startMouse === 0) {
      this.startMouse = position.x;
      this.startX = this.currentX;
      this.velocity = 0;
    }

    this.deltaMouse = position.x - this.startMouse;
    this.currentX = this.startX + this.deltaMouse;

    this.prevDeltas[this.prevDeltasIndex] = this.deltaMouse;
    this.prevDeltasIndex = ++this.prevDeltasIndex % this.prevDeltas.length;
  }

  onMouseUp() {
    this.startMouse = 0;

    const totalDeltas = this.prevDeltas.reduce(
      (prevVal, currentVal) => prevVal + currentVal
    );
    this.velocity = totalDeltas / this.prevDeltas.length;
    this.velocity = this.clamp(this.velocity, -130, 130);
  }

  draw(canvas: ICanvas, deltaTime: number) {
    if (this.velocity !== 0) {
      // Two different easing functions
      if (false) {
        this.velocity *= 0.984;
        if (Math.abs(this.velocity) < 6) {
          this.velocity = 0;
        }
      } else {
        const isPositive = this.velocity > 0;
        const frictionMultiplier = isPositive ? -1 : 1;
        const absAcceleration = 0.04;
        this.velocity += frictionMultiplier * absAcceleration * deltaTime;
        if (
          (this.velocity < 0 && isPositive) ||
          (this.velocity > 0 && !isPositive)
        ) {
          this.velocity = 0;
        }
      }

      this.currentX = this.currentX + this.velocity * deltaTime * 0.001;
    }

    this.currentX = this.clamp(this.currentX, 0, this.size.x - 30);
    canvas.clear(Color.grey(0.2));
    canvas.drawRect({
      origin: new Vec2(this.currentX, 100),
      size: new Vec2(30, 30),
      color: Color.blue,
    });
  }

  private clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  }
}
