/* eslint-disable import/no-extraneous-dependencies */

import Tippy from '@tippy.js/react';
import classcat from 'classcat';
import format from 'date-fns/format';
import isSameWeek from 'date-fns/is_same_week';
import ar from 'date-fns/locale/ar';
import de from 'date-fns/locale/de';
import en from 'date-fns/locale/en';
import ja from 'date-fns/locale/ja';
import setDay from 'date-fns/set_day';
import startOfWeek from 'date-fns/start_of_week';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import mapValues from 'lodash/mapValues';
import React, { Fragment, useMemo, useState } from 'react';
import CustomProperties from 'react-custom-properties';
import ReactDOM from 'react-dom';
import 'resize-observer-polyfill/dist/ResizeObserver.global';
import useUndo from 'use-undo';
import { TimeGridScheduler } from '../src/components/TimeGridScheduler';
import { SchedulerContext } from '../src/context';
import { useMousetrap } from '../src/hooks/useMousetrap';
import { classes as defaultClasses } from '../src/styles';
import { EventRootProps, ScheduleType } from '../src/types';
import DeleteIcon from './assets/outline-delete-24px.svg';
import { Key } from './components/Key/Key';
import demoClasses from './index.module.scss';

const locales = {
  ja,
  en,
  de,
  ar,
};

const classes = mapValues(
  defaultClasses,
  (value, key: keyof typeof defaultClasses) =>
    classcat([value, demoClasses[key]]),
);

const rangeStrings: [string, string][] = [
  ['2019-03-03T22:45:00.000Z', '2019-03-04T01:15:00.000Z'],
  ['2019-03-04T22:15:00.000Z', '2019-03-05T01:00:00.000Z'],
  ['2019-03-05T22:00:00.000Z', '2019-03-06T01:00:00.000Z'],
  ['2019-03-06T22:00:00.000Z', '2019-03-07T01:00:00.000Z'],
  ['2019-03-07T05:30:00.000Z', '2019-03-07T10:00:00.000Z'],
  ['2019-03-08T22:00:00.000Z', '2019-03-09T01:00:00.000Z'],
  ['2019-03-09T22:00:00.000Z', '2019-03-10T01:00:00.000Z'],
];

const defaultSchedule: ScheduleType = rangeStrings.map(
  range => range.map(dateString => new Date(dateString)) as [Date, Date],
);

const EventRoot = React.forwardRef<any, EventRootProps>(function EventRoot(
  { handleDelete, rangeIndex, cellIndex, isActive, ...props },
  ref,
) {
  return (
    <Tippy
      arrow
      interactive
      hideOnClick={false}
      className={demoClasses.tooltip}
      content={
        <button onClick={handleDelete}>
          <DeleteIcon className={demoClasses.icon} />
          Delete
        </button>
      }
    >
      <div {...props} ref={ref} />
    </Tippy>
  );
});

function App() {
  const [weekStart, setWeekStart] = useState(1);
  const originDate = useMemo(
    () =>
      startOfWeek(new Date('2019-03-04'), {
        weekStartsOn: weekStart,
      }),
    [weekStart],
  );
  const [
    scheduleState,
    {
      set: setSchedule,
      undo: undoSchedule,
      redo: redoSchedule,
      canUndo: canUndoSchedule,
      canRedo: canRedoSchedule,
    },
  ] = useUndo<ScheduleType>(
    defaultSchedule.filter(range =>
      isSameWeek(originDate, range[0], { weekStartsOn: weekStart }),
    ),
  );

  useMousetrap(
    'ctrl+z',
    () => {
      if (!canUndoSchedule) {
        return;
      }

      undoSchedule();
    },
    document,
  );

  useMousetrap(
    'ctrl+shift+z',
    () => {
      if (!canRedoSchedule) {
        return;
      }

      redoSchedule();
    },
    document,
  );

  const [verticalPrecision, setVerticalPrecision] = useState(15);
  const [
    visualGridVerticalPrecision,
    setVisualGridVerticalPrecision,
  ] = useState(60);
  const [cellHeight, setCellHeight] = useState(45);
  const [cellWidth, setCellWidth] = useState(250);
  const [disabled, setDisabled] = useState(false);
  const [locale, setLocale] = useState('en');

  return (
    <>
      <div className={demoClasses['buttons-wrapper']}>
        <button
          type="button"
          disabled={!canUndoSchedule}
          onClick={undoSchedule}
        >
          ⟲ Undo
        </button>
        <button
          type="button"
          disabled={!canRedoSchedule}
          onClick={redoSchedule}
        >
          Redo ⟳
        </button>
        <label htmlFor="vertical_precision">
          Precision:
          <select
            name="vertical_precision"
            id="vertical_precision"
            value={verticalPrecision}
            onChange={({ target: { value } }) =>
              setVerticalPrecision(Number(value))
            }
          >
            {[5, 10, 15, 30, 60].map(value => (
              <option key={value} value={value}>
                {humanizeDuration(value * 60 * 1000)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="disabled">
          <input
            id="disabled"
            type="checkbox"
            name="disabled"
            checked={disabled}
            onChange={e => setDisabled(Boolean(e.target.checked))}
          />
          Disabled
        </label>
        <label style={{ display: 'none' }} htmlFor="start_of_week">
          Start of week:
          <select
            name="start_of_week"
            id="start_of_week"
            value={weekStart}
            onChange={({ target: { value } }) => setWeekStart(Number(value))}
          >
            {[0, 1, 2, 3, 4, 5, 6].map(value => (
              <option key={value} value={value}>
                {format(setDay(new Date(), value), 'ddd')}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="visual_grid_vertical_precision">
          Grid increments:
          <select
            name="visual_grid_vertical_precision"
            id="visual_grid_vertical_precision"
            value={visualGridVerticalPrecision}
            onChange={({ target: { value } }) =>
              setVisualGridVerticalPrecision(Number(value))
            }
          >
            {[15, 30, 60].map(value => (
              <option key={value} value={value}>
                {humanizeDuration(value * 60 * 1000)}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="locale">
          Locale:
          <select
            name="locale"
            id="locale"
            value={locale}
            onChange={({ target: { value } }) => {
              setLocale(value);
            }}
          >
            {['en', 'ar', 'ja', 'de'].map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="cell_height">
          Cell height:
          <input
            id="cell_height"
            name="cell_height"
            type="range"
            max={100}
            step={10}
            min={30}
            value={cellHeight}
            onChange={({ target: { value } }) => setCellHeight(Number(value))}
          />
        </label>
        <label htmlFor="cell_width">
          Preferred cell width:
          <input
            id="cell_width"
            name="cell_width"
            type="range"
            max={300}
            step={25}
            min={150}
            value={cellWidth}
            onChange={({ target: { value } }) => setCellWidth(Number(value))}
          />
        </label>
        <div>
          Tip: use <Key>Delete</Key> key to remove time blocks. <Key>↑</Key> and{' '}
          <Key>↓</Key> to move.
        </div>
      </div>
      <CustomProperties
        global={false}
        properties={{
          '--cell-height': `${cellHeight}px`,
          '--cell-width': `${cellWidth}px`,
        }}
      >
        <Fragment key={`${cellHeight},${cellWidth}`}>
          <SchedulerContext.Provider value={{ locale: locales[locale] }}>
            <TimeGridScheduler
              key={originDate.toString()}
              classes={classes}
              originDate={originDate}
              schedule={scheduleState.present}
              onChange={setSchedule}
              verticalPrecision={verticalPrecision}
              visualGridVerticalPrecision={visualGridVerticalPrecision}
              eventRootComponent={EventRoot}
              disabled={disabled}
            />
          </SchedulerContext.Provider>
        </Fragment>
      </CustomProperties>
    </>
  );
}

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement);
