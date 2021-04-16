/// <reference types="react" />
import { ExtendedKeyboardEvent } from 'mousetrap';
/**
 * Use mousetrap hook
 *
 * @param handlerKey - A key, key combo or array of combos according to Mousetrap documentation.
 * @param  handlerCallback - A function that is triggered on key combo catch.
 */
export declare function useMousetrap(handlerKey: string | string[], handlerCallback: (e: ExtendedKeyboardEvent, combo: string) => void, elementOrElementRef: typeof document | React.RefObject<Element | null>): void;
//# sourceMappingURL=useMousetrap.d.ts.map