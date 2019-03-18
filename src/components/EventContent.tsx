// @ts-ignore
import VisuallyHidden from '@reach/visually-hidden';
import format from 'date-fns/format';
import React from 'react';
import { ClassNames } from '../types';
import { getTextForDateRange } from '../utils/getTextForDateRange';

export type EventContentProps = {
  width: number;
  height: number;
  classes: ClassNames;
  dateRange: [Date, Date];
  isStart: boolean;
  isEnd: boolean;
};

export const EventContent = React.memo(function EventContent({
  width,
  height,
  classes,
  dateRange,
  isStart,
  isEnd,
}: EventContentProps) {
  return (
    <div
      style={{ width: width - 20, height }}
      className={classes['event-content']}
    >
      <VisuallyHidden>{getTextForDateRange(dateRange)}</VisuallyHidden>
      <span aria-hidden className={classes.start}>
        {isStart && format(dateRange[0], 'h:mma')}
      </span>
      <span aria-hidden className={classes.end}>
        {isEnd && format(dateRange[1], 'h:mma')}
      </span>
    </div>
  );
});
