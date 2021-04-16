/// <reference types="react" />
export declare type OnChangeCallback = (newDateRange: DateRange | undefined, rangeIndex: number) => void;
export declare type Coords = {
    x: number;
    y: number;
};
export declare type ClassNames = typeof import('./styles/styles.module.scss').default;
export declare type EventRootProps = {
    className?: string;
    classes: ClassNames;
    style?: React.CSSProperties;
    cellIndex: number;
    rangeIndex: number;
    isActive: boolean;
    disabled?: boolean;
    handleDelete(): void;
};
export declare type ScheduleType = DateRange[];
export declare type CellInfo = {
    spanX: number;
    spanY: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};
export declare type DateRange = [Date, Date];
export declare type MapCellInfoToDateRange = (options: MapCellInfoToDateRangeOptions) => (cellInfo: CellInfo) => DateRange[];
export declare type MapCellInfoToDateRangeOptions = {
    fromY: (y: number) => number;
    fromX: (x: number) => number;
    originDate: Date;
};
export declare type Grid = {
    cellHeight: number;
    cellWidth: number;
    totalWidth: number;
    totalHeight: number;
    numVerticalCells: number;
    numHorizontalCells: number;
    getRectFromCell(cell: CellInfo): Rect;
    getCellFromRect(rect: Rect): CellInfo;
};
export declare type Rect = ClientRect & {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
};
//# sourceMappingURL=types.d.ts.map