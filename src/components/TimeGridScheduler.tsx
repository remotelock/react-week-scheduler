import useComponentSize from '@rehooks/component-size';
import classcat from 'classcat';
import { addDays, format, isEqual } from 'date-fns';
import invariant from 'invariant';
import { times } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { useClickAndDrag } from '../hooks/useClickAndDrag';
import useMousetrap from '../hooks/useMousetrap';
import { useStickyStyle } from '../hooks/useStickyStyle';
import {
  CellInfo,
  DateRange,
  Grid,
  OnChangeCallback,
  ScheduleType,
} from '../types';
import { createGrid } from '../utils/createGrid';
import { createMapCellInfoToContiguousDateRange } from '../utils/createMapCellInfoToContiguousDateRange';
import {
  createMapCellInfoToRecurringTimeRange,
  RecurringTimeRange,
} from '../utils/createMapCellInfoToRecurringTimeRange';
import { createMapDateRangeToCells } from '../utils/createMapDateRangeToCells';
import { mergeEvents, mergeRanges } from '../utils/mergeEvents';
import { Cell } from './Cell';
import { Schedule } from './Schedule';

const MINS_IN_DAY = 24 * 60;
const horizontalPrecision = 1;
const toDay = (x: number): number => x * horizontalPrecision;
const toX = (days: number): number => days / horizontalPrecision;

export const TimeGridScheduler = React.memo(function TimeGridScheduler({
  verticalPrecision = 30,
  visualGridVerticalPrecision = 30,
  style,
  schedule,
  originDate = new Date(),
  classes,
  className,
  onChange,
}: {
  originDate?: Date;
  verticalPrecision?: number;
  visualGridVerticalPrecision?: number;
  style?: React.CSSProperties;
  schedule: ScheduleType;
  classes: Record<string, string>;
  className?: string;
  onChange(newSchedule: ScheduleType): void;
}) {
  const numVerticalCells = MINS_IN_DAY / verticalPrecision;
  const numHorizontalCells = 7 / horizontalPrecision;
  const toMin = useCallback((y: number) => y * verticalPrecision, [
    verticalPrecision,
  ]);
  const toY = useCallback((mins: number): number => mins / verticalPrecision, [
    verticalPrecision,
  ]);

  const cellInfoToDateRanges = useMemo(
    () =>
      createMapCellInfoToRecurringTimeRange({
        originDate,
        fromY: toMin,
        fromX: toDay,
      }),
    [toMin, originDate],
  );

  const cellInfoToSingleDateRange = useCallback(
    (cell: CellInfo): DateRange => {
      const [first, ...rest] = cellInfoToDateRanges(cell);
      invariant(
        rest.length === 0,
        `Expected "cellInfoToSingleDateRange" to return a single date range, found ${
          rest.length
        } additional ranges instead. This is a bug in @remotelock/weekly-scheduler`,
      );

      return first;
    },
    [cellInfoToDateRanges],
  );

  const dateRangeToCells = useMemo(
    () =>
      createMapDateRangeToCells({
        originDate,
        numVerticalCells,
        numHorizontalCells,
        toX,
        toY,
      }),
    [toY, numVerticalCells, numHorizontalCells, originDate],
  );

  const root = useRef<HTMLDivElement | null>(null);
  const parent = useRef<HTMLDivElement | null>(null);
  const timelineStickyStyle = useStickyStyle(root, { top: false, left: true });
  const headerStickyStyle = useStickyStyle(root, { top: false, left: false });

  const size = useComponentSize(parent);
  const {
    style: dragBoxStyle,
    box,
    isDragging,
    hasFinishedDragging,
    cancel,
  } = useClickAndDrag(parent);
  const [
    pendingCreation,
    setPendingCreation,
  ] = useState<RecurringTimeRange | null>(null);

  const currentParent = parent.current;
  const currentRoot = root.current;

  const [[totalHeight, totalWidth], setDimensions] = useState<
    [null, null] | [number, number]
  >([null, null]);

  useEffect(() => {
    if (currentParent !== null) {
      setDimensions([currentParent.scrollHeight, currentParent.scrollWidth]);
    }

    return setDimensions([null, null]);
  }, [currentParent, size]);

  const numVisualVerticalCells = (24 * 60) / visualGridVerticalPrecision;

  const grid = useMemo<Grid | null>(() => {
    if (totalHeight === null || totalWidth === null) {
      return null;
    }

    return createGrid({
      totalHeight,
      totalWidth,
      numHorizontalCells,
      numVerticalCells,
    });
  }, [totalHeight, totalWidth, numHorizontalCells, numVerticalCells]);

  useEffect(() => {
    if (grid === null || box === null) {
      setPendingCreation(null);
      return;
    }

    const constrainedBox = box;
    const cell = grid.getCellFromRect(constrainedBox);
    const dateRanges = cellInfoToDateRanges(cell);
    const event = dateRanges;
    setPendingCreation(event);
  }, [box, grid, cellInfoToDateRanges, setPendingCreation]);

  useEffect(() => {
    if (hasFinishedDragging) {
      onChange(mergeEvents(schedule, pendingCreation));
      setPendingCreation(null);
    }
  }, [
    hasFinishedDragging,
    onChange,
    setPendingCreation,
    pendingCreation,
    schedule,
  ]);

  const handleEventChange = useCallback<OnChangeCallback>(
    (newDateRange, rangeIndex) => {
      if (!schedule && newDateRange) {
        onChange([newDateRange]);

        return;
      }

      let newSchedule = [...schedule];

      if (!newDateRange) {
        newSchedule.splice(rangeIndex, 1);
      } else {
        if (
          isEqual(newDateRange[0], newSchedule[rangeIndex][0]) &&
          isEqual(newDateRange[1], newSchedule[rangeIndex][1])
        ) {
          return;
        }
        newSchedule[rangeIndex] = newDateRange;
      }

      newSchedule = mergeRanges(newSchedule);

      onChange(newSchedule);
    },
    [schedule, onChange],
  );

  useMousetrap(
    'esc',
    () => {
      if (pendingCreation) {
        cancel();
      }
    },
    document,
  );

  const [[activeRangeIndex], setActive] = useState<
    [number, number] | [null, null]
  >([null, null]);

  const handleDelete = useCallback(() => {
    if (activeRangeIndex === null) {
      return;
    }

    handleEventChange(undefined, activeRangeIndex);
  }, [activeRangeIndex, handleEventChange]);

  useMousetrap('del', handleDelete, currentRoot);

  useEffect(() => {
    cancel();
  }, [size, cancel]);

  const getDateRangeForVisualGrid = useMemo(
    () =>
      createMapCellInfoToContiguousDateRange({
        originDate,
        fromX: toDay,
        fromY: y => y * visualGridVerticalPrecision,
      }),
    [visualGridVerticalPrecision, originDate],
  );

  useEffect(() => {
    if (!document.activeElement) {
      return;
    }

    if (!currentRoot || !currentRoot.contains(document.activeElement)) {
      return;
    }

    scrollIntoView(document.activeElement, {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [currentRoot, schedule]);

  return (
    <div
      ref={root}
      onBlur={() => setActive([null, null])}
      style={style}
      className={classcat([
        className,
        classes.root,
        { [classes['no-scroll']]: isDragging },
      ])}
    >
      <div style={timelineStickyStyle} aria-hidden className={classes.timeline}>
        <div className={classes.header}>
          <div className={classes['day-column']}>
            <div className={classcat([classes.cell, classes.title])}>T</div>
          </div>
        </div>
        <div className={classes.calendar}>
          <div className={classes['day-column']}>
            <div className={classes['day-hours']}>
              {times(numVisualVerticalCells).map(timeIndex => {
                return (
                  <Cell
                    classes={classes}
                    getDateRangeForVisualGrid={getDateRangeForVisualGrid}
                    key={timeIndex}
                    timeIndex={timeIndex}
                  >
                    {({ start, isHourStart }) => {
                      if (isHourStart) {
                        return (
                          <div className={classes.time}>
                            {format(start, 'h a')}
                          </div>
                        );
                      }

                      return null;
                    }}
                  </Cell>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div
          style={headerStickyStyle}
          role="presentation"
          className={classcat([classes.calendar, classes.header])}
        >
          {times(7).map(i => (
            <div key={i} role="presentation" className={classes['day-column']}>
              <div className={classcat([classes.cell, classes.title])}>
                {format(addDays(originDate, i), 'ddd')}
              </div>
            </div>
          ))}
        </div>
        <div className={classes['layer-container']}>
          {isDragging && (
            <div className={classes['drag-box']} style={dragBoxStyle}>
              {hasFinishedDragging && <div className={classes.popup} />}
            </div>
          )}
          {grid && pendingCreation && isDragging && (
            <Schedule
              classes={classes}
              dateRangeToCells={dateRangeToCells}
              cellInfoToDateRange={cellInfoToSingleDateRange}
              className={classes['is-pending-creation']}
              ranges={mergeEvents(schedule, pendingCreation)}
              grid={grid}
              moveAxis="none"
            />
          )}
          {grid && !pendingCreation && (
            <Schedule
              classes={classes}
              onActiveChange={setActive}
              dateRangeToCells={dateRangeToCells}
              cellInfoToDateRange={cellInfoToSingleDateRange}
              isResizable
              moveAxis="y"
              isDeletable
              onChange={handleEventChange}
              ranges={schedule}
              grid={grid}
            />
          )}

          <div ref={parent} role="grid" className={classes.calendar}>
            {times(7).map(dayIndex => {
              return (
                <div
                  role="gridcell"
                  key={dayIndex}
                  className={classes['day-column']}
                >
                  <div className={classes['day-hours']}>
                    {times(numVisualVerticalCells).map(timeIndex => {
                      return (
                        <Cell
                          classes={classes}
                          getDateRangeForVisualGrid={getDateRangeForVisualGrid}
                          key={timeIndex}
                          timeIndex={timeIndex}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
