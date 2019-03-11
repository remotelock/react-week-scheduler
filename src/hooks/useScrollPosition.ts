import { useState } from 'react';
import { useEventListener } from './useEventListener';

export function useScrollPosition(
  root: React.RefObject<HTMLElement>,
  { passive = true, enabled = true } = {},
) {
  const [position, setPosition] = useState({ scrollTop: 0, scrollLeft: 0 });

  useEventListener(
    root,
    'scroll',
    event => {
      if (event && event.target) {
        // @ts-ignore
        const { scrollTop, scrollLeft } = event.target;
        setPosition({ scrollTop, scrollLeft });
      }
    },
    { passive },
    { enabled },
  );

  return position;
}
