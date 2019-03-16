import differenceInDays from 'date-fns/difference_in_days';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import isEqual from 'date-fns/is_equal';
import startOfDay from 'date-fns/start_of_day';
import range from 'lodash/range';
import { CellInfo, DateRange } from '../types';
import { getSpan } from './getSpan';

export const createMapDateRangeToCells = ({
  toX = (x: number) => x,
  toY,
  numVerticalCells,
  originDate,
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
      spanY,
    };
  });

  if (isEqual(end, startOfDay(end))) {
    cells.pop();
  }

  return cells;
};
