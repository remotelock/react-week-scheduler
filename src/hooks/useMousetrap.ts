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
  handlerCallback: (e: ExtendedKeyboardEvent, combo: string) => void,
  element: typeof document | Element | null,
) {
  const actionRef = useRef<typeof handlerCallback | null>(null);
  actionRef.current = handlerCallback;

  useEffect(() => {
    if (!element) {
      return;
    }

    Mousetrap(element as Element).bind(handlerKey, (e, combo) => {
      typeof actionRef.current === 'function' && actionRef.current(e, combo);
    });

    return () => {
      mousetrap.unbind(handlerKey);
    };
  }, [handlerKey, element]);
}
