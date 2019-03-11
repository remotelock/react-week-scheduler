import mousetrap from 'mousetrap';
import { useEffect, useRef } from 'react';

/**
 * Use mousetrap hook
 *
 * @param handlerKey - A key, key combo or array of combos according to Mousetrap documentation.
 * @param  handlerCallback - A function that is triggered on key combo catch.
 */
export default function useMousetrap(
  handlerKey: string | string[],
  handlerCallback: () => void,
  element: typeof document | Element | null,
) {
  const actionRef = useRef<typeof handlerCallback | null>(null);
  actionRef.current = handlerCallback;

  useEffect(() => {
    if (!element) {
      return;
    }

    Mousetrap(element as Element).bind(handlerKey, () => {
      typeof actionRef.current === 'function' && actionRef.current();
    });

    return () => {
      mousetrap.unbind(handlerKey);
    };
  }, [handlerKey, element]);
}
