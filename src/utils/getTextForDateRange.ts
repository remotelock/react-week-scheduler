import format from 'date-fns/format';
import getMinutes from 'date-fns/get_minutes';
import isSameDay from 'date-fns/is_same_day';

const dropSame = (
  dates: [Date, Date],
  template: string,
  takeSecond: boolean = false,
  locale: typeof import('date-fns/locale/en'),
) => {
  const [first, second] = dates.map(date => format(date, template, { locale }));
  if (first !== second) {
    return [first, second];
  }

  if (takeSecond) {
    return ['', second];
  }

  return [first, ''];
};

const formatHour = (
  date: Date,
  locale: typeof import('date-fns/locale/en'),
) => {
  if (getMinutes(date) === 0) {
    return format(date, 'h', { locale });
  }

  return format(date, 'h:m', { locale });
};

export const getTextForDateRange = (
  dates: [Date, Date],
  locale: typeof import('date-fns/locale/en'),
  template?: string,
  template2?: string,
) => {
  const start = dates[0];
  const end = dates[dates.length - 1];

  if (isSameDay(start, end) && !template) {
    const [firstM, secondM] = dropSame(dates, 'a', true, locale);
    return `${format(start, 'ddd')} ${formatHour(start, {
      locale,
    })}${firstM} – ${formatHour(end, { locale })}${secondM}`;
  }

  const formatTemplate = 'ddd h:mma';
  const startDateStr = format(start, template || formatTemplate, { locale });
  const endDateStr = format(end, template2 || formatTemplate, { locale });

  return `${startDateStr} – ${endDateStr}`;
};
