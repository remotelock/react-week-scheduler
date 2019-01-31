import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
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

const mapPageCoordinatesToContainer = container => {
  return event => {
    let { clientX, clientY, pageX, pageY } = event;

    if ("changedTouches" in event) {
      ({ clientX, clientY } = event.changedTouches[0]);
    }

    const { top, bottom, left, right } = container.getBoundingClientRect();
    return {
      clientX,
      clientY,
      pageX,
      pageY,
      x: clientX - left,
      y: clientY - top
    };
  };
};

const getSpan = (x1, x2) => 1 + x2 - x1;

const addCellInfo = ({ container, numVerticalCells, numHorizontalCells }) => {
  return (data): BoxInfo => {
    const { top, left, right, bottom, ...rest } = data;
    const { scrollWidth: width, scrollHeight: height } = container;
    const cellHeight = height / numVerticalCells;
    const cellWidth = width / numHorizontalCells;
    const startCell = {
      x: floor(left / cellWidth),
      y: floor(top / cellHeight)
    };
    const endCell = {
      x: floor(right / cellWidth),
      y: floor(bottom / cellHeight)
    };
    const spanX = getSpan(startCell.x, endCell.x);
    const spanY = getSpan(startCell.y, endCell.y);

    return {
      ...data,
      top: startCell.y * cellHeight,
      left: startCell.x * cellWidth,
      bottom: endCell.y + 1,
      right: endCell.x + 1,
      width: spanX * cellWidth,
      height: spanY * cellHeight,
      spanX,
      spanY,
      // ...data,
      startCell,
      endCell
    };
  };
};

const mapSpanToDate = ({ startCell, endCell, yToMin = y => y * 30 }) => {
  const startDay = startCell.x;
  const endDay = endCell.x;
  const spanX = getSpan(startCell.x, endCell.x);
  const spanY = getSpan(startCell.y, endCell.y);

  const startDate = addMinutes(
    addDays(
      startOfWeek(new Date(), {
        weekStartsOn: 1
      }),
      startDay
    ),
    yToMin(startCell.y)
  );
  const endDate = addDays(addMinutes(startDate, yToMin(spanY)), spanX - 1);

  return {
    start: {
      date: startDate,
      day: getDay(startDate),
      hour: getTime(startDate)
    },
    end: { date: endDate, day: getDay(endDate), hour: getTime(endDate) }
  };
};

type Coords = { x: number; y: number };

type BoxInfo = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  spanX: number;
  spanY: number;
  startCell: Coords;
  endCell: Coords;
};

function useMouseClickAndDrag(ref: React.Ref<any>) {
  const [style, setStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [text, setText] = useState("");
  const [boxInfo, setBoxInfo] = useState<BoxInfo>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    spanX: 0,
    spanY: 0,
    startCell: { x: 0, y: 0 },
    endCell: { x: 0, y: 0 }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hasFinishedDragging, setHasFinishedDragging] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const container = ref.current;

    const touchStart$ = fromEvent(container, "touchstart");
    const touchMove$ = fromEvent(container, "touchmove");
    const touchEnd$ = fromEvent(container, "touchend");

    const mouseDown$ = fromEvent(container, "mousedown");
    const mouseMove$ = fromEvent(container, "mousemove");
    const mouseUp$ = fromEvent(container, "mouseup");

    const dragStart$ = merge(mouseDown$, touchStart$).pipe(
      tap(e => e.stopPropagation()),
      tap(e => e.preventDefault()),
      map(mapPageCoordinatesToContainer(container))
    );

    const dragEnd$ = merge(mouseUp$, touchEnd$).pipe(
      map(mapPageCoordinatesToContainer(container)),
      tap(() => {
        setIsDragging(false);
        setHasFinishedDragging(true);
      })
    );
    const move$ = merge(mouseMove$, touchMove$).pipe(
      map(mapPageCoordinatesToContainer(container))
    );

    const box$ = dragStart$.pipe(
      tap(() => {
        setIsDragging(true);
        setHasFinishedDragging(false);
      }),
      mergeMap(down => {
        return move$.pipe(
          map(move => {
            return {
              top: Math.min(down.y, move.y),
              bottom: Math.max(down.y, move.y),
              left: Math.min(down.x, move.x),
              right: Math.max(down.x, move.x),
              width: Math.abs(move.x - down.x),
              height: Math.abs(move.y - down.y)
            };
          }),
          map(
            addCellInfo({
              container,
              numHorizontalCells: 7,
              numVerticalCells: 48
            })
          ),
          takeUntil(dragEnd$)
        );
      }),
      tap(setBoxInfo)
    );

    const style$ = box$.pipe(
      map(({ top, left, width, height }) => ({
        top,
        left,
        width,
        height
      }))
    );

    const span$ = box$.pipe(distinctUntilChanged(isEqual));

    const text$ = span$.pipe(
      map(mapSpanToDate),
      map(({ start, end }) => {
        const startDateStr = format(start.date, "ddd h:mma");
        const endDateStr = format(end.date, "ddd h:mma");

        return `${startDateStr} - ${endDateStr}`;
      })
    );

    const subscriber2 = text$.subscribe(setText);
    const subscriber = style$.subscribe(setStyle);

    return () => {
      subscriber2.unsubscribe();
      subscriber.unsubscribe();
    };
  }, []);

  return [{ style, text, boxInfo, isDragging, hasFinishedDragging }];
}

function Event() {
  return <div className="event">Event</div>;
}

function App() {
  const parent = useRef(null);
  const [
    { style, text, isDragging, hasFinishedDragging, boxInfo }
  ] = useMouseClickAndDrag(parent);

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
          {times(7).map(x => {
            return (
              <div className="day-column">
                <div className="day-hours">
                  {times(24).map(y => {
                    const { start } = mapSpanToDate({
                      startCell: { x, y },
                      endCell: { x, y },
                      yToMin: y => y * 60
                    });

                    return (
                      <div className="cell">
                        {format(start.date, "ddd h:mma")}
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
