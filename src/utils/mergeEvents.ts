import { times, find, reject } from 'lodash';
import {
  min,
  areRangesOverlapping,
  max,
  isSameDay,
  isEqual,
  isWithinRange
} from 'date-fns';
import { Event, DateRange } from '../types';

export function rejectOverlappingRanges(event1: Event, event2: Event): Event {
  return reject(event1, range1 => {
    const range2 = find(
      event2,
      range => isSameDay(range[0], range1[0]) && isSameDay(range[1], range1[1])
    );

    if (!range2) {
      return false;
    }

    if (
      isWithinRange(range1[0], range2[0], range2[1]) &&
      isWithinRange(range1[1], range2[0], range2[1])
    ) {
      return true;
    }
  }) as Event;
}

export function mergeEvents(event1: Event, event2: Event): Event {
  return times(Math.max(event1.length, event2.length), i => {
    const range1 = event1[i];
    const range2 = find(
      event2,
      range => isSameDay(range[0], range1[0]) && isSameDay(range[1], range1[1])
    );

    if (!range2) {
      return range1;
    }

    if (!range1) {
      return range2;
    }

    if (
      areRangesOverlapping(range1[0], range1[1], range2[0], range2[1]) ||
      isEqual(range1[0], range2[1]) ||
      isEqual(range1[1], range2[0])
    ) {
      return [
        min(range1[0], range2[0]),
        max(range1[1], range2[1])
      ] as DateRange;
    }

    return range1;
  });
}
