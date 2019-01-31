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
import { createPageMapCoordsToContainer } from "./utils/createPageMapCoordsToContainer";

export function useClickAndDrag(ref: React.Ref<HTMLElement>) {
  const [style, setStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [box, setBox] = useState<ClientRect>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0
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
    const touchMove$ = fromEvent(container, "touchmove");
    const touchEnd$ = fromEvent(container, "touchend");

    const mouseDown$ = fromEvent(container, "mousedown");
    const mouseMove$ = fromEvent(container, "mousemove");
    const mouseUp$ = fromEvent(container, "mouseup");

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

    const box$ = dragStart$.pipe(
      tap(() => {
        setIsDragging(true);
        setHasFinishedDragging(false);
      }),
      mergeMap(down => {
        return move$.pipe(
          map(
            (move): ClientRect => {
              return {
                top: Math.min(down.y, move.y),
                bottom: Math.max(down.y, move.y),
                left: Math.min(down.x, move.x),
                right: Math.max(down.x, move.x),
                width: Math.abs(move.x - down.x),
                height: Math.abs(move.y - down.y)
              };
            }
          ),
          takeUntil(dragEnd$)
        );
      }),
      distinctUntilChanged(isEqual)
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
