import React from 'react';
import { ClassNames, ScheduleType } from '../types';
import { ScheduleProps } from './Schedule';
export declare const TimeGridScheduler: React.NamedExoticComponent<{
    originDate?: Date | undefined;
    /**
     * The minimum number of minutes a created range can span
     * @default 30
     */
    verticalPrecision?: number | undefined;
    /**
     * The visual grid increments in minutes.
     * @default 30
     */
    visualGridVerticalPrecision?: number | undefined;
    /**
     * The minimum number of minutes for an time block
     * created with a single click.
     * @default visualGridVerticalPrecision
     */
    cellClickPrecision?: number | undefined;
    /** Custom styles applied to the root of the view */
    style?: React.CSSProperties | undefined;
    schedule: ScheduleType;
    /**
     * A map of class names to the scoped class names
     * The keys are class names like `'root'` and the values
     * are the corresponding class names which can be scoped
     * with CSS Modules, e.g. `'_root_7f2c6'`.
     */
    classes: ClassNames;
    className?: string | undefined;
    /**
     * The view will initially be scrolled to these hours.
     * Defaults to work hours (9-17).
     * @default [9, 17]
     */
    defaultHours?: [number, number] | undefined;
    onChange(newSchedule: ScheduleType): void;
    onEventClick?: ScheduleProps['onClick'];
    eventContentComponent?: ScheduleProps['eventContentComponent'];
    eventRootComponent?: ScheduleProps['eventRootComponent'];
    disabled?: boolean | undefined;
}>;
//# sourceMappingURL=TimeGridScheduler.d.ts.map