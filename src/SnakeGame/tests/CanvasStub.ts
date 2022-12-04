import {
  CanvasKeyEvent,
  CanvasMouseEvent,
  EllipseOptions,
  ICanvas,
  LineOptions,
  RectOptions,
  TextAttributes,
  TextOptions,
} from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
export class CanvasStub implements ICanvas {
  get size(): Vec2 {
    return Vec2.zero;
  }
  set size(newSize: Vec2) {}
  get midpoint(): Vec2 {
    return Vec2.zero;
  }

  toNormalizedCoordinate(pos: Vec2): Vec2;
  toNormalizedCoordinate(pos: Vec2): Vec2;
  toNormalizedCoordinate(pos: unknown): Vec2 {
    return Vec2.zero;
  }
  fromNormalizedCoordinate(coord: Vec2): Vec2 {
    return Vec2.zero;
  }

  measureText(
    contents: string,
    attributes: TextAttributes
  ): { size: Vec2; baselineOffsetFromBottom: number } {
    return { size: Vec2.zero, baselineOffsetFromBottom: 9 };
  }
  clear(color: Color): void {}
  drawRect(options: RectOptions): void {}
  drawLine(options: LineOptions): void {}
  drawEllipse(options: EllipseOptions): void {}
  drawText(options: TextOptions): void {}
  setKeyDownListener(fn: (key: CanvasKeyEvent) => void): void {}
  unsetKeyDownListener(): void {}
  setMouseListener(fn: (event: CanvasMouseEvent, pos: Vec2) => void): void {}
  unsetMouseListener(): void {}
}
