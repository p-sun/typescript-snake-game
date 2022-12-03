/**
 * @jest-environment jsdom
 */

import Canvas, {
  CanvasKeyEvent,
  CanvasMouseEvent,
  EllipseOptions,
  ICanvas,
  LineOptions,
  RectOptions,
  TextAttributes,
  TextOptions,
} from '../../Canvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
import 'jest-canvas-mock';
import { JSDOM } from 'jsdom';

// In order to use HTML canvas, you'd need 3 npm packages:
// `@types/jsdom` & `jest-environment-jsdom` for HTMLDocument & Window
// `jest-canvas-mock` for HTMLCanvasElement
export function createRealCanvas() {
  const dom = new JSDOM('<!DOCTYPE html>').window as unknown as Window;
  global.document = dom.window.document;
  global.window = dom.window;
  document.body.innerHTML = '<div id="root"></div>';

  const appRoot = document.getElementById('root');
  if (!appRoot) {
    return;
  }
  const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
  appRoot.appendChild(canvasElement);

  return new Canvas(canvasElement, Vec2.zero);
}

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
