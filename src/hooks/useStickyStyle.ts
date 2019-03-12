import React, { useMemo } from 'react';
import { useScrollPosition } from './useScrollPosition';

export function useStickyStyle(
  scrollParent: React.RefObject<HTMLElement>,
  { top = false, left = false }: { top?: boolean; left?: boolean },
) {
  const { scrollLeft, scrollTop } = useScrollPosition(scrollParent, {
    enabled: top || left,
  });

  const stickyStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `translate(${left ? scrollLeft : 0}px, ${
        top ? scrollTop : 0
      }px)`,
      zIndex: 3,
    }),
    [left, scrollLeft, top, scrollTop],
  );

  return stickyStyle;
}
