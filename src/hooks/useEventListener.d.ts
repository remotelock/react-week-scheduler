/// <reference types="react" />
export declare function useEventListener<K extends keyof HTMLElementEventMap, Element extends HTMLElement>(ref: React.RefObject<Element>, event: K, listener: (this: any, event: any) => void, options?: boolean | AddEventListenerOptions, { enabled }?: {
    enabled?: boolean | undefined;
}): void;
//# sourceMappingURL=useEventListener.d.ts.map