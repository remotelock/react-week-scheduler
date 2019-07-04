// @ts-ignore
import VisuallyHidden from '@reach/visually-hidden';
import React, { useContext } from 'react';
import { SchedulerContext } from '../context';
import { ClassNames } from '../types';
import {
  getFormattedComponentsForDateRange,
  getTextForDateRange,
} from '../utils/getTextForDateRange';

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
  const { locale } = useContext(SchedulerContext);
  const [start, end] = getFormattedComponentsForDateRange({
    dateRange,
    locale,
    includeDayIfSame: false,
  });

  return (
    <div
      style={{ width: width - 20, height }}
      className={classes['event-content']}
    >
      <VisuallyHidden>
        {getTextForDateRange({ dateRange, locale })}
      </VisuallyHidden>
      <span aria-hidden className={classes.start}>
        {isStart && start}
      </span>
      <span aria-hidden className={classes.end}>
        {isEnd && end}
      </span>
    </div>
  );
});
