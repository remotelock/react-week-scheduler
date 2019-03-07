import { isSameDay, format } from 'date-fns';

export const getTextForDateRange = (
  dates: Date[],
  template?: string,
  template2?: string
) => {
  const start = dates[0];
  const end = dates[dates.length - 1];

  if (isSameDay(start, end) && !template) {
    return `${format(start, 'ddd h:mma')} - ${format(end, 'h:mma')}`;
  }

  const formatTemplate = 'ddd h:mma';
  const startDateStr = format(start, template || formatTemplate);
  const endDateStr = format(end, template2 || formatTemplate);

  return `${startDateStr}-${endDateStr}`;
};
