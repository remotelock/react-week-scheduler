import React, { useRef } from 'react';
import { useClickAndDrag } from './useClickAndDrag';

export function Draggable({ children }: any) {
  const ref = useRef(null);
  const { box } = useClickAndDrag(ref);

  return (
    <div ref={ref} style={{ position: 'relative', top: box.height }}>
      {children}
    </div>
  );
}
