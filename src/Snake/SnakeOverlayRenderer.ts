import Canvas from '../Canvas';
import Color from '../GenericModels/Color';
import Vec2 from '../GenericModels/Vec2';
import { SnakePlayStatus } from './SnakeGame';

type SnakeOverlayTexts = {
  lostHeader?: string;
  snakeLength?: string;
  pressSpace: string;
};

export default class SnakeOverlayRenderer {
  static render(
    canvas: Canvas,
    playStatus: SnakePlayStatus,
    snakeLength: number
  ) {
    const overlayTexts = SnakeOverlayRenderer.getOverlayTexts(
      playStatus,
      snakeLength
    );
    if (overlayTexts) {
      this.#drawOverlay(canvas, overlayTexts);
    }
  }

  static getOverlayTexts(
    playStatus: SnakePlayStatus,
    snakeLength: number
  ): SnakeOverlayTexts | undefined {
    if (playStatus === 'playing') {
      return undefined;
    }

    let texts: SnakeOverlayTexts = {
      pressSpace: `Press [space] to ${playStatus === 'lost' ? 're' : ''}start!`,
    };

    if (playStatus === 'lost') {
      texts = {
        ...texts,
        lostHeader: '☠️😭☠️',
        snakeLength: `Snake length: ${snakeLength}`,
      };
    }

    return texts;
  }

  static #drawOverlay(canvas: Canvas, overlayTexts: SnakeOverlayTexts) {
    const {
      lostHeader: lostHeaderText,
      snakeLength: snakeLengthText,
      pressSpace: pressSpaceText,
    } = overlayTexts;

    canvas.drawRect({
      origin: Vec2.zero,
      size: canvas.size,
      color: Color.black,
      alpha: 0.5,
    });

    canvas.drawText({
      text: pressSpaceText,
      position: canvas.midpoint,
      attributes: {
        color: Color.white,
        fontSize: 30,
      },
      normalizedAnchorOffset: {
        offsetX: 0,
        offsetY: 0,
      },
    });

    if (lostHeaderText) {
      canvas.drawText({
        text: lostHeaderText,
        position: canvas.midpoint.mapY((y) => y - 70),
        attributes: {
          color: Color.black,
          fontSize: 40,
        },
        normalizedAnchorOffset: {
          offsetX: 0,
        },
      });
    }

    if (snakeLengthText) {
      canvas.drawText({
        text: snakeLengthText,
        position: canvas.midpoint.mapY((y) => y - 32),
        attributes: {
          color: new Color(1, 0.3, 0.2),
          fontSize: 36,
        },
        normalizedAnchorOffset: {
          offsetX: 0,
        },
      });
    }
  }
}
