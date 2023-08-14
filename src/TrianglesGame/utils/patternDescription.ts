import Color from '../../GenericModels/Color';
import { FoldDirection } from '../models/TrianglesGameLogic';

export function printPatternDescription(
  folds: FoldDirection[],
  startClockwise: boolean,
  layers: number,
  triangleColors: Color[]
) {
  const { text, args } = foldsDescription(folds, triangleColors);
  console.log(
    `============ Generated a pattern! ============` +
      `\nTotal triangles: ${folds.length}` +
      `\nTotal layers: ${layers}` +
      `\nFirst triangle starts: ${startClockwise ? 'Clockwise' : 'Counterclockwise'}\n` +
      text,
    ...args
  );
}

function foldsDescription(folds: FoldDirection[], triangleColors: Color[]) {
  const groupedFolds = folds
    .slice(1)
    .map((f) => (f === 1 ? 'Up   ' : f === -1 ? 'Down ' : '0    '))
    .reduce(
      (acc, f) => {
        const last = acc[acc.length - 1];
        if (last.length === 5) {
          return acc.concat([[f]]);
        }
        last.push(f);
        return acc;
      },
      [['Start']]
    );

  let i = 0;
  let text = '\nFolds:';
  let args: string[] = [];
  for (let folds of groupedFolds) {
    text += '\n';
    for (let fold of folds) {
      text += `%c${fold} -> `;
      const color = triangleColors[i % triangleColors.length];
      args.push(`color: ${color.asHexString()}; background: #000; font-weight:bold;`);
      i++;
    }
  }

  return { text, args };
}
