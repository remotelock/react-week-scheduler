import compareDesc from 'date-fns/compare_desc';
import setDay from 'date-fns/set_day';
import { DateRange } from '../types';

export function getEarliestTimeRange(
  ranges: DateRange[],
): DateRange | undefined {
  return [...ranges].sort(([startA], [startB]) =>
    compareDesc(setDay(startA, 0), setDay(startB, 0)),
  )[0];
}
