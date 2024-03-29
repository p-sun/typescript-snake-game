import Rect from '../../GenericModels/Rect';
import Vec2 from '../../GenericModels/Vec2';
import { TriangleRotation } from '../models/TrianglesGameLogic';

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

// Triangle Rotation
// Vertices are listed counterclockwise. Triangle sides are at indices 0-1 and 1-2.
function cornersInTriangle(rot: TriangleRotation): Corner[] {
  if (rot === 1) {
    // topRight
    return ['bottomRight', 'topRight', 'topLeft'];
  } else if (rot === 2) {
    // bottomRight
    return ['bottomLeft', 'bottomRight', 'topRight'];
  } else if (rot === 3) {
    // bottomLeft
    return ['topLeft', 'bottomLeft', 'bottomRight'];
  } else if (rot === 4) {
    // topLeft
    return ['topRight', 'topLeft', 'bottomLeft'];
  }
  throw new Error(`Invalid corner: ${rot}`);
}

export function getTriangleVerts(rot: TriangleRotation, rect: Rect) {
  return cornersInTriangle(rot).map((c) => vertForCorner(c, rect));
}
