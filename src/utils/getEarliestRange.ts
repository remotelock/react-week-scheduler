import { compareDesc } from 'date-fns';
import { DateRange } from '../types';

export function getEarliestRange(ranges: DateRange[]): DateRange | undefined {
  return [...ranges].sort(([startA], [startB]) =>
    compareDesc(startA, startB),
  )[0];
}
