import { compareAsc, startOfWeek } from 'date-fns';
import useUndo from 'use-undo';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import 'resize-observer-polyfill/dist/ResizeObserver.global';

import { Event as CalendarEvent } from './types';
import { TimeGridScheduler } from './components/TimeGridScheduler';
import { Key } from './components/Key/Key';
import useMousetrap from './hooks/useMousetrap';
import defaultStyleClasses from './styles';

const rangeStrings: [string, string][] = [
  ['2019-03-03T22:45:00.000Z', '2019-03-04T01:15:00.000Z'],
  ['2019-03-05T22:00:00.000Z', '2019-03-06T01:00:00.000Z'],
  ['2019-03-04T22:15:00.000Z', '2019-03-05T01:00:00.000Z'],
  ['2019-03-07T05:30:00.000Z', '2019-03-07T10:00:00.000Z'],
  ['2019-03-08T22:00:00.000Z', '2019-03-09T01:00:00.000Z'],
  ['2019-03-09T22:00:00.000Z', '2019-03-10T01:00:00.000Z'],
  ['2019-03-06T22:00:00.000Z', '2019-03-07T01:00:00.000Z']
];

const defaultSchedule: CalendarEvent = rangeStrings
  .map(range => range.map(dateString => new Date(dateString)) as [Date, Date])
  .sort((range1, range2) => compareAsc(range1[0], range2[0]));

function App() {
  const [
    scheduleState,
    {
      set: setSchedule,
      undo: undoSchedule,
      redo: redoSchedule,
      canUndo: canUndoSchedule,
      canRedo: canRedoSchedule
    }
  ] = useUndo<CalendarEvent>(defaultSchedule);

  useMousetrap(
    'ctrl+z',
    () => {
      if (!canUndoSchedule) {
        return;
      }

      undoSchedule();
    },
    document
  );

  useMousetrap(
    'ctrl+shift+z',
    () => {
      if (!canRedoSchedule) {
        return;
      }

      redoSchedule();
    },
    document
  );

  const [verticalPrecision, setVerticalPrecision] = useState(30);
  const [
    visualGridVerticalPrecision,
    setVisualGridVerticalPrecision
  ] = useState(30);

  return (
    <>
      <div className={defaultStyleClasses['buttons-wrapper']}>
        <button disabled={!canUndoSchedule} onClick={undoSchedule}>
          ⟲ Undo
        </button>
        <button disabled={!canRedoSchedule} onClick={redoSchedule}>
          Redo ⟳
        </button>
        <label>
          Vertical increments:
          <select
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
        <label>
          Visual vertical increments:
          <select
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
        <div>
          Tip: use <Key>Delete</Key> key to remove time blocks. <Key>↑</Key> and{' '}
          <Key>↓</Key> to move.
        </div>
      </div>
      <TimeGridScheduler
        key={visualGridVerticalPrecision}
        classes={defaultStyleClasses}
        originDate={startOfWeek(new Date('2019-03-04'), { weekStartsOn: 1 })}
        schedule={scheduleState.present}
        onChange={setSchedule}
        verticalPrecision={verticalPrecision}
        visualGridVerticalPrecision={visualGridVerticalPrecision}
      />
    </>
  );
}

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement);
