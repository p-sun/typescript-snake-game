import { ICanvas } from '../../GenericGame/ICanvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
import { SnakePlayStatus } from '../SnakeGame';

export type SnakeOverlayConfig = {
  pressSpaceTextColor: Color;
  lostHeaderTextColor: Color;
  snakeLengthTextColor: Color;
};

type SnakeOverlayTexts = {
  lostHeaderText?: string;
  snakeLengthText?: string;
  pressSpaceText: string;
};

export default class SnakeOverlayRenderer {
  constructor(public readonly config: SnakeOverlayConfig) {}

  render(canvas: ICanvas, playStatus: SnakePlayStatus, snakeLength: number) {
    const overlayTexts = this.#getOverlayTexts(playStatus, snakeLength);
    if (overlayTexts) {
      this.#drawOverlay(canvas, overlayTexts);
    }
  }

  #getOverlayTexts(
    playStatus: SnakePlayStatus,
    snakeLength: number
  ): SnakeOverlayTexts | undefined {
    if (playStatus === 'playing') {
      return undefined;
    }

    let texts: SnakeOverlayTexts = {
      pressSpaceText: `Press [space] to ${
        playStatus === 'lost' ? 're' : ''
      }start!`,
    };

    if (playStatus === 'lost') {
      texts = {
        ...texts,
        lostHeaderText: '😖😭😖',
        snakeLengthText: `Snake length: ${snakeLength}`,
      };
    }

    return texts;
  }

  #drawOverlay(canvas: ICanvas, overlayTexts: SnakeOverlayTexts) {
    const { lostHeaderText, snakeLengthText, pressSpaceText } = overlayTexts;

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
        color: this.config.pressSpaceTextColor,
        fontSize: 30,
      },
      normalizedAnchorOffset: {
        offsetX: 0,
      },
    });

    if (lostHeaderText) {
      canvas.drawText({
        text: lostHeaderText,
        position: canvas.midpoint.mapY((y) => y - 70),
        attributes: {
          color: this.config.lostHeaderTextColor,
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
          color: this.config.snakeLengthTextColor,
          fontSize: 36,
        },
        normalizedAnchorOffset: {
          offsetX: 0,
        },
      });
    }
  }
}
