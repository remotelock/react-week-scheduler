import en from 'date-fns/locale/en';
import { createContext } from 'react';

export const dateFnsContext = createContext({ locale: en });
