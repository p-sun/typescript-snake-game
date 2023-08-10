import { TrianglePosition } from './TrianglePosition';

type GridLayer = (Cell | null)[][];

type Cell = {
  trianglePos: TrianglePosition;
};

export class TrianglesGameLogic {
  #trianglesCount: number;
  #gridSize: number;

  #layers: GridLayer[] = [];

  constructor(config: { trianglesCount: number }) {
    const { trianglesCount } = config;
    this.#trianglesCount = trianglesCount;
    this.#gridSize = Math.ceil(trianglesCount / 2) * 2 + 1;

    this.#layers = [
      Array.from({ length: this.#gridSize }, () =>
        Array.from({ length: this.#gridSize }, () => null)
      ),
    ];

    let m = Math.floor(this.#gridSize / 2);
    this.#layers[0][m][m] = { trianglePos: 'topRight' };
    this.#layers[0][m + 1][m] = { trianglePos: 'bottomLeft' };
  }

  get gridSize() {
    return this.#gridSize;
  }

  getCell(layer: number, row: number, column: number) {
    return this.#layers[layer][row][column];
  }
}
