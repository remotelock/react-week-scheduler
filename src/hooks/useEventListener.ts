import { useEffect } from 'react';

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  Element extends HTMLElement
>(
  ref: React.RefObject<Element>,
  event: K,
  listener: (this: Element, event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
  { enabled = true } = {},
) {
  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    if (enabled) {
      ref.current.addEventListener(event, listener, options);
    } else if (listener) {
      ref.current.removeEventListener(event, listener);
    }

    return () => {
      if (!ref.current) {
        return;
      }

      ref.current.removeEventListener(event, listener);
    };
  }, [ref.current, listener, options, enabled]);
}
