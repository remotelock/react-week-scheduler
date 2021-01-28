import format from 'date-fns/format';
import getMinutes from 'date-fns/get_minutes';
import isSameDay from 'date-fns/is_same_day';

const formatTemplate = 'ddd h:mma';

const formatHour = (
  date: Date,
  locale: typeof import('date-fns/locale/en'),
) => {
  if (getMinutes(date) === 0) {
    return format(date, 'HH:mm', { locale });
  }

  return format(date, 'HH:mm', { locale });
};

type Options = {
  dateRange: [Date, Date];
  locale: typeof import('date-fns/locale/en');
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
    const day = includeDayIfSame ? `${format(start, 'ddd', { locale })} ` : '';
    return [
      `${day}${formatHour(start, {
        locale,
      })}`,
      `${formatHour(end, { locale })}`,
    ];
  }

  const startDateStr = format(start, template || formatTemplate, { locale });
  const endDateStr = format(end, template2 || formatTemplate, { locale });

  return [startDateStr, endDateStr];
};

export const getTextForDateRange = (options: Options) => {
  return getFormattedComponentsForDateRange(options).join(' – ');
};
