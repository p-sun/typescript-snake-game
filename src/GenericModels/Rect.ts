import Vec2 from './Vec2';

export default class Rect {
  constructor(public readonly origin: Vec2, public readonly size: Vec2) {}

  convertNormalizedPosition(pos: Vec2): Vec2 {
    return this.origin.add(pos.componentMul(this.size));
  }

  get midpoint(): Vec2 {
    return this.convertNormalizedPosition(new Vec2(0.5, 0.5));
  }
}
