import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useMemo
} from "react";
import ReactDOM from "react-dom";
import { times, isEqual, floor, ceil } from "lodash";
import {
  format,
  startOfWeek,
  addDays,
  addMinutes,
  getDay,
  getTime
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

import "./styles.scss";
import { useClickAndDrag } from "./useClickAndDrag";

const getSpan = (x1, x2) => 1 + x2 - x1;

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
  return {
    getCellFromRect(data: ClientRect): CellInfo {
      const { top, left, right, bottom, ...rest } = data;
      const { scrollWidth: width, scrollHeight: height } = container;
      const cellHeight = height / numVerticalCells;
      const cellWidth = width / numHorizontalCells;
      const startX = floor(left / cellWidth);
      const startY = floor(top / cellHeight);
      const endX = floor(right / cellWidth);
      const endY = floor(bottom / cellHeight);
      const spanX = getSpan(startX, endX);
      const spanY = getSpan(startY, endY);

      return {
        spanX,
        spanY,
        startX,
        startY,
        endX,
        endY
      };
    }
  };
};

type Grid = ReturnType<typeof createGridForContainer>;
type DateRange = [Date, Date];

const createMapCellInfoToDate = ({
  toMin = y => y * 30,
  toDay = x => x
} = {}) => ({ startX, startY, endX, spanX, spanY }: CellInfo): DateRange => {
  const startDay = startX;
  const endDay = endX;

  const startDate = addMinutes(
    addDays(
      startOfWeek(new Date(), {
        weekStartsOn: 1
      }),
      startDay
    ),
    toMin(startY)
  );
  const endDate = addDays(addMinutes(startDate, toMin(spanY)), spanX - 1);

  return [startDate, endDate];
};

function Event({ style }) {
  return (
    <div className="event" style={style}>
      Event
    </div>
  );
}

const getTextForDateRange = ([start, end]: DateRange) => {
  const startDateStr = format(start, "ddd h:mma");
  const endDateStr = format(end, "ddd h:mma");

  return `${startDateStr} - ${endDateStr}`;
};

const cellInfoToDate = createMapCellInfoToDate();

function App() {
  const parent = useRef<HTMLElement | null>(null);
  const [{ style, box, isDragging, hasFinishedDragging }] = useClickAndDrag(
    parent
  );
  const [text, setText] = useState("");

  const grid = useMemo<Grid | null>(
    () => {
      if (!parent.current) {
        return null;
      }

      return createGridForContainer({
        container: parent.current,
        numHorizontalCells: 7,
        numVerticalCells: 24
      });
    },
    [parent.current]
  );

  useLayoutEffect(
    () => {
      if (!grid) {
        return;
      }

      const cell = grid.getCellFromRect(box);
      const dateRange = cellInfoToDate(cell);

      setText(getTextForDateRange(dateRange));
    },
    [box]
  );

  const event = {};

  return (
    <div className="root">
      <div className="calendar header">
        {times(7).map(i => (
          <div className="day-column">
            <div className="cell title">
              {format(
                addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i),
                "ddd"
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="layer-container">
        <Event />
        <div ref={parent} className="calendar">
          {(isDragging || hasFinishedDragging) && (
            <div className="drag-box" style={style}>
              {text}
              {hasFinishedDragging && <div className="popup">Popup</div>}
            </div>
          )}
          {/* <Event {...event} /> */}
          {times(7).map(x => {
            const cellInfo = createMapCellInfoToDate({ toMin: y => y * 60 });

            return (
              <div className="day-column">
                <div className="day-hours">
                  {times(24).map(y => {
                    const [start] = cellInfo({
                      startX: x,
                      startY: y,
                      endX: x,
                      endY: y,
                      spanX: 1,
                      spanY: 1
                    });

                    return (
                      <div className="cell">{format(start, "ddd h:mma")}</div>
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
