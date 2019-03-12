/* eslint-disable import/no-extraneous-dependencies */

import { startOfWeek } from 'date-fns';
// @ts-ignore
import humanizeDuration from 'humanize-duration';
import React, { useState, Fragment } from 'react';
import CustomProperties from 'react-custom-properties';
import ReactDOM from 'react-dom';
import 'resize-observer-polyfill/dist/ResizeObserver.global';
import useUndo from 'use-undo';
import { TimeGridScheduler } from '../src/components/TimeGridScheduler';
import useMousetrap from '../src/hooks/useMousetrap';
import defaultStyleClasses from '../src/styles';
import { ScheduleType } from '../src/types';
import { Key } from './components/Key/Key';
import demoClasses from './index.module.scss';

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

function App() {
  const [
    scheduleState,
    {
      set: setSchedule,
      undo: undoSchedule,
      redo: redoSchedule,
      canUndo: canUndoSchedule,
      canRedo: canRedoSchedule,
    },
  ] = useUndo<ScheduleType>(defaultSchedule);

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

  const [verticalPrecision, setVerticalPrecision] = useState(30);
  const [
    visualGridVerticalPrecision,
    setVisualGridVerticalPrecision,
  ] = useState(30);
  const [cellHeight, setCellHeight] = useState(50);
  const [cellWidth, setCellWidth] = useState(250);

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
        <label htmlFor="cell_height">
          Cell height:
          <input
            id="cell_height"
            name="cell_height"
            type="range"
            max={100}
            step={10}
            min={40}
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
          <TimeGridScheduler
            key={visualGridVerticalPrecision}
            className={demoClasses.root}
            classes={defaultStyleClasses}
            originDate={startOfWeek(new Date('2019-03-04'), {
              weekStartsOn: 1,
            })}
            schedule={scheduleState.present}
            onChange={setSchedule}
            verticalPrecision={verticalPrecision}
            visualGridVerticalPrecision={visualGridVerticalPrecision}
          />
        </Fragment>
      </CustomProperties>
    </>
  );
}

const rootElement = document.getElementById('root');

ReactDOM.render(<App />, rootElement);
