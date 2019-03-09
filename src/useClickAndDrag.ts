import React, { useState, useEffect } from 'react';
import { isEqual } from 'lodash';
import { fromEvent, merge } from 'rxjs';
import {
  tap,
  map,
  takeUntil,
  mergeMap,
  startWith,
  distinctUntilChanged
} from 'rxjs/operators';
import { createPageMapCoordsToContainer } from './utils/createPageMapCoordsToContainer';
import { Rect } from './types';

export function useClickAndDrag(ref: React.RefObject<HTMLElement>) {
  const [style, setStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [box, setBox] = useState<Rect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasFinishedDragging, setHasFinishedDragging] = useState(false);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }

    const mapCoordsToContainer = createPageMapCoordsToContainer(container);

    const touchStart$ = fromEvent(container, 'touchstart', { passive: true });
    const touchMove$ = fromEvent(window, 'touchmove', { passive: true });
    const touchEnd$ = fromEvent(window, 'touchend', { passive: true });

    const mouseDown$ = fromEvent(container, 'mousedown', { passive: true });
    const mouseMove$ = fromEvent(window, 'mousemove', { passive: true });
    const mouseUp$ = fromEvent(window, 'mouseup', { passive: true });

    const dragStart$ = merge(mouseDown$, touchStart$).pipe(
      tap((e: any) => {
        e.stopPropagation();
        e.preventDefault();
      }),
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
              const startX = Math.max(down.x, 0);
              const startY = Math.max(down.y, 0);
              const endX = Math.min(move.x, container.scrollWidth);
              const endY = Math.min(move.y, container.scrollHeight);
              const top = Math.min(startY, endY);
              const bottom = Math.max(startY, endY);
              const left = Math.min(startX, endX);
              const right = Math.max(startX, endX);

              return {
                startX,
                startY,
                endX,
                endY,
                top,
                bottom,
                left,
                right,
                width: right - left,
                height: bottom - top
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

  return { style, box, isDragging, hasFinishedDragging };
}
