export const createPageMapCoordsToContainer = (container: HTMLElement) => {
  return (event: React.MouseEvent | MouseEvent | TouchEvent) => {
    let clientX: number;
    let clientY: number;
    let pageX: number;
    let pageY: number;

    if ('changedTouches' in event) {
      ({ clientX, clientY, pageX, pageY } = event.changedTouches[0]);
    } else {
      ({ clientX, clientY, pageX, pageY } = event);
    }
    const { top, left } = container.getBoundingClientRect();

    return {
      clientX,
      clientY,
      pageX,
      pageY,
      top,
      left,
      x: clientX - left,
      y: clientY - top,
    };
  };
};
