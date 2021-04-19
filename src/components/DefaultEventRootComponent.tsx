import React from 'react';
import { EventRootProps } from '../types';

export const DefaultEventRootComponent = React.forwardRef<any, EventRootProps>(
  function DefaultEventRootComponent(
    {
      isActive,
      handleDelete,
      cellIndex,
      rangeIndex,
      classes,
      disabled,
      ...props
    },
    ref,
  ) {
    return <div ref={ref} aria-disabled={disabled} {...props} />;
  },
);
