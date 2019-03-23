import React, { useCallback, useEffect, useState } from 'react';
import { fromEvent, merge, Observable, of } from 'rxjs';
import {
  delay,
  filter,
  map,
  mergeMap,
  startWith,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { Rect } from '../types';
import { createPageMapCoordsToContainer } from '../utils/createPageMapCoordsToContainer';

const prevent = tap((e: TouchEvent) => {
  e.preventDefault();
  e.stopPropagation();
});

export function useClickAndDrag(
  ref: React.RefObject<HTMLElement>,
  isDisabled?: boolean,
) {
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'translate(0, 0)',
    width: 0,
    height: 0,
  });
  const [box, setBox] = useState<Rect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasFinishedDragging, setHasFinishedDragging] = useState(false);
  const container = ref.current;

  useEffect(() => {
    if (!container || isDisabled) {
      return;
    }

    const mapCoordsToContainer = createPageMapCoordsToContainer(container);

    const touchMove$ = fromEvent<TouchEvent>(window, 'touchmove', {
      passive: false,
    }).pipe(prevent);

    const touchEnd$ = fromEvent<TouchEvent>(window, 'touchend', {
      passive: true,
    });

    const touchStart$ = fromEvent<TouchEvent>(container, 'touchstart', {
      passive: false,
    });

    const touchStartWithDelay$ = touchStart$.pipe(
      mergeMap(start =>
        of(start).pipe(
          delay(300),
          takeUntil(touchMove$),
          prevent,
        ),
      ),
    );

    const mouseDown$ = fromEvent<MouseEvent>(container, 'mousedown', {
      passive: true,
    }).pipe(filter(event => event.which === 1));

    const mouseMove$ = fromEvent<MouseEvent>(window, 'mousemove', {
      passive: true,
    });

    const mouseUp$ = fromEvent<MouseEvent>(window, 'mouseup', {
      passive: true,
    });

    const dragStart$ = merge(mouseDown$, touchStartWithDelay$).pipe(
      map(mapCoordsToContainer),
    );

    const dragEnd$ = merge(mouseUp$, touchEnd$).pipe(
      map(mapCoordsToContainer),
      tap(() => {
        setIsDragging(false);
        setHasFinishedDragging(true);
      }),
    );

    const move$ = merge(mouseMove$, touchMove$).pipe(map(mapCoordsToContainer));

    const box$: Observable<Rect | null> = dragStart$.pipe(
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
                height: bottom - top,
              };
            },
          ),
          takeUntil(dragEnd$),
        );
      }),
      map(rect => {
        return rect.width === 0 && rect.height === 0 ? null : rect;
      }),
    );

    const style$ = box$.pipe(
      map(rect => {
        if (rect !== null) {
          const { width, height, left, top } = rect;
          return {
            transform: `translate(${left}px, ${top}px)`,
            width,
            height,
          };
        }

        return { display: 'none' };
      }),
    );

    const boxSubscriber = box$.subscribe(setBox);
    const styleSubscriber = style$.subscribe(setStyle);

    return () => {
      boxSubscriber.unsubscribe();
      styleSubscriber.unsubscribe();
    };
  }, [container, isDisabled]);

  const cancel = useCallback(() => {
    setIsDragging(false);
    setHasFinishedDragging(false);
    setBox(null);
  }, []);

  return { style, box, isDragging, cancel, hasFinishedDragging };
}
