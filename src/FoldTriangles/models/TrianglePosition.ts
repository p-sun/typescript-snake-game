import Rect from '../../GenericModels/Rect';
import Vec2 from '../../GenericModels/Vec2';

// Corner in Rectangle in Canvas
export type Corner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
function vertForCorner(c: Corner, rect: Rect) {
  if (c === 'topLeft') {
    return new Vec2(rect.minX, rect.minY);
  } else if (c === 'topRight') {
    return new Vec2(rect.maxX, rect.minY);
  } else if (c === 'bottomLeft') {
    return new Vec2(rect.minX, rect.maxY);
  } else if (c === 'bottomRight') {
    return new Vec2(rect.maxX, rect.maxY);
  }
  throw new Error(`Invalid corner: ${c}`);
}

// Triangle Position
export type TrianglePosition = Corner;
function cornersInTriangle(c: TrianglePosition): Corner[] {
  if (c === 'topLeft') {
    return ['topRight', 'topLeft', 'bottomLeft'];
  } else if (c === 'topRight') {
    return ['topRight', 'topLeft', 'bottomRight'];
  } else if (c === 'bottomLeft') {
    return ['topLeft', 'bottomLeft', 'bottomRight'];
  } else if (c === 'bottomRight') {
    return ['topRight', 'bottomLeft', 'bottomRight'];
  }
  throw new Error(`Invalid corner: ${c}`);
}

export function getTriangleVerts(trianglePos: TrianglePosition, rect: Rect) {
  return cornersInTriangle(trianglePos).map((c) => vertForCorner(c, rect));
}
