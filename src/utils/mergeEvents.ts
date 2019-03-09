import { Event } from '../types';
// @ts-ignore
import _mergeRanges from 'merge-ranges';
import { compareAsc } from 'date-fns';

export function mergeRanges(event: Event): Event {
  return _mergeRanges([...event].map(d => d.map(c => new Date(c))));
}

export function mergeEvents(event1: Event, event2: Event | null): Event {
  if (event2 === null) {
    return event1;
  }

  return mergeRanges([...event1, ...event2]).sort((range1, range2) =>
    compareAsc(range1[0], range2[0])
  );
}
