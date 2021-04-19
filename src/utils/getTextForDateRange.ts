import { format, getMinutes, isSameDay, Locale } from 'date-fns';

const formatTemplate = 'ddd h:mma';

const dropSame = (
  dates: [Date, Date],
  template: string,
  takeSecond: boolean = false,
  locale: Locale,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  locale: any,
) => {
  if (getMinutes(date) === 0) {
    return format(date, 'h', { locale });
  }

  return format(date, 'h:mm', { locale });
};

type Options = {
  dateRange: [Date, Date];
  locale: Locale;
  template?: string;
  template2?: string;
  includeDayIfSame?: boolean;
};

export const getFormattedComponentsForDateRange = ({
  dateRange,
  locale,
  template,
  template2,
  includeDayIfSame = true,
}: Options) => {
  const start = dateRange[0];
  const end = dateRange[dateRange.length - 1];

  if (isSameDay(start, end) && !template) {
    const [firstM, secondM] = dropSame(dateRange, 'a', true, locale);
    const day = includeDayIfSame ? `${format(start, 'ddd', { locale })} ` : '';
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

export const getTextForDateRange = (options: Options) => {
  return getFormattedComponentsForDateRange(options).join(' – ');
};
