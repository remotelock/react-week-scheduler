import useComponentSize from '@rehooks/component-size';
import classcat from 'classcat';
import addDays from 'date-fns/add_days';
import addHours from 'date-fns/add_hours';
import format from 'date-fns/format';
import isDateEqual from 'date-fns/is_equal';
import startOfDay from 'date-fns/start_of_day';
import invariant from 'invariant';
import isEqual from 'lodash/isEqual';
import times from 'lodash/times';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import { SchedulerContext } from '../context';
import { useClickAndDrag } from '../hooks/useClickAndDrag';
import { useMousetrap } from '../hooks/useMousetrap';
import {
  CellInfo,
  ClassNames,
  DateRange,
  Grid,
  OnChangeCallback,
  ScheduleType,
} from '../types';
import { createGrid } from '../utils/createGrid';
import {
  createMapCellInfoToRecurringTimeRange,
  RecurringTimeRange,
} from '../utils/createMapCellInfoToRecurringTimeRange';
import { createMapDateRangeToCells } from '../utils/createMapDateRangeToCells';
import { getEarliestTimeRange } from '../utils/getEarliestTimeRange';
import { getSpan } from '../utils/getSpan';
import { mergeEvents, mergeRanges } from '../utils/mergeEvents';
import { Cell } from './Cell';
import { Schedule, ScheduleProps } from './Schedule';

const MINS_IN_DAY = 24 * 60;
const horizontalPrecision = 1;
const toDay = (x: number): number => x * horizontalPrecision;
const toX = (days: number): number => days / horizontalPrecision;
const DELETE_KEYS = ['del', 'backspace'];

export const TimeGridScheduler = React.memo(function TimeGridScheduler({
  verticalPrecision = 30,
  visualGridVerticalPrecision = 30,
  cellClickPrecision = visualGridVerticalPrecision,
  style,
  schedule,
  originDate: _originDate = new Date(),
  defaultHours = [9, 15],
  classes,
  className,
  onChange,
  onEventClick,
  eventContentComponent,
  eventRootComponent,
  disabled,
}: {
  originDate?: Date;

  /**
   * The minimum number of minutes a created range can span
   * @default 30
   */
  verticalPrecision?: number;

  /**
   * The visual grid increments in minutes.
   * @default 30
   */
  visualGridVerticalPrecision?: number;

  /**
   * The minimum number of minutes for an time block
   * created with a single click.
   * @default visualGridVerticalPrecision
   */
  cellClickPrecision?: number;

  /** Custom styles applied to the root of the view */
  style?: React.CSSProperties;
  schedule: ScheduleType;

  /**
   * A map of class names to the scoped class names
   * The keys are class names like `'root'` and the values
   * are the corresponding class names which can be scoped
   * with CSS Modules, e.g. `'_root_7f2c6'`.
   */
  classes: ClassNames;
  className?: string;

  /**
   * The view will initially be scrolled to these hours.
   * Defaults to work hours (9-17).
   * @default [9, 17]
   */
  defaultHours?: [number, number];
  onChange(newSchedule: ScheduleType): void;
  onEventClick?: ScheduleProps['onClick'];
  eventContentComponent?: ScheduleProps['eventContentComponent'];
  eventRootComponent?: ScheduleProps['eventRootComponent'];
  disabled?: boolean;
}) {
  const { locale } = useContext(SchedulerContext);
  const originDate = useMemo(() => startOfDay(_originDate), [_originDate]);
  const numVerticalCells = MINS_IN_DAY / verticalPrecision;
  const numHorizontalCells = 7 / horizontalPrecision;
  const toMin = useCallback((y: number) => y * verticalPrecision, [
    verticalPrecision,
  ]);
  const toY = useCallback((mins: number): number => mins / verticalPrecision, [
    verticalPrecision,
  ]);

  const cellInfoToDateRanges = useMemo(() => {
    return createMapCellInfoToRecurringTimeRange({
      originDate,
      fromY: toMin,
      fromX: toDay,
    });
  }, [toMin, originDate]);

  const cellInfoToSingleDateRange = useCallback(
    (cell: CellInfo): DateRange => {
      const [first, ...rest] = cellInfoToDateRanges(cell);
      invariant(
        rest.length === 0,
        `Expected "cellInfoToSingleDateRange" to return a single date range, found ${
          rest.length
        } additional ranges instead. This is a bug in @remotelock/react-week-scheduler`,
      );

      return first;
    },
    [cellInfoToDateRanges],
  );

  const dateRangeToCells = useMemo(() => {
    return createMapDateRangeToCells({
      originDate,
      numVerticalCells,
      numHorizontalCells,
      toX,
      toY,
    });
  }, [toY, numVerticalCells, numHorizontalCells, originDate]);

  const root = useRef<HTMLDivElement | null>(null);
  const parent = useRef<HTMLDivElement | null>(null);

  const size = useComponentSize(parent);
  const {
    style: dragBoxStyle,
    box,
    isDragging,
    hasFinishedDragging,
    cancel,
  } = useClickAndDrag(parent, disabled);
  const [
    pendingCreation,
    setPendingCreation,
  ] = useState<RecurringTimeRange | null>(null);

  const [[totalHeight, totalWidth], setDimensions] = useState([0, 0]);

  const numVisualVerticalCells = (24 * 60) / visualGridVerticalPrecision;

  useEffect(
    function updateGridDimensionsOnSizeOrCellCountChange() {
      if (!parent.current) {
        setDimensions([0, 0]);
        return;
      }

      setDimensions([parent.current.scrollHeight, parent.current.scrollWidth]);
    },
    [size, numVisualVerticalCells],
  );

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

  useEffect(
    function updatePendingCreationOnDragBoxUpdate() {
      if (grid === null || box === null) {
        setPendingCreation(null);
        return;
      }

      const cell = grid.getCellFromRect(box);
      const dateRanges = cellInfoToDateRanges(cell);
      const event = dateRanges;
      setPendingCreation(event);
    },
    [box, grid, cellInfoToDateRanges, toY],
  );

  const [[activeRangeIndex, activeCellIndex], setActive] = useState<
    [number, number] | [null, null]
  >([null, null]);

  useEffect(
    function updateScheduleAfterDraggingFinished() {
      if (disabled) {
        return;
      }

      if (hasFinishedDragging) {
        onChange(mergeEvents(schedule, pendingCreation));
        setPendingCreation(null);
      }
    },
    [
      hasFinishedDragging,
      disabled,
      onChange,
      setPendingCreation,
      pendingCreation,
      schedule,
    ],
  );

  useEffect(
    function clearActiveBlockAfterCreation() {
      if (pendingCreation === null) {
        setActive([null, null]);
      }
    },
    [pendingCreation],
  );

  const handleEventChange = useCallback<OnChangeCallback>(
    (newDateRange, rangeIndex) => {
      if (disabled) {
        return;
      }

      if (!schedule && newDateRange) {
        onChange([newDateRange]);

        return;
      }

      let newSchedule = [...schedule];

      if (!newDateRange) {
        newSchedule.splice(rangeIndex, 1);
      } else {
        if (
          isDateEqual(newDateRange[0], newSchedule[rangeIndex][0]) &&
          isDateEqual(newDateRange[1], newSchedule[rangeIndex][1])
        ) {
          return;
        }
        newSchedule[rangeIndex] = newDateRange;
      }

      newSchedule = mergeRanges(newSchedule);

      onChange(newSchedule);
    },
    [schedule, onChange, disabled],
  );

  useMousetrap(
    'esc',
    function cancelOnEsc() {
      if (pendingCreation) {
        cancel();
      }
    },
    document,
  );

  const getIsActive = useCallback(
    ({ rangeIndex, cellIndex }) => {
      return rangeIndex === activeRangeIndex && cellIndex === activeCellIndex;
    },
    [activeCellIndex, activeRangeIndex],
  );

  const handleDelete = useCallback(
    (e: ExtendedKeyboardEvent) => {
      if (activeRangeIndex === null || disabled) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      handleEventChange(undefined, activeRangeIndex);
    },
    [activeRangeIndex, disabled, handleEventChange],
  );

  useMousetrap(DELETE_KEYS, handleDelete, root);

  useEffect(
    function cancelPendingCreationOnSizeChange() {
      cancel();
    },
    [size, cancel],
  );

  const getDateRangeForVisualGrid = useMemo(() => {
    return createMapCellInfoToRecurringTimeRange({
      originDate,
      fromX: toDay,
      fromY: y => y * visualGridVerticalPrecision,
    });
  }, [visualGridVerticalPrecision, originDate]);

  useEffect(
    function scrollToActiveTimeBlock() {
      if (!document.activeElement) {
        return;
      }

      if (!root.current || !root.current.contains(document.activeElement)) {
        return;
      }

      scrollIntoView(document.activeElement, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest',
      });
    },
    [schedule],
  );

  const [wasInitialScrollPerformed, setWasInitialScrollPerformed] = useState(
    false,
  );

  useEffect(
    function performInitialScroll() {
      if (wasInitialScrollPerformed || !root.current || !grid) {
        return;
      }

      const range = dateRangeToCells(
        getEarliestTimeRange(schedule) || [
          addHours(originDate, defaultHours[0]),
          addHours(originDate, defaultHours[1]),
        ],
      );
      const rect = grid.getRectFromCell(range[0]);
      const { top, bottom } = rect;

      if (top === 0 && bottom === 0) {
        return;
      }

      // IE, Edge do not support it
      if (!('scrollBy' in root.current)) {
        return;
      }

      root.current.scrollBy(0, top);

      setWasInitialScrollPerformed(true);
    },
    [
      wasInitialScrollPerformed,
      grid,
      schedule,
      defaultHours,
      originDate,
      dateRangeToCells,
    ],
  );

  const handleBlur: React.FocusEventHandler = useCallback(
    event => {
      if (!event.target.contains(document.activeElement)) {
        setActive([null, null]);
      }
    },
    [setActive],
  );

  const handleCellClick = useCallback(
    (dayIndex: number, timeIndex: number) => (event: React.MouseEvent) => {
      if (!grid || disabled) {
        return;
      }

      const spanY = toY(cellClickPrecision);
      const cell = {
        startX: dayIndex,
        startY: timeIndex,
        endX: dayIndex,
        endY: spanY + timeIndex,
        spanY,
        spanX: getSpan(dayIndex, dayIndex),
      };

      const dateRanges = cellInfoToDateRanges(cell);

      setPendingCreation(dateRanges);

      event.stopPropagation();
      event.preventDefault();
    },
    [grid, disabled, toY, cellClickPrecision, cellInfoToDateRanges],
  );

  return (
    <div
      ref={root}
      style={style}
      onBlur={handleBlur}
      touch-action={isDragging ? 'none' : undefined}
      className={classcat([
        classes.root,
        classes.theme,
        className,
        { [classes['no-scroll']]: isDragging },
      ])}
    >
      <div className={classes['grid-root']}>
        <div
          aria-hidden
          className={classcat([classes.timeline, classes['sticky-left']])}
        >
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
                              {format(start, 'h a', { locale })}
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
        <div
          className={classcat([
            classes['sticky-top'],
            classes['day-header-row'],
          ])}
        >
          <div
            role="presentation"
            className={classcat([classes.calendar, classes.header])}
          >
            {times(7).map(i => (
              <div
                key={i}
                role="presentation"
                className={classes['day-column']}
              >
                <div className={classcat([classes.cell, classes.title])}>
                  {format(addDays(originDate, i), 'ddd', { locale })}
                </div>
              </div>
            ))}
          </div>
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
              eventContentComponent={eventContentComponent}
              getIsActive={getIsActive}
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
              onClick={onEventClick}
              ranges={schedule}
              grid={grid}
              eventContentComponent={eventContentComponent}
              eventRootComponent={eventRootComponent}
              getIsActive={getIsActive}
              disabled={disabled}
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
                          onClick={handleCellClick(
                            dayIndex,
                            timeIndex *
                              (numVerticalCells / numVisualVerticalCells),
                          )}
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
}, isEqual);
