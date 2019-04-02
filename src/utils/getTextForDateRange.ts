import format from 'date-fns/format';
import getMinutes from 'date-fns/get_minutes';
import isSameDay from 'date-fns/is_same_day';

const formatTemplate = 'ddd h:mma';

const dropSame = (
  dates: [Date, Date],
  template: string,
  takeSecond: boolean = false,
  locale: typeof import('date-fns/locale/en'),
): [string, string] => {
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

export const getFormattedTimeRangeComponents = (
  dates: [Date, Date],
  locale: typeof import('date-fns/locale/en'),
  template?: string,
  template2?: string,
  includeDay: boolean = true,
) => {
  const start = dates[0];
  const end = dates[dates.length - 1];

  if (isSameDay(start, end) && !template) {
    const [firstM, secondM] = dropSame(dates, 'a', true, locale);
    const day = includeDay ? `${format(start, 'ddd', { locale })} ` : '';
    return [
      `${day}${formatHour(start, {
        locale,
      })}${firstM}`,
      `${formatHour(end, { locale })}${secondM}`,
    ];
  }

  const startDateStr = format(start, template || formatTemplate, { locale });
  const endDateStr = format(end, template2 || formatTemplate, { locale });

  return [startDateStr, endDateStr];
};

export const getTextForDateRange = (
  dates: [Date, Date],
  locale: typeof import('date-fns/locale/en'),
  template?: string,
  template2?: string,
  includeDay?: boolean,
) => {
  return getFormattedTimeRangeComponents(
    dates,
    locale,
    template,
    template2,
    includeDay,
  ).join(' – ');
};
