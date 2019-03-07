import { DateRange, CellInfo } from './types';
import {
  startOfDay,
  differenceInDays,
  differenceInMinutes,
  isEqual
} from 'date-fns';
import { range } from 'lodash';
import { getSpan } from './utils/getSpan';

export const createMapDateRangeToCells = ({
  toX = (x: number) => x,
  toY,
  numVerticalCells,
  numHorizontalCells,
  originDate
}: {
  toX: (day: number) => number;
  toY: (min: number) => number;
  numHorizontalCells: number;
  numVerticalCells: number;
  originDate: Date;
}) => ([start, end]: DateRange): CellInfo[] => {
  const originOfThisDay = startOfDay(start);
  const _startX = toX(differenceInDays(start, originDate));
  const _startY = toY(differenceInMinutes(start, originOfThisDay));
  const _endX = toX(differenceInDays(end, originDate));
  const _endY = toY(differenceInMinutes(end, startOfDay(end))) - 1;

  const cells = range(_startX, _endX + 1).map(i => {
    const startX = i;
    const endX = i;
    const atStart = i === _startX;
    const atEnd = i === _endX;
    const atEdge = atStart || atEnd;
    const inside = !atEdge;
    const startY = !atStart ? 0 : _startY;
    const endY = !atEnd ? numVerticalCells - 1 : _endY;
    const spanX = getSpan(startX, endX);
    const spanY = getSpan(startY, endY);

    return {
      startX,
      startY,
      endX,
      endY,
      spanX,
      spanY
    };
  });

  if (isEqual(end, startOfDay(end))) {
    cells.pop();
  }

  return cells;
};
