import classcat from 'classcat';
import getMinutes from 'date-fns/get_minutes';
import React from 'react';
import { CellInfo, ClassNames, DateRange } from '../types';

export const Cell = React.memo(function Cell({
  timeIndex,
  children,
  classes,
  getDateRangeForVisualGrid,
  onClick,
}: {
  timeIndex: number;
  classes: ClassNames;
  getDateRangeForVisualGrid(cell: CellInfo): DateRange[];
  children?(options: { start: Date; isHourStart: boolean }): React.ReactNode;
  onClick?: React.MouseEventHandler;
}) {
  const [[start]] = getDateRangeForVisualGrid({
    startX: 0,
    startY: timeIndex,
    endX: 0,
    endY: timeIndex + 1,
    spanX: 1,
    spanY: 1,
  });

  const isHourStart = getMinutes(start) === 0;

  return (
    <div
      role="button"
      onClick={onClick}
      className={classcat([
        classes.cell,
        { [classes['is-hour-start']]: isHourStart },
      ])}
    >
      {children && children({ start, isHourStart })}
    </div>
  );
});
