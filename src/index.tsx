import React, {
  useRef,
  useState,
  useLayoutEffect,
  useMemo,
  useCallback,
  useEffect
} from 'react';
import ReactDOM from 'react-dom';
import { times, reject } from 'lodash';
import {
  format,
  startOfWeek,
  addDays,
  isAfter,
  isBefore,
  isEqual
} from 'date-fns';
import useComponentSize from '@rehooks/component-size';
// @ts-ignore
import useKey from 'use-key-hook';
import cc from 'classcat';

import { useClickAndDrag } from './useClickAndDrag';

import {
  RecurringTimeRange,
  createMapCellInfoToRecurringTimeRange
} from './createMapCellInfoToRecurringTimeRange';
import { createMapDateRangeToCells } from './createMapDateRangeToCells';
import { createGridForContainer } from './utils/createGridFromContainer';
import { getTextForDateRange } from './utils/getTextForDateRange';

import './styles.scss';
import { Grid, Event as CalendarEvent, CellInfo, DateRange } from './types';
import { createMapCellInfoToContiguousDateRange } from './createMapCellInfoToContiguousDateRange';
import {
  mergeEvents,
  rejectOverlappingRanges,
  mergeRanges
} from './utils/mergeEvents';

const originDate = startOfWeek(new Date(), { weekStartsOn: 1 });

const MINS_IN_DAY = 24 * 60;
const verticalPrecision = 1 / 15;
const horizontalPrecision = 1;
const numVerticalCells = MINS_IN_DAY * verticalPrecision;
const numHorizontalCells = 7 * horizontalPrecision;
const toMin = (y: number) => y / verticalPrecision;
const fromY = toMin;
const toDay = (x: number) => x / horizontalPrecision;
const fromX = toDay;
const toX = (days: number) => days * horizontalPrecision;
const toY = (mins: number) => mins * verticalPrecision;

const springConfig = {
  mass: 0.5,
  tension: 200,
  friction: 10,
  clamp: false,
  precision: 0.01,
  velocity: 0
};

const isSameOrAfter = (date1: Date, date2: Date) =>
  isEqual(date1, date2) || isAfter(date1, date2);
const isSameOrBefore = (date1: Date, date2: Date) =>
  isEqual(date1, date2) || isBefore(date1, date2);

const cellInfoToDateRanges = createMapCellInfoToRecurringTimeRange({
  originDate,
  toMin,
  toDay
});

const dateRangeToCells = createMapDateRangeToCells({
  originDate,
  numVerticalCells,
  numHorizontalCells,
  toX,
  toY
});

import Draggable, { DraggableEventHandler } from 'react-draggable';

type OnMoveCallback = (
  newDateRange: DateRange | undefined,
  rangeIndex: number
) => void;

function RangeBox({
  grid,
  isBeingEdited,
  rangeIndex,
  cellIndex,
  cellArray,
  cell,
  dateRange,
  className,
  onMove
}: {
  grid: Grid;
  cell: CellInfo;
  cellIndex: number;
  cellArray: CellInfo[];
  dateRange: DateRange;
  className?: string;
  onMove?: OnMoveCallback;
  rangeIndex: number;
  isBeingEdited?(cell: CellInfo): boolean;
}) {
  const [modifiedDateRange, setModifiedDateRange] = useState(dateRange);
  const ref = useRef(null);

  // Copy prop to state, like getDerivedStateFromProps
  useEffect(() => {
    setModifiedDateRange(dateRange);
  }, [dateRange]);

  useKey(
    () => {
      if (ref.current === document.activeElement) {
        onMove && onMove(undefined, rangeIndex);
      }
    },
    {
      detectKeys: [46]
    }
  );

  const rect = useMemo(() => grid.getRectFromCell(cell), [cell]);

  const { top, left, width, height } = rect;

  const style = { width, height, position: 'absolute' };

  const isStart = cellIndex === 0;
  const isEnd = cellIndex === cellArray.length - 1;

  const handleDrag: DraggableEventHandler = (_event, { y }) => {
    const _start = y;
    const _end = _start + height;
    const top = Math.min(_start, _end);
    const bottom = top + height;

    const newRect = {
      ...rect,
      top,
      bottom
    };
    const newCell = grid.getCellFromRect(newRect);
    return setModifiedDateRange(cellInfoToDateRanges(newCell)[0]);
  };

  const handleDragStop: DraggableEventHandler = () => {
    onMove && onMove(modifiedDateRange, rangeIndex);
  };

  return (
    <Draggable
      axis="y"
      bounds={{
        top: 0,
        bottom: grid.totalHeight - height,
        left: 0,
        right: grid.totalWidth
      }}
      position={{ x: left, y: top }}
      onDrag={handleDrag}
      onStop={handleDragStop}
    >
      <button
        ref={ref}
        className={cc([
          'event',
          'range-box',
          className,
          {
            'is-draggable': true,
            'is-pending-edit': isBeingEdited && isBeingEdited(cell)
          }
        ])}
        style={style as any}
      >
        <span className="start">
          {isStart && format(modifiedDateRange[0], 'h:mma')}
        </span>
        <span className="end">
          {isEnd && format(modifiedDateRange[1], 'h:mma')}
        </span>
      </button>
    </Draggable>
  );
}

function Event({
  event,
  grid,
  className,
  onMove,
  isResizable,
  isDeletable,
  isBeingEdited
}: {
  event: CalendarEvent;
  grid: Grid;
  className?: string;
  isResizable?: boolean;
  isDeletable?: boolean;
  isBeingEdited?: (cell: CellInfo) => boolean;
  onMove?: OnMoveCallback;
}) {
  return (
    <div className="range-boxes">
      {event.map((dateRange, rangeIndex) => {
        return dateRangeToCells(dateRange).map((cell, cellIndex, array) => {
          return (
            <RangeBox
              cellArray={array}
              cellIndex={cellIndex}
              dateRange={dateRange}
              rangeIndex={rangeIndex}
              className={className}
              isBeingEdited={isBeingEdited}
              onMove={onMove}
              grid={grid}
              cell={cell}
            />
          );
        });
      })}
    </div>
  );
}

function App() {
  const parent = useRef<HTMLDivElement | null>(null);
  const size = useComponentSize(parent);
  const [schedule, setSchedule] = useState<CalendarEvent>(
    [
      // ['2019-03-03T22:45:00.000Z', '2019-03-04T01:15:00.000Z'],
      ['2019-03-04T22:15:00.000Z', '2019-03-05T01:00:00.000Z'],
      ['2019-03-05T22:00:00.000Z', '2019-03-06T01:00:00.000Z'],
      ['2019-03-06T22:00:00.000Z', '2019-03-07T01:00:00.000Z'],
      ['2019-03-07T05:30:00.000Z', '2019-03-07T10:00:00.000Z'],
      // ['2019-03-08T22:00:00.000Z', '2019-03-09T01:00:00.000Z'],
      ['2019-03-09T22:00:00.000Z', '2019-03-10T01:00:00.000Z']
    ].map(
      range => range.map(dateString => new Date(dateString)) as [Date, Date]
    )
  );
  const { style, box, isDragging, hasFinishedDragging } = useClickAndDrag(
    parent
  );
  const [dragBoxText, setDragBoxText] = useState('');
  const [
    pendingCreation,
    setPendingCreation
  ] = useState<RecurringTimeRange | null>(null);

  const grid = useMemo<Grid | null>(() => {
    if (!parent.current) {
      return null;
    }

    return createGridForContainer({
      container: parent.current,
      numHorizontalCells,
      numVerticalCells
    });
  }, [parent.current, size]);

  useEffect(() => {
    if (grid === null || box === null) {
      return;
    }

    const constrainedBox = box;
    const cell = grid.getCellFromRect(constrainedBox);
    const dateRanges = cellInfoToDateRanges(cell);
    const event = dateRanges;
    console.log(...event.map(d => getTextForDateRange(d)));
    setPendingCreation(event);
  }, [box]);

  useEffect(() => {
    if (hasFinishedDragging) {
      console.log('finished');
      setSchedule(schedule => mergeEvents(schedule, pendingCreation));
      setPendingCreation(null);
    }
  }, [hasFinishedDragging]);

  const handleEventMove = useCallback<OnMoveCallback>(
    (newDateRange, rangeIndex) => {
      setSchedule(schedule => {
        if (!schedule && newDateRange) {
          return [newDateRange];
        }

        const newSchedule = [...schedule];

        if (!newDateRange) {
          newSchedule.splice(rangeIndex, 1);
        } else {
          newSchedule[rangeIndex] = newDateRange;
        }

        return mergeRanges(newSchedule);
      });
    },
    []
  );

  return (
    <div className="root">
      <div className="calendar header">
        {times(7).map(i => (
          <div className="day-column">
            <div className="cell title">
              {format(addDays(originDate, i), 'ddd')}
            </div>
          </div>
        ))}
      </div>
      <div className="layer-container">
        {grid && !pendingCreation && (
          <Event
            isResizable
            isDeletable
            onMove={handleEventMove}
            event={schedule}
            grid={grid}
          />
        )}

        {isDragging && (
          <div className="drag-box" style={style}>
            {dragBoxText}
            {hasFinishedDragging && <div className="popup" />}
          </div>
        )}
        {hasFinishedDragging && <div className="popup">Popup</div>}
        {grid && pendingCreation && isDragging && (
          <Event
            className="is-pending-creation"
            event={mergeEvents(schedule, pendingCreation)}
            grid={grid}
          />
        )}
        <div ref={parent} className="calendar">
          {times(7).map(x => {
            const cellInfo = createMapCellInfoToContiguousDateRange({
              originDate,
              toDay: toDay,
              toMin: y => y * 60
            });

            return (
              <div className="day-column">
                <div className="day-hours">
                  {times(24).map(y => {
                    const startY = y;
                    const range = cellInfo({
                      startX: x,
                      startY,
                      endX: x,
                      endY: startY + 1,
                      spanX: 1,
                      spanY: 1
                    });

                    const d = range.map(d => getTextForDateRange(d, 'h', 'ha'));

                    return (
                      <div className="cell">
                        <div className="debug">{d.join(', ')}</div>
                        <div className="debug">
                          ({x}, {y})
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
  );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
