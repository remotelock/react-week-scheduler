import compareAsc from 'date-fns/compare_asc';
import setDay from 'date-fns/set_day';
import { DateRange } from '../types';

export function getEarliestTimeRange(
  ranges: DateRange[],
): DateRange | undefined {
  return [...ranges].sort(([startA], [startB]) =>
    compareAsc(setDay(startA, 0), setDay(startB, 0)),
  )[0];
}
