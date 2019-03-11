import React from 'react';
import { CellInfo, DateRange, Event, Grid, OnChangeCallback } from '../types';
import { RangeBox } from './RangeBox';

export type ScheduleProps = {
  classes: Record<string, string>;
  grid: Grid;
  onChange?: OnChangeCallback;
  isResizable?: boolean;
  isDeletable?: boolean;
  moveAxis: 'none' | 'both' | 'x' | 'y';
  isBeingEdited?(cell: CellInfo): boolean;
  cellInfoToDateRange(cell: CellInfo): DateRange;
  onActiveChange?(index: [number, number] | [null, null]): void;
};

export const Schedule = React.memo(function Schedule({
  classes,
  ranges,
  grid,
  className,
  onChange,
  isResizable,
  isDeletable,
  moveAxis: isMovable,
  cellInfoToDateRange,
  dateRangeToCells,
  isBeingEdited,
  onActiveChange: onActive
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
            {dateRangeToCells(dateRange).map((cell, cellIndex, cellArray) => {
              return (
                <RangeBox
                  classes={classes}
                  onActiveChange={onActive}
                  key={`${rangeIndex}.${ranges.length}.${cellIndex}.${
                    cellArray.length
                  }`}
                  isResizable={isResizable}
                  moveAxis={isMovable}
                  isDeletable={isDeletable}
                  cellInfoToDateRange={cellInfoToDateRange}
                  cellArray={cellArray}
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
});
