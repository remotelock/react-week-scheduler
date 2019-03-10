import { useEffect } from 'react';

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  Element extends HTMLElement
>(
  ref: React.RefObject<Element>,
  event: K,
  listener: (this: Element, event: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
) {
  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    ref.current.addEventListener(event, listener, options);

    return () => {
      if (!ref.current) {
        return;
      }

      ref.current.removeEventListener(event, listener);
    };
  }, [ref.current]);
}
