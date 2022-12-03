import { ICanvas } from '../Canvas';
import Color from '../GenericModels/Color';
import GridRenderer from '../GridRenderer';
import Fruit from './Fruit';

export type FruitRenderConfig = {
  color: Color;
};

export default class FruitRenderer {
  constructor(public readonly config: FruitRenderConfig) {}

  render(canvas: ICanvas, grid: GridRenderer, fruit: Fruit) {
    grid.fillCell(canvas, fruit.position, this.config.color);
  }
}
