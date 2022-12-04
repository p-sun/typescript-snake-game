import { ICanvas } from '../../Canvas';
import Color from '../../GenericModels/Color';
import Vec2 from '../../GenericModels/Vec2';
import GridRenderer from '../../GridRenderer';
import Fruit from '../Models/Fruit';

export type FruitRenderConfig = {
  color: Color;
};

export default class FruitRenderer {
  constructor(public readonly config: FruitRenderConfig) {}

  render(canvas: ICanvas, grid: GridRenderer, fruit: Fruit) {
    grid.fillCell(canvas, fruit.position, this.config.color);

    const textAttributes = {
      color: Color.black,
      fontSize: grid.cellSize.y * 0.85,
    };
    grid.drawText(
      canvas,
      fruit.fruitText,
      {
        cellPos: fruit.position,
        normalizedOffset: Vec2.zero,
      },
      textAttributes,
      {
        offsetX: 0,
        offsetY: 0,
      }
    );
  }
}
