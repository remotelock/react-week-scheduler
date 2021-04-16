import React from 'react';
import { Rect } from '../types';
export declare function useClickAndDrag(ref: React.RefObject<HTMLElement>, isDisabled?: boolean): {
    style: React.CSSProperties;
    box: Rect | null;
    isDragging: boolean;
    cancel: () => void;
    hasFinishedDragging: boolean;
};
//# sourceMappingURL=useClickAndDrag.d.ts.map