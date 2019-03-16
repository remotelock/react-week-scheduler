import addDays from 'date-fns/add_days';
import addMinutes from 'date-fns/add_minutes';

export const cellToDate = ({
  startX,
  startY,
  toMin,
  originDate,
}: {
  startX: number;
  startY: number;
  toMin: (y: number) => number;
  toDay: (x: number) => number;
  originDate: Date;
}) => addMinutes(addDays(originDate, startX), toMin(startY));
