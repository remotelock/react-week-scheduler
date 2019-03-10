import useComponentSize from '@rehooks/component-size';
import classcat from 'classcat';
import { addDays, compareAsc, format, startOfWeek } from 'date-fns';
import invariant from 'invariant';
import { times } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ReactDOM from 'react-dom';
import 'resize-observer-polyfill/dist/ResizeObserver.global';
import scrollIntoView from 'scroll-into-view-if-needed';
import useUndo from 'use-undo';
import { Schedule } from './components/Schedule';
import { useClickAndDrag } from './hooks/useClickAndDrag';
import useMousetrap from './hooks/useMousetrap';
import { useStickyStyle } from './hooks/useStickyStyle';
import classes from './styles.module.scss';
import {
  CellInfo,
  DateRange,
  Event as CalendarEvent,
  Grid,
  OnChangeCallback
} from './types';
import { createGridForContainer } from './utils/createGridFromContainer';
import { createMapCellInfoToContiguousDateRange } from './utils/createMapCellInfoToContiguousDateRange';
import {
  createMapCellInfoToRecurringTimeRange,
  RecurringTimeRange
} from './utils/createMapCellInfoToRecurringTimeRange';
import { createMapDateRangeToCells } from './utils/createMapDateRangeToCells';
import { mergeEvents, mergeRanges } from './utils/mergeEvents';

const rangeStrings: [string, string][] = [
  ['2019-03-03T22:45:00.000Z', '2019-03-04T01:15:00.000Z'],
  ['2019-03-05T22:00:00.000Z', '2019-03-06T01:00:00.000Z'],
  ['2019-03-04T22:15:00.000Z', '2019-03-05T01:00:00.000Z'],
  ['2019-03-07T05:30:00.000Z', '2019-03-07T10:00:00.000Z'],
  ['2019-03-08T22:00:00.000Z', '2019-03-09T01:00:00.000Z'],
  ['2019-03-09T22:00:00.000Z', '2019-03-10T01:00:00.000Z'],
  ['2019-03-06T22:00:00.000Z', '2019-03-07T01:00:00.000Z']
];

const defaultSchedule: CalendarEvent = rangeStrings
  .map(range => range.map(dateString => new Date(dateString)) as [Date, Date])
  .sort((range1, range2) => compareAsc(range1[0], range2[0]));

const MINS_IN_DAY = 24 * 60;
const horizontalPrecision = 1;
const toDay = (x: number) => x * horizontalPrecision;
const toX = (days: number) => days / horizontalPrecision;

const TimeGridScheduler = React.memo(function TimeGridScheduler({
  verticalPrecision = 30,
  visualGridVerticalPrecision = 30,
  schedule,
  originDate = new Date()
}: {
  originDate?: Date;
  verticalPrecision?: number;
  visualGridVerticalPrecision?: number;
  schedule: CalendarEvent;
}) {
  const numVerticalCells = MINS_IN_DAY / verticalPrecision;
  const numHorizontalCells = 7 / horizontalPrecision;
  const toMin = useCallback((y: number) => y * verticalPrecision, [
    verticalPrecision
  ]);
  const toY = (mins: number) => mins / verticalPrecision;

  const cellInfoToDateRanges = useMemo(
    () =>
      createMapCellInfoToRecurringTimeRange({
        originDate,
        fromY: toMin,
        fromX: toDay
      }),
    [toMin, toDay, originDate]
  );

  const cellInfoToSingleDateRange = useCallback(
    (cell: CellInfo): DateRange => {
      const [first, ...rest] = cellInfoToDateRanges(cell);

      invariant(
        rest.length === 0,
        `Expected "cellInfoToSingleDateRange" to return a single date range, found ${
          rest.length
        } additional ranges instead. This is a bug in @remotelock/weekly-scheduler`
      );

      return first;
    },
    [cellInfoToDateRanges]
  );

  const dateRangeToCells = useMemo(
    () =>
      createMapDateRangeToCells({
        originDate,
        numVerticalCells,
        numHorizontalCells,
        toX,
        toY
      }),
    [toY, toX, numVerticalCells, numHorizontalCells, originDate]
  );

  const root = useRef<HTMLDivElement | null>(null);
  const parent = useRef<HTMLDivElement | null>(null);
  const timelineStickyStyle = useStickyStyle(root, { top: false, left: true });
  const headerStickyStyle = useStickyStyle(root, { top: false, left: false });

  const size = useComponentSize(parent);
  const {
    style,
    box,
    isDragging,
    hasFinishedDragging,
    cancel
  } = useClickAndDrag(parent);
  const [
    pendingCreation,
    setPendingCreation
  ] = useState<RecurringTimeRange | null>(null);
  const [
    scheduleState,
    {
      set: setSchedule,
      undo: undoSchedule,
      redo: redoSchedule,
      canUndo: canUndoSchedule,
      canRedo: canRedoSchedule
    }
  ] = useUndo<CalendarEvent>(schedule);

  const { totalHeight, totalWidth } = useMemo(() => {
    let totalHeight: number | null = null;
    let totalWidth: number | null = null;
    if (parent.current !== null) {
      ({ scrollHeight: totalHeight, scrollWidth: totalWidth } = parent.current);
    }

    return { totalHeight, totalWidth };
  }, [parent.current, size]);

  const grid = useMemo<Grid | null>(() => {
    if (totalHeight === null || totalWidth === null) {
      return null;
    }

    return createGridForContainer({
      totalHeight,
      totalWidth,
      numHorizontalCells,
      numVerticalCells
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
  }, [box, grid, setPendingCreation]);

  useEffect(() => {
    if (hasFinishedDragging) {
      setSchedule(mergeEvents(scheduleState.present, pendingCreation));
      setPendingCreation(null);
    }
  }, [
    hasFinishedDragging,
    setSchedule,
    setPendingCreation,
    pendingCreation,
    scheduleState.present
  ]);

  useMousetrap(
    'ctrl+z',
    () => {
      if (!canUndoSchedule) {
        return;
      }

      undoSchedule();
    },
    document
  );

  useMousetrap(
    'ctrl+shift+z',
    () => {
      if (!canRedoSchedule) {
        return;
      }

      redoSchedule();
    },
    document
  );

  useMousetrap(
    'esc',
    () => {
      if (pendingCreation) {
        cancel();
      }
    },
    document
  );

  useEffect(() => {
    cancel();
  }, [size]);

  const handleEventChange = useCallback<OnChangeCallback>(
    (newDateRange, rangeIndex) => {
      if (!scheduleState.present && newDateRange) {
        return [newDateRange];
      }

      const newSchedule = [...scheduleState.present];

      if (!newDateRange) {
        newSchedule.splice(rangeIndex, 1);
      } else {
        newSchedule[rangeIndex] = newDateRange;
      }

      setSchedule(mergeRanges(newSchedule));
    },
    [scheduleState.present]
  );

  const getDateRangeForVisualGrid = useMemo(
    () =>
      createMapCellInfoToContiguousDateRange({
        originDate,
        fromX: toDay,
        fromY: y => y * visualGridVerticalPrecision
      }),
    [visualGridVerticalPrecision, toDay, originDate]
  );

  useEffect(() => {
    if (!root.current || !root.current.contains(document.activeElement)) {
      return;
    }

    document.activeElement &&
      scrollIntoView(document.activeElement, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest'
      });
  }, [root.current, document.activeElement, scheduleState.present]);

  return (
    <div
      ref={root}
      className={classcat([
        classes['root'],
        { [classes['no-scroll']]: isDragging }
      ])}
    >
      <div style={timelineStickyStyle} className={classes['timeline']}>
        <div className={classes['header']}>
          <div className={classes['day-column']}>
            <div className={classcat([classes['cell'], classes.title])}>T</div>
          </div>
        </div>
        <div className={classes['calendar']}>
          <div className={classes['day-column']}>
            <div className={classes['day-hours']}>
              {times(48).map(timeIndex => {
                let startText = '';
                if (timeIndex % 2 === 0) {
                  const [[start]] = getDateRangeForVisualGrid({
                    startX: 0,
                    startY: timeIndex,
                    endX: 0,
                    endY: timeIndex + 1,
                    spanX: 1,
                    spanY: 1
                  });
                  startText = format(start, 'h a');
                }

                return (
                  <div key={timeIndex} className={classes['cell']}>
                    <div className={classes['time']}>{startText}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div
          style={headerStickyStyle}
          className={classcat([classes['calendar'], classes.header])}
        >
          {times(7).map(i => (
            <div key={i} className={classes['day-column']}>
              <div className={classcat([classes['cell'], classes.title])}>
                {format(addDays(originDate, i), 'ddd')}
              </div>
            </div>
          ))}
        </div>
        <div className={classes['layer-container']}>
          {isDragging && (
            <div className={classes['drag-box']} style={style}>
              {hasFinishedDragging && <div className={classes['popup']} />}
            </div>
          )}
          {grid && pendingCreation && isDragging && (
            <Schedule
              classes={classes}
              dateRangeToCells={dateRangeToCells}
              cellInfoToDateRange={cellInfoToSingleDateRange}
              className={classes['is-pending-creation']}
              ranges={mergeEvents(scheduleState.present, pendingCreation)}
              grid={grid}
            />
          )}
          {grid && !pendingCreation && (
            <Schedule
              classes={classes}
              dateRangeToCells={dateRangeToCells}
              cellInfoToDateRange={cellInfoToSingleDateRange}
              isResizable
              isMovable
              isDeletable
              onChange={handleEventChange}
              ranges={scheduleState.present}
              grid={grid}
            />
          )}

          <div ref={parent} className={classes['calendar']}>
            {times(7).map(dayIndex => {
              return (
                <div key={dayIndex} className={classes['day-column']}>
                  <div className={classes['day-hours']}>
                    {times(48).map(timeIndex => {
                      return (
                        <div key={timeIndex} className={classes['cell']}>
                          <div className={classes['debug']}>
                            ({dayIndex}, {timeIndex})
                          </div>
                        </div>
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

const rootElement = document.getElementById('root');
ReactDOM.render(
  <TimeGridScheduler
    originDate={startOfWeek(new Date('2019-03-04'), { weekStartsOn: 1 })}
    schedule={defaultSchedule}
    verticalPrecision={15}
  />,
  rootElement
);
