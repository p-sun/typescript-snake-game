import { TextOptions } from '../../Canvas';
import { CanvasStub } from './CanvasStub';
import { createSnakeGame } from './SnakeTestData';

describe('test SnakeGame', () => {
  const drawTextFn = jest.fn((options: TextOptions) => {});

  const canvas = new CanvasStub();
  jest.spyOn(canvas, 'drawText').mockImplementation(drawTextFn);
  const game = createSnakeGame(canvas);

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
      game.onRender(canvas);
      expect(drawTextFn.mock.lastCall?.at(0)?.text).toEqual(
        'Press [space] to start!'
      );
    });
  });

  describe('when player presses space', () => {
    it('the game should play and no text is displayed', () => {
      drawTextFn.mockClear();
      game.onKeyDown({ key: 'space' });
      game.onUpdate();
      game.onRender(canvas);

      game.onUpdate();
      game.onRender(canvas);

      game.onUpdate();
      game.onRender(canvas);

      game.onUpdate();

      const allTexts = drawTextFn.mock.calls.map((arg) => arg[0].text);
      const hasPressSpaceText = allTexts.some((t) => {
        t.includes('Press [space]');
      });
      expect(hasPressSpaceText).toBe(false);
    });
  });

  describe('when snake hits a wall', () => {
    it('the game should display scores', () => {
      game.onRender(canvas);

      const allTexts = drawTextFn.mock.calls.map((arg) => arg[0].text);
      expect(allTexts).toContain('Press [space] to restart!');
      expect(allTexts).toContain('Snake length: 7');
    });
  });
});
