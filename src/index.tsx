import { DefaultEventRootComponent } from './components/DefaultEventRootComponent';
import { TimeGridScheduler } from './components/TimeGridScheduler';
import { SchedulerContext } from './context';
import { useMousetrap } from './hooks/useMousetrap';
import { classes } from './styles';
import {
  getFormattedComponentsForDateRange,
  getTextForDateRange,
} from './utils/getTextForDateRange';
require('../types/merge-ranges');
export {
  TimeGridScheduler,
  classes,
  DefaultEventRootComponent,
  useMousetrap,
  SchedulerContext,
  getFormattedComponentsForDateRange as getFormattedTimeRangeComponents,
  getTextForDateRange,
};