import { MapCellInfoToDateRange } from '../types';
import { isBefore } from 'date-fns';
import { cellToDate } from './cellToDate';

export const createMapCellInfoToContiguousDateRange: MapCellInfoToDateRange = ({
  fromY: toMin,
  fromX: toDay,
  originDate
}) => ({ startX, startY, endX, endY }) => {
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
