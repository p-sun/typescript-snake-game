import Canvas, { CanvasKeyEvent, CanvasMouseEvent } from './Canvas';
import Vec2 from './GenericModels/Vec2';

export default abstract class Game {
  abstract onUpdate(): void;
  abstract onRender(canvas: Canvas): void;
  abstract onKeyDown(event: CanvasKeyEvent): void;
  abstract onMouseEvent(event: CanvasMouseEvent, pos: Vec2): void;

  protected readonly canvas: Canvas;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.canvas.setKeyDownListener((event) => {
      this.onKeyDown(event);
    });
    this.canvas.setMouseListener((evt, pos) => {
      this.onMouseEvent(evt, pos);
    });
  }

  run(fps: number = 60) {
    window.setInterval(() => {
      this.onUpdate();
      this.onRender(this.canvas);
    }, 1000 / fps);
  }
}
