import Canvas from '../Canvas';
import Color from '../GenericModels/Color';
import Grid from '../Grid';
import Fruit from './Fruit';

export default class FruitRenderer {
  constructor(public readonly options: { color: Color }) {}

  draw(canvas: Canvas, grid: Grid, fruit: Fruit) {
    grid.fillCell(canvas, fruit.position, this.options.color);
  }
}
