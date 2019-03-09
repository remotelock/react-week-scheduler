import React, {
  useRef,
  useState,
  useMemo,
  useCallback,
  useEffect
} from 'react';
import ReactDOM from 'react-dom';
import { times, reject } from 'lodash';
import { format, startOfWeek, addDays } from 'date-fns';
import useComponentSize from '@rehooks/component-size';
import useUndo from 'use-undo';
import useMousetrap from './useMousetrap';
import cc from 'classcat';
// @ts-ignore
import 'resize-observer-polyfill/dist/ResizeObserver.global';

import { useClickAndDrag } from './useClickAndDrag';

import {
  RecurringTimeRange,
  createMapCellInfoToRecurringTimeRange
} from './createMapCellInfoToRecurringTimeRange';
import { createMapDateRangeToCells } from './createMapDateRangeToCells';
import { createGridForContainer } from './utils/createGridFromContainer';
import { getTextForDateRange } from './utils/getTextForDateRange';
import Resizable, { ResizeCallback } from 're-resizable';
// import 'react-resizable/css/styles.css';

import Draggable, { DraggableEventHandler } from 'react-draggable';

import './styles.scss';
import { Grid, Event as CalendarEvent, CellInfo, DateRange } from './types';
import { createMapCellInfoToContiguousDateRange } from './createMapCellInfoToContiguousDateRange';
import { mergeEvents, mergeRanges } from './utils/mergeEvents';
import invariant from 'invariant';

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

const cellInfoToDateRanges = createMapCellInfoToRecurringTimeRange({
  originDate,
  fromY: toMin,
  fromX: toDay
});

const dateRangeToCells = createMapDateRangeToCells({
  originDate,
  numVerticalCells,
  numHorizontalCells,
  toX,
  toY
});

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
  className,
  onMove
}: {
  grid: Grid;
  cell: CellInfo;
  cellIndex: number;
  cellArray: CellInfo[];
  className?: string;
  onMove?: OnMoveCallback;
  rangeIndex: number;
  isBeingEdited?(cell: CellInfo): boolean;
}) {
  const [modifiedCell, setModifiedCell] = useState(cell);
  const originalRect = useMemo(() => grid.getRectFromCell(cell), [cell, grid]);
  const rect = useMemo(() => grid.getRectFromCell(modifiedCell), [
    modifiedCell,
    grid
  ]);

  const ref = useRef(null);

  useEffect(() => {
    setModifiedCell(cell);
  }, [cell]);

  const modifiedDateRange = useMemo(
    () => cellInfoToDateRanges(modifiedCell)[0],
    [modifiedCell]
  );

  const handleDelete = useCallback(() => {
    onMove && onMove(undefined, rangeIndex);
  }, [ref.current, onMove, rangeIndex]);

  useMousetrap('del', handleDelete, ref.current);

  const { top, left, width, height } = rect;

  const style = { width, height };

  const isStart = cellIndex === 0;
  const isEnd = cellIndex === cellArray.length - 1;

  const handleStop = useCallback(() => {
    onMove && onMove(cellInfoToDateRanges(modifiedCell)[0], rangeIndex);
  }, [modifiedCell, rangeIndex, onMove]);

  useMousetrap(
    'up',
    () => {
      if (modifiedCell.startY === 0) {
        return;
      }

      const newCell = {
        ...modifiedCell,
        startY: modifiedCell.startY - 1,
        endY: modifiedCell.endY - 1
      };

      onMove && onMove(cellInfoToDateRanges(newCell)[0], rangeIndex);
    },
    ref.current
  );

  useMousetrap(
    'down',
    () => {
      if (modifiedCell.endY === grid.numVerticalCells - 1) {
        return;
      }

      const newCell = {
        ...modifiedCell,
        startY: modifiedCell.startY + 1,
        endY: modifiedCell.endY + 1
      };

      onMove && onMove(cellInfoToDateRanges(newCell)[0], rangeIndex);
    },
    ref.current
  );

  const handleDrag: DraggableEventHandler = useCallback(
    (_event, { y }) => {
      const _start = y;
      const _end = _start + rect.height;
      const newTop = Math.min(_start, _end);
      const newBottom = newTop + rect.height;

      if (newTop === top) {
        return;
      }

      const newRect = {
        ...rect,
        top: newTop,
        bottom: newBottom
      };

      const newCell = grid.getCellFromRect(newRect);
      newCell.spanY = cell.spanY;
      invariant(
        newCell.spanY === cell.spanY,
        `Expected the dragged time cell to have the same height (${
          newCell.spanY
        }, ${cell.spanY})`
      );
      setModifiedCell(newCell);
    },
    [grid, rect]
  );

  const handleResize: ResizeCallback = useCallback(
    (event, direction, ref, delta) => {
      if (delta.height === 0) {
        return;
      }

      const newSize = {
        height: delta.height + rect.height,
        width: delta.width + rect.width
      };

      const newRect = {
        ...originalRect,
        ...newSize
      };

      if (direction.includes('top')) {
        newRect.top -= delta.height;
      } else if (direction.includes('bottom')) {
        newRect.bottom += delta.height;
      }

      const newCell = grid.getCellFromRect(newRect);

      setModifiedCell(newCell);
    },
    [grid, rect, originalRect]
  );

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
      onStop={handleStop}
      cancel=".handle"
    >
      <div className="button-reset" ref={ref} tabIndex={0} style={style}>
        <Resizable
          size={originalRect}
          onResize={handleResize}
          onResizeStop={handleStop}
          handleWrapperClass="handle-wrapper"
          enable={{
            top: true,
            bottom: true
          }}
          handleClasses={{
            bottom: 'handle bottom',
            bottomLeft: 'handle bottom-left',
            bottomRight: 'handle bottom-right',
            left: 'handle left',
            right: 'handle right',
            top: 'handle top',
            topLeft: 'handle top-left',
            topRight: 'handle top-right'
          }}
        >
          <button
            style={style}
            className={cc([
              'event',
              'range-box',
              className,
              {
                'is-draggable': true,
                'is-pending-edit': isBeingEdited && isBeingEdited(cell)
              }
            ])}
          >
            <span className="start">
              {isStart && format(modifiedDateRange[0], 'h:mma')}
            </span>
            <span className="end">
              {isEnd && format(modifiedDateRange[1], 'h:mma')}
            </span>
          </button>
        </Resizable>
      </div>
    </Draggable>
  );
}

function CalendarEventComponent({
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

const defaultSchedule: [string, string][] = [
  // ['2019-03-03T22:45:00.000Z', '2019-03-04T01:15:00.000Z'],
  ['2019-03-05T22:00:00.000Z', '2019-03-06T01:00:00.000Z'],
  ['2019-03-04T22:15:00.000Z', '2019-03-05T01:00:00.000Z'],
  ['2019-03-07T05:30:00.000Z', '2019-03-07T10:00:00.000Z'],
  // ['2019-03-08T22:00:00.000Z', '2019-03-09T01:00:00.000Z'],
  ['2019-03-09T22:00:00.000Z', '2019-03-10T01:00:00.000Z'],
  ['2019-03-06T22:00:00.000Z', '2019-03-07T01:00:00.000Z']
];

function App() {
  const root = useRef<HTMLDivElement | null>(null);
  const parent = useRef<HTMLDivElement | null>(null);

  const size = useComponentSize(parent);
  const { style, box, isDragging, hasFinishedDragging } = useClickAndDrag(
    parent
  );
  const [
    pendingCreation,
    setPendingCreation
  ] = useState<RecurringTimeRange | null>(null);
  const [
    scheduleState,
    {
      set: setSchedule,
      reset: resetSchedule,
      undo: undoSchedule,
      redo: redoSchedule,
      canUndo: canUndoSchedule,
      canRedo: canRedoSchedule
    }
  ] = useUndo<CalendarEvent>(
    defaultSchedule.map(
      range => range.map(dateString => new Date(dateString)) as [Date, Date]
    )
  );

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
      setSchedule(mergeEvents(scheduleState.present, pendingCreation));
      setPendingCreation(null);
    }
  }, [hasFinishedDragging]);

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

  const handleEventMove = useCallback<OnMoveCallback>(
    (newDateRange, rangeIndex) => {
      if (!scheduleState.present && newDateRange) {
        return [newDateRange];
      }

      const newSchedule = [...scheduleState.present];

      if (!newDateRange) {
        console.log(rangeIndex, 'will be deleted from', newSchedule);
        newSchedule.splice(rangeIndex, 1);
      } else {
        newSchedule[rangeIndex] = newDateRange;
      }

      setSchedule(mergeRanges(newSchedule));
    },
    [scheduleState.present]
  );

  return (
    <div ref={root} className="root">
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
        {isDragging && (
          <div className="drag-box" style={style}>
            {hasFinishedDragging && <div className="popup" />}
          </div>
        )}
        {grid && pendingCreation && isDragging && (
          <CalendarEventComponent
            className="is-pending-creation"
            event={mergeEvents(scheduleState.present, pendingCreation)}
            grid={grid}
          />
        )}
        {grid && !pendingCreation && (
          <CalendarEventComponent
            isResizable
            isDeletable
            onMove={handleEventMove}
            event={scheduleState.present}
            grid={grid}
          />
        )}
        <div ref={parent} className="calendar">
          {times(7).map(x => {
            const cellInfo = createMapCellInfoToContiguousDateRange({
              originDate,
              fromX: toDay,
              fromY: y => y * 60
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
