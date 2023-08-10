export class TrianglesGameLogic {
  #trianglesCount: number;

  constructor(config: { trianglesCount: number }) {
    const { trianglesCount } = config;
    this.#trianglesCount = trianglesCount;
  }
}
