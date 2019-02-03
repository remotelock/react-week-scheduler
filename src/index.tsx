import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo
} from "react";
import ReactDOM from "react-dom";
import {
  times,
  clamp,
  range,
  isEqual,
  round,
  floor,
  ceil,
  flatten
} from "lodash";
import {
  format,
  startOfWeek,
  addDays,
  addMinutes,
  addSeconds,
  differenceInMilliseconds,
  getDay,
  getTime,
  isSameDay,
  startOfDay,
  endOfDay,
  setDay,
  getMinutes,
  differenceInDays,
  differenceInMinutes,
  isBefore,
  isEqual as isEqualDate
} from "date-fns";
import { fromEvent, merge } from "rxjs";
import {
  tap,
  map,
  skipUntil,
  takeUntil,
  combineLatest,
  withLatestFrom,
  mergeMap,
  distinctUntilChanged
} from "rxjs/operators";
import { usePrevious } from "./utils/usePrevious";
import { useSpring } from "react-spring/hooks";
import { Spring, animated } from "react-spring";

import "./styles.scss";
import { useClickAndDrag, Rect } from "./useClickAndDrag";

const getSpan = (x1, x2) => 1 + Math.abs(x2 - x1);

type Coords = { x: number; y: number };

type CellInfo = {
  spanX: number;
  spanY: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

const createGridForContainer = ({
  container,
  numVerticalCells,
  numHorizontalCells
}) => {
  return new class Grid {
    get cellHeight() {
      return container.scrollHeight / numVerticalCells;
    }

    get cellWidth() {
      return container.scrollWidth / numHorizontalCells;
    }

    getRectFromCell(data: CellInfo): Rect {
      const { endX, startX, endY, startY, spanX, spanY } = data;
      const bottom = endY * this.cellHeight;
      const top = startY * this.cellHeight;
      const left = startX * this.cellWidth;
      const right = endX * this.cellWidth;
      const height = spanY * this.cellHeight;
      const width = spanX * this.cellWidth;

      return {
        bottom,
        top,
        left,
        right,
        height,
        width,

        // @TODO: check the math
        startX: startX * this.cellWidth,
        endX: endX * this.cellWidth,
        startY: startY * this.cellHeight,
        endY: endY * this.cellHeight
      };
    }

    getCellFromRect(data: Rect): CellInfo {
      const startX = clamp(
        floor(data.left / this.cellWidth),
        0,
        numHorizontalCells - 1
      );
      const startY = clamp(
        round(data.top / this.cellHeight),
        0,
        numVerticalCells - 1
      );
      const endX = clamp(
        floor(data.right / this.cellWidth),
        0,
        numHorizontalCells - 1
      );
      const endY = clamp(
        round(data.bottom / this.cellHeight),
        0,
        numVerticalCells - 1
      );
      const spanX = clamp(getSpan(startX, endX), 1, numHorizontalCells);
      const spanY = clamp(getSpan(startY, endY), 1, numVerticalCells);

      return {
        spanX,
        spanY,
        startX,
        startY,
        endX,
        endY
      };
    }

    constrainBoxToOneColumn(box: Rect) {
      return this.getRectFromCell(
        this.getCellFromRect({
          ...box,
          endX: box.startX,
          left: box.startX,
          right: box.startX,
          width: 0
        })
      );
    }
  }();
};

type Grid = ReturnType<typeof createGridForContainer>;

type RecurringTimeRange = DateRange[];

const cellToDate = ({ startX, startY, toMin, toDay, originDate }) =>
  addMinutes(addDays(originDate, startX), toMin(startY));

const createMapCellInfoToRecurringTimeRange: MapCellInfoToDateRange = ({
  toMin,
  toDay,
  originDate
}) => ({ startX, startY, endX, endY, spanX, spanY }) => {
  return range(startX, endX + 1)
    .map(i => {
      const startDate = cellToDate({
        startX: i,
        startY,
        toMin,
        toDay,
        originDate
      });

      const endDate = addMinutes(startDate, toMin(spanY));

      const range: DateRange = isBefore(startDate, endDate)
        ? [startDate, endDate]
        : [endDate, startDate];

      return range;
    })
    .sort((rangeA, rangeB) => (isBefore(rangeA[0], rangeB[0]) ? 0 : 1));
};

type DateRange = [Date, Date];

const createMapCellInfoToDateRange: MapCellInfoToDateRange = ({
  toMin,
  toDay,
  originDate
}) => ({ startX, startY, endX, endY, spanX, spanY }) => {
  const startDay = startX;
  const endDay = endX;
  const startDate = cellToDate({ startX, startY, toMin, toDay, originDate });
  const endDate = cellToDate({
    startX: endX,
    startY: endY,
    toMin,
    toDay,
    originDate
  });

  return [
    isBefore(startDate, endDate) ? [startDate, endDate] : [endDate, startDate]
  ];
};

const constraintToOneDay = ([start, end]: DateRange): DateRange => {
  console.log(start, end);
  if (isEqualDate(startOfDay(end), end)) {
    return [start, startOfDay(addDays(start, 1))];
  }
  return [start, setDay(end, getDay(start))];
};

const createMapCellInfoToSingleDateRange: MapCellInfoToDateRange = options => {
  const mapToRange = createMapCellInfoToDateRange(options);
  return (info: CellInfo): DateRange[] => {
    return [constraintToOneDay(mapToRange(info)[0])];
  };
};

const createMapDateRangeToCells = ({
  toX = x => x,
  toY,
  numVerticalCells,
  numHorizontalCells,
  originDate
}) => ([start, end]: DateRange): CellInfo[] => {
  const originOfThisDay = startOfDay(start);
  const _startX = toX(differenceInDays(start, originDate));
  const _startY = toY(differenceInMinutes(start, originOfThisDay));
  const _endX = toX(differenceInDays(end, originDate));
  const _endY = toY(differenceInMinutes(end, startOfDay(end))) - 1;

  const cells = range(_startX, _endX + 1).map(i => {
    const startX = i;
    const endX = i;
    const atStart = i === _startX;
    const atEnd = i === _endX;
    const atEdge = atStart || atEnd;
    const inside = !atEdge;
    const startY = !atStart ? 0 : _startY;
    const endY = !atEnd ? numVerticalCells - 1 : _endY;
    const spanX = getSpan(startX, endX);
    const spanY = getSpan(startY, endY);

    return {
      startX,
      startY,
      endX,
      endY,
      spanX,
      spanY
    };
  });

  if (isEqualDate(end, startOfDay(end))) {
    cells.pop();
  }

  return cells;
};

const originDate = startOfWeek(new Date(), { weekStartsOn: 1 });

function Event({ style }) {
  return (
    <div className="event" style={style}>
      Event
    </div>
  );
}

const getTextForDateRange = (
  dates: Date[],
  template?: string,
  template2?: string
) => {
  const start = dates[0];
  const end = dates[dates.length - 1];

  if (isSameDay(start, end) && !template) {
    return `${format(start, "ddd h:mma")} - ${format(end, "h:mma")}`;
  }

  const formatTemplate = "ddd h:mma";
  const startDateStr = format(start, template || formatTemplate);
  const endDateStr = format(end, template2 || formatTemplate);

  return `${startDateStr}-${endDateStr}`;
};

const MINS_IN_DAY = 24 * 60;
const verticalPrecision = 1 / 15;
const horiziontalPrecision = 1;
const numVerticalCells = MINS_IN_DAY * verticalPrecision;
const numHorizontalCells = 7 * horiziontalPrecision;
const toMin = y => y / verticalPrecision;
const fromY = toMin;
const toDay = x => x / horiziontalPrecision;
const fromX = toDay;
const toX = days => days * horiziontalPrecision;
const toY = mins => mins * verticalPrecision;

const springConfig = {
  mass: 0.5,
  tension: 200,
  friction: 10,
  clamp: false,
  precision: 0.01,
  velocity: 0
};

type MapCellInfoToDateRangeOptions = {
  toMin: (y) => number;
  toDay: (x) => number;
  originDate: Date;
};

type MapCellInfoToDateRange = (
  options: MapCellInfoToDateRangeOptions
) => (cellInfo: CellInfo) => DateRange[];

const cellInfoToDate = createMapCellInfoToRecurringTimeRange({
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

function App() {
  const parent = useRef<HTMLDivElement | null>(null);
  const [{ style, box, isDragging, hasFinishedDragging }] = useClickAndDrag(
    parent
  );
  const [dragBoxText, setDragBoxText] = useState("");
  const [
    pendingCreation,
    setPendingCreation
  ] = useState<RecurringTimeRange | null>(null);
  const [eventPendingCreationStyle, setEventPendingCreationStyle] = useState<
    React.CSSProperties
  >({});
  const prevStyle = usePrevious(eventPendingCreationStyle);

  const grid = useMemo<Grid | null>(
    () => {
      if (!parent.current) {
        return null;
      }

      return createGridForContainer({
        container: parent.current,
        numHorizontalCells,
        numVerticalCells
      });
    },
    [parent.current]
  );

  useLayoutEffect(
    () => {
      if (!grid) {
        return;
      }

      const constraintedBox = box; //grid.constrainBoxToOneColumn(box);
      const cell = grid.getCellFromRect(constraintedBox);
      const dateRanges = cellInfoToDate(cell);
      const event = dateRanges;
      console.log(event.map(d => getTextForDateRange(d)));
      setPendingCreation(event);
    },
    [box]
  );

  return (
    <div className="root">
      <div className="calendar header">
        {times(7).map(i => (
          <div className="day-column">
            <div className="cell title">
              {format(addDays(originDate, i), "ddd")}
            </div>
          </div>
        ))}
      </div>
      <div className="layer-container">
        {/* <Event /> */}
        <div ref={parent} className="calendar">
          {(isDragging || hasFinishedDragging) && (
            <div className="drag-box" style={style}>
              {dragBoxText}
              {hasFinishedDragging && <div className="popup">Popup</div>}
            </div>
          )}
          {hasFinishedDragging && <div className="popup">Popup</div>}
          <div className="range-boxes">
            {pendingCreation &&
              (isDragging || hasFinishedDragging) &&
              pendingCreation.map(dateRange => {
                return dateRangeToCells(dateRange).map((cell, i, array) => {
                  const { top, left, width, height } = grid.getRectFromCell(
                    cell
                  );
                  const style = { top, left, width, height };
                  return (
                    <Spring
                      key={cell.startX}
                      config={springConfig}
                      to={style}
                      native
                    >
                      {style => (
                        <animated.div
                          className="event range-box is-pending-creation"
                          style={style}
                        >
                          <span className="start">
                            {i === 0 && format(dateRange[0], "h:mma")}
                          </span>
                          <span className="end">
                            {i === array.length - 1 &&
                              format(dateRange[1], "h:mma")}
                          </span>
                        </animated.div>
                      )}
                    </Spring>
                  );
                });
              })}
          </div>
          {/* <Event {...event} /> */}
          {times(7).map(x => {
            const cellInfo = createMapCellInfoToDateRange({
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

                    const d = range.map(d => getTextForDateRange(d, "h", "ha"));

                    return (
                      <div className="cell">
                        <div className="debug">{d.join(", ")}</div>
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

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
