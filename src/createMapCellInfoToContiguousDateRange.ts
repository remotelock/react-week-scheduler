import { MapCellInfoToDateRange } from './types';
import { isBefore } from 'date-fns';
import { cellToDate } from './cellToDate';

export const createMapCellInfoToContiguousDateRange: MapCellInfoToDateRange = ({
  toMin,
  toDay,
  originDate
}) => ({ startX, startY, endX, endY, spanX, spanY }) => {
  const startDay = startX;
  const endDay = endX;
  const startDate = cellToDate({ startX, startY, toMin, toDay, originDate });
  const endDate = cellToDate({
    startX: endX,
    startY: endY,
    toMin,
    toDay,
    originDate
  });

  return [
    isBefore(startDate, endDate) ? [startDate, endDate] : [endDate, startDate]
  ];
};
