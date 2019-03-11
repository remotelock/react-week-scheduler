# `@remotelock/react-week-scheduler`

## Installation

## Basic Usage

```jsx
import React, { useState } from 'react';
import 'resize-observer-polyfill/dist/ResizeObserver.global';
import { TimeGridScheduler } from '@remotelock/react-week-scheduler';
import defaultStyleClasses from '@remotelock/react-week-scheduler/styles';

function App() {
  const [schedule, setSchedule] = useState(schedule);

  return (
    <TimeGridScheduler
      classes={defaultStyleClasses}
      originDate={new Date('2019-03-04')}
      schedule={schedule}
      onChange={setSchedule}
    />
  );
}
```

## Customization

`react-week-scheduler` ships with a set of default styles for convenience. The styles are compiled as [CSS Modules](https://github.com/css-modules/css-modules) class names. The components exported from the package do not import the styles by default. Instead, they expect a `classes` prop to be passed.

You do not need to have your bundler configured for CSS Modules. The class names are generated at build time so they are available as a regular JS object.

### Using the default styles

To use the default styles, import the default classes object and pass it to the component:

```jsx
import { TimeGridScheduler } from '@remotelock/react-week-scheduler';
import defaultStyleClasses from '@remotelock/react-week-scheduler/styles';

function App() {
  return <TimeGridScheduler classes={defaultStyleClasses} {...otherProps} />;
}
```

## Browser Support

This library should work on any modern browser.

However, [a _global_ polyfill for `ResizeObserver`](https://www.npmjs.com/package/resize-observer-polyfill) is required since `ResizeObserver` is [currently only supported by Chrome 64+](https://caniuse.com/#feat=resizeobserver).

The following web platform features are used:

- Flexbox
- CSS `pointer-events`
- CSS `touch-action`
- Touch Events
- [CSS containement](https://developers.google.com/web/updates/2016/06/css-containment) (optional)

## Known Issues

- Resizing time blocks does not currently work on Firefox.
