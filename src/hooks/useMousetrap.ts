import mousetrap from 'mousetrap';
import { useEffect, useRef } from 'react';

const weakMap = new WeakMap<typeof document | Element, MousetrapInstance>();

/**
 * Use mousetrap hook
 *
 * @param handlerKey - A key, key combo or array of combos according to Mousetrap documentation.
 * @param  handlerCallback - A function that is triggered on key combo catch.
 */
export default function useMousetrap(
  handlerKey: string | string[],
  handlerCallback: () => void,
  element: typeof document | Element | null
) {
  const actionRef = useRef<typeof handlerCallback | null>(null);
  actionRef.current = handlerCallback;

  useEffect(() => {
    if (!element) {
      return;
    }

    let instance = weakMap.get(element);

    if (!instance) {
      instance = new Mousetrap(element as Element);
      weakMap.set(element, instance);
    }

    instance.bind(handlerKey, () => {
      typeof actionRef.current === 'function' && actionRef.current();
    });

    return () => {
      mousetrap.unbind(handlerKey);
    };
  }, [handlerKey, element]);
}
