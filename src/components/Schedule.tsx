import React from 'react';
import { CellInfo, DateRange, Event, Grid, OnChangeCallback } from '../types';
import { RangeBox } from './RangeBox';

export type ScheduleProps = {
  classes: Record<string, string>;
  grid: Grid;
  onChange?: OnChangeCallback;
  isResizable?: boolean;
  isDeletable?: boolean;
  isMovable?: boolean;
  isBeingEdited?(cell: CellInfo): boolean;
  cellInfoToDateRange(cell: CellInfo): DateRange;
};

export function Schedule({
  classes,
  ranges,
  grid,
  className,
  onChange,
  isResizable,
  isDeletable,
  isMovable,
  cellInfoToDateRange,
  dateRangeToCells,
  isBeingEdited
}: {
  dateRangeToCells(range: DateRange): CellInfo[];
  ranges: Event;
  className?: string;
  classes: Record<string, string>;
} & ScheduleProps) {
  return (
    <div className={classes['range-boxes']}>
      {ranges.map((dateRange, rangeIndex) => {
        return (
          <span key={rangeIndex}>
            {dateRangeToCells(dateRange).map((cell, cellIndex, array) => {
              return (
                <RangeBox
                  classes={classes}
                  key={cellIndex}
                  isResizable={isResizable}
                  isMovable={isMovable}
                  isDeletable={isDeletable}
                  cellInfoToDateRange={cellInfoToDateRange}
                  cellArray={array}
                  cellIndex={cellIndex}
                  rangeIndex={rangeIndex}
                  className={className}
                  isBeingEdited={isBeingEdited}
                  onChange={onChange}
                  grid={grid}
                  cell={cell}
                />
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
