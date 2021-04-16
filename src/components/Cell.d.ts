import React from 'react';
import { CellInfo, ClassNames, DateRange } from '../types';
export declare const Cell: React.NamedExoticComponent<{
    timeIndex: number;
    classes: ClassNames;
    getDateRangeForVisualGrid(cell: CellInfo): DateRange[];
    children?(options: {
        start: Date;
        isHourStart: boolean;
    }): React.ReactNode;
    onClick?: ((event: React.MouseEvent<Element, MouseEvent>) => void) | undefined;
}>;
//# sourceMappingURL=Cell.d.ts.map