import React from 'react';
import {
  CellInfo,
  ClassNames,
  DateRange,
  Grid,
  OnChangeCallback,
  ScheduleType,
} from '../types';
import { RangeBox } from './RangeBox';

export type ScheduleProps = {
  classes: ClassNames;
  grid: Grid;
  onChange?: OnChangeCallback;
  isResizable?: boolean;
  isDeletable?: boolean;
  moveAxis: 'none' | 'both' | 'x' | 'y';
  cellInfoToDateRange(cell: CellInfo): DateRange;
  onActiveChange?(index: [number, number] | [null, null]): void;
  onClick?(index: [number, number] | [null, null]): void;
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
  onActiveChange: onActive,
}: {
  dateRangeToCells(range: DateRange): CellInfo[];
  ranges: ScheduleType;
  className?: string;
  classes: ClassNames;
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
