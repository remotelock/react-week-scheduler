import React from 'react';
import { CellInfo, DateRange, Event, Grid, OnChangeCallback } from '../types';
import { RangeBox } from './RangeBox';

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
  classes: Record<string, string>;
  ranges: Event;
  grid: Grid;
  className?: string;
  isResizable?: boolean;
  isDeletable?: boolean;
  isMovable?: boolean;
  onChange?: OnChangeCallback;
  dateRangeToCells(range: DateRange): CellInfo[];
  isBeingEdited?(cell: CellInfo): boolean;
  cellInfoToDateRange(cell: CellInfo): DateRange;
}) {
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
