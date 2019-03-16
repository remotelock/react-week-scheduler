import format from 'date-fns/format';
import getMinutes from 'date-fns/get_minutes';
import isSameDay from 'date-fns/is_same_day';

const dropSame = (
  dates: [Date, Date],
  template: string,
  takeSecond: boolean = false,
) => {
  const [first, second] = dates.map(date => format(date, template));
  if (first !== second) {
    return [first, second];
  }

  if (takeSecond) {
    return ['', second];
  }

  return [first, ''];
};

const formatHour = (date: Date) => {
  if (getMinutes(date) === 0) {
    return format(date, 'h');
  }

  return format(date, 'h:m');
};

export const getTextForDateRange = (
  dates: [Date, Date],
  template?: string,
  template2?: string,
) => {
  const start = dates[0];
  const end = dates[dates.length - 1];

  if (isSameDay(start, end) && !template) {
    const [firstM, secondM] = dropSame(dates, 'a', true);
    return `${format(start, 'ddd')} ${formatHour(
      start,
    )}${firstM} – ${formatHour(end)}${secondM}`;
  }

  const formatTemplate = 'ddd h:mma';
  const startDateStr = format(start, template || formatTemplate);
  const endDateStr = format(end, template2 || formatTemplate);

  return `${startDateStr} – ${endDateStr}`;
};
