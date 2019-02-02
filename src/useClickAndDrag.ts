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
  startWith,
  take,
  distinctUntilChanged
} from "rxjs/operators";
import { createPageMapCoordsToContainer } from "./utils/createPageMapCoordsToContainer";

export type Rect = ClientRect & {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

export function useClickAndDrag(ref: React.Ref<HTMLElement>) {
  const [style, setStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [box, setBox] = useState<Rect>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hasFinishedDragging, setHasFinishedDragging] = useState(false);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const container = ref.current;
    const mapCoordsToContainer = createPageMapCoordsToContainer(container);

    const touchStart$ = fromEvent(container, "touchstart");
    const touchMove$ = fromEvent(window, "touchmove");
    const touchEnd$ = fromEvent(window, "touchend");

    const mouseDown$ = fromEvent(container, "mousedown");
    const mouseMove$ = fromEvent(window, "mousemove");
    const mouseUp$ = fromEvent(window, "mouseup");

    const dragStart$ = merge(mouseDown$, touchStart$).pipe(
      tap(e => e.stopPropagation()),
      tap(e => e.preventDefault()),
      map(mapCoordsToContainer)
    );

    const dragEnd$ = merge(mouseUp$, touchEnd$).pipe(
      map(mapCoordsToContainer),
      tap(() => {
        setIsDragging(false);
        setHasFinishedDragging(true);
      })
    );
    const move$ = merge(mouseMove$, touchMove$).pipe(map(mapCoordsToContainer));

    // move$.subscribe(({ x, y }) => console.log(x, y));

    const box$ = dragStart$.pipe(
      tap(() => {
        setIsDragging(true);
        setHasFinishedDragging(false);
      }),
      mergeMap(down => {
        return move$.pipe(
          startWith(down),
          map(
            (move): Rect => {
              return {
                startX: down.x,
                startY: down.y,
                endX: move.x,
                endY: move.y,
                top: Math.min(down.y, move.y),
                bottom: Math.max(down.y, move.y),
                left: Math.min(down.x, move.x),
                right: Math.max(down.x, move.x),
                width: Math.abs(move.x - down.x),
                height: Math.abs(move.y - down.y)
              };
            }
          ),
          // tap(({ endY }) => console.log({ endY })),
          takeUntil(dragEnd$)
        );
      }),
      distinctUntilChanged(isEqual)
      // tap(({ top, left }) => console.log(top, left))
    );

    const style$ = box$.pipe(
      map(({ top, left, width, height }) => ({
        top,
        left,
        width,
        height
      }))
    );

    const boxSubscriber = box$.subscribe(setBox);
    const styleSubscriber = style$.subscribe(setStyle);

    return () => {
      boxSubscriber.unsubscribe();
      styleSubscriber.unsubscribe();
    };
  }, []);

  return [{ style, box, isDragging, hasFinishedDragging }];
}
