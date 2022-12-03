/**
 * @jest-environment jsdom
 */

import Canvas, { TextOptions } from '../../Canvas';
import { GridPosition } from '../../GenericModels/Grid';
import Vec2 from '../../GenericModels/Vec2';
import Fruit from '../Fruit';
import Snake from '../Snake';
import SnakeGame from '../SnakeGame';
import SnakeGameLogic from '../SnakeGameLogic';
import 'jest-canvas-mock';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html>').window as unknown as Window;
global.document = dom.window.document;
global.window = dom.window;
document.body.innerHTML = '<div id="root"></div>';

describe('test SnakeGame', () => {
  const gridSize = { rowCount: 4, columnCount: 5 };
  const snakePositions: GridPosition[] = [
    { row: 0, column: 2 },
    { row: 0, column: 3 },
    { row: 1, column: 3 },
    { row: 2, column: 3 },
    { row: 3, column: 3 },
    { row: 3, column: 4 },
  ];
  const gameLogic = new SnakeGameLogic(
    gridSize,
    new Snake(snakePositions, 'down', 0),
    new Fruit({ row: 1, column: 2 })
  );

  // In order to use HTML canvas, you'd need 3 npm packages:
  // `@types/jsdom` & `jest-environment-jsdom` for HTMLDocument & Window
  // `jest-canvas-mock` for HTMLCanvasElement
  const appRoot = document.getElementById('root');
  if (!appRoot) {
    return;
  }
  const canvasElement = document.createElement('canvas') as HTMLCanvasElement;
  appRoot.appendChild(canvasElement);

  let realCanvas = new Canvas(canvasElement, Vec2.zero);
  const drawTextFn = jest.fn((options: TextOptions) => {});
  jest.spyOn(realCanvas, 'drawText').mockImplementation(drawTextFn);

  const game = new SnakeGame(realCanvas, gridSize, gameLogic);
  /**
   *    h = head, F = fruit
   * c  0 1 2 3 4
   * 0  x x h O x
   * 1  x x F O x
   * 2  x x x O x
   * 3  x x x O O
   */

  describe('when game has started and player is waiting', () => {
    it('should inform the user to press space to start', () => {
      expect(drawTextFn).toBeCalledTimes(0);
      game.onUpdate();
      game.onRender(realCanvas);
      expect(drawTextFn).toBeCalledTimes(1);
      expect(drawTextFn.mock.calls.at(0)?.at(0)?.text).toEqual(
        'Press [space] to start!'
      );
    });
  });

  describe('when player presses space', () => {
    it('the game should play and no text is displayed', () => {
      drawTextFn.mockClear();
      game.onKeyDown({ key: 'space' });
      game.onUpdate();
      game.onRender(realCanvas);

      game.onUpdate();
      game.onRender(realCanvas);

      game.onUpdate();
      game.onRender(realCanvas);

      game.onUpdate();
      expect(drawTextFn).toBeCalledTimes(0);
    });
  });

  describe('when snake hits a wall', () => {
    it('the game should display scores', () => {
      game.onRender(realCanvas);
      expect(drawTextFn).toBeCalledTimes(3);

      expect(drawTextFn.mock.calls.at(0)?.at(0)?.text).toEqual(
        'Press [space] to restart!'
      );
      expect(drawTextFn.mock.calls.at(2)?.at(0)?.text).toEqual(
        'Snake length: 7'
      );
    });
  });
});
