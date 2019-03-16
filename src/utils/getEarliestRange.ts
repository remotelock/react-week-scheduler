import compareDesc from 'date-fns/compare_desc';
import { DateRange } from '../types';

export function getEarliestRange(ranges: DateRange[]): DateRange | undefined {
  return [...ranges].sort(([startA], [startB]) =>
    compareDesc(startA, startB),
  )[0];
}
