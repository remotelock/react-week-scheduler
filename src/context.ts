import { enUS } from 'date-fns/locale';
import { createContext } from 'react';

export const SchedulerContext = createContext({ locale: enUS });
