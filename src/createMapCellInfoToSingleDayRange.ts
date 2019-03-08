import { MapCellInfoToDateRange, DateRange, CellInfo } from './types';
import { createMapCellInfoToContiguousDateRange } from './createMapCellInfoToContiguousDateRange';
import { startOfDay, setDay, getDay, addDays, isEqual } from 'date-fns';

const constrainToOneDay = ([start, end]: DateRange): DateRange => {
  if (isEqual(startOfDay(end), end)) {
    return [start, startOfDay(addDays(start, 1))];
  }
  return [start, setDay(end, getDay(start))];
};

export const createMapCellInfoToSingleDateRange: MapCellInfoToDateRange = options => {
  const mapToRange = createMapCellInfoToContiguousDateRange(options);
  return (info: CellInfo): DateRange[] => {
    return [constrainToOneDay(mapToRange(info)[0])];
  };
};
