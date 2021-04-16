import React from 'react';
import { CellInfo, ClassNames, DateRange, Grid, OnChangeCallback, ScheduleType } from '../types';
export declare type ScheduleProps = {
    classes: ClassNames;
    grid: Grid;
    onChange?: OnChangeCallback;
    isResizable?: boolean;
    isDeletable?: boolean;
    moveAxis: 'none' | 'both' | 'x' | 'y';
    cellInfoToDateRange(cell: CellInfo): DateRange;
    onActiveChange?(index: [number, number] | [null, null]): void;
    onClick?(index: [number, number] | [null, null]): void;
    getIsActive(indexes: {
        cellIndex: number;
        rangeIndex: number;
    }): boolean;
    eventContentComponent?: any;
    eventRootComponent?: any;
    disabled?: boolean;
};
export declare const Schedule: React.NamedExoticComponent<{
    dateRangeToCells(range: DateRange): CellInfo[];
    ranges: ScheduleType;
    className?: string | undefined;
    classes: ClassNames;
} & ScheduleProps>;
//# sourceMappingURL=Schedule.d.ts.map