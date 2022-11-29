import Canvas, { CanvasMouseEvent } from './Canvas';
import Vec2 from './Vec2';

export default abstract class Game {
  abstract update(canvas: Canvas): void;
  abstract onKeyDown(event: KeyboardEvent): void;
  abstract onMouseEvent(event: CanvasMouseEvent, pos: Vec2): void;

  protected readonly canvas: Canvas;

  constructor(rootElement: HTMLElement) {
    this.canvas = Canvas.createInRootElement(rootElement);
    this.canvas.setKeyDownListener((key) => {
      this.onKeyDown(key);
    });
    this.canvas.setMouseListener((evt, pos) => {
      this.onMouseEvent(evt, pos);
    });
  }

  run(fps: number = 60) {
    window.setInterval(() => {
      this.update(this.canvas);
    }, 1000 / fps);
  }
}
