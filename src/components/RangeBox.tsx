import classcat from 'classcat';
import { format } from 'date-fns';
import invariant from 'invariant';
import Resizable, { ResizeCallback } from 're-resizable';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import useMousetrap from '../hooks/useMousetrap';
import { CellInfo, DateRange, Grid, OnChangeCallback } from '../types';

export function RangeBox({
  classes,
  grid,
  isBeingEdited,
  rangeIndex,
  cellIndex,
  cellArray,
  cell,
  className,
  onChange,
  cellInfoToDateRange,
  isResizable,
  isDeletable,
  isMovable
}: {
  classes: Record<string, string>;
  grid: Grid;
  cell: CellInfo;
  cellIndex: number;
  cellArray: CellInfo[];
  className?: string;
  onChange?: OnChangeCallback;
  isResizable?: boolean;
  isDeletable?: boolean;
  isMovable?: boolean;
  rangeIndex: number;
  isBeingEdited?(cell: CellInfo): boolean;
  cellInfoToDateRange(cell: CellInfo): DateRange;
}) {
  const ref = useRef(null);
  const [modifiedCell, setModifiedCell] = useState(cell);
  const originalRect = useMemo(() => grid.getRectFromCell(cell), [cell, grid]);
  const rect = useMemo(() => grid.getRectFromCell(modifiedCell), [
    modifiedCell,
    grid
  ]);

  useEffect(() => {
    setModifiedCell(cell);
  }, [cell]);

  const modifiedDateRange = useMemo(() => cellInfoToDateRange(modifiedCell), [
    modifiedCell
  ]);

  const handleDelete = useCallback(() => {
    if (!isDeletable) {
      return;
    }

    onChange && onChange(undefined, rangeIndex);
  }, [ref.current, onChange, isDeletable, rangeIndex]);

  useMousetrap('del', handleDelete, ref.current);

  const { top, left, width, height } = rect;

  const style = { width, height };

  const isStart = cellIndex === 0;
  const isEnd = cellIndex === cellArray.length - 1;

  const handleStop = useCallback(() => {
    onChange && onChange(cellInfoToDateRange(modifiedCell), rangeIndex);
  }, [modifiedCell, rangeIndex, cellInfoToDateRange, onChange]);

  useMousetrap(
    'up',
    () => {
      if (!isMovable) {
        return;
      }

      if (modifiedCell.startY === 0) {
        return;
      }

      const newCell = {
        ...modifiedCell,
        startY: modifiedCell.startY - 1,
        endY: modifiedCell.endY - 1
      };

      onChange && onChange(cellInfoToDateRange(newCell), rangeIndex);
    },
    ref.current
  );

  useMousetrap(
    'down',
    () => {
      if (!isMovable) {
        return;
      }

      if (modifiedCell.endY === grid.numVerticalCells - 1) {
        return;
      }

      const newCell = {
        ...modifiedCell,
        startY: modifiedCell.startY + 1,
        endY: modifiedCell.endY + 1
      };

      onChange && onChange(cellInfoToDateRange(newCell), rangeIndex);
    },
    ref.current
  );

  const handleDrag: DraggableEventHandler = useCallback(
    (event, { y }) => {
      if (!isMovable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

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

      const { startY, endY } = grid.getCellFromRect(newRect);

      const newCell = {
        ...cell,
        startY,
        endY
      };

      invariant(
        newCell.spanY === cell.spanY,
        `Expected the dragged time cell to have the same height (${
          newCell.spanY
        }, ${cell.spanY})`
      );
      setModifiedCell(newCell);
    },
    [grid, rect, isMovable, setModifiedCell]
  );

  const handleResize: ResizeCallback = useCallback(
    (event, direction, _ref, delta) => {
      if (!isResizable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

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

      const { spanY, startY, endY } = grid.getCellFromRect(newRect);
      const newCell = {
        ...cell,
        spanY,
        startY,
        endY
      };

      setModifiedCell(newCell);
    },
    [grid, rect, isResizable, setModifiedCell, originalRect]
  );

  return (
    <Draggable
      axis={isMovable ? 'y' : 'none'}
      bounds={{
        top: 0,
        bottom: grid.totalHeight - height,
        left: 0,
        right: grid.totalWidth
      }}
      position={{ x: left, y: top }}
      onDrag={handleDrag}
      onStop={handleStop}
      cancel={`.${classes.handle}`}
    >
      <button
        className={classcat([
          classes['event'],
          classes['button-reset'],
          classes['range-box'],
          className,
          {
            [classes['is-draggable']]: isMovable,
            [classes['is-being-edited']]: isBeingEdited && isBeingEdited(cell)
          }
        ])}
        ref={ref}
        tabIndex={0}
        style={style}
      >
        <Resizable
          size={originalRect}
          onResize={handleResize}
          onResizeStop={handleStop}
          handleWrapperClass={classes['handle-wrapper']}
          enable={
            isResizable
              ? {
                  top: true,
                  bottom: true
                }
              : {}
          }
          handleClasses={{
            bottom: classcat([classes['handle'], classes.bottom]),
            bottomLeft: classcat([classes['handle'], classes['bottom-left']]),
            bottomRight: classcat([classes['handle'], classes['bottom-right']]),
            left: classcat([classes['handle'], classes.left]),
            right: classcat([classes['handle'], classes.right]),
            top: classcat([classes['handle'], classes.top]),
            topLeft: classcat([classes['handle'], classes['top-left']]),
            topRight: classcat([classes['handle'], classes['top-right']])
          }}
        >
          <div className={classes['event-content']} style={style}>
            <span className={classes['start']}>
              {isStart && format(modifiedDateRange[0], 'h:mma')}
            </span>
            <span className={classes['end']}>
              {isEnd && format(modifiedDateRange[1], 'h:mma')}
            </span>
          </div>
        </Resizable>
      </button>
    </Draggable>
  );
}
