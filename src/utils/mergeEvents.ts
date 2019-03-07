import { find, reject } from 'lodash';
import { isSameDay, isWithinRange } from 'date-fns';
import { Event } from '../types';
// @ts-ignore
import _mergeRanges from 'merge-ranges';

export function mergeRanges(event: Event): Event {
  return _mergeRanges([...event].map(d => d.map(c => new Date(c))));
}

export function rejectOverlappingRanges(event1: Event, event2: Event): Event {
  return reject(event1, range1 => {
    try {
      const range2 = find(
        event2,
        range =>
          isSameDay(range[0], range1[0]) && isSameDay(range[1], range1[1])
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
    } finally {
      return false;
    }
  }) as Event;
}

export function mergeEvents(event1: Event, event2: Event | null): Event {
  if (event2 === null) {
    return event1;
  }

  return mergeRanges([...event1, ...event2]);
}
