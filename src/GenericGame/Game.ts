import Vec2 from '../GenericModels/Vec2';
import { ICanvas, CanvasKeyEvent, CanvasMouseEvent } from './ICanvas';

export default abstract class Game {
  abstract onUpdate(): void;
  abstract onRender(canvas: ICanvas): void;
  abstract onKeyDown(event: CanvasKeyEvent): void;
  abstract onMouseEvent(event: CanvasMouseEvent, pos: Vec2): void;

  protected readonly canvas: ICanvas;

  constructor(canvas: ICanvas) {
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
