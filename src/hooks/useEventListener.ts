import { useEffect } from 'react';

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  Element extends HTMLElement
>(
  ref: React.RefObject<Element>,
  event: K,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listener: (this: any, event: any) => void,
  options?: boolean | AddEventListenerOptions,
  { enabled = true } = {},
) {
  const { current } = ref;

  useEffect(() => {
    if (current === null) {
      return;
    }

    if (enabled) {
      current.addEventListener(event, listener, options);
    } else if (listener) {
      current.removeEventListener(event, listener);
    }

    return () => {
      if (!current) {
        return;
      }

      current.removeEventListener(event, listener);
    };
  }, [current, event, listener, options, enabled]);
}
