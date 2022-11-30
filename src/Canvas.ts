import Color from './GenericModels/Color';
import Vec2 from './GenericModels/Vec2';

export type TextAttributes = {
  color: Color;
  fontSize: number;
};

export type CanvasMouseEvent =
  | { mode: 'move' }
  | { mode: 'boundary'; boundary: 'enter' | 'exit' }
  | { mode: 'button'; state: 'up' | 'down'; button: 'primary' | 'secondary' };

export default class Canvas {
  #context: CanvasRenderingContext2D;
  #size: Vec2;
  #canvasElement: HTMLCanvasElement;

  constructor(canvasElement: HTMLCanvasElement, size: Vec2) {
    this.#canvasElement = canvasElement;
    this.#context = canvasElement.getContext('2d') as CanvasRenderingContext2D;
    this.#size = size;
  }

  get size(): Vec2 {
    return this.#size;
  }

  set size(newSize: Vec2) {
    this.#size = newSize;

    this.#canvasElement.style.width = newSize.x + 'px';
    this.#canvasElement.style.height = newSize.y + 'px';

    const scale = window.devicePixelRatio;
    this.#canvasElement.width = newSize.x * scale;
    this.#canvasElement.height = newSize.y * scale;

    this.#context.scale(scale, scale);
  }

  static createInRootElement(
    rootElement: Element,
    size: Vec2 = Vec2.zero
  ): Canvas {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    rootElement.appendChild(canvas);

    return new Canvas(canvas, size);
  }

  get midpoint(): Vec2 {
    return this.fromNormalizedCoordinate(new Vec2(0.5, 0.5));
  }

  fromNormalizedCoordinate(coord: Vec2): Vec2 {
    return this.size.componentMul(coord);
  }

  toNormalizedCoordinate(pos: Vec2): Vec2 {
    return pos.componentDiv(this.size);
  }

  drawRect(origin: Vec2, size: Vec2, color: Color, alpha?: number) {
    this.#context.fillStyle = color.asHexString();

    const globalAlpga = this.#context.globalAlpha;
    if (alpha !== undefined) {
      this.#context.globalAlpha = alpha;
    }
    this.#context.fillRect(origin.x, origin.y, size.x, size.y);
    this.#context.globalAlpha = globalAlpga;
  }

  drawEllipse(
    origin: Vec2,
    rx: number,
    ry: number,
    color: Color,
    rotationAngle: number = 0
  ) {
    this.#context.fillStyle = color.asHexString();
    this.#context.beginPath();
    this.#context.ellipse(
      origin.x,
      origin.y,
      rx,
      ry,
      rotationAngle,
      2 * Math.PI,
      0
    );
    this.#context.fill();
  }

  clear(color: Color) {
    this.drawRect(Vec2.zero, this.size, color);
  }

  drawLine(
    start: Vec2,
    end: Vec2,
    color: Color,
    thickness: number = 1,
    lineDash: number[] = []
  ) {
    this.#context.strokeStyle = color.asHexString();
    this.#context.lineWidth = thickness;
    this.#context.setLineDash(lineDash);

    this.#context.beginPath();
    this.#context.moveTo(start.x, start.y);
    this.#context.lineTo(end.x, end.y);
    this.#context.stroke();
  }

  #performCanvasTextOperation<T = undefined>(
    attributes: TextAttributes,
    op: () => T
  ) {
    this.#context.save();
    this.#context.font = `${attributes.fontSize}px Arial`;
    this.#context.fillStyle = attributes.color.asHexString();
    const res = op();
    this.#context.restore();

    return res;
  }

  drawTextAtPosition(
    contents: string,
    position: Vec2,
    attributes: TextAttributes,
    normalizedAnchorOffset: {
      normalizedOffsetX?: number;
      normalizedOffsetY?: number | 'baseline';
    } = { normalizedOffsetX: 0, normalizedOffsetY: 'baseline' }
  ) {
    this.#performCanvasTextOperation(attributes, () => {
      let { x, y } = position;
      if (normalizedAnchorOffset) {
        const measure = this.#measureTextWithContextReady(contents);
        if (normalizedAnchorOffset.normalizedOffsetX !== undefined) {
          x +=
            (-measure.size.x / 2) *
            (1 + normalizedAnchorOffset.normalizedOffsetX);
        }

        if (normalizedAnchorOffset.normalizedOffsetY !== undefined) {
          if (normalizedAnchorOffset.normalizedOffsetY === 'baseline') {
            y += measure.baselineOffsetFromBottom;
          } else {
            y +=
              (measure.size.y / 2) *
              (1 - normalizedAnchorOffset.normalizedOffsetY);
          }
        }
      }

      this.#context.fillText(contents, x, y);
    });
  }

  measureText(
    contents: string,
    attributes: TextAttributes
  ): { size: Vec2; baselineOffsetFromBottom: number } {
    return this.#performCanvasTextOperation(attributes, () => {
      return this.#measureTextWithContextReady(contents);
    });
  }

  #measureTextWithContextReady(contents: string): {
    size: Vec2;
    baselineOffsetFromBottom: number;
  } {
    const metrics = this.#context.measureText(contents);
    return {
      size: new Vec2(
        metrics.width,
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      ),
      baselineOffsetFromBottom: metrics.actualBoundingBoxDescent,
    };
  }

  #keyboardListener: ((evt: KeyboardEvent) => void) | undefined = undefined;

  setKeyDownListener(fn: (key: KeyboardEvent) => void) {
    this.#keyboardListener = fn;
    window.addEventListener('keydown', this.#keyboardListener);
  }

  unsetKeyDownListener() {
    if (this.#keyboardListener) {
      window.removeEventListener('keydown', this.#keyboardListener);
      this.#keyboardListener = undefined;
    }
  }

  unsetMouseListener() {
    this.#canvasElement.oncontextmenu = null;
    this.#canvasElement.onmousedown = null;
    this.#canvasElement.onmouseup = null;
    this.#canvasElement.onmouseenter = null;
    this.#canvasElement.onmouseleave = null;
    this.#canvasElement.onmousemove = null;
  }

  setMouseListener(fn: (event: CanvasMouseEvent, pos: Vec2) => void): void {
    const getPos = (evt: MouseEvent) => {
      const rect = this.#canvasElement.getBoundingClientRect();
      return new Vec2(evt.clientX - rect.x, evt.clientY - rect.y);
    };

    this.#canvasElement.oncontextmenu = (evt: MouseEvent) => {
      evt.preventDefault();
    };

    this.#canvasElement.onmousedown = (evt: MouseEvent) => {
      fn(
        {
          mode: 'button',
          state: 'down',
          button: evt.button === 2 ? 'secondary' : 'primary',
        },
        getPos(evt)
      );
    };

    this.#canvasElement.onmouseup = (evt: MouseEvent) => {
      fn(
        {
          mode: 'button',
          state: 'up',
          button: evt.button === 2 ? 'secondary' : 'primary',
        },
        getPos(evt)
      );
    };

    this.#canvasElement.onmouseenter = (evt: MouseEvent) => {
      fn(
        {
          mode: 'boundary',
          boundary: 'enter',
        },
        getPos(evt)
      );
    };

    this.#canvasElement.onmouseleave = (evt: MouseEvent) => {
      fn(
        {
          mode: 'boundary',
          boundary: 'exit',
        },
        getPos(evt)
      );
    };

    this.#canvasElement.onmousemove = (evt: MouseEvent) => {
      fn(
        {
          mode: 'move',
        },
        getPos(evt)
      );
    };
  }
}
