import Canvas from '../Canvas';
import Color from '../GenericModels/Color';
import Grid from '../Grid';
import Fruit from './Fruit';

export type FruitRenderConfig = {
  color: Color;
};

export default class FruitRenderer {
  constructor(public readonly config: FruitRenderConfig) {}

  draw(canvas: Canvas, grid: Grid, fruit: Fruit) {
    grid.fillCell(canvas, fruit.position, this.config.color);
  }
}
