import getDay from 'date-fns/get_day';
import isSameDay from 'date-fns/is_same_day';
import setDay from 'date-fns/set_day';
import { CellInfo, DateRange, MapCellInfoToDateRange } from '../types';
import { createMapCellInfoToContiguousDateRange } from './createMapCellInfoToContiguousDateRange';

const constrainToOneDay = ([start, end]: DateRange): DateRange => {
  if (!isSameDay(end, start)) {
    return [start, setDay(end, getDay(start))];
  }

  return [start, end];
};

export const createMapCellInfoToSingleDayRange: MapCellInfoToDateRange = options => {
  const mapToRange = createMapCellInfoToContiguousDateRange(options);
  return (info: CellInfo): DateRange[] => {
    return [constrainToOneDay(mapToRange(info)[0])];
  };
};
