import { CellInfo, DateRange } from '../types';
export declare const createMapDateRangeToCells: ({ toX, toY, numVerticalCells, originDate, }: {
    toX: (day: number) => number;
    toY: (min: number) => number;
    numHorizontalCells: number;
    numVerticalCells: number;
    originDate: Date;
}) => ([start, end]: DateRange) => CellInfo[];
//# sourceMappingURL=createMapDateRangeToCells.d.ts.map