import { FoldDirection } from '../models/TrianglesGameLogic';

export function patternDescription(folds: FoldDirection[], startClockwise: boolean) {
  return (
    `Generated a pattern!\nCount: ${folds.length} \nStart clockwise: ${startClockwise}\n\n` + foldsDescription(folds)
  );
}

function foldsDescription(folds: FoldDirection[]) {
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
  return 'Folds:\n' + groupedFolds.map((folds) => folds.join(' -> ').concat(' -> ')).join('\n');
}
