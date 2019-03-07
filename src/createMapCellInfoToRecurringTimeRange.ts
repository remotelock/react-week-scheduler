import { DateRange, MapCellInfoToDateRange } from './types';
import { range } from 'lodash';
import {
  addMinutes,
  isBefore,
  endOfDay,
  isEqual,
  subDays,
  startOfDay
} from 'date-fns';
import { cellToDate } from './cellToDate';

export type RecurringTimeRange = DateRange[];

export const createMapCellInfoToRecurringTimeRange: MapCellInfoToDateRange = ({
  toMin,
  toDay,
  originDate
}) => ({ startX, startY, endX, endY, spanX, spanY }) => {
  const result = range(startX, endX + 1)
    .map(i => {
      const startDate = cellToDate({
        startX: i,
        startY,
        toMin,
        toDay,
        originDate
      });
      let endDate = addMinutes(startDate, toMin(spanY));

      if (isEqual(endDate, startOfDay(endDate))) {
        endDate = endOfDay(subDays(endDate, 1));
      }

      const range: DateRange = isBefore(startDate, endDate)
        ? [startDate, endDate]
        : [endDate, startDate];

      return range;
    })
    .sort((rangeA, rangeB) => (isBefore(rangeA[0], rangeB[0]) ? 0 : 1));

  return result;
};
