import Canvas from './Canvas';
import Color from './Color';
import Fruit from './Fruit';
import Grid from './Grid';

export default class FruitRenderer {
  constructor(public readonly options: { color: Color }) {}

  draw(canvas: Canvas, grid: Grid, fruit: Fruit) {
    grid.fillCell(canvas, fruit.position, this.options.color);
  }
}
